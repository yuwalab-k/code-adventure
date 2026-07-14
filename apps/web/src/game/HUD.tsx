// 画面左上の常設HUD: 現在地・現在のレート・所持ポイント・進行度。
export function HUD({
  locationName,
  rating,
  coins,
  clearedCount,
  totalCount,
}: {
  locationName: string | null;
  rating: number;
  xp: number;
  coins: number;
  clearedCount: number;
  totalCount: number;
}) {
  return (
    <div className="hud-panel">
      <p className="hud-location">{locationName ?? "..."}</p>
      <p className="hud-stat">
        レート {rating} / {coins}pt
      </p>
      <p className="hud-stat">
        進行度 {clearedCount} / {totalCount}
      </p>
    </div>
  );
}
