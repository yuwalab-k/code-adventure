import type { ReactNode } from "react";

// 画面下のドック。操作ガイド(アイドル時)か会話ウィンドウ(NPC接近時)を表示する。
// モーダルではなく常設のドック — ゲーム世界は上に見えたまま。
export function BottomPanel({ children }: { children?: ReactNode }) {
  return (
    <div className="bottom-panel">
      {children ?? <p className="bottom-panel-guide">矢印キーかタップで歩いて、NPCに近づいてみよう。</p>}
    </div>
  );
}
