#!/usr/bin/env node
// check-research.mjs checks the files of one product-research-loop run. It reads only, except the --write file.
//   node check-research.mjs research <out folder> [--rivals <n>] [--kinds "<kind 1>,<kind 2>"] [--write <proof file>]
//   node check-research.mjs matrix   <out folder> [--groups "<g1>,<g2>"] [--write <proof file>]
//   node check-research.mjs think    <out folder> [--write <proof file>]
//   node check-research.mjs brief    <out folder> [--write <proof file>]
//   node check-research.mjs all      <out folder> [--rivals <n>] [--kinds "..."] [--groups "..."] [--write <proof file>]
// It prints one PASS or FAIL line per check, then a last line. It exits 1 on any FAIL.
// With --write it also writes the same lines to that file, so the file is the node's proof.
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
import { fileURLToPath } from "node:url";

export const SHEET_FILE = "capability-sheet.csv";
export const SHEET_XLSX = "capability-sheet.xlsx";
export const FIXED_COLUMNS = ["id", "category", "capability", "what it does", "sources", "mark", "note"];
export const BEAT_RESULTS = ["none", "partial", "yes"];
// A "nobody has it" claim needs a few ways of saying the thing: one phrase misses a rival that names it differently.
const MIN_BEAT_SEARCHES = 3;
// Two pages at least, one on the rival's own site: a search page alone, or only someone else's page, proves no absence.
const MIN_BEAT_PAGES = 2;
export const MARKS = ["have", "gap", "beat"];
export const RIVAL_VALUES = ["yes", "partial", "no", "unknown"];
export const STATUSES = ["read", "unverified"];
const MIN_READ_ROWS = 5;
const URL = /https?:\/\/[^\s|)>\]]+/u;
/** Pure: a name in small letters and digits only, so "Rival-A" and "rival a" match. */
const slug = (name) => String(name).toLowerCase().replace(/[^a-z0-9]/gu, "");
/** Pure: every link in a text, without a trailing full stop, comma or semicolon that ends the sentence. */
export const links = (text) => [...String(text ?? "").matchAll(new RegExp(URL.source, "gu"))].map((match) => match[0].replace(/[.,;:]+$/u, ""));
/** Pure: the site of a link without "www." and without its sub-site ("help.a.example" -> "a.example"). */
export function site(link) {
  try {
    const parts = new globalThis.URL(link).hostname.toLowerCase().replace(/^www\./u, "").split(".");
    // Keep 3 labels for a two-part country ending such as "co.uk", else 2.
    const keep = parts.length > 2 && parts.at(-2).length <= 3 && parts.at(-1).length === 2 ? 3 : 2;
    return parts.slice(-keep).join(".");
  } catch { return ""; }
}

/** Pure: the `sources` cell as { rival, link } pairs, written "<rival column>: <link>". A link with no label has rival null. */
export function labelledSources(cell) {
  const pairs = [];
  const text = String(cell ?? "");
  for (const match of text.matchAll(new RegExp(URL.source, "gu"))) {
    const label = text.slice(0, match.index).trimEnd().match(/([^\s:]+):$/u)?.[1] ?? null;
    pairs.push({ rival: label, link: match[0].replace(/[.,;:]+$/u, "") });
  }
  return pairs;
}

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

/** Pure: a rival file's text without its `## Source kinds` part, so the first table is always the feature table. */
export const featureText = (text) => String(text).replace(/^## +source kinds[^\n]*\n[\s\S]*?(?=^## |(?![\s\S]))/gimu, "");

/** Pure: a list option ("a, b,c") as trimmed, non-empty names. */
export const listOption = (value) => String(value ?? "").split(",").map((name) => name.trim()).filter(Boolean);

/** Checks the rival files: a feature table, a source link and a status on every row, enough rows read, and a line
 * for every source kind the person named (used, or why not). */
export function checkResearch(outDir, { rivals = 1, kinds = [] } = {}) {
  const results = [];
  const dir = path.join(outDir, "rivals");
  const files = fs.existsSync(dir) ? fs.readdirSync(dir).filter((name) => name.endsWith(".md")).sort() : [];
  results.push({ pass: files.length >= rivals, text: `rival files: ${files.length} in ${dir} (need at least ${rivals})` });
  for (const file of files) {
    const text = fs.readFileSync(path.join(dir, file), "utf8");
    const rows = tableRows(featureText(text)) ?? [];
    const noSource = rows.filter((row) => !URL.test(row.source ?? ""));
    const badStatus = rows.filter((row) => !STATUSES.includes((row.status ?? "").toLowerCase()));
    const read = rows.filter((row) => (row.status ?? "").toLowerCase() === "read" && URL.test(row.source ?? ""));
    const problems = [];
    if (!rows.length) problems.push("no feature table (columns: Feature | Category | What it does | Source | Status)");
    if (noSource.length) problems.push(`${noSource.length} rows with no source link (first: "${noSource[0].feature ?? ""}")`);
    if (badStatus.length) problems.push(`${badStatus.length} rows whose status is not read or unverified`);
    if (read.length < MIN_READ_ROWS) problems.push(`only ${read.length} rows read this run (need ${MIN_READ_ROWS})`);
    if (!/^\s*-\s*home page:\s*https?:\/\//imu.test(text)) problems.push('no "- Home page: <link>" line');
    if (kinds.length) {
      const kindRows = tableRows(text, "source kinds");
      if (!kindRows?.length) problems.push("no ## Source kinds table (columns: Kind | Searched | Rows | Why none)");
      else {
        // A kind matches when one name holds the other, or both start with the same word ("release notes or
        // changelog" and "Release notes / changelog").
        const firstWord = (name) => slug(String(name).trim().split(/\s+/u)[0]);
        const same = (kind, row) => slug(row.kind) && (slug(row.kind).includes(slug(kind)) || slug(kind).includes(slug(row.kind)) || firstWord(kind) === firstWord(row.kind));
        const missing = kinds.filter((kind) => !kindRows.some((row) => same(kind, row)));
        const unexplained = kindRows.filter((row) => !(Number.parseInt(row.rows, 10) > 0) && !(row["why none"] ?? "").replace(/[-–—\s]/gu, ""));
        if (missing.length) problems.push(`source kinds with no line: ${missing.join(", ")}`);
        if (unexplained.length) problems.push(`source kinds with 0 rows and no "why none": ${unexplained.map((row) => row.kind).join(", ")}`);
      }
    }
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

/** Reads the files of one rival kind folder (`rivals/` or `beats/`) as { column: text }, matched to the sheet's
 * rival columns by name. */
function filesByColumn(dir, columns) {
  const names = fs.existsSync(dir) ? fs.readdirSync(dir).filter((name) => name.endsWith(".md")) : [];
  return Object.fromEntries(columns.map((column) => {
    const file = names.find((name) => slug(name.replace(/\.md$/u, "")) === slug(column));
    return [column, file ? fs.readFileSync(path.join(dir, file), "utf8") : null];
  }));
}

/** Reads one file out of a ZIP (an .xlsx is one). Returns null when the file is not in it. */
export function readZipEntry(buffer, wanted) {
  let end = buffer.length - 22;
  while (end >= 0 && buffer.readUInt32LE(end) !== 0x06054b50) end--;
  if (end < 0) throw new Error("not a ZIP file");
  const count = buffer.readUInt16LE(end + 10);
  let at = buffer.readUInt32LE(end + 16);
  for (let i = 0; i < count; i++) {
    const method = buffer.readUInt16LE(at + 10);
    const size = buffer.readUInt32LE(at + 20);
    const nameLength = buffer.readUInt16LE(at + 28);
    const skip = nameLength + buffer.readUInt16LE(at + 30) + buffer.readUInt16LE(at + 32);
    const local = buffer.readUInt32LE(at + 42);
    const name = buffer.toString("utf8", at + 46, at + 46 + nameLength);
    if (name === wanted) {
      const start = local + 30 + buffer.readUInt16LE(local + 26) + buffer.readUInt16LE(local + 28);
      const data = buffer.subarray(start, start + size);
      return (method === 8 ? zlib.inflateRawSync(data) : data).toString("utf8");
    }
    at += 46 + skip;
  }
  return null;
}

/** The number of data rows (below the header row) on the "Matrix" tab of the workbook. Throws when it cannot read it. */
export function xlsxMatrixRows(file) {
  const buffer = fs.readFileSync(file);
  const workbook = readZipEntry(buffer, "xl/workbook.xml");
  const rels = readZipEntry(buffer, "xl/_rels/workbook.xml.rels");
  if (!workbook || !rels) throw new Error("no workbook inside");
  const sheet = [...workbook.matchAll(/<sheet\b[^>]*>/gu)].map((match) => match[0]).find((tag) => /name="matrix"/iu.test(tag));
  if (!sheet) throw new Error('no tab named "Matrix"');
  const id = sheet.match(/r:id="([^"]+)"/u)?.[1];
  const target = [...rels.matchAll(/<Relationship\b[^>]*>/gu)].map((match) => match[0]).find((tag) => tag.includes(`Id="${id}"`))?.match(/Target="([^"]+)"/u)?.[1];
  const xml = target ? readZipEntry(buffer, target.startsWith("/") ? target.slice(1) : `xl/${target}`) : null;
  if (!xml) throw new Error("the Matrix tab has no sheet file");
  return [...xml.matchAll(/<row[\s>]/gu)].length - 1;
}

/** Checks the beat proof of one beat row: an entry in that rival's beats file, enough searches, pages on the rival's
 * own site, and a result that agrees with the sheet cell. Returns a list of problems. */
function beatProblems(row, column, cell, proofText, rivalText) {
  const where = `${row.id}/${column}`;
  if (!proofText) return [`${where}: no beats/${column}.md`];
  const entry = (tableRows(proofText) ?? []).find((proof) => (proof.row ?? "").trim().toLowerCase() === row.id.toLowerCase());
  if (!entry) return [`${where}: no line for ${row.id} in beats/${column}.md`];
  const problems = [];
  const searches = String(entry.searches ?? "").split(";").map((phrase) => phrase.trim()).filter(Boolean);
  if (searches.length < MIN_BEAT_SEARCHES) problems.push(`${where}: ${searches.length} searches (need ${MIN_BEAT_SEARCHES}, split by ;)`);
  const home = String(rivalText ?? "").match(/^\s*-\s*home page:\s*(https?:\/\/\S+)/imu)?.[1];
  const pages = links(entry.pages);
  const own = home ? pages.filter((page) => site(page) === site(home)) : [];
  if (pages.length < MIN_BEAT_PAGES || !own.length) problems.push(`${where}: ${pages.length} pages, ${own.length} on ${home ? site(home) : "its own site (no Home page line)"} (need ${MIN_BEAT_PAGES}, 1 on its own site)`);
  const result = (entry.result ?? "").trim().toLowerCase();
  const expected = { none: "no", partial: "partial", yes: "yes" }[result];
  if (!expected) problems.push(`${where}: result "${entry.result ?? ""}" is not ${BEAT_RESULTS.join("/")}`);
  else if (expected !== cell) problems.push(`${where}: the search says ${result}, the sheet says ${cell}`);
  if (["partial", "yes"].includes(result) && !links(entry.link).some((link) => links(rivalText).includes(link))) problems.push(`${where}: found, but its link is not in rivals/${column}.md`);
  return problems;
}

/** Checks the capability sheet: fixed columns, rival columns, unique ids, a "what it does" line, a source labelled
 * with its rival for every yes or partial cell, a mark on every row, the person's groups, the beat proof and the
 * .xlsx copy. */
export function checkMatrix(outDir, { groups = [] } = {}) {
  const sheet = readSheet(outDir);
  if (!sheet) return [{ pass: false, text: `no ${SHEET_FILE} in ${outDir}` }];
  const results = [];
  const listed = (items, max = 5) => (items.length ? ` (${items.slice(0, max).join(", ")}${items.length > max ? ", ..." : ""})` : "");
  const missing = FIXED_COLUMNS.filter((name) => !sheet.columns.includes(name));
  results.push({ pass: !missing.length, text: missing.length ? `columns missing: ${missing.join(", ")}` : `columns: ${sheet.columns.join(", ")}` });
  results.push({ pass: sheet.rivalColumns.length > 0, text: `rival columns: ${sheet.rivalColumns.join(", ") || "none"}` });
  results.push({ pass: sheet.rows.length > 0, text: `rows: ${sheet.rows.length}` });
  const ids = sheet.rows.map((row) => row.id);
  const dupes = ids.filter((id, index) => ids.indexOf(id) !== index);
  const noId = sheet.rows.filter((row) => !row.id);
  results.push({ pass: !dupes.length && !noId.length, text: `ids: ${noId.length} empty, ${dupes.length} repeated${listed([...new Set(dupes)])}` });
  const noWhat = sheet.rows.filter((row) => !(row["what it does"] ?? "").replace(/[-–—\s]/gu, ""));
  results.push({ pass: !noWhat.length, text: `rows with no "what it does": ${noWhat.length}${listed(noWhat.map((row) => row.id || row.capability))}` });
  const noSource = sheet.rows.filter((row) => !URL.test(row.sources ?? ""));
  results.push({ pass: !noSource.length, text: `rows with no source link: ${noSource.length}${listed(noSource.map((row) => row.id || row.capability))}` });
  // A sheet link must come from a rival file: the matrix is built from those files only, never from memory.
  const rivalTexts = filesByColumn(path.join(outDir, "rivals"), sheet.rivalColumns);
  const known = new Set(Object.values(rivalTexts).flatMap((text) => links(text)));
  const foreign = sheet.rows.flatMap((row) => labelledSources(row.sources).filter(({ link }) => !known.has(link)).map(({ link }) => `${row.id} ${link}`));
  results.push({ pass: !foreign.length, text: `sheet links found in no rival file: ${foreign.length}${listed(foreign, 3)}` });
  // Every link says which rival it backs, so a reader can check one cell without guessing.
  const unlabelled = sheet.rows.flatMap((row) => labelledSources(row.sources).filter(({ rival }) => !sheet.rivalColumns.some((column) => slug(column) === slug(rival ?? ""))).map(({ rival, link }) => `${row.id} ${rival ? `"${rival}:" ` : ""}${link}`));
  results.push({ pass: !unlabelled.length, text: `source links not written "<rival column>: <link>": ${unlabelled.length}${listed(unlabelled, 3)}` });
  const badMark = sheet.rows.filter((row) => !MARKS.includes((row.mark ?? "").toLowerCase()));
  results.push({ pass: !badMark.length, text: `rows whose mark is not ${MARKS.join("/")}: ${badMark.length}${listed(badMark.map((row) => row.id))}` });
  const badCells = sheet.rows.flatMap((row) => sheet.rivalColumns.filter((name) => !RIVAL_VALUES.includes((row[name] ?? "").toLowerCase())).map((name) => `${row.id}/${name}`));
  results.push({ pass: !badCells.length, text: `rival cells not ${RIVAL_VALUES.join("/")}: ${badCells.length}${listed(badCells)}` });
  const noFile = sheet.rivalColumns.filter((name) => !rivalTexts[name]);
  results.push({ pass: !noFile.length, text: `rival columns with no rivals/<column>.md file: ${noFile.length}${listed(noFile)}` });
  // A yes or partial cell needs a link labelled with that rival, from that rival's own file, so one rival's page never
  // proves another rival's cell. The "Home page:" line only names the product; it proves no feature.
  const unproved = sheet.rivalColumns.filter((name) => rivalTexts[name]).flatMap((name) => {
    const own = new Set(links(rivalTexts[name].replace(/^\s*-\s*home page:.*$/gimu, "")));
    return sheet.rows.filter((row) => ["yes", "partial"].includes((row[name] ?? "").toLowerCase()))
      .filter((row) => !labelledSources(row.sources).some(({ rival, link }) => slug(rival ?? "") === slug(name) && own.has(link)))
      .map((row) => `${row.id}/${name}`);
  });
  results.push({ pass: !unproved.length, text: `yes or partial cells with no "<rival>: <link>" from that rival's own file: ${unproved.length}${listed(unproved, 8)}` });
  // A beat row says no rival does it (or every rival does it badly). That needs proof of absence, per rival.
  const beats = sheet.rows.filter((row) => (row.mark ?? "").toLowerCase() === "beat");
  const proofTexts = filesByColumn(path.join(outDir, "beats"), sheet.rivalColumns);
  const beatIssues = beats.flatMap((row) => sheet.rivalColumns.flatMap((column) => {
    const cell = (row[column] ?? "").toLowerCase();
    if (cell === "unknown") return [`${row.id}/${column}: unknown on a beat row (search it, then no, partial or yes)`];
    return beatProblems(row, column, cell, proofTexts[column], rivalTexts[column]);
  }));
  results.push({ pass: !beatIssues.length, text: `beat rows: ${beats.length}, beat proof problems: ${beatIssues.length}${listed(beatIssues, 6)}` });
  const strongRival = beats.filter((row) => sheet.rivalColumns.some((column) => (row[column] ?? "").toLowerCase() === "yes") && !(row.note ?? "").trim());
  results.push({ pass: !strongRival.length, text: `beat rows where a rival has it in full but the note names no weak spot: ${strongRival.length}${listed(strongRival.map((row) => row.id))}` });
  if (groups.length) {
    const categories = new Set(sheet.rows.map((row) => slug(row.category)));
    const absent = groups.filter((group) => !categories.has(slug(group)));
    results.push({ pass: !absent.length, text: `the person's groups missing from the category column: ${absent.length}${listed(absent, 10)}` });
  }
  const xlsx = path.join(outDir, SHEET_XLSX);
  if (!fs.existsSync(xlsx)) results.push({ pass: false, text: `no ${SHEET_XLSX} (make it with make-sheet.mjs)` });
  else if (fs.statSync(xlsx).mtimeMs + 1000 < fs.statSync(sheet.file).mtimeMs) results.push({ pass: false, text: `${SHEET_XLSX} is older than ${SHEET_FILE}: make it again` });
  else {
    let rows = null;
    let problem = null;
    try { rows = xlsxMatrixRows(xlsx); } catch (error) { problem = error.message; }
    results.push({ pass: rows === sheet.rows.length, text: problem ? `${SHEET_XLSX} cannot be read: ${problem}` : `${SHEET_XLSX}: Matrix tab ${rows} rows, ${SHEET_FILE} ${sheet.rows.length}` });
  }
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
  // Every row id anywhere in the brief must be a real row, and "Where we beat them" cites beat rows only: a row the
  // beat proof turned into a gap must leave that section, and every claim built on it.
  const prefixes = [...new Set((sheet?.rows ?? []).map((row) => row.id.match(/^([A-Za-z]+)\d+$/u)?.[1]).filter(Boolean))];
  const idPattern = prefixes.length ? new RegExp(`\\b(?:${prefixes.join("|")})\\d+\\b`, "gu") : null;
  const cited = (part) => (idPattern ? [...new Set([...String(part).matchAll(idPattern)].map((match) => match[0]))] : []);
  const unknownIds = cited(text).filter((id) => !known.has(id.toLowerCase()));
  results.push({ pass: !unknownIds.length, text: `row ids in the brief that are not in ${SHEET_FILE}: ${unknownIds.length}${unknownIds.length ? ` (${unknownIds.slice(0, 8).join(", ")})` : ""}` });
  const beatSection = String(text).split(/^## +/mu).find((part) => /^where we beat them\s*$/imu.test(part.split("\n")[0])) ?? null;
  const marks = new Map((sheet?.rows ?? []).map((row) => [row.id.toLowerCase(), (row.mark ?? "").toLowerCase()]));
  const notBeat = beatSection === null ? [] : cited(beatSection).filter((id) => known.has(id.toLowerCase()) && marks.get(id.toLowerCase()) !== "beat");
  results.push({ pass: beatSection !== null && !notBeat.length, text: beatSection === null ? "no ## Where we beat them section" : `rows under ## Where we beat them that are not beat rows: ${notBeat.length}${notBeat.length ? ` (${notBeat.join(", ")})` : ""}` });
  // Need 16: the person sees the ideas no rival has in the brief itself, not only in thinking.md. 3 is the
  // smallest list that still lets the person compare and pick.
  const ideasSection = String(text).split(/^## +/mu).find((part) => /^ideas no rival has\s*$/imu.test(part.split("\n")[0])) ?? null;
  const ideas = ideasSection === null ? 0 : ideasSection.split("\n").slice(1).filter((line) => /^\s*(?:[-*]|\d+[.)]|\|\s*\d+\s*\|)\s+\S/u.test(line)).length;
  results.push({ pass: ideas >= 3, text: ideasSection === null ? "no ## Ideas no rival has section" : `ideas under ## Ideas no rival has: ${ideas} (at least 3)` });
  return results;
}

export const STEPS = ["research", "matrix", "think", "brief", "all"];

export function check(step, outDir, options = {}) {
  if (step === "research") return checkResearch(outDir, options);
  if (step === "matrix") return checkMatrix(outDir, options);
  if (step === "think") return checkThink(outDir);
  if (step === "brief") return checkBrief(outDir);
  if (step === "all") return [...checkResearch(outDir, options), ...checkMatrix(outDir, options), ...checkThink(outDir), ...checkBrief(outDir)];
  throw new Error(`Unknown step "${step}". Use research, matrix, think, brief or all.`);
}

export function main(argv) {
  const [step, outDir, ...rest] = argv;
  const usage = "Usage: check-research.mjs <research|matrix|think|brief|all> <out folder> [--rivals <n>] [--kinds \"a,b\"] [--groups \"a,b\"] [--write <file>]";
  if (!STEPS.includes(step)) throw new Error(`The first word must be the check name (${STEPS.join(", ")}), then the out folder. Got "${step ?? ""}". Example: check-research.mjs research research/<short name> --rivals 3. ${usage}`);
  if (!outDir || outDir.startsWith("--")) throw new Error(`The second word must be the out folder. ${usage}`);
  const options = {};
  let write = null;
  for (let i = 0; i < rest.length; i++) {
    if (rest[i] === "--rivals") options.rivals = Number.parseInt(rest[++i], 10) || 1;
    else if (rest[i] === "--kinds") options.kinds = listOption(rest[++i]);
    else if (rest[i] === "--groups") options.groups = listOption(rest[++i]);
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
