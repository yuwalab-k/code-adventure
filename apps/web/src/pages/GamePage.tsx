import { useEffect, useState } from "react";
import { useMascot } from "../mascot/MascotContext";
import { GameMenu } from "../game/GameMenu";
import { MapView } from "../game/MapView";
import { ProblemListView } from "../problems/ProblemListView";
import { ProblemRoomView } from "../problems/ProblemRoomView";

type GameView = { type: "map" } | { type: "problemList" } | { type: "room"; problemId: string };

// The whole game (map, problem list, editor) lives at one URL — moving
// between them is a state change here, not a route change, so it never
// feels like navigating a website.
export function GamePage() {
  const [view, setView] = useState<GameView>({ type: "map" });
  const { setHideWidget } = useMascot();

  // The corner mascot widget would duplicate the in-scene companion sprite
  // that the map draws itself — hide it only there.
  useEffect(() => {
    setHideWidget(view.type === "map");
  }, [view.type, setHideWidget]);

  const backToMap = () => setView({ type: "map" });

  return (
    <main className="game-page">
      <GameMenu actions={[{ label: "問題一覧", onClick: () => setView({ type: "problemList" }) }]} />

      {view.type === "map" && <MapView onChallenge={(problemId) => setView({ type: "room", problemId })} />}
      {view.type === "problemList" && (
        <ProblemListView onSelect={(problemId) => setView({ type: "room", problemId })} onExit={backToMap} />
      )}
      {view.type === "room" && <ProblemRoomView problemId={view.problemId} onExit={backToMap} />}
    </main>
  );
}
