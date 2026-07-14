import { useEffect, useRef } from "react";
import { NPC_ROWS, colorForNpc, type NpcMotif } from "./npcFrames";

const CELL_SIZE = 6;

export function NpcPortrait({ motif }: { motif: NpcMotif }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rows = NPC_ROWS[motif];
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
        const color = colorForNpc(char);
        if (!color) return;
        ctx.fillStyle = color;
        ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
      });
    });
  }, [motif, rows, width, height]);

  return <canvas ref={canvasRef} width={width} height={height} className="npc-portrait-canvas" />;
}
