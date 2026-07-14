import { useEffect, useRef } from "react";
import Phaser from "phaser";
import { WorldMapScene, type MapArea, type MapNpc } from "./WorldMapScene";

export function WorldMapCanvas({
  areas,
  npcs,
  onNpcNearby,
  onAreaChanged,
}: {
  areas: MapArea[];
  npcs: MapNpc[];
  onNpcNearby: (problemId: string | null) => void;
  onAreaChanged: (areaId: string | null) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);
  const onNpcNearbyRef = useRef(onNpcNearby);
  onNpcNearbyRef.current = onNpcNearby;
  const onAreaChangedRef = useRef(onAreaChanged);
  onAreaChangedRef.current = onAreaChanged;

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
      scene: [WorldMapScene],
    });

    game.registry.set("areas", areas);
    game.registry.set("npcs", npcs);
    game.events.on("npc-nearby", (problemId: string | null) => onNpcNearbyRef.current(problemId));
    game.events.on("area-changed", (areaId: string | null) => onAreaChangedRef.current(areaId));

    gameRef.current = game;
    return () => {
      game.destroy(true);
      gameRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    gameRef.current?.registry.set("areas", areas);
  }, [areas]);

  useEffect(() => {
    gameRef.current?.registry.set("npcs", npcs);
  }, [npcs]);

  return <div ref={containerRef} className="game-canvas-fullscreen" />;
}
