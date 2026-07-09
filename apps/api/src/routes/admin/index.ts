import { Hono } from "hono";
import { requireAdmin, type AuthEnv } from "../../middleware/auth";
import usersRouter from "./users";
import itemsRouter from "./items";
import glossaryRouter from "./glossary";
import codeReadingRouter from "./codeReading";
import problemsRouter from "./problems";

const admin = new Hono<AuthEnv>();

// requireAuth is applied by the caller (see index.ts); this only adds the
// role check, since c.get("user") must already be populated.
admin.use("*", requireAdmin);

admin.route("/users", usersRouter);
admin.route("/items", itemsRouter);
admin.route("/glossary", glossaryRouter);
admin.route("/code-reading", codeReadingRouter);
admin.route("/problems", problemsRouter);

export default admin;
