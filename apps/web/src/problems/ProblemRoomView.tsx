import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "../lib/api";
import { useAuth } from "../auth/AuthContext";
import { useMascot } from "../mascot/MascotContext";
import { SCENE_TIPS } from "../mascot/sceneTips";

interface Problem {
  id: string;
  contest: string;
  problemNumber: string;
  title: string;
  atcoderUrl: string;
  difficulty: number;
  statementMd: string;
  constraintsMd: string;
  constraintsNoteMd: string | null;
  statementNoteMd: string | null;
}

interface Sample {
  id: string;
  position: number;
  input: string;
  output: string;
  explanationMd: string | null;
}

interface Tag {
  id: string;
  name: string;
}

interface ProblemDetail {
  problem: Problem;
  samples: Sample[];
  tags: Tag[];
}

interface RunResponse {
  id: string;
  stdout: string;
  stderr: string;
  errored: boolean;
}

interface SampleRunState {
  status: "idle" | "running" | "done";
  actualOutput: string;
  errored: boolean;
  matched: boolean;
}

interface SubmitResponse {
  verdict: "AC" | "WA" | "RE";
  xpGained: number;
  coinsGained: number;
  rating: number;
  ratingUp: boolean;
  alreadyCleared: boolean;
}

const DEFAULT_CODE = "# ここにPythonでコードを書いてね\n";

function runOnWorker(worker: Worker, req: { id: string; code: string; stdin: string }): Promise<RunResponse> {
  return new Promise((resolve) => {
    function handleMessage(event: MessageEvent<RunResponse>) {
      if (event.data.id !== req.id) return;
      worker.removeEventListener("message", handleMessage);
      resolve(event.data);
    }
    worker.addEventListener("message", handleMessage);
    worker.postMessage(req);
  });
}

export function ProblemRoomView({ problemId, onExit }: { problemId: string; onExit: () => void }) {
  const queryClient = useQueryClient();
  const { say } = useMascot();
  const { refreshUser } = useAuth();
  const [code, setCode] = useState(DEFAULT_CODE);
  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [runResults, setRunResults] = useState<Record<string, SampleRunState>>({});
  const [submitResult, setSubmitResult] = useState<SubmitResponse | null>(null);
  const [levelUpFlash, setLevelUpFlash] = useState(false);
  const workerRef = useRef<Worker | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["problem", problemId],
    queryFn: () => apiFetch<ProblemDetail>(`/problems/${problemId}`),
  });

  useEffect(() => {
    say(SCENE_TIPS.editor);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const worker = new Worker(new URL("../pyodide/pyodideWorker.ts", import.meta.url), { type: "module" });
    workerRef.current = worker;
    return () => worker.terminate();
  }, []);

  const samples = useMemo(() => data?.samples.slice().sort((a, b) => a.position - b.position) ?? [], [data]);

  async function runAgainstSamples(): Promise<{ sampleId: string; actualOutput: string; errored: boolean }[]> {
    const worker = workerRef.current;
    if (!worker) return [];

    setRunning(true);
    setSubmitResult(null);
    const initial: Record<string, SampleRunState> = {};
    for (const sample of samples) initial[sample.id] = { status: "running", actualOutput: "", errored: false, matched: false };
    setRunResults(initial);

    const results: { sampleId: string; actualOutput: string; errored: boolean }[] = [];
    // Run one sample at a time — Pyodide's stdout redirection is process-global,
    // so overlapping runs would race on the same buffer.
    for (const sample of samples) {
      const res = await runOnWorker(worker, { id: sample.id, code, stdin: sample.input });
      const actualOutput = res.stdout;
      const matched = !res.errored && actualOutput.trim() === sample.output.trim();
      setRunResults((prev) => ({
        ...prev,
        [sample.id]: { status: "done", actualOutput, errored: res.errored, matched },
      }));
      results.push({ sampleId: sample.id, actualOutput, errored: res.errored });
    }

    setRunning(false);
    return results;
  }

  async function handleRun() {
    await runAgainstSamples();
  }

  async function handleSubmit() {
    setSubmitting(true);
    try {
      const results = await runAgainstSamples();
      const res = await apiFetch<SubmitResponse>(`/problems/${problemId}/submit`, {
        method: "POST",
        body: JSON.stringify({ code, language: "python", results }),
      });
      setSubmitResult(res);
      queryClient.invalidateQueries({ queryKey: ["problems"] });
      queryClient.invalidateQueries({ queryKey: ["map"] });

      if (res.verdict === "AC") {
        say(SCENE_TIPS["submit-ac"]);
        if (!res.alreadyCleared) {
          await refreshUser();
          if (res.ratingUp) {
            setLevelUpFlash(true);
            setTimeout(() => setLevelUpFlash(false), 2600);
          }
        }
      } else {
        say(SCENE_TIPS["submit-wa"]);
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (isLoading) return <p className="game-loading">よみこみちゅう...</p>;
  if (error || !data) return <p className="game-loading">読み込みに失敗しました</p>;

  const { problem, tags } = data;

  return (
    <div className="editor-screen">
      {levelUpFlash && <div className="level-up-banner">LEVEL UP!</div>}

      <div className="panel-header">
        <p className="panel-title">
          {problem.contest} {problem.problemNumber}
        </p>
        <button className="panel-close" onClick={onExit}>
          マップにもどる
        </button>
      </div>

      <div className="editor-top">
        <div className="editor-problem-pane">
          <p className="editor-problem-title">
            {problem.title} <span className="talk-window-difficulty">★{problem.difficulty}</span>
          </p>
          {tags.length > 0 && <p className="editor-problem-tags">{tags.map((t) => t.name).join(" / ")}</p>}
          <p style={{ whiteSpace: "pre-wrap" }}>{problem.statementMd}</p>
          <h3>制約</h3>
          <p style={{ whiteSpace: "pre-wrap" }}>{problem.constraintsMd}</p>
          {problem.statementNoteMd && (
            <>
              <h3>かんたん解説</h3>
              <p style={{ whiteSpace: "pre-wrap" }}>{problem.statementNoteMd}</p>
            </>
          )}
          <p>
            <a href={problem.atcoderUrl} target="_blank" rel="noreferrer">
              AtCoderで問題全文を見る
            </a>
          </p>
        </div>

        <div className="editor-code-pane">
          <textarea
            className="editor-textarea"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            spellCheck={false}
          />
        </div>
      </div>

      <div className="editor-bottom">
        <div className="editor-samples">
          {samples.map((sample, i) => {
            const result = runResults[sample.id];
            return (
              <div className="sample-box" key={sample.id}>
                <p className="editor-sample-label">サンプル {i + 1}</p>
                <pre>入力: {sample.input}</pre>
                <pre>出力: {sample.output}</pre>
                {result && result.status === "done" && (
                  <p className={result.matched ? "sample-result-ok" : "sample-result-ng"}>
                    {result.errored ? `実行エラー: ${result.actualOutput || "(出力なし)"}` : `結果: ${result.actualOutput || "(出力なし)"} ${result.matched ? "○" : "✕"}`}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        <div className="editor-actions">
          <button onClick={handleRun} disabled={running || submitting}>
            実行
          </button>
          <button onClick={handleSubmit} disabled={running || submitting}>
            提出
          </button>
        </div>

        {submitResult && (
          <p className={`editor-verdict verdict-${submitResult.verdict}`}>
            {submitResult.verdict === "AC"
              ? submitResult.alreadyCleared
                ? "AC — すでにクリア済みです"
                : `AC — +${submitResult.xpGained}XP / +${submitResult.coinsGained}pt`
              : submitResult.verdict}
          </p>
        )}
      </div>
    </div>
  );
}
