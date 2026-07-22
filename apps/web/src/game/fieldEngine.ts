import { DIRECTION_DELTA } from "./types";
import type { Direction, FieldStage } from "./types";

export function attemptFieldMove(
  stage: FieldStage,
  robot: { x: number; y: number },
  direction: Direction,
): { x: number; y: number } {
  const { dx, dy } = DIRECTION_DELTA[direction];
  const nx = robot.x + dx;
  const ny = robot.y + dy;
  if (nx < 0 || ny < 0 || nx >= stage.width || ny >= stage.height) return robot;
  const cell = stage.cells[ny][nx];
  if (cell.object || cell.tile === "broken") return robot; // obstacles / unrepaired gap block movement
  return { x: nx, y: ny };
}
