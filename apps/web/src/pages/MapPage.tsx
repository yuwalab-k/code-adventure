import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../lib/api";
import { useMascot } from "../mascot/MascotContext";
import { MAP_TIPS } from "../mascot/sceneTips";
import { WorldMapCanvas } from "../worldmap/WorldMapCanvas";
import type { WorldMapNode } from "../worldmap/WorldMapScene";
import { GameMenu } from "../game/GameMenu";
import { DojoPanel } from "../game/DojoPanel";

interface MapResponse {
  player: { level: number; xp: number; coins: number };
  nodes: WorldMapNode[];
}

export function MapPage() {
  const { say } = useMascot();
  const navigate = useNavigate();
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
    <main className="game-page">
      <GameMenu />

      {isLoading && <p className="game-loading">よみこみちゅう...</p>}

      {data && (
        <WorldMapCanvas
          nodes={data.nodes}
          onEnterProblem={(problemId) => navigate(`/problems/${problemId}`)}
          onEnterStore={() => navigate("/store")}
          onEnterDojo={() => setDojoOpen(true)}
        />
      )}

      {dojoOpen && <DojoPanel onClose={() => setDojoOpen(false)} />}
    </main>
  );
}
