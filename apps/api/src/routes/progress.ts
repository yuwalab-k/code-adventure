import { Hono } from "hono";
import { and, eq } from "drizzle-orm";
import { createDb } from "../db/client";
import { progress, checkpointQuestions, checkpointAnswers, problems, users, userItems } from "../db/schema";
import { requireAuth, type AuthEnv } from "../middleware/auth";
import { computeBossStatus } from "../lib/bossStatus";
import { grantRewards, SMALL_BOSS_XP_PER_DIFFICULTY, BIG_BOSS_XP_PER_DIFFICULTY, BIG_BOSS_COINS_PER_DIFFICULTY } from "../lib/rewards";

const SCREENS = ["s1", "s2", "s3", "s4", "s5", "s6", "s7"] as const;
type Screen = (typeof SCREENS)[number];
const STATUSES = ["not_started", "in_progress", "completed"] as const;
type Status = (typeof STATUSES)[number];

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

  // XP is only granted the first time this question flips to correct, so
  // re-answering an already-defeated small boss can't be farmed for XP.
  const isFirstCorrect = isCorrect && !(existing?.isCorrect ?? false);

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

  let reward: { xpGained: number; level: number; leveledUp: boolean } | null = null;
  if (isFirstCorrect) {
    const [problem] = await db.select().from(problems).where(eq(problems.id, question.problemId)).limit(1);
    const xpGained = SMALL_BOSS_XP_PER_DIFFICULTY * (problem?.difficulty ?? 1);
    const result = await grantRewards(db, user.id, { xp: xpGained });
    reward = { xpGained, level: result.level, leveledUp: result.leveledUp };
  }

  return c.json({
    correct: isCorrect,
    // Only reveal the hint/explanation on a wrong answer, not the correct choice itself.
    explanationMd: isCorrect ? null : question.explanationMd,
    reward,
  });
});

router.get("/problems/:id/boss-status", async (c) => {
  const problemId = c.req.param("id");
  const user = c.get("user");
  const db = createDb(c.env.DB);
  return c.json(await computeBossStatus(db, user.id, problemId));
});

// Defeating the big boss = clearing the problem: grants XP/coins (scaled by
// difficulty) and the problem's clear-reward item, if any. Idempotent — a
// second call after the problem is already cleared awards nothing extra.
router.post("/problems/:id/clear-big-boss", async (c) => {
  const problemId = c.req.param("id");
  const user = c.get("user");
  const db = createDb(c.env.DB);

  const [problem] = await db.select().from(problems).where(eq(problems.id, problemId)).limit(1);
  if (!problem) return c.json({ error: "not found" }, 404);

  const status = await computeBossStatus(db, user.id, problemId);
  if (!status.bigBoss.unlocked) return c.json({ error: "small bosses not defeated yet" }, 400);

  const now = new Date().toISOString();

  if (status.bigBoss.defeated) {
    const [current] = await db.select().from(users).where(eq(users.id, user.id)).limit(1);
    return c.json({
      cleared: true,
      alreadyCleared: true,
      xpGained: 0,
      coinsGained: 0,
      level: current!.level,
      leveledUp: false,
      itemGranted: false,
    });
  }

  const [existing] = await db
    .select()
    .from(progress)
    .where(and(eq(progress.userId, user.id), eq(progress.problemId, problemId), eq(progress.screen, "s7")))
    .limit(1);

  if (existing) {
    await db
      .update(progress)
      .set({ status: "completed", completedAt: now, updatedAt: now })
      .where(eq(progress.id, existing.id));
  } else {
    await db.insert(progress).values({
      id: crypto.randomUUID(),
      userId: user.id,
      problemId,
      screen: "s7",
      status: "completed",
      completedAt: now,
      updatedAt: now,
    });
  }

  const xpGained = BIG_BOSS_XP_PER_DIFFICULTY * problem.difficulty;
  const coinsGained = BIG_BOSS_COINS_PER_DIFFICULTY * problem.difficulty;
  const result = await grantRewards(db, user.id, { xp: xpGained, coins: coinsGained });

  let itemGranted = false;
  if (problem.clearRewardItemId) {
    const [ownedAlready] = await db
      .select()
      .from(userItems)
      .where(and(eq(userItems.userId, user.id), eq(userItems.itemId, problem.clearRewardItemId)))
      .limit(1);
    if (!ownedAlready) {
      await db.insert(userItems).values({
        id: crypto.randomUUID(),
        userId: user.id,
        itemId: problem.clearRewardItemId,
        source: "clear_reward",
        sourceProblemId: problemId,
        isEquipped: false,
        acquiredAt: now,
      });
      itemGranted = true;
    }
  }

  return c.json({
    cleared: true,
    alreadyCleared: false,
    xpGained,
    coinsGained,
    level: result.level,
    leveledUp: result.leveledUp,
    itemGranted,
  });
});

export default router;
