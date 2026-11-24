#!/usr/bin/env node
// loop-state.mjs owns state.json in a loop's run folder. Every loop step calls it, and only the main session does.
//   node loop-state.mjs <command> [options] [--json]      (run `node loop-state.mjs help` for every command)
// It writes only inside the run folder, plus the `.loop-run` pointer file in the working folder.
// It never deletes anything. On a refusal it prints why to stderr and exits 1.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { POINTER_FILE, STATE_FILE, STATE_VERSION, findRun, isEnded, isStale, nextNode, readState } from "./run-files.mjs";

const HELP = `loop-state.mjs: the state of one loop run.

  init --loop <name> --nodes <intake,...,review,handover> [--run <folder>] [--work <folder>] [--replace]
  close-intake                      after the person says "go"; needs brief.md in the run folder
  start <node>
  done <node> --check "<what proved it>" --proof <file>
  retry <node> --why "<what failed>"      at most 3 times per node
  left <node> --why "<why it is left for the person>"
  hold --step "<what waits>" --kind delete|money|sign-in --why "<why>" [--node <node>]
  decide --question "<question>" --answer "<the default you took>" [--node <node>]
  finish --stop-fact "<the fact that is now true>"   needs handover.md in the run folder
  status
  stop --why "<why>"                ends a run that must not go on (the hooks then let the person go)

Every command but init finds the run from the .loop-run file in this folder or a folder above it.
Add --json for JSON on stdout. On success the plain output starts with "ok <command>".`;

const MAX_RETRIES = 3; // the contract: a failed node check is retried at most 3 times, then left for the person
const HOLD_KINDS = ["delete", "money", "sign-in"];
const scriptPath = fs.realpathSync(fileURLToPath(import.meta.url));

class Refusal extends Error {}
const refuse = (message) => { throw new Refusal(message); };
const now = () => new Date().toISOString();

export function parseArgs(argv) {
  const [command, ...rest] = argv;
  const options = { _: [] };
  for (let i = 0; i < rest.length; i++) {
    const arg = rest[i];
    if (arg === "--json" || arg === "--replace") options[arg.slice(2)] = true;
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
  fs.writeFileSync(`${file}.tmp`, `${JSON.stringify(state, null, 2)}\n`);
  fs.renameSync(`${file}.tmp`, file);
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
  const at = now();
  const state = {
    version: STATE_VERSION, loop, workDir, runDir, script: scriptPath, createdAt: at, changedAt: at,
    intake: "open", finished: null, stopped: null,
    nodes: names.map((name, i) => ({ name, status: i === 0 ? "running" : "pending", startedAt: i === 0 ? at : null, endedAt: null, check: null, proof: null, retries: [], leftWhy: null })),
    held: [], decisions: 0,
  };
  writeState(runDir, state);
  fs.writeFileSync(path.join(workDir, POINTER_FILE), `${runDir}\n`);
  return { state, line: `ok init ${loop}: nodes ${names.join(",")}; run folder ${runDir}; node "intake" is running` };
}

function closeIntake(run) {
  const { state } = run;
  needLive(state);
  if (state.intake === "closed") refuse("The intake is already closed.");
  const brief = path.join(run.runDir, "brief.md");
  if (!fs.existsSync(brief) || !fs.readFileSync(brief, "utf8").trim()) refuse(`Write the brief first: ${brief} is missing or empty.`);
  const intake = state.nodes[0];
  Object.assign(intake, { status: "done", endedAt: now(), check: 'the person said "go"', proof: path.relative(state.workDir, brief) });
  state.intake = "closed";
  writeState(run.runDir, state);
  return { state, line: `ok close-intake: the intake is closed. From now on never ask the person anything. Next node: ${nextNode(state)?.name}` };
}

function start(run, options) {
  const { state } = run;
  needLive(state);
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
  const node = nodeOf(state, options._[0]);
  if (node.status !== "running") refuse(`Node "${node.name}" is ${node.status}, not running.`);
  const why = needText(options, "why");
  if (node.retries.length >= MAX_RETRIES) refuse(`Node "${node.name}" has used its ${MAX_RETRIES} retries. Run: left ${node.name} --why "<what still fails>", then go on.`);
  node.retries.push({ at: now(), why });
  writeState(run.runDir, state);
  return { state, line: `ok retry ${node.name}: try ${node.retries.length + 1} of ${MAX_RETRIES + 1}` };
}

function left(run, options) {
  const { state } = run;
  needLive(state);
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
  const question = needText(options, "question");
  const answer = needText(options, "answer");
  const node = options.node ? nodeOf(state, options.node) : state.nodes.find((n) => n.status === "running") ?? null;
  const file = path.join(run.runDir, "decisions.md");
  if (!fs.existsSync(file)) fs.writeFileSync(file, "# Decisions\n\nWhat the run chose on its own, without asking the person.\n");
  fs.appendFileSync(file, `\n## ${question}\n\n- Answer: ${answer}\n- Node: ${node?.name ?? "none"}\n- When: ${now()}\n`);
  state.decisions += 1;
  writeState(run.runDir, state);
  return { state, line: `ok decide: written to ${path.relative(state.workDir, file)}` };
}

function finish(run, options) {
  const { state } = run;
  needLive(state);
  needIntakeClosed(state, null);
  const open = nextNode(state);
  if (open) refuse(`Node "${open.name}" is ${open.status}. Every node must be done or left before finish.`);
  const handover = path.join(run.runDir, "handover.md");
  if (!fs.existsSync(handover)) refuse(`Write the hand-over first: ${handover} is missing.`);
  state.finished = { at: now(), stopFact: needText(options, "stop-fact") };
  writeState(run.runDir, state);
  const leftNodes = state.nodes.filter((n) => n.status === "left").map((n) => n.name);
  return { state, line: `ok finish: ${state.nodes.length - leftNodes.length} nodes done, ${leftNodes.length} left${leftNodes.length ? ` (${leftNodes.join(", ")})` : ""}, ${state.held.length} steps held, ${state.decisions} decisions. Stop fact: ${state.finished.stopFact}` };
}

function stop(run, options) {
  const { state } = run;
  needLive(state);
  state.stopped = { at: now(), why: needText(options, "why") };
  writeState(run.runDir, state);
  return { state, line: `ok stop: the run is stopped. The hooks no longer hold the session.` };
}

export function summary(run) {
  const { state } = run;
  const next = nextNode(state);
  return {
    loop: state.loop, runDir: run.runDir, workDir: state.workDir, intake: state.intake,
    finished: state.finished, stopped: state.stopped, stale: isStale(state), next: next?.name ?? null,
    nodes: state.nodes.map((n) => ({ name: n.name, status: n.status, retries: n.retries.length, proof: n.proof, leftWhy: n.leftWhy })),
    held: state.held, decisions: state.decisions,
  };
}

function statusText(run) {
  const s = summary(run);
  const lines = [`ok status ${s.loop}: intake ${s.intake}${s.finished ? ", finished" : ""}${s.stopped ? ", stopped" : ""}${s.stale ? ", stale (no change for 24 hours)" : ""}`, `run folder: ${s.runDir}`];
  for (const n of s.nodes) lines.push(`  ${n.status.padEnd(7)} ${n.name}${n.retries ? ` (${n.retries} retries)` : ""}${n.leftWhy ? `: ${n.leftWhy}` : ""}`);
  lines.push(s.next ? `next node: ${s.next}` : "next node: none, run finish");
  if (s.held.length) lines.push(`held steps: ${s.held.map((h) => `${h.step} (${h.kind})`).join("; ")}`);
  lines.push(`decisions: ${s.decisions}${s.decisions ? " (in decisions.md)" : ""}`);
  return lines.join("\n");
}

const COMMANDS = { "close-intake": closeIntake, start, done, retry, left, hold, decide, finish, stop };

export function main(argv) {
  const { command, options } = parseArgs(argv);
  if (!command || command === "help" || command === "--help") return { text: HELP, json: { help: HELP } };
  let result;
  if (command === "init") result = init(options);
  else {
    const run = findRun([process.cwd(), process.env.CLAUDE_PROJECT_DIR]);
    if (!run) refuse(`No loop run found: no ${POINTER_FILE} file in ${process.cwd()} or a folder above it. Run init first.`);
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
