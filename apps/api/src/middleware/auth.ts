import { createMiddleware } from "hono/factory";
import { getCookie } from "hono/cookie";
import { createDb } from "../db/client";
import { getSessionUser } from "../lib/session";
import type { users } from "../db/schema";

export const SESSION_COOKIE = "session";

type User = typeof users.$inferSelect;

export type AuthEnv = {
  Bindings: { DB: D1Database };
  Variables: { user: User };
};

export const requireAuth = createMiddleware<AuthEnv>(async (c, next) => {
  const sessionId = getCookie(c, SESSION_COOKIE);
  if (!sessionId) return c.json({ error: "unauthorized" }, 401);

  const db = createDb(c.env.DB);
  const user = await getSessionUser(db, sessionId);
  if (!user) return c.json({ error: "unauthorized" }, 401);

  c.set("user", user);
  await next();
});

export const requireAdmin = createMiddleware<AuthEnv>(async (c, next) => {
  const user = c.get("user");
  if (user.role !== "admin") return c.json({ error: "forbidden" }, 403);
  await next();
});
