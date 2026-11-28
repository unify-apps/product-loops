#!/usr/bin/env node
// run-intake.mjs runs node 1 (intake) of a loop for every case, with one arm of the plugin, and keeps the message.
// Two ways to run the session:
//   --executor agent (default): writes a task packet per case. The main Claude session hands each packet to a fresh
//     helper agent, which plays the session and writes message.md. Used where headless `claude -p` is not signed in.
//   --executor cli: runs `claude -p "/product-loops:<loop> <ask>" --plugin-dir <arm> ...` itself, 15 minutes at most.
import fs from "node:fs";
import path from "node:path";
import { execFile } from "node:child_process";
import {
  armDir, blindId, caseFolder, copyDir, fail, findRunDir, loadCases, loopsOf, parseArgs, pool, skillName,
  workRoot, writeFixtures, writeJson,
} from "./lib.mjs";

const USAGE = `run-intake.mjs: run the intake of each case with one arm of the plugin.

  node evals/run-intake.mjs --arm baseline|improved --loop <build|research|design|review|deck|all> [options]

Options:
  --case <id>                 only this case (for example build-03)
  --executor agent|cli        agent (default) writes evals/work/<arm>/<case>/PACKET.md for a helper agent;
                              cli runs claude -p itself
  --model <m>                 the model for --executor cli (default claude-opus-5-5)
  --concurrency <n>           cli sessions at a time (default 4)
  --force                     run again even when the case already has its output
  --work-root <dir>           where the working folders go (default $PRODUCT_LOOPS_EVAL_ROOT or <tmp>/product-loops-evals)
  --plugin-dir-baseline <p>   the baseline plugin (default ../../baseline/product-loops from the repo)
  --plugin-dir-improved <p>   the improved plugin (default this repo)
  --pending                   only list the packets that have no message.md yet, one path per line
  --dry-run                   with --executor cli: print each command line, run nothing

Agent mode, in order: run this for both arms; give each PACKET.md to a fresh helper agent ("Read <packet> and do
exactly what it says"); then run grade-intake.mjs. A case whose message.md exists is skipped unless --force.`;

const TIMEOUT_MS = 15 * 60 * 1000; // the spec's ceiling for one intake session

const args = parseArgs(process.argv.slice(2));
if (args.help || args.h) { console.log(USAGE); process.exit(0); }
const arm = args.arm;
if (!arm) fail(`--arm is needed.\n\n${USAGE}`);
const plugin = armDir(arm, args);
const loops = loopsOf(args.loop);
const executor = args.executor ?? "agent";
if (!["agent", "cli"].includes(executor)) fail("--executor must be agent or cli.");
const model = args.model && args.model !== true ? args.model : "claude-opus-5-5";
const root = workRoot(args);

const cases = loops.flatMap((loop) => loadCases(loop, args.case));
if (!cases.length) fail(`No case matches --loop ${args.loop}${args.case ? ` --case ${args.case}` : ""}.`);

if (args.pending) {
  for (const c of cases) {
    const folder = caseFolder(arm, c.id);
    if (fs.existsSync(path.join(folder, "PACKET.md")) && !fs.existsSync(path.join(folder, "message.md"))) console.log(path.join(folder, "PACKET.md"));
  }
  process.exit(0);
}

/** A fresh working folder with only the case's files in it. */
function prepare(c) {
  const folder = caseFolder(arm, c.id);
  const ws = path.join(root, blindId(arm, c.id));
  fs.rmSync(ws, { recursive: true, force: true });
  fs.mkdirSync(ws, { recursive: true });
  const fixtures = writeFixtures(c, ws);
  for (const f of ["message.md", "result.json", "run.json", "llm-grade.json", "GRADE-PACKET.md"]) fs.rmSync(path.join(folder, f), { force: true });
  fs.rmSync(path.join(folder, "loop-runs"), { recursive: true, force: true });
  fs.mkdirSync(folder, { recursive: true });
  const meta = { arm, plugin, loop: c.loop, skill: skillName(c.loop), case: c.id, ask: c.ask, ws, fixtures, executor, model: executor === "cli" ? model : null, preparedAt: new Date().toISOString() };
  writeJson(path.join(folder, "case.json"), meta);
  return { folder, ws, fixtures, meta };
}

// The packet is the whole task for a helper that has seen nothing else. It is the same for both arms except for the
// plugin path and the two folder paths, so neither arm gets a better-worded task.
function packet(c, { folder, ws, fixtures }) {
  const skill = skillName(c.loop);
  const skillDir = path.join(plugin, "skills", skill);
  const files = fixtures.length ? fixtures.map((f) => `- \`${f}\``).join("\n") : "- (none: the folder is empty)";
  return `# Task: play one Claude Code session up to the end of its first turn

You are a fresh Claude Code session. Your working folder is:

    ${ws}

The plugin \`product-loops\` is installed from:

    ${plugin}

The person typed exactly this as their first message:

    /product-loops:${skill} ${c.ask}

The working folder holds these files before you start (written there for this task):

${files}

## What to do

1. Do exactly what the skill's node 1 (intake) says, as the session would. Start by reading
   \`${path.join(skillDir, "SKILL.md")}\` and \`${path.join(plugin, "shared", "loop-rules.md")}\`, and every file they tell you to
   read. In those files, \`\${CLAUDE_SKILL_DIR}\` means \`${skillDir}\` and \`$ARGUMENTS\` means the text after the command:
   \`${c.ask.replace(/`/g, "'")}\`.
2. Run every \`STATE\` command and every start check for real, with the working folder as the current folder and
   \`CLAUDE_PROJECT_DIR\` set to it. Your shell may not keep the current folder between commands, so begin each one
   with \`cd "${ws}" && export CLAUDE_PROJECT_DIR="${ws}" && \`.
3. You may start helper agents when the skill tells you to. Give them only what the skill says to give.
4. Read only the plugin folder above and the working folder. Never read anything in an \`evals/\` folder: it holds
   the grading of this task (step 6 only writes one file there). Do not read anything else on this computer, and do not use what you know about other versions of
   this plugin.
5. Stop where the intake ends its turn to wait for the person's reply. Do not go past it: do not write \`brief.md\`,
   do not run \`close-intake\`, and do not start any later node. If the skill would use the AskUserQuestion tool,
   write the questions as text instead: this session has no person to click.
6. Write the exact message you would have shown the person, word for word and in Markdown, to:

       ${path.join(folder, "message.md")}

   Write nothing else to that folder.

Reply with one line: \`done\`, or \`failed: <why>\`.
`;
}

function collectCli(c, prep, stdout, stderr, ms, error) {
  let result = null;
  try { result = JSON.parse(stdout); } catch { /* the session did not end with JSON; keep the raw text */ }
  fs.writeFileSync(path.join(prep.folder, "result.json"), result ? `${JSON.stringify(result, null, 2)}\n` : JSON.stringify({ raw: stdout, stderr }, null, 2));
  fs.writeFileSync(path.join(prep.folder, "message.md"), result?.result ?? "");
  const run = findRunDir(prep.ws);
  if (run) copyDir(run, path.join(prep.folder, "loop-runs", path.basename(run)));
  if (fs.existsSync(path.join(prep.ws, ".loop-run"))) fs.copyFileSync(path.join(prep.ws, ".loop-run"), path.join(prep.folder, ".loop-run"));
  writeJson(path.join(prep.folder, "run.json"), {
    minutes: +(ms / 60000).toFixed(2), cost_usd: result?.total_cost_usd ?? null, num_turns: result?.num_turns ?? null,
    is_error: Boolean(error) || Boolean(result?.is_error), error: error ? String(error.message ?? error).slice(0, 500) : null,
  });
}

function runCli(c, prep) {
  const argv = ["-p", `/product-loops:${skillName(c.loop)} ${c.ask}`, "--plugin-dir", plugin, "--permission-mode", "bypassPermissions",
    "--output-format", "json", "--max-budget-usd", "4", "--model", model, "--no-session-persistence"];
  if (args["dry-run"]) {
    console.log(`(cd ${JSON.stringify(prep.ws)} && CLAUDE_PROJECT_DIR=${JSON.stringify(prep.ws)} claude ${argv.map((a) => JSON.stringify(a)).join(" ")})`);
    return Promise.resolve();
  }
  const t0 = Date.now();
  return new Promise((resolve) => {
    // execFile's own timeout kills the session after 15 minutes; macOS has no `timeout` binary to lean on.
    execFile("claude", argv, { cwd: prep.ws, env: { ...process.env, CLAUDE_PROJECT_DIR: prep.ws }, timeout: TIMEOUT_MS, maxBuffer: 64 * 1024 * 1024 }, (error, stdout, stderr) => {
      collectCli(c, prep, stdout ?? "", stderr ?? "", Date.now() - t0, error);
      console.log(`${error ? "failed" : "ok"} ${arm} ${c.id} in ${((Date.now() - t0) / 60000).toFixed(1)} min`);
      resolve();
    });
  });
}

const todo = cases.filter((c) => {
  const folder = caseFolder(arm, c.id);
  const done = executor === "cli" ? fs.existsSync(path.join(folder, "result.json")) : fs.existsSync(path.join(folder, "message.md"));
  if (done && !args.force) { console.log(`skip ${arm} ${c.id}: already has its output (use --force)`); return false; }
  return true;
});

if (executor === "agent") {
  for (const c of todo) {
    const prep = prepare(c);
    fs.writeFileSync(path.join(prep.folder, "PACKET.md"), packet(c, prep));
    console.log(path.join(prep.folder, "PACKET.md"));
  }
  console.error(`ok run-intake: ${todo.length} packets for ${arm}. Give each to a fresh helper agent, then run grade-intake.mjs --arm ${arm} --loop ${args.loop}.`);
} else {
  const n = Number(args.concurrency) > 0 ? Number(args.concurrency) : 4;
  await pool(todo.map((c) => () => runCli(c, args["dry-run"] ? { folder: caseFolder(arm, c.id), ws: path.join(root, blindId(arm, c.id)) } : prepare(c))), n);
  if (!args["dry-run"]) console.error(`ok run-intake: ${todo.length} sessions for ${arm}. Next: grade-intake.mjs --arm ${arm} --loop ${args.loop} --executor cli.`);
}
