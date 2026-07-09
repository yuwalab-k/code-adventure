import { Hono } from "hono";
import type { AuthEnv } from "./middleware/auth";
import auth from "./routes/auth";
import content from "./routes/content";
import progress from "./routes/progress";
import store from "./routes/store";

const app = new Hono<AuthEnv>();

app.get("/api/health", (c) => c.json({ ok: true, service: "code-adventure-api" }));

app.route("/api/auth", auth);
app.route("/api", content);
app.route("/api", progress);
app.route("/api", store);

export default app;
