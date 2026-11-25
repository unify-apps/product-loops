#!/usr/bin/env node
// sync-shared.mjs copies the one true `shared/` folder into every skill, as `skills/<skill>/shared/`.
//   node scripts/sync-shared.mjs            copy (each skill's copy is deleted first, so a removed file goes too)
//   node scripts/sync-shared.mjs --check    change nothing; exit 1 and name the first file that differs
// Why copies: a skill can only read files inside its own folder once the plugin is installed, so each skill
// carries the loop rules, the state script and the hooks. Editing a copy by hand would make the skills drift apart,
// so `npm run check` fails until the copies match `shared/` again.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = path.join(root, "shared");
const skillsDir = path.join(root, "skills");

/** Every file under `dir`, as paths relative to it, sorted. Skips .DS_Store, which macOS drops everywhere. */
export function listFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  const out = [];
  const walk = (sub) => {
    for (const entry of fs.readdirSync(path.join(dir, sub), { withFileTypes: true })) {
      if (entry.name === ".DS_Store") continue;
      const rel = path.join(sub, entry.name);
      if (entry.isDirectory()) walk(rel);
      else out.push(rel);
    }
  };
  walk("");
  return out.sort();
}

/** The first difference between `shared/` and one copy, in words, or null when they match. */
export function firstDifference(from, to) {
  const want = listFiles(from);
  const have = listFiles(to);
  for (const file of want) {
    if (!have.includes(file)) return `${path.join(to, file)} is missing`;
    if (!fs.readFileSync(path.join(from, file)).equals(fs.readFileSync(path.join(to, file)))) return `${path.join(to, file)} differs from ${path.join(from, file)}`;
  }
  const extra = have.find((file) => !want.includes(file));
  return extra ? `${path.join(to, extra)} is not in ${from}` : null;
}

export function skillFolders(dir = skillsDir) {
  return fs.readdirSync(dir, { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => path.join(dir, e.name)).sort();
}

if (process.argv[1] && fs.realpathSync(process.argv[1]) === fs.realpathSync(fileURLToPath(import.meta.url))) {
  const check = process.argv.includes("--check");
  const skills = skillFolders();
  for (const skill of skills) {
    const copy = path.join(skill, "shared");
    if (check) {
      const difference = firstDifference(source, copy);
      if (difference) {
        process.stderr.write(`sync-shared: ${difference.replaceAll(`${root}${path.sep}`, "")}. Run: node scripts/sync-shared.mjs\n`);
        process.exit(1);
      }
    } else {
      fs.rmSync(copy, { recursive: true, force: true });
      fs.cpSync(source, copy, { recursive: true, filter: (from) => path.basename(from) !== ".DS_Store" });
    }
  }
  process.stdout.write(`ok sync-shared: ${skills.length} skills ${check ? "match" : "copied from"} shared/\n`);
}
