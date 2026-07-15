import { useState } from "react";
import { LESSONS } from "./lessons";
import { AlgoLabCanvas } from "./AlgoLabCanvas";
import { getClearedLessons, markLessonCleared } from "./lesson";

// Entry screen for the algorithm-understanding stage: a lesson list, then
// the maze+editor canvas for whichever lesson is selected. Deliberately
// decoupled from the main exploration map/GameView state machine — see
// the plan's Phase 5 note about connecting the two later.
export function AlgoLabView({ onExit }: { onExit: () => void }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [cleared, setCleared] = useState(() => getClearedLessons());

  const lesson = selectedId ? LESSONS.find((l) => l.id === selectedId) : undefined;

  if (lesson) {
    return (
      <AlgoLabCanvas
        key={lesson.id}
        lesson={lesson}
        onExit={() => setSelectedId(null)}
        onCleared={() => {
          markLessonCleared(lesson.id);
          setCleared(getClearedLessons());
        }}
      />
    );
  }

  return (
    <div className="algolab-list-view">
      <div className="panel-header">
        <p className="panel-title">アルゴリズム理解ステージ</p>
        <button className="panel-close" onClick={onExit}>
          マップにもどる
        </button>
      </div>
      <ul className="algolab-lesson-list">
        {LESSONS.map((l) => (
          <li key={l.id}>
            <button className="algolab-lesson-row" onClick={() => setSelectedId(l.id)}>
              <span className="algolab-lesson-title">{l.title}</span>
              <span className={`algolab-lesson-status ${cleared.has(l.id) ? "status-cleared" : "status-not_started"}`}>
                {cleared.has(l.id) ? "クリア済み" : "未挑戦"}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
