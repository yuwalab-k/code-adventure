import { useEffect, useRef, useState } from "react";
import { MASCOT_FRAMES, PALETTE } from "./frames";
import { MASCOT_TRIVIA } from "./trivia";
import { useMascot } from "./MascotContext";

const CELL_SIZE = 8;
const GRID_SIZE = 10;
const CANVAS_SIZE = CELL_SIZE * GRID_SIZE;

type Trick = "dash-left" | "dash-up" | "spin" | "dance" | null;

export function Mascot() {
  const { mood, message } = useMascot();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [blinking, setBlinking] = useState(false);
  const [trick, setTrick] = useState<Trick>(null);
  const [speech, setSpeech] = useState<string | null>(null);
  const [bigCenter, setBigCenter] = useState(false);

  // Idle blink, only while no mood override (happy/sad) is active.
  useEffect(() => {
    if (mood !== "idle") return;
    const interval = setInterval(() => {
      setBlinking(true);
      setTimeout(() => setBlinking(false), 150);
    }, 3000);
    return () => clearInterval(interval);
  }, [mood]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const frame = mood === "idle" && blinking ? MASCOT_FRAMES.blink : MASCOT_FRAMES[mood];
    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    frame.forEach((row, y) => {
      [...row].forEach((char, x) => {
        const color = PALETTE[char];
        if (!color || color === "transparent") return;
        ctx.fillStyle = color;
        ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
      });
    });
  }, [mood, blinking]);

  function handleClick() {
    if (message) return; // mood-driven speech takes priority

    // 8% chance of the "jump to center, say something" easter egg.
    if (Math.random() < 0.08) {
      const line = MASCOT_TRIVIA[Math.floor(Math.random() * MASCOT_TRIVIA.length)];
      setBigCenter(true);
      setSpeech(line);
      setTimeout(() => {
        setBigCenter(false);
        setSpeech(null);
      }, 2600);
      return;
    }

    if (Math.random() < 0.5) {
      const tricks: Trick[] = ["dash-left", "dash-up", "spin", "dance"];
      const chosen = tricks[Math.floor(Math.random() * tricks.length)];
      setTrick(chosen);
      setTimeout(() => setTrick(null), 600);
    } else {
      const line = MASCOT_TRIVIA[Math.floor(Math.random() * MASCOT_TRIVIA.length)];
      setSpeech(line);
      setTimeout(() => setSpeech(null), 2600);
    }
  }

  const displayedMessage = message ?? speech;

  return (
    <div className={`mascot-wrap${bigCenter ? " center" : ""}${trick ? ` trick-${trick}` : ""}`}>
      {displayedMessage && <div className="mascot-speech">{displayedMessage}</div>}
      <canvas
        ref={canvasRef}
        width={CANVAS_SIZE}
        height={CANVAS_SIZE}
        onClick={handleClick}
        className="mascot-canvas"
      />
    </div>
  );
}
