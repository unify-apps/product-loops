// loop-state.test.mjs: the state script, run the way the loops run it (a child process in the working folder),
// plus a few calls of its exported functions.
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { test } from "node:test";
import { budgetLeft, isActive, isPaused, readState, withDefaults } from "../shared/scripts/run-files.mjs";
import { metrics, resumePacket } from "../shared/scripts/loop-state.mjs";
import { NODES, openRun, patchState, proofFile, readJson, reply, runDirOf, state, stateOf, workFolder } from "./helpers.mjs";

test("init refuses a bad node list", () => {
  const { dir } = workFolder();
  for (const nodes of ["build,handover", "intake,build", "intake,handover", "intake,a,a,handover", "intake,Build,handover"]) {
    const r = state(dir, "init", "--loop", "x", "--nodes", nodes);
    assert.equal(r.code, 1, nodes);
    assert.match(r.err, /^loop-state: /u);
  }
  assert.equal(state(dir, "init", "--loop", "x", "--nodes", NODES, "--track", "slow").code, 1);
  assert.equal(state(dir, "init", "--loop", "x", "--nodes", NODES, "--budget-minutes", "0").code, 1);
});

test("init writes a version 2 state with the budget, the track and the skill folder", () => {
  const { dir } = workFolder();
  const r = state(dir, "init", "--loop", "test-loop", "--nodes", NODES, "--track", "quick", "--budget-minutes", "45", "--skill-dir", dir);
  assert.equal(r.code, 0, r.err);
  assert.match(r.out, /^ok init test-loop: .*track quick; budget 45 minutes; .*0 lessons for this loop yet$/u);
  const s = stateOf(dir);
  assert.equal(s.version, 2);
  assert.equal(s.track, "quick");
  assert.equal(s.skillDir, dir);
  assert.deepEqual(s.budget, { minutes: 45, maxPushes: 6, maxDecisions: 40, startedAt: null });
  assert.equal(s.pushes, 0);
  assert.equal(s.paused, null);
});

test("init without the new flags keeps the old defaults", () => {
  const { dir } = workFolder();
  assert.equal(state(dir, "init", "--loop", "test-loop", "--nodes", NODES).code, 0);
  const s = stateOf(dir);
  assert.equal(s.track, "full");
  assert.equal(s.budget.minutes, 90);
  assert.equal(s.skillDir, null);
});

test("close-intake refuses with no reply, no brief or no stop-fact item, and passes after all three", () => {
  const { dir } = workFolder();
  state(dir, "init", "--loop", "test-loop", "--nodes", NODES);
  const run = runDirOf(dir);
  assert.match(state(dir, "close-intake").err, /Write the brief first/u);
  fs.writeFileSync(path.join(run, "brief.md"), "# Brief\n");
  assert.match(state(dir, "close-intake").err, /stop-fact add/u);
  assert.match(state(dir, "stop-fact", "add", "--item", "The page opens").out, /^ok stop-fact add S1: The page opens$/u);
  assert.match(state(dir, "close-intake").err, /has not replied/u);
  reply(dir, "<task-notification>done</task-notification>");
  assert.equal(stateOf(dir).replies, 0, "a task notification is not the person");
  reply(dir, "go");
  const r = state(dir, "close-intake");
  assert.equal(r.code, 0, r.err);
  assert.match(r.out, /^ok close-intake: .*Next node: build$/u);
  assert.ok(stateOf(dir).budget.startedAt, "the clock starts at close-intake");
  assert.match(state(dir, "stop-fact", "add", "--item", "late").err, /intake is closed/u);
});

test("start and done keep the order and need a proof file", () => {
  const { dir } = workFolder();
  openRun(dir);
  assert.match(state(dir, "start", "review").err, /"build" comes first/u);
  assert.match(state(dir, "done", "build", "--check", "x", "--proof", "p.txt").err, /Run start build first/u);
  assert.equal(state(dir, "start", "build").code, 0);
  assert.match(state(dir, "done", "build", "--check", "x", "--proof", "missing.txt").err, /does not exist/u);
  assert.match(state(dir, "done", "build", "--check", "page opens", "--proof", proofFile(dir)).out, /^ok done build: proof proof.txt. Next node: review$/u);
});

test("retry three times, then it refuses and left takes over", () => {
  const { dir } = workFolder();
  openRun(dir);
  state(dir, "start", "build");
  for (let i = 2; i <= 4; i++) assert.match(state(dir, "retry", "build", "--why", "red").out, new RegExp(`retry ${i - 1} of 3`, "u"));
  assert.match(state(dir, "retry", "build", "--why", "red").err, /used its 3 retries/u);
  assert.match(state(dir, "left", "build", "--why", "still red").out, /^ok left build: still red. Next node: review$/u);
});

test("hold takes only delete, money or sign-in", () => {
  const { dir } = workFolder();
  openRun(dir);
  assert.match(state(dir, "hold", "--step", "s", "--kind", "colour", "--why", "w").err, /--kind must be one of/u);
  for (const kind of ["delete", "money", "sign-in"]) assert.equal(state(dir, "hold", "--step", `s-${kind}`, "--kind", kind, "--why", "w").code, 0);
  assert.equal(stateOf(dir).held.length, 3);
});

test("decide still writes past 40 decisions, but warns, and status shows it", () => {
  const { dir } = workFolder();
  openRun(dir);
  patchState(dir, (s) => ({ ...s, decisions: 40 }));
  const r = state(dir, "decide", "--question", "Colour?", "--answer", "blue");
  assert.equal(r.code, 0, r.err);
  assert.match(r.out, /warning: 41 decisions, over the budget of 40; the brief was too thin$/u);
  assert.match(fs.readFileSync(path.join(runDirOf(dir), "decisions.md"), "utf8"), /## Colour\?/u);
  const status = state(dir, "status").out;
  assert.match(status, /decisions: 41 .*the brief was too thin/u);
  assert.match(status, /^budget: \d+ of 90 minutes used, 0 of 6 pushes, 41 of 40 decisions$/mu);
});

test("stop-fact pass needs a running review, passes only items with evidence, and finish follows it", () => {
  const { dir } = workFolder();
  const run = openRun(dir, { items: ["The page opens", "Every click works"] });
  const reviewFile = path.join(run, "review.json");
  fs.writeFileSync(reviewFile, JSON.stringify({ items: [{ id: "S1", passes: true, evidence: "opened it, see shots/home.png" }, { id: "S2", passes: true, evidence: "" }], spec: 4, quality: 3, verdict: "FAIL", findings: [] }));
  assert.match(state(dir, "stop-fact", "pass", "--from", reviewFile).err, /review node "review" is pending/u);
  state(dir, "start", "build");
  state(dir, "done", "build", "--check", "x", "--proof", proofFile(dir));
  state(dir, "start", "review");
  const pass = state(dir, "stop-fact", "pass", "--from", reviewFile);
  assert.match(pass.out, /^ok stop-fact pass: 1 of 2 items pass \(S2 do not\)/u);
  assert.match(state(dir, "stop-fact", "status").out, /^ok stop-fact status: 1 of 2 items pass\n {2}pass {4}S1 The page opens/u);
  state(dir, "done", "review", "--check", "review", "--proof", path.relative(dir, reviewFile));
  state(dir, "start", "handover");
  fs.writeFileSync(path.join(run, "handover.md"), "# Hand-over\n");
  state(dir, "done", "handover", "--check", "written", "--proof", path.relative(dir, path.join(run, "handover.md")));
  assert.match(state(dir, "finish", "--stop-fact", "done").err, /1 stop-fact items do not pass: S2/u);
});

test("a left review lets finish go and lists what did not pass; finish writes metrics and sends a notice", () => {
  const { dir, log } = workFolder();
  const run = openRun(dir, { items: ["The page opens"] });
  state(dir, "start", "build");
  state(dir, "done", "build", "--check", "x", "--proof", proofFile(dir));
  state(dir, "left", "review", "--why", "no reviewer");
  state(dir, "start", "handover");
  fs.writeFileSync(path.join(run, "handover.md"), "# Hand-over\n");
  state(dir, "done", "handover", "--check", "written", "--proof", path.relative(dir, path.join(run, "handover.md")));
  const r = state(dir, "finish", "--stop-fact", "The page is built");
  assert.equal(r.code, 0, r.err);
  assert.match(r.out, /^ok finish: 3 nodes done, 1 left \(review\), 0 steps held, 0 decisions; stop fact: 0 of 1 items pass\. Stop fact: The page is built/u);
  assert.match(r.out, /not passed \(list them in the hand-over\):\n {2}S1 The page opens/u);
  assert.ok(fs.existsSync(path.join(run, "metrics.json")));
  assert.match(fs.readFileSync(log, "utf8"), /^test-loop finished\t/u);
});

test("a paused run refuses work, and resume --continue un-pauses it with more budget", () => {
  const { dir } = workFolder();
  openRun(dir);
  assert.match(state(dir, "resume", "--continue").err, /not paused/u);
  patchState(dir, (s) => ({ ...s, pushes: 6, paused: { at: new Date().toISOString(), why: "the push budget is used up (6 of 6 pushes)" } }));
  for (const args of [["start", "build"], ["decide", "--question", "q", "--answer", "a"], ["hold", "--step", "s", "--kind", "money", "--why", "w"]]) {
    assert.match(state(dir, ...args).err, /The run is paused: the push budget is used up \(6 of 6 pushes\)\. Run resume --continue to go on, or stop\./u);
  }
  assert.match(state(dir, "status").out, /^paused: the push budget is used up/mu);
  const plain = state(dir, "resume");
  assert.match(plain.out, /^ok resume test-loop\nThis run is paused: /u);
  const r = state(dir, "resume", "--continue");
  assert.equal(r.code, 0, r.err);
  assert.match(r.out, /^ok resume --continue: .*the budget is now 120 minutes and 12 pushes/u);
  assert.match(r.out, /Go on with node "build" now\./u);
  assert.equal(stateOf(dir).paused, null);
  assert.equal(state(dir, "start", "build").code, 0);
});

test("resume refuses a finished or stopped run", () => {
  const { dir, log } = workFolder();
  openRun(dir);
  assert.match(state(dir, "stop", "--why", "wrong ask").out, /^ok stop/u);
  assert.match(fs.readFileSync(log, "utf8"), /^test-loop stopped\twrong ask$/mu);
  assert.match(state(dir, "resume").err, /was stopped/u);
});

test("report writes metrics.json with minutes, retries and totals", () => {
  const { dir } = workFolder();
  const run = openRun(dir);
  state(dir, "start", "build");
  state(dir, "retry", "build", "--why", "red");
  state(dir, "decide", "--question", "q", "--answer", "a");
  const r = state(dir, "report");
  assert.equal(r.code, 0, r.err);
  assert.match(r.out, /^ok report: written to loop-runs\/.*metrics\.json\n\| node \| status \| minutes \| retries \|/u);
  assert.match(r.out, /\| build \| running \| [\d.]+ \| 1 \|/u);
  const m = readJson(path.join(run, "metrics.json"));
  assert.equal(m.totals.decisions, 1);
  assert.equal(m.track, "full");
  assert.equal(m.nodes.find((n) => n.name === "build").retries, 1);
  assert.equal(metrics({ runDir: run, state: readState(run) }).loop, "test-loop");
});

test("learn refuses a lesson with no failure behind it, and init counts the lessons", () => {
  const { dir } = workFolder();
  openRun(dir);
  assert.match(state(dir, "learn", "--rule", "Use one font", "--because", "it looked better").err, /must name the check that failed/u);
  const r = state(dir, "learn", "--rule", "Check the nav words match the headings", "--because", "the review FAIL on Clients vs Customers, then passed after renaming", "--node", "build");
  assert.match(r.out, /^ok learn: written to loop-runs\/solutions\/test-loop\/\d{8}-check-the-nav-words-match-the-headings\.md; 1 lessons for test-loop$/u);
  const file = path.join(dir, r.out.split("written to ")[1].split(";")[0]);
  assert.match(fs.readFileSync(file, "utf8"), /^---\nloop: test-loop\nnode: build\ndate: \d{4}-\d{2}-\d{2}\nrule: "Check the nav/u);
  state(dir, "stop", "--why", "next");
  assert.match(state(dir, "init", "--loop", "test-loop", "--nodes", NODES, "--run", "loop-runs/second").out, /1 lessons in loop-runs\/solutions\/test-loop: read them/u);
});

test("an old version 1 state.json still loads and gets the defaults", () => {
  const { dir } = workFolder();
  openRun(dir);
  const old = patchState(dir, (s) => {
    const { budget, track, skillDir, pushes, paused, ...rest } = s;
    return { ...rest, version: 1 };
  });
  assert.equal(old.budget, undefined);
  const loaded = readState(runDirOf(dir));
  assert.equal(loaded.budget.minutes, 90);
  assert.equal(loaded.budget.startedAt, loaded.nodes[0].endedAt);
  assert.equal(loaded.track, "full");
  const status = state(dir, "status");
  assert.equal(status.code, 0, status.err);
  assert.match(status.out, /0 of 6 pushes/u);
  assert.equal(state(dir, "start", "build").code, 0);
});

test("budgetLeft, isPaused and isActive", () => {
  const start = Date.parse("2026-01-01T10:00:00Z");
  const s = withDefaults({ intake: "closed", changedAt: new Date(start).toISOString(), budget: { minutes: 60, startedAt: new Date(start).toISOString() }, pushes: 2, decisions: 5 });
  assert.deepEqual(budgetLeft(s, start + 20 * 60000), { minutesUsed: 20, minutesLeft: 40, pushesLeft: 4, decisionsLeft: 35, over: false, why: null });
  assert.match(budgetLeft(s, start + 61 * 60000).why, /time budget is used up \(61 of 60 minutes\)/u);
  assert.match(budgetLeft({ ...s, pushes: 6 }, start).why, /push budget is used up \(6 of 6 pushes\)/u);
  assert.equal(isActive(s, start), true);
  const paused = { ...s, paused: { at: "x", why: "y" } };
  assert.equal(isPaused(paused), true);
  assert.equal(isActive(paused, start), false);
});

test("resumePacket names the next node, the brief and the files to read again", () => {
  const { dir } = workFolder();
  const run = openRun(dir, { extra: ["--skill-dir", dir] });
  fs.writeFileSync(path.join(dir, "SKILL.md"), "x");
  const packet = resumePacket({ runDir: run, state: readState(run) });
  assert.match(packet, /^loop test-loop, run folder /u);
  assert.match(packet, /brief\.md \(first 15 lines\):\n {2}# Brief/u);
  assert.match(packet, /next node: build/u);
  assert.ok(packet.includes(path.join(dir, "SKILL.md")));
  assert.match(packet, /loop-rules\.md \(not found\)/u);
  assert.match(packet, /Go on with node "build" now\. Read loop-rules\.md again first if it is not in your context\.$/u);
});

test("close-intake --track changes the track the person picked, and refuses a bad one", () => {
  const { dir } = workFolder();
  state(dir, "init", "--loop", "test-loop", "--nodes", NODES, "--track", "full");
  reply(dir);
  state(dir, "stop-fact", "add", "--item", "The page opens");
  fs.writeFileSync(path.join(runDirOf(dir), "brief.md"), "# Brief\n");
  assert.equal(state(dir, "close-intake", "--track", "slow").code, 1);
  const r = state(dir, "close-intake", "--track", "quick");
  assert.equal(r.code, 0, r.err);
  assert.match(r.out, /track quick/u);
  assert.equal(stateOf(dir).track, "quick");
});

test("the review node is the one before handover, whatever its name (the review loop calls it recheck)", () => {
  const { dir } = workFolder();
  openRun(dir, { nodes: "intake,walk,review,fix,recheck,handover" });
  const runDir = runDirOf(dir);
  const proof = proofFile(dir);
  for (const n of ["walk", "review", "fix"]) { state(dir, "start", n); state(dir, "done", n, "--check", "ok", "--proof", proof); }
  const verdict = path.join(dir, "review.json");
  fs.writeFileSync(verdict, JSON.stringify({ items: [{ id: "S1", passes: true, evidence: "walk/after-1/home.png shows the page" }], spec: 5, quality: 4, verdict: "PASS" }));
  // The findings node is called "review" here, but it is not the last fresh look: pass must wait for recheck.
  const early = state(dir, "stop-fact", "pass", "--from", "review.json");
  assert.equal(early.code, 1);
  assert.match(early.err, /"recheck" is pending/u);
  state(dir, "start", "recheck");
  const r = state(dir, "stop-fact", "pass", "--from", "review.json");
  assert.equal(r.code, 0, r.err);
  assert.match(r.out, /1 of 1 items pass/u);
  state(dir, "done", "recheck", "--check", "ok", "--proof", proof);
  state(dir, "start", "handover");
  fs.writeFileSync(path.join(runDir, "handover.md"), "# Handover\n");
  state(dir, "done", "handover", "--check", "ok", "--proof", proof);
  assert.equal(state(dir, "finish", "--stop-fact", "done").code, 0);
});
