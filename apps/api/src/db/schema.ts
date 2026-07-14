import { sqliteTable, text, integer, unique, primaryKey } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  displayName: text("display_name").notNull(),
  role: text("role", { enum: ["student", "admin"] }).notNull().default("student"),
  xp: integer("xp").notNull().default(0),
  rating: integer("rating").notNull().default(1),
  coins: integer("coins").notNull().default(0),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const sessions = sqliteTable("sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  expiresAt: text("expires_at").notNull(),
  createdAt: text("created_at").notNull(),
});

export const tags = sqliteTable("tags", {
  id: text("id").primaryKey(),
  name: text("name").notNull().unique(),
});

export const areas = sqliteTable("areas", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  position: integer("position").notNull(),
  unlockRating: integer("unlock_rating").notNull().default(1),
  gateX: integer("gate_x"),
  gateY: integer("gate_y"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const problems = sqliteTable("problems", {
  id: text("id").primaryKey(),
  contest: text("contest").notNull(),
  problemNumber: text("problem_number").notNull(),
  title: text("title").notNull(),
  atcoderUrl: text("atcoder_url").notNull(),
  difficulty: integer("difficulty").notNull(),
  areaId: text("area_id").notNull().references(() => areas.id),
  npcMotif: text("npc_motif", { enum: ["student", "engineer", "robot", "book", "computer"] })
    .notNull()
    .default("student"),
  statementMd: text("statement_md").notNull(),
  constraintsMd: text("constraints_md").notNull(),
  constraintsNoteMd: text("constraints_note_md"),
  statementNoteMd: text("statement_note_md"),
  mapX: integer("map_x"),
  mapY: integer("map_y"),
  mapOrder: integer("map_order"),
  isPublished: integer("is_published", { mode: "boolean" }).notNull().default(false),
  addedAt: text("added_at").notNull(),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const problemTags = sqliteTable(
  "problem_tags",
  {
    problemId: text("problem_id").notNull().references(() => problems.id, { onDelete: "cascade" }),
    tagId: text("tag_id").notNull().references(() => tags.id, { onDelete: "cascade" }),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.problemId, t.tagId] }),
  }),
);

export const samples = sqliteTable("samples", {
  id: text("id").primaryKey(),
  problemId: text("problem_id").notNull().references(() => problems.id, { onDelete: "cascade" }),
  position: integer("position").notNull(),
  input: text("input").notNull(),
  output: text("output").notNull(),
  explanationMd: text("explanation_md"),
});

const LANGUAGES = ["python", "cpp", "typescript", "ruby", "php", "rust", "perl"] as const;

export const solutions = sqliteTable(
  "solutions",
  {
    id: text("id").primaryKey(),
    problemId: text("problem_id").notNull().references(() => problems.id, { onDelete: "cascade" }),
    language: text("language", { enum: LANGUAGES }).notNull(),
    code: text("code").notNull(),
    stepsJson: text("steps_json"),
  },
  (t) => ({
    unq: unique().on(t.problemId, t.language),
  }),
);

export const submissions = sqliteTable("submissions", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  problemId: text("problem_id").notNull().references(() => problems.id, { onDelete: "cascade" }),
  language: text("language", { enum: ["python"] }).notNull().default("python"),
  code: text("code").notNull(),
  verdict: text("verdict", { enum: ["AC", "WA", "RE"] }).notNull(),
  sampleResultsJson: text("sample_results_json"),
  submittedAt: text("submitted_at").notNull(),
});
