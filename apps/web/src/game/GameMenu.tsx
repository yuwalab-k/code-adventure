import { useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { xpBarPercent } from "../lib/levels";

export interface GameMenuAction {
  label: string;
  onClick: () => void;
}

// Small corner button that opens a game-style pause menu, instead of a
// persistent webpage navbar sitting on top of the fullscreen canvas.
// Actions are plain callbacks (not <Link>s) — the whole game world lives
// under one URL, so moving between areas is a state change, not a route change.
export function GameMenu({ actions = [] }: { actions?: GameMenuAction[] }) {
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
            {actions.map((action) => (
              <button
                key={action.label}
                onClick={() => {
                  setOpen(false);
                  action.onClick();
                }}
              >
                {action.label}
              </button>
            ))}
            <button onClick={() => logout()}>ログアウト</button>
          </nav>
        </div>
      )}
    </>
  );
}
