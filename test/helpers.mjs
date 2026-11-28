// helpers.mjs: what both test files share. Each test gets its own temp working folder, and the notices go to a log
// file, so a test never pops a real notification or touches a real run.
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export const STATE_SCRIPT = path.join(ROOT, "shared", "scripts", "loop-state.mjs");
export const HOOKS = path.join(ROOT, "shared", "hooks");
export const NODES = "intake,build,review,handover";

/** A fresh working folder with its own notice log. */
export function workFolder() {
  const dir = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "product-loops-test-")));
  return { dir, log: path.join(dir, "notices.log"), env: envFor(dir) };
}

export function envFor(dir) {
  return { ...process.env, CLAUDE_PROJECT_DIR: dir, PRODUCT_LOOPS_NOTIFY_LOG: path.join(dir, "notices.log"), PRODUCT_LOOPS_NOTIFY_CMD: "", PRODUCT_LOOPS_NOTIFY_URL: "" };
}

/** Runs loop-state.mjs as a person would, from the working folder. Returns { code, out, err }. */
export function state(dir, ...args) {
  const result = spawnSync(process.execPath, [STATE_SCRIPT, ...args], { cwd: dir, env: envFor(dir), encoding: "utf8" });
  return { code: result.status, out: result.stdout.trim(), err: result.stderr.trim() };
}

/** Runs one hook script with a JSON input on stdin. */
export function hook(dir, name, input) {
  const result = spawnSync(process.execPath, [path.join(HOOKS, name)], { cwd: dir, env: envFor(dir), input: JSON.stringify({ cwd: dir, ...input }), encoding: "utf8" });
  return { code: result.status, out: result.stdout.trim(), err: result.stderr.trim() };
}

export function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

export function runDirOf(dir) {
  return fs.readFileSync(path.join(dir, ".loop-run"), "utf8").trim();
}

export function stateOf(dir) {
  return readJson(path.join(runDirOf(dir), "state.json"));
}

/** Writes state.json of the run directly, for cases a command cannot reach quickly (old versions, used-up budgets). */
export function patchState(dir, change) {
  const file = path.join(runDirOf(dir), "state.json");
  const value = change(readJson(file));
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
  return value;
}

/** A person's typed reply, the way the count-person-replies hook gets it. */
export function reply(dir, prompt = "go") {
  return hook(dir, "count-person-replies.mjs", { hook_event_name: "UserPromptSubmit", prompt });
}

/** init, one reply, one stop-fact item, brief.md, close-intake: a run ready for its first work node. */
export function openRun(dir, { nodes = NODES, items = ["The page opens"], extra = [] } = {}) {
  const init = state(dir, "init", "--loop", "test-loop", "--nodes", nodes, ...extra);
  if (init.code !== 0) throw new Error(init.err);
  reply(dir);
  for (const item of items) state(dir, "stop-fact", "add", "--item", item);
  fs.writeFileSync(path.join(runDirOf(dir), "brief.md"), "# Brief\n\nBuild a test page.\n");
  const close = state(dir, "close-intake");
  if (close.code !== 0) throw new Error(close.err);
  return runDirOf(dir);
}

export function proofFile(dir, name = "proof.txt") {
  fs.writeFileSync(path.join(dir, name), "it works\n");
  return name;
}
