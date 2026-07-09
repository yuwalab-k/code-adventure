import { createContext, useContext, useCallback, useState, type ReactNode } from "react";
import type { MascotMood } from "./frames";

interface MascotState {
  mood: MascotMood;
  message: string | null;
  setMood: (mood: "happy" | "sad", message: string) => void;
}

const MascotContext = createContext<MascotState | null>(null);

const MOOD_RESET_MS = 2200;

export function MascotProvider({ children }: { children: ReactNode }) {
  const [mood, setMoodState] = useState<MascotMood>("idle");
  const [message, setMessage] = useState<string | null>(null);

  const setMood = useCallback((newMood: "happy" | "sad", newMessage: string) => {
    setMoodState(newMood);
    setMessage(newMessage);
    setTimeout(() => {
      setMoodState("idle");
      setMessage(null);
    }, MOOD_RESET_MS);
  }, []);

  return <MascotContext.Provider value={{ mood, message, setMood }}>{children}</MascotContext.Provider>;
}

export function useMascot(): MascotState {
  const ctx = useContext(MascotContext);
  if (!ctx) throw new Error("useMascot must be used within MascotProvider");
  return ctx;
}
