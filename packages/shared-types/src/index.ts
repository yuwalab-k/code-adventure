export type Screen = "s1" | "s2" | "s3" | "s4" | "s5" | "s6" | "s7";
export type CheckpointScreen = "s2" | "s4" | "s6";
export type ProgressStatus = "not_started" | "in_progress" | "completed";
export type UserRole = "student" | "admin";
export type ItemSlot = "hat" | "cape" | "shield" | "other";
export type SolutionLanguage =
  | "python"
  | "cpp"
  | "typescript"
  | "ruby"
  | "php"
  | "rust"
  | "perl";

export interface AvatarConfig {
  skinTone?: string;
  hairStyle?: string;
  outfit?: string;
}
