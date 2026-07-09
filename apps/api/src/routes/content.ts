import { Hono } from "hono";
import { eq } from "drizzle-orm";
import { createDb } from "../db/client";
import {
  problems,
  problemTags,
  tags,
  samples,
  solutions,
  badSolutions,
  explanationCards,
  checkpointQuestions,
  problemGlossaryLinks,
  glossaryEntries,
  codeReadingEntries,
} from "../db/schema";
import { requireAuth, type AuthEnv } from "../middleware/auth";

const content = new Hono<AuthEnv>();

content.use("*", requireAuth);

content.get("/problems", async (c) => {
  const db = createDb(c.env.DB);
  const rows = await db.select().from(problems).where(eq(problems.isPublished, true));
  return c.json({ problems: rows });
});

content.get("/problems/:id", async (c) => {
  const id = c.req.param("id");
  const db = createDb(c.env.DB);

  const [problem] = await db.select().from(problems).where(eq(problems.id, id)).limit(1);
  if (!problem || !problem.isPublished) return c.json({ error: "not found" }, 404);

  const [problemSamples, problemSolutions, problemBadSolutions, cards, questions, glossaryLinks, problemTagRows] =
    await Promise.all([
      db.select().from(samples).where(eq(samples.problemId, id)),
      db.select().from(solutions).where(eq(solutions.problemId, id)),
      db.select().from(badSolutions).where(eq(badSolutions.problemId, id)),
      db.select().from(explanationCards).where(eq(explanationCards.problemId, id)),
      // Never send correct_choice_index to the client; checkpoint answers are graded server-side.
      db
        .select({
          id: checkpointQuestions.id,
          screen: checkpointQuestions.screen,
          position: checkpointQuestions.position,
          questionMd: checkpointQuestions.questionMd,
          choicesJson: checkpointQuestions.choicesJson,
        })
        .from(checkpointQuestions)
        .where(eq(checkpointQuestions.problemId, id)),
      db
        .select({ glossary: glossaryEntries })
        .from(problemGlossaryLinks)
        .innerJoin(glossaryEntries, eq(problemGlossaryLinks.glossaryId, glossaryEntries.id))
        .where(eq(problemGlossaryLinks.problemId, id)),
      db
        .select({ tag: tags })
        .from(problemTags)
        .innerJoin(tags, eq(problemTags.tagId, tags.id))
        .where(eq(problemTags.problemId, id)),
    ]);

  return c.json({
    problem,
    samples: problemSamples,
    solutions: problemSolutions,
    badSolutions: problemBadSolutions,
    explanationCards: cards,
    checkpointQuestions: questions,
    glossary: glossaryLinks.map((r) => r.glossary),
    tags: problemTagRows.map((r) => r.tag),
  });
});

content.get("/glossary", async (c) => {
  const db = createDb(c.env.DB);
  const rows = await db.select().from(glossaryEntries);
  return c.json({ glossary: rows });
});

content.get("/glossary/:id", async (c) => {
  const id = c.req.param("id");
  const db = createDb(c.env.DB);
  const [entry] = await db.select().from(glossaryEntries).where(eq(glossaryEntries.id, id)).limit(1);
  if (!entry) return c.json({ error: "not found" }, 404);
  return c.json({ glossary: entry });
});

content.get("/code-reading", async (c) => {
  const db = createDb(c.env.DB);
  const rows = await db.select().from(codeReadingEntries);
  return c.json({ codeReading: rows });
});

export default content;
