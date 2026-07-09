import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { apiFetch } from "../lib/api";
import { useAuth } from "../auth/AuthContext";
import { useMascot } from "../mascot/MascotContext";
import { MAP_TIPS } from "../mascot/sceneTips";
import { WorldMapCanvas } from "../worldmap/WorldMapCanvas";
import type { WorldMapNode } from "../worldmap/WorldMapScene";

interface MapResponse {
  player: { level: number; xp: number; coins: number };
  nodes: WorldMapNode[];
}

export function MapPage() {
  const { user, logout } = useAuth();
  const { say } = useMascot();
  const navigate = useNavigate();
  const { data, isLoading } = useQuery({
    queryKey: ["map"],
    queryFn: () => apiFetch<MapResponse>("/map"),
  });

  useEffect(() => {
    say(MAP_TIPS[Math.floor(Math.random() * MAP_TIPS.length)]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="map-page">
      <header className="map-header">
        <div>
          <strong>{user?.displayName}</strong>
          <span> Lv.{data?.player.level ?? "..."}</span>
          <span> XP {data?.player.xp ?? "..."}</span>
          <span> コイン {data?.player.coins ?? "..."}</span>
        </div>
        <nav>
          <Link to="/avatar">アバター</Link>
          <button onClick={() => logout()}>ログアウト</button>
        </nav>
      </header>

      {isLoading && <p>よみこみちゅう...</p>}

      {data && (
        <WorldMapCanvas
          nodes={data.nodes}
          onEnterProblem={(problemId) => navigate(`/problems/${problemId}`)}
          onEnterStore={() => navigate("/store")}
        />
      )}
    </main>
  );
}
