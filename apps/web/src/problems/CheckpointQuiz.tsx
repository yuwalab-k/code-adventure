import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "../lib/api";
import { useMascot } from "../mascot/MascotContext";
import { useAuth } from "../auth/AuthContext";

interface Choice {
  choiceId: number;
  text: string;
}

export interface CheckpointQuestion {
  id: string;
  screen: string;
  position: number;
  questionMd: string;
  choices: Choice[];
}

interface AnswerResponse {
  correct: boolean;
  explanationMd: string | null;
  reward: { xpGained: number; level: number; leveledUp: boolean } | null;
}

// The "small boss" battle: a comprehension check gating progress past
// S2/S4/S6 (see SPEC.md 4.3). Choices are already shuffled server-side and
// tagged with a stable choiceId — this component never sees the answer key.
export function CheckpointQuiz({
  question,
  problemId,
  onDefeated,
}: {
  question: CheckpointQuestion;
  problemId: string;
  onDefeated: () => void;
}) {
  const queryClient = useQueryClient();
  const { setMood } = useMascot();
  const { refreshUser } = useAuth();
  const [defeated, setDefeated] = useState(false);
  const [hint, setHint] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(false);
  const [hitFlash, setHitFlash] = useState<"hit" | "miss" | null>(null);
  const [xpGained, setXpGained] = useState(0);

  const mutation = useMutation({
    mutationFn: (choiceId: number) =>
      apiFetch<AnswerResponse>(`/checkpoints/${question.id}/answer`, {
        method: "POST",
        body: JSON.stringify({ choiceId }),
      }),
    onSuccess: (res) => {
      setHitFlash(res.correct ? "hit" : "miss");
      setTimeout(() => setHitFlash(null), 400);

      if (res.correct) {
        setDefeated(true);
        setHint(null);
        setMood("happy", "やった！せいかい！");
        if (res.reward) {
          setXpGained(res.reward.xpGained);
          refreshUser();
        }
        queryClient.invalidateQueries({ queryKey: ["boss-status", problemId] });
        onDefeated();
      } else {
        setHint(res.explanationMd);
        setMood("sad", "うーん、もう一回考えてみよう");
        // Brief cooldown so a student can't just click through every option
        // rapid-fire to find the right one by trial and error.
        setCooldown(true);
        setTimeout(() => setCooldown(false), 1500);
      }
    },
  });

  if (defeated) {
    return (
      <div className="checkpoint-quiz defeated boss-hit-flash">
        小ボスをたおした！
        {xpGained > 0 && <span className="xp-popup">+{xpGained} XP</span>}
      </div>
    );
  }

  return (
    <div className={`checkpoint-quiz ${hitFlash === "miss" ? "boss-miss-flash" : ""}`}>
      <p className="checkpoint-question">{question.questionMd}</p>
      <div className="checkpoint-choices">
        {question.choices.map((choice) => (
          <button
            key={choice.choiceId}
            disabled={mutation.isPending || cooldown}
            onClick={() => mutation.mutate(choice.choiceId)}
          >
            {choice.text}
          </button>
        ))}
      </div>
      {hint && <p className="checkpoint-hint">{hint}</p>}
    </div>
  );
}
