#!/usr/bin/env node
// finish-every-node.mjs is a Stop hook. It sends Claude back to work while a loop run still has a node to do.
//   settings.json: { "hooks": [{ "type": "command", "command": "node \"<path>/finish-every-node.mjs\"" }] } under "Stop"
// It blocks the stop (exit 2, the next node on stderr) only while a run in this folder has its intake closed, is not
// finished, stopped or paused, changed in the last 24 hours, and has a node that is not done or left. Otherwise it
// exits 0, so node 1 can end its turn to ask its questions. On any error it exits 0.
// Each push uses one of the run's pushes. When the pushes or the minutes are used up, it pauses the run instead
// (writes `paused` into state.json), tells the person, and lets the stop happen: a run that needs more than its
// budget should wait for the person, not burn on.
// It writes `pushes` and `paused` in state.json, and stop-hook.json in the run folder, so it never pushes twice
// when the run made no progress. It leaves `changedAt` alone: that field means "the run itself changed".
import fs from "node:fs";
import path from "node:path";
import { sendNotice } from "../scripts/notify.mjs";
import { budgetLeft, findRun, isActive, nextNode, STATE_FILE, writeJsonFile } from "../scripts/run-files.mjs";

export const NOTE_FILE = "stop-hook.json";

/** Pure: what to do with this stop. { block: false } | { block: false, pause } | { block: true, reason, note, pushes }. */
export function decide(input, env = process.env, now = Date.now()) {
  const run = findRun([input?.cwd, env.CLAUDE_PROJECT_DIR]);
  if (!run || !isActive(run.state, now)) return { block: false };
  const next = nextNode(run.state);
  if (!next) return { block: false };
  const notePath = path.join(run.runDir, NOTE_FILE);
  let note = null;
  try { note = JSON.parse(fs.readFileSync(notePath, "utf8")); } catch { note = null; }
  // Claude Code sets stop_hook_active when this stop comes right after a hook sent Claude back. If the state has not
  // changed since that push, Claude made no progress, and a second push would only loop. So it lets the stop happen.
  if (input?.stop_hook_active && note?.changedAt === run.state.changedAt) return { block: false, why: "no progress since the last push" };
  const left = budgetLeft(run.state, now);
  const script = run.state.script ? `node "${run.state.script}"` : "loop-state.mjs";
  if (left.over) {
    return { block: false, run, pause: { at: new Date(now).toISOString(), why: left.why }, reason: `The loop "${run.state.loop}" is paused: ${left.why}. The person can go on with: ${script} resume --continue` };
  }
  const pushes = run.state.pushes + 1;
  return {
    block: true,
    run,
    notePath,
    pushes,
    note: { changedAt: run.state.changedAt, node: next.name, pushes: (note?.pushes ?? 0) + 1, at: new Date(now).toISOString() },
    reason: [
      `The loop "${run.state.loop}" is not finished. Next node: "${next.name}" (${next.status}).`,
      `Do that node now, as the loop's SKILL.md says. Then go on to the next one, up to the hand-over and finish.`,
      "Do not ask the person anything: take the default and run decide.",
      `If the node cannot be done, run: ${script} left ${next.name} --why "<why>"`,
      `To see where the run is: ${script} status`,
      `This is push ${pushes} of ${run.state.budget.maxPushes}, with about ${Math.max(0, left.minutesLeft)} minutes left of the budget.`,
    ].join("\n"),
  };
}

/** Decides, then writes what the decision needs: the push count and note, or the pause and a notice. Returns the decision. */
export function handle(input, env = process.env, now = Date.now()) {
  const result = decide(input, env, now);
  if (result.pause) {
    const state = { ...result.run.state, paused: result.pause };
    writeJsonFile(path.join(result.run.runDir, STATE_FILE), state);
    sendNotice(`${state.loop} paused`, `${result.pause.why}. Run resume --continue to go on.`, env);
  } else if (result.block) {
    writeJsonFile(path.join(result.run.runDir, STATE_FILE), { ...result.run.state, pushes: result.pushes });
    fs.writeFileSync(result.notePath, `${JSON.stringify(result.note, null, 2)}\n`);
  }
  return result;
}

async function readInput() {
  let text = "";
  for await (const chunk of process.stdin) text += chunk;
  return text.trim() ? JSON.parse(text) : {};
}

if (process.argv[1]?.endsWith("finish-every-node.mjs")) {
  readInput().then((input) => {
    const result = handle(input);
    if (result.pause) { process.stderr.write(`${result.reason}\n`); return; }
    if (!result.block) return;
    process.stderr.write(`${result.reason}\n`);
    process.exitCode = 2;
  }).catch(() => { process.exitCode = 0; });
}
