import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, "../../../data");
const OUT_FILE = join(__dirname, "../seed.sql");

const SOLUTION_LANGUAGES = ["python", "cpp", "typescript", "ruby", "php", "rust", "perl"] as const;

function sql(value: string | number | boolean | null | undefined): string {
  if (value === null || value === undefined) return "NULL";
  if (typeof value === "boolean") return value ? "1" : "0";
  if (typeof value === "number") return String(value);
  return `'${value.replace(/'/g, "''")}'`;
}

function requiredLevelFromDifficulty(difficulty: number): number {
  return (difficulty - 1) * 2 + 1;
}

interface IndexEntry {
  id: string;
  contest: string;
  problem: string;
  title: string;
  difficulty: number;
  tags: string[];
  file: string;
}

interface Sample {
  input: string;
  output: string;
  explanation?: string;
}

interface SolutionEntry {
  code: string;
  steps?: string[] | null;
}

interface BadSolutionEntry {
  label: string;
  code: string;
}

interface ProblemEntry {
  id: string;
  problem: string;
  title: string;
  atcoder_url: string;
  difficulty: number;
  tags: string[];
  statement: string;
  constraints: string;
  samples: Sample[];
  statement_note?: string;
  constraints_note?: string;
  solutions?: Record<string, SolutionEntry>;
  bad_solutions?: Record<string, BadSolutionEntry>;
  added_at: string;
}

interface GlossaryEntry {
  id: string;
  name: string;
  short?: string;
  description: string;
  without_label?: string;
  without_code?: string;
  with_label?: string;
  with_code?: string;
  when_to_use?: string;
  problems?: string[];
}

interface CodeReadingEntry {
  id: string;
  name: string;
  short?: string;
  body: string;
  python_code?: string;
  other_note?: string;
}

const now = new Date().toISOString();
const lines: string[] = [];
const seenTags = new Set<string>();

function insert(table: string, columns: string[], values: (string | number | boolean | null | undefined)[]) {
  lines.push(`INSERT OR REPLACE INTO ${table} (${columns.join(", ")}) VALUES (${values.map(sql).join(", ")});`);
}

// --- index.json drives which per-problem files to load, and per-problem tags ---
const index: IndexEntry[] = JSON.parse(readFileSync(join(DATA_DIR, "index.json"), "utf-8"));
const uniqueFiles = [...new Set(index.map((e) => e.file))];

for (const file of uniqueFiles) {
  const contestFile: { contest: string; problems: ProblemEntry[] } = JSON.parse(
    readFileSync(join(DATA_DIR, "problems", `${file}.json`), "utf-8"),
  );

  for (const p of contestFile.problems) {
    const indexEntry = index.find((e) => e.id === p.id);
    const requiredLevel = requiredLevelFromDifficulty(p.difficulty);

    insert(
      "problems",
      [
        "id", "contest", "problem_number", "title", "atcoder_url", "difficulty", "required_level",
        "statement_md", "constraints_md", "constraints_note_md", "statement_note_md",
        "map_x", "map_y", "map_order", "clear_reward_item_id",
        "is_published", "added_at", "created_at", "updated_at",
      ],
      [
        p.id, contestFile.contest, p.problem, p.title, p.atcoder_url, p.difficulty, requiredLevel,
        p.statement, p.constraints, p.constraints_note ?? null, p.statement_note ?? null,
        null, null, null, null,
        true, p.added_at, now, now,
      ],
    );

    // tags
    const tags = indexEntry?.tags ?? p.tags ?? [];
    for (const tagName of tags) {
      if (!seenTags.has(tagName)) {
        seenTags.add(tagName);
        insert("tags", ["id", "name"], [tagName, tagName]);
      }
      insert("problem_tags", ["problem_id", "tag_id"], [p.id, tagName]);
    }

    // samples
    p.samples.forEach((s, i) => {
      insert(
        "samples",
        ["id", "problem_id", "position", "input", "output", "explanation_md"],
        [`${p.id}_sample_${i + 1}`, p.id, i + 1, s.input, s.output, s.explanation ?? null],
      );
    });

    // solutions
    for (const lang of SOLUTION_LANGUAGES) {
      const sol = p.solutions?.[lang];
      if (!sol) continue;
      insert(
        "solutions",
        ["id", "problem_id", "language", "code", "steps_json"],
        [`${p.id}_solution_${lang}`, p.id, lang, sol.code, sol.steps ? JSON.stringify(sol.steps) : null],
      );
    }

    // bad_solutions
    for (const lang of SOLUTION_LANGUAGES) {
      const bad = p.bad_solutions?.[lang];
      if (!bad) continue;
      insert(
        "bad_solutions",
        ["id", "problem_id", "language", "label", "code"],
        [`${p.id}_bad_solution_${lang}`, p.id, lang, bad.label, bad.code],
      );
    }
  }
}

// --- glossary ---
const glossary: GlossaryEntry[] = JSON.parse(readFileSync(join(DATA_DIR, "glossary.json"), "utf-8"));
for (const g of glossary) {
  insert(
    "glossary_entries",
    ["id", "name", "short", "description_md", "without_label", "without_code", "with_label", "with_code", "when_to_use_md"],
    [g.id, g.name, g.short ?? null, g.description, g.without_label ?? null, g.without_code ?? null, g.with_label ?? null, g.with_code ?? null, g.when_to_use ?? null],
  );
  for (const problemId of g.problems ?? []) {
    insert("problem_glossary_links", ["problem_id", "glossary_id"], [problemId, g.id]);
  }
}

// --- code_reading ---
const codeReading: CodeReadingEntry[] = JSON.parse(readFileSync(join(DATA_DIR, "code_reading.json"), "utf-8"));
for (const c of codeReading) {
  insert(
    "code_reading_entries",
    ["id", "name", "short", "body_md", "python_code", "other_note"],
    [c.id, c.name, c.short ?? null, c.body, c.python_code ?? null, c.other_note ?? null],
  );
}

writeFileSync(OUT_FILE, lines.join("\n") + "\n", "utf-8");
console.log(`Wrote ${lines.length} statements to ${OUT_FILE}`);
