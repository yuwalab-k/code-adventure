import { Hono } from "hono";
import { requireAuth, type AuthEnv } from "./middleware/auth";
import auth from "./routes/auth";
import content from "./routes/content";
import progress from "./routes/progress";
import store from "./routes/store";
import admin from "./routes/admin";

const app = new Hono<AuthEnv>();

app.get("/api/health", (c) => c.json({ ok: true, service: "code-adventure-api" }));

app.route("/api/auth", auth);
app.route("/api", content);
app.route("/api", progress);
app.route("/api", store);
app.use("/api/admin/*", requireAuth);
app.route("/api/admin", admin);

export default app;
