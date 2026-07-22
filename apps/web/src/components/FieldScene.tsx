import { useEffect, useMemo, useRef, useState } from "react";
import { attemptFieldMove } from "../game/fieldEngine";
import type { Direction, FieldStage } from "../game/types";
import { FieldIcon } from "./FieldIcons";
import { Robot } from "./Robot";
import { SlidingToken } from "./SlidingToken";
import "../styles/scene.css";
import "./FieldScene.css";
import { useDirectionInput } from "../game/useDirectionInput";

interface FieldSceneProps {
  stage: FieldStage;
  repaired: boolean;
  onReachConsole: () => void;
}

const CELL = 64;

export function FieldScene({ stage, repaired, onReachConsole }: FieldSceneProps) {
  const [robot, setRobot] = useState(stage.start);
  const [facing, setFacing] = useState<Direction>("down");
  const [bump, setBump] = useState<"deny" | null>(null);
  const [actionSeq, setActionSeq] = useState(0);
  const [finished, setFinished] = useState(false);
  const consoleReachedRef = useRef(false);

  // Once the puzzle is solved, the broken tile actually becomes crossable.
  const resolvedStage = useMemo<FieldStage>(() => {
    if (!repaired) return stage;
    return {
      ...stage,
      cells: stage.cells.map((row) =>
        row.map((cell) => (cell.tile === "broken" ? { ...cell, tile: "path" as const } : cell)),
      ),
    };
  }, [stage, repaired]);

  useEffect(() => {
    if (robot.x === stage.console.x && robot.y === stage.console.y && !repaired && !consoleReachedRef.current) {
      consoleReachedRef.current = true;
      onReachConsole();
    }
    if (robot.x === stage.finish.x && robot.y === stage.finish.y && repaired) {
      setFinished(true);
    }
  }, [robot, stage, repaired, onReachConsole]);

  useDirectionInput((direction) => {
    setFacing(direction);
    setActionSeq((seq) => seq + 1);
    setRobot((current) => {
      const next = attemptFieldMove(resolvedStage, current, direction);
      setBump(next.x === current.x && next.y === current.y ? "deny" : null);
      return next;
    });
  }, true);

  return (
    <div className="viewport">
      <div className="hud">
        <span>WORLD 1 - PRACTICE FIELD</span>
        <span className="pos">STAGE 01{finished ? " - CLEAR" : ""}</span>
      </div>

      <div className="map-wrap">
        <div className="map" style={{ gridTemplateColumns: `repeat(${resolvedStage.width}, ${CELL}px)` }}>
          {resolvedStage.cells.map((row, y) =>
            row.map((cell, x) => {
              const tileClass =
                cell.tile === "console"
                  ? "console"
                  : cell.tile === "finish"
                    ? "finish"
                    : cell.tile === "broken"
                      ? "broken"
                      : cell.tile === "path"
                        ? "path"
                        : "";
              return (
                <div
                  key={`${x}-${y}`}
                  className={`cell ${tileClass} ${cell.tile === "grass" ? "grass-bg" : ""}`.trim()}
                >
                  {cell.object ? (
                    <FieldIcon kind={cell.object} />
                  ) : cell.tile === "console" ? (
                    <span className="goal-label">
                      FIX
                      <br />
                      HERE
                    </span>
                  ) : cell.tile === "finish" ? (
                    <span className="goal-label">GOAL</span>
                  ) : cell.tile === "broken" ? (
                    <span className="broken-mark" aria-hidden="true" />
                  ) : null}
                </div>
              );
            }),
          )}
        </div>
        <div className="field-token-layer">
          <SlidingToken x={robot.x} y={robot.y} cellSize={CELL} squashPulse={actionSeq}>
            <Robot facing={facing} bump={bump} size={30} />
          </SlidingToken>
        </div>
      </div>

      <div className="caption">
        <b>MAP</b> arrow keys / WASD to move · walk onto the dashed FIX HERE tile to repair the broken
        stretch ahead
        {repaired ? " · the road is repaired — walk the detour to reach the goal" : ""}
        {finished ? " · nice work, you reached the goal!" : ""}
      </div>
    </div>
  );
}
