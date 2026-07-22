import { useEffect, useRef } from "react";
import type { Direction } from "./types";

const KEY_TO_DIRECTION: Record<string, Direction> = {
  ArrowUp: "up",
  ArrowDown: "down",
  ArrowLeft: "left",
  ArrowRight: "right",
  w: "up",
  s: "down",
  a: "left",
  d: "right",
};

const MOVE_COOLDOWN_MS = 130;

// One grid step per key press, with a short cooldown so a held key still
// steps tile-by-tile instead of gliding continuously.
export function useDirectionInput(onMove: (direction: Direction) => void, enabled: boolean) {
  const lastMoveAt = useRef(0);
  const onMoveRef = useRef(onMove);
  onMoveRef.current = onMove;

  useEffect(() => {
    if (!enabled) return;

    function handleKeyDown(event: KeyboardEvent) {
      const direction = KEY_TO_DIRECTION[event.key];
      if (!direction) return;
      event.preventDefault();
      const now = performance.now();
      if (now - lastMoveAt.current < MOVE_COOLDOWN_MS) return;
      lastMoveAt.current = now;
      onMoveRef.current(direction);
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [enabled]);
}
