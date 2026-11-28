// run-files.mjs finds the loop run of a working folder and reads its state. It never writes state.json itself,
//   except through writeJsonFile, which every writer uses so a crash half way never leaves a broken file.
//   Imported by loop-state.mjs and by the hooks. It is not run on its own.
// The rule every caller uses: walk up from a folder until one holds `.loop-run`. That file holds the run folder's path.
// A run is "active" when its intake is closed, it is not finished, stopped or paused, and its state changed in the
// last 24 hours.
import fs from "node:fs";
import path from "node:path";

export const POINTER_FILE = ".loop-run";
export const STATE_FILE = "state.json";
export const STOP_FACT_FILE = "stop-fact.json";
// Version 2 adds the budget, the push count, the pause, the track and the skill folder. A version 1 file still loads:
// readState fills the missing fields with their defaults.
export const STATE_VERSION = 2;
// A run whose state has not changed for this long is treated as a crashed run, so the hooks let the person go.
// 24 hours: a real loop run takes minutes to a few hours, never a full day without one state change.
export const STALE_AFTER_MS = 24 * 60 * 60 * 1000;
// The budget a run gets when init names none. 6 pushes: a Stop hook that sends Claude back more often than that
// is pushing a run that is stuck, not one that is working. 40 decisions: past that, the brief left too much open.
export const DEFAULT_BUDGET = Object.freeze({ minutes: 90, maxPushes: 6, maxDecisions: 40 });
export const TRACKS = ["quick", "full"];

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

/** Fills the fields a version 1 state.json does not have, so every reader can count on them. */
export function withDefaults(state) {
  if (!state || typeof state !== "object") return state;
  const intake = state.nodes?.[0];
  // A version 1 run that already closed its intake starts its clock when the intake ended.
  const startedAt = state.intake === "closed" ? intake?.endedAt ?? null : null;
  state.budget = { ...DEFAULT_BUDGET, startedAt, ...(state.budget ?? {}) };
  state.track ??= "full";
  state.skillDir ??= null;
  state.pushes ??= 0;
  state.paused ??= null;
  state.held ??= [];
  state.decisions ??= 0;
  state.replies ??= 0;
  return state;
}

/** The state of a run folder, or null when it has none. Throws when the file is there but is not valid JSON. */
export function readState(runDir) {
  const file = path.join(runDir, STATE_FILE);
  if (!fs.existsSync(file)) return null;
  return withDefaults(JSON.parse(fs.readFileSync(file, "utf8")));
}

/** Writes JSON to a temp file, then renames it over the real one, so a reader never sees half a file. */
export function writeJsonFile(file, value) {
  fs.writeFileSync(`${file}.tmp`, `${JSON.stringify(value, null, 2)}\n`);
  fs.renameSync(`${file}.tmp`, file);
}

/** The stop-fact checklist of a run folder: { items: [{ id, item, passes, proof, note }] }. Empty when there is none. */
export function readStopFact(runDir) {
  const file = path.join(runDir, STOP_FACT_FILE);
  if (!fs.existsSync(file)) return { items: [] };
  const value = JSON.parse(fs.readFileSync(file, "utf8"));
  return { ...value, items: Array.isArray(value?.items) ? value.items : [] };
}

export function isStale(state, now = Date.now()) {
  const changed = Date.parse(state?.changedAt ?? "");
  return !Number.isFinite(changed) || now - changed > STALE_AFTER_MS;
}

export const isEnded = (state) => Boolean(state?.finished || state?.stopped);

/** True when the push or time budget ran out and nobody has said to go on yet. A paused run is not ended. */
export const isPaused = (state) => Boolean(state?.paused);

/** True when the run must not ask the person anything and must not stop: intake closed, not ended, not paused, not stale. */
export function isActive(state, now = Date.now()) {
  return Boolean(state) && state.intake === "closed" && !isEnded(state) && !isPaused(state) && !isStale(state, now);
}

/** The first node that is not done or left, or null. */
export function nextNode(state) {
  return (state?.nodes ?? []).find((node) => node.status !== "done" && node.status !== "left") ?? null;
}

/**
 * What is left of the run's budget: { minutesUsed, minutesLeft, pushesLeft, decisionsLeft, over, why }.
 * The clock starts at close-intake, so the intake's back and forth with the person never counts.
 * `over` is true when the minutes or the pushes are used up. Decisions never make a run stop: past their budget the
 * run only warns, because stalling a run over one more default would cost the person more than the default does.
 */
export function budgetLeft(state, now = Date.now()) {
  const budget = withDefaults({ ...state }).budget;
  const started = Date.parse(budget.startedAt ?? "");
  const minutesUsed = Number.isFinite(started) ? Math.max(0, Math.floor((now - started) / 60000)) : 0;
  const minutesLeft = budget.minutes - minutesUsed;
  const pushes = state?.pushes ?? 0;
  const pushesLeft = budget.maxPushes - pushes;
  const decisionsLeft = budget.maxDecisions - (state?.decisions ?? 0);
  let why = null;
  if (pushesLeft <= 0) why = `the push budget is used up (${pushes} of ${budget.maxPushes} pushes)`;
  else if (minutesLeft <= 0) why = `the time budget is used up (${minutesUsed} of ${budget.minutes} minutes)`;
  return { minutesUsed, minutesLeft, pushesLeft, decisionsLeft, over: Boolean(why), why };
}
