import { useState } from "react";
import { CheckpointQuiz, type CheckpointQuestion } from "./CheckpointQuiz";

// Groups the checkpoint questions for one screen (S2/S4/S6) into a single
// "small boss" fight: each correct answer is one hit, all correct = defeated.
export function SmallBossBattle({
  problemId,
  questions,
  alreadyDefeated,
}: {
  problemId: string;
  questions: CheckpointQuestion[];
  alreadyDefeated: boolean;
}) {
  const [defeatedIds, setDefeatedIds] = useState<Set<string>>(new Set());

  if (questions.length === 0) return null;

  if (alreadyDefeated) {
    return (
      <div className="small-boss defeated">
        <div className="boss-hp-bar">
          <div className="boss-hp-fill" style={{ width: "0%" }} />
        </div>
        <p>小ボスをたおした！</p>
      </div>
    );
  }

  const remaining = questions.filter((q) => !defeatedIds.has(q.id));
  const hpPercent = Math.round((remaining.length / questions.length) * 100);

  if (remaining.length === 0) {
    return (
      <div className="small-boss defeated">
        <div className="boss-hp-bar">
          <div className="boss-hp-fill" style={{ width: "0%" }} />
        </div>
        <p>小ボスをたおした！</p>
      </div>
    );
  }

  return (
    <div className="small-boss">
      <div className="boss-hp-bar">
        <div className="boss-hp-fill" style={{ width: `${hpPercent}%` }} />
      </div>
      <CheckpointQuiz
        key={remaining[0].id}
        question={remaining[0]}
        problemId={problemId}
        onDefeated={() => setDefeatedIds((prev) => new Set(prev).add(remaining[0].id))}
      />
    </div>
  );
}
