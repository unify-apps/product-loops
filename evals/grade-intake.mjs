#!/usr/bin/env node
// grade-intake.mjs grades each intake message two ways: script checks (counted, with evidence) and a blind LLM grade.
// The LLM grader never sees which arm wrote a message: the packet names no arm, the plugin paths are blanked out of
// the message, and in agent mode its packet and answer live in a folder named by a hash.
import fs from "node:fs";
import path from "node:path";
import { execFile } from "node:child_process";
import {
  ARMS, EVALS, LLM_KEYS, LOOPS, aggregate, blindId, caseFolder, copyDir, fail, findRunDir, fixtureText,
  loadCases, loopsOf, parseArgs, pool, readJson, resultFile, scriptChecks, writeJson,
} from "./lib.mjs";

const USAGE = `grade-intake.mjs: grade the intake messages of one arm.

  node evals/grade-intake.mjs --arm baseline|improved --loop <loop|all> [options]

Options:
  --case <id>              only this case
  --executor agent|cli     agent (default): run the script checks, save the result, and write a blind grade packet
                           per case for a helper agent; cli: run the LLM grader with claude -p itself
  --collect                run the script checks again and merge each llm-grade.json the helpers wrote
  --model <m>              the grader model for --executor cli (default claude-opus-5-5)
  --concurrency <n>        cli graders at a time (default 4)
  --pending                list the grade packets that have no llm-grade.json yet, one path per line
  --summary                only rebuild evals/results/summary.json from the result files

Writes evals/results/<arm>/<loop>/<case>.json and evals/results/summary.json.
In agent mode the packets are listed in evals/work/grade/index.json (shuffled, no arm names): give each to a fresh
helper agent ("Read <packet> and do exactly what it says"), then run this again with --collect.`;

const args = parseArgs(process.argv.slice(2));
if (args.help || args.h) { console.log(USAGE); process.exit(0); }

const GRADE_ROOT = path.join(EVALS, "work", "grade");

const RUBRIC = `You grade the first message an assistant sent after a person asked it to start a long job it will then do
alone. In this first message the assistant must show what it understood (a brief), and ask, in one round, only what
it cannot find out itself and what changes the result. Every question should come with a default the person can
accept by replying "go". After this message the assistant will never ask again, so anything left vague now gets
guessed later.

Score each of these from 0 to 10, and give one line of evidence for each, quoting the message where you can:

- completeness: the message settles (in the brief or in a question) every topic the job needs. The "must cover"
  list below names the topics a good intake must settle for this case. 10 = all settled clearly; 0 = most missing.
- no_redundancy: it does not ask what the person's words or the files already answer. The "already findable" list
  names facts the files or the ask already give; asking for one of them (rather than stating it) is a fault.
  Confirming a found fact inside the brief is fine. 10 = asks nothing it could have found; 0 = mostly redundant.
- defaults_quality: each question has a concrete, sensible default that fits this person and this ask, so "go" alone
  gives a good result. 10 = every default is specific and wise; 0 = no defaults or empty ones ("TBD", "your call").
- clarity: easy to answer in one reply: few questions, most important first, plain words, short, each question
  about one thing. Long walls of text and many questions score low. 10 = a busy person answers it in two minutes.
- respects_words: the brief and the defaults never go against what the person said (for example "a shell" stays a
  shell, "just the flow" stays flow only, "nothing else" means nothing else, a stated deadline or size is kept).
  10 = fully faithful; 0 = overrides the person.
- overall: how good this message is as the opening of a job that then runs alone for an hour. Not an average.

Judge only the message. Do not reward length. A short message that settles everything scores higher than a long one
that settles the same.`;

function redact(text, plugins) {
  let out = text;
  for (const p of plugins) if (p) out = out.split(p).join("<plugin>");
  // Folder names that would give the arm away, should a message quote a path we did not know about.
  return out.replace(/\/(baseline|improved)\//g, "/<arm>/");
}

function gradePacket(c, message, meta, outFile) {
  const fixtures = (meta?.fixtures ?? []).map((f) => {
    const text = fixtureText(c, f);
    const shown = text.length > 1500 ? `${text.slice(0, 1500)}\n… (${text.length - 1500} more characters)` : text;
    return `### ${f}\n\n\`\`\`\n${shown}\n\`\`\``;
  }).join("\n\n") || "(no files: the folder was empty)";
  return `# Task: grade one message

${RUBRIC}

## The person's ask

The person typed this command and ask (the command picks which job runs):

    /product-loops:product-${c.loop}-loop ${c.ask}

## The files in the person's folder before the assistant started

${fixtures}

## Must cover (topics a good intake settles for this case)

${(c.must_cover ?? []).map((t) => `- ${t.split("|")[0]}${t.includes("|") ? ` (also written as: ${t.split("|").slice(1).join(", ")})` : ""}`).join("\n") || "- (none listed)"}

## Already findable (facts the ask or the files already give)

${(c.findable ?? []).map((t) => `- ${t.split("|")[0]}`).join("\n") || "- (none listed)"}

## The message to grade

<message>
${message}
</message>

## Your answer

Write only this JSON to \`${outFile}\`, with every score a whole number from 0 to 10 and every evidence one line:

\`\`\`json
{
  "scores": { "completeness": 0, "no_redundancy": 0, "defaults_quality": 0, "clarity": 0, "respects_words": 0, "overall": 0 },
  "evidence": { "completeness": "", "no_redundancy": "", "defaults_quality": "", "clarity": "", "respects_words": "", "overall": "" }
}
\`\`\`

Read nothing else and write nothing else. Reply with one line: \`done\`.
`;
}

/** Reads a grader's answer in either shape: { scores, evidence } or { key: { score, evidence } } or { key: n }. */
function readGrade(file) {
  const raw = readJson(file, null);
  if (!raw) return null;
  const grade = { scores: {}, evidence: {} };
  for (const k of LLM_KEYS) {
    const v = raw.scores?.[k] ?? raw[k];
    const score = typeof v === "object" && v !== null ? v.score : v;
    grade.scores[k] = typeof score === "number" ? Math.max(0, Math.min(10, score)) : null;
    grade.evidence[k] = raw.evidence?.[k] ?? (typeof v === "object" && v !== null ? v.evidence : null) ?? null;
  }
  return grade;
}

function parseCliGrade(stdout) {
  let text = stdout;
  try { text = JSON.parse(stdout).result ?? stdout; } catch { /* plain text */ }
  const m = String(text).match(/\{[\s\S]*\}/);
  if (!m) return null;
  try { return JSON.parse(m[0]); } catch { return null; }
}

function gradeOne(arm, c) {
  const folder = caseFolder(arm, c.id);
  const meta = readJson(path.join(folder, "case.json"), null);
  const messageFile = path.join(folder, "message.md");
  if (!fs.existsSync(messageFile)) return { skipped: `${arm} ${c.id}: no message.md yet` };
  const message = fs.readFileSync(messageFile, "utf8");
  const ws = meta?.ws && fs.existsSync(meta.ws) ? meta.ws : null;
  // Keep the run's state next to the message, so the results survive the temp folder being cleaned.
  if (ws) {
    const run = findRunDir(ws);
    if (run) copyDir(run, path.join(folder, "loop-runs", path.basename(run)));
    if (fs.existsSync(path.join(ws, ".loop-run"))) fs.copyFileSync(path.join(ws, ".loop-run"), path.join(folder, ".loop-run"));
  }
  const checks = scriptChecks(c, message, ws, meta?.fixtures ?? Object.keys(c.files ?? {}));
  const id = blindId(arm, c.id);
  const blindFile = path.join(GRADE_ROOT, id, "llm-grade.json");
  const llmFile = fs.existsSync(blindFile) ? blindFile : path.join(folder, "llm-grade.json");
  const llm = fs.existsSync(llmFile) ? readGrade(llmFile) : null;
  const run = readJson(path.join(folder, "run.json"), null);
  const result = {
    arm, loop: c.loop, case: c.id, ask: c.ask, expected_track: c.expected_track, notes: c.notes,
    must_cover: c.must_cover, findable: c.findable, fixtures: meta?.fixtures ?? [],
    message, checks, llm,
    run: { executor: meta?.executor ?? null, minutes: run?.minutes ?? null, cost_usd: run?.cost_usd ?? null, num_turns: run?.num_turns ?? null, is_error: run?.is_error ?? null },
    gradedAt: new Date().toISOString(),
  };
  writeJson(resultFile(arm, c.loop, c.id), result);
  return { result, message, meta, id, folder };
}

function summary() {
  const out = { builtAt: new Date().toISOString(), arms: {} };
  for (const arm of ARMS) {
    const perLoop = {};
    const all = [];
    for (const loop of LOOPS) {
      const dir = path.join(EVALS, "results", arm, loop);
      const rows = fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => f.endsWith(".json")).map((f) => readJson(path.join(dir, f))) : [];
      if (!rows.length) continue;
      perLoop[loop] = aggregate(rows);
      all.push(...rows);
    }
    if (all.length) out.arms[arm] = { overall: aggregate(all), loops: perLoop };
  }
  writeJson(path.join(EVALS, "results", "summary.json"), out);
  return out;
}

function runCliGrader(c, prep, plugins, model) {
  const prompt = gradePacket(c, redact(prep.message, plugins), prep.meta, "stdout (print the JSON and nothing else)");
  return new Promise((resolve) => {
    execFile("claude", ["-p", prompt, "--output-format", "json", "--model", model, "--no-session-persistence"],
      { cwd: EVALS, timeout: 10 * 60 * 1000, maxBuffer: 16 * 1024 * 1024 }, (error, stdout) => {
        const grade = parseCliGrade(stdout ?? "");
        if (grade) writeJson(path.join(GRADE_ROOT, prep.id, "llm-grade.json"), grade);
        console.log(`${grade ? "ok" : "failed"} grade ${c.id}${error ? `: ${String(error.message).slice(0, 120)}` : ""}`);
        resolve();
      });
  });
}

if (args.summary) { summary(); console.log("ok summary: evals/results/summary.json"); process.exit(0); }

const arm = args.arm;
if (!ARMS.includes(arm)) fail(`--arm must be baseline or improved.\n\n${USAGE}`);
const loops = loopsOf(args.loop);
const executor = args.executor ?? "agent";
const cases = loops.flatMap((loop) => loadCases(loop, args.case));

if (args.pending) {
  for (const c of cases) {
    const id = blindId(arm, c.id);
    const p = path.join(GRADE_ROOT, id, "GRADE-PACKET.md");
    if (fs.existsSync(p) && !fs.existsSync(path.join(GRADE_ROOT, id, "llm-grade.json"))) console.log(p);
  }
  process.exit(0);
}

const graded = [];
for (const c of cases) {
  const g = gradeOne(arm, c);
  if (g.skipped) { console.error(`skip ${g.skipped}`); continue; }
  graded.push({ c, ...g });
}

if (!args.collect) {
  const plugins = [graded[0]?.meta?.plugin].filter(Boolean);
  const todo = graded.filter((g) => !g.result.llm);
  if (executor === "agent") {
    const index = readJson(path.join(GRADE_ROOT, "index.json"), { packets: [] });
    for (const g of todo) {
      const dir = path.join(GRADE_ROOT, g.id);
      const out = path.join(dir, "llm-grade.json");
      const text = gradePacket(g.c, redact(g.message, plugins.concat(g.meta?.ws ?? [])), g.meta, out);
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(path.join(dir, "GRADE-PACKET.md"), text);
      // The same packet beside the case, for a person reading one case. Helpers get the blind path from the index.
      fs.writeFileSync(path.join(g.folder, "GRADE-PACKET.md"), text);
      if (!index.packets.includes(path.join(dir, "GRADE-PACKET.md"))) index.packets.push(path.join(dir, "GRADE-PACKET.md"));
    }
    // Sorted by the hash names, which mixes the arms, so a grader working down the list cannot guess the arm.
    index.packets.sort((a, b) => path.basename(path.dirname(a)).localeCompare(path.basename(path.dirname(b))));
    writeJson(path.join(GRADE_ROOT, "index.json"), index);
    for (const g of todo) console.log(path.join(GRADE_ROOT, g.id, "GRADE-PACKET.md"));
    console.error(`ok grade-intake: script checks saved for ${graded.length} cases; ${todo.length} grade packets to hand out. Then run with --collect.`);
  } else {
    const model = args.model && args.model !== true ? args.model : "claude-opus-5-5";
    const n = Number(args.concurrency) > 0 ? Number(args.concurrency) : 4;
    await pool(todo.map((g) => () => runCliGrader(g.c, g, plugins.concat(g.meta?.ws ?? []), model)), n);
    for (const c of cases) gradeOne(arm, c);
  }
} else {
  const missing = graded.filter((g) => !g.result.llm).map((g) => g.c.id);
  console.error(`ok collect: ${graded.length - missing.length} of ${graded.length} cases have an LLM grade${missing.length ? `; missing: ${missing.join(", ")}` : ""}.`);
}
summary();
console.error("ok summary: evals/results/summary.json");
