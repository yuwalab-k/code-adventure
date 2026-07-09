import { Hono } from "hono";
import { eq } from "drizzle-orm";
import { createDb } from "../../db/client";
import { items } from "../../db/schema";
import type { AuthEnv } from "../../middleware/auth";

const router = new Hono<AuthEnv>();

router.post("/", async (c) => {
  const body = await c.req
    .json<{
      name?: string;
      description?: string | null;
      iconKey?: string;
      slot?: "hat" | "cape" | "shield" | "other" | null;
      priceCoins?: number | null;
      isKey?: boolean;
    }>()
    .catch(() => null);
  if (!body?.name || !body?.iconKey) return c.json({ error: "name and iconKey are required" }, 400);

  const db = createDb(c.env.DB);
  const now = new Date().toISOString();
  const item = {
    id: crypto.randomUUID(),
    name: body.name,
    description: body.description ?? null,
    iconKey: body.iconKey,
    slot: body.slot ?? null,
    priceCoins: body.priceCoins ?? null,
    isKey: body.isKey ?? false,
    createdAt: now,
    updatedAt: now,
  };
  await db.insert(items).values(item);
  return c.json({ item }, 201);
});

router.put("/:id", async (c) => {
  const id = c.req.param("id");
  const body = await c.req
    .json<{
      name?: string;
      description?: string | null;
      iconKey?: string;
      slot?: "hat" | "cape" | "shield" | "other" | null;
      priceCoins?: number | null;
      isKey?: boolean;
    }>()
    .catch(() => null);
  if (!body) return c.json({ error: "invalid body" }, 400);

  const db = createDb(c.env.DB);
  const [existing] = await db.select().from(items).where(eq(items.id, id)).limit(1);
  if (!existing) return c.json({ error: "not found" }, 404);

  await db
    .update(items)
    .set({ ...body, updatedAt: new Date().toISOString() })
    .where(eq(items.id, id));

  const [updated] = await db.select().from(items).where(eq(items.id, id)).limit(1);
  return c.json({ item: updated });
});

router.delete("/:id", async (c) => {
  const id = c.req.param("id");
  const db = createDb(c.env.DB);
  const [existing] = await db.select().from(items).where(eq(items.id, id)).limit(1);
  if (!existing) return c.json({ error: "not found" }, 404);

  try {
    await db.delete(items).where(eq(items.id, id));
  } catch {
    return c.json({ error: "cannot delete: item is owned by one or more users" }, 409);
  }
  return c.json({ ok: true });
});

export default router;
