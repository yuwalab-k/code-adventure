import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "../lib/api";
import { useMascot } from "../mascot/MascotContext";
import { MAP_TIPS, SCENE_TIPS } from "../mascot/sceneTips";
import { WorldMapCanvas } from "../worldmap/WorldMapCanvas";
import type { MapArea, MapNpc } from "../worldmap/WorldMapScene";
import { HUD } from "./HUD";
import { BottomPanel } from "./BottomPanel";
import { TalkWindow } from "../npc/TalkWindow";

interface MapResponse {
  player: { rating: number; xp: number; coins: number; clearedCount: number; totalCount: number };
  areas: MapArea[];
  npcs: MapNpc[];
}

export function MapView({ onChallenge }: { onChallenge: (problemId: string) => void }) {
  const { say } = useMascot();
  const [currentAreaName, setCurrentAreaName] = useState<string | null>(null);
  const [nearbyNpcId, setNearbyNpcId] = useState<string | null>(null);
  const { data, isLoading } = useQuery({
    queryKey: ["map"],
    queryFn: () => apiFetch<MapResponse>("/map"),
  });

  useEffect(() => {
    say(MAP_TIPS[Math.floor(Math.random() * MAP_TIPS.length)]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleAreaChanged(areaId: string | null) {
    const area = data?.areas.find((a) => a.id === areaId);
    setCurrentAreaName(area?.name ?? null);
  }

  function handleNpcNearby(problemId: string | null) {
    setNearbyNpcId(problemId);
    if (problemId) say(SCENE_TIPS.talk);
  }

  const nearbyNpc = data?.npcs.find((n) => n.id === nearbyNpcId) ?? null;

  return (
    <>
      {isLoading && <p className="game-loading">よみこみちゅう...</p>}

      {data && (
        <>
          <HUD
            locationName={currentAreaName}
            rating={data.player.rating}
            xp={data.player.xp}
            coins={data.player.coins}
            clearedCount={data.player.clearedCount}
            totalCount={data.player.totalCount}
          />
          <WorldMapCanvas
            areas={data.areas}
            npcs={data.npcs}
            onNpcNearby={handleNpcNearby}
            onAreaChanged={handleAreaChanged}
          />
          <BottomPanel>
            {nearbyNpc && <TalkWindow npc={nearbyNpc} onChallenge={() => onChallenge(nearbyNpc.id)} />}
          </BottomPanel>
        </>
      )}
    </>
  );
}
