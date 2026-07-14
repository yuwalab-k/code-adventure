import { writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";
import bcrypt from "bcryptjs";

// Bootstrap utility for creating the first admin/student accounts directly
// against D1, since there is no public self-registration endpoint (see SPEC.md 4.1).
// Usage: pnpm create-user <username> <password> <role: student|admin> <displayName> [--remote]

const __dirname = dirname(fileURLToPath(import.meta.url));
const [, , username, password, role, displayName, flag] = process.argv;

if (!username || !password || !role || !displayName) {
  console.error(
    "Usage: pnpm create-user <username> <password> <student|admin> <displayName> [--remote]",
  );
  process.exit(1);
}

if (role !== "student" && role !== "admin") {
  console.error(`Invalid role "${role}", expected "student" or "admin"`);
  process.exit(1);
}

function sqlString(value: string): string {
  return `'${value.replace(/'/g, "''")}'`;
}

async function main() {
  const passwordHash = await bcrypt.hash(password, 10);
  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  const stmt = `INSERT INTO users (id, username, password_hash, display_name, role, xp, rating, coins, created_at, updated_at) VALUES (${sqlString(id)}, ${sqlString(username)}, ${sqlString(passwordHash)}, ${sqlString(displayName)}, ${sqlString(role)}, 0, 1, 0, ${sqlString(now)}, ${sqlString(now)});`;

  const outFile = join(__dirname, "../create-user.sql");
  writeFileSync(outFile, stmt + "\n", "utf-8");

  const target = flag === "--remote" ? "--remote" : "--local";
  const cmd = `pnpm exec wrangler d1 execute code_adventure ${target} --file=./create-user.sql --config=../../apps/api/wrangler.toml`;
  console.log(`Running: ${cmd}`);
  execSync(cmd, { stdio: "inherit", cwd: join(__dirname, "..") });
  console.log(`Created ${role} user "${username}" (${target.replace("--", "")}).`);
}

main();
