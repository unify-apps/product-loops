// lib.mjs holds what every eval script shares: paths, arguments, cases, the working folders and the script checks.
// It has no dependencies, so the evals run on a bare Node 22.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

export const EVALS = path.dirname(fileURLToPath(import.meta.url));
export const REPO = path.dirname(EVALS);
// The pristine 0.1.5 copy sits next to the checkout. Both can be moved with a flag.
export const DEFAULT_BASELINE = path.resolve(REPO, "..", "..", "baseline", "product-loops");
export const DEFAULT_IMPROVED = REPO;
export const LOOPS = ["build", "research", "design", "review", "deck"];
export const ARMS = ["baseline", "improved"];
export const skillName = (loop) => `product-${loop}-loop`;
export const loopOfSkill = (skill) => (skill.match(/^product-(\w+)-loop$/) || [])[1] ?? null;

/** Parses `--flag value` and `--flag` (true) into an object. Unknown flags are kept, so each script checks its own. */
export function parseArgs(argv) {
  const out = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith("--")) { out._.push(a); continue; }
    const key = a.slice(2);
    const next = argv[i + 1];
    if (next === undefined || next.startsWith("--")) out[key] = true;
    else { out[key] = next; i++; }
  }
  return out;
}

export function fail(message) {
  process.stderr.write(`${message}\n`);
  process.exit(1);
}

export function armDir(arm, args) {
  if (!ARMS.includes(arm)) fail(`--arm must be baseline or improved, not "${arm}".`);
  const dir = path.resolve(arm === "baseline" ? (args["plugin-dir-baseline"] ?? DEFAULT_BASELINE) : (args["plugin-dir-improved"] ?? DEFAULT_IMPROVED));
  if (!fs.existsSync(path.join(dir, "skills"))) fail(`No plugin at ${dir} (it has no skills/ folder). Pass --plugin-dir-${arm} <path>.`);
  return dir;
}

export function loopsOf(value) {
  if (!value || value === true) fail("--loop is needed: one of build, research, design, review, deck, or all.");
  if (value === "all") return LOOPS;
  const loops = String(value).split(",").map((s) => s.trim().replace(/^product-|-loop$/g, ""));
  for (const l of loops) if (!LOOPS.includes(l)) fail(`Unknown loop "${l}". Use one of ${LOOPS.join(", ")}, or all.`);
  return loops;
}

export function readJson(file, fallback = undefined) {
  try { return JSON.parse(fs.readFileSync(file, "utf8")); }
  catch (e) { if (fallback !== undefined) return fallback; throw new Error(`${file}: ${e.message}`); }
}

export function writeJson(file, data) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`);
}

export function loadCases(loop, onlyId) {
  const file = path.join(EVALS, "cases", `${loop}.json`);
  const data = readJson(file);
  const cases = (data.cases ?? data).map((c) => ({ ...c, loop }));
  if (!onlyId || onlyId === true) return cases;
  return cases.filter((c) => c.id === onlyId);
}

// The working folder of a case lives outside the repo, so the session cannot find the plugin's own files by walking
// up, and its name is a hash, so nothing in a message or a path tells a grader which arm wrote it.
export function workRoot(args) {
  return path.resolve(args["work-root"] ?? process.env.PRODUCT_LOOPS_EVAL_ROOT ?? path.join(os.tmpdir(), "product-loops-evals"));
}
export const blindId = (arm, caseId) => crypto.createHash("sha1").update(`${arm}:${caseId}`).digest("hex").slice(0, 10);
export const caseFolder = (arm, caseId) => path.join(EVALS, "work", arm, caseId);
export const resultFile = (arm, loop, caseId) => path.join(EVALS, "results", arm, loop, `${caseId}.json`);

/** Writes the case's files into `dir`. A value is the file text, or { "copy": "<path under evals/fixtures>" }. */
export function writeFixtures(c, dir) {
  const written = [];
  for (const [rel, value] of Object.entries(c.files ?? {})) {
    const target = path.join(dir, rel);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    if (typeof value === "string") fs.writeFileSync(target, value);
    else if (value && value.copy) fs.copyFileSync(path.join(EVALS, "fixtures", value.copy), target);
    else throw new Error(`${c.id}: file ${rel} needs text or { "copy": "<fixture path>" }`);
    written.push(rel);
  }
  return written.sort();
}

export function fixtureText(c, rel) {
  const value = c.files?.[rel];
  if (typeof value === "string") return value;
  if (value?.copy) return fs.readFileSync(path.join(EVALS, "fixtures", value.copy), "utf8");
  return "";
}

/** Every file under `dir`, relative, skipping .git. */
export function listFiles(dir) {
  const out = [];
  const walk = (d) => {
    let entries = [];
    try { entries = fs.readdirSync(d, { withFileTypes: true }); } catch { return; }
    for (const e of entries) {
      if (e.name === ".git" || e.name === "node_modules") continue;
      const full = path.join(d, e.name);
      if (e.isDirectory()) walk(full);
      else out.push(path.relative(dir, full));
    }
  };
  walk(dir);
  return out.sort();
}

export function copyDir(from, to) {
  if (!fs.existsSync(from)) return false;
  fs.cpSync(from, to, { recursive: true, force: true });
  return true;
}

/** Runs `jobs` (async functions) with at most `n` at a time. */
export async function pool(jobs, n) {
  const results = new Array(jobs.length);
  let next = 0;
  const worker = async () => { while (next < jobs.length) { const i = next++; results[i] = await jobs[i](); } };
  await Promise.all(Array.from({ length: Math.max(1, Math.min(n, jobs.length)) }, worker));
  return results;
}

/** The front matter of a SKILL.md as { name, description }. Only the simple `key: value` lines the plugin uses. */
export function frontMatter(file) {
  const text = fs.readFileSync(file, "utf8");
  const m = text.match(/^---\n([\s\S]*?)\n---/);
  const out = {};
  if (!m) return out;
  const lines = m[1].split("\n");
  for (let i = 0; i < lines.length; i++) {
    const kv = lines[i].match(/^([\w-]+):\s*(.*)$/);
    if (!kv) continue;
    let v = kv[2].trim();
    // Indented lines under a key belong to it: a block scalar (`>` or `|`) or a plain value that wraps.
    const more = [];
    while (i + 1 < lines.length && /^\s+\S/.test(lines[i + 1])) more.push(lines[++i].trim());
    if (/^[>|][-+]?$/.test(v)) v = more.join(v.startsWith("|") ? "\n" : " ");
    else if (more.length) v = [v, ...more].join(" ");
    if (/^".*"$/s.test(v)) { try { v = JSON.parse(v); } catch { v = v.slice(1, -1); } }
    else if (/^'.*'$/s.test(v)) v = v.slice(1, -1).replace(/''/g, "'");
    out[kv[1]] = v;
  }
  return out;
}

export const mean = (xs) => { const v = xs.filter((x) => typeof x === "number" && !Number.isNaN(x)); return v.length ? +(v.reduce((a, b) => a + b, 0) / v.length).toFixed(3) : null; };
export const rate = (xs) => { const v = xs.filter((x) => typeof x === "boolean"); return v.length ? +(v.filter(Boolean).length / v.length).toFixed(3) : null; };

// ---------------------------------------------------------------------------------------------------------------
// The script checks. Each returns { pass, value?, evidence }. `pass: null` means "recorded, not scored".

export const LLM_KEYS = ["completeness", "no_redundancy", "defaults_quality", "clarity", "respects_words", "overall"];

/** A topic or fact is written as alternates: "persona|who uses|user". It is hit when any alternate is in the text. */
export function alternates(item) { return String(item).split("|").map((s) => s.trim().toLowerCase()).filter(Boolean); }
export function hits(text, item) {
  const low = text.toLowerCase();
  return alternates(item).find((alt) => {
    const esc = alt.replace(/[.*+?^${}()[\]\\]/g, "\\$&");
    return new RegExp(`(^|[^a-z0-9])${esc}`, "i").test(low);
  }) ?? null;
}

// Where the questions start: the last line that names questions as a heading, a bold line or a line ending in ":".
const QUESTION_HEAD = /^\s*(#{1,6}\s.*question|\*\*[^*]*question[^*]*\*\*|[^|]*\bquestions?\b[^|]*:\s*$)/i;
const ITEM = /^\s{0,3}(?:#{1,6}\s*)?(?:\*\*)?(?:Q\s?)?(\d{1,2})[.)]\s*(?:\*\*)?\s*(.*)$/;

/** Splits the message into { before, questions: [{ n, text }], after }. */
export function splitQuestions(message) {
  const lines = message.replace(/\r\n/g, "\n").split("\n");
  let head = -1;
  lines.forEach((l, i) => { if (QUESTION_HEAD.test(l) && !ITEM.test(l)) head = i; });
  const start = head >= 0 ? head + 1 : 0;
  const items = [];
  let current = null;
  let lastItemLine = -1;
  let prevBlank = false;
  for (let i = start; i < lines.length; i++) {
    const l = lines[i];
    const m = l.match(ITEM);
    // A top-level item: indented at most 3 spaces. Nested numbered lines stay inside the item above them.
    if (m) { current = { n: Number(m[1]), text: m[2], line: i }; items.push(current); lastItemLine = i; prevBlank = false; continue; }
    if (!current) continue;
    if (l.trim() === "") { prevBlank = true; continue; }
    // Inside an item: indented lines, bullets, and the Recommended / Default / Why lines. An unindented line right
    // under the item also belongs to it; one after a blank line is the text after the list.
    const belongs = /^\s+\S/.test(l) || /^\s*[-*]\s/.test(l) || /^\s*(\*\*)?(Recommended|Default|Why it matters)\b/i.test(l) || (!prevBlank && !/^reply with/i.test(l.trim()));
    if (!belongs) break;
    current.text += `\n${l.trim()}`; lastItemLine = i; prevBlank = false;
  }
  // With no heading, a numbered list counts as questions only when its items ask something.
  let questions = items;
  if (head < 0) questions = items.filter((q) => /\?|default|recommended/i.test(q.text));
  // A numbered list restarts at 1 for each new list: keep the last list that starts at 1 (the question round).
  const starts = questions.map((q, i) => (q.n === 1 ? i : -1)).filter((i) => i >= 0);
  if (starts.length > 1) questions = questions.slice(starts[starts.length - 1]);
  const firstLine = questions.length ? questions[0].line : lines.length;
  return {
    before: lines.slice(0, head >= 0 ? head : firstLine).join("\n"),
    questions,
    after: lines.slice(lastItemLine + 1).join("\n"),
  };
}

/** Finds the run folder of a working folder through its `.loop-run` pointer, else the newest loop-runs/<x>/state.json. */
export function findRunDir(ws) {
  const pointer = path.join(ws, ".loop-run");
  if (fs.existsSync(pointer)) {
    const p = fs.readFileSync(pointer, "utf8").trim();
    const abs = path.isAbsolute(p) ? p : path.join(ws, p);
    if (fs.existsSync(path.join(abs, "state.json"))) return abs;
  }
  const root = path.join(ws, "loop-runs");
  if (!fs.existsSync(root)) return null;
  const runs = fs.readdirSync(root).map((d) => path.join(root, d)).filter((d) => fs.existsSync(path.join(d, "state.json")));
  runs.sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs);
  return runs[0] ?? null;
}

// Files a loop's own intake may write outside loop-runs/ during its start check, per loop.
const START_CHECK_FILES = { deck: [/^decks\//], build: [], research: [], design: [], review: [] };

/** Runs every script check on one case. `message` is the text; `ws` the working folder; `fixtures` the files written. */
export function scriptChecks(c, message, ws, fixtures) {
  const checks = {};
  const { before, questions } = splitQuestions(message);
  const nonEmpty = message.split("\n").map((l) => l.trim()).filter(Boolean);
  const last = nonEmpty[nonEmpty.length - 1] ?? "";

  checks.ended_with_go_line = {
    pass: /reply with your answers/i.test(last) || /just\s+["“']?go["”']?/i.test(last),
    evidence: `last line: ${last.slice(0, 120)}`,
  };
  checks.asked_count = { pass: null, value: questions.length, evidence: questions.map((q) => `${q.n}. ${q.text.split("\n")[0].replace(/\*\*/g, "").slice(0, 70)}`).join(" | ") || "no numbered questions found" };
  checks.asked_le_7 = { pass: questions.length <= 7, value: questions.length, evidence: `${questions.length} questions` };
  const noDefault = questions.filter((q) => !/recommended\s*:|default\s*:|\bdefault\b/i.test(q.text));
  checks.every_question_has_default = {
    pass: questions.length === 0 ? null : noDefault.length === 0,
    evidence: noDefault.length ? `no default on: ${noDefault.map((q) => q.n).join(", ")}` : `${questions.length} of ${questions.length} name a default`,
  };
  const recommended = questions.filter((q) => /recommended\s*:/i.test(q.text)).length;
  const why = questions.filter((q) => /why it matters\s*:/i.test(q.text)).length;
  checks.recommended_and_why = {
    pass: questions.length === 0 ? null : recommended === questions.length && why === questions.length,
    evidence: `Recommended: on ${recommended}, Why it matters: on ${why}, of ${questions.length}`,
  };
  const beforeLines = before.split("\n").filter((l) => l.trim()).length;
  checks.brief_shown = {
    pass: beforeLines >= 5 && /brief|goal|stop fact|what (i|we)('ll| will) (build|make|do)|the plan/i.test(before),
    evidence: `${beforeLines} lines before the questions`,
  };
  // Only the question line itself: a rival named in a Recommended: line is an answer, not a question about rivals.
  const qText = questions.map((q) => q.text.split("\n")[0]).join("\n");
  const askedFindable = (c.findable ?? []).map((f) => ({ fact: alternates(f)[0], hit: hits(qText, f) })).filter((f) => f.hit);
  checks.no_findable_asked = {
    pass: askedFindable.length === 0,
    evidence: askedFindable.length ? `asked: ${askedFindable.map((f) => `${f.fact} ("${f.hit}")`).join(", ")}` : `none of ${(c.findable ?? []).length} findable facts asked`,
  };
  const covered = (c.must_cover ?? []).map((t) => ({ topic: alternates(t)[0], hit: hits(message, t) }));
  const coveredN = covered.filter((t) => t.hit).length;
  checks.must_cover_hit = {
    pass: null,
    value: covered.length ? +(coveredN / covered.length).toFixed(3) : 1,
    evidence: `missing: ${covered.filter((t) => !t.hit).map((t) => t.topic).join(", ") || "none"}`,
  };
  const est = message.split("\n").find((l) => /\d+\s*(minutes|mins?)\b/i.test(l) && /helper|agent/i.test(l));
  checks.estimate_line = { pass: Boolean(est), evidence: est ? est.trim().slice(0, 140) : "no line with minutes and helpers" };
  const tableRows = message.split("\n").filter((l) => /^\s*\|/.test(l) && /\b(clear|partial|missing)\b/i.test(l));
  // 0.2.0 round 1 put the whole table in the message; the blind grader called it a wall. Round 2 wants one line:
  // `Coverage: 7 clear · partial: Edge cases · missing: Done signal`. Either form shows the scan was done.
  // Round 3 replaced the counted line with plain words: "Still open after reading your files: ..." / "Nothing open after reading your files."
  const coverageLine = message.split("\n").find((l) => (/^\W*coverage\b/i.test(l) && /\bclear\b/i.test(l)) || /after reading your files/i.test(l));
  checks.coverage_shown = {
    pass: tableRows.length >= 3 || Boolean(coverageLine),
    value: tableRows.length,
    evidence: coverageLine ? coverageLine.trim().slice(0, 140) : `${tableRows.length} table rows marked clear, partial or missing`,
  };
  const words = message.split(/\s+/).filter(Boolean).length;
  const beforeWords = before.split(/\s+/).filter(Boolean).length;
  // A person answers the intake in two minutes. The blind grader scored every 1,000-word message 3 or 4 on clarity.
  checks.message_le_600_words = { pass: words <= 600, value: words, evidence: `${words} words, ${beforeWords} before the first question` };
  checks.track_offered = {
    // A track line that names quick or full counts: when only one track fits the ask, the loop states it instead of asking.
    pass: message.split("\n").some((l) => /\btrack\b/i.test(l) && /\b(quick|full)\b/i.test(l)),
    evidence: (message.split("\n").find((l) => /\btrack\b/i.test(l)) ?? "no track line").trim().slice(0, 140),
  };

  // State: the intake must have started a run and stopped while it waits for the person.
  const runDir = ws ? findRunDir(ws) : null;
  const state = runDir ? readJson(path.join(runDir, "state.json"), null) : null;
  checks.state_initialised = {
    pass: Boolean(state && state.intake === "open" && (state.replies ?? 0) === 0),
    evidence: state ? `intake ${state.intake}, replies ${state.replies ?? 0}, loop ${state.loop}, version ${state.version}` : "no state.json",
  };
  const sf = runDir ? readJson(path.join(runDir, "stop-fact.json"), null) : null;
  const sfItems = Array.isArray(sf) ? sf : sf?.items ?? [];
  // Recorded, not scored: the improved intake writes these after "go", so at the end of the first turn 0 is right.
  checks.stop_fact_items = { pass: null, value: sfItems.length, evidence: sf ? `${sfItems.length} items in stop-fact.json` : "no stop-fact.json" };

  if (ws) {
    const allowed = START_CHECK_FILES[c.loop] ?? [];
    const extra = listFiles(ws).filter((f) => !fixtures.includes(f) && !f.startsWith("loop-runs/") && f !== ".loop-run" && !f.endsWith(".DS_Store") && !allowed.some((re) => re.test(f)));
    checks.turn_ended_without_working = { pass: extra.length === 0, evidence: extra.length ? `new files: ${extra.slice(0, 8).join(", ")}${extra.length > 8 ? ` and ${extra.length - 8} more` : ""}` : "no file outside the fixtures and loop-runs/" };
  } else {
    checks.turn_ended_without_working = { pass: null, evidence: "no working folder recorded" };
  }
  checks.message_words = { pass: null, value: message.split(/\s+/).filter(Boolean).length, evidence: "words in the message" };
  return checks;
}

/** The checks that count toward a pass rate (the rest are values). */
export const SCORED_CHECKS = ["ended_with_go_line", "asked_le_7", "every_question_has_default", "recommended_and_why", "brief_shown", "no_findable_asked", "estimate_line", "coverage_shown", "track_offered", "message_le_600_words", "state_initialised", "turn_ended_without_working"];
export const VALUE_CHECKS = ["asked_count", "must_cover_hit", "stop_fact_items", "message_words"];

/** Pass rates, mean values and mean LLM scores over a set of result rows. */
export function aggregate(rows) {
  const checks = {};
  for (const k of SCORED_CHECKS) checks[k] = rate(rows.map((r) => r.checks?.[k]?.pass));
  const values = {};
  for (const k of VALUE_CHECKS) values[k] = mean(rows.map((r) => r.checks?.[k]?.value));
  const llm = {};
  for (const k of LLM_KEYS) llm[k] = mean(rows.map((r) => r.llm?.scores?.[k]));
  return {
    cases: rows.length, graded_by_llm: rows.filter((r) => r.llm).length, checks, values, llm,
    mean_cost_usd: mean(rows.map((r) => r.run?.cost_usd)), mean_minutes: mean(rows.map((r) => r.run?.minutes)),
  };
}

