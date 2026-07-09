import { Hono } from "hono";
import { setCookie, deleteCookie, getCookie } from "hono/cookie";
import { eq } from "drizzle-orm";
import { createDb } from "../db/client";
import { users } from "../db/schema";
import { verifyPassword } from "../lib/password";
import { createSession, deleteSession } from "../lib/session";
import { requireAuth, SESSION_COOKIE, type AuthEnv } from "../middleware/auth";

const auth = new Hono<AuthEnv>();

function isLocalRequest(url: string): boolean {
  return new URL(url).hostname === "localhost";
}

function publicUser(user: typeof users.$inferSelect) {
  const { passwordHash: _passwordHash, ...rest } = user;
  return rest;
}

auth.post("/login", async (c) => {
  const body = await c.req.json<{ username?: string; password?: string }>().catch(() => null);
  if (!body?.username || !body?.password) {
    return c.json({ error: "username and password are required" }, 400);
  }

  const db = createDb(c.env.DB);
  const rows = await db.select().from(users).where(eq(users.username, body.username)).limit(1);
  const user = rows[0];

  // Always run bcrypt.compare, even on a missing user, to avoid a timing
  // side-channel that would let an attacker enumerate valid usernames.
  const hashToCheck = user?.passwordHash ?? "$2a$10$invalidsaltinvalidsaltinvalidsaltinvalidsalt";
  const passwordOk = await verifyPassword(body.password, hashToCheck);

  if (!user || !passwordOk) {
    return c.json({ error: "invalid username or password" }, 401);
  }

  const session = await createSession(db, user.id);
  setCookie(c, SESSION_COOKIE, session.id, {
    httpOnly: true,
    secure: !isLocalRequest(c.req.url),
    sameSite: "Lax",
    path: "/",
    expires: new Date(session.expiresAt),
  });

  return c.json({ user: publicUser(user) });
});

auth.post("/logout", requireAuth, async (c) => {
  const sessionId = getCookie(c, SESSION_COOKIE);
  if (sessionId) {
    const db = createDb(c.env.DB);
    await deleteSession(db, sessionId);
  }
  deleteCookie(c, SESSION_COOKIE, { path: "/" });
  return c.json({ ok: true });
});

auth.get("/me", requireAuth, async (c) => {
  const user = c.get("user");
  return c.json({ user: publicUser(user) });
});

export default auth;
