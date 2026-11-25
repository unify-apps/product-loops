// hooks.test.mjs: the four hooks, through their exported functions and as the child processes Claude Code runs.
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { test } from "node:test";
import { decide as stopDecide, handle as stopHandle, NOTE_FILE } from "../shared/hooks/finish-every-node.mjs";
import { decide as askDecide } from "../shared/hooks/no-questions-after-intake.mjs";
import { countReply, isPersonReply } from "../shared/hooks/count-person-replies.mjs";
import { packetFor } from "../shared/hooks/resume-run.mjs";
import { sendNotice } from "../shared/scripts/notify.mjs";
import { envFor, hook, openRun, patchState, runDirOf, state, stateOf, workFolder } from "./helpers.mjs";

const HOOK = "finish-every-node.mjs";

test("Stop hook: no run, or a run whose intake is open, never blocks", () => {
  const { dir, env } = workFolder();
  assert.deepEqual(stopDecide({ cwd: dir }, env), { block: false });
  state(dir, "init", "--loop", "test-loop", "--nodes", "intake,build,review,handover");
  assert.equal(stopDecide({ cwd: dir }, env).block, false);
  assert.equal(hook(dir, HOOK, {}).code, 0);
});

test("Stop hook: an active run with a next node blocks and uses one push", () => {
  const { dir, env } = workFolder();
  openRun(dir);
  const result = stopHandle({ cwd: dir }, env);
  assert.equal(result.block, true);
  assert.match(result.reason, /Next node: "build"/u);
  assert.match(result.reason, /This is push 1 of 6, with about \d+ minutes left/u);
  assert.equal(stateOf(dir).pushes, 1);
  assert.equal(fs.existsSync(path.join(runDirOf(dir), NOTE_FILE)), true);
  const child = hook(dir, HOOK, {});
  assert.equal(child.code, 2);
  assert.match(child.err, /push 2 of 6/u);
  assert.equal(stateOf(dir).pushes, 2);
});

test("Stop hook: no progress since the last push lets the stop happen", () => {
  const { dir, env } = workFolder();
  openRun(dir);
  stopHandle({ cwd: dir }, env);
  const again = stopDecide({ cwd: dir, stop_hook_active: true }, env);
  assert.equal(again.block, false);
  assert.equal(again.why, "no progress since the last push");
});

test("Stop hook: used-up pushes pause the run, let the stop happen, and send a notice", () => {
  const { dir, log } = workFolder();
  openRun(dir);
  patchState(dir, (s) => ({ ...s, budget: { ...s.budget, maxPushes: 1 } }));
  assert.equal(hook(dir, HOOK, { stop_hook_active: false }).code, 2, "the first push is in the budget");
  state(dir, "start", "build"); // progress, so the no-progress guard does not decide this stop
  const second = hook(dir, HOOK, { stop_hook_active: true });
  assert.equal(second.code, 0);
  assert.match(second.err, /is paused: the push budget is used up \(1 of 1 pushes\)/u);
  const s = stateOf(dir);
  assert.match(s.paused.why, /push budget is used up/u);
  assert.match(fs.readFileSync(log, "utf8"), /^test-loop paused\tthe push budget is used up/u);
  assert.equal(hook(dir, HOOK, {}).code, 0, "a paused run is not active, so the hook lets go");
  assert.match(state(dir, "done", "build", "--check", "x", "--proof", "x").err, /The run is paused/u);
});

test("Stop hook: used-up minutes pause the run too", () => {
  const { dir, env } = workFolder();
  openRun(dir);
  const started = Date.parse(stateOf(dir).budget.startedAt);
  const result = stopHandle({ cwd: dir }, env, started + 91 * 60000);
  assert.equal(result.block, false);
  assert.match(result.pause.why, /time budget is used up \(91 of 90 minutes\)/u);
  assert.ok(stateOf(dir).paused);
});

test("no-questions hook blocks AskUserQuestion only while the run is active", () => {
  const { dir, env } = workFolder();
  state(dir, "init", "--loop", "test-loop", "--nodes", "intake,build,review,handover");
  assert.equal(askDecide({ cwd: dir, tool_name: "AskUserQuestion" }, env).block, false, "intake open: asking is the point");
  const { dir: active } = workFolder();
  openRun(active);
  assert.equal(askDecide({ cwd: active, tool_name: "AskUserQuestion" }, envFor(active)).block, true);
  assert.equal(hook(active, "no-questions-after-intake.mjs", { tool_name: "AskUserQuestion" }).code, 2);
  patchState(active, (s) => ({ ...s, paused: { at: "x", why: "y" } }));
  assert.equal(askDecide({ cwd: active, tool_name: "AskUserQuestion" }, envFor(active)).block, false, "paused: the person is back");
});

test("count-person-replies counts a typed prompt and an AskUserQuestion answer, never a task notification", () => {
  assert.equal(isPersonReply({ hook_event_name: "UserPromptSubmit", prompt: "<task-notification>x" }), false);
  assert.equal(isPersonReply({ hook_event_name: "UserPromptSubmit", prompt: "  " }), false);
  assert.equal(isPersonReply({ hook_event_name: "PostToolUse", tool_name: "AskUserQuestion" }), true);
  const { dir, env } = workFolder();
  state(dir, "init", "--loop", "test-loop", "--nodes", "intake,build,review,handover");
  assert.equal(countReply({ cwd: dir, hook_event_name: "UserPromptSubmit", prompt: "<task-notification>done" }, env), null);
  assert.equal(countReply({ cwd: dir, hook_event_name: "UserPromptSubmit", prompt: "use blue" }, env), 1);
  assert.equal(hook(dir, "count-person-replies.mjs", { hook_event_name: "UserPromptSubmit", prompt: "go" }).code, 0);
  assert.equal(stateOf(dir).replies, 2);
});

test("resume-run prints the packet with the next node, and the pause first when paused", () => {
  const { dir, env } = workFolder();
  assert.equal(packetFor({ cwd: dir, source: "startup" }, env), null);
  assert.equal(hook(dir, "resume-run.mjs", { source: "startup" }).out, "");
  openRun(dir);
  const child = hook(dir, "resume-run.mjs", { source: "compact" });
  assert.equal(child.code, 0);
  assert.match(child.out, /^A product loop run is going on in this folder\.\nloop test-loop, run folder /u);
  assert.match(child.out, /next node: build/u);
  assert.match(child.out, /Go on with node "build" now\./u);
  patchState(dir, (s) => ({ ...s, paused: { at: "x", why: "the push budget is used up (6 of 6 pushes)" } }));
  assert.match(packetFor({ cwd: dir, source: "resume" }, env), /^This run is paused: the push budget is used up \(6 of 6 pushes\)\.\nTwo choices/u);
  state(dir, "stop", "--why", "done with it");
  assert.equal(packetFor({ cwd: dir, source: "resume" }, env), null, "an ended run has nothing to resume");
});

test("resume-run exits 0 on broken input", () => {
  const { dir } = workFolder();
  fs.writeFileSync(path.join(dir, ".loop-run"), path.join(dir, "nowhere"));
  assert.equal(hook(dir, "resume-run.mjs", { source: "startup" }).code, 0);
});

test("sendNotice logs when asked, runs a given program, and never throws", () => {
  const { dir } = workFolder();
  const log = path.join(dir, "n.log");
  assert.equal(sendNotice("T", "B\nline", { PRODUCT_LOOPS_NOTIFY_LOG: log }), "log");
  assert.equal(fs.readFileSync(log, "utf8"), "T\tB line\n");
  assert.equal(sendNotice("T", "B", { PRODUCT_LOOPS_NOTIFY_CMD: "true" }), "command");
  assert.equal(sendNotice("T", "B", { PRODUCT_LOOPS_NOTIFY_CMD: "/no/such/program" }), "command");
});
