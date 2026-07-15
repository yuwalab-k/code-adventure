// Pure simulation core for the algorithm-understanding stage: tracks the
// robot's position/facing as lesson Python code calls move_forward() /
// turn_left() / turn_right() / at_wall() / at_goal(), one call at a time.
// No Phaser or Pyodide dependency here — algolabWorker.ts wires these
// methods into the Python namespace, AlgoLabScene.ts replays `steps`.

import {
  type Cell,
  type Facing,
  type ParsedGrid,
  cellAhead,
  isGoal,
  isWalkable,
  turnLeft as nextFacingLeft,
  turnRight as nextFacingRight,
} from "./tileGrid";

export type RobotAction = "forward" | "turn_left" | "turn_right";

export interface RobotStep {
  action: RobotAction;
  cell: Cell;
  facing: Facing;
  // "forward" attempted into a wall: the robot stays put and wastes the
  // step, rather than the run ending — a wall bump is a recoverable
  // mistake, not a hard failure (see the plan's judging rule).
  bumped: boolean;
}

export type LimitKind = "step_limit" | "call_limit";

export class RobotLimitError extends Error {
  readonly kind: LimitKind;

  constructor(kind: LimitKind) {
    super(kind);
    this.kind = kind;
  }
}

// Bounds how much a lesson script can do before we call it a runaway loop.
// MAX_STEPS caps actual movement/turns (the meaningful "did it ever reach
// the goal" budget); MAX_CALLS is a coarser backstop against something like
// `while True: at_wall()` that never moves but still spins forever.
const MAX_STEPS = 500;
const MAX_CALLS = 5000;

export class RobotSim {
  private readonly grid: ParsedGrid;
  private cell: Cell;
  private facing: Facing;
  private cleared: boolean;
  private stepCount = 0;
  private callCount = 0;
  readonly steps: RobotStep[] = [];

  constructor(grid: ParsedGrid) {
    this.grid = grid;
    this.cell = { ...grid.start };
    this.facing = grid.startFacing;
    this.cleared = isGoal(grid, this.cell);
  }

  private guardCall(): void {
    this.callCount += 1;
    if (this.callCount > MAX_CALLS) throw new RobotLimitError("call_limit");
  }

  private guardStep(): void {
    this.stepCount += 1;
    if (this.stepCount > MAX_STEPS) throw new RobotLimitError("step_limit");
  }

  moveForward = (): void => {
    this.guardCall();
    const ahead = cellAhead(this.cell, this.facing);
    const bumped = !isWalkable(this.grid, ahead);
    if (!bumped) this.cell = ahead;
    this.guardStep();
    this.steps.push({ action: "forward", cell: { ...this.cell }, facing: this.facing, bumped });
    if (!bumped && isGoal(this.grid, this.cell)) this.cleared = true;
  };

  turnLeft = (): void => {
    this.guardCall();
    this.facing = nextFacingLeft(this.facing);
    this.guardStep();
    this.steps.push({ action: "turn_left", cell: { ...this.cell }, facing: this.facing, bumped: false });
  };

  turnRight = (): void => {
    this.guardCall();
    this.facing = nextFacingRight(this.facing);
    this.guardStep();
    this.steps.push({ action: "turn_right", cell: { ...this.cell }, facing: this.facing, bumped: false });
  };

  atWall = (): boolean => {
    this.guardCall();
    return !isWalkable(this.grid, cellAhead(this.cell, this.facing));
  };

  atGoal = (): boolean => {
    this.guardCall();
    return isGoal(this.grid, this.cell);
  };

  isCleared(): boolean {
    return this.cleared;
  }
}
