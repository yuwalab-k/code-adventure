import { Hono } from "hono";
import { eq } from "drizzle-orm";
import { createDb } from "../../db/client";
import { problems, problemTags, tags, problemGlossaryLinks, glossaryEntries } from "../../db/schema";
import type { AuthEnv } from "../../middleware/auth";
import children from "./problemChildren";

const router = new Hono<AuthEnv>();

// The only place required_level is computed — admins set difficulty (the
// AtCoder ★ scale) and this derives the level gate, per SPEC.md 4.2/DB_DESIGN.md.
function requiredLevelFromDifficulty(difficulty: number): number {
  return (difficulty - 1) * 2 + 1;
}

type ProblemBody = {
  id?: string;
  contest?: string;
  problemNumber?: string;
  title?: string;
  atcoderUrl?: string;
  difficulty?: number;
  statementMd?: string;
  constraintsMd?: string;
  constraintsNoteMd?: string | null;
  statementNoteMd?: string | null;
  mapX?: number | null;
  mapY?: number | null;
  mapOrder?: number | null;
  clearRewardItemId?: string | null;
  addedAt?: string;
};

router.post("/", async (c) => {
  const body = await c.req.json<ProblemBody>().catch(() => null);
  if (
    !body?.id ||
    !body?.contest ||
    !body?.problemNumber ||
    !body?.title ||
    !body?.atcoderUrl ||
    body?.difficulty === undefined ||
    !body?.statementMd ||
    !body?.constraintsMd
  ) {
    return c.json(
      { error: "id, contest, problemNumber, title, atcoderUrl, difficulty, statementMd, constraintsMd are required" },
      400,
    );
  }

  const db = createDb(c.env.DB);
  const [existing] = await db.select().from(problems).where(eq(problems.id, body.id)).limit(1);
  if (existing) return c.json({ error: "id already exists" }, 409);

  const now = new Date().toISOString();
  const problem = {
    id: body.id,
    contest: body.contest,
    problemNumber: body.problemNumber,
    title: body.title,
    atcoderUrl: body.atcoderUrl,
    difficulty: body.difficulty,
    requiredLevel: requiredLevelFromDifficulty(body.difficulty),
    statementMd: body.statementMd,
    constraintsMd: body.constraintsMd,
    constraintsNoteMd: body.constraintsNoteMd ?? null,
    statementNoteMd: body.statementNoteMd ?? null,
    mapX: body.mapX ?? null,
    mapY: body.mapY ?? null,
    mapOrder: body.mapOrder ?? null,
    clearRewardItemId: body.clearRewardItemId ?? null,
    isPublished: false,
    addedAt: body.addedAt ?? now,
    createdAt: now,
    updatedAt: now,
  };
  await db.insert(problems).values(problem);
  return c.json({ problem }, 201);
});

router.put("/:id", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json<ProblemBody>().catch(() => null);
  if (!body) return c.json({ error: "invalid body" }, 400);

  const db = createDb(c.env.DB);
  const [existing] = await db.select().from(problems).where(eq(problems.id, id)).limit(1);
  if (!existing) return c.json({ error: "not found" }, 404);

  const { id: _id, ...rest } = body;
  const update: Partial<typeof problems.$inferInsert> = { ...rest, updatedAt: new Date().toISOString() };
  if (body.difficulty !== undefined) {
    update.requiredLevel = requiredLevelFromDifficulty(body.difficulty);
  }

  await db.update(problems).set(update).where(eq(problems.id, id));
  const [updated] = await db.select().from(problems).where(eq(problems.id, id)).limit(1);
  return c.json({ problem: updated });
});

// The default "delete" a problem: unpublish it. Hard-deleting would CASCADE
// away every student's progress/checkpoint history for the problem, so that's
// a separate, explicit operation below (see SPEC.md 4.6 / DB_DESIGN.md).
router.put("/:id/publish", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json<{ isPublished?: boolean }>().catch(() => null);
  if (body?.isPublished === undefined) return c.json({ error: "isPublished (boolean) is required" }, 400);

  const db = createDb(c.env.DB);
  const [existing] = await db.select().from(problems).where(eq(problems.id, id)).limit(1);
  if (!existing) return c.json({ error: "not found" }, 404);

  await db
    .update(problems)
    .set({ isPublished: body.isPublished, updatedAt: new Date().toISOString() })
    .where(eq(problems.id, id));
  return c.json({ ok: true });
});

router.delete("/:id", async (c) => {
  const id = c.req.param("id");
  const confirm = c.req.query("confirm");
  if (confirm !== "true") {
    return c.json(
      { error: "hard delete removes all student progress for this problem; pass ?confirm=true to proceed" },
      400,
    );
  }

  const db = createDb(c.env.DB);
  const [existing] = await db.select().from(problems).where(eq(problems.id, id)).limit(1);
  if (!existing) return c.json({ error: "not found" }, 404);

  await db.delete(problems).where(eq(problems.id, id));
  return c.json({ ok: true });
});

router.put("/:id/tags", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json<{ tags?: string[] }>().catch(() => null);
  if (!body?.tags) return c.json({ error: "tags (string[]) is required" }, 400);

  const db = createDb(c.env.DB);
  const [existing] = await db.select().from(problems).where(eq(problems.id, id)).limit(1);
  if (!existing) return c.json({ error: "not found" }, 404);

  for (const tagName of body.tags) {
    const [existingTag] = await db.select().from(tags).where(eq(tags.id, tagName)).limit(1);
    if (!existingTag) {
      await db.insert(tags).values({ id: tagName, name: tagName });
    }
  }

  await db.delete(problemTags).where(eq(problemTags.problemId, id));
  for (const tagName of body.tags) {
    await db.insert(problemTags).values({ problemId: id, tagId: tagName });
  }

  return c.json({ ok: true, tags: body.tags });
});

router.put("/:id/glossary-links", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json<{ glossaryIds?: string[] }>().catch(() => null);
  if (!body?.glossaryIds) return c.json({ error: "glossaryIds (string[]) is required" }, 400);

  const db = createDb(c.env.DB);
  const [existing] = await db.select().from(problems).where(eq(problems.id, id)).limit(1);
  if (!existing) return c.json({ error: "not found" }, 404);

  for (const glossaryId of body.glossaryIds) {
    const [entry] = await db.select().from(glossaryEntries).where(eq(glossaryEntries.id, glossaryId)).limit(1);
    if (!entry) return c.json({ error: `glossary entry not found: ${glossaryId}` }, 400);
  }

  await db.delete(problemGlossaryLinks).where(eq(problemGlossaryLinks.problemId, id));
  for (const glossaryId of body.glossaryIds) {
    await db.insert(problemGlossaryLinks).values({ problemId: id, glossaryId });
  }

  return c.json({ ok: true, glossaryIds: body.glossaryIds });
});

router.route("/:problemId", children);

export default router;
