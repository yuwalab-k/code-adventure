import { Hono } from "hono";
import { eq } from "drizzle-orm";
import { createDb } from "../../db/client";
import { users } from "../../db/schema";
import { hashPassword } from "../../lib/password";
import type { AuthEnv } from "../../middleware/auth";

const router = new Hono<AuthEnv>();

function publicUser(user: typeof users.$inferSelect) {
  const { passwordHash: _passwordHash, ...rest } = user;
  return rest;
}

router.get("/", async (c) => {
  const db = createDb(c.env.DB);
  const rows = await db.select().from(users);
  return c.json({ users: rows.map(publicUser) });
});

// The only way a student/admin account comes into existence — there is no
// public self-registration endpoint anywhere in this API (see SPEC.md 4.1).
router.post("/", async (c) => {
  const body = await c.req
    .json<{ username?: string; password?: string; displayName?: string; role?: string }>()
    .catch(() => null);
  if (!body?.username || !body?.password || !body?.displayName) {
    return c.json({ error: "username, password, and displayName are required" }, 400);
  }
  const role = body.role === "admin" ? "admin" : "student";

  const db = createDb(c.env.DB);
  const [existing] = await db.select().from(users).where(eq(users.username, body.username)).limit(1);
  if (existing) return c.json({ error: "username already taken" }, 409);

  const now = new Date().toISOString();
  const user = {
    id: crypto.randomUUID(),
    username: body.username,
    passwordHash: await hashPassword(body.password),
    displayName: body.displayName,
    role,
    xp: 0,
    rating: 1,
    coins: 0,
    createdAt: now,
    updatedAt: now,
  };
  await db.insert(users).values(user);

  return c.json({ user: publicUser(user) }, 201);
});

// Admin-driven password reset — the only recovery path, since there is no
// email-based "forgot password" flow (see SPEC.md 4.1).
router.put("/:id", async (c) => {
  const id = c.req.param("id");
  const body = await c.req
    .json<{ displayName?: string; role?: string; password?: string }>()
    .catch(() => null);
  if (!body) return c.json({ error: "invalid body" }, 400);

  const db = createDb(c.env.DB);
  const [existing] = await db.select().from(users).where(eq(users.id, id)).limit(1);
  if (!existing) return c.json({ error: "not found" }, 404);

  const update: Partial<typeof users.$inferInsert> = { updatedAt: new Date().toISOString() };
  if (body.displayName) update.displayName = body.displayName;
  if (body.role === "student" || body.role === "admin") update.role = body.role;
  if (body.password) update.passwordHash = await hashPassword(body.password);

  await db.update(users).set(update).where(eq(users.id, id));
  const [updated] = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return c.json({ user: publicUser(updated) });
});

export default router;
