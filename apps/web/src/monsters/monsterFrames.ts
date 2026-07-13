// Pixel-art monster sprites, same grid+palette technique as the mascot
// (mascot/frames.ts): a string[] grid of single-char codes, mapped to a
// color palette. '.' is always transparent.

export type MonsterVariant = "m1" | "m2" | "m3" | "boss";

// スライム(m1) — 丸い体に2つの目。
const SLIME_ROWS = [
  "..111111..",
  ".11111111.",
  "1111111111",
  "1122112211",
  "1111111111",
  "1111111111",
  "1111111111",
  ".11111111.",
  "..111111..",
  "...1111...",
];

// ゴブリン(m2) — とがった耳と角ばった体。
const GOBLIN_ROWS = [
  "1........1",
  ".1......1.",
  "..111111..",
  ".11111111.",
  ".12211221.",
  ".11111111.",
  ".11111111.",
  "..111111..",
  "...1111...",
  "....11....",
];

// コウモリ(m3) — 横に広い羽と丸い体。
const BAT_ROWS = [
  "1........1",
  "11......11",
  ".11....11.",
  "..111111..",
  "..122221..",
  "..111111..",
  "..111111..",
  "...1111...",
  "....11....",
  "..........",
];

// ラスボス — 角の生えた大きな頭。
const BOSS_ROWS = [
  "..1......1..",
  ".11......11.",
  "..11111111..",
  ".1111111111.",
  "112211112211",
  "111111111111",
  "111111111111",
  "111111111111",
  ".1111111111.",
  "..11111111..",
  "...111111...",
  ".....11.....",
];

export const MONSTER_ROWS: Record<MonsterVariant, string[]> = {
  m1: SLIME_ROWS,
  m2: GOBLIN_ROWS,
  m3: BAT_ROWS,
  boss: BOSS_ROWS,
};

// モノクロ方針: 色でモンスターを区別せず、形(SLIME/GOBLIN/BAT/BOSSのシルエット)で区別する。
export const MONSTER_BODY: Record<MonsterVariant, string> = {
  m1: "#ffffff",
  m2: "#ffffff",
  m3: "#ffffff",
  boss: "#ffffff",
};

export const MONSTER_EYE: Record<MonsterVariant, string> = {
  m1: "#000000",
  m2: "#000000",
  m3: "#000000",
  boss: "#000000",
};

export function colorForMonster(char: string, variant: MonsterVariant): string | null {
  if (char === "." || char === "0") return null;
  if (char === "2") return MONSTER_EYE[variant];
  return MONSTER_BODY[variant];
}
