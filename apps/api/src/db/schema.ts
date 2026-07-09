import { sqliteTable, text, integer, unique, primaryKey } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  displayName: text("display_name").notNull(),
  role: text("role", { enum: ["student", "admin"] }).notNull().default("student"),
  avatarConfig: text("avatar_config").notNull().default("{}"),
  xp: integer("xp").notNull().default(0),
  level: integer("level").notNull().default(1),
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

export const items = sqliteTable("items", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  iconKey: text("icon_key").notNull(),
  slot: text("slot", { enum: ["hat", "cape", "shield", "other"] }),
  priceCoins: integer("price_coins"),
  isKey: integer("is_key", { mode: "boolean" }).notNull().default(false),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const userItems = sqliteTable(
  "user_items",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    itemId: text("item_id").notNull().references(() => items.id),
    source: text("source", { enum: ["clear_reward", "store_purchase"] }).notNull(),
    sourceProblemId: text("source_problem_id").references(() => problems.id),
    isEquipped: integer("is_equipped", { mode: "boolean" }).notNull().default(false),
    acquiredAt: text("acquired_at").notNull(),
  },
  (t) => ({
    unq: unique().on(t.userId, t.itemId),
  }),
);

export const tags = sqliteTable("tags", {
  id: text("id").primaryKey(),
  name: text("name").notNull().unique(),
});

export const problems = sqliteTable("problems", {
  id: text("id").primaryKey(),
  contest: text("contest").notNull(),
  problemNumber: text("problem_number").notNull(),
  title: text("title").notNull(),
  atcoderUrl: text("atcoder_url").notNull(),
  difficulty: integer("difficulty").notNull(),
  requiredLevel: integer("required_level").notNull().default(1),
  statementMd: text("statement_md").notNull(),
  constraintsMd: text("constraints_md").notNull(),
  constraintsNoteMd: text("constraints_note_md"),
  statementNoteMd: text("statement_note_md"),
  mapX: integer("map_x"),
  mapY: integer("map_y"),
  mapOrder: integer("map_order"),
  clearRewardItemId: text("clear_reward_item_id").references(() => items.id),
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

export const badSolutions = sqliteTable(
  "bad_solutions",
  {
    id: text("id").primaryKey(),
    problemId: text("problem_id").notNull().references(() => problems.id, { onDelete: "cascade" }),
    language: text("language", { enum: LANGUAGES }).notNull(),
    label: text("label").notNull(),
    code: text("code").notNull(),
  },
  (t) => ({
    unq: unique().on(t.problemId, t.language),
  }),
);

export const explanationCards = sqliteTable("explanation_cards", {
  id: text("id").primaryKey(),
  problemId: text("problem_id").notNull().references(() => problems.id, { onDelete: "cascade" }),
  screen: text("screen", { enum: ["s2", "s4", "s6"] }).notNull(),
  position: integer("position").notNull(),
  title: text("title"),
  bodyMd: text("body_md").notNull(),
  variant: text("variant"),
});

export const checkpointQuestions = sqliteTable("checkpoint_questions", {
  id: text("id").primaryKey(),
  problemId: text("problem_id").notNull().references(() => problems.id, { onDelete: "cascade" }),
  screen: text("screen", { enum: ["s2", "s4", "s6"] }).notNull(),
  position: integer("position").notNull(),
  questionMd: text("question_md").notNull(),
  choicesJson: text("choices_json").notNull(),
  correctChoiceIndex: integer("correct_choice_index").notNull(),
  explanationMd: text("explanation_md"),
});

export const checkpointAnswers = sqliteTable(
  "checkpoint_answers",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    checkpointQuestionId: text("checkpoint_question_id")
      .notNull()
      .references(() => checkpointQuestions.id, { onDelete: "cascade" }),
    isCorrect: integer("is_correct", { mode: "boolean" }).notNull(),
    attemptCount: integer("attempt_count").notNull().default(1),
    answeredAt: text("answered_at").notNull(),
  },
  (t) => ({
    unq: unique().on(t.userId, t.checkpointQuestionId),
  }),
);

export const glossaryEntries = sqliteTable("glossary_entries", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  short: text("short"),
  descriptionMd: text("description_md").notNull(),
  withoutLabel: text("without_label"),
  withoutCode: text("without_code"),
  withLabel: text("with_label"),
  withCode: text("with_code"),
  whenToUseMd: text("when_to_use_md"),
});

export const problemGlossaryLinks = sqliteTable(
  "problem_glossary_links",
  {
    problemId: text("problem_id").notNull().references(() => problems.id, { onDelete: "cascade" }),
    glossaryId: text("glossary_id").notNull().references(() => glossaryEntries.id, { onDelete: "cascade" }),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.problemId, t.glossaryId] }),
  }),
);

export const codeReadingEntries = sqliteTable("code_reading_entries", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  short: text("short"),
  bodyMd: text("body_md").notNull(),
  pythonCode: text("python_code"),
  otherNote: text("other_note"),
});

export const progress = sqliteTable(
  "progress",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    problemId: text("problem_id").notNull().references(() => problems.id, { onDelete: "cascade" }),
    screen: text("screen", { enum: ["s1", "s2", "s3", "s4", "s5", "s6", "s7"] }).notNull(),
    status: text("status", { enum: ["not_started", "in_progress", "completed"] })
      .notNull()
      .default("not_started"),
    completedAt: text("completed_at"),
    updatedAt: text("updated_at").notNull(),
  },
  (t) => ({
    unq: unique().on(t.userId, t.problemId, t.screen),
  }),
);
