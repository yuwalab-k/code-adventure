import { Hono } from "hono";
import { requireAuth, type AuthEnv } from "./middleware/auth";
import auth from "./routes/auth";
import content from "./routes/content";
import submissions from "./routes/submissions";
import admin from "./routes/admin";
import map from "./routes/map";

const app = new Hono<AuthEnv>();

app.get("/api/health", (c) => c.json({ ok: true, service: "code-adventure-api" }));

app.route("/api/auth", auth);
app.route("/api", content);
app.route("/api", submissions);
app.route("/api", map);
app.use("/api/admin/*", requireAuth);
app.route("/api/admin", admin);

export default app;
