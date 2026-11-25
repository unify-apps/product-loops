#!/usr/bin/env node
// loop-state.mjs owns state.json in a loop's run folder. Every loop step calls it, and only the main session does.
//   node loop-state.mjs <command> [options] [--json]      (run `node loop-state.mjs help` for every command)
// It writes only inside the run folder, plus the `.loop-run` pointer file in the working folder and the lessons in
// `loop-runs/solutions/<loop>/` (written by learn, read by the next run's intake).
// It never deletes anything. On a refusal it prints why to stderr and exits 1.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { sendNotice } from "./notify.mjs";
import {
  DEFAULT_BUDGET, POINTER_FILE, STATE_FILE, STATE_VERSION, STOP_FACT_FILE, TRACKS,
  budgetLeft, findRun, isEnded, isPaused, isStale, nextNode, readState, readStopFact, writeJsonFile,
} from "./run-files.mjs";

const HELP = `loop-state.mjs: the state of one loop run.

  init --loop <name> --nodes <intake,...,review,handover> [--skill-dir <folder>] [--track quick|full]
       [--budget-minutes <n>] [--run <folder>] [--work <folder>] [--replace]
  stop-fact add --item "<one checkable part of the stop fact>"     intake only, before close-intake
  close-intake                      after the person replies "go"; needs brief.md, one reply and one stop-fact item
  stop-fact pass --from <review.json>     while the review node is running; marks the items the reviewer passed
  stop-fact status
  start <node>
  done <node> --check "<what proved it>" --proof <file>
  retry <node> --why "<what failed>"      at most 3 times per node
  left <node> --why "<why it is left for the person>"
  hold --step "<what waits>" --kind delete|money|sign-in --why "<why>" [--node <node>]
  decide --question "<question>" --answer "<the default you took>" [--node <node>]
  finish --stop-fact "<the fact that is now true>"   needs handover.md in the run folder
  status
  report                            writes metrics.json and prints minutes, retries, pushes and decisions per node
  resume [--continue]               prints where the run is; --continue un-pauses it with 30 more minutes and 6 pushes
  learn --rule "<one sentence>" --because "<what failed, then passed after which change>" [--node <node>]
  stop --why "<why>"                ends a run that must not go on (the hooks then let the person go)

Every command but init finds the run from the .loop-run file in this folder or a folder above it.
Add --json for JSON on stdout. On success the plain output starts with "ok <command>".`;

const MAX_RETRIES = 3; // the contract: a failed node check is retried at most 3 times, then left for the person
const HOLD_KINDS = ["delete", "money", "sign-in"];
// What resume --continue adds when the person says to go on: enough for a few more nodes, small enough that a run
// that is truly stuck pauses again soon instead of burning an afternoon.
const MORE_MINUTES = 30;
const MORE_PUSHES = 6;
// A lesson must come from a check that failed and then passed after a change. Without a failure, it is a guess.
const FAILURE_WORD = /\b(failed|refused)\b|\bFAIL\b/iu;
const scriptPath = fs.realpathSync(fileURLToPath(import.meta.url));

// The review node is the one just before handover, whatever it is called: "review" in most loops, "recheck" in the
// review loop. It is the last fresh look at the work, so it is the only node that may pass stop-fact items.
function reviewNodeOf(state) {
  return state.nodes.length >= 2 ? state.nodes[state.nodes.length - 2] : null;
}

class Refusal extends Error {}
const refuse = (message) => { throw new Refusal(message); };
const now = () => new Date().toISOString();

export function parseArgs(argv) {
  const [command, ...rest] = argv;
  const options = { _: [] };
  for (let i = 0; i < rest.length; i++) {
    const arg = rest[i];
    if (arg === "--json" || arg === "--replace" || arg === "--continue") options[arg.slice(2)] = true;
    else if (arg.startsWith("--")) {
      if (rest[i + 1] === undefined) refuse(`${arg} needs a value.`);
      options[arg.slice(2)] = rest[++i];
    } else options._.push(arg);
  }
  return { command, options };
}

function stamp(date = new Date()) {
  const two = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}${two(date.getMonth() + 1)}${two(date.getDate())}-${two(date.getHours())}${two(date.getMinutes())}${two(date.getSeconds())}`;
}

function writeState(runDir, state) {
  state.changedAt = now();
  const file = path.join(runDir, STATE_FILE);
  writeJsonFile(file, state);
  if (readState(runDir).changedAt !== state.changedAt) refuse(`${file} did not keep the change.`);
}

function needText(options, name) {
  const value = String(options[name] ?? "").trim();
  if (!value) refuse(`--${name} is required and cannot be empty.`);
  return value;
}

function nodeOf(state, name) {
  if (!name) refuse("Name the node, for example: start haiku.");
  const node = state.nodes.find((n) => n.name === name);
  if (!node) refuse(`There is no node "${name}". The nodes are: ${state.nodes.map((n) => n.name).join(", ")}.`);
  return node;
}

function earlierOpen(state, node) {
  const index = state.nodes.indexOf(node);
  return state.nodes.slice(0, index).find((n) => n.status !== "done" && n.status !== "left") ?? null;
}

function needOrder(state, node) {
  const open = earlierOpen(state, node);
  if (open) refuse(`Node "${open.name}" comes first and is ${open.status}. Finish it (done) or leave it (left) before "${node.name}".`);
}

function needLive(state) {
  if (state.finished) refuse("This run is finished. Start a new one with init.");
  if (state.stopped) refuse("This run was stopped. Start a new one with init.");
}

// A paused run waits for the person. Working on would spend a budget they have not given.
function needNotPaused(state) {
  if (isPaused(state)) refuse(`The run is paused: ${state.paused.why}. Run resume --continue to go on, or stop.`);
}

function needIntakeClosed(state, node) {
  if (state.intake !== "closed") refuse(`The intake is still open. Run close-intake after the person says "go", then ${node ? `work on "${node.name}"` : "go on"}.`);
}

function init(options) {
  const loop = needText(options, "loop");
  const names = needText(options, "nodes").split(",").map((n) => n.trim()).filter(Boolean);
  if (names[0] !== "intake") refuse('The first node must be "intake".');
  if (names.at(-1) !== "handover") refuse('The last node must be "handover".');
  if (names.length < 3) refuse("A loop needs at least intake, one work node and handover.");
  if (new Set(names).size !== names.length) refuse("Two nodes have the same name.");
  const bad = names.find((n) => !/^[a-z0-9][a-z0-9-]*$/u.test(n));
  if (bad) refuse(`Node name "${bad}" must use only small letters, numbers and dashes.`);
  // The three below have defaults, so an init line written before version 0.2.0 still works.
  const track = options.track ?? "full";
  if (!TRACKS.includes(track)) refuse(`--track must be one of ${TRACKS.join(", ")}.`);
  const minutes = options["budget-minutes"] === undefined ? DEFAULT_BUDGET.minutes : Number(options["budget-minutes"]);
  if (!Number.isInteger(minutes) || minutes < 1) refuse("--budget-minutes must be a whole number of minutes, 1 or more.");
  const skillDir = options["skill-dir"] ? path.resolve(options["skill-dir"]) : null;
  const workDir = path.resolve(options.work ?? process.env.CLAUDE_PROJECT_DIR ?? process.cwd());
  const old = findRun([workDir]);
  if (old && old.workDir === workDir && !isEnded(old.state) && !isStale(old.state) && !options.replace) {
    refuse(`A run of ${old.state.loop} is still going in ${old.runDir}. Finish it, stop it, or pass --replace to stop it and start this one.`);
  }
  if (old && old.workDir === workDir && !isEnded(old.state) && options.replace) {
    old.state.stopped = { at: now(), why: `replaced by a new run of ${loop}` };
    writeState(old.runDir, old.state);
  }
  const runDir = path.resolve(workDir, options.run ?? path.join("loop-runs", `${loop}-${stamp()}`));
  if (fs.existsSync(path.join(runDir, STATE_FILE))) refuse(`${runDir} already has a run. Pick another --run folder.`);
  fs.mkdirSync(runDir, { recursive: true });
  // The folders every helper needs, and a decisions file, so the hand-over's link to it is never dead.
  for (const sub of ["briefs", "reports"]) fs.mkdirSync(path.join(runDir, sub), { recursive: true });
  const decisionsFile = path.join(runDir, "decisions.md");
  if (!fs.existsSync(decisionsFile)) fs.writeFileSync(decisionsFile, "# Decisions\n\nWhat the run chose on its own, without asking the person. None yet.\n");
  const at = now();
  const state = {
    version: STATE_VERSION, loop, workDir, runDir, script: scriptPath, createdAt: at, changedAt: at,
    intake: "open", finished: null, stopped: null, paused: null, track, skillDir,
    budget: { minutes, maxPushes: DEFAULT_BUDGET.maxPushes, maxDecisions: DEFAULT_BUDGET.maxDecisions, startedAt: null }, pushes: 0,
    nodes: names.map((name, i) => ({ name, status: i === 0 ? "running" : "pending", startedAt: i === 0 ? at : null, endedAt: null, check: null, proof: null, retries: [], leftWhy: null })),
    held: [], decisions: 0, replies: 0,
  };
  writeState(runDir, state);
  fs.writeFileSync(path.join(workDir, POINTER_FILE), `${runDir}\n`);
  const lessons = lessonFiles(workDir, loop);
  const lessonText = lessons.length ? `${lessons.length} lessons in ${path.relative(workDir, solutionsDir(workDir, loop))}: read them and list them in the brief under Lessons applied` : "0 lessons for this loop yet";
  return { state, line: `ok init ${loop}: nodes ${names.join(",")}; track ${track}; budget ${minutes} minutes; run folder ${runDir}; node "intake" is running; ${lessonText}` };
}

function closeIntake(run, options = {}) {
  const { state } = run;
  needLive(state);
  if (state.intake === "closed") refuse("The intake is already closed.");
  const brief = path.join(run.runDir, "brief.md");
  if (!fs.existsSync(brief) || !fs.readFileSync(brief, "utf8").trim()) refuse(`Write the brief first: ${brief} is missing or empty.`);
  // The first message is never the go: the person has not seen the brief or the defaults yet.
  // count-person-replies.mjs (a hook) adds 1 to `replies` for each message or AskUserQuestion answer after init.
  if (readStopFact(run.runDir).items.length < 1) refuse("Write the stop fact as a checklist first: run stop-fact add --item \"<one checkable part>\" for each part (3 to 8 items).");
  if (!(state.replies >= 1)) refuse("The person has not replied since the run started. Show the brief and the questions, end your turn, and wait for their answer. Their first message is never the go, even when it says to build. If this keeps happening after they replied, the count-person-replies hook is not installed.");
  // The person picks the track in their reply, after init already ran with the recommended one.
  if (options.track !== undefined) {
    if (!TRACKS.includes(options.track)) refuse(`--track must be one of ${TRACKS.join(", ")}.`);
    state.track = options.track;
  }
  const intake = state.nodes[0];
  Object.assign(intake, { status: "done", endedAt: now(), check: `the person said "go" (${state.replies} replies)`, proof: path.relative(state.workDir, brief) });
  state.intake = "closed";
  state.budget.startedAt = now(); // the clock starts here: the person's time to answer never counts
  writeState(run.runDir, state);
  return { state, line: `ok close-intake: the intake is closed; track ${state.track}. From now on never ask the person anything. Next node: ${nextNode(state)?.name}` };
}

function start(run, options) {
  const { state } = run;
  needLive(state);
  needNotPaused(state);
  const node = nodeOf(state, options._[0]);
  needIntakeClosed(state, node);
  needOrder(state, node);
  if (node.status === "done" || node.status === "left") refuse(`Node "${node.name}" is already ${node.status}.`);
  if (node.status !== "running") Object.assign(node, { status: "running", startedAt: now() });
  writeState(run.runDir, state);
  return { state, line: `ok start ${node.name}` };
}

function done(run, options) {
  const { state } = run;
  needLive(state);
  needNotPaused(state);
  const node = nodeOf(state, options._[0]);
  if (node.name === "intake") refuse('Use close-intake to finish the intake.');
  needIntakeClosed(state, node);
  needOrder(state, node);
  if (node.status !== "running") refuse(`Node "${node.name}" is ${node.status}. Run start ${node.name} first.`);
  const check = needText(options, "check");
  const proof = path.resolve(state.workDir, needText(options, "proof"));
  if (!fs.existsSync(proof)) refuse(`The proof file ${proof} does not exist. Write it, then run done again.`);
  Object.assign(node, { status: "done", endedAt: now(), check, proof: path.relative(state.workDir, proof) });
  writeState(run.runDir, state);
  const next = nextNode(state);
  return { state, line: `ok done ${node.name}: proof ${node.proof}${next ? `. Next node: ${next.name}` : ". Every node is done or left: run finish"}` };
}

function retry(run, options) {
  const { state } = run;
  needLive(state);
  needNotPaused(state);
  const node = nodeOf(state, options._[0]);
  if (node.status !== "running") refuse(`Node "${node.name}" is ${node.status}, not running.`);
  const why = needText(options, "why");
  if (node.retries.length >= MAX_RETRIES) refuse(`Node "${node.name}" has used its ${MAX_RETRIES} retries. Run: left ${node.name} --why "<what still fails>", then go on.`);
  node.retries.push({ at: now(), why });
  writeState(run.runDir, state);
  return { state, line: `ok retry ${node.name}: retry ${node.retries.length} of ${MAX_RETRIES}` };
}

function left(run, options) {
  const { state } = run;
  needLive(state);
  needNotPaused(state);
  const node = nodeOf(state, options._[0]);
  if (node.name === "intake") refuse("The intake cannot be left. Ask the person, then close it.");
  needIntakeClosed(state, node);
  needOrder(state, node);
  if (node.status === "done" || node.status === "left") refuse(`Node "${node.name}" is already ${node.status}.`);
  Object.assign(node, { status: "left", startedAt: node.startedAt ?? now(), endedAt: now(), leftWhy: needText(options, "why") });
  writeState(run.runDir, state);
  const next = nextNode(state);
  return { state, line: `ok left ${node.name}: ${node.leftWhy}${next ? `. Next node: ${next.name}` : ". Every node is done or left: run finish"}` };
}

function hold(run, options) {
  const { state } = run;
  needLive(state);
  needNotPaused(state);
  const kind = needText(options, "kind");
  if (!HOLD_KINDS.includes(kind)) refuse(`--kind must be one of ${HOLD_KINDS.join(", ")}. Anything else never waits: take the default and run decide.`);
  const node = options.node ? nodeOf(state, options.node) : state.nodes.find((n) => n.status === "running") ?? null;
  state.held.push({ at: now(), node: node?.name ?? null, step: needText(options, "step"), kind, why: needText(options, "why") });
  writeState(run.runDir, state);
  return { state, line: `ok hold: "${options.step}" is skipped and will be listed in the hand-over. Go on with the run.` };
}

function decide(run, options) {
  const { state } = run;
  needLive(state);
  needNotPaused(state);
  const question = needText(options, "question");
  const answer = needText(options, "answer");
  const node = options.node ? nodeOf(state, options.node) : state.nodes.find((n) => n.status === "running") ?? null;
  const file = path.join(run.runDir, "decisions.md");
  if (!fs.existsSync(file)) fs.writeFileSync(file, "# Decisions\n\nWhat the run chose on its own, without asking the person.\n");
  fs.appendFileSync(file, `\n## ${question}\n\n- Answer: ${answer}\n- Node: ${node?.name ?? "none"}\n- When: ${now()}\n`);
  state.decisions += 1;
  writeState(run.runDir, state);
  return { state, line: `ok decide: written to ${path.relative(state.workDir, file)}${decisionWarning(state)}` };
}

function finish(run, options) {
  const { state } = run;
  needLive(state);
  needIntakeClosed(state, null);
  const open = nextNode(state);
  if (open) refuse(`Node "${open.name}" is ${open.status}. Every node must be done or left before finish.`);
  const handover = path.join(run.runDir, "handover.md");
  if (!fs.existsSync(handover)) refuse(`Write the hand-over first: ${handover} is missing.`);
  const stopFact = needText(options, "stop-fact");
  const items = readStopFact(run.runDir).items;
  const unpassed = items.filter((item) => !item.passes);
  const review = reviewNodeOf(state);
  // A review that says done has passed every item, or it was not a review. A review that was left is the person's
  // to finish, so the run may end, and the hand-over lists what is still open.
  if (review?.status === "done" && unpassed.length) {
    refuse(`The review node is done, but ${unpassed.length} stop-fact items do not pass: ${unpassed.map((i) => i.id).join(", ")}. Run stop-fact pass --from <review.json> after a review that passes them, or retry the review.`);
  }
  state.finished = { at: now(), stopFact };
  writeState(run.runDir, state);
  const metrics = writeMetrics(run);
  const leftNodes = state.nodes.filter((n) => n.status === "left").map((n) => n.name);
  const passing = `stop fact: ${items.length - unpassed.length} of ${items.length} items pass`;
  const lines = [`ok finish: ${state.nodes.length - leftNodes.length} nodes done, ${leftNodes.length} left${leftNodes.length ? ` (${leftNodes.join(", ")})` : ""}, ${state.held.length} steps held, ${state.decisions} decisions; ${passing}. Stop fact: ${stopFact}`];
  if (unpassed.length) lines.push("not passed (list them in the hand-over):", ...unpassed.map((i) => `  ${i.id} ${i.item}`));
  lines.push(`metrics: ${path.relative(state.workDir, metrics.file)}`);
  const how = sendNotice(`${state.loop} finished`, `${state.nodes.length - leftNodes.length} nodes done, ${leftNodes.length} left. ${passing}.`);
  // The last message must say whether a notification went out, so finish says it here, in the person's words.
  lines.push(how === "failed" ? "notification: not sent (the notifier could not start)" : how === "log" ? "notification: written to the log file (PRODUCT_LOOPS_NOTIFY_LOG)" : `notification: sent (${how === "command" ? "your PRODUCT_LOOPS_NOTIFY_CMD" : "the system notifier, and Slack when a link is set"})`);
  return { state, line: lines.join("\n") };
}

function stop(run, options) {
  const { state } = run;
  needLive(state);
  state.stopped = { at: now(), why: needText(options, "why") };
  writeState(run.runDir, state);
  sendNotice(`${state.loop} stopped`, state.stopped.why);
  return { state, line: `ok stop: the run is stopped. The hooks no longer hold the session.` };
}

// ---- the stop fact as a checklist (stop-fact.json in the run folder) ----

function writeStopFact(runDir, value) {
  writeJsonFile(path.join(runDir, STOP_FACT_FILE), value);
}

function stopFactTable(items) {
  if (!items.length) return ["  (no stop-fact items)"];
  return items.map((i) => `  ${i.passes ? "pass   " : "not yet"} ${i.id} ${i.item}${i.proof ? ` (proof: ${i.proof})` : ""}`);
}

function stopFactCommand(run, options) {
  const { state } = run;
  const action = options._[0];
  const fact = readStopFact(run.runDir);
  if (action === "add") {
    needLive(state);
    // The stop fact is what the person agreed to at the go. Changing it later would move the finish line.
    if (state.intake === "closed") refuse("The intake is closed, so the stop fact is fixed. Items are added only before close-intake.");
    const item = needText(options, "item");
    const entry = { id: `S${fact.items.length + 1}`, item, passes: false, proof: null, note: null };
    writeStopFact(run.runDir, { ...fact, items: [...fact.items, entry] });
    return { state, line: `ok stop-fact add ${entry.id}: ${item}` };
  }
  if (action === "pass") {
    needLive(state);
    const review = reviewNodeOf(state);
    if (!review || review.name === "intake") refuse("This run has no review node (the node just before handover), so nothing can pass the stop fact.");
    if (review.status !== "running") refuse(`The review node "${review.name}" is ${review.status}. Run start ${review.name}, let the reviewer write its review.json, then run stop-fact pass.`);
    const file = path.resolve(state.workDir, needText(options, "from"));
    if (!fs.existsSync(file)) refuse(`The review file ${file} does not exist.`);
    let verdict;
    try { verdict = JSON.parse(fs.readFileSync(file, "utf8")); } catch { refuse(`${file} is not valid JSON.`); }
    if (!Array.isArray(verdict?.items)) refuse(`${file} has no "items" list. It needs { "items": [{ "id": "S1", "passes": true, "evidence": "..." }] }.`);
    const proof = path.relative(state.workDir, file);
    const unknown = [];
    for (const row of verdict.items) {
      const item = fact.items.find((i) => i.id === row?.id);
      if (!item) { unknown.push(String(row?.id)); continue; }
      // An item passes only with what the reviewer saw. A bare "true" is a claim, not a proof.
      const evidence = String(row.evidence ?? "").trim();
      if (row.passes === true && evidence) Object.assign(item, { passes: true, proof, note: evidence });
    }
    fact.review = { file: proof, spec: verdict.spec ?? null, quality: verdict.quality ?? null, verdict: verdict.verdict ?? null, at: now() };
    writeStopFact(run.runDir, fact);
    const notYet = fact.items.filter((i) => !i.passes).map((i) => i.id);
    return { state, line: `ok stop-fact pass: ${fact.items.length - notYet.length} of ${fact.items.length} items pass${notYet.length ? ` (${notYet.join(", ")} do not)` : ""}, from ${proof}${unknown.length ? `; unknown ids ignored: ${unknown.join(", ")}` : ""}` };
  }
  if (action === "status") {
    const passing = fact.items.filter((i) => i.passes).length;
    return { state, line: [`ok stop-fact status: ${passing} of ${fact.items.length} items pass`, ...stopFactTable(fact.items)].join("\n") };
  }
  return refuse('Name what to do: stop-fact add --item "<text>", stop-fact pass --from <review.json>, or stop-fact status.');
}

// ---- budget words ----

function decisionWarning(state) {
  const max = state.budget?.maxDecisions ?? DEFAULT_BUDGET.maxDecisions;
  return state.decisions > max ? `; warning: ${state.decisions} decisions, over the budget of ${max}; the brief was too thin` : "";
}

function budgetLine(state, at = Date.now()) {
  const left = budgetLeft(state, at);
  const clock = state.budget.startedAt ? "" : " (the clock starts at close-intake)";
  return `budget: ${left.minutesUsed} of ${state.budget.minutes} minutes used${clock}, ${state.pushes} of ${state.budget.maxPushes} pushes, ${state.decisions} of ${state.budget.maxDecisions} decisions`;
}

// ---- resume: the packet that puts a fresh or compacted session back on the run ----

function skillDirOf(state) {
  if (state.skillDir) return state.skillDir;
  // Before 0.2.0 init did not store it. The script lives at <skill>/shared/scripts/loop-state.mjs.
  return state.script ? path.dirname(path.dirname(path.dirname(state.script))) : null;
}

function lastProof(state) {
  const proved = state.nodes.filter((n) => n.proof && n.endedAt).sort((a, b) => Date.parse(a.endedAt) - Date.parse(b.endedAt));
  return proved.at(-1) ?? null;
}

/** The re-entry packet: everything a session that lost its context needs to go on with the run. Read only. */
export function resumePacket(run, at = Date.now()) {
  const { state, runDir } = run;
  const lines = [];
  if (state.paused) {
    lines.push(`This run is paused: ${state.paused.why}.`);
    lines.push(`Two choices for the person: go on with ${MORE_MINUTES} more minutes and ${MORE_PUSHES} more pushes (resume --continue), or end it (stop --why "<why>").`);
  }
  lines.push(`loop ${state.loop}, run folder ${runDir}`);
  lines.push(`track ${state.track}; ${budgetLine(state, at)}`);
  const briefFile = path.join(runDir, "brief.md");
  if (fs.existsSync(briefFile)) {
    lines.push("brief.md (first 15 lines):", ...fs.readFileSync(briefFile, "utf8").split("\n").slice(0, 15).map((l) => `  ${l}`));
  } else lines.push("brief.md: not written yet");
  lines.push(`nodes (intake ${state.intake}):`);
  for (const n of state.nodes) lines.push(`  ${n.status.padEnd(7)} ${n.name}${n.retries.length ? ` (${n.retries.length} retries)` : ""}${n.leftWhy ? `: ${n.leftWhy}` : ""}`);
  const next = nextNode(state);
  lines.push(`next node: ${next ? next.name : "none, run finish"}`);
  const proof = lastProof(state);
  lines.push(`last proof: ${proof ? `${proof.proof} (node ${proof.name})` : "none yet"}`);
  const items = readStopFact(runDir).items;
  lines.push(`stop fact: ${items.filter((i) => i.passes).length} of ${items.length} items pass`, ...stopFactTable(items));
  if (state.held.length) lines.push(`held steps: ${state.held.map((h) => `${h.step} (${h.kind})`).join("; ")}`);
  const skillDir = skillDirOf(state);
  const where = (file) => (file && fs.existsSync(file) ? file : `${file ?? "unknown"} (not found)`);
  lines.push("read again:", `  ${where(skillDir && path.join(skillDir, "SKILL.md"))}`, `  ${where(skillDir && path.join(skillDir, "shared", "loop-rules.md"))}`);
  if (state.paused) lines.push("Do not go on until the person says so. Tell them the two choices above.");
  else if (next) lines.push(`Go on with node "${next.name}" now. Read loop-rules.md again first if it is not in your context.`);
  else lines.push("Every node is done or left. Run finish now. Read loop-rules.md again first if it is not in your context.");
  return lines.join("\n");
}

function resume(run, options) {
  const { state } = run;
  needLive(state);
  if (!options.continue) return { state, line: [`ok resume ${state.loop}`, resumePacket(run)].join("\n") };
  // Only the person un-pauses a run. A run that is not paused has budget left and needs no more.
  if (!isPaused(state)) refuse("The run is not paused, so there is nothing to continue. Run resume without --continue to see where it is.");
  const was = state.paused.why;
  state.paused = null;
  state.budget.minutes += MORE_MINUTES;
  state.budget.maxPushes += MORE_PUSHES;
  writeState(run.runDir, state);
  return { state, line: [`ok resume --continue: the run goes on (it was paused because ${was}); the budget is now ${state.budget.minutes} minutes and ${state.budget.maxPushes} pushes`, resumePacket(run)].join("\n") };
}

// ---- report: minutes, retries, pushes and decisions, for the hand-over ----

const minutesBetween = (from, to) => {
  const a = Date.parse(from ?? ""), b = Date.parse(to ?? "");
  return Number.isFinite(a) && Number.isFinite(b) ? Math.round(((b - a) / 60000) * 10) / 10 : null;
};

export function metrics(run, at = Date.now()) {
  const { state } = run;
  const end = new Date(at).toISOString();
  return {
    loop: state.loop, track: state.track, runDir: run.runDir, at: end,
    budget: state.budget, budgetLeft: budgetLeft(state, at),
    nodes: state.nodes.map((n) => ({ name: n.name, status: n.status, minutes: n.startedAt ? minutesBetween(n.startedAt, n.endedAt ?? end) : null, retries: n.retries.length })),
    totals: {
      minutesSinceIntake: state.budget.startedAt ? minutesBetween(state.budget.startedAt, state.finished?.at ?? end) : null,
      pushes: state.pushes, decisions: state.decisions, held: state.held.length,
      left: state.nodes.filter((n) => n.status === "left").map((n) => n.name),
    },
  };
}

function writeMetrics(run) {
  const value = metrics(run);
  const file = path.join(run.runDir, "metrics.json");
  writeJsonFile(file, value);
  return { file, value };
}

function metricsTable(value) {
  const lines = ["| node | status | minutes | retries |", "|---|---|---|---|"];
  for (const n of value.nodes) lines.push(`| ${n.name} | ${n.status} | ${n.minutes ?? "-"} | ${n.retries} |`);
  const t = value.totals;
  lines.push("", `track: ${value.track}; budget: ${value.budget.minutes} minutes, ${value.budget.maxPushes} pushes, ${value.budget.maxDecisions} decisions`);
  lines.push(`minutes since close-intake: ${t.minutesSinceIntake ?? "-"}; pushes: ${t.pushes}; decisions: ${t.decisions}; held: ${t.held}; left nodes: ${t.left.length ? t.left.join(", ") : "none"}`);
  return lines;
}

function report(run) {
  const { file, value } = writeMetrics(run);
  return { state: run.state, line: [`ok report: written to ${path.relative(run.state.workDir, file)}`, ...metricsTable(value)].join("\n") };
}

// ---- learn: lessons the next run of this loop reads at its intake ----

const solutionsDir = (workDir, loop) => path.join(workDir, "loop-runs", "solutions", loop);

function lessonFiles(workDir, loop) {
  const dir = solutionsDir(workDir, loop);
  return fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => f.endsWith(".md")).sort() : [];
}

function learn(run, options) {
  const { state } = run;
  const rule = needText(options, "rule");
  const because = needText(options, "because");
  if (!FAILURE_WORD.test(because)) refuse('--because must name the check that failed (with the word "failed", "refused" or "FAIL") and the change after which it passed. A lesson with no failure behind it is a guess.');
  const node = options.node ? nodeOf(state, options.node).name : null;
  const dir = solutionsDir(state.workDir, state.loop);
  fs.mkdirSync(dir, { recursive: true });
  const day = stamp().slice(0, 8);
  const slug = rule.toLowerCase().replace(/[^a-z0-9]+/gu, "-").replace(/^-+|-+$/gu, "").slice(0, 50).replace(/-+$/u, "") || "lesson";
  let file = path.join(dir, `${day}-${slug}.md`);
  for (let n = 2; fs.existsSync(file); n++) file = path.join(dir, `${day}-${slug}-${n}.md`);
  const quote = (text) => JSON.stringify(text); // JSON strings are valid YAML, so quotes and colons stay safe
  fs.writeFileSync(file, `---\nloop: ${state.loop}\nnode: ${node ?? "none"}\ndate: ${now().slice(0, 10)}\nrule: ${quote(rule)}\nbecause: ${quote(because)}\nrun: ${quote(path.relative(state.workDir, run.runDir))}\n---\n\n${rule}\n\nBecause: ${because}\n`);
  return { state, line: `ok learn: written to ${path.relative(state.workDir, file)}; ${lessonFiles(state.workDir, state.loop).length} lessons for ${state.loop}` };
}

export function summary(run) {
  const { state } = run;
  const next = nextNode(state);
  return {
    loop: state.loop, runDir: run.runDir, workDir: state.workDir, intake: state.intake,
    finished: state.finished, stopped: state.stopped, stale: isStale(state), next: next?.name ?? null,
    nodes: state.nodes.map((n) => ({ name: n.name, status: n.status, retries: n.retries.length, proof: n.proof, leftWhy: n.leftWhy })),
    held: state.held, decisions: state.decisions, replies: state.replies ?? 0,
    track: state.track, budget: state.budget, budgetLeft: budgetLeft(state), pushes: state.pushes, paused: state.paused,
    stopFact: readStopFact(run.runDir).items,
  };
}

function statusText(run) {
  const s = summary(run);
  const lines = [`ok status ${s.loop}: intake ${s.intake}${s.intake === "open" ? ` (${s.replies} replies)` : ""}${s.finished ? ", finished" : ""}${s.stopped ? ", stopped" : ""}${s.stale ? ", stale (no change for 24 hours)" : ""}`, `run folder: ${s.runDir}`];
  for (const n of s.nodes) lines.push(`  ${n.status.padEnd(7)} ${n.name}${n.retries ? ` (${n.retries} retries)` : ""}${n.leftWhy ? `: ${n.leftWhy}` : ""}`);
  lines.push(s.next ? `next node: ${s.next}` : "next node: none, run finish");
  if (s.held.length) lines.push(`held steps: ${s.held.map((h) => `${h.step} (${h.kind})`).join("; ")}`);
  lines.push(`decisions: ${s.decisions}${s.decisions ? " (in decisions.md)" : ""}${decisionWarning(run.state)}`);
  lines.push(budgetLine(run.state));
  if (s.paused) lines.push(`paused: ${s.paused.why}`);
  if (s.stopFact.length) lines.push(`stop fact: ${s.stopFact.filter((i) => i.passes).length} of ${s.stopFact.length} items pass`);
  return lines.join("\n");
}

const COMMANDS = { "close-intake": closeIntake, start, done, retry, left, hold, decide, finish, stop, "stop-fact": stopFactCommand, resume, report, learn };

export function main(argv) {
  const { command, options } = parseArgs(argv);
  if (!command || command === "help" || command === "--help") return { text: HELP, json: { help: HELP } };
  let result;
  if (command === "init") result = init(options);
  else {
    const run = findRun([process.cwd(), process.env.CLAUDE_PROJECT_DIR]);
    if (!run) refuse(`No loop run found: no ${POINTER_FILE} file in ${process.cwd()} or a folder above it. Run init first.`);
    // Two loops can run at once on one laptop. A command from one loop's skill folder must not drive another loop's
    // run: the refusal names both, so a crossed wire reads as what it is, not as a broken state.
    const ownLoop = scriptPath.match(/[\\/]skills[\\/]([^\\/]+)[\\/]shared[\\/]scripts[\\/]/u)?.[1] ?? null;
    if (ownLoop && run.state.loop !== ownLoop && command !== "status") {
      refuse(`This command comes from ${ownLoop}, but the run in ${run.runDir} belongs to ${run.state.loop}. Run it from that loop's working folder (status shows which run a folder points at).`);
    }
    if (command === "status") return { text: statusText(run), json: { ok: true, command: "status", ...summary(run) } };
    if (!COMMANDS[command]) refuse(`Unknown command "${command}". Run help to see the commands.`);
    result = COMMANDS[command](run, options);
  }
  const node = ["start", "done", "retry", "left"].includes(command) ? options._[0] : undefined;
  return { text: result.line, json: { ok: true, command, ...(node ? { node } : {}), message: result.line, ...summary({ runDir: result.state.runDir, state: result.state }) } };
}

if (process.argv[1] && fs.realpathSync(process.argv[1]) === scriptPath) {
  const wantsJson = process.argv.includes("--json");
  try {
    const out = main(process.argv.slice(2));
    process.stdout.write(`${wantsJson ? JSON.stringify(out.json) : out.text}\n`);
  } catch (error) {
    const message = error instanceof Refusal ? error.message : `unexpected error: ${error.stack ?? error}`;
    process.stderr.write(`loop-state: ${message}\n`);
    process.exitCode = 1;
  }
}
