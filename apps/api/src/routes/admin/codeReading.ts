import { Hono } from "hono";
import { eq } from "drizzle-orm";
import { createDb } from "../../db/client";
import { codeReadingEntries } from "../../db/schema";
import type { AuthEnv } from "../../middleware/auth";

const router = new Hono<AuthEnv>();

type CodeReadingBody = {
  id?: string;
  name?: string;
  short?: string | null;
  bodyMd?: string;
  pythonCode?: string | null;
  otherNote?: string | null;
};

router.post("/", async (c) => {
  const body = await c.req.json<CodeReadingBody>().catch(() => null);
  if (!body?.id || !body?.name || !body?.bodyMd) {
    return c.json({ error: "id, name, and bodyMd are required" }, 400);
  }

  const db = createDb(c.env.DB);
  const [existing] = await db.select().from(codeReadingEntries).where(eq(codeReadingEntries.id, body.id)).limit(1);
  if (existing) return c.json({ error: "id already exists" }, 409);

  const entry = {
    id: body.id,
    name: body.name,
    short: body.short ?? null,
    bodyMd: body.bodyMd,
    pythonCode: body.pythonCode ?? null,
    otherNote: body.otherNote ?? null,
  };
  await db.insert(codeReadingEntries).values(entry);
  return c.json({ codeReading: entry }, 201);
});

router.put("/:id", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json<CodeReadingBody>().catch(() => null);
  if (!body) return c.json({ error: "invalid body" }, 400);

  const db = createDb(c.env.DB);
  const [existing] = await db.select().from(codeReadingEntries).where(eq(codeReadingEntries.id, id)).limit(1);
  if (!existing) return c.json({ error: "not found" }, 404);

  const { id: _id, ...rest } = body;
  await db.update(codeReadingEntries).set(rest).where(eq(codeReadingEntries.id, id));

  const [updated] = await db.select().from(codeReadingEntries).where(eq(codeReadingEntries.id, id)).limit(1);
  return c.json({ codeReading: updated });
});

router.delete("/:id", async (c) => {
  const id = c.req.param("id");
  const db = createDb(c.env.DB);
  const [existing] = await db.select().from(codeReadingEntries).where(eq(codeReadingEntries.id, id)).limit(1);
  if (!existing) return c.json({ error: "not found" }, 404);

  await db.delete(codeReadingEntries).where(eq(codeReadingEntries.id, id));
  return c.json({ ok: true });
});

export default router;
