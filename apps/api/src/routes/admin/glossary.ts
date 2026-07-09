import { Hono } from "hono";
import { eq } from "drizzle-orm";
import { createDb } from "../../db/client";
import { glossaryEntries, problemGlossaryLinks } from "../../db/schema";
import type { AuthEnv } from "../../middleware/auth";

const router = new Hono<AuthEnv>();

type GlossaryBody = {
  id?: string;
  name?: string;
  short?: string | null;
  descriptionMd?: string;
  withoutLabel?: string | null;
  withoutCode?: string | null;
  withLabel?: string | null;
  withCode?: string | null;
  whenToUseMd?: string | null;
};

router.post("/", async (c) => {
  const body = await c.req.json<GlossaryBody>().catch(() => null);
  if (!body?.id || !body?.name || !body?.descriptionMd) {
    return c.json({ error: "id, name, and descriptionMd are required" }, 400);
  }

  const db = createDb(c.env.DB);
  const [existing] = await db.select().from(glossaryEntries).where(eq(glossaryEntries.id, body.id)).limit(1);
  if (existing) return c.json({ error: "id already exists" }, 409);

  const entry = {
    id: body.id,
    name: body.name,
    short: body.short ?? null,
    descriptionMd: body.descriptionMd,
    withoutLabel: body.withoutLabel ?? null,
    withoutCode: body.withoutCode ?? null,
    withLabel: body.withLabel ?? null,
    withCode: body.withCode ?? null,
    whenToUseMd: body.whenToUseMd ?? null,
  };
  await db.insert(glossaryEntries).values(entry);
  return c.json({ glossary: entry }, 201);
});

router.put("/:id", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json<GlossaryBody>().catch(() => null);
  if (!body) return c.json({ error: "invalid body" }, 400);

  const db = createDb(c.env.DB);
  const [existing] = await db.select().from(glossaryEntries).where(eq(glossaryEntries.id, id)).limit(1);
  if (!existing) return c.json({ error: "not found" }, 404);

  const { id: _id, ...rest } = body;
  await db.update(glossaryEntries).set(rest).where(eq(glossaryEntries.id, id));

  const [updated] = await db.select().from(glossaryEntries).where(eq(glossaryEntries.id, id)).limit(1);
  return c.json({ glossary: updated });
});

router.delete("/:id", async (c) => {
  const id = c.req.param("id");
  const db = createDb(c.env.DB);
  const [existing] = await db.select().from(glossaryEntries).where(eq(glossaryEntries.id, id)).limit(1);
  if (!existing) return c.json({ error: "not found" }, 404);

  await db.delete(problemGlossaryLinks).where(eq(problemGlossaryLinks.glossaryId, id));
  await db.delete(glossaryEntries).where(eq(glossaryEntries.id, id));
  return c.json({ ok: true });
});

export default router;
