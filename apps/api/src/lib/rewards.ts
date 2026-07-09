import { eq } from "drizzle-orm";
import type { Db } from "../db/client";
import { users } from "../db/schema";

export const SMALL_BOSS_XP_PER_DIFFICULTY = 10;
export const BIG_BOSS_XP_PER_DIFFICULTY = 30;
export const BIG_BOSS_COINS_PER_DIFFICULTY = 20;

// Every 50 total XP is one level. Clearing one ★1 problem (3 small bosses +
// 1 big boss) grants 10*3 + 30 = 60 XP, enough to reach the level (3) that
// unlocks ★2 content — see requiredLevelFromDifficulty in admin/problems.ts.
const LEVEL_XP_STEP = 50;

export function levelForXp(xp: number): number {
  return Math.floor(xp / LEVEL_XP_STEP) + 1;
}

export async function grantRewards(
  db: Db,
  userId: string,
  { xp = 0, coins = 0 }: { xp?: number; coins?: number },
): Promise<{ xp: number; coins: number; level: number; leveledUp: boolean }> {
  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!user) throw new Error("user not found");

  const newXp = user.xp + xp;
  const newCoins = user.coins + coins;
  const newLevel = levelForXp(newXp);
  const leveledUp = newLevel > user.level;

  await db
    .update(users)
    .set({ xp: newXp, coins: newCoins, level: newLevel, updatedAt: new Date().toISOString() })
    .where(eq(users.id, userId));

  return { xp: newXp, coins: newCoins, level: newLevel, leveledUp };
}
