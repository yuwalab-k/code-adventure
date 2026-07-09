// Mirrors LEVEL_XP_STEP in apps/api/src/lib/rewards.ts — every 50 XP is one level.
const LEVEL_XP_STEP = 50;

export function xpIntoLevel(xp: number): number {
  return xp % LEVEL_XP_STEP;
}

export function xpBarPercent(xp: number): number {
  return Math.round((xpIntoLevel(xp) / LEVEL_XP_STEP) * 100);
}
