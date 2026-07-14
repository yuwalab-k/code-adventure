import { eq } from "drizzle-orm";
import type { Db } from "../db/client";
import { users } from "../db/schema";

export const CLEAR_XP_PER_DIFFICULTY = 30;
export const CLEAR_COINS_PER_DIFFICULTY = 20;

// Every 50 total XP is one rating point.
const RATING_XP_STEP = 50;

export function ratingForXp(xp: number): number {
  return Math.floor(xp / RATING_XP_STEP) + 1;
}

export async function grantRewards(
  db: Db,
  userId: string,
  { xp = 0, coins = 0 }: { xp?: number; coins?: number },
): Promise<{ xp: number; coins: number; rating: number; ratingUp: boolean }> {
  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!user) throw new Error("user not found");

  const newXp = user.xp + xp;
  const newCoins = user.coins + coins;
  const newRating = ratingForXp(newXp);
  const ratingUp = newRating > user.rating;

  await db
    .update(users)
    .set({ xp: newXp, coins: newCoins, rating: newRating, updatedAt: new Date().toISOString() })
    .where(eq(users.id, userId));

  return { xp: newXp, coins: newCoins, rating: newRating, ratingUp };
}
