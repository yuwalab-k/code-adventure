import { DIRECTION_DELTA } from "./types";
import type { Direction, PuzzlePart, PuzzleStage } from "./types";

export interface PuzzleMoveResult {
  parts: PuzzlePart[];
  robot: { x: number; y: number };
  moved: boolean;
}

function inBounds(stage: PuzzleStage, x: number, y: number): boolean {
  return x >= 0 && y >= 0 && x < stage.width && y < stage.height;
}

// Both the robot and pushable parts can move freely over fixed code text —
// the text is just drawn on the ground, not a physical wall. Otherwise a
// part (or the robot standing behind it) could get sealed off from a blank
// and an already-placed answer could become impossible to pull back out.
//
// The one thing parts still can't enter is the outermost ring of the stage
// (unless that cell is a blank they're meant to land in). Since the robot
// can walk anywhere, a part shoved all the way to the true edge would leave
// no cell beyond it for the robot to stand on and push it back — a
// permanent softlock. Stages should wrap their real content in a margin of
// plain floor so this restriction never bites during normal play.
function canPartEnter(stage: PuzzleStage, x: number, y: number): boolean {
  if (!inBounds(stage, x, y)) return false;
  const cell = stage.cells[y][x];
  const onOuterRing = x === 0 || y === 0 || x === stage.width - 1 || y === stage.height - 1;
  if (onOuterRing && cell.kind !== "blank") return false;
  return true;
}

function partAt(parts: PuzzlePart[], x: number, y: number): PuzzlePart | undefined {
  return parts.find((part) => part.x === x && part.y === y);
}

export function attemptMove(
  stage: PuzzleStage,
  parts: PuzzlePart[],
  robot: { x: number; y: number },
  direction: Direction,
): PuzzleMoveResult {
  const { dx, dy } = DIRECTION_DELTA[direction];
  const nx = robot.x + dx;
  const ny = robot.y + dy;

  if (!inBounds(stage, nx, ny)) {
    return { parts, robot, moved: false };
  }

  const pushedPart = partAt(parts, nx, ny);
  if (!pushedPart) {
    return { parts, robot: { x: nx, y: ny }, moved: true };
  }

  const bx = nx + dx;
  const by = ny + dy;
  if (!canPartEnter(stage, bx, by) || partAt(parts, bx, by)) {
    return { parts, robot, moved: false };
  }

  const nextParts = parts.map((part) => (part.id === pushedPart.id ? { ...part, x: bx, y: by } : part));
  return { parts: nextParts, robot: { x: nx, y: ny }, moved: true };
}

export function blankFillMap(stage: PuzzleStage, parts: PuzzlePart[]): Map<string, PuzzlePart> {
  const map = new Map<string, PuzzlePart>();
  for (const part of parts) {
    const cell = inBounds(stage, part.x, part.y) ? stage.cells[part.y][part.x] : undefined;
    if (cell?.kind === "blank") {
      map.set(`${part.x},${part.y}`, part);
    }
  }
  return map;
}

export function isStageComplete(stage: PuzzleStage, parts: PuzzlePart[]): boolean {
  const fills = blankFillMap(stage, parts);
  for (let y = 0; y < stage.height; y++) {
    for (let x = 0; x < stage.width; x++) {
      const cell = stage.cells[y][x];
      if (cell.kind !== "blank") continue;
      const filled = fills.get(`${x},${y}`);
      if (!filled || filled.label !== cell.answer) return false;
    }
  }
  return true;
}
