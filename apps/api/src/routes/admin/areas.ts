import { Hono } from "hono";
import { eq } from "drizzle-orm";
import { createDb } from "../../db/client";
import { areas } from "../../db/schema";
import type { AuthEnv } from "../../middleware/auth";

const router = new Hono<AuthEnv>();

type AreaBody = {
  id?: string;
  name?: string;
  position?: number;
  unlockRating?: number;
  gateX?: number | null;
  gateY?: number | null;
};

router.get("/", async (c) => {
  const db = createDb(c.env.DB);
  const rows = await db.select().from(areas);
  return c.json({ areas: rows.sort((a, b) => a.position - b.position) });
});

router.post("/", async (c) => {
  const body = await c.req.json<AreaBody>().catch(() => null);
  if (!body?.id || !body?.name || body?.position === undefined) {
    return c.json({ error: "id, name, position are required" }, 400);
  }

  const db = createDb(c.env.DB);
  const [existing] = await db.select().from(areas).where(eq(areas.id, body.id)).limit(1);
  if (existing) return c.json({ error: "id already exists" }, 409);

  const now = new Date().toISOString();
  const area = {
    id: body.id,
    name: body.name,
    position: body.position,
    unlockRating: body.unlockRating ?? 1,
    gateX: body.gateX ?? null,
    gateY: body.gateY ?? null,
    createdAt: now,
    updatedAt: now,
  };
  await db.insert(areas).values(area);
  return c.json({ area }, 201);
});

router.put("/:id", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json<AreaBody>().catch(() => null);
  if (!body) return c.json({ error: "invalid body" }, 400);

  const db = createDb(c.env.DB);
  const [existing] = await db.select().from(areas).where(eq(areas.id, id)).limit(1);
  if (!existing) return c.json({ error: "not found" }, 404);

  const { id: _id, ...rest } = body;
  await db
    .update(areas)
    .set({ ...rest, updatedAt: new Date().toISOString() })
    .where(eq(areas.id, id));
  const [updated] = await db.select().from(areas).where(eq(areas.id, id)).limit(1);
  return c.json({ area: updated });
});

router.delete("/:id", async (c) => {
  const id = c.req.param("id");
  const db = createDb(c.env.DB);
  await db.delete(areas).where(eq(areas.id, id));
  return c.json({ ok: true });
});

export default router;
