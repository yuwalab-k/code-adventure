import { Link } from "react-router-dom";

// Placeholder — full avatar customization (skin tone/hair/outfit part
// pickers composited onto the Phaser sprite) is blocked on sprite assets
// (see SPEC.md 4.2 asset policy). Route exists so /map's nav link resolves.
export function AvatarPage() {
  return (
    <main>
      <Link to="/map">← マップへ戻る</Link>
      <h1>アバターカスタマイズ</h1>
      <p>準備中です。</p>
    </main>
  );
}
