import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { apiFetch } from "../lib/api";
import { useAuth } from "../auth/AuthContext";

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
  const { data, isLoading } = useQuery({
    queryKey: ["map"],
    queryFn: () => apiFetch<MapResponse>("/map"),
  });

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

      {/* Placeholder plaza — this becomes the Phaser world map (walk up to a
          door to enter) once the game canvas is built; for now, a simple list
          lets the rest of the stack (auth, progress, boss battles) be exercised. */}
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
