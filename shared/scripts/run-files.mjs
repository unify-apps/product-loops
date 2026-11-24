// run-files.mjs finds the loop run of a working folder and reads its state. It never writes state.json.
//   Imported by loop-state.mjs and by both hooks. It is not run on its own.
// The rule every caller uses: walk up from a folder until one holds `.loop-run`. That file holds the run folder's path.
// A run is "active" when its intake is closed, it is not finished or stopped, and its state changed in the last 24 hours.
import fs from "node:fs";
import path from "node:path";

export const POINTER_FILE = ".loop-run";
export const STATE_FILE = "state.json";
export const STATE_VERSION = 1;
// A run whose state has not changed for this long is treated as a crashed run, so the hooks let the person go.
// 24 hours: a real loop run takes minutes to a few hours, never a full day without one state change.
export const STALE_AFTER_MS = 24 * 60 * 60 * 1000;

/** The first folder at or above `start` that holds `.loop-run`, or null. */
export function findWorkDir(start) {
  if (!start) return null;
  let dir = path.resolve(start);
  for (;;) {
    if (fs.existsSync(path.join(dir, POINTER_FILE))) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) return null;
    dir = parent;
  }
}

/** The run of the first folder in `starts` that has one: { workDir, runDir, state }, or null when there is none. */
export function findRun(starts) {
  for (const start of starts.filter(Boolean)) {
    const workDir = findWorkDir(start);
    if (!workDir) continue;
    const runDir = fs.readFileSync(path.join(workDir, POINTER_FILE), "utf8").trim();
    const absRun = path.isAbsolute(runDir) ? runDir : path.join(workDir, runDir);
    const state = readState(absRun);
    if (state) return { workDir, runDir: absRun, state };
  }
  return null;
}

/** The state of a run folder, or null when it has none. Throws when the file is there but is not valid JSON. */
export function readState(runDir) {
  const file = path.join(runDir, STATE_FILE);
  if (!fs.existsSync(file)) return null;
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

export function isStale(state, now = Date.now()) {
  const changed = Date.parse(state?.changedAt ?? "");
  return !Number.isFinite(changed) || now - changed > STALE_AFTER_MS;
}

export const isEnded = (state) => Boolean(state?.finished || state?.stopped);

/** True when the run must not ask the person anything and must not stop: intake closed, not ended, not stale. */
export function isActive(state, now = Date.now()) {
  return Boolean(state) && state.intake === "closed" && !isEnded(state) && !isStale(state, now);
}

/** The first node that is not done or left, or null. */
export function nextNode(state) {
  return (state?.nodes ?? []).find((node) => node.status !== "done" && node.status !== "left") ?? null;
}
