// Ported from the original code-sensei mascot (docs/problems/typical90_a.html)
// — same 10x10 grid data. Colors are inverted (light body / dark eye) from
// the original dark-body port so the shape stays visible against the game's
// black background; the pixel arrangement itself is unchanged.
// '0' = transparent, '1' = body, '2' = eye, '3' = mood accent (mouth).

export const MASCOT_BODY = "#eeeeee";
export const MASCOT_EYE = "#000000";
export const MASCOT_HAPPY = "#2e7d32";
export const MASCOT_SAD = "#c62828";

export type MascotMood = "idle" | "blink" | "happy" | "sad";

export const MASCOT_FRAMES: Record<MascotMood, string[]> = {
  idle: [
    "0000100000",
    "0000100000",
    "0011111100",
    "0012002100",
    "0011111100",
    "0111111110",
    "1011111101",
    "0111111110",
    "0011001100",
    "0011001100",
  ],
  blink: [
    "0000100000",
    "0000100000",
    "0011111100",
    "0011001100",
    "0011111100",
    "0111111110",
    "1011111101",
    "0111111110",
    "0011001100",
    "0011001100",
  ],
  happy: [
    "0000100000",
    "0000100000",
    "0011111100",
    "0012002100",
    "0013333100",
    "0111111110",
    "1011111101",
    "0111111110",
    "0011001100",
    "0011001100",
  ],
  sad: [
    "0000100000",
    "0000100000",
    "0011111100",
    "0012002100",
    "0013003100",
    "0111111110",
    "1011111101",
    "0111111110",
    "0011001100",
    "0011001100",
  ],
};

export function colorFor(char: string, mood: MascotMood): string | null {
  if (char === "0") return null;
  if (char === "1") return MASCOT_BODY;
  if (char === "2") return MASCOT_EYE;
  // '3': mood accent (mouth) — green when happy, red when sad, body color otherwise.
  if (mood === "sad") return MASCOT_SAD;
  if (mood === "happy") return MASCOT_HAPPY;
  return MASCOT_BODY;
}
