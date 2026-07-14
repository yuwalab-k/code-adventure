// World-object icons, same grid+palette technique as player/mascot/NPC
// sprites (see pixelTexture.ts's generatePixelTexture) — one consistent
// "2D dot" drawing rule for every object in the game world.

// 閉じたゲート — 未解放エリアの境界に置く格子状の門。
const GATE_ROWS = [
  "11111111",
  "1.1.1.1.",
  "1.1.1.1.",
  "1.1.1.1.",
  "1.1.1.1.",
  "1.1.1.1.",
  "1.1.1.1.",
  "1.1.1.1.",
  "11111111",
  "11111111",
];

// クエスト受付中(？) — ひし形。
const QUEST_AVAILABLE_ROWS = ["..1..", ".111.", "11111", ".111.", "..1.."];

// クリア済み(✓) — 塗りつぶし四角。
const QUEST_CLEARED_ROWS = ["11111", "11111", "11111", "11111", "11111"];

export const WORLD_ICON_ROWS = {
  gate: GATE_ROWS,
} as const;

export type WorldIconKind = keyof typeof WORLD_ICON_ROWS;

export const BADGE_ROWS = {
  available: QUEST_AVAILABLE_ROWS,
  cleared: QUEST_CLEARED_ROWS,
} as const;

export type BadgeKind = keyof typeof BADGE_ROWS;
