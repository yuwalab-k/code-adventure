import { useEffect, useRef, useState } from "react";
import { MASCOT_FRAMES, colorFor } from "./frames";
import { MASCOT_TRIVIA } from "./trivia";
import { useMascot } from "./MascotContext";

const CELL_SIZE = 8;
const GRID_SIZE = 10;
const CANVAS_SIZE = CELL_SIZE * GRID_SIZE;

type Trick = "dash-left" | "dash-up" | "spin" | "dance" | null;

function randomTrivia(): string {
  return MASCOT_TRIVIA[Math.floor(Math.random() * MASCOT_TRIVIA.length)];
}

export function Mascot() {
  const { mood, message, hideWidget } = useMascot();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [blinking, setBlinking] = useState(false);
  const [trick, setTrick] = useState<Trick>(null);
  const [speech, setSpeech] = useState<string | null>(null);
  const [bigCenter, setBigCenter] = useState(false);

  useEffect(() => {
    if (mood !== "idle") return;
    const interval = setInterval(() => {
      setBlinking(true);
      setTimeout(() => setBlinking(false), 150);
    }, 3000);
    return () => clearInterval(interval);
  }, [mood]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (mood === "idle" && Math.random() < 0.4) triggerTrick();
    }, 24000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mood]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const frameMood = mood === "idle" && blinking ? "blink" : mood;
    const frame = MASCOT_FRAMES[frameMood];
    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    frame.forEach((row, y) => {
      [...row].forEach((char, x) => {
        const color = colorFor(char, mood);
        if (!color) return;
        ctx.fillStyle = color;
        ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
      });
    });
  }, [mood, blinking]);

  function triggerTrick() {
    if (message) return;

    if (Math.random() < 0.08) {
      setBigCenter(true);
      setSpeech(randomTrivia());
      setTimeout(() => {
        setBigCenter(false);
        setSpeech(null);
      }, 3200);
      return;
    }

    const tricks: Exclude<Trick, null>[] = ["dash-left", "dash-up", "spin", "dance"];
    const roll = Math.floor(Math.random() * 5);
    if (roll === 4) {
      setSpeech(randomTrivia());
      setTimeout(() => setSpeech(null), 3000);
      return;
    }
    const chosen = tricks[roll];
    setTrick(chosen);
    const duration = chosen === "spin" ? 1200 : chosen === "dash-up" ? 1000 : chosen === "dash-left" ? 1100 : 900;
    setTimeout(() => setTrick(null), duration);
  }

  const displayedMessage = message ?? speech;

  if (hideWidget) return null;

  return (
    <div className={`mascot-wrap${bigCenter ? " center" : ""}${trick ? ` trick-${trick}` : ""}`}>
      {displayedMessage && <div className="mascot-speech">{displayedMessage}</div>}
      <canvas
        ref={canvasRef}
        width={CANVAS_SIZE}
        height={CANVAS_SIZE}
        onClick={triggerTrick}
        className="mascot-canvas"
      />
    </div>
  );
}
