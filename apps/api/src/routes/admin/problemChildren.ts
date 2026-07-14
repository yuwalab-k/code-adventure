import { Hono } from "hono";
import { and, eq } from "drizzle-orm";
import { createDb } from "../../db/client";
import { samples, solutions } from "../../db/schema";
import type { AuthEnv } from "../../middleware/auth";

const router = new Hono<AuthEnv>();

const LANGUAGES = ["python", "cpp", "typescript", "ruby", "php", "rust", "perl"] as const;
type Language = (typeof LANGUAGES)[number];

// --- samples — these double as the Pyodide judge's public test cases ---

router.get("/samples", async (c) => {
  const problemId = c.req.param("problemId");
  const db = createDb(c.env.DB);
  const rows = await db.select().from(samples).where(eq(samples.problemId, problemId));
  return c.json({ samples: rows });
});

router.post("/samples", async (c) => {
  const problemId = c.req.param("problemId");
  const body = await c.req
    .json<{ position?: number; input?: string; output?: string; explanationMd?: string | null }>()
    .catch(() => null);
  if (!body?.input || !body?.output) return c.json({ error: "input and output are required" }, 400);

  const db = createDb(c.env.DB);
  const existingCount = (await db.select().from(samples).where(eq(samples.problemId, problemId))).length;

  const row = {
    id: crypto.randomUUID(),
    problemId,
    position: body.position ?? existingCount + 1,
    input: body.input,
    output: body.output,
    explanationMd: body.explanationMd ?? null,
  };
  await db.insert(samples).values(row);
  return c.json({ sample: row }, 201);
});

router.put("/samples/:sampleId", async (c) => {
  const sampleId = c.req.param("sampleId");
  const body = await c.req
    .json<{ position?: number; input?: string; output?: string; explanationMd?: string | null }>()
    .catch(() => null);
  if (!body) return c.json({ error: "invalid body" }, 400);

  const db = createDb(c.env.DB);
  const [existing] = await db.select().from(samples).where(eq(samples.id, sampleId)).limit(1);
  if (!existing) return c.json({ error: "not found" }, 404);

  await db.update(samples).set(body).where(eq(samples.id, sampleId));
  const [updated] = await db.select().from(samples).where(eq(samples.id, sampleId)).limit(1);
  return c.json({ sample: updated });
});

router.delete("/samples/:sampleId", async (c) => {
  const sampleId = c.req.param("sampleId");
  const db = createDb(c.env.DB);
  await db.delete(samples).where(eq(samples.id, sampleId));
  return c.json({ ok: true });
});

// --- solutions (keyed by language, unique per problem) — revealed as the editorial after AC ---

router.get("/solutions", async (c) => {
  const problemId = c.req.param("problemId");
  const db = createDb(c.env.DB);
  const rows = await db.select().from(solutions).where(eq(solutions.problemId, problemId));
  return c.json({ solutions: rows });
});

router.put("/solutions/:language", async (c) => {
  const problemId = c.req.param("problemId");
  const language = c.req.param("language") as Language;
  if (!LANGUAGES.includes(language)) return c.json({ error: "invalid language" }, 400);

  const body = await c.req.json<{ code?: string; steps?: string[] | null }>().catch(() => null);
  if (!body?.code) return c.json({ error: "code is required" }, 400);

  const db = createDb(c.env.DB);
  const [existing] = await db
    .select()
    .from(solutions)
    .where(and(eq(solutions.problemId, problemId), eq(solutions.language, language)))
    .limit(1);

  const stepsJson = body.steps ? JSON.stringify(body.steps) : null;

  if (existing) {
    await db.update(solutions).set({ code: body.code, stepsJson }).where(eq(solutions.id, existing.id));
  } else {
    await db.insert(solutions).values({
      id: crypto.randomUUID(),
      problemId,
      language,
      code: body.code,
      stepsJson,
    });
  }
  return c.json({ ok: true });
});

router.delete("/solutions/:language", async (c) => {
  const problemId = c.req.param("problemId");
  const language = c.req.param("language") as Language;
  const db = createDb(c.env.DB);
  await db.delete(solutions).where(and(eq(solutions.problemId, problemId), eq(solutions.language, language)));
  return c.json({ ok: true });
});

export default router;
