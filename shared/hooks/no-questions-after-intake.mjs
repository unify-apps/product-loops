#!/usr/bin/env node
// no-questions-after-intake.mjs is a PreToolUse hook for the AskUserQuestion tool.
//   settings.json: { "matcher": "AskUserQuestion", "hooks": [{ "type": "command", "command": "node \"<path>/no-questions-after-intake.mjs\"" }] }
// It blocks the question (exit 2, reason on stderr) only while a loop run in this folder has its intake closed,
// is not finished or stopped, and changed in the last 24 hours. In every other case, and on any error, it exits 0.
// It reads the run's state and writes nothing.
import { findRun, isActive } from "../scripts/run-files.mjs";

export function decide(input, env = process.env, now = Date.now()) {
  if (input?.tool_name && input.tool_name !== "AskUserQuestion") return { block: false };
  const run = findRun([input?.cwd, env.CLAUDE_PROJECT_DIR]);
  if (!run || !isActive(run.state, now)) return { block: false };
  const script = run.state.script ? `node "${run.state.script}"` : "loop-state.mjs";
  return {
    block: true,
    reason: [
      `Do not ask the person. The intake of the loop "${run.state.loop}" is closed, so the person may have left.`,
      "Take the default answer (the one the brief or the node lists), write it down, and go on:",
      `${script} decide --question "<your question>" --answer "<the default you took>"`,
      "Only a delete, money or an expired sign-in may wait. For those, run hold and skip that step.",
    ].join("\n"),
  };
}

async function readInput() {
  let text = "";
  for await (const chunk of process.stdin) text += chunk;
  return text.trim() ? JSON.parse(text) : {};
}

if (process.argv[1]?.endsWith("no-questions-after-intake.mjs")) {
  readInput().then((input) => {
    const result = decide(input);
    if (result.block) { process.stderr.write(`${result.reason}\n`); process.exitCode = 2; }
  }).catch(() => { process.exitCode = 0; });
}
