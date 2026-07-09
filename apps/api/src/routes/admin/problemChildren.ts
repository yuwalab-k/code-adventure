import { Hono } from "hono";
import { and, eq } from "drizzle-orm";
import { createDb } from "../../db/client";
import { samples, solutions, badSolutions, explanationCards, checkpointQuestions } from "../../db/schema";
import type { AuthEnv } from "../../middleware/auth";

const router = new Hono<AuthEnv>();

const LANGUAGES = ["python", "cpp", "typescript", "ruby", "php", "rust", "perl"] as const;
type Language = (typeof LANGUAGES)[number];
const SCREENS = ["s2", "s4", "s6"] as const;
type CheckpointScreen = (typeof SCREENS)[number];

// --- samples ---

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

// --- solutions (keyed by language, unique per problem) ---

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

// --- bad_solutions (keyed by language, unique per problem) ---

router.get("/bad-solutions", async (c) => {
  const problemId = c.req.param("problemId");
  const db = createDb(c.env.DB);
  const rows = await db.select().from(badSolutions).where(eq(badSolutions.problemId, problemId));
  return c.json({ badSolutions: rows });
});

router.put("/bad-solutions/:language", async (c) => {
  const problemId = c.req.param("problemId");
  const language = c.req.param("language") as Language;
  if (!LANGUAGES.includes(language)) return c.json({ error: "invalid language" }, 400);

  const body = await c.req.json<{ label?: string; code?: string }>().catch(() => null);
  if (!body?.label || !body?.code) return c.json({ error: "label and code are required" }, 400);

  const db = createDb(c.env.DB);
  const [existing] = await db
    .select()
    .from(badSolutions)
    .where(and(eq(badSolutions.problemId, problemId), eq(badSolutions.language, language)))
    .limit(1);

  if (existing) {
    await db
      .update(badSolutions)
      .set({ label: body.label, code: body.code })
      .where(eq(badSolutions.id, existing.id));
  } else {
    await db.insert(badSolutions).values({
      id: crypto.randomUUID(),
      problemId,
      language,
      label: body.label,
      code: body.code,
    });
  }
  return c.json({ ok: true });
});

router.delete("/bad-solutions/:language", async (c) => {
  const problemId = c.req.param("problemId");
  const language = c.req.param("language") as Language;
  const db = createDb(c.env.DB);
  await db.delete(badSolutions).where(and(eq(badSolutions.problemId, problemId), eq(badSolutions.language, language)));
  return c.json({ ok: true });
});

// --- explanation_cards (S2/S4/S6 carousel content) ---

router.get("/explanation-cards", async (c) => {
  const problemId = c.req.param("problemId");
  const db = createDb(c.env.DB);
  const rows = await db.select().from(explanationCards).where(eq(explanationCards.problemId, problemId));
  return c.json({ explanationCards: rows });
});

router.post("/explanation-cards", async (c) => {
  const problemId = c.req.param("problemId");
  const body = await c.req
    .json<{
      screen?: CheckpointScreen;
      position?: number;
      title?: string | null;
      bodyMd?: string;
      variant?: string | null;
    }>()
    .catch(() => null);
  if (!body?.screen || !SCREENS.includes(body.screen) || !body?.bodyMd) {
    return c.json({ error: "screen (s2|s4|s6) and bodyMd are required" }, 400);
  }

  const db = createDb(c.env.DB);
  const existingCount = (
    await db
      .select()
      .from(explanationCards)
      .where(and(eq(explanationCards.problemId, problemId), eq(explanationCards.screen, body.screen)))
  ).length;

  const row = {
    id: crypto.randomUUID(),
    problemId,
    screen: body.screen,
    position: body.position ?? existingCount + 1,
    title: body.title ?? null,
    bodyMd: body.bodyMd,
    variant: body.variant ?? null,
  };
  await db.insert(explanationCards).values(row);
  return c.json({ explanationCard: row }, 201);
});

router.put("/explanation-cards/:cardId", async (c) => {
  const cardId = c.req.param("cardId");
  const body = await c.req
    .json<{ position?: number; title?: string | null; bodyMd?: string; variant?: string | null }>()
    .catch(() => null);
  if (!body) return c.json({ error: "invalid body" }, 400);

  const db = createDb(c.env.DB);
  const [existing] = await db.select().from(explanationCards).where(eq(explanationCards.id, cardId)).limit(1);
  if (!existing) return c.json({ error: "not found" }, 404);

  await db.update(explanationCards).set(body).where(eq(explanationCards.id, cardId));
  const [updated] = await db.select().from(explanationCards).where(eq(explanationCards.id, cardId)).limit(1);
  return c.json({ explanationCard: updated });
});

router.delete("/explanation-cards/:cardId", async (c) => {
  const cardId = c.req.param("cardId");
  const db = createDb(c.env.DB);
  await db.delete(explanationCards).where(eq(explanationCards.id, cardId));
  return c.json({ ok: true });
});

// --- checkpoint_questions (small-boss quizzes; admin view includes the answer key) ---

router.get("/checkpoint-questions", async (c) => {
  const problemId = c.req.param("problemId");
  const db = createDb(c.env.DB);
  const rows = await db.select().from(checkpointQuestions).where(eq(checkpointQuestions.problemId, problemId));
  return c.json({
    checkpointQuestions: rows.map((r) => ({ ...r, choices: JSON.parse(r.choicesJson) })),
  });
});

router.post("/checkpoint-questions", async (c) => {
  const problemId = c.req.param("problemId");
  const body = await c.req
    .json<{
      screen?: CheckpointScreen;
      position?: number;
      questionMd?: string;
      choices?: string[];
      correctChoiceIndex?: number;
      explanationMd?: string | null;
    }>()
    .catch(() => null);
  if (
    !body?.screen ||
    !SCREENS.includes(body.screen) ||
    !body?.questionMd ||
    !body?.choices?.length ||
    body?.correctChoiceIndex === undefined ||
    body.correctChoiceIndex < 0 ||
    body.correctChoiceIndex >= body.choices.length
  ) {
    return c.json(
      { error: "screen (s2|s4|s6), questionMd, choices (non-empty), and a valid correctChoiceIndex are required" },
      400,
    );
  }

  const db = createDb(c.env.DB);
  const existingCount = (
    await db
      .select()
      .from(checkpointQuestions)
      .where(and(eq(checkpointQuestions.problemId, problemId), eq(checkpointQuestions.screen, body.screen)))
  ).length;

  const row = {
    id: crypto.randomUUID(),
    problemId,
    screen: body.screen,
    position: body.position ?? existingCount + 1,
    questionMd: body.questionMd,
    choicesJson: JSON.stringify(body.choices),
    correctChoiceIndex: body.correctChoiceIndex,
    explanationMd: body.explanationMd ?? null,
  };
  await db.insert(checkpointQuestions).values(row);
  return c.json({ checkpointQuestion: { ...row, choices: body.choices } }, 201);
});

router.put("/checkpoint-questions/:questionId", async (c) => {
  const questionId = c.req.param("questionId");
  const body = await c.req
    .json<{
      position?: number;
      questionMd?: string;
      choices?: string[];
      correctChoiceIndex?: number;
      explanationMd?: string | null;
    }>()
    .catch(() => null);
  if (!body) return c.json({ error: "invalid body" }, 400);

  const db = createDb(c.env.DB);
  const [existing] = await db
    .select()
    .from(checkpointQuestions)
    .where(eq(checkpointQuestions.id, questionId))
    .limit(1);
  if (!existing) return c.json({ error: "not found" }, 404);

  const choices = body.choices ?? JSON.parse(existing.choicesJson);
  const correctChoiceIndex = body.correctChoiceIndex ?? existing.correctChoiceIndex;
  if (correctChoiceIndex < 0 || correctChoiceIndex >= choices.length) {
    return c.json({ error: "correctChoiceIndex out of range for choices" }, 400);
  }

  await db
    .update(checkpointQuestions)
    .set({
      position: body.position ?? existing.position,
      questionMd: body.questionMd ?? existing.questionMd,
      choicesJson: JSON.stringify(choices),
      correctChoiceIndex,
      explanationMd: body.explanationMd !== undefined ? body.explanationMd : existing.explanationMd,
    })
    .where(eq(checkpointQuestions.id, questionId));

  return c.json({ ok: true });
});

router.delete("/checkpoint-questions/:questionId", async (c) => {
  const questionId = c.req.param("questionId");
  const db = createDb(c.env.DB);
  await db.delete(checkpointQuestions).where(eq(checkpointQuestions.id, questionId));
  return c.json({ ok: true });
});

export default router;
