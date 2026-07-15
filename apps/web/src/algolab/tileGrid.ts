// Maze grid for the algorithm-understanding stage: a small, self-contained
// tile map (not the main world map) that a lesson's Python code drives a
// robot through. Grid rows are plain strings so lesson content stays
// hand-authorable JSON, same spirit as the NPC/world-icon ASCII grids in
// worldmap/pixelTexture.ts.

export type Facing = "up" | "down" | "left" | "right";

export const TileType = {
  Floor: "floor",
  Wall: "wall",
  Goal: "goal",
} as const;
export type TileType = (typeof TileType)[keyof typeof TileType];

export interface Cell {
  col: number;
  row: number;
}

export interface ParsedGrid {
  tiles: TileType[][]; // [row][col]
  cols: number;
  rows: number;
  start: Cell;
  startFacing: Facing;
  goal: Cell;
}

// Grid legend: '#' wall, '.' floor, 'S' start (floor), 'G' goal.
export function parseGrid(rows: string[], startFacing: Facing = "right"): ParsedGrid {
  let start: Cell | null = null;
  let goal: Cell | null = null;

  const tiles: TileType[][] = rows.map((rowStr, row) =>
    [...rowStr].map((ch, col) => {
      if (ch === "S") {
        start = { col, row };
        return TileType.Floor;
      }
      if (ch === "G") {
        goal = { col, row };
        return TileType.Goal;
      }
      if (ch === "#") return TileType.Wall;
      return TileType.Floor;
    }),
  );

  if (!start) throw new Error("lesson grid is missing a start cell (S)");
  if (!goal) throw new Error("lesson grid is missing a goal cell (G)");

  return { tiles, cols: tiles[0]?.length ?? 0, rows: tiles.length, start, startFacing, goal };
}

export function isWalkable(grid: ParsedGrid, cell: Cell): boolean {
  if (cell.row < 0 || cell.row >= grid.rows || cell.col < 0 || cell.col >= grid.cols) return false;
  return grid.tiles[cell.row][cell.col] !== TileType.Wall;
}

export function isGoal(grid: ParsedGrid, cell: Cell): boolean {
  return cell.col === grid.goal.col && cell.row === grid.goal.row;
}

const FACING_DELTA: Record<Facing, { dc: number; dr: number }> = {
  up: { dc: 0, dr: -1 },
  down: { dc: 0, dr: 1 },
  left: { dc: -1, dr: 0 },
  right: { dc: 1, dr: 0 },
};

export function cellAhead(cell: Cell, facing: Facing): Cell {
  const { dc, dr } = FACING_DELTA[facing];
  return { col: cell.col + dc, row: cell.row + dr };
}

const LEFT_TURN: Record<Facing, Facing> = { up: "left", left: "down", down: "right", right: "up" };
const RIGHT_TURN: Record<Facing, Facing> = { up: "right", right: "down", down: "left", left: "up" };

export function turnLeft(facing: Facing): Facing {
  return LEFT_TURN[facing];
}

export function turnRight(facing: Facing): Facing {
  return RIGHT_TURN[facing];
}

export function facingAngle(facing: Facing): number {
  // 0deg artwork faces "down" (see robotFrames.ts) — offsets below rotate from there.
  switch (facing) {
    case "down":
      return 0;
    case "left":
      return 90;
    case "up":
      return 180;
    case "right":
      return -90;
  }
}
