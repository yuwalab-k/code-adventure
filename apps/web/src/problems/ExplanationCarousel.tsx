import { useState } from "react";

export interface ExplanationCard {
  id: string;
  screen: string;
  position: number;
  title: string | null;
  bodyMd: string;
  variant: string | null;
}

export function ExplanationCarousel({ cards }: { cards: ExplanationCard[] }) {
  const [index, setIndex] = useState(0);
  if (cards.length === 0) return null;

  const sorted = [...cards].sort((a, b) => a.position - b.position);
  const card = sorted[index];

  return (
    <div className="explanation-carousel">
      <div className={`explanation-card${card.variant ? ` ${card.variant}` : ""}`}>
        {card.title && <h3>{card.title}</h3>}
        <p style={{ whiteSpace: "pre-wrap" }}>{card.bodyMd}</p>
      </div>
      {sorted.length > 1 && (
        <div className="carousel-nav">
          <button disabled={index === 0} onClick={() => setIndex((i) => i - 1)}>
            ← 前
          </button>
          <span>
            {index + 1} / {sorted.length}
          </span>
          <button disabled={index === sorted.length - 1} onClick={() => setIndex((i) => i + 1)}>
            次 →
          </button>
        </div>
      )}
    </div>
  );
}
