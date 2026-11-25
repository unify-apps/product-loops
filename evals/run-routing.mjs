#!/usr/bin/env node
// run-routing.mjs checks that each arm's skill descriptions fire the right loop for an ask, and no loop for a
// near-miss. Only the front matter is shown, as Claude Code shows it when it picks a skill.
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { execFile } from "node:child_process";
import { EVALS, LOOPS, armDir, fail, frontMatter, loopOfSkill, parseArgs, pool, readJson, writeJson } from "./lib.mjs";

const USAGE = `run-routing.mjs: does each ask fire the right loop?

  node evals/run-routing.mjs --arm baseline|improved [options]

Options:
  --executor agent|cli     agent (default): write evals/work/routing/<arm>/PACKET.md for a helper agent, which writes
                           answers.json next to it; cli: ask claude -p, 10 asks per call
  --collect                score evals/work/routing/<arm>/answers.json
  --model <m>              the model for --executor cli (default claude-opus-5-5)
  --plugin-dir-baseline <p>, --plugin-dir-improved <p>   override the arm folders

Writes evals/results/<arm>/routing.json.`;

const args = parseArgs(process.argv.slice(2));
if (args.help || args.h) { console.log(USAGE); process.exit(0); }
const arm = args.arm;
if (!arm) fail(`--arm is needed.\n\n${USAGE}`);
const plugin = armDir(arm, args);
const executor = args.executor ?? "agent";
const work = path.join(EVALS, "work", "routing", arm);
const { items } = readJson(path.join(EVALS, "routing.json"));

const skills = LOOPS.map((loop) => {
  const file = path.join(plugin, "skills", `product-${loop}-loop`, "SKILL.md");
  const fm = frontMatter(file);
  return { name: fm.name ?? `product-${loop}-loop`, description: fm.description ?? "" };
});

// A fixed order that mixes the loops and the near-misses, so neighbours do not hint at the answer.
const hash = (s) => crypto.createHash("sha1").update(s).digest("hex");
const order = [...items].sort((a, b) => hash(a.id).localeCompare(hash(b.id)));

function prompt(batch, answerTarget) {
  return `# Task: pick the skill for each ask

You are Claude Code. These are the skills available in this session, as Claude Code lists them (name, then the
description). A skill fires when a person's message is the kind of job its description says. When no skill fits,
the answer is "none": then Claude would just answer or work without a skill.

${skills.map((s) => `- **${s.name}**: ${s.description}`).join("\n")}
- **none**: no skill above fits the ask.

For each ask below, pick the one skill that should fire, or "none". Judge from the descriptions only.

${batch.map((it) => `- ${it.id}: ${JSON.stringify(it.ask)}`).join("\n")}

Answer with only this JSON${answerTarget}, one entry per ask id, each value a skill name from the list or "none":

\`\`\`json
{ "${batch[0].id}": "<skill name or none>" }
\`\`\`
`;
}

function score(answers) {
  const rows = items.map((it) => {
    const raw = String(answers[it.id] ?? "").trim();
    const got = raw === "none" ? "none" : loopOfSkill(raw) ?? (LOOPS.includes(raw) ? raw : raw ? "other" : "missing");
    return { id: it.id, ask: it.ask, expected: it.expected, got, raw, correct: got === it.expected };
  });
  const acc = (rs) => (rs.length ? +(rs.filter((r) => r.correct).length / rs.length).toFixed(3) : null);
  const perLoop = {};
  for (const loop of [...LOOPS, "none"]) perLoop[loop] = acc(rows.filter((r) => r.expected === loop));
  const confusion = {};
  for (const r of rows) { confusion[r.expected] ??= {}; confusion[r.expected][r.got] = (confusion[r.expected][r.got] ?? 0) + 1; }
  return {
    arm, executor, scoredAt: new Date().toISOString(), skills,
    accuracy: acc(rows), positives: acc(rows.filter((r) => r.expected !== "none")), near_misses: acc(rows.filter((r) => r.expected === "none")),
    per_loop: perLoop, confusion, missing: rows.filter((r) => r.got === "missing").length, rows,
  };
}

function save(answers) {
  const result = score(answers);
  writeJson(path.join(EVALS, "results", arm, "routing.json"), result);
  console.log(`ok routing ${arm}: accuracy ${result.accuracy} (asks for a loop ${result.positives}, near-misses ${result.near_misses}); missing ${result.missing}`);
}

if (args.collect) {
  const file = path.join(work, "answers.json");
  if (!fs.existsSync(file)) fail(`No ${file} yet. Give ${path.join(work, "PACKET.md")} to a helper agent first.`);
  save(readJson(file));
} else if (executor === "agent") {
  fs.mkdirSync(work, { recursive: true });
  const out = path.join(work, "answers.json");
  fs.rmSync(out, { force: true });
  fs.writeFileSync(path.join(work, "PACKET.md"), `${prompt(order, `, written to \`${out}\``)}\nRead nothing else and write nothing else. Reply with one line: \`done\`.\n`);
  console.log(path.join(work, "PACKET.md"));
  console.error(`ok run-routing: packet for ${arm}. Give it to a fresh helper agent, then run with --collect.`);
} else {
  const model = args.model && args.model !== true ? args.model : "claude-opus-5-5";
  const batches = [];
  for (let i = 0; i < order.length; i += 10) batches.push(order.slice(i, i + 10));
  const answers = {};
  await pool(batches.map((batch) => () => new Promise((resolve) => {
    execFile("claude", ["-p", prompt(batch, " and nothing else"), "--output-format", "json", "--model", model, "--no-session-persistence"],
      { cwd: EVALS, timeout: 5 * 60 * 1000, maxBuffer: 8 * 1024 * 1024 }, (error, stdout) => {
        let text = stdout ?? "";
        try { text = JSON.parse(text).result ?? text; } catch { /* plain text */ }
        const m = String(text).match(/\{[\s\S]*\}/);
        try { Object.assign(answers, JSON.parse(m?.[0] ?? "{}")); } catch { console.error(`batch from ${batch[0].id}: no JSON in the answer`); }
        if (error) console.error(`batch from ${batch[0].id}: ${String(error.message).slice(0, 160)}`);
        resolve();
      });
  })), 3);
  fs.mkdirSync(work, { recursive: true });
  writeJson(path.join(work, "answers.json"), answers);
  save(answers);
}
