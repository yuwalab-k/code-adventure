// Mirrors RATING_XP_STEP in apps/api/src/lib/rewards.ts — every 50 XP is one rating point.
const RATING_XP_STEP = 50;

export function xpIntoRating(xp: number): number {
  return xp % RATING_XP_STEP;
}

export function xpBarPercent(xp: number): number {
  return Math.round((xpIntoRating(xp) / RATING_XP_STEP) * 100);
}
