// Shared SVG filters that give straight lines a hand-drawn wobble, per the
// mockups (robot_sprite_sheet.html, stage1_puzzle_mockup_v2.html).
export function WobbleDefs() {
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
      <filter id="wobble-scribble">
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={4} result="n" />
        <feDisplacementMap in="SourceGraphic" in2="n" scale={1.6} />
      </filter>
      <filter id="wobble-roughen">
        <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves={2} seed={7} result="n" />
        <feDisplacementMap in="SourceGraphic" in2="n" scale={4} />
      </filter>
      <filter id="wobble-blank">
        <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves={2} seed={3} result="n" />
        <feDisplacementMap in="SourceGraphic" in2="n" scale={2.4} />
      </filter>
    </svg>
  );
}
