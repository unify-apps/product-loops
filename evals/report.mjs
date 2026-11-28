#!/usr/bin/env node
// report.mjs joins every result into evals/results/report.json: one file holding all an HTML comparison page needs,
// so the page does no work of its own. Per case: the ask, both messages, both sets of checks and LLM scores, and the
// deltas. Per loop and overall: the aggregates of each arm and their difference. Routing per arm. And a short
// summary of how the plugin itself changed.
import fs from "node:fs";
import path from "node:path";
import {
  ARMS, DEFAULT_BASELINE, DEFAULT_IMPROVED, EVALS, LLM_KEYS, LOOPS, SCORED_CHECKS, VALUE_CHECKS, aggregate, listFiles, loadCases, parseArgs, readJson, scriptChecks, writeJson,
} from "./lib.mjs";

const USAGE = `report.mjs: build evals/results/report.json from the graded results.

  node evals/report.mjs [--out <file>] [--plugin-dir-baseline <p>] [--plugin-dir-improved <p>]

Run it after grade-intake.mjs --collect (both arms) and run-routing.mjs --collect (both arms). Cases or arms with no
result yet are kept with null values, so a partial report still builds.`;

const args = parseArgs(process.argv.slice(2));
if (args.help || args.h) { console.log(USAGE); process.exit(0); }
const out = path.resolve(args.out && args.out !== true ? args.out : path.join(EVALS, "results", "report.json"));

const result = (arm, loop, id) => readJson(path.join(EVALS, "results", arm, loop, `${id}.json`), null);
const diff = (a, b) => (typeof a === "number" && typeof b === "number" ? +(b - a).toFixed(3) : null);

function armView(r) {
  if (!r) return null;
  const passed = SCORED_CHECKS.filter((k) => r.checks?.[k]?.pass === true).length;
  const scored = SCORED_CHECKS.filter((k) => typeof r.checks?.[k]?.pass === "boolean").length;
  return { message: r.message, checks: r.checks, checks_passed: passed, checks_scored: scored, llm: r.llm, run: r.run };
}

function deltas(b, i) {
  if (!b || !i) return null;
  const d = {
    asked_count: diff(b.checks?.asked_count?.value, i.checks?.asked_count?.value),
    must_cover_hit: diff(b.checks?.must_cover_hit?.value, i.checks?.must_cover_hit?.value),
    message_words: diff(b.checks?.message_words?.value, i.checks?.message_words?.value),
    checks_passed: diff(b.checks_passed, i.checks_passed),
    llm: {},
  };
  for (const k of LLM_KEYS) d.llm[k] = diff(b.llm?.scores?.[k], i.llm?.scores?.[k]);
  return d;
}

function aggDelta(b, i) {
  if (!b || !i) return null;
  const d = { checks: {}, values: {}, llm: {} };
  for (const k of SCORED_CHECKS) d.checks[k] = diff(b.checks[k], i.checks[k]);
  for (const k of VALUE_CHECKS) d.values[k] = diff(b.values[k], i.values[k]);
  for (const k of LLM_KEYS) d.llm[k] = diff(b.llm[k], i.llm[k]);
  return d;
}

// ---- cases, loops, overall
const cases = [];
const rowsBy = { baseline: {}, improved: {} };
for (const loop of LOOPS) {
  for (const c of loadCases(loop)) {
    const raw = Object.fromEntries(ARMS.map((arm) => [arm, result(arm, loop, c.id)]));
    for (const arm of ARMS) if (raw[arm]) (rowsBy[arm][loop] ??= []).push(raw[arm]);
    const views = Object.fromEntries(ARMS.map((arm) => [arm, armView(raw[arm])]));
    cases.push({
      id: c.id, loop, skill: `product-${loop}-loop`, ask: c.ask, expected_track: c.expected_track, notes: c.notes,
      fixtures: Object.keys(c.files ?? {}), must_cover: c.must_cover, findable: c.findable,
      arms: views, deltas: deltas(views.baseline, views.improved),
    });
  }
}

const loops = {};
for (const loop of LOOPS) {
  const b = rowsBy.baseline[loop]?.length ? aggregate(rowsBy.baseline[loop]) : null;
  const i = rowsBy.improved[loop]?.length ? aggregate(rowsBy.improved[loop]) : null;
  loops[loop] = { baseline: b, improved: i, delta: aggDelta(b, i) };
}
const allOf = (arm) => Object.values(rowsBy[arm]).flat();
const overallB = allOf("baseline").length ? aggregate(allOf("baseline")) : null;
const overallI = allOf("improved").length ? aggregate(allOf("improved")) : null;

// ---- routing
const routing = {};
for (const arm of ARMS) {
  const r = readJson(path.join(EVALS, "results", arm, "routing.json"), null);
  routing[arm] = r ? { accuracy: r.accuracy, positives: r.positives, near_misses: r.near_misses, per_loop: r.per_loop, confusion: r.confusion, missing: r.missing, description_chars: Object.fromEntries(r.skills.map((s) => [s.name, s.description.length])) } : null;
}
const routingItems = readJson(path.join(EVALS, "routing.json")).items.map((it) => {
  const got = Object.fromEntries(ARMS.map((arm) => {
    const r = readJson(path.join(EVALS, "results", arm, "routing.json"), null);
    return [arm, r?.rows.find((x) => x.id === it.id)?.got ?? null];
  }));
  return { ...it, got };
});

// ---- the plugin itself
function pluginFacts(arm) {
  const dir = path.resolve(arm === "baseline" ? (args["plugin-dir-baseline"] ?? DEFAULT_BASELINE) : (args["plugin-dir-improved"] ?? DEFAULT_IMPROVED));
  if (!fs.existsSync(path.join(dir, "skills"))) return null;
  const files = listFiles(dir);
  const own = files.filter((f) => !/^skills\/[^/]+\/shared\//.test(f) && !f.startsWith("evals/"));
  const stateScript = path.join(dir, "shared", "scripts", "loop-state.mjs");
  const help = fs.existsSync(stateScript) ? (fs.readFileSync(stateScript, "utf8").match(/const HELP = `([\s\S]*?)`;/)?.[1] ?? "") : "";
  const commands = [...new Set([...help.matchAll(/^\s{2}([a-z][a-z-]*)\b/gm)].map((m) => m[1]))];
  const testFiles = files.filter((f) => /^test\/.*\.test\.m?js$/.test(f));
  const tests = testFiles.reduce((n, f) => n + (fs.readFileSync(path.join(dir, f), "utf8").match(/\b(test|it)\(\s*["'`]/g) ?? []).length, 0);
  const lines = (f) => fs.readFileSync(path.join(dir, f), "utf8").split("\n").length;
  return {
    path: dir,
    files: own.length,
    files_with_shared_copies: files.filter((f) => !f.startsWith("evals/")).length,
    skill_lines: Object.fromEntries(LOOPS.map((l) => [l, fs.existsSync(path.join(dir, "skills", `product-${l}-loop`, "SKILL.md")) ? lines(`skills/product-${l}-loop/SKILL.md`) : null])),
    loop_rules_lines: fs.existsSync(path.join(dir, "shared", "loop-rules.md")) ? lines("shared/loop-rules.md") : null,
    state_commands: commands,
    hooks: files.filter((f) => /^shared\/hooks\/.*\.mjs$/.test(f)).map((f) => path.basename(f)),
    shared_scripts: files.filter((f) => /^shared\/scripts\//.test(f)).map((f) => path.basename(f)),
    test_files: testFiles,
    tests,
    evals_files: files.filter((f) => f.startsWith("evals/") && !f.startsWith("evals/work/")).length,
  };
}
const pb = pluginFacts("baseline");
const pi = pluginFacts("improved");
const setDiff = (a = [], b = []) => b.filter((x) => !a.includes(x));
const plugin = {
  baseline: pb, improved: pi,
  diff: pb && pi ? {
    files: pi.files - pb.files,
    new_state_commands: setDiff(pb.state_commands, pi.state_commands),
    new_hooks: setDiff(pb.hooks, pi.hooks),
    new_shared_scripts: setDiff(pb.shared_scripts, pi.shared_scripts),
    new_test_files: setDiff(pb.test_files, pi.test_files),
    tests: pi.tests - pb.tests,
  } : null,
};

// ---- earlier rounds of the improved arm, kept in evals/results/improved-round<n>/ when a round was re-run.
// Each round's messages are scored again with today's checks, so a check added later (message length) applies to
// every round. The checks that need the run folder keep the values saved at the time.
const rounds = [];
for (const dir of fs.readdirSync(path.join(EVALS, "results")).filter((d) => /^improved-round\d+$/.test(d)).sort()) {
  const rows = [];
  for (const loop of LOOPS) {
    const loopDir = path.join(EVALS, "results", dir, loop);
    if (!fs.existsSync(loopDir)) continue;
    for (const f of fs.readdirSync(loopDir).filter((x) => x.endsWith(".json"))) {
      const r = readJson(path.join(loopDir, f));
      const fresh = scriptChecks({ ...r, loop }, r.message ?? "", null, []);
      const checks = { ...r.checks };
      for (const k of ["coverage_shown", "message_le_600_words", "track_offered", "message_words"]) if (fresh[k]) checks[k] = fresh[k];
      rows.push({ ...r, checks });
    }
  }
  if (rows.length) rounds.push({ name: `0.2.0 ${dir.replace("improved-", "").replace("round", "round ")}`, dir, overall: aggregate(rows) });
}

const graded = (arm) => cases.filter((c) => c.arms[arm]).length;
const report = {
  builtAt: new Date().toISOString(),
  about: "Intake-only comparison of product-loops baseline (0.1.5) and improved (0.2.0). Script checks are counted from each message and the run folder; LLM scores are from a blind grader (0 to 10). Deltas are improved minus baseline.",
  keys: { scored_checks: SCORED_CHECKS, value_checks: VALUE_CHECKS, llm: LLM_KEYS, loops: LOOPS },
  coverage: { cases: cases.length, baseline: graded("baseline"), improved: graded("improved"), both: cases.filter((c) => c.deltas).length },
  overall: { baseline: overallB, improved: overallI, delta: aggDelta(overallB, overallI) },
  rounds,
  loops,
  routing: { arms: routing, items: routingItems },
  plugin,
  cases,
};
writeJson(out, report);
console.log(`ok report: ${out} (${report.coverage.both} of ${cases.length} cases have both arms; routing ${routing.baseline?.accuracy ?? "-"} -> ${routing.improved?.accuracy ?? "-"})`);
