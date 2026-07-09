import { Hono } from "hono";
import type { AuthEnv } from "./middleware/auth";
import auth from "./routes/auth";
import content from "./routes/content";
import progress from "./routes/progress";

const app = new Hono<AuthEnv>();

app.get("/api/health", (c) => c.json({ ok: true, service: "code-adventure-api" }));

app.route("/api/auth", auth);
app.route("/api", content);
app.route("/api", progress);

export default app;
