export type Direction = "up" | "down" | "left" | "right";

export const DIRECTION_DELTA: Record<Direction, { dx: number; dy: number }> = {
  up: { dx: 0, dy: -1 },
  down: { dx: 0, dy: 1 },
  left: { dx: -1, dy: 0 },
  right: { dx: 1, dy: 0 },
};

// ---- Field (map) scene ----

// "broken" tiles block movement until the stage's puzzle is solved — the
// spec's "road cut off by broken components" gimmick for World 1.
// "console" opens the puzzle; "finish" is the real goal, only reachable
// once the broken stretch has been repaired.
export type FieldTile = "grass" | "path" | "broken" | "console" | "finish";
export type FieldObject = "bush" | "tree" | "sign" | "gate";

export interface FieldCell {
  tile: FieldTile;
  object?: FieldObject;
}

export interface FieldStage {
  width: number;
  height: number;
  cells: FieldCell[][]; // [row][col]
  start: { x: number; y: number };
  console: { x: number; y: number };
  finish: { x: number; y: number };
}

// ---- Puzzle (code) scene ----

export type PuzzleCellKind = "wall" | "floor" | "blank";

export interface PuzzleCell {
  kind: PuzzleCellKind;
  answer?: string; // only for "blank"
  label?: string; // only for "wall" — fixed code text shown in this cell's run
}

export interface PuzzlePart {
  id: string;
  label: string;
  x: number;
  y: number;
}

export interface PuzzleStage {
  width: number;
  height: number;
  cells: PuzzleCell[][]; // [row][col]
  parts: PuzzlePart[];
  robotStart: { x: number; y: number };
}
