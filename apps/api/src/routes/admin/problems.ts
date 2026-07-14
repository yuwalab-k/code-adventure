import { Hono } from "hono";
import { eq } from "drizzle-orm";
import { createDb } from "../../db/client";
import { problems, problemTags, tags } from "../../db/schema";
import type { AuthEnv } from "../../middleware/auth";
import children from "./problemChildren";

const router = new Hono<AuthEnv>();

const NPC_MOTIFS = ["student", "engineer", "robot", "book", "computer"] as const;
type NpcMotif = (typeof NPC_MOTIFS)[number];

type ProblemBody = {
  id?: string;
  contest?: string;
  problemNumber?: string;
  title?: string;
  atcoderUrl?: string;
  difficulty?: number;
  areaId?: string;
  npcMotif?: NpcMotif;
  statementMd?: string;
  constraintsMd?: string;
  constraintsNoteMd?: string | null;
  statementNoteMd?: string | null;
  mapX?: number | null;
  mapY?: number | null;
  mapOrder?: number | null;
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
    !body?.areaId ||
    !body?.statementMd ||
    !body?.constraintsMd
  ) {
    return c.json(
      {
        error:
          "id, contest, problemNumber, title, atcoderUrl, difficulty, areaId, statementMd, constraintsMd are required",
      },
      400,
    );
  }
  if (body.npcMotif && !NPC_MOTIFS.includes(body.npcMotif)) {
    return c.json({ error: `invalid npcMotif, expected one of ${NPC_MOTIFS.join(", ")}` }, 400);
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
    areaId: body.areaId,
    npcMotif: body.npcMotif ?? "student",
    statementMd: body.statementMd,
    constraintsMd: body.constraintsMd,
    constraintsNoteMd: body.constraintsNoteMd ?? null,
    statementNoteMd: body.statementNoteMd ?? null,
    mapX: body.mapX ?? null,
    mapY: body.mapY ?? null,
    mapOrder: body.mapOrder ?? null,
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
  if (body.npcMotif && !NPC_MOTIFS.includes(body.npcMotif)) {
    return c.json({ error: `invalid npcMotif, expected one of ${NPC_MOTIFS.join(", ")}` }, 400);
  }

  const db = createDb(c.env.DB);
  const [existing] = await db.select().from(problems).where(eq(problems.id, id)).limit(1);
  if (!existing) return c.json({ error: "not found" }, 404);

  const { id: _id, ...rest } = body;
  const update: Partial<typeof problems.$inferInsert> = { ...rest, updatedAt: new Date().toISOString() };

  await db.update(problems).set(update).where(eq(problems.id, id));
  const [updated] = await db.select().from(problems).where(eq(problems.id, id)).limit(1);
  return c.json({ problem: updated });
});

// The default "delete" a problem: unpublish it. Hard-deleting would CASCADE
// away every student's submission history for the problem, so that's a
// separate, explicit operation below.
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
      { error: "hard delete removes all student submissions for this problem; pass ?confirm=true to proceed" },
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

router.route("/:problemId", children);

export default router;
