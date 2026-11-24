#!/usr/bin/env node
// check-findings.mjs checks a findings file: every row has a known screen, a known rule, a level and a status.
//   node check-findings.mjs <findings.md> --screens <screens.json> [--checks <checks.json>] [--bar P1|P2] [--after-fix] [--no-open-p1]
// --checks   every script finding in that checks.json must have a row with the same screen and rule (any status).
// --after-fix every row at or above the bar must be fixed, your call, not a problem, or not fixed with a reason.
// --no-open-p1 no P1 row may be open or not fixed.
// It reads only. It prints OK or each problem, then a count per level and status. Exit 1 on any problem.
import fs from "node:fs";
import { fileURLToPath } from "node:url";

export const RULES = ["dead-click", "broken-link", "console-error", "cut-off-text", "placeholder", "broken-image", "no-empty-state",
  "no-loading-state", "missing-state", "near-miss-alignment", "uneven-spacing", "mixed-words", "page-scrolls-sideways", "persona-path",
  "wrong-content", "taste"];
export const LEVELS = ["P1", "P2", "P3"];
export const STATUSES = ["open", "fixed", "your call", "not a problem", "not fixed"];
const COLUMNS = ["id", "screen", "rule", "level", "problem", "fix", "status"];
export const ALL_SCREENS = "All screens";

/** Pure: the rows of the first table whose header is ID | Screen | Rule | Level | Problem | Fix | Status. */
export function readRows(text) {
  const lines = String(text).split("\n");
  const start = lines.findIndex((line) => {
    const cells = splitRow(line);
    return cells && cells.map((c) => c.toLowerCase()).join("|") === COLUMNS.join("|");
  });
  if (start === -1) return null;
  const rows = [];
  for (const line of lines.slice(start + 2)) {
    const cells = splitRow(line);
    if (!cells) break;
    rows.push(Object.fromEntries(COLUMNS.map((name, i) => [name, (cells[i] ?? "").trim()])));
  }
  return rows;
}

function splitRow(line) {
  const t = line.trim();
  if (!t.startsWith("|") || !t.endsWith("|")) return null;
  return t.slice(1, -1).split(/(?<!\\)\|/u).map((c) => c.trim());
}

const levelRank = (level) => LEVELS.indexOf(level); // P1 is 0, the most serious

/** Pure: the problems with a findings table. */
export function checkFindings(rows, { screens, checks = null, bar = "P2", afterFix = false, noOpenP1 = false }) {
  const problems = [];
  if (!rows) return ["no findings table: it needs the header | ID | Screen | Rule | Level | Problem | Fix | Status |"];
  const names = new Set([...screens.map((s) => s.name), ALL_SCREENS]);
  const ids = new Set();
  for (const row of rows) {
    const label = row.id || "(a row with no ID)";
    if (!row.id) problems.push("a row has no ID");
    else if (ids.has(row.id)) problems.push(`${row.id} is used twice`);
    ids.add(row.id);
    if (!names.has(row.screen)) problems.push(`${label}: screen "${row.screen}" is not one of: ${[...names].join(", ")}`);
    if (!RULES.includes(row.rule)) problems.push(`${label}: rule "${row.rule}" is not one of: ${RULES.join(", ")}`);
    if (!LEVELS.includes(row.level)) problems.push(`${label}: level "${row.level}" must be P1, P2 or P3`);
    if (!STATUSES.includes(row.status.toLowerCase())) problems.push(`${label}: status "${row.status}" must be one of: ${STATUSES.join(", ")}`);
    if (!row.problem) problems.push(`${label}: no problem written`);
    if (row.rule === "taste" && row.status.toLowerCase() === "fixed") problems.push(`${label}: a taste finding is the person's call; it is never fixed by the loop`);
    if (afterFix && levelRank(row.level) !== -1 && levelRank(row.level) <= levelRank(bar)) {
      const status = row.status.toLowerCase();
      if (status === "open") problems.push(`${label}: still open after the fix node`);
      if (status === "not fixed" && row.fix.length < 10) problems.push(`${label}: not fixed, with no reason in the Fix column`);
    }
    if (noOpenP1 && row.level === "P1" && ["open", "not fixed"].includes(row.status.toLowerCase())) problems.push(`${label}: P1 still ${row.status.toLowerCase()} on ${row.screen}: ${row.problem.slice(0, 80)}`);
  }
  if (checks) {
    for (const screen of checks.screens ?? []) {
      if (!screen.screenshot) problems.push(`screen "${screen.name}" has no screenshot in checks.json`);
      for (const finding of screen.findings ?? []) {
        if (!rows.some((row) => row.screen === screen.name && row.rule === finding.kind) && !rows.some((row) => row.screen === ALL_SCREENS && row.rule === finding.kind)) {
          problems.push(`script finding with no row: ${finding.kind} on ${screen.name} (${finding.text || finding.detail})`);
        }
      }
    }
    for (const finding of checks.crossScreen ?? []) {
      if (!rows.some((row) => row.rule === finding.kind)) problems.push(`script finding with no row: ${finding.kind} across screens (${finding.text})`);
    }
  }
  return problems;
}

function parseArgs(argv) {
  const o = { file: null, bar: "P2", afterFix: false, noOpenP1: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--after-fix") o.afterFix = true;
    else if (a === "--no-open-p1") o.noOpenP1 = true;
    else if (["--screens", "--checks", "--bar"].includes(a)) o[a.slice(2)] = argv[++i];
    else if (!a.startsWith("--") && !o.file) o.file = a;
    else throw new Error(`Unknown argument ${a}.`);
  }
  if (!o.file || !o.screens) throw new Error("Usage: check-findings.mjs <findings.md> --screens <screens.json> [--checks <checks.json>] [--bar P1|P2] [--after-fix] [--no-open-p1]");
  if (!["P1", "P2", "P3"].includes(o.bar)) throw new Error("--bar must be P1, P2 or P3.");
  return o;
}

export function main(argv) {
  const o = parseArgs(argv);
  const rows = readRows(fs.readFileSync(o.file, "utf8"));
  const screens = JSON.parse(fs.readFileSync(o.screens, "utf8"));
  const checks = o.checks ? JSON.parse(fs.readFileSync(o.checks, "utf8")) : null;
  const problems = checkFindings(rows, { screens, checks, bar: o.bar, afterFix: o.afterFix, noOpenP1: o.noOpenP1 });
  const count = {};
  for (const row of rows ?? []) { const key = `${row.level} ${row.status.toLowerCase()}`; count[key] = (count[key] ?? 0) + 1; }
  console.log(`${rows?.length ?? 0} findings: ${Object.entries(count).map(([k, v]) => `${v} ${k}`).join(", ") || "none"}`);
  for (const p of problems) console.log(`PROBLEM ${p}`);
  console.log(problems.length ? `${problems.length} problems` : "OK");
  return problems.length ? 1 : 0;
}

if (process.argv[1] && fs.realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { process.exitCode = main(process.argv.slice(2)); } catch (error) { console.error(`check-findings.mjs: ${error.message}`); process.exitCode = 1; }
}
