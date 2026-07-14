import { Hono } from "hono";
import { eq } from "drizzle-orm";
import { createDb } from "../db/client";
import { problems, areas } from "../db/schema";
import { requireAuth, type AuthEnv } from "../middleware/auth";
import { computeStatusMap } from "../lib/problemStatus";

const router = new Hono<AuthEnv>();
router.use("*", requireAuth);

router.get("/map", async (c) => {
  const user = c.get("user");
  const db = createDb(c.env.DB);

  const [publishedProblems, allAreas] = await Promise.all([
    db.select().from(problems).where(eq(problems.isPublished, true)),
    db.select().from(areas),
  ]);

  const statusMap = await computeStatusMap(
    db,
    user.id,
    publishedProblems.map((p) => p.id),
  );

  const areaList = allAreas
    .sort((a, b) => a.position - b.position)
    .map((a) => ({
      id: a.id,
      name: a.name,
      position: a.position,
      unlockRating: a.unlockRating,
      unlocked: user.rating >= a.unlockRating,
      gateX: a.gateX,
      gateY: a.gateY,
    }));
  const unlockedAreaIds = new Set(areaList.filter((a) => a.unlocked).map((a) => a.id));

  const npcs = publishedProblems.map((p) => ({
    id: p.id,
    title: p.title,
    difficulty: p.difficulty,
    areaId: p.areaId,
    mapX: p.mapX,
    mapY: p.mapY,
    mapOrder: p.mapOrder,
    npcMotif: p.npcMotif,
    status: statusMap[p.id] ?? "not_started",
    locked: !unlockedAreaIds.has(p.areaId),
  }));

  const clearedCount = Object.values(statusMap).filter((s) => s === "cleared").length;

  return c.json({
    player: {
      rating: user.rating,
      xp: user.xp,
      coins: user.coins,
      clearedCount,
      totalCount: publishedProblems.length,
    },
    areas: areaList,
    npcs,
  });
});

export default router;
