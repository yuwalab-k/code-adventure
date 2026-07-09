import { useEffect, useRef, useState } from "react";
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
  const [shake, setShake] = useState(false);
  const prevRemaining = useRef(questions.length);

  const remaining = questions.filter((q) => !defeatedIds.has(q.id));

  useEffect(() => {
    if (remaining.length < prevRemaining.current) {
      setShake(true);
      const t = setTimeout(() => setShake(false), 350);
      prevRemaining.current = remaining.length;
      return () => clearTimeout(t);
    }
    prevRemaining.current = remaining.length;
  }, [remaining.length]);

  if (questions.length === 0) return null;

  const defeated = alreadyDefeated || remaining.length === 0;

  if (defeated) {
    return (
      <div className="small-boss defeated">
        <div className="boss-sprite defeated" />
        <div className="boss-hp-bar">
          <div className="boss-hp-fill" style={{ width: "0%" }} />
        </div>
        <p>小ボスをたおした！</p>
      </div>
    );
  }

  const hpPercent = Math.round((remaining.length / questions.length) * 100);

  return (
    <div className={`small-boss ${shake ? "boss-shake" : ""}`}>
      <div className="boss-sprite" />
      <div className="boss-hp-bar">
        <div className="boss-hp-fill" style={{ width: `${hpPercent}%` }} />
      </div>
      <p className="boss-hp-label">
        のこりHP {remaining.length} / {questions.length}
      </p>
      <CheckpointQuiz
        key={remaining[0].id}
        question={remaining[0]}
        problemId={problemId}
        onDefeated={() => setDefeatedIds((prev) => new Set(prev).add(remaining[0].id))}
      />
    </div>
  );
}
