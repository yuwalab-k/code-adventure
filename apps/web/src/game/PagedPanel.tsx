import { useState, type ReactNode } from "react";

// Battle-box panels have a fixed height and must not scroll — long content
// is split into pages with a 次へ/まえへ pager instead.
export function PagedPanel({ pages }: { pages: ReactNode[] }) {
  const [index, setIndex] = useState(0);
  if (pages.length === 0) return null;
  const page = Math.min(index, pages.length - 1);

  return (
    <div className="paged-panel">
      <div className="paged-panel-page">{pages[page]}</div>
      {pages.length > 1 && (
        <div className="paged-panel-nav">
          <button disabled={page === 0} onClick={() => setIndex(page - 1)}>
            ← まえ
          </button>
          <span>
            {page + 1} / {pages.length}
          </span>
          <button disabled={page === pages.length - 1} onClick={() => setIndex(page + 1)}>
            つぎへ →
          </button>
        </div>
      )}
    </div>
  );
}
