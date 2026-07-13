import { useEffect, useState } from "react";
import { useMascot } from "../mascot/MascotContext";
import { GameMenu } from "../game/GameMenu";
import { MapView } from "../game/MapView";
import { StoreView } from "../game/StoreView";
import { AvatarView } from "../game/AvatarView";
import { RoomView } from "../room/RoomView";

type GameView = { type: "map" } | { type: "room"; problemId: string } | { type: "store" } | { type: "avatar" };

// The whole game (map, problem rooms, store, avatar) lives at one URL —
// moving between them is a state change here, not a route change, so it
// never feels like navigating a website.
export function GamePage() {
  const [view, setView] = useState<GameView>({ type: "map" });
  const { setHideWidget } = useMascot();

  // The corner mascot widget would duplicate the in-scene companion sprite
  // that map/room already draw themselves — hide it only there.
  useEffect(() => {
    setHideWidget(view.type === "map" || view.type === "room");
  }, [view.type, setHideWidget]);

  const backToMap = () => setView({ type: "map" });

  return (
    <main className="game-page">
      <GameMenu actions={[{ label: "アバター", onClick: () => setView({ type: "avatar" }) }]} />

      {view.type === "map" && (
        <MapView
          onEnterProblem={(problemId) => setView({ type: "room", problemId })}
          onEnterStore={() => setView({ type: "store" })}
        />
      )}
      {view.type === "room" && <RoomView problemId={view.problemId} onExit={backToMap} />}
      {view.type === "store" && <StoreView onExit={backToMap} />}
      {view.type === "avatar" && <AvatarView onExit={backToMap} />}
    </main>
  );
}
