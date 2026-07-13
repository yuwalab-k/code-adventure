import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { apiFetch } from "../lib/api";
import { useMascot } from "../mascot/MascotContext";
import { useAuth } from "../auth/AuthContext";
import { PROBLEM_SCREEN_TIPS } from "../mascot/sceneTips";
import { ExplanationCarousel, type ExplanationCard } from "../problems/ExplanationCarousel";
import { SmallBossBattle } from "../problems/SmallBossBattle";
import type { CheckpointQuestion } from "../problems/CheckpointQuiz";
import { RoomCanvas } from "../room/RoomCanvas";
import type { RoomSpot } from "../room/RoomScene";
import { GameMenu } from "../game/GameMenu";
import { MonsterSprite } from "../monsters/MonsterSprite";

const SCREENS = ["s1", "s2", "s3", "s4", "s5", "s6", "s7"] as const;
type Screen = (typeof SCREENS)[number];

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
const SPOT_LABEL: Record<Screen, string> = {
  s1: "問題",
  s2: MONSTER_LABEL.s2,
  s3: "たしかめ",
  s4: MONSTER_LABEL.s4,
  s5: "速度比較",
  s6: MONSTER_LABEL.s6,
  s7: MONSTER_LABEL.s7,
};

export function ProblemPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { say } = useMascot();
  const { user, refreshUser } = useAuth();
  const [openSpot, setOpenSpot] = useState<Screen | null>(null);
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

  const visited = new Set((progressData?.progress ?? []).map((p) => p.screen));

  // 小ボス3体+大ボスは、倒すまでは先の部屋のモンスターに近づけない。
  // それ以外(問題文・可視化・速度比較)には勝敗がないので通過するだけでよい。
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

  function openSpotHandler(rawScreen: string) {
    const screen = rawScreen as Screen;
    if (isLocked(screen)) return;
    setOpenSpot(screen);
    say(PROBLEM_SCREEN_TIPS[screen]);
    markProgress.mutate({ screen, status: "in_progress" });
  }

  function closeSpot() {
    if (openSpot) markProgress.mutate({ screen: openSpot, status: "completed" });
    setOpenSpot(null);
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

  const spots: RoomSpot[] = SCREENS.map((s) => ({
    screen: s,
    kind: s === "s1" ? "plaque" : BOSS_SCREENS.includes(s) ? "monster" : "training",
    label: SPOT_LABEL[s],
    locked: isLocked(s),
    defeated: BOSS_SCREENS.includes(s) ? isBossDefeated(s) : visited.has(s),
  }));

  return (
    <main className="game-page">
      <GameMenu extraLinks={[{ label: "地図へ戻る", to: "/map" }]} />

      {levelUpFlash && <div className="level-up-banner">LEVEL UP! Lv.{user?.level}</div>}

      {clearReward && (
        <div className="clear-reward-toast">
          <p>この問題をクリアした!</p>
          <p>
            +{clearReward.xpGained} XP / +{clearReward.coinsGained} コイン
            {clearReward.itemGranted && " / アイテム獲得!"}
          </p>
          <button
            onClick={() => {
              setClearReward(null);
              closeSpot();
            }}
          >
            とじる
          </button>
        </div>
      )}

      <RoomCanvas spots={spots} onEnterSpot={openSpotHandler} onExit={() => navigate("/map")} />

      {openSpot === "s1" && (
        <div className="battle-overlay">
          <div className="battle-box">
            <div className="panel-header">
              <p className="battle-monster-name">{problem.title}</p>
              <button className="panel-close" onClick={closeSpot}>
                部屋にもどる
              </button>
            </div>
            <p>
              ★{problem.difficulty} {tags.map((t) => t.name).join(" / ")}
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
          </div>
        </div>
      )}

      {openSpot === "s2" && (
        <div className="battle-overlay">
          <div className="battle-box">
            <div className="panel-header">
              <p className="battle-monster-name">かいせつ</p>
              <button className="panel-close" onClick={closeSpot}>
                部屋にもどる
              </button>
            </div>
            {cardsFor("s2").length === 0 && questionsFor("s2").length === 0 && (
              <p>この問題はまだ準備中です。他の問題(typical90_a)で試してみてね。</p>
            )}
            <ExplanationCarousel cards={cardsFor("s2")} />
            <SmallBossBattle
              problemId={id!}
              questions={questionsFor("s2")}
              alreadyDefeated={bossStatus?.smallBosses.s2.defeated ?? false}
              monsterIndex={MONSTER_INDEX.s2}
              monsterLabel={MONSTER_LABEL.s2}
              onAllDefeated={closeSpot}
            />
          </div>
        </div>
      )}

      {openSpot === "s3" && (
        <div className="battle-overlay">
          <div className="battle-box">
            <div className="panel-header">
              <p className="battle-monster-name">たしかめ</p>
              <button className="panel-close" onClick={closeSpot}>
                部屋にもどる
              </button>
            </div>
            <p>この問題専用のステップ可視化は準備中です。</p>
          </div>
        </div>
      )}

      {openSpot === "s4" && (
        <div className="battle-overlay">
          <div className="battle-box">
            <div className="panel-header">
              <p className="battle-monster-name">まちがいさがし</p>
              <button className="panel-close" onClick={closeSpot}>
                部屋にもどる
              </button>
            </div>
            {cardsFor("s4").length === 0 && questionsFor("s4").length === 0 && (
              <p>この問題はまだ準備中です。他の問題(typical90_a)で試してみてね。</p>
            )}
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
              onAllDefeated={closeSpot}
            />
          </div>
        </div>
      )}

      {openSpot === "s5" && (
        <div className="battle-overlay">
          <div className="battle-box">
            <div className="panel-header">
              <p className="battle-monster-name">速度比較</p>
              <button className="panel-close" onClick={closeSpot}>
                部屋にもどる
              </button>
            </div>
            <p>速度比較は準備中です。</p>
          </div>
        </div>
      )}

      {openSpot === "s6" && (
        <div className="battle-overlay">
          <div className="battle-box">
            <div className="panel-header">
              <p className="battle-monster-name">せいかい</p>
              <button className="panel-close" onClick={closeSpot}>
                部屋にもどる
              </button>
            </div>
            {cardsFor("s6").length === 0 && questionsFor("s6").length === 0 && (
              <p>この問題はまだ準備中です。他の問題(typical90_a)で試してみてね。</p>
            )}
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
              onAllDefeated={closeSpot}
            />
          </div>
        </div>
      )}

      {openSpot === "s7" && !s7Unlocked && (
        <div className="battle-overlay">
          <div className="battle-box">
            <div className="panel-header">
              <p className="battle-monster-name">{MONSTER_LABEL.s7}のとびら</p>
              <button className="panel-close" onClick={closeSpot}>
                部屋にもどる
              </button>
            </div>
            <p>モンスター1〜3をたおすと、{MONSTER_LABEL.s7}があらわれるよ。</p>
          </div>
        </div>
      )}
      {openSpot === "s7" && s7Unlocked && !bossStatus?.bigBoss.defeated && (
        <div className="battle-overlay">
          <div className="battle-box">
            <div className="panel-header">
              <p className="battle-monster-name">{MONSTER_LABEL.s7}</p>
              <button className="panel-close" onClick={closeSpot}>
                にげる
              </button>
            </div>
            <div className="battle-monster-row">
              <MonsterSprite variant="boss" />
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
      {openSpot === "s7" && bossStatus?.bigBoss.defeated && (
        <div className="battle-overlay">
          <div className="battle-box">
            <div className="panel-header">
              <p className="battle-monster-name">{MONSTER_LABEL.s7}</p>
              <button className="panel-close" onClick={closeSpot}>
                部屋にもどる
              </button>
            </div>
            <div className="monster-cleared">
              <MonsterSprite variant="boss" defeated />
              <p>{MONSTER_LABEL.s7}をたおした！この部屋はクリア済みです。</p>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
