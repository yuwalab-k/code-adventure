import type { ReactNode } from "react";
import "./SlidingToken.css";

interface SlidingTokenProps {
  x: number;
  y: number;
  cellSize: number;
  gap?: number;
  heavy?: boolean; // slower, weightier settle — used when this token was just pushed
  squashPulse?: number; // bump this to replay the landing squash once
  children: ReactNode;
}

// Renders a token (robot or a pushable part) as an absolutely-positioned
// overlay that glides between grid cells instead of snapping, so movement
// reads as continuous rather than teleporting cell-to-cell.
export function SlidingToken({ x, y, cellSize, gap = 0, heavy = false, squashPulse = 0, children }: SlidingTokenProps) {
  const step = cellSize + gap;
  return (
    <div
      className={`sliding-token${heavy ? " sliding-token--heavy" : ""}`}
      style={{ width: cellSize, height: cellSize, transform: `translate(${x * step}px, ${y * step}px)` }}
    >
      <div className={`sliding-token-inner${heavy ? " sliding-token-inner--land" : ""}`} key={squashPulse}>
        {children}
      </div>
    </div>
  );
}
