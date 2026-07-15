import { useEffect, useRef } from "react";
import Phaser from "phaser";
import { AlgoLabScene, GAME_WIDTH, GAME_HEIGHT, CODE_BOX } from "./AlgoLabScene";
import type { AlgoLesson } from "./lesson";
import type { RunResult } from "./algolabWorker";

// Full-canvas approach: the maze, code text, cursor and buttons are all
// Phaser objects drawn on one <canvas> (see AlgoLabScene) — this component
// only mounts an invisible <textarea> in the same spot as the rendered
// code box, purely to capture real keystrokes/IME/copy-paste from the
// browser, and mirrors its value+cursor into the scene on every change.
// This is the plan's Phase 3 "prototype the input mirroring first" bet.
export function AlgoLabCanvas({
  lesson,
  onExit,
  onCleared,
}: {
  lesson: AlgoLesson;
  onExit: () => void;
  onCleared: () => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);
  const workerRef = useRef<Worker | null>(null);
  const runIdRef = useRef(0);
  const onExitRef = useRef(onExit);
  onExitRef.current = onExit;
  const onClearedRef = useRef(onCleared);
  onClearedRef.current = onCleared;

  useEffect(() => {
    if (!containerRef.current) return;

    const game = new Phaser.Game({
      type: Phaser.AUTO,
      parent: containerRef.current,
      width: GAME_WIDTH,
      height: GAME_HEIGHT,
      backgroundColor: "#2b1f18",
      pixelArt: true,
      scene: [AlgoLabScene],
    });

    game.registry.set("lesson", lesson);
    game.registry.set("code", { text: lesson.starterCode, cursor: lesson.starterCode.length });

    game.events.on("algolab-exit", () => onExitRef.current());
    game.events.on("algolab-run-requested", (code: string) => runCode(code));

    gameRef.current = game;
    const worker = new Worker(new URL("./algolabWorker.ts", import.meta.url), { type: "module" });
    workerRef.current = worker;

    return () => {
      worker.terminate();
      game.destroy(true);
      gameRef.current = null;
      workerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lesson.id]);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.value = lesson.starterCode;
    textarea.focus();
    gameRef.current?.registry.set("code", { text: lesson.starterCode, cursor: lesson.starterCode.length });
  }, [lesson.id, lesson.starterCode]);

  function syncCode() {
    const textarea = textareaRef.current;
    const game = gameRef.current;
    if (!textarea || !game) return;
    game.registry.set("code", { text: textarea.value, cursor: textarea.selectionStart ?? textarea.value.length });
  }

  function runCode(code: string) {
    const worker = workerRef.current;
    const game = gameRef.current;
    if (!worker || !game) return;
    const id = String(++runIdRef.current);
    const handleMessage = (event: MessageEvent<RunResult>) => {
      if (event.data.id !== id) return;
      worker.removeEventListener("message", handleMessage);
      const scene = game.scene.getScene("AlgoLabScene") as AlgoLabScene;
      void scene.playResult(event.data).then(() => {
        if (event.data.status === "clear") onClearedRef.current();
      });
    };
    worker.addEventListener("message", handleMessage);
    worker.postMessage({ id, code, gridRows: lesson.grid, startFacing: lesson.startFacing });
  }

  return (
    <div className="algolab-canvas-page">
      <div ref={containerRef} className="algolab-canvas-host" style={{ width: GAME_WIDTH, height: GAME_HEIGHT }}>
        <textarea
          ref={textareaRef}
          className="algolab-hidden-input"
          style={{
            left: CODE_BOX.x + 8,
            top: CODE_BOX.y + 8,
            width: CODE_BOX.width - 16,
            height: CODE_BOX.height - 16,
          }}
          spellCheck={false}
          onInput={syncCode}
          onKeyDown={() => requestAnimationFrame(syncCode)}
          onClick={syncCode}
          onSelect={syncCode}
        />
      </div>
    </div>
  );
}
