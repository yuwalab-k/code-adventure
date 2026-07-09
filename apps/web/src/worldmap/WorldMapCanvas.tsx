import { useEffect, useRef } from "react";
import Phaser from "phaser";
import { WorldMapScene, type WorldMapNode } from "./WorldMapScene";

export function WorldMapCanvas({
  nodes,
  onEnterProblem,
  onEnterStore,
}: {
  nodes: WorldMapNode[];
  onEnterProblem: (problemId: string) => void;
  onEnterStore: () => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);
  const onEnterProblemRef = useRef(onEnterProblem);
  onEnterProblemRef.current = onEnterProblem;
  const onEnterStoreRef = useRef(onEnterStore);
  onEnterStoreRef.current = onEnterStore;

  useEffect(() => {
    if (!containerRef.current) return;

    const game = new Phaser.Game({
      type: Phaser.AUTO,
      parent: containerRef.current,
      backgroundColor: "#fbf9f5",
      pixelArt: true,
      scale: {
        mode: Phaser.Scale.RESIZE,
        width: window.innerWidth,
        height: window.innerHeight,
      },
      physics: { default: "arcade", arcade: { gravity: { x: 0, y: 0 }, debug: false } },
      scene: [WorldMapScene],
    });

    game.registry.set("nodes", nodes);
    game.events.on("enter-problem", (problemId: string) => onEnterProblemRef.current(problemId));
    game.events.on("enter-store", () => onEnterStoreRef.current());

    gameRef.current = game;
    return () => {
      game.destroy(true);
      gameRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    gameRef.current?.registry.set("nodes", nodes);
  }, [nodes]);

  return <div ref={containerRef} className="game-canvas-fullscreen" />;
}
