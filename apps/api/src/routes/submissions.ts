import { Hono } from "hono";
import { and, desc, eq } from "drizzle-orm";
import { createDb } from "../db/client";
import { problems, samples, solutions, submissions } from "../db/schema";
import { requireAuth, type AuthEnv } from "../middleware/auth";
import { grantRewards, CLEAR_XP_PER_DIFFICULTY, CLEAR_COINS_PER_DIFFICULTY } from "../lib/rewards";
import { computeProblemStatus } from "../lib/problemStatus";

const router = new Hono<AuthEnv>();
router.use("*", requireAuth);

interface SampleResult {
  sampleId: string;
  actualOutput: string;
  errored: boolean;
}

// The client ran the code (Pyodide, in-browser) and reports what happened —
// the server can't re-execute it, but it never trusts a client-sent verdict
// directly: it independently diffs the reported output against the sample
// outputs it actually stored, so an ordinary client bug/stale cache can't
// silently mark a wrong answer as correct.
router.post("/problems/:id/submit", async (c) => {
  const problemId = c.req.param("id");
  const user = c.get("user");
  const db = createDb(c.env.DB);

  const [problem] = await db.select().from(problems).where(eq(problems.id, problemId)).limit(1);
  if (!problem || !problem.isPublished) return c.json({ error: "not found" }, 404);

  const body = await c.req
    .json<{ code?: string; language?: "python"; results?: SampleResult[] }>()
    .catch(() => null);
  if (!body?.code || !body?.results) {
    return c.json({ error: "code and results are required" }, 400);
  }

  const problemSamples = await db.select().from(samples).where(eq(samples.problemId, problemId));
  if (problemSamples.length === 0) return c.json({ error: "problem has no samples to judge against" }, 400);

  const resultBySample = new Map(body.results.map((r) => [r.sampleId, r]));
  const missing = problemSamples.some((s) => !resultBySample.has(s.id));
  if (missing) return c.json({ error: "results must cover every sample" }, 400);

  const anyError = problemSamples.some((s) => resultBySample.get(s.id)!.errored);
  const anyMismatch = problemSamples.some(
    (s) => resultBySample.get(s.id)!.actualOutput.trim() !== s.output.trim(),
  );
  const verdict = anyError ? "RE" : anyMismatch ? "WA" : "AC";

  const statusBefore = await computeProblemStatus(db, user.id, problemId);
  const now = new Date().toISOString();

  await db.insert(submissions).values({
    id: crypto.randomUUID(),
    userId: user.id,
    problemId,
    language: "python",
    code: body.code,
    verdict,
    sampleResultsJson: JSON.stringify(body.results),
    submittedAt: now,
  });

  if (verdict !== "AC" || statusBefore === "cleared") {
    return c.json({
      verdict,
      xpGained: 0,
      coinsGained: 0,
      rating: user.rating,
      ratingUp: false,
      alreadyCleared: statusBefore === "cleared",
    });
  }

  const xpGained = CLEAR_XP_PER_DIFFICULTY * problem.difficulty;
  const coinsGained = CLEAR_COINS_PER_DIFFICULTY * problem.difficulty;
  const result = await grantRewards(db, user.id, { xp: xpGained, coins: coinsGained });

  return c.json({
    verdict,
    xpGained,
    coinsGained,
    rating: result.rating,
    ratingUp: result.ratingUp,
    alreadyCleared: false,
  });
});

router.get("/problems/:id/submissions", async (c) => {
  const problemId = c.req.param("id");
  const user = c.get("user");
  const db = createDb(c.env.DB);

  const rows = await db
    .select()
    .from(submissions)
    .where(and(eq(submissions.userId, user.id), eq(submissions.problemId, problemId)))
    .orderBy(desc(submissions.submittedAt));

  return c.json({ submissions: rows });
});

router.get("/problems/:id/editorial", async (c) => {
  const problemId = c.req.param("id");
  const user = c.get("user");
  const db = createDb(c.env.DB);

  const status = await computeProblemStatus(db, user.id, problemId);
  if (status !== "cleared") return c.json({ error: "clear the problem to unlock the editorial" }, 403);

  const rows = await db.select().from(solutions).where(eq(solutions.problemId, problemId));
  return c.json({ solutions: rows });
});

export default router;
