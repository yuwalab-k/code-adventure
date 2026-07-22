import { useState } from "react";
import { FieldScene } from "./components/FieldScene";
import { PuzzleScene } from "./components/PuzzleScene";
import { WobbleDefs } from "./components/WobbleDefs";
import { FIELD_STAGE_1, PUZZLE_STAGE_1 } from "./game/stage1";

type Scene = "field" | "puzzle";

function App() {
  const [scene, setScene] = useState<Scene>("field");
  const [repaired, setRepaired] = useState(false);

  return (
    <>
      <WobbleDefs />
      {scene === "field" ? (
        <FieldScene stage={FIELD_STAGE_1} repaired={repaired} onReachConsole={() => setScene("puzzle")} />
      ) : (
        <PuzzleScene
          stage={PUZZLE_STAGE_1}
          onCleared={() => {
            setRepaired(true);
            setScene("field");
          }}
        />
      )}
    </>
  );
}

export default App;
