import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { apiFetch } from "../lib/api";
import { useMascot } from "../mascot/MascotContext";
import { PROBLEM_SCREEN_TIPS } from "../mascot/sceneTips";
import { ExplanationCarousel, type ExplanationCard } from "../problems/ExplanationCarousel";
import { SmallBossBattle } from "../problems/SmallBossBattle";
import type { CheckpointQuestion } from "../problems/CheckpointQuiz";

const SCREENS = ["s1", "s2", "s3", "s4", "s5", "s6", "s7"] as const;
type Screen = (typeof SCREENS)[number];

const SCREEN_LABELS: Record<Screen, string> = {
  s1: "問題",
  s2: "解説",
  s3: "確認",
  s4: "間違い",
  s5: "速度比較",
  s6: "正解",
  s7: "体験",
};

interface Problem {
  id: string;
  title: string;
  atcoderUrl: string;
  difficulty: number;
  statementMd: string;
  constraintsMd: string;
  statementNoteMd: string | null;
}

interface Sample {
  id: string;
  position: number;
  input: string;
  output: string;
  explanationMd: string | null;
}

interface Solution {
  id: string;
  language: string;
  code: string;
}

interface BadSolution {
  id: string;
  language: string;
  label: string;
  code: string;
}

interface Tag {
  id: string;
  name: string;
}

interface ProblemDetail {
  problem: Problem;
  samples: Sample[];
  solutions: Solution[];
  badSolutions: BadSolution[];
  explanationCards: ExplanationCard[];
  checkpointQuestions: CheckpointQuestion[];
  tags: Tag[];
}

interface BossStatus {
  smallBosses: Record<"s2" | "s4" | "s6", { defeated: boolean; totalQuestions: number }>;
  bigBoss: { defeated: boolean; unlocked: boolean };
  cleared: boolean;
}

export function ProblemPage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const { say } = useMascot();
  const [screen, setScreen] = useState<Screen>("s1");

  const { data, isLoading, error } = useQuery({
    queryKey: ["problem", id],
    queryFn: () => apiFetch<ProblemDetail>(`/problems/${id}`),
    enabled: !!id,
  });

  const { data: bossStatus } = useQuery({
    queryKey: ["boss-status", id],
    queryFn: () => apiFetch<BossStatus>(`/problems/${id}/boss-status`),
    enabled: !!id,
  });

  const markProgress = useMutation({
    mutationFn: (params: { screen: Screen; status: "in_progress" | "completed" }) =>
      apiFetch(`/progress/${id}/${params.screen}`, {
        method: "PUT",
        body: JSON.stringify({ status: params.status }),
      }),
  });

  useEffect(() => {
    if (!id) return;
    say(PROBLEM_SCREEN_TIPS[screen]);
    markProgress.mutate({ screen, status: "in_progress" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen, id]);

  function goTo(next: Screen) {
    markProgress.mutate({ screen, status: "completed" });
    setScreen(next);
  }

  async function markBigBossDefeated() {
    await apiFetch(`/progress/${id}/s7`, { method: "PUT", body: JSON.stringify({ status: "completed" }) });
    queryClient.invalidateQueries({ queryKey: ["boss-status", id] });
    queryClient.invalidateQueries({ queryKey: ["map"] });
  }

  if (isLoading) return <main>よみこみちゅう...</main>;
  if (error || !data) return <main>読み込みに失敗しました</main>;

  const { problem, samples, solutions, badSolutions, explanationCards, checkpointQuestions, tags } = data;
  const cardsFor = (s: string) => explanationCards.filter((c) => c.screen === s);
  const questionsFor = (s: string) => checkpointQuestions.filter((q) => q.screen === s);
  const s7Unlocked = bossStatus?.bigBoss.unlocked ?? false;

  return (
    <main className="problem-page">
      <Link to="/map">← マップへ戻る</Link>
      <h1>{problem.title}</h1>
      <p>
        ★{problem.difficulty} {tags.map((t) => t.name).join(" / ")}
      </p>

      <nav className="problem-tabs">
        {SCREENS.map((s) => (
          <button
            key={s}
            className={`${screen === s ? "active" : ""} ${s === "s7" && !s7Unlocked ? "locked" : ""}`}
            onClick={() => goTo(s)}
          >
            {SCREEN_LABELS[s]}
          </button>
        ))}
      </nav>

      {screen === "s1" && (
        <section>
          <p style={{ whiteSpace: "pre-wrap" }}>{problem.statementMd}</p>
          <h3>制約</h3>
          <p style={{ whiteSpace: "pre-wrap" }}>{problem.constraintsMd}</p>
          {problem.statementNoteMd && (
            <>
              <h3>かんたん解説</h3>
              <p style={{ whiteSpace: "pre-wrap" }}>{problem.statementNoteMd}</p>
            </>
          )}
          <h3>サンプル</h3>
          {samples.map((sample) => (
            <div className="sample-box" key={sample.id}>
              <pre>入力: {sample.input}</pre>
              <pre>出力: {sample.output}</pre>
              {sample.explanationMd && <p>{sample.explanationMd}</p>}
            </div>
          ))}
          <a href={problem.atcoderUrl} target="_blank" rel="noreferrer">
            AtCoderで見る
          </a>
        </section>
      )}

      {screen === "s2" && (
        <section>
          <ExplanationCarousel cards={cardsFor("s2")} />
          <SmallBossBattle
            problemId={id!}
            questions={questionsFor("s2")}
            alreadyDefeated={bossStatus?.smallBosses.s2.defeated ?? false}
          />
        </section>
      )}

      {screen === "s3" && (
        <section>
          <p>この問題専用のステップ可視化は準備中です。</p>
        </section>
      )}

      {screen === "s4" && (
        <section>
          <ExplanationCarousel cards={cardsFor("s4")} />
          {badSolutions.map((bad) => (
            <div key={bad.id}>
              <p>{bad.label}</p>
              <pre className="code-box">{bad.code}</pre>
            </div>
          ))}
          <SmallBossBattle
            problemId={id!}
            questions={questionsFor("s4")}
            alreadyDefeated={bossStatus?.smallBosses.s4.defeated ?? false}
          />
        </section>
      )}

      {screen === "s5" && (
        <section>
          <p>速度比較は準備中です。</p>
        </section>
      )}

      {screen === "s6" && (
        <section>
          <ExplanationCarousel cards={cardsFor("s6")} />
          {solutions.map((sol) => (
            <div key={sol.id}>
              <p>{sol.language}</p>
              <pre className="code-box">{sol.code}</pre>
            </div>
          ))}
          <SmallBossBattle
            problemId={id!}
            questions={questionsFor("s6")}
            alreadyDefeated={bossStatus?.smallBosses.s6.defeated ?? false}
          />
        </section>
      )}

      {screen === "s7" && (
        <section>
          {!s7Unlocked && <p>小ボスを3体たおすと、大ボス戦に挑戦できるよ。</p>}
          {s7Unlocked && !bossStatus?.bigBoss.defeated && (
            <>
              <p>この問題専用の体験演習は準備中です。</p>
              <button onClick={markBigBossDefeated}>大ボスをたおす(仮)</button>
            </>
          )}
          {bossStatus?.bigBoss.defeated && <p>大ボスをたおした！この問題はクリア済みです。</p>}
        </section>
      )}
    </main>
  );
}
