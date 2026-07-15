// Robot-companion sprite for the algorithm-understanding stage. Same
// grid+palette technique as npc/npcFrames.ts (generatePixelTexture), but
// drawn once facing "down" and rotated per-facing at render time (see
// tileGrid.ts's facingAngle) instead of authoring four separate frames —
// success/fail reactions are transform tweens (scale/rotate/shake), the
// same "animate the existing sprite" approach index.css already uses for
// the mascot's dance/spin tricks, not frame-swapping.

export const ROBOT_ROWS = [
  "....11....",
  "....22....",
  "..111111..",
  ".11222211.",
  ".11222211.",
  ".11111111.",
  ".11212121.",
  "..111111..",
  ".11....11.",
  "11......11",
];

export const ROBOT_PALETTE_CHARS = {
  "1": "robotBody",
  "2": "robotDetail",
} as const;
