/// <reference lib="webworker" />
import { loadPyodide, type PyodideInterface } from "pyodide";
import { type Facing, parseGrid } from "./tileGrid";
import { RobotLimitError, RobotSim, type LimitKind, type RobotStep } from "./robotProgram";

// Separate worker from problems/pyodideWorker.ts on purpose: this one
// injects a robot-movement API into the Python namespace and simulates
// against a maze grid instead of judging stdin/stdout — different enough
// contracts that sharing one worker file would just mean branching on a
// `mode` field for no real benefit, and keeps the real AtCoder judge flow
// untouched by this experimental stage.
const PYODIDE_INDEX_URL = "https://cdn.jsdelivr.net/pyodide/v0.26.4/full/";

let pyodidePromise: Promise<PyodideInterface> | null = null;
function getPyodide(): Promise<PyodideInterface> {
  if (!pyodidePromise) {
    pyodidePromise = loadPyodide({ indexURL: PYODIDE_INDEX_URL });
  }
  return pyodidePromise;
}

interface RunRequest {
  id: string;
  code: string;
  gridRows: string[];
  startFacing: Facing;
}

export type RunResult =
  | { id: string; status: "clear"; steps: RobotStep[] }
  | { id: string; status: "fail"; reason: LimitKind | "not_cleared"; steps: RobotStep[] }
  | { id: string; status: "error"; message: string; steps: RobotStep[] };

self.onmessage = async (event: MessageEvent<RunRequest>) => {
  const { id, code, gridRows, startFacing } = event.data;
  const pyodide = await getPyodide();
  const namespace = pyodide.globals.get("dict")();
  const grid = parseGrid(gridRows, startFacing);
  const sim = new RobotSim(grid);

  namespace.set("move_forward", sim.moveForward);
  namespace.set("turn_left", sim.turnLeft);
  namespace.set("turn_right", sim.turnRight);
  namespace.set("at_wall", sim.atWall);
  namespace.set("at_goal", sim.atGoal);

  try {
    await pyodide.runPythonAsync(code, { globals: namespace });
    const result: RunResult = sim.isCleared()
      ? { id, status: "clear", steps: sim.steps }
      : { id, status: "fail", reason: "not_cleared", steps: sim.steps };
    postMessage(result);
  } catch (err) {
    if (err instanceof RobotLimitError) {
      const result: RunResult = { id, status: "fail", reason: err.kind, steps: sim.steps };
      postMessage(result);
    } else {
      const result: RunResult = { id, status: "error", message: String(err), steps: sim.steps };
      postMessage(result);
    }
  } finally {
    namespace.destroy();
  }
};
