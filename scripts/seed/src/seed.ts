import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, "../../../data");
const OUT_FILE = join(__dirname, "../seed.sql");

const SOLUTION_LANGUAGES = ["python", "cpp", "typescript", "ruby", "php", "rust", "perl"] as const;
const NPC_MOTIFS = ["student", "engineer", "robot", "book", "computer"] as const;

function sql(value: string | number | boolean | null | undefined): string {
  if (value === null || value === undefined) return "NULL";
  if (typeof value === "boolean") return value ? "1" : "0";
  if (typeof value === "number") return String(value);
  return `'${value.replace(/'/g, "''")}'`;
}

interface AreaEntry {
  id: string;
  name: string;
  position: number;
  unlock_rating: number;
  gate_x?: number;
  gate_y?: number;
}

interface IndexEntry {
  id: string;
  contest: string;
  problem: string;
  title: string;
  difficulty: number;
  tags: string[];
  file: string;
  area_id: string;
  npc_motif: (typeof NPC_MOTIFS)[number];
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
  added_at: string;
}

const now = new Date().toISOString();
const lines: string[] = [];
const seenTags = new Set<string>();

function insert(table: string, columns: string[], values: (string | number | boolean | null | undefined)[]) {
  lines.push(`INSERT OR REPLACE INTO ${table} (${columns.join(", ")}) VALUES (${values.map(sql).join(", ")});`);
}

// --- areas.json drives which zones exist and their rating gates ---
const areas: AreaEntry[] = JSON.parse(readFileSync(join(DATA_DIR, "areas.json"), "utf-8"));
for (const a of areas) {
  insert(
    "areas",
    ["id", "name", "position", "unlock_rating", "gate_x", "gate_y", "created_at", "updated_at"],
    [a.id, a.name, a.position, a.unlock_rating, a.gate_x ?? null, a.gate_y ?? null, now, now],
  );
}

// --- index.json drives which per-problem files to load, and per-problem tags/area/npc ---
const index: IndexEntry[] = JSON.parse(readFileSync(join(DATA_DIR, "index.json"), "utf-8"));
const uniqueFiles = [...new Set(index.map((e) => e.file))];

for (const file of uniqueFiles) {
  const contestFile: { contest: string; problems: ProblemEntry[] } = JSON.parse(
    readFileSync(join(DATA_DIR, "problems", `${file}.json`), "utf-8"),
  );

  for (const p of contestFile.problems) {
    const indexEntry = index.find((e) => e.id === p.id);
    if (!indexEntry) throw new Error(`No index.json entry for problem ${p.id}`);

    insert(
      "problems",
      [
        "id", "contest", "problem_number", "title", "atcoder_url", "difficulty",
        "area_id", "npc_motif",
        "statement_md", "constraints_md", "constraints_note_md", "statement_note_md",
        "map_x", "map_y", "map_order",
        "is_published", "added_at", "created_at", "updated_at",
      ],
      [
        p.id, contestFile.contest, p.problem, p.title, p.atcoder_url, p.difficulty,
        indexEntry.area_id, indexEntry.npc_motif,
        p.statement, p.constraints, p.constraints_note ?? null, p.statement_note ?? null,
        null, null, null,
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

    // samples — these double as the Pyodide judge's test cases
    p.samples.forEach((s, i) => {
      insert(
        "samples",
        ["id", "problem_id", "position", "input", "output", "explanation_md"],
        [`${p.id}_sample_${i + 1}`, p.id, i + 1, s.input, s.output, s.explanation ?? null],
      );
    });

    // solutions — revealed as the editorial only after the player clears the problem
    for (const lang of SOLUTION_LANGUAGES) {
      const sol = p.solutions?.[lang];
      if (!sol) continue;
      insert(
        "solutions",
        ["id", "problem_id", "language", "code", "steps_json"],
        [`${p.id}_solution_${lang}`, p.id, lang, sol.code, sol.steps ? JSON.stringify(sol.steps) : null],
      );
    }
  }
}

writeFileSync(OUT_FILE, lines.join("\n") + "\n", "utf-8");
console.log(`Wrote ${lines.length} statements to ${OUT_FILE}`);
