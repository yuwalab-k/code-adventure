import { Fragment, useEffect, useRef, useState } from "react";
import { CheckpointQuiz, type CheckpointQuestion } from "./CheckpointQuiz";
import { MonsterSprite } from "../monsters/MonsterSprite";
import type { MonsterVariant } from "../monsters/monsterFrames";

// Groups the checkpoint questions for one screen (S2/S4/S6) into a single
// "monster" fight: each correct answer is one hit, all correct = defeated.
// Renders only the fight content (sprite/HP/dialogue) — the caller is
// responsible for the surrounding centered battle-box/overlay.
export function SmallBossBattle({
  problemId,
  questions,
  alreadyDefeated,
  monsterIndex,
  monsterLabel,
  onAllDefeated,
}: {
  problemId: string;
  questions: CheckpointQuestion[];
  alreadyDefeated: boolean;
  monsterIndex: number;
  monsterLabel: string;
  onAllDefeated?: () => void;
}) {
  const [defeatedIds, setDefeatedIds] = useState<Set<string>>(new Set());
  const [shake, setShake] = useState(false);
  const prevRemaining = useRef(questions.length);
  const firedRef = useRef(false);

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

  // Auto-advance to the next monster shortly after a fresh defeat (not when
  // this screen is simply being revisited after already being cleared).
  useEffect(() => {
    if (alreadyDefeated || questions.length === 0 || firedRef.current) return;
    if (remaining.length === 0) {
      firedRef.current = true;
      const t = setTimeout(() => onAllDefeated?.(), 1700);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remaining.length, alreadyDefeated]);

  if (questions.length === 0) return null;

  const defeated = alreadyDefeated || remaining.length === 0;
  const variant = `m${((monsterIndex - 1) % 3) + 1}` as MonsterVariant;

  if (defeated) {
    return (
      <div className="monster-cleared">
        <MonsterSprite variant={variant} defeated />
        <p>{monsterLabel}をたおした！</p>
      </div>
    );
  }

  const hpPercent = Math.round((remaining.length / questions.length) * 100);

  return (
    <Fragment>
      <div className={`battle-monster-row ${shake ? "boss-shake" : ""}`}>
        <MonsterSprite variant={variant} />
        <div className="battle-monster-info">
          <p className="battle-monster-name">{monsterLabel}</p>
          <div className="boss-hp-bar">
            <div className="boss-hp-fill" style={{ width: `${hpPercent}%` }} />
          </div>
          <p className="boss-hp-label">
            のこりHP {remaining.length} / {questions.length}
          </p>
        </div>
      </div>
      <CheckpointQuiz
        key={remaining[0].id}
        question={remaining[0]}
        problemId={problemId}
        onDefeated={() => setDefeatedIds((prev) => new Set(prev).add(remaining[0].id))}
      />
    </Fragment>
  );
}
