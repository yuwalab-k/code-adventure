import { Hono } from "hono";
import { eq } from "drizzle-orm";
import { createDb } from "../db/client";
import { problems } from "../db/schema";
import { requireAuth, type AuthEnv } from "../middleware/auth";
import { computeClearedMap } from "../lib/bossStatus";

const router = new Hono<AuthEnv>();
router.use("*", requireAuth);

router.get("/map", async (c) => {
  const user = c.get("user");
  const db = createDb(c.env.DB);

  const publishedProblems = await db.select().from(problems).where(eq(problems.isPublished, true));
  const cleared = await computeClearedMap(
    db,
    user.id,
    publishedProblems.map((p) => p.id),
  );

  const nodes = publishedProblems.map((p) => ({
    id: p.id,
    title: p.title,
    difficulty: p.difficulty,
    requiredLevel: p.requiredLevel,
    mapX: p.mapX,
    mapY: p.mapY,
    mapOrder: p.mapOrder,
    // Same-tier (★ band) problems are always walkable; only crossing into a
    // higher required_level is gated, per SPEC.md 4.2.
    locked: user.level < p.requiredLevel,
    cleared: cleared[p.id] ?? false,
  }));

  return c.json({
    player: { level: user.level, xp: user.xp, coins: user.coins },
    nodes,
  });
});

export default router;
