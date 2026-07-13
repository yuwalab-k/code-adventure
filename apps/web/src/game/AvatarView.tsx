// Placeholder — full avatar customization (skin tone/hair/outfit part
// pickers composited onto the Phaser sprite) is blocked on sprite assets
// (see SPEC.md 4.2 asset policy).
export function AvatarView({ onExit }: { onExit: () => void }) {
  return (
    <div className="battle-overlay">
      <div className="battle-box">
        <div className="panel-header">
          <p className="battle-monster-name">アバターカスタマイズ</p>
          <button className="panel-close" onClick={onExit}>
            マップにもどる
          </button>
        </div>
        <p>準備中です。</p>
      </div>
    </div>
  );
}
