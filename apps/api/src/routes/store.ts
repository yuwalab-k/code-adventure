import { Hono } from "hono";
import { and, eq } from "drizzle-orm";
import { createDb } from "../db/client";
import { items, userItems, users } from "../db/schema";
import { requireAuth, type AuthEnv } from "../middleware/auth";

const router = new Hono<AuthEnv>();
router.use("*", requireAuth);

router.get("/items", async (c) => {
  const db = createDb(c.env.DB);
  const rows = await db.select().from(items);
  return c.json({ items: rows });
});

router.get("/users/me/items", async (c) => {
  const user = c.get("user");
  const db = createDb(c.env.DB);

  const rows = await db
    .select({ userItem: userItems, item: items })
    .from(userItems)
    .innerJoin(items, eq(userItems.itemId, items.id))
    .where(eq(userItems.userId, user.id));

  return c.json({
    items: rows.map((r) => ({ ...r.item, isEquipped: r.userItem.isEquipped, source: r.userItem.source, acquiredAt: r.userItem.acquiredAt })),
  });
});

router.post("/store/purchase", async (c) => {
  const body = await c.req.json<{ itemId?: string }>().catch(() => null);
  if (!body?.itemId) return c.json({ error: "itemId is required" }, 400);

  const user = c.get("user");
  const db = createDb(c.env.DB);

  const [item] = await db.select().from(items).where(eq(items.id, body.itemId)).limit(1);
  if (!item) return c.json({ error: "not found" }, 404);
  if (item.priceCoins === null) return c.json({ error: "this item is not for sale" }, 400);

  const [alreadyOwned] = await db
    .select()
    .from(userItems)
    .where(and(eq(userItems.userId, user.id), eq(userItems.itemId, item.id)))
    .limit(1);
  if (alreadyOwned) return c.json({ error: "already owned" }, 409);

  // Re-read the user's coin balance at purchase time rather than trusting
  // whatever was in the session-derived `user` object, to avoid a stale-read race.
  const [freshUser] = await db.select().from(users).where(eq(users.id, user.id)).limit(1);
  if (!freshUser || freshUser.coins < item.priceCoins) {
    return c.json({ error: "not enough coins" }, 402);
  }

  const now = new Date().toISOString();
  await db.update(users).set({ coins: freshUser.coins - item.priceCoins, updatedAt: now }).where(eq(users.id, user.id));
  await db.insert(userItems).values({
    id: crypto.randomUUID(),
    userId: user.id,
    itemId: item.id,
    source: "store_purchase",
    sourceProblemId: null,
    isEquipped: false,
    acquiredAt: now,
  });

  return c.json({ ok: true, remainingCoins: freshUser.coins - item.priceCoins });
});

router.put("/users/me/items/:itemId/equip", async (c) => {
  const itemId = c.req.param("itemId");
  const body = await c.req.json<{ equipped?: boolean }>().catch(() => null);
  if (body?.equipped === undefined) return c.json({ error: "equipped (boolean) is required" }, 400);

  const user = c.get("user");
  const db = createDb(c.env.DB);

  const [owned] = await db
    .select({ userItem: userItems, item: items })
    .from(userItems)
    .innerJoin(items, eq(userItems.itemId, items.id))
    .where(and(eq(userItems.userId, user.id), eq(userItems.itemId, itemId)))
    .limit(1);
  if (!owned) return c.json({ error: "not owned" }, 404);
  if (!owned.item.slot) return c.json({ error: "this item has no equip slot" }, 400);

  if (body.equipped) {
    // App-level invariant (see DB_DESIGN.md): only one item per slot can be
    // equipped at a time. Un-equip any other owned item in the same slot first.
    const sameSlotOwned = await db
      .select({ userItem: userItems, item: items })
      .from(userItems)
      .innerJoin(items, eq(userItems.itemId, items.id))
      .where(and(eq(userItems.userId, user.id), eq(items.slot, owned.item.slot)));

    for (const row of sameSlotOwned) {
      if (row.userItem.itemId !== itemId && row.userItem.isEquipped) {
        await db.update(userItems).set({ isEquipped: false }).where(eq(userItems.id, row.userItem.id));
      }
    }
  }

  await db.update(userItems).set({ isEquipped: body.equipped }).where(eq(userItems.id, owned.userItem.id));

  return c.json({ ok: true });
});

export default router;
