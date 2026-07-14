import { and, eq, inArray } from "drizzle-orm";
import type { Db } from "../db/client";
import { submissions } from "../db/schema";

export type ProblemStatus = "not_started" | "attempted" | "cleared";

// Per-user problem status is derived from submissions, not stored — an AC
// submission means cleared, any submission means attempted.
export async function computeProblemStatus(db: Db, userId: string, problemId: string): Promise<ProblemStatus> {
  const rows = await db
    .select({ verdict: submissions.verdict })
    .from(submissions)
    .where(and(eq(submissions.userId, userId), eq(submissions.problemId, problemId)));
  if (rows.length === 0) return "not_started";
  return rows.some((r) => r.verdict === "AC") ? "cleared" : "attempted";
}

// Batched version for /api/map and /api/problems, avoiding N+1 queries.
export async function computeStatusMap(
  db: Db,
  userId: string,
  problemIds: string[],
): Promise<Record<string, ProblemStatus>> {
  if (problemIds.length === 0) return {};

  const rows = await db
    .select({ problemId: submissions.problemId, verdict: submissions.verdict })
    .from(submissions)
    .where(and(eq(submissions.userId, userId), inArray(submissions.problemId, problemIds)));

  const result: Record<string, ProblemStatus> = {};
  for (const problemId of problemIds) {
    const forProblem = rows.filter((r) => r.problemId === problemId);
    if (forProblem.length === 0) result[problemId] = "not_started";
    else result[problemId] = forProblem.some((r) => r.verdict === "AC") ? "cleared" : "attempted";
  }
  return result;
}
