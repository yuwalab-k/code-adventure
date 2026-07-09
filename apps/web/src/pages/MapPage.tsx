import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { apiFetch } from "../lib/api";
import { useAuth } from "../auth/AuthContext";
import { useMascot } from "../mascot/MascotContext";
import { MAP_TIPS } from "../mascot/sceneTips";

interface MapNode {
  id: string;
  title: string;
  difficulty: number;
  requiredLevel: number;
  locked: boolean;
  cleared: boolean;
}

interface MapResponse {
  player: { level: number; xp: number; coins: number };
  nodes: MapNode[];
}

export function MapPage() {
  const { user, logout } = useAuth();
  const { say } = useMascot();
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
          <Link to="/store">ストア</Link>
          {user?.role === "admin" && <Link to="/admin">管理</Link>}
          <button onClick={() => logout()}>ログアウト</button>
        </nav>
      </header>

      {isLoading && <p>よみこみちゅう...</p>}

      <ul className="map-node-list">
        {data?.nodes.map((node) => (
          <li key={node.id} className={node.locked ? "locked" : node.cleared ? "cleared" : "unlocked"}>
            {node.locked ? (
              <span>
                {node.title} (★{node.difficulty} / Lv.{node.requiredLevel}必要)
              </span>
            ) : (
              <Link to={`/problems/${node.id}`}>
                {node.title} {node.cleared ? "(クリア済み)" : ""}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </main>
  );
}
