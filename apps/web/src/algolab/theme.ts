// Cozy pixel-RPG palette for the algorithm-understanding stage. Kept local
// to algolab/ (not the shared main-map palette) so this stage can ship and
// iterate independently of the still-monochrome main world map — see the
// plan's Phase 5 note about later unifying the two.

export const COLOR = {
  bg: "#2b1f18", // warm dark soil, not flat black
  floor: "#d8c39a", // light warm tan
  floorAlt: "#cdb689", // subtle checker so the grid reads as tiles, not a slab
  wall: "#6b4a34", // wood brown, square blocks
  goal: "#7ed957", // accent green — the one important tile
  robotBody: "#5ec8f4", // accent cyan
  robotDetail: "#1a1410",
  accentYellow: "#f4d35e",
  fail: "#e0703e", // warm orange for bump/fail feedback
  text: "#2b1f18",
  textLight: "#fff8ec",
  panelBg: "#fff8ec",
  panelBorder: "#6b4a34",
} as const;

export function hex(color: string): number {
  return parseInt(color.replace("#", ""), 16);
}
