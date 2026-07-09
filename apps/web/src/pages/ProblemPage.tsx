import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { apiFetch } from "../lib/api";
import { useMascot } from "../mascot/MascotContext";
import { useAuth } from "../auth/AuthContext";
import { PROBLEM_SCREEN_TIPS } from "../mascot/sceneTips";
import { xpBarPercent } from "../lib/levels";
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

interface ProgressRow {
  screen: Screen;
  status: "not_started" | "in_progress" | "completed";
}

interface ClearReward {
  xpGained: number;
  coinsGained: number;
  itemGranted: boolean;
}

interface ClearBigBossResponse {
  cleared: boolean;
  alreadyCleared: boolean;
  xpGained: number;
  coinsGained: number;
  level: number;
  leveledUp: boolean;
  itemGranted: boolean;
}

const BOSS_SCREENS: Screen[] = ["s2", "s4", "s6", "s7"];
const MONSTER_INDEX: Record<string, number> = { s2: 1, s4: 2, s6: 3, s7: 4 };
const MONSTER_LABEL: Record<string, string> = { s2: "モンスター1", s4: "モンスター2", s6: "モンスター3", s7: "ラスボス" };

export function ProblemPage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const { say } = useMascot();
  const { user, refreshUser } = useAuth();
  const [screen, setScreen] = useState<Screen>("s1");
  const [levelUpFlash, setLevelUpFlash] = useState(false);
  const [clearReward, setClearReward] = useState<ClearReward | null>(null);

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

  const { data: progressData } = useQuery({
    queryKey: ["progress", id],
    queryFn: () => apiFetch<{ progress: ProgressRow[] }>(`/progress/${id}`),
    enabled: !!id,
  });

  const markProgress = useMutation({
    mutationFn: (params: { screen: Screen; status: "in_progress" | "completed" }) =>
      apiFetch(`/progress/${id}/${params.screen}`, {
        method: "PUT",
        body: JSON.stringify({ status: params.status }),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["progress", id] }),
  });

  useEffect(() => {
    if (!id) return;
    say(PROBLEM_SCREEN_TIPS[screen]);
    markProgress.mutate({ screen, status: "in_progress" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen, id]);

  const visited = new Set((progressData?.progress ?? []).map((p) => p.screen));

  // 小ボス3体+大ボスは、倒すまでは次の画面に進めない。
  // それ以外の画面(問題文・可視化・速度比較)には勝敗がないので通過するだけでよい。
  function isBossDefeated(s: Screen): boolean {
    if (s === "s2" || s === "s4" || s === "s6") return bossStatus?.smallBosses[s].defeated ?? false;
    return bossStatus?.bigBoss.defeated ?? false;
  }

  function isLocked(s: Screen): boolean {
    const idx = SCREENS.indexOf(s);
    for (let i = 0; i < idx; i++) {
      const prior = SCREENS[i];
      if (BOSS_SCREENS.includes(prior) && !isBossDefeated(prior)) return true;
    }
    return false;
  }

  function goTo(next: Screen) {
    if (isLocked(next)) return;
    markProgress.mutate({ screen, status: "completed" });
    setScreen(next);
  }

  async function markBigBossDefeated() {
    const res = await apiFetch<ClearBigBossResponse>(`/problems/${id}/clear-big-boss`, { method: "POST" });
    queryClient.invalidateQueries({ queryKey: ["boss-status", id] });
    queryClient.invalidateQueries({ queryKey: ["map"] });
    await refreshUser();
    if (!res.alreadyCleared) {
      setClearReward({ xpGained: res.xpGained, coinsGained: res.coinsGained, itemGranted: res.itemGranted });
      if (res.leveledUp) {
        setLevelUpFlash(true);
        setTimeout(() => setLevelUpFlash(false), 2600);
      }
    }
  }

  if (isLoading) return <main>よみこみちゅう...</main>;
  if (error || !data) return <main>読み込みに失敗しました</main>;

  const { problem, samples, solutions, badSolutions, explanationCards, checkpointQuestions, tags } = data;
  const cardsFor = (s: string) => explanationCards.filter((c) => c.screen === s);
  const questionsFor = (s: string) => checkpointQuestions.filter((q) => q.screen === s);
  const s7Unlocked = bossStatus?.bigBoss.unlocked ?? false;

  const currentIndex = SCREENS.indexOf(screen);
  const nextScreen = SCREENS[currentIndex + 1];
  const canAdvance = !!nextScreen && !isLocked(nextScreen);

  const isBossScreen = BOSS_SCREENS.includes(screen);

  return (
    <main className="problem-page">
      <Link to="/map" className="exit-door">
        <span className="exit-door-icon" />
        出口
      </Link>

      {user && (
        <div className="hud-bar">
          <span className="hud-level">Lv.{user.level}</span>
          <div className="hud-xp-bar">
            <div className="hud-xp-fill" style={{ width: `${xpBarPercent(user.xp)}%` }} />
          </div>
          <span className="hud-coins">{user.coins} コイン</span>
        </div>
      )}

      <h1>{problem.title}</h1>
      <p>
        ★{problem.difficulty} {tags.map((t) => t.name).join(" / ")}
      </p>

      {levelUpFlash && <div className="level-up-banner">LEVEL UP! Lv.{user?.level}</div>}

      {clearReward && (
        <div className="clear-reward-toast">
          <p>この問題をクリアした!</p>
          <p>
            +{clearReward.xpGained} XP / +{clearReward.coinsGained} コイン
            {clearReward.itemGranted && " / アイテム獲得!"}
          </p>
          <button onClick={() => setClearReward(null)}>とじる</button>
        </div>
      )}

      <nav className="stage-path">
        {SCREENS.map((s, i) => {
          const locked = isLocked(s);
          const isBoss = BOSS_SCREENS.includes(s);
          const cleared = isBoss ? isBossDefeated(s) : visited.has(s) && s !== screen;
          const status = locked ? "locked" : s === screen ? "current" : cleared ? "cleared" : "open";
          return (
            <div className="stage-node-wrap" key={s}>
              {i > 0 && <div className={`stage-link ${locked ? "locked" : ""}`} />}
              <button
                className={`stage-node ${status} ${isBoss ? "boss" : ""}`}
                disabled={locked}
                onClick={() => goTo(s)}
                title={SCREEN_LABELS[s]}
              >
                {i + 1}
              </button>
              <span className="stage-node-label">
                {SCREEN_LABELS[s]}
                {isBoss && <em className="boss-tag">{MONSTER_LABEL[s]}</em>}
              </span>
            </div>
          );
        })}
      </nav>

      <div key={screen} className={`screen-panel ${isBossScreen ? "boss-panel" : ""}`}>
      {screen === "s1" && (
        <section>
          <p className="room-intro">
            この部屋には4体のモンスターがいる。ひとつずつたおして、さいごの部屋を目指そう。
          </p>
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
            monsterIndex={MONSTER_INDEX.s2}
            monsterLabel={MONSTER_LABEL.s2}
            onAllDefeated={() => goTo("s3")}
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
            monsterIndex={MONSTER_INDEX.s4}
            monsterLabel={MONSTER_LABEL.s4}
            onAllDefeated={() => goTo("s5")}
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
            monsterIndex={MONSTER_INDEX.s6}
            monsterLabel={MONSTER_LABEL.s6}
            onAllDefeated={() => goTo("s7")}
          />
        </section>
      )}

      {screen === "s7" && (
        <section>
          {!s7Unlocked && <p>モンスター1〜3をたおすと、{MONSTER_LABEL.s7}があらわれるよ。</p>}
          {s7Unlocked && !bossStatus?.bigBoss.defeated && (
            <div className="battle-overlay">
              <div className="battle-box">
                <div className="battle-monster-row">
                  <div className="boss-sprite final" />
                  <div className="battle-monster-info">
                    <p className="battle-monster-name">{MONSTER_LABEL.s7}</p>
                  </div>
                </div>
                <div className="monster-dialogue">
                  <p>この問題専用の体験演習は準備中です。</p>
                </div>
                <div className="checkpoint-choices">
                  <button onClick={markBigBossDefeated}>
                    <span className="choice-cursor">▶</span> たたかう(仮)
                  </button>
                </div>
              </div>
            </div>
          )}
          {bossStatus?.bigBoss.defeated && (
            <div className="monster-cleared">
              <div className="boss-sprite defeated final" />
              <p>{MONSTER_LABEL.s7}をたおした！この部屋はクリア済みです。</p>
            </div>
          )}
        </section>
      )}
      </div>

      {nextScreen && (
        <div className="stage-advance">
          <button className="next-button" disabled={!canAdvance} onClick={() => goTo(nextScreen)}>
            つぎへ({SCREEN_LABELS[nextScreen]})
          </button>
          {!canAdvance && <p className="stage-advance-hint">小ボスをたおすと次に進めるよ。</p>}
        </div>
      )}
    </main>
  );
}
