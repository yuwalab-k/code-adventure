import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { xpBarPercent } from "../lib/levels";

// Small corner button that opens a game-style pause menu, instead of a
// persistent webpage navbar sitting on top of the fullscreen canvas.
export function GameMenu({ extraLinks = [] }: { extraLinks?: { label: string; to: string }[] }) {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  if (!user) return null;

  return (
    <>
      <button className="game-menu-button" onClick={() => setOpen((v) => !v)}>
        {open ? "✕" : "☰"} Lv.{user.level}
      </button>

      {open && (
        <div className="game-menu-panel">
          <p className="game-menu-name">{user.displayName}</p>
          <div className="hud-xp-bar">
            <div className="hud-xp-fill" style={{ width: `${xpBarPercent(user.xp)}%` }} />
          </div>
          <p className="game-menu-stat">
            Lv.{user.level} / {user.coins} コイン
          </p>
          <nav className="game-menu-links">
            <Link to="/avatar" onClick={() => setOpen(false)}>
              アバター
            </Link>
            {extraLinks.map((link) => (
              <Link key={link.to} to={link.to} onClick={() => setOpen(false)}>
                {link.label}
              </Link>
            ))}
            <button onClick={() => logout()}>ログアウト</button>
          </nav>
        </div>
      )}
    </>
  );
}
