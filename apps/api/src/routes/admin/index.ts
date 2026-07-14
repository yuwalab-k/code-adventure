import { Hono } from "hono";
import { requireAdmin, type AuthEnv } from "../../middleware/auth";
import usersRouter from "./users";
import problemsRouter from "./problems";
import areasRouter from "./areas";

const admin = new Hono<AuthEnv>();

// requireAuth is applied by the caller (see index.ts); this only adds the
// role check, since c.get("user") must already be populated.
admin.use("*", requireAdmin);

admin.route("/users", usersRouter);
admin.route("/problems", problemsRouter);
admin.route("/areas", areasRouter);

export default admin;
