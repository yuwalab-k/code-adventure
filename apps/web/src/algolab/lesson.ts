import type { Facing } from "./tileGrid";

export interface AlgoLesson {
  id: string;
  title: string;
  instruction: string;
  grid: string[];
  startFacing: Facing;
  starterCode: string;
}

// MVP progress tracking is client-only (no backend table yet) — see the
// plan's Phase 5 note about moving this server-side once the stage proves
// itself.
const STORAGE_KEY = "algolab-cleared-lessons";

export function getClearedLessons(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
}

export function markLessonCleared(id: string): void {
  const cleared = getClearedLessons();
  cleared.add(id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...cleared]));
}
