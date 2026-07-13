import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "../lib/api";
import { useMascot } from "../mascot/MascotContext";
import { MAP_TIPS } from "../mascot/sceneTips";
import { WorldMapCanvas } from "../worldmap/WorldMapCanvas";
import type { WorldMapNode } from "../worldmap/WorldMapScene";
import { DojoPanel } from "./DojoPanel";

interface MapResponse {
  player: { level: number; xp: number; coins: number };
  nodes: WorldMapNode[];
}

export function MapView({
  onEnterProblem,
  onEnterStore,
}: {
  onEnterProblem: (problemId: string) => void;
  onEnterStore: () => void;
}) {
  const { say } = useMascot();
  const [dojoOpen, setDojoOpen] = useState(false);
  const { data, isLoading } = useQuery({
    queryKey: ["map"],
    queryFn: () => apiFetch<MapResponse>("/map"),
  });

  useEffect(() => {
    say(MAP_TIPS[Math.floor(Math.random() * MAP_TIPS.length)]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {isLoading && <p className="game-loading">よみこみちゅう...</p>}

      {data && (
        <WorldMapCanvas
          nodes={data.nodes}
          onEnterProblem={onEnterProblem}
          onEnterStore={onEnterStore}
          onEnterDojo={() => setDojoOpen(true)}
        />
      )}

      {dojoOpen && <DojoPanel onClose={() => setDojoOpen(false)} />}
    </>
  );
}
