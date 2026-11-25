#!/usr/bin/env node
// resume-run.mjs is a SessionStart hook. It puts a session back on a loop run after a restart, a resume or a
// compaction, when Claude no longer has the loop's rules in its context.
//   settings.json: { "matcher": "startup|resume|compact", "hooks": [{ "type": "command", "command": "node \"<path>/resume-run.mjs\"" }] } under "SessionStart"
// What a SessionStart hook prints goes into Claude's context. So when a run in this folder has not ended, it prints
// the re-entry packet (the same one `loop-state.mjs resume` prints): where the run is, the next node, and the files to
// read again. A paused run's packet starts with why it is paused and the person's two choices.
// It skips a run that has not changed for 24 hours (a crashed run), unless the run is paused: a pause waits for the
// person, and they may come back the next day. It reads only and always exits 0.
import { resumePacket } from "../scripts/loop-state.mjs";
import { findRun, isEnded, isPaused, isStale } from "../scripts/run-files.mjs";

/** Pure: the packet to print for this session start, or null when there is nothing to resume. */
export function packetFor(input, env = process.env, now = Date.now()) {
  const run = findRun([input?.cwd, env.CLAUDE_PROJECT_DIR]);
  if (!run || isEnded(run.state)) return null;
  if (isStale(run.state, now) && !isPaused(run.state)) return null;
  const packet = resumePacket(run, now);
  return isPaused(run.state) ? packet : `A product loop run is going on in this folder.\n${packet}`;
}

async function readInput() {
  let text = "";
  for await (const chunk of process.stdin) text += chunk;
  return text.trim() ? JSON.parse(text) : {};
}

if (process.argv[1]?.endsWith("resume-run.mjs")) {
  readInput().then((input) => {
    const packet = packetFor(input);
    if (packet) process.stdout.write(`${packet}\n`);
  }).catch(() => {}).finally(() => { process.exitCode = 0; });
}
