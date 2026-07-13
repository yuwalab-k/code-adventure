import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "../lib/api";

interface GlossaryEntry {
  id: string;
  name: string;
  short: string | null;
  descriptionMd: string;
  withoutLabel: string | null;
  withoutCode: string | null;
  withLabel: string | null;
  withCode: string | null;
  whenToUseMd: string | null;
}

// 道場: 特定の問題に紐付かない、技術そのものを学ぶ場所。
// マップから独立したページには移動せず、マップの上にパネルとして開く。
export function DojoPanel({ onClose }: { onClose: () => void }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["glossary"],
    queryFn: () => apiFetch<{ glossary: GlossaryEntry[] }>("/glossary"),
  });

  const entries = data?.glossary ?? [];
  const selected = entries.find((e) => e.id === selectedId) ?? null;

  return (
    <div className="battle-overlay">
      <div className="battle-box">
        <div className="panel-header">
          <p className="battle-monster-name">{selected ? selected.name : "道場"}</p>
          <button className="panel-close" onClick={selected ? () => setSelectedId(null) : onClose}>
            {selected ? "← 一覧へ" : "マップにもどる"}
          </button>
        </div>

        {isLoading && <p>よみこみちゅう...</p>}

        {!selected && !isLoading && (
          <div className="dojo-list">
            <p>ここでは、AtCoderの問題とは別に、考え方そのものを学べるよ。</p>
            {entries.map((entry) => (
              <button key={entry.id} className="dojo-entry-button" onClick={() => setSelectedId(entry.id)}>
                <span className="dojo-entry-name">{entry.name}</span>
                {entry.short && <span className="dojo-entry-short">{entry.short}</span>}
              </button>
            ))}
          </div>
        )}

        {selected && (
          <div className="dojo-detail">
            <p style={{ whiteSpace: "pre-wrap" }}>{selected.descriptionMd}</p>
            {selected.withoutCode && (
              <>
                <h3>{selected.withoutLabel ?? "工夫しない場合"}</h3>
                <pre className="code-box">{selected.withoutCode}</pre>
              </>
            )}
            {selected.withCode && (
              <>
                <h3>{selected.withLabel ?? "工夫した場合"}</h3>
                <pre className="code-box">{selected.withCode}</pre>
              </>
            )}
            {selected.whenToUseMd && (
              <>
                <h3>いつ使う？</h3>
                <p style={{ whiteSpace: "pre-wrap" }}>{selected.whenToUseMd}</p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
