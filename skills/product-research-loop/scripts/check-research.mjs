#!/usr/bin/env node
// check-research.mjs checks the files of one product-research-loop run. It reads only, except the --write file.
//   node check-research.mjs research <out folder> [--rivals <n>] [--write <proof file>]
//   node check-research.mjs matrix   <out folder> [--write <proof file>]
//   node check-research.mjs think    <out folder> [--write <proof file>]
//   node check-research.mjs brief    <out folder> [--write <proof file>]
//   node check-research.mjs all      <out folder> [--rivals <n>] [--write <proof file>]
// It prints one PASS or FAIL line per check, then a last line. It exits 1 on any FAIL.
// With --write it also writes the same lines to that file, so the file is the node's proof.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const SHEET_FILE = "capability-sheet.csv";
export const FIXED_COLUMNS = ["id", "category", "capability", "sources", "mark", "note"];
export const MARKS = ["have", "gap", "beat"];
export const RIVAL_VALUES = ["yes", "partial", "no", "unknown"];
export const STATUSES = ["read", "unverified"];
const MIN_READ_ROWS = 5;
const URL = /https?:\/\/[^\s|)>\]]+/u;
/** Pure: a name in small letters and digits only, so "Rival-A" and "rival a" match. */
const slug = (name) => String(name).toLowerCase().replace(/[^a-z0-9]/gu, "");

/** Pure: the rows of a CSV text, with quoted fields ("a, b" and "" inside quotes). */
export function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;
  const src = String(text).replace(/^﻿/u, "");
  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (quoted) {
      if (ch === '"' && src[i + 1] === '"') { field += '"'; i++; }
      else if (ch === '"') quoted = false;
      else field += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ",") { row.push(field); field = ""; }
    else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && src[i + 1] === "\n") i++;
      row.push(field); field = "";
      if (row.some((cell) => cell.trim())) rows.push(row);
      row = [];
    } else field += ch;
  }
  row.push(field);
  if (row.some((cell) => cell.trim())) rows.push(row);
  return rows;
}

/** Pure: the rows of the first markdown table under a `## <heading>` (or in the whole text when heading is null). */
export function tableRows(text, heading = null) {
  let part = String(text);
  if (heading) {
    const sections = part.split(/^## +/mu).slice(1);
    const found = sections.find((section) => section.split("\n")[0].trim().toLowerCase() === heading.toLowerCase());
    if (!found) return null;
    part = found;
  }
  const lines = part.split("\n").map((line) => line.trim());
  const start = lines.findIndex((line) => line.startsWith("|"));
  if (start === -1) return [];
  const table = [];
  for (let i = start; i < lines.length && lines[i].startsWith("|"); i++) table.push(lines[i]);
  const cells = (line) => line.replace(/^\|/u, "").replace(/\|$/u, "").split("|").map((cell) => cell.trim());
  const [head, , ...body] = table;
  const columns = cells(head ?? "").map((name) => name.toLowerCase());
  return body.filter((line) => !/^\|[\s:|-]*\|$/u.test(line)).map((line) => {
    const values = cells(line);
    return Object.fromEntries(columns.map((name, index) => [name, values[index] ?? ""]));
  });
}

/** Pure: the `## ` headings of a markdown text, in order, in lower case. */
export const headings = (text) => [...String(text).matchAll(/^## +(.+)$/gmu)].map((match) => match[1].trim().toLowerCase());

/** Checks the rival files: each has a feature table, each row a source link and a status, enough rows read. */
export function checkResearch(outDir, { rivals = 1 } = {}) {
  const results = [];
  const dir = path.join(outDir, "rivals");
  const files = fs.existsSync(dir) ? fs.readdirSync(dir).filter((name) => name.endsWith(".md")).sort() : [];
  results.push({ pass: files.length >= rivals, text: `rival files: ${files.length} in ${dir} (need at least ${rivals})` });
  for (const file of files) {
    const rows = tableRows(fs.readFileSync(path.join(dir, file), "utf8")) ?? [];
    const noSource = rows.filter((row) => !URL.test(row.source ?? ""));
    const badStatus = rows.filter((row) => !STATUSES.includes((row.status ?? "").toLowerCase()));
    const read = rows.filter((row) => (row.status ?? "").toLowerCase() === "read" && URL.test(row.source ?? ""));
    const problems = [];
    if (!rows.length) problems.push("no feature table (columns: Feature | Category | What it does | Source | Status)");
    if (noSource.length) problems.push(`${noSource.length} rows with no source link (first: "${noSource[0].feature ?? ""}")`);
    if (badStatus.length) problems.push(`${badStatus.length} rows whose status is not read or unverified`);
    if (read.length < MIN_READ_ROWS) problems.push(`only ${read.length} rows read this run (need ${MIN_READ_ROWS})`);
    results.push({ pass: !problems.length, text: `${file}: ${rows.length} features, ${read.length} read${problems.length ? `; ${problems.join("; ")}` : ""}` });
  }
  return results;
}

/** Reads the sheet: its rival columns and rows as objects. Returns null when the file is missing. */
export function readSheet(outDir) {
  const file = path.join(outDir, SHEET_FILE);
  if (!fs.existsSync(file)) return null;
  const [head = [], ...body] = parseCsv(fs.readFileSync(file, "utf8"));
  const columns = head.map((name) => name.trim().toLowerCase());
  const rivalColumns = columns.filter((name) => !FIXED_COLUMNS.includes(name));
  const rows = body.map((values) => Object.fromEntries(columns.map((name, index) => [name, (values[index] ?? "").trim()])));
  return { file, columns, rivalColumns, rows };
}

/** Checks the capability sheet: fixed columns, rival columns, unique ids, a source link and a mark on every row. */
export function checkMatrix(outDir) {
  const sheet = readSheet(outDir);
  if (!sheet) return [{ pass: false, text: `no ${SHEET_FILE} in ${outDir}` }];
  const results = [];
  const missing = FIXED_COLUMNS.filter((name) => !sheet.columns.includes(name));
  results.push({ pass: !missing.length, text: missing.length ? `columns missing: ${missing.join(", ")}` : `columns: ${sheet.columns.join(", ")}` });
  results.push({ pass: sheet.rivalColumns.length > 0, text: `rival columns: ${sheet.rivalColumns.join(", ") || "none"}` });
  results.push({ pass: sheet.rows.length > 0, text: `rows: ${sheet.rows.length}` });
  const ids = sheet.rows.map((row) => row.id);
  const dupes = ids.filter((id, index) => ids.indexOf(id) !== index);
  const noId = sheet.rows.filter((row) => !row.id);
  results.push({ pass: !dupes.length && !noId.length, text: `ids: ${noId.length} empty, ${dupes.length} repeated${dupes.length ? ` (${[...new Set(dupes)].join(", ")})` : ""}` });
  const noSource = sheet.rows.filter((row) => !URL.test(row.sources ?? ""));
  results.push({ pass: !noSource.length, text: `rows with no source link: ${noSource.length}${noSource.length ? ` (${noSource.slice(0, 5).map((row) => row.id || row.capability).join(", ")})` : ""}` });
  // A sheet link must come from a rival file: the matrix is built from those files only, never from memory.
  const dir = path.join(outDir, "rivals");
  const rivalText = fs.existsSync(dir) ? fs.readdirSync(dir).filter((name) => name.endsWith(".md")).map((name) => fs.readFileSync(path.join(dir, name), "utf8")).join("\n") : "";
  const known = new Set([...rivalText.matchAll(new RegExp(URL.source, "gu"))].map((match) => match[0]));
  const foreign = sheet.rows.flatMap((row) => [...(row.sources ?? "").matchAll(new RegExp(URL.source, "gu"))].map((match) => match[0]).filter((url) => !known.has(url)).map((url) => `${row.id} ${url}`));
  results.push({ pass: !foreign.length, text: `sheet links found in no rival file: ${foreign.length}${foreign.length ? ` (${foreign.slice(0, 3).join(", ")})` : ""}` });
  const badMark = sheet.rows.filter((row) => !MARKS.includes((row.mark ?? "").toLowerCase()));
  results.push({ pass: !badMark.length, text: `rows whose mark is not ${MARKS.join("/")}: ${badMark.length}${badMark.length ? ` (${badMark.slice(0, 5).map((row) => row.id).join(", ")})` : ""}` });
  const badCells = sheet.rows.flatMap((row) => sheet.rivalColumns.filter((name) => !RIVAL_VALUES.includes((row[name] ?? "").toLowerCase())).map((name) => `${row.id}/${name}`));
  results.push({ pass: !badCells.length, text: `rival cells not ${RIVAL_VALUES.join("/")}: ${badCells.length}${badCells.length ? ` (${badCells.slice(0, 5).join(", ")})` : ""}` });
  // A yes or partial cell needs a link from that rival's own file, so one rival's page never proves another rival's cell.
  const rivalFiles = fs.existsSync(dir) ? fs.readdirSync(dir).filter((name) => name.endsWith(".md")) : [];
  const noFile = sheet.rivalColumns.filter((name) => !rivalFiles.some((file) => slug(file.replace(/\.md$/u, "")) === slug(name)));
  results.push({ pass: !noFile.length, text: `rival columns with no rivals/<column>.md file: ${noFile.length}${noFile.length ? ` (${noFile.join(", ")})` : ""}` });
  const unproved = sheet.rivalColumns.filter((name) => !noFile.includes(name)).flatMap((name) => {
    const file = rivalFiles.find((candidate) => slug(candidate.replace(/\.md$/u, "")) === slug(name));
    // The "Home page:" line only names the product; it proves no feature unless a table row cites that page too.
    const text = fs.readFileSync(path.join(dir, file), "utf8").replace(/^\s*-\s*home page:.*$/gimu, "");
    const own = new Set([...text.matchAll(new RegExp(URL.source, "gu"))].map((match) => match[0]));
    return sheet.rows.filter((row) => ["yes", "partial"].includes((row[name] ?? "").toLowerCase()))
      .filter((row) => ![...(row.sources ?? "").matchAll(new RegExp(URL.source, "gu"))].some((match) => own.has(match[0])))
      .map((row) => `${row.id}/${name}`);
  });
  results.push({ pass: !unproved.length, text: `yes or partial cells with no link from that rival's own file: ${unproved.length}${unproved.length ? ` (${unproved.slice(0, 8).join(", ")})` : ""}` });
  return results;
}

const THINK_HEADINGS = ["persona", "the job", "what this really is", "principle", "flow", "modules", "the simplicity cut"];

/** Checks thinking.md: its sections, and a modules table where every module names the job step it serves. */
export function checkThink(outDir) {
  const file = path.join(outDir, "thinking.md");
  if (!fs.existsSync(file)) return [{ pass: false, text: `no thinking.md in ${outDir}` }];
  const text = fs.readFileSync(file, "utf8");
  const have = headings(text);
  const missing = THINK_HEADINGS.filter((name) => !have.includes(name));
  const rows = tableRows(text, "modules") ?? [];
  const noJob = rows.filter((row) => !(row["job step it serves"] ?? "").replace(/[-–—\s]/gu, ""));
  return [
    { pass: !missing.length, text: missing.length ? `sections missing: ${missing.map((name) => `## ${name}`).join(", ")}` : `sections: ${THINK_HEADINGS.length} of ${THINK_HEADINGS.length}` },
    { pass: rows.length > 0 && !noJob.length, text: `modules: ${rows.length}, with no job step: ${noJob.length}${noJob.length ? ` (${noJob.map((row) => row.module).join(", ")})` : ""}` },
  ];
}

/** Checks brief.md: it ends in the ranked module list, ranks run 1..n, each module has a job step and real sheet rows. */
export function checkBrief(outDir) {
  const file = path.join(outDir, "brief.md");
  if (!fs.existsSync(file)) return [{ pass: false, text: `no brief.md in ${outDir}` }];
  const text = fs.readFileSync(file, "utf8");
  const have = headings(text);
  const results = [{ pass: have.at(-1) === "ranked modules", text: `last section: ${have.at(-1) ? `## ${have.at(-1)}` : "none"} (must be ## Ranked modules)` }];
  const rows = tableRows(text, "ranked modules") ?? [];
  results.push({ pass: rows.length > 0, text: `ranked modules: ${rows.length}` });
  const ranks = rows.map((row) => Number.parseInt(row.rank, 10));
  results.push({ pass: ranks.every((rank, index) => rank === index + 1), text: `ranks: ${ranks.join(", ") || "none"} (must be 1, 2, 3 ... in order)` });
  const noJob = rows.filter((row) => !(row["job step"] ?? "").replace(/[-–—\s]/gu, ""));
  results.push({ pass: !noJob.length, text: `modules with no job step: ${noJob.length}${noJob.length ? ` (${noJob.map((row) => row.module).join(", ")})` : ""}` });
  const noMust = rows.filter((row) => !(row["must have"] ?? "").replace(/[-–—\s]/gu, ""));
  results.push({ pass: !noMust.length, text: `modules with no must have: ${noMust.length}${noMust.length ? ` (${noMust.map((row) => row.module).join(", ")})` : ""}` });
  const sheet = readSheet(outDir);
  const known = new Set((sheet?.rows ?? []).map((row) => row.id.toLowerCase()));
  const untraced = rows.filter((row) => {
    const cited = (row["matrix rows"] ?? "").split(/[\s,;]+/u).filter(Boolean);
    return !cited.length || cited.some((id) => !known.has(id.toLowerCase()));
  });
  results.push({ pass: !untraced.length, text: `modules citing no row, or a row not in ${SHEET_FILE}: ${untraced.length}${untraced.length ? ` (${untraced.map((row) => `${row.module}: "${row["matrix rows"] ?? ""}"`).join("; ")})` : ""}` });
  return results;
}

export const STEPS = ["research", "matrix", "think", "brief", "all"];

export function check(step, outDir, options = {}) {
  if (step === "research") return checkResearch(outDir, options);
  if (step === "matrix") return checkMatrix(outDir);
  if (step === "think") return checkThink(outDir);
  if (step === "brief") return checkBrief(outDir);
  if (step === "all") return [...checkResearch(outDir, options), ...checkMatrix(outDir), ...checkThink(outDir), ...checkBrief(outDir)];
  throw new Error(`Unknown step "${step}". Use research, matrix, think, brief or all.`);
}

export function main(argv) {
  const [step, outDir, ...rest] = argv;
  const usage = "Usage: check-research.mjs <research|matrix|think|brief|all> <out folder> [--rivals <n>] [--write <file>]";
  if (!STEPS.includes(step)) throw new Error(`The first word must be the check name (${STEPS.join(", ")}), then the out folder. Got "${step ?? ""}". Example: check-research.mjs research research/<short name> --rivals 3. ${usage}`);
  if (!outDir || outDir.startsWith("--")) throw new Error(`The second word must be the out folder. ${usage}`);
  const options = {};
  let write = null;
  for (let i = 0; i < rest.length; i++) {
    if (rest[i] === "--rivals") options.rivals = Number.parseInt(rest[++i], 10) || 1;
    else if (rest[i] === "--write") write = rest[++i];
    else throw new Error(`Unknown argument ${rest[i]}.`);
  }
  const results = check(step, path.resolve(outDir), options);
  const failed = results.filter((result) => !result.pass).length;
  const lines = [...results.map((result) => `${result.pass ? "PASS" : "FAIL"}  ${result.text}`),
    failed ? `${step}: ${failed} of ${results.length} checks FAILED` : `${step}: all ${results.length} checks PASS`];
  const output = `${lines.join("\n")}\n`;
  process.stdout.write(output);
  if (write) { fs.mkdirSync(path.dirname(path.resolve(write)), { recursive: true }); fs.writeFileSync(write, output); }
  return failed ? 1 : 0;
}

if (process.argv[1] && fs.realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { process.exitCode = main(process.argv.slice(2)); } catch (error) { console.error(`check-research: ${error.message}`); process.exitCode = 1; }
}
