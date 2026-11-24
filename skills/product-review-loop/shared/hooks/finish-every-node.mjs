#!/usr/bin/env node
// finish-every-node.mjs is a Stop hook. It sends Claude back to work while a loop run still has a node to do.
//   settings.json: { "hooks": [{ "type": "command", "command": "node \"<path>/finish-every-node.mjs\"" }] } under "Stop"
// It blocks the stop (exit 2, the next node on stderr) only while a run in this folder has its intake closed, is not
// finished or stopped, changed in the last 24 hours, and has a node that is not done or left. Otherwise it exits 0,
// so node 1 can end its turn to ask its questions. On any error it exits 0.
// It writes one file, stop-hook.json in the run folder, so it never pushes twice when the run made no progress.
import fs from "node:fs";
import path from "node:path";
import { findRun, isActive, nextNode } from "../scripts/run-files.mjs";

export const NOTE_FILE = "stop-hook.json";

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
  const script = run.state.script ? `node "${run.state.script}"` : "loop-state.mjs";
  return {
    block: true,
    notePath,
    note: { changedAt: run.state.changedAt, node: next.name, pushes: (note?.pushes ?? 0) + 1, at: new Date(now).toISOString() },
    reason: [
      `The loop "${run.state.loop}" is not finished. Next node: "${next.name}" (${next.status}).`,
      `Do that node now, as the loop's SKILL.md says. Then go on to the next one, up to the hand-over and finish.`,
      "Do not ask the person anything: take the default and run decide.",
      `If the node cannot be done, run: ${script} left ${next.name} --why "<why>"`,
      `To see where the run is: ${script} status`,
    ].join("\n"),
  };
}

async function readInput() {
  let text = "";
  for await (const chunk of process.stdin) text += chunk;
  return text.trim() ? JSON.parse(text) : {};
}

if (process.argv[1]?.endsWith("finish-every-node.mjs")) {
  readInput().then((input) => {
    const result = decide(input);
    if (!result.block) return;
    fs.writeFileSync(result.notePath, `${JSON.stringify(result.note, null, 2)}\n`);
    process.stderr.write(`${result.reason}\n`);
    process.exitCode = 2;
  }).catch(() => { process.exitCode = 0; });
}
