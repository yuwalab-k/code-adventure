import { useEffect, useRef } from "react";
import Phaser from "phaser";
import { WorldMapScene, type WorldMapNode } from "./WorldMapScene";

export function WorldMapCanvas({
  nodes,
  onEnterProblem,
}: {
  nodes: WorldMapNode[];
  onEnterProblem: (problemId: string) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);
  const onEnterRef = useRef(onEnterProblem);
  onEnterRef.current = onEnterProblem;

  useEffect(() => {
    if (!containerRef.current) return;

    const game = new Phaser.Game({
      type: Phaser.AUTO,
      width: 800,
      height: 480,
      parent: containerRef.current,
      backgroundColor: "#fbf9f5",
      pixelArt: true,
      physics: { default: "arcade", arcade: { gravity: { x: 0, y: 0 }, debug: false } },
      scene: [WorldMapScene],
    });

    game.registry.set("nodes", nodes);
    game.events.on("enter-problem", (problemId: string) => onEnterRef.current(problemId));

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

  return <div ref={containerRef} className="world-map-canvas" />;
}
