import { Hono } from "hono";
import { and, eq } from "drizzle-orm";
import { createDb } from "../db/client";
import { progress, checkpointQuestions, checkpointAnswers } from "../db/schema";
import { requireAuth, type AuthEnv } from "../middleware/auth";

const SCREENS = ["s1", "s2", "s3", "s4", "s5", "s6", "s7"] as const;
type Screen = (typeof SCREENS)[number];
const STATUSES = ["not_started", "in_progress", "completed"] as const;
type Status = (typeof STATUSES)[number];
const CHECKPOINT_SCREENS = ["s2", "s4", "s6"] as const;

const router = new Hono<AuthEnv>();
router.use("*", requireAuth);

router.get("/progress/:problemId", async (c) => {
  const problemId = c.req.param("problemId");
  const user = c.get("user");
  const db = createDb(c.env.DB);

  const rows = await db
    .select()
    .from(progress)
    .where(and(eq(progress.userId, user.id), eq(progress.problemId, problemId)));

  return c.json({ progress: rows });
});

router.put("/progress/:problemId/:screen", async (c) => {
  const problemId = c.req.param("problemId");
  const screen = c.req.param("screen") as Screen;
  if (!SCREENS.includes(screen)) return c.json({ error: "invalid screen" }, 400);

  const body = await c.req.json<{ status?: Status }>().catch(() => null);
  if (!body?.status || !STATUSES.includes(body.status)) {
    return c.json({ error: "invalid status" }, 400);
  }

  const user = c.get("user");
  const db = createDb(c.env.DB);
  const now = new Date().toISOString();

  const [existing] = await db
    .select()
    .from(progress)
    .where(and(eq(progress.userId, user.id), eq(progress.problemId, problemId), eq(progress.screen, screen)))
    .limit(1);

  if (existing) {
    await db
      .update(progress)
      .set({
        status: body.status,
        completedAt: body.status === "completed" ? now : existing.completedAt,
        updatedAt: now,
      })
      .where(eq(progress.id, existing.id));
  } else {
    await db.insert(progress).values({
      id: crypto.randomUUID(),
      userId: user.id,
      problemId,
      screen,
      status: body.status,
      completedAt: body.status === "completed" ? now : null,
      updatedAt: now,
    });
  }

  return c.json({ ok: true });
});

router.post("/checkpoints/:questionId/answer", async (c) => {
  const questionId = c.req.param("questionId");
  const body = await c.req.json<{ choiceId?: number }>().catch(() => null);
  if (body?.choiceId === undefined) return c.json({ error: "choiceId is required" }, 400);

  const user = c.get("user");
  const db = createDb(c.env.DB);

  const [question] = await db
    .select()
    .from(checkpointQuestions)
    .where(eq(checkpointQuestions.id, questionId))
    .limit(1);
  if (!question) return c.json({ error: "not found" }, 404);

  // Correctness is decided here, server-side, against the stored answer key —
  // the client only ever sees shuffled choice ids, never the correct index.
  const isCorrect = body.choiceId === question.correctChoiceIndex;
  const now = new Date().toISOString();

  const [existing] = await db
    .select()
    .from(checkpointAnswers)
    .where(and(eq(checkpointAnswers.userId, user.id), eq(checkpointAnswers.checkpointQuestionId, questionId)))
    .limit(1);

  if (existing) {
    await db
      .update(checkpointAnswers)
      .set({ isCorrect, attemptCount: existing.attemptCount + 1, answeredAt: now })
      .where(eq(checkpointAnswers.id, existing.id));
  } else {
    await db.insert(checkpointAnswers).values({
      id: crypto.randomUUID(),
      userId: user.id,
      checkpointQuestionId: questionId,
      isCorrect,
      attemptCount: 1,
      answeredAt: now,
    });
  }

  return c.json({
    correct: isCorrect,
    // Only reveal the hint/explanation on a wrong answer, not the correct choice itself.
    explanationMd: isCorrect ? null : question.explanationMd,
  });
});

router.get("/problems/:id/boss-status", async (c) => {
  const problemId = c.req.param("id");
  const user = c.get("user");
  const db = createDb(c.env.DB);

  const [questions, answers, s7Progress] = await Promise.all([
    db.select().from(checkpointQuestions).where(eq(checkpointQuestions.problemId, problemId)),
    db
      .select({ answer: checkpointAnswers, question: checkpointQuestions })
      .from(checkpointAnswers)
      .innerJoin(checkpointQuestions, eq(checkpointAnswers.checkpointQuestionId, checkpointQuestions.id))
      .where(and(eq(checkpointAnswers.userId, user.id), eq(checkpointQuestions.problemId, problemId))),
    db
      .select()
      .from(progress)
      .where(and(eq(progress.userId, user.id), eq(progress.problemId, problemId), eq(progress.screen, "s7")))
      .limit(1),
  ]);

  const smallBosses = Object.fromEntries(
    CHECKPOINT_SCREENS.map((screen) => {
      const screenQuestions = questions.filter((q) => q.screen === screen);
      const defeated =
        screenQuestions.length > 0 &&
        screenQuestions.every((q) => answers.some((a) => a.question.id === q.id && a.answer.isCorrect));
      return [screen, { defeated, totalQuestions: screenQuestions.length }];
    }),
  );

  const allSmallBossesDefeated = CHECKPOINT_SCREENS.every((s) => smallBosses[s].defeated);
  const bigBossDefeated = s7Progress[0]?.status === "completed";

  return c.json({
    smallBosses,
    bigBoss: { defeated: bigBossDefeated, unlocked: allSmallBossesDefeated },
    cleared: allSmallBossesDefeated && bigBossDefeated,
  });
});

export default router;
