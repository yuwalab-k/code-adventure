import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "../lib/api";

interface ProblemListItem {
  id: string;
  contest: string;
  problemNumber: string;
  title: string;
  difficulty: number;
  status: "not_started" | "attempted" | "cleared";
}

const STATUS_LABEL: Record<ProblemListItem["status"], string> = {
  not_started: "未挑戦",
  attempted: "挑戦中",
  cleared: "クリア済み",
};

// カード形式ではなく、シンプルな一覧で問題を選ぶ画面。
export function ProblemListView({
  onSelect,
  onExit,
}: {
  onSelect: (problemId: string) => void;
  onExit: () => void;
}) {
  const { data, isLoading } = useQuery({
    queryKey: ["problems"],
    queryFn: () => apiFetch<{ problems: ProblemListItem[] }>("/problems"),
  });

  return (
    <div className="problem-list-view">
      <div className="panel-header">
        <p className="panel-title">問題一覧</p>
        <button className="panel-close" onClick={onExit}>
          マップにもどる
        </button>
      </div>

      {isLoading && <p>よみこみちゅう...</p>}

      <ul className="problem-list">
        {data?.problems.map((p) => (
          <li key={p.id}>
            <button className="problem-list-row" onClick={() => onSelect(p.id)}>
              <span className="problem-list-name">
                {p.contest} {p.problemNumber}
              </span>
              <span className="problem-list-difficulty">★{p.difficulty}</span>
              <span className={`problem-list-status status-${p.status}`}>{STATUS_LABEL[p.status]}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
