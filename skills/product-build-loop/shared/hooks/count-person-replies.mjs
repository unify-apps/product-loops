#!/usr/bin/env node
// count-person-replies.mjs counts the person's replies while a loop run's intake is open.
//   settings.json: UserPromptSubmit (no matcher) and PostToolUse with the matcher "AskUserQuestion",
//   both running: node "<path>/count-person-replies.mjs"
// A typed message arrives as UserPromptSubmit. An answer to AskUserQuestion arrives as PostToolUse. Each adds 1
// to `replies` in the run's state.json. close-intake refuses while `replies` is 0, so the person's first message
// can never count as "go": they always see the brief and the questions first.
// It counts only while the intake is open and the run has not ended. A task notification or a system message is
// not the person, so it is not counted. On any error it exits 0 and changes nothing.
import fs from "node:fs";
import path from "node:path";
import { findRun, isEnded, STATE_FILE } from "../scripts/run-files.mjs";

// Text the app sends on its own, not typed by the person.
const NOT_THE_PERSON = /^\s*(<task-notification>|\[SYSTEM NOTIFICATION|<system-reminder>|<local-command)/u;

/** Pure: true when this hook input is the person replying. */
export function isPersonReply(input) {
  if (input?.hook_event_name === "PostToolUse") return input.tool_name === "AskUserQuestion";
  if (input?.hook_event_name === "UserPromptSubmit") return typeof input.prompt === "string" && input.prompt.trim() !== "" && !NOT_THE_PERSON.test(input.prompt);
  return false;
}

/** Adds 1 to the open intake's reply count. Returns the new count, or null when nothing was counted. */
export function countReply(input, env = process.env, now = new Date()) {
  if (!isPersonReply(input)) return null;
  const run = findRun([input?.cwd, env.CLAUDE_PROJECT_DIR]);
  if (!run || run.state.intake !== "open" || isEnded(run.state)) return null;
  const state = { ...run.state, replies: (run.state.replies ?? 0) + 1, changedAt: now.toISOString() };
  const file = path.join(run.runDir, STATE_FILE);
  fs.writeFileSync(`${file}.tmp`, `${JSON.stringify(state, null, 2)}\n`);
  fs.renameSync(`${file}.tmp`, file);
  return state.replies;
}

async function readInput() {
  let text = "";
  for await (const chunk of process.stdin) text += chunk;
  return text.trim() ? JSON.parse(text) : {};
}

if (process.argv[1]?.endsWith("count-person-replies.mjs")) {
  readInput().then((input) => { countReply(input); }).catch(() => { process.exitCode = 0; });
}
