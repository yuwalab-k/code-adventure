import { Hono } from "hono";
import { eq } from "drizzle-orm";
import { createDb } from "../db/client";
import { problems, problemTags, tags, samples } from "../db/schema";
import { requireAuth, type AuthEnv } from "../middleware/auth";
import { computeStatusMap } from "../lib/problemStatus";

const content = new Hono<AuthEnv>();

content.use("*", requireAuth);

content.get("/problems", async (c) => {
  const user = c.get("user");
  const db = createDb(c.env.DB);
  const areaId = c.req.query("areaId");

  const rows = areaId
    ? await db.select().from(problems).where(eq(problems.areaId, areaId))
    : await db.select().from(problems);
  const published = rows.filter((p) => p.isPublished);

  const statusMap = await computeStatusMap(
    db,
    user.id,
    published.map((p) => p.id),
  );

  return c.json({
    problems: published.map((p) => ({ ...p, status: statusMap[p.id] ?? "not_started" })),
  });
});

content.get("/problems/:id", async (c) => {
  const id = c.req.param("id");
  const db = createDb(c.env.DB);

  const [problem] = await db.select().from(problems).where(eq(problems.id, id)).limit(1);
  if (!problem || !problem.isPublished) return c.json({ error: "not found" }, 404);

  const [problemSamples, problemTagRows] = await Promise.all([
    db.select().from(samples).where(eq(samples.problemId, id)),
    db
      .select({ tag: tags })
      .from(problemTags)
      .innerJoin(tags, eq(problemTags.tagId, tags.id))
      .where(eq(problemTags.problemId, id)),
  ]);

  // solutions are deliberately not included here — they're only revealed
  // via GET /problems/:id/editorial, after the player has an AC submission.
  return c.json({
    problem,
    samples: problemSamples,
    tags: problemTagRows.map((r) => r.tag),
  });
});

export default content;
