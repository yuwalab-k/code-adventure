// 10x10 pixel-grid robot, drawn procedurally (no image assets) — same approach
// as the original code-sensei mascot. Each row is 10 characters; each
// character indexes into PALETTE, '.' is transparent.

export const PALETTE: Record<string, string> = {
  ".": "transparent",
  "#": "#333333",
  "b": "#1565c0",
  "w": "#ffffff",
  "g": "#2e7d32",
  "r": "#c62828",
};

export type MascotMood = "idle" | "blink" | "happy" | "sad";

export const MASCOT_FRAMES: Record<MascotMood, string[]> = {
  idle: [
    "..######..",
    ".#bbbbbb#.",
    "#b.wb.wb.b",
    "#b.wb.wb.b",
    "#bbbbbbbb#",
    "#b.####.b#",
    ".#bbbbbb#.",
    "..#.##.#..",
    "..#.##.#..",
    ".##.##.##.",
  ],
  blink: [
    "..######..",
    ".#bbbbbb#.",
    "#b......b#",
    "#b......b#",
    "#bbbbbbbb#",
    "#b.####.b#",
    ".#bbbbbb#.",
    "..#.##.#..",
    "..#.##.#..",
    ".##.##.##.",
  ],
  happy: [
    "..######..",
    ".#bbbbbb#.",
    "#b.wg.wg.b",
    "#b.wb.wb.b",
    "#bb####bb#",
    "#b.gggg.b#",
    ".#bbbbbb#.",
    "..#.##.#..",
    "..#.##.#..",
    ".##.##.##.",
  ],
  sad: [
    "..######..",
    ".#bbbbbb#.",
    "#b.wr.wr.b",
    "#b.wb.wb.b",
    "#bbbbbbbb#",
    "#b.rrrr.b#",
    ".#bbbbbb#.",
    "..#.##.#..",
    "..#.##.#..",
    ".##.##.##.",
  ],
};
