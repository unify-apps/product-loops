#!/usr/bin/env node
// numbers.mjs prints the headline numbers of report.json as a markdown table: baseline, each kept round, final.
// For the pull request body and the hand-over; the HTML page shows the same from the same file.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const here = path.dirname(fileURLToPath(import.meta.url));
const r = JSON.parse(fs.readFileSync(path.join(here, "results", "report.json"), "utf8"));
const rows = [["0.1.5 baseline", r.overall.baseline], ...r.rounds.map((x) => [x.name, x.overall]), ["0.2.0 final", r.overall.improved]];
const pct = (x) => (x == null ? "–" : `${Math.round(x * 100)}%`);
const f1 = (x) => (x == null ? "–" : (Math.round(x * 10) / 10).toFixed(1));
const mean = (o) => { const v = r.keys.scored_checks.map((k) => o.checks[k]).filter((x) => typeof x === "number"); return v.reduce((a, b) => a + b, 0) / v.length; };
console.log("| version | script checks passed | words | questions | asks nothing the files answer | under 600 words | grader: clarity | grader: no redundancy | grader: overall |");
console.log("|---|---|---|---|---|---|---|---|---|");
for (const [name, o] of rows) console.log(`| ${name} | ${pct(mean(o))} | ${Math.round(o.values.message_words)} | ${f1(o.values.asked_count)} | ${pct(o.checks.no_findable_asked)} | ${pct(o.checks.message_le_600_words)} | ${f1(o.llm.clarity)} | ${f1(o.llm.no_redundancy)} | ${f1(o.llm.overall)} |`);
console.log(`\nRouting accuracy: ${r.routing.arms.baseline?.accuracy} -> ${r.routing.arms.improved?.accuracy}`);
console.log("\nPer loop, grader overall (baseline -> final):");
for (const l of r.keys.loops) console.log(`- ${l}: ${f1(r.loops[l].baseline.llm.overall)} -> ${f1(r.loops[l].improved.llm.overall)}; clarity ${f1(r.loops[l].baseline.llm.clarity)} -> ${f1(r.loops[l].improved.llm.clarity)}; questions ${f1(r.loops[l].baseline.values.asked_count)} -> ${f1(r.loops[l].improved.values.asked_count)}`);
