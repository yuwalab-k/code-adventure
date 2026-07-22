import type { FieldCell, FieldStage, PuzzleCell, PuzzleStage } from "./types";

// ---- Field: World 1 / Stage 1 ----
//
// A straight path is cut off by one broken tile. The console right before
// the gap opens the puzzle; solving it (down, right, right, up) is the
// exact detour around the broken tile — repair it and that's the route you
// then walk by hand. The finish is only reachable after the repair.
function g(): FieldCell {
  return { tile: "grass" };
}
function p(): FieldCell {
  return { tile: "path" };
}

export const FIELD_STAGE_1: FieldStage = {
  width: 9,
  height: 6,
  start: { x: 1, y: 2 },
  console: { x: 3, y: 2 },
  finish: { x: 8, y: 2 },
  cells: [
    [g(), { tile: "grass", object: "bush" }, g(), g(), g(), g(), { tile: "grass", object: "tree" }, g(), g()],
    [g(), g(), g(), g(), g(), g(), g(), g(), g()],
    [g(), p(), p(), { tile: "console" }, { tile: "broken" }, p(), p(), p(), { tile: "finish" }],
    [g(), g(), g(), p(), p(), p(), g(), g(), g()],
    [g(), g(), g(), g(), g(), g(), g(), g(), g()],
    [g(), g(), g(), g(), g(), g(), g(), g(), g()],
  ],
};

// ---- Puzzle: World 1 / Stage 1 ----
// Blanks stack in column 2, one per code line:
//   line 0 "down"  (prefilled, shows the pattern)
//   line 1 "right" )
//   line 2 "right" )  the detour around the one broken tile
//   line 3 "up"    )
// rows below are open ground where the robot pushes parts up into place.
const PREFIX = "robot.move(";
const SUFFIX = ")";

function codeRow(answer: string): PuzzleCell[] {
  return [
    { kind: "wall", label: PREFIX },
    { kind: "wall", label: PREFIX },
    { kind: "blank", answer },
    { kind: "wall", label: SUFFIX },
    { kind: "wall", label: SUFFIX },
    { kind: "wall", label: SUFFIX },
  ];
}

function floorRow(width: number): PuzzleCell[] {
  return Array.from({ length: width }, () => ({ kind: "floor" }) as PuzzleCell);
}

// Wraps the stage content in a ring of plain floor so the robot can always
// walk around to the far side of any part sitting near the "real" edge —
// see the canPartEnter comment in puzzleEngine.ts for why that matters.
function withMargin(cells: PuzzleCell[][], margin: number): PuzzleCell[][] {
  const innerWidth = cells[0].length;
  const paddedRow = () => floorRow(innerWidth + margin * 2);
  const marginCell = (): PuzzleCell => ({ kind: "floor" });
  const rows: PuzzleCell[][] = [];
  for (let i = 0; i < margin; i++) rows.push(paddedRow());
  for (const row of cells) {
    rows.push([...Array.from({ length: margin }, marginCell), ...row, ...Array.from({ length: margin }, marginCell)]);
  }
  for (let i = 0; i < margin; i++) rows.push(paddedRow());
  return rows;
}

const MARGIN = 1;
const innerCells = [
  codeRow('"down"'),
  codeRow('"right"'),
  codeRow('"right"'),
  codeRow('"up"'),
  floorRow(6), // corridor
  floorRow(6), // inventory
  floorRow(6), // robot-start corridor
];
// Each part sits in its own column so it can ride straight up to its target
// row without another part parked in column 2 (the blank lane) blocking the
// way — only the final push slides it sideways into the blank.
const innerParts = [
  { id: "p-down", label: '"down"', x: 2, y: 0 },
  { id: "p-right-1", label: '"right"', x: 0, y: 5 },
  { id: "p-right-2", label: '"right"', x: 3, y: 5 },
  { id: "p-up", label: '"up"', x: 4, y: 5 },
  { id: "p-left", label: '"left"', x: 1, y: 5 },
];
const innerRobotStart = { x: 2, y: 6 };

export const PUZZLE_STAGE_1: PuzzleStage = {
  width: innerCells[0].length + MARGIN * 2,
  height: innerCells.length + MARGIN * 2,
  robotStart: { x: innerRobotStart.x + MARGIN, y: innerRobotStart.y + MARGIN },
  cells: withMargin(innerCells, MARGIN),
  parts: innerParts.map((part) => ({ ...part, x: part.x + MARGIN, y: part.y + MARGIN })),
};
