import { eq } from "drizzle-orm";
import type { Db } from "../db/client";
import { sessions, users } from "../db/schema";

const SESSION_TTL_DAYS = 60;

export async function createSession(db: Db, userId: string): Promise<{ id: string; expiresAt: string }> {
  const id = crypto.randomUUID();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + SESSION_TTL_DAYS * 24 * 60 * 60 * 1000).toISOString();

  await db.insert(sessions).values({
    id,
    userId,
    expiresAt,
    createdAt: now.toISOString(),
  });

  return { id, expiresAt };
}

export async function getSessionUser(db: Db, sessionId: string) {
  const rows = await db
    .select({ user: users, session: sessions })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(eq(sessions.id, sessionId))
    .limit(1);

  const row = rows[0];
  if (!row) return null;

  if (new Date(row.session.expiresAt).getTime() < Date.now()) {
    await db.delete(sessions).where(eq(sessions.id, sessionId));
    return null;
  }

  return row.user;
}

export async function deleteSession(db: Db, sessionId: string): Promise<void> {
  await db.delete(sessions).where(eq(sessions.id, sessionId));
}
