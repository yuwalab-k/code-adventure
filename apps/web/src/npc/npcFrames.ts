// NPC silhouettes, same grid+palette technique as mascot/monsterFrames.
// No expression variants — distinguishable by silhouette alone, per spec.

export type NpcMotif = "student" | "engineer" | "robot" | "book" | "computer";

// 学生 — 丸い帽子と素朴な体。
const STUDENT_ROWS = [
  "..111111..",
  ".11111111.",
  "..111111..",
  ".11222211.",
  ".11111111.",
  "..111111..",
  "..111111..",
  ".11111111.",
  ".11....11.",
  ".11....11.",
];

// エンジニア — 幅広のヘルメット。
const ENGINEER_ROWS = [
  "1111111111",
  ".11111111.",
  "..111111..",
  ".11222211.",
  ".11111111.",
  "..111111..",
  ".11111111.",
  "1111111111",
  ".11....11.",
  ".11....11.",
];

// ロボット — アンテナと四角い頭。
const ROBOT_ROWS = [
  "....11....",
  "....22....",
  ".11111111.",
  ".12211221.",
  ".11111111.",
  ".11111111.",
  ".12121212.",
  ".11111111.",
  "11......11",
  ".11....11.",
];

// 本 — 見開きの本。
const BOOK_ROWS = [
  ".11111111.",
  "1111111111",
  "1122222211",
  "1111111111",
  "1111111111",
  "1111221111",
  "1111111111",
  "1122222211",
  "1111111111",
  ".11111111.",
];

// コンピュータ — モニターとスタンド。
const COMPUTER_ROWS = [
  ".11111111.",
  "1122222211",
  "1122222211",
  "1122222211",
  ".11111111.",
  "...1111...",
  "..111111..",
  ".11111111.",
  "..........",
  "..........",
];

export const NPC_ROWS: Record<NpcMotif, string[]> = {
  student: STUDENT_ROWS,
  engineer: ENGINEER_ROWS,
  robot: ROBOT_ROWS,
  book: BOOK_ROWS,
  computer: COMPUTER_ROWS,
};

// モノクロ方針: 色ではなくシルエットで見分ける。
export function colorForNpc(char: string): string | null {
  if (char === "." || char === "0") return null;
  if (char === "2") return "#000000";
  return "#ffffff";
}
