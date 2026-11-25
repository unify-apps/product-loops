#!/usr/bin/env node
// lint-skills.mjs checks the shape of every skill, so a loop never ships with a broken path or a page Claude
// cannot load in full.
//   node scripts/lint-skills.mjs        exit 0 when every check passes; exit 1 with the list of problems
// The checks, and why:
//   - SKILL.md front matter has `name` equal to the folder name: Claude Code finds and names the skill by it.
//   - `description` has 60 to 1024 characters: shorter cannot say what and when; longer is cut off by Claude Code.
//   - the SKILL.md body has at most 500 lines, and each references/*.md at most 300: past that, Claude reads it in parts.
//   - every `${CLAUDE_SKILL_DIR}/...` path in a SKILL.md exists: a missing file stops the loop half way.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export const LIMITS = Object.freeze({ descriptionMin: 60, descriptionMax: 1024, skillLines: 500, referenceLines: 300 });

/** The front matter of a markdown file as { fields, body }, or null when it has none. Reads `key: value` lines only. */
export function frontMatter(text) {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/u.exec(text);
  if (!match) return null;
  const fields = {};
  const lines = match[1].split(/\r?\n/u);
  for (let i = 0; i < lines.length; i++) {
    const pair = /^([A-Za-z][\w-]*):\s*(.*)$/u.exec(lines[i]);
    if (!pair) continue;
    let value = pair[2].trim();
    // A folded (>) or literal (|) block: the value is the indented lines below, joined.
    if (/^[>|][+-]?$/u.test(value)) {
      const block = [];
      while (i + 1 < lines.length && (/^\s+\S/u.test(lines[i + 1]) || lines[i + 1].trim() === "")) block.push(lines[++i].trim());
      fields[pair[1]] = block.join(value.startsWith(">") ? " " : "\n").trim();
      continue;
    }
    if (/^".*"$/u.test(value)) { try { value = JSON.parse(value); } catch { value = value.slice(1, -1); } }
    else if (/^'.*'$/u.test(value)) value = value.slice(1, -1).replaceAll("''", "'");
    fields[pair[1]] = value;
  }
  return { fields, body: text.slice(match[0].length) };
}

const lineCount = (text) => (text.endsWith("\n") ? text.slice(0, -1) : text).split("\n").length;

/** Every problem of one skill folder, as plain sentences. */
export function lintSkill(dir) {
  const name = path.basename(dir);
  const problems = [];
  const skillFile = path.join(dir, "SKILL.md");
  if (!fs.existsSync(skillFile)) return [`${name}: SKILL.md is missing`];
  const text = fs.readFileSync(skillFile, "utf8");
  const parsed = frontMatter(text);
  if (!parsed) problems.push(`${name}/SKILL.md: no front matter between --- lines`);
  else {
    const { fields, body } = parsed;
    if (fields.name !== name) problems.push(`${name}/SKILL.md: name is "${fields.name ?? ""}", but the folder is "${name}"`);
    const description = fields.description ?? "";
    if (description.length < LIMITS.descriptionMin) problems.push(`${name}/SKILL.md: description has ${description.length} characters, fewer than ${LIMITS.descriptionMin}`);
    if (description.length > LIMITS.descriptionMax) problems.push(`${name}/SKILL.md: description has ${description.length} characters, more than ${LIMITS.descriptionMax}`);
    const lines = lineCount(body);
    if (lines > LIMITS.skillLines) problems.push(`${name}/SKILL.md: body has ${lines} lines, more than ${LIMITS.skillLines}`);
  }
  const refs = path.join(dir, "references");
  if (fs.existsSync(refs)) {
    for (const file of fs.readdirSync(refs).filter((f) => f.endsWith(".md")).sort()) {
      const lines = lineCount(fs.readFileSync(path.join(refs, file), "utf8"));
      if (lines > LIMITS.referenceLines) problems.push(`${name}/references/${file}: ${lines} lines, more than ${LIMITS.referenceLines}`);
    }
  }
  const seen = new Set();
  for (const match of text.matchAll(/\$\{CLAUDE_SKILL_DIR\}\/([A-Za-z0-9_.\/-]*)/gu)) {
    // A sentence may end right after the path, so a trailing dot or comma is not part of it.
    const rel = match[1].replace(/[.,]+$/u, "");
    if (!rel || seen.has(rel)) continue;
    seen.add(rel);
    if (!fs.existsSync(path.join(dir, rel))) problems.push(`${name}/SKILL.md: \${CLAUDE_SKILL_DIR}/${rel} does not exist`);
  }
  return problems;
}

export function lintAll(skillsDir = path.join(root, "skills")) {
  const dirs = fs.readdirSync(skillsDir, { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => path.join(skillsDir, e.name)).sort();
  return { count: dirs.length, problems: dirs.flatMap(lintSkill) };
}

if (process.argv[1] && fs.realpathSync(process.argv[1]) === fs.realpathSync(fileURLToPath(import.meta.url))) {
  const { count, problems } = lintAll();
  if (problems.length) {
    process.stderr.write(`lint-skills: ${problems.length} problems\n${problems.map((p) => `  - ${p}`).join("\n")}\n`);
    process.exit(1);
  }
  process.stdout.write(`ok lint-skills: ${count} skills pass\n`);
}
