import type { CSSProperties } from "react";
import type { Direction } from "../game/types";
import "./Robot.css";

type RobotStyle = CSSProperties & { "--mirror"?: number };

interface RobotProps {
  facing: Direction;
  bump?: "push" | "deny" | null;
  size?: number;
}

// Robot body is mid-gray, not ink — the fixed code text and pushable parts
// are all ink-black, so the robot needs its own color to read clearly
// against them (eyes/details stay ink-black, same as the text).
const BODY = "#8a9098";
const DETAIL = "#1c1c1c";

function FrontBack({ back }: { back: boolean }) {
  return (
    <>
      <g fill={BODY}>
        <rect x="6" y="0" width="2" height="1" />
        <rect x="2" y="1" width="10" height="8" />
        <rect x="3" y="9" width="8" height="4" />
        <rect x="3" y="13" width="3" height="2" />
        <rect x="8" y="13" width="3" height="2" />
      </g>
      <g fill={DETAIL}>
        {back ? (
          <rect x="5" y="3" width="4" height="1" />
        ) : (
          <>
            <rect x="4.5" y="4" width="2" height="2.6" />
            <rect x="7.5" y="4" width="2" height="2.6" />
          </>
        )}
      </g>
    </>
  );
}

function Side() {
  return (
    <>
      <g fill={BODY}>
        <rect x="9" y="0" width="2" height="1" />
        <rect x="2" y="1" width="10" height="8" />
        <rect x="3" y="9" width="8" height="4" />
        <rect x="3" y="13" width="3" height="2" />
        <rect x="7" y="13" width="3" height="2" />
      </g>
      <g fill={DETAIL}>
        <rect x="9" y="4" width="2" height="2.6" />
      </g>
    </>
  );
}

export function Robot({ facing, bump = null, size = 32 }: RobotProps) {
  const mirror = facing === "left";
  return (
    <svg
      className={`robot-sprite${bump ? ` robot-sprite--${bump}` : ""}`}
      viewBox="0 0 14 16"
      width={size}
      height={(size * 16) / 14}
      filter="url(#wobble-scribble)"
      style={{ "--mirror": mirror ? -1 : 1 } as RobotStyle}
      aria-label={`robot facing ${facing}`}
    >
      {facing === "down" && <FrontBack back={false} />}
      {facing === "up" && <FrontBack back={true} />}
      {(facing === "right" || facing === "left") && <Side />}
    </svg>
  );
}
