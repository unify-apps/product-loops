#!/usr/bin/env node
// page.mjs turns evals/results/report.json (and the smoke-run summaries) into one HTML page a person can read:
// evals/results/comparison.html. The page holds all its data inline, so it can be published or sent as one file.
//   node evals/page.mjs [--out <file>]
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const EVALS = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(EVALS, "..");
const args = process.argv.slice(2);
const outArg = args.includes("--out") ? args[args.indexOf("--out") + 1] : null;
const out = path.resolve(outArg ?? path.join(EVALS, "results", "comparison.html"));

const report = JSON.parse(fs.readFileSync(path.join(EVALS, "results", "report.json"), "utf8"));

// Smoke runs: one summary.md per loop, written by an end-to-end run of the improved plugin.
const smoke = {};
for (const loop of report.keys.loops) {
  const file = path.join(EVALS, "results", "smoke", loop, "summary.md");
  if (!fs.existsSync(file)) continue;
  const text = fs.readFileSync(file, "utf8");
  const status = text.match(/^ok status[^\n]*\n(?:[^\n]*\n){0,14}/mu)?.[0] ?? "";
  const stopFact = text.match(/^ok stop-fact status[^\n]*\n(?:[^\n]*\n){0,12}/mu)?.[0] ?? "";
  const pass = /verdict"?:?\s*"?PASS|fresh agent says PASS|RESULT: PASS|review.*PASS/iu.test(text) && !/RESULT: FAIL/u.test(text);
  smoke[loop] = { text, status, stopFact, pass, words: text.split(/\s+/u).length };
}

// What changed, from the CHANGELOG's 0.2.0 entry.
const changelog = fs.readFileSync(path.join(ROOT, "CHANGELOG.md"), "utf8");
const entry = changelog.split(/^## /mu).find((part) => part.startsWith("0.2.0")) ?? "";
const changes = entry.split("\n").filter((l) => l.startsWith("- ")).map((l) => l.slice(2));

const data = { report, smoke, changes };
const json = JSON.stringify(data).replace(/<\//gu, "<\\/");

const html = `<meta charset="utf-8">
<title>Product Loops Intake Evals</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Spectral:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&display=swap">
<style>
/* The UnifyApps website's look (unifyapps.com, Nov 2026), as the Word Editor Library page uses it: Spectral for
   titles, Inter for reading, cream paper, white data cards, a deep forest band, muted gold capitals, square corners
   and hairlines. One light theme by choice: the band and the paper are the identity. */
:root { color-scheme: light;
  --paper: #F7F3ED; --sheet: #FBF9F6; --sand: #EDE6D7; --card: #FFFFFF;
  --line: #E3DACA; --line-2: #CFC4AF; --rule: #ECE6DA; --rule-2: #DDD4C3;
  --forest: #0F2805; --ink: #0F2805; --text: #2E2814; --soft: #6A5A32; --mute: #6F6857; --faint: #9D9687;
  --gold: #847347; --gold-2: #B3A378;
  --base: #B9B1A0; --impr: #2F7A3B; --impr-soft: #E4F0E1;
  --good: #2F7A3B; --good-ink: #1E5A27; --bad: #A8412F; --bad-soft: #F4DCD5; --warn: #B07A16;
  --serif: "Spectral", Georgia, serif; --sans: "Inter", system-ui, -apple-system, "Segoe UI", sans-serif; --mono: ui-monospace, "SF Mono", Menlo, monospace;
}
* { box-sizing: border-box; }
html, body { background: var(--paper); }
body { margin: 0; color: var(--text); font: 15px/1.5 var(--sans); -webkit-font-smoothing: antialiased; }
a { color: var(--ink); text-decoration: underline; text-decoration-color: var(--gold-2); text-underline-offset: 3px; text-decoration-thickness: 1px; }
a:hover { text-decoration-color: var(--ink); }
:focus-visible { outline: 1px solid var(--gold); outline-offset: 3px; }

/* hero band */
.hero { background: radial-gradient(120% 140% at 50% 0%, #2A4A1A 0%, #132E08 45%, #0A1C03 100%); color: #F7F3ED; }
.hero-in { max-width: 1240px; margin: 0 auto; padding: 36px 32px 34px; display: grid; gap: 14px 40px; grid-template-columns: minmax(0, 1fr) minmax(0, 420px); align-items: end; }
.eyebrow { margin: 0 0 10px; font: 500 12px/1.3 var(--sans); letter-spacing: .22em; text-transform: uppercase; color: #C4B58C; }
h1 { margin: 0; font-family: var(--serif); font-weight: 300; font-size: clamp(30px, 4vw, 44px); line-height: 1.1; letter-spacing: -.02em; text-wrap: balance; }
h1 em { font-style: italic; color: #C4B58C; }
.hero .lede { margin: 0; font: 300 16px/1.55 var(--serif); color: #DCD4C2; max-width: 48ch; }
.hero .lede b { font-weight: 500; color: #F7F3ED; }

/* page */
.wrap { max-width: 1240px; margin: 0 auto; padding: 40px 32px 56px; display: grid; gap: 44px; }
.wrap > section { min-width: 0; }
.sec-h { padding-bottom: 14px; }
h2 { margin: 0; font-family: var(--serif); font-weight: 300; font-size: 28px; letter-spacing: -.015em; color: var(--ink); display: flex; align-items: baseline; gap: 12px; text-wrap: balance; }
h2 .n { font: 600 11px/1 var(--sans); letter-spacing: .14em; color: var(--gold); }
h3 { font: 500 15px/1.4 var(--sans); margin: 24px 0 8px; color: var(--ink); }
p { max-width: 72ch; margin: 0 0 14px; color: var(--text); }
.note { font: 13px/1.5 var(--sans); color: var(--mute); }
code { font-family: var(--mono); font-size: 12.5px; color: var(--soft); }

/* tiles: white cards, square, hairline */
.tiles { display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap: 10px; margin: 0; }
.tile { background: var(--card); border: 1px solid var(--rule); padding: 16px 18px; min-width: 0; }
.tile .eyebrow { color: var(--gold); letter-spacing: .14em; font-size: 11px; margin-bottom: 8px; }
.tile .n { font-family: var(--serif); font-size: 34px; line-height: 1; font-variant-numeric: tabular-nums; margin: 6px 0 4px; color: var(--ink); }
.tile .pair { display: flex; gap: 18px; align-items: baseline; font-variant-numeric: tabular-nums; }
.tile .pair b { font-family: var(--serif); font-size: 32px; font-weight: 400; color: var(--ink); line-height: 1.1; }
.tile .pair span:last-child b { color: var(--good-ink); }
.tile .pair small { color: var(--mute); font: 500 11px/1.4 var(--sans); letter-spacing: .08em; text-transform: uppercase; display: block; }
.delta { font: 500 12.5px/1.4 var(--sans); margin-top: 6px; }
.up { color: var(--good-ink) } .down { color: var(--bad) } .flat { color: var(--mute) }

/* bars */
.legend { display: flex; flex-wrap: wrap; gap: 6px 22px; font: 12.5px/1.4 var(--sans); color: var(--mute); margin: 0 0 10px; }
.legend i { display: inline-block; width: 12px; height: 12px; vertical-align: -1px; margin-right: 7px; }
.chart { background: var(--card); border: 1px solid var(--rule-2); padding: 18px 20px; overflow-x: auto; box-shadow: 0 1px 2px rgba(46,40,20,.05), 0 8px 24px -12px rgba(46,40,20,.12); }
.bars { display: grid; grid-template-columns: minmax(160px, 260px) 1fr 72px; gap: 8px 14px; align-items: center; font-size: 13.5px; }
.bars .lab { color: var(--ink); min-width: 0; overflow-wrap: anywhere; font-weight: 500; }
.bars .track { display: grid; gap: 3px; }
.bars .bar { height: 9px; position: relative; }
.bars .bar.b { background: var(--base); } .bars .bar.i { background: var(--impr); }
.bars .val { font-variant-numeric: tabular-nums; text-align: right; color: var(--mute); font-size: 12.5px; white-space: nowrap; }

/* tables */
.tablewrap { overflow-x: auto; background: var(--card); border: 1px solid var(--rule-2); box-shadow: 0 1px 2px rgba(46,40,20,.05), 0 8px 24px -12px rgba(46,40,20,.12); }
table { border-collapse: collapse; width: 100%; font: 14px/1.45 var(--sans); }
th, td { text-align: left; padding: 13px 18px; border-bottom: 1px solid var(--rule); vertical-align: top; overflow-wrap: break-word; }
tbody tr:last-child > * { border-bottom: 0; }
thead th { font: 500 12.5px/1.3 var(--sans); color: var(--text); background: var(--card); border-bottom: 1px solid var(--rule-2); }
td:first-child { font-weight: 500; color: var(--ink); }
td.num, th.num { text-align: right; font-variant-numeric: tabular-nums; }
td b { font-weight: 600; color: var(--ink); }

/* chips: the small marks of the reference, square-ish */
.chip { display: inline-flex; align-items: center; gap: 6px; font: 500 12px/1.3 var(--sans); padding: 3px 8px; border: 1px solid var(--rule-2); margin: 2px 4px 2px 0; white-space: nowrap; color: var(--mute); background: var(--card); }
.chip::before { content: ""; width: 7px; height: 7px; border-radius: 50%; background: #B9B1A0; flex: none; }
.chip.ok { color: var(--good-ink); border-color: #CFE2CB; background: var(--impr-soft); } .chip.ok::before { background: var(--good); }
.chip.no { color: #8E2F1D; border-color: #E8C8BF; background: var(--bad-soft); } .chip.no::before { background: var(--bad); }
.chip.na { color: var(--mute); } .chip.na::before { background: transparent; box-shadow: inset 0 0 0 1.5px #B9B1A0; }

/* filters */
.filters { display: flex; flex-wrap: wrap; gap: 8px; margin: 0 0 16px; }
.filters button { font: 500 12.5px/1.3 var(--sans); letter-spacing: .08em; text-transform: uppercase; padding: 9px 14px; border: 1px solid var(--line-2); background: var(--card); color: var(--ink); cursor: pointer; }
.filters button[aria-pressed="true"] { background: var(--forest); color: #EDE6D7; border-color: var(--forest); }

/* cases */
.case { background: var(--card); border: 1px solid var(--rule-2); padding: 18px 20px; margin: 0 0 12px; min-width: 0; }
.case .ask { font: 400 17px/1.4 var(--serif); color: var(--ink); margin: 6px 0 10px; }
.case .meta { font: 12.5px/1.4 var(--sans); color: var(--mute); }
.two { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 12px; margin-top: 12px; }
.arm { border: 1px solid var(--rule); padding: 12px 14px; min-width: 0; background: var(--sheet); }
.arm.b { border-top: 3px solid var(--base); } .arm.i { border-top: 3px solid var(--impr); }
.arm h4 { margin: 0 0 8px; font: 600 11px/1.3 var(--sans); letter-spacing: .14em; text-transform: uppercase; color: var(--gold); }
.scores { display: flex; flex-wrap: wrap; gap: 6px 14px; font: 12.5px/1.4 var(--sans); font-variant-numeric: tabular-nums; margin: 8px 0; color: var(--text); }
.scores span b { font-weight: 600; color: var(--ink); }
details { margin-top: 8px; }
summary { cursor: pointer; font: 500 12.5px/1.4 var(--sans); color: var(--ink); text-decoration: underline; text-decoration-color: var(--gold-2); text-underline-offset: 3px; }
pre.msg { white-space: pre-wrap; overflow-wrap: anywhere; font-family: var(--mono); font-size: 12px; line-height: 1.5; background: var(--card); border: 1px solid var(--rule); padding: 12px; max-height: 440px; overflow: auto; margin: 8px 0 0; color: var(--text); }

/* lists and smoke */
.changes { margin: 0; padding-left: 20px; display: grid; gap: 8px; max-width: 86ch; }
.changes li { color: var(--text); }
.smoke { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 10px; }
.smoke .tile pre { white-space: pre-wrap; font-family: var(--mono); font-size: 11.5px; color: var(--mute); margin: 10px 0 0; max-height: 220px; overflow: auto; }
.verdict { font: 600 11px/1.4 var(--sans); letter-spacing: .06em; text-transform: uppercase; display: inline-block; padding: 2px 8px; border-radius: 999px; }
.verdict.pass { color: #2F6B37; background: #E4F0E1; } .verdict.fail { color: #8E2F1D; background: var(--bad-soft); } .verdict.none { color: var(--mute); background: #EFEBE3; }
@media (prefers-reduced-motion: no-preference) { .bars .bar { transition: width .4s ease; } }
@media (max-width: 900px) { .hero-in { grid-template-columns: 1fr; } }
@media (max-width: 640px) { .hero-in, .wrap { padding-left: 16px; padding-right: 16px; } .wrap { gap: 32px; } h2 { font-size: 22px; } th, td { padding: 11px 12px; } }
</style>
<header class="hero"><div class="hero-in">
  <div><p class="eyebrow">product-loops · 0.1.5 vs 0.2.0</p><h1>Did the loops <em>get better?</em></h1></div>
  <p class="lede" id="lede"></p>
</div></header>
<main class="wrap">
  <section>
    <div class="sec-h"><h2><span class="n">01</span>The short answer</h2></div>
    <div class="tiles" id="tiles"></div>
    <p class="note" id="coverage" style="margin-top:12px"></p>
  </section>

  <section id="rounds-section" hidden>
    <div class="sec-h"><h2><span class="n">02</span>Round by round</h2></div>
    <p>The improved plugin was run, graded and changed more than once before the pull request. Every row is the same 50 asks; the grader never saw a version name. Read the rows top to bottom in time.</p>
    <div class="tablewrap"><table id="rounds"></table></div>
  </section>

  <section>
    <div class="sec-h"><h2><span class="n">03</span>Script checks, every case</h2></div>
    <p>Each check is counted from the intake message and the run folder. A bar is the share of cases that pass. Four checks (estimate, coverage scan, track, Recommended and Why) test things only 0.2.0 was asked to do; the baseline fails them by design. The length check (600 words) was added after round 1, when the blind grader called the first improved messages a wall.</p>
    <div class="legend"><span><i style="background:var(--base)"></i>0.1.5 baseline</span><span><i style="background:var(--impr)"></i>0.2.0 improved</span></div>
    <div class="chart"><div class="bars" id="checkbars"></div></div>
  </section>

  <section>
    <div class="sec-h"><h2><span class="n">04</span>Blind grader, 0 to 10</h2></div>
    <p>A separate model read each message without knowing which version wrote it, and scored it on six things. Mean over the graded cases.</p>
    <div class="legend"><span><i style="background:var(--base)"></i>0.1.5 baseline</span><span><i style="background:var(--impr)"></i>0.2.0 improved</span></div>
    <div class="chart"><div class="bars" id="llmbars"></div></div>
  </section>

  <section>
    <div class="sec-h"><h2><span class="n">05</span>Per loop</h2></div>
    <div class="tablewrap"><table id="looptable"></table></div>
  </section>

  <section>
    <div class="sec-h"><h2><span class="n">06</span>Which loop fires</h2></div>
    <p>The five skill descriptions of each version were shown to a model with the 50 asks and 15 near-misses that should fire nothing. Accuracy is the share picked right.</p>
    <div class="tiles" id="routing"></div>
  </section>

  <section>
    <div class="sec-h"><h2><span class="n">07</span>The 50 cases, side by side</h2></div>
    <p>Open a case to read both intake messages word for word. The ask, the files in the folder and the model were the same for both versions.</p>
    <div class="filters" id="filters" role="group" aria-label="Filter cases by loop"></div>
    <div id="cases"></div>
  </section>

  <section>
    <div class="sec-h"><h2><span class="n">08</span>End-to-end smoke runs of 0.2.0</h2></div>
    <p>One full unattended run per loop on a tiny ask, intake to <code>finish</code>, to prove the new gates hold together: stop-fact items, the review verdict, the metrics report and the hand-over.</p>
    <div class="smoke" id="smoke"></div>
  </section>

  <section>
    <div class="sec-h"><h2><span class="n">09</span>What changed in the plugin</h2></div>
    <ul class="changes" id="changes"></ul>
    <div class="tiles" id="plugin" style="margin-top:16px"></div>
  </section>

  <section>
    <div class="sec-h"><h2><span class="n">10</span>Method and limits</h2></div>
    <p>This measures the intake, the one turn a person actually reads before leaving, on 10 realistic asks per loop. Both versions ran as fresh sessions on the same model with the same files. The script checks are pattern based; read the evidence on a case before trusting a single number. The blind grader is one model reading once. The end-to-end runs are one per loop and prove the machinery, not the quality of a long build. Headless Claude was not signed in on this machine, so runs went through helper agents in one session rather than separate processes, which means the plugin's hooks did not fire during the intake runs; the engine tests cover the hooks.</p>
  </section>
</main>
<script id="data" type="application/json">${json}</script>
<script>
(function () {
  const { report, smoke, changes } = JSON.parse(document.getElementById('data').textContent);
  const K = report.keys;
  const pct = (x) => x == null ? '–' : Math.round(x * 100) + '%';
  const f1 = (x) => x == null ? '–' : (Math.round(x * 10) / 10).toString();
  const sign = (d, suffix = '') => d == null ? '' : (d > 0 ? '+' : '') + (Math.round(d * 10) / 10) + suffix;
  const cls = (d) => d == null ? 'flat' : d > 0 ? 'up' : d < 0 ? 'down' : 'flat';
  const names = {
    ended_with_go_line: 'ends with the go line', asked_le_7: 'asks 7 or fewer', every_question_has_default: 'every question has a default',
    recommended_and_why: 'Recommended + Why it matters', brief_shown: 'shows the brief', no_findable_asked: 'asks nothing the files answer',
    estimate_line: 'gives a time estimate', coverage_shown: 'shows the coverage scan', track_offered: 'names the track', message_le_600_words: 'under 600 words',
    state_initialised: 'run folder started correctly', turn_ended_without_working: 'stopped to wait, built nothing',
    completeness: 'completeness', no_redundancy: 'no redundant questions', defaults_quality: 'quality of defaults', clarity: 'clarity for a non-engineer',
    respects_words: 'respects the person\\'s words', overall: 'overall',
  };
  const B = report.overall.baseline, I = report.overall.improved;
  const mean = (obj, keys) => { const v = keys.map((k) => obj?.[k]).filter((x) => typeof x === 'number'); return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null; };
  const checksB = mean(B?.checks, K.scored_checks), checksI = mean(I?.checks, K.scored_checks);
  const overallB = B?.llm?.overall, overallI = I?.llm?.overall;
  document.getElementById('lede').innerHTML = \`\${report.coverage.both} of \${report.coverage.cases} cases ran on both versions. Baseline passed <b>\${pct(checksB)}</b> of the script checks and scored <b>\${f1(overallB)}</b> with the blind grader; the improved plugin passed <b>\${pct(checksI)}</b> and scored <b>\${f1(overallI)}</b>.\`;
  document.getElementById('coverage').textContent = \`Coverage: baseline \${report.coverage.baseline}, improved \${report.coverage.improved}, both \${report.coverage.both}. Graded by the blind grader: baseline \${B?.graded_by_llm ?? 0}, improved \${I?.graded_by_llm ?? 0}. Built \${report.builtAt}.\`;

  // Rounds: baseline, then each kept round of the improved arm, then the one in the pull request.
  const roundRows = [{ name: '0.1.5 baseline', overall: B }, ...(report.rounds ?? []), { name: '0.2.0 final', overall: I }].filter((r) => r.overall);
  if (roundRows.length > 2) {
    document.getElementById('rounds-section').hidden = false;
    const cell = (v, fmt) => \`<td class="num">\${fmt(v)}</td>\`;
    document.getElementById('rounds').innerHTML = \`<thead><tr><th>version</th><th class="num">script checks passed</th><th class="num">words, mean</th><th class="num">questions, mean</th><th class="num">asks nothing the files answer</th><th class="num">clarity (grader)</th><th class="num">overall (grader)</th></tr></thead><tbody>\${roundRows.map((r) => {
      const o = r.overall;
      return \`<tr><td>\${r.name}</td>\${cell(mean(o.checks, K.scored_checks), pct)}\${cell(o.values?.message_words, (x) => x == null ? '–' : Math.round(x))}\${cell(o.values?.asked_count, f1)}\${cell(o.checks?.no_findable_asked, pct)}\${cell(o.llm?.clarity, f1)}\${cell(o.llm?.overall, f1)}</tr>\`;
    }).join('')}</tbody>\`;
  }

  function tile(label, b, i, fmt, delta) {
    return \`<div class="tile"><div class="eyebrow">\${label}</div><div class="pair"><span><small>0.1.5</small><b>\${fmt(b)}</b></span><span><small>0.2.0</small><b>\${fmt(i)}</b></span></div><div class="delta \${cls(delta)}">\${delta == null ? '' : sign(delta) + ' improved minus baseline'}</div></div>\`;
  }
  const tiles = [
    tile('script checks passed', checksB, checksI, pct, checksB != null && checksI != null ? (checksI - checksB) * 100 : null),
    tile('blind grader, overall', overallB, overallI, f1, overallB != null && overallI != null ? overallI - overallB : null),
    tile('questions asked, mean', B?.values?.asked_count, I?.values?.asked_count, f1, B && I ? I.values.asked_count - B.values.asked_count : null),
    tile('topics the ask needed, covered', B?.values?.must_cover_hit, I?.values?.must_cover_hit, pct, B && I ? (I.values.must_cover_hit - B.values.must_cover_hit) * 100 : null),
  ];
  document.getElementById('tiles').innerHTML = tiles.join('');

  function bars(el, keys, getB, getI, fmt, max) {
    el.innerHTML = keys.map((k) => {
      const b = getB(k), i = getI(k);
      const w = (x) => x == null ? 0 : Math.max(0, Math.min(100, x / max * 100));
      return \`<div class="lab">\${names[k] ?? k}</div><div class="track"><div class="bar b" style="width:\${w(b)}%" title="baseline \${fmt(b)}"></div><div class="bar i" style="width:\${w(i)}%" title="improved \${fmt(i)}"></div></div><div class="val">\${fmt(b)} → \${fmt(i)}</div>\`;
    }).join('');
  }
  bars(document.getElementById('checkbars'), K.scored_checks, (k) => B?.checks?.[k], (k) => I?.checks?.[k], pct, 1);
  bars(document.getElementById('llmbars'), K.llm, (k) => B?.llm?.[k], (k) => I?.llm?.[k], f1, 10);

  const lt = document.getElementById('looptable');
  lt.innerHTML = '<thead><tr><th>loop</th><th class="num">cases</th><th class="num">checks 0.1.5</th><th class="num">checks 0.2.0</th><th class="num">grader 0.1.5</th><th class="num">grader 0.2.0</th><th class="num">questions 0.1.5 → 0.2.0</th><th class="num">topics covered 0.1.5 → 0.2.0</th></tr></thead><tbody>' +
    K.loops.map((loop) => {
      const L = report.loops[loop] || {}; const b = L.baseline, i = L.improved;
      const cb = mean(b?.checks, K.scored_checks), ci = mean(i?.checks, K.scored_checks);
      return \`<tr><td>\${loop}</td><td class="num">\${L.cases ?? (b?.cases ?? 0)}</td><td class="num">\${pct(cb)}</td><td class="num"><b>\${pct(ci)}</b> <span class="delta \${cls(cb != null && ci != null ? ci - cb : null)}">\${cb != null && ci != null ? sign((ci - cb) * 100, ' pts') : ''}</span></td><td class="num">\${f1(b?.llm?.overall)}</td><td class="num"><b>\${f1(i?.llm?.overall)}</b> <span class="delta \${cls(b?.llm?.overall != null && i?.llm?.overall != null ? i.llm.overall - b.llm.overall : null)}">\${b?.llm?.overall != null && i?.llm?.overall != null ? sign(i.llm.overall - b.llm.overall) : ''}</span></td><td class="num">\${f1(b?.values?.asked_count)} → \${f1(i?.values?.asked_count)}</td><td class="num">\${pct(b?.values?.must_cover_hit)} → \${pct(i?.values?.must_cover_hit)}</td></tr>\`;
    }).join('') + '</tbody>';

  const R = report.routing.arms;
  document.getElementById('routing').innerHTML = [
    tile('routing accuracy, 65 asks', R.baseline?.accuracy, R.improved?.accuracy, pct, R.baseline && R.improved ? (R.improved.accuracy - R.baseline.accuracy) * 100 : null),
    tile('the 50 real asks', R.baseline?.positives?.accuracy ?? R.baseline?.positives, R.improved?.positives?.accuracy ?? R.improved?.positives, (x) => typeof x === 'number' && x <= 1 ? pct(x) : (x ?? '–'), null),
    tile('the 15 near-misses (should fire nothing)', R.baseline?.near_misses?.accuracy ?? R.baseline?.near_misses, R.improved?.near_misses?.accuracy ?? R.improved?.near_misses, (x) => typeof x === 'number' && x <= 1 ? pct(x) : (x ?? '–'), null),
  ].join('');

  const filters = document.getElementById('filters');
  const casesEl = document.getElementById('cases');
  let current = 'all';
  function chips(arm) {
    if (!arm) return '<span class="chip na">not run</span>';
    return K.scored_checks.map((k) => { const c = arm.checks?.[k]; const p = c?.pass; return \`<span class="chip \${p === true ? 'ok' : p === false ? 'no' : 'na'}" title="\${(c?.evidence || '').replace(/"/g, '&quot;')}">\${names[k] ?? k}</span>\`; }).join('');
  }
  function scores(arm) {
    if (!arm?.llm?.scores) return '<div class="scores note">no blind grade yet</div>';
    return '<div class="scores">' + K.llm.map((k) => \`<span>\${names[k]}: <b>\${f1(arm.llm.scores[k])}</b></span>\`).join('') + '</div>';
  }
  function esc(s) { return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;'); }
  function renderCases() {
    const list = report.cases.filter((c) => current === 'all' || c.loop === current);
    casesEl.innerHTML = list.map((c) => {
      const b = c.arms.baseline, i = c.arms.improved; const d = c.deltas;
      return \`<article class="case"><div class="meta">\${c.id} · \${c.skill} · expected track: \${c.expected_track}\${c.fixtures?.length ? ' · files: ' + c.fixtures.join(', ') : ''}</div><div class="ask">“\${esc(c.ask)}”</div><div class="meta">\${esc(c.notes || '')}</div>
      \${d ? \`<div class="scores"><span>checks passed: <b>\${b.checks_passed}</b> → <b>\${i.checks_passed}</b> of \${i.checks_scored}</span><span>questions: <b>\${b.checks?.asked_count?.value ?? '–'}</b> → <b>\${i.checks?.asked_count?.value ?? '–'}</b></span>\${d.llm?.overall != null ? \`<span>grader overall: <b class="\${cls(d.llm.overall)}">\${sign(d.llm.overall)}</b></span>\` : ''}</div>\` : ''}
      <div class="two">
        <div class="arm b"><h4>0.1.5 baseline</h4>\${chips(b)}\${scores(b)}\${b ? \`<details><summary>Read the message (\${b.checks?.message_words?.value ?? '?'} words)</summary><pre class="msg">\${esc(b.message)}</pre></details>\` : ''}</div>
        <div class="arm i"><h4>0.2.0 improved</h4>\${chips(i)}\${scores(i)}\${i ? \`<details><summary>Read the message (\${i.checks?.message_words?.value ?? '?'} words)</summary><pre class="msg">\${esc(i.message)}</pre></details>\` : ''}</div>
      </div></article>\`;
    }).join('') || '<p class="note">No cases for this filter.</p>';
  }
  ['all', ...K.loops].forEach((loop) => {
    const btn = document.createElement('button'); btn.type = 'button'; btn.textContent = loop === 'all' ? 'all 50' : loop; btn.setAttribute('aria-pressed', String(loop === current)); btn.id = 'filter-' + loop;
    btn.addEventListener('click', () => { current = loop; filters.querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', String(x === btn))); renderCases(); });
    filters.appendChild(btn);
  });
  renderCases();

  document.getElementById('smoke').innerHTML = K.loops.map((loop) => {
    const s = smoke[loop];
    if (!s) return \`<div class="tile"><div class="eyebrow">\${loop}</div><div class="verdict none">not run</div></div>\`;
    return \`<div class="tile"><div class="eyebrow">\${loop}</div><div class="verdict \${s.pass ? 'pass' : 'fail'}">review \${s.pass ? 'PASS' : 'FAIL or unfinished'}</div><pre>\${esc((s.status + '\\n' + s.stopFact).trim() || s.text.slice(0, 900))}</pre></div>\`;
  }).join('');

  document.getElementById('changes').innerHTML = changes.map((c) => \`<li>\${esc(c)}</li>\`).join('') || '<li class="note">no changelog entry found</li>';
  const P = report.plugin || {};
  const pb = P.baseline || {}, pi = P.improved || {};
  document.getElementById('plugin').innerHTML = [
    tile('STATE commands', pb.state_commands?.length, pi.state_commands?.length, (x) => x ?? '–', null),
    tile('hooks', pb.hooks?.length, pi.hooks?.length, (x) => x ?? '–', null),
    tile('test files', pb.test_files ?? 0, pi.test_files ?? 0, (x) => x ?? '–', null),
    tile('loop-rules.md lines', pb.loop_rules_lines, pi.loop_rules_lines, (x) => x ?? '–', null),
  ].join('');
})();
</script>
`;
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, html);
console.log(`ok page: ${out} (${Math.round(html.length / 1024)} KB)`);
