// Pixel-art creature sprites, same grid+palette technique as the mascot
// (mascot/frames.ts): a string[] grid of single-char codes, mapped to a
// color palette. '.' is always transparent.
//
// These are animal companions you befriend, not enemies — designed with
// recognizable ears/wings/snout silhouettes instead of a featureless blob
// (the previous round single-blob "slime" read as an Among Us character).

export type MonsterVariant = "m1" | "m2" | "m3" | "boss";

// きつね(m1) — 三角の耳と細いマズル。
const FOX_ROWS = [
  "1........1",
  "11......11",
  ".11....11.",
  "..111111..",
  ".11222211.",
  ".11111111.",
  ".11111111.",
  "..111111..",
  "...1221...",
  "...11.11..",
];

// うさぎ(m2) — 長く立った耳。
const RABBIT_ROWS = [
  "..1....1..",
  "..1....1..",
  "..1....1..",
  ".11....11.",
  "..111111..",
  ".11222211.",
  ".11111111.",
  ".11111111.",
  "..111111..",
  "...1111...",
];

// ふくろう(m3) — 丸い体と大きな目、耳羽。
const OWL_ROWS = [
  ".1......1.",
  "..111111..",
  ".11111111.",
  "1122222211",
  ".11111111.",
  ".11111111.",
  "..111111..",
  "...1111...",
  "..111111..",
  ".11....11.",
];

// くま — 丸い頭と大きな耳、どっしりした体。
const BEAR_ROWS = [
  "..1......1..",
  ".11......11.",
  "111111111111",
  "111111111111",
  "112222222211",
  "111111111111",
  "111111111111",
  "111111111111",
  ".1111111111.",
  ".1111111111.",
  "..11111111..",
  "...111111...",
];

export const MONSTER_ROWS: Record<MonsterVariant, string[]> = {
  m1: FOX_ROWS,
  m2: RABBIT_ROWS,
  m3: OWL_ROWS,
  boss: BEAR_ROWS,
};

// モノクロ方針: 色で見分けさせず、形(きつね/うさぎ/ふくろう/くまのシルエット)で見分ける。
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
