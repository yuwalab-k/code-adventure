import { Hono } from "hono";
import type { AuthEnv } from "./middleware/auth";
import auth from "./routes/auth";
import content from "./routes/content";

const app = new Hono<AuthEnv>();

app.get("/api/health", (c) => c.json({ ok: true, service: "code-adventure-api" }));

app.route("/api/auth", auth);
app.route("/api", content);

export default app;
