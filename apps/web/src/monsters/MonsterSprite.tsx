import { useEffect, useRef } from "react";
import { MONSTER_ROWS, colorForMonster, type MonsterVariant } from "./monsterFrames";

const CELL_SIZE = 6;

export function MonsterSprite({ variant, defeated = false }: { variant: MonsterVariant; defeated?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rows = MONSTER_ROWS[variant];
  const width = rows[0].length * CELL_SIZE;
  const height = rows.length * CELL_SIZE;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);
    rows.forEach((row, y) => {
      [...row].forEach((char, x) => {
        const color = colorForMonster(char, variant);
        if (!color) return;
        ctx.fillStyle = color;
        ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
      });
    });
  }, [variant, rows, width, height]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className={`monster-sprite-canvas${defeated ? " defeated" : ""}`}
    />
  );
}
