import { useEffect, useRef } from "react";
import Phaser from "phaser";
import { RoomScene, type RoomSpot } from "./RoomScene";

export function RoomCanvas({
  spots,
  onEnterSpot,
  onExit,
}: {
  spots: RoomSpot[];
  onEnterSpot: (screen: string) => void;
  onExit: () => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);
  const onEnterSpotRef = useRef(onEnterSpot);
  onEnterSpotRef.current = onEnterSpot;
  const onExitRef = useRef(onExit);
  onExitRef.current = onExit;

  useEffect(() => {
    if (!containerRef.current) return;

    const game = new Phaser.Game({
      type: Phaser.AUTO,
      parent: containerRef.current,
      backgroundColor: "#000000",
      pixelArt: true,
      scale: {
        mode: Phaser.Scale.RESIZE,
        width: window.innerWidth,
        height: window.innerHeight,
      },
      physics: { default: "arcade", arcade: { gravity: { x: 0, y: 0 }, debug: false } },
      scene: [RoomScene],
    });

    game.registry.set("spots", spots);
    game.events.on("enter-spot", (screen: string) => onEnterSpotRef.current(screen));
    game.events.on("exit-room", () => onExitRef.current());

    gameRef.current = game;
    return () => {
      game.destroy(true);
      gameRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    gameRef.current?.registry.set("spots", spots);
  }, [spots]);

  return <div ref={containerRef} className="game-canvas-fullscreen" />;
}
