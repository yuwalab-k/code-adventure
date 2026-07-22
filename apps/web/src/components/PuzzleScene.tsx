import { useMemo, useState } from "react";
import { attemptMove, isStageComplete } from "../game/puzzleEngine";
import type { Direction, PuzzleCell, PuzzlePart, PuzzleStage } from "../game/types";
import { Robot } from "./Robot";
import { SlidingToken } from "./SlidingToken";
import { useDirectionInput } from "../game/useDirectionInput";
import "../styles/scene.css";
import "./PuzzleScene.css";

interface PuzzleSceneProps {
  stage: PuzzleStage;
  onCleared: () => void;
}

type Segment =
  | { type: "wall"; label: string; col: number; row: number; span: number }
  | { type: "blank" | "floor"; col: number; row: number; answer?: string };

function buildSegments(cells: PuzzleCell[][]): Segment[] {
  const segments: Segment[] = [];
  cells.forEach((row, y) => {
    let x = 0;
    while (x < row.length) {
      const cell = row[x];
      if (cell.kind === "wall") {
        let end = x;
        while (end < row.length && row[end].kind === "wall" && row[end].label === cell.label) end++;
        segments.push({ type: "wall", label: cell.label ?? "", col: x, row: y, span: end - x });
        x = end;
      } else {
        segments.push({ type: cell.kind, col: x, row: y, answer: cell.answer });
        x++;
      }
    }
  });
  return segments;
}

const CELL = 48;
const GAP = 4;
const CLEAR_DELAY_MS = 1100;

export function PuzzleScene({ stage, onCleared }: PuzzleSceneProps) {
  const [parts, setParts] = useState<PuzzlePart[]>(stage.parts);
  const [robot, setRobot] = useState(stage.robotStart);
  const [facing, setFacing] = useState<Direction>("up");
  const [bump, setBump] = useState<"push" | "deny" | null>(null);
  const [pushedPartId, setPushedPartId] = useState<string | null>(null);
  const [actionSeq, setActionSeq] = useState(0);
  const [cleared, setCleared] = useState(false);

  const segments = useMemo(() => buildSegments(stage.cells), [stage]);

  useDirectionInput((direction) => {
    if (cleared) return;
    setFacing(direction);
    setActionSeq((seq) => seq + 1);

    const result = attemptMove(stage, parts, robot, direction);
    if (!result.moved) {
      setBump("deny");
      setPushedPartId(null);
      return;
    }

    const movedPart = parts.find(
      (part, i) => part.x !== result.parts[i].x || part.y !== result.parts[i].y,
    );
    setParts(result.parts);
    setRobot(result.robot);
    setBump(movedPart ? "push" : null);
    setPushedPartId(movedPart?.id ?? null);

    if (isStageComplete(stage, result.parts)) {
      setCleared(true);
      window.setTimeout(onCleared, CLEAR_DELAY_MS);
    }
  }, !cleared);

  const partAt = (x: number, y: number) => parts.find((part) => part.x === x && part.y === y);
  const isAdjacentToRobot = (x: number, y: number) =>
    Math.abs(robot.x - x) + Math.abs(robot.y - y) === 1;

  return (
    <div className="viewport">
      <div className="hud">
        <span>WORLD 1 - PRACTICE FIELD</span>
        <span className="pos">STAGE 01</span>
      </div>

      <div className="puzzle-stage grass-bg">
        <div className="puzzle-frame">
          <div className="puzzle-bg" />
          <div
            className="puzzle-grid"
            style={{
              gridTemplateColumns: `repeat(${stage.width}, ${CELL}px)`,
              gridTemplateRows: `repeat(${stage.height}, ${CELL}px)`,
            }}
          >
            {segments.map((segment) => {
              const style = {
                gridColumn: `${segment.col + 1} / span ${segment.type === "wall" ? segment.span : 1}`,
                gridRow: segment.row + 1,
              };

              if (segment.type === "wall") {
                return (
                  <div key={`${segment.col}-${segment.row}`} className="tok wall-cell" style={style}>
                    {segment.label}
                  </div>
                );
              }

              const { col, row } = segment;

              if (segment.type === "blank") {
                const filled = Boolean(partAt(col, row));
                const active = !filled && isAdjacentToRobot(col, row);
                const classes = ["blank-cell", filled ? "filled" : "", active ? "active" : ""]
                  .filter(Boolean)
                  .join(" ");
                return (
                  <div key={`${col}-${row}`} className={classes} style={style}>
                    <div className="blank-shape" />
                    {!filled && <span className="tok q">?</span>}
                  </div>
                );
              }

              return <div key={`${col}-${row}`} className="floor-cell" style={style} />;
            })}

            <div className="puzzle-token-layer" style={{ gridColumn: "1 / -1", gridRow: "1 / -1" }}>
              {parts.map((part) => (
                <SlidingToken
                  key={part.id}
                  x={part.x}
                  y={part.y}
                  cellSize={CELL}
                  gap={GAP}
                  heavy={part.id === pushedPartId}
                  squashPulse={part.id === pushedPartId ? actionSeq : 0}
                >
                  <span className="tok part-chip">{part.label}</span>
                </SlidingToken>
              ))}
              <SlidingToken
                x={robot.x}
                y={robot.y}
                cellSize={CELL}
                gap={GAP}
                heavy={bump === "push"}
                squashPulse={actionSeq}
              >
                <Robot facing={facing} bump={bump} size={26} />
              </SlidingToken>
            </div>
          </div>
        </div>
      </div>

      <div className="caption">
        <b>CONTROLS</b> arrow keys / WASD — walk into a part to push it; push it into a dashed slot to
        lock it in place. Fill every blank with the right part to run the code.
        {cleared ? " · CODE EXECUTED — nice work!" : ""}
      </div>
    </div>
  );
}
