import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { apiFetch } from "../lib/api";

interface ProblemDetail {
  problem: { id: string; title: string; statementMd: string; difficulty: number };
}

// Placeholder — the real S1-S7 slideshow (ProblemShell + Mascot +
// ExplanationCarousel + CodeRunner + boss battles) replaces this. For now it
// just proves the authenticated content API round-trips into the SPA.
export function ProblemPage() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, error } = useQuery({
    queryKey: ["problem", id],
    queryFn: () => apiFetch<ProblemDetail>(`/problems/${id}`),
  });

  return (
    <main className="problem-page">
      <Link to="/map">← マップへ戻る</Link>
      {isLoading && <p>よみこみちゅう...</p>}
      {error && <p>読み込みに失敗しました</p>}
      {data && (
        <>
          <h1>{data.problem.title}</h1>
          <p>★{data.problem.difficulty}</p>
          <pre style={{ whiteSpace: "pre-wrap" }}>{data.problem.statementMd}</pre>
        </>
      )}
    </main>
  );
}
