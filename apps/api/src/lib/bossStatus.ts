import { and, eq, inArray } from "drizzle-orm";
import type { Db } from "../db/client";
import { checkpointQuestions, checkpointAnswers, progress } from "../db/schema";

const CHECKPOINT_SCREENS = ["s2", "s4", "s6"] as const;

// Batched version of the per-problem boss-status computation (see routes/progress.ts),
// used by the map endpoint so it doesn't run N+1 queries across every problem.
export async function computeClearedMap(
  db: Db,
  userId: string,
  problemIds: string[],
): Promise<Record<string, boolean>> {
  if (problemIds.length === 0) return {};

  const [allQuestions, allAnswers, allS7Progress] = await Promise.all([
    db.select().from(checkpointQuestions).where(inArray(checkpointQuestions.problemId, problemIds)),
    db
      .select({ answer: checkpointAnswers, question: checkpointQuestions })
      .from(checkpointAnswers)
      .innerJoin(checkpointQuestions, eq(checkpointAnswers.checkpointQuestionId, checkpointQuestions.id))
      .where(and(eq(checkpointAnswers.userId, userId), inArray(checkpointQuestions.problemId, problemIds))),
    db
      .select()
      .from(progress)
      .where(and(eq(progress.userId, userId), eq(progress.screen, "s7"), inArray(progress.problemId, problemIds))),
  ]);

  const result: Record<string, boolean> = {};
  for (const problemId of problemIds) {
    const allSmallBossesDefeated = CHECKPOINT_SCREENS.every((screen) => {
      const screenQuestions = allQuestions.filter((q) => q.problemId === problemId && q.screen === screen);
      return (
        screenQuestions.length > 0 &&
        screenQuestions.every((q) => allAnswers.some((a) => a.question.id === q.id && a.answer.isCorrect))
      );
    });
    const bigBossDefeated = allS7Progress.some((p) => p.problemId === problemId && p.status === "completed");
    result[problemId] = allSmallBossesDefeated && bigBossDefeated;
  }
  return result;
}
