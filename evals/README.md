# Evals

These evals compare two versions of the plugin on the one moment every loop depends on: the intake. That is the
first message, where the loop shows its brief and asks its one round of questions before the person leaves. A weak
intake means an hour of work built on guesses, so it is worth measuring on its own.

The two versions are called arms:

- **baseline**: the 0.1.5 plugin, a pristine copy outside this repo (default `../../baseline/product-loops`).
- **improved**: this checkout.

Each script takes `--plugin-dir-baseline` and `--plugin-dir-improved` to point somewhere else, and prints its
usage with `--help`. Node 22, no packages.

## What is here

| Path | What it holds |
|---|---|
| `cases/<loop>.json` | 10 cases per loop, 50 in all: the ask, the files in the folder, what the intake must settle, and what it can already find |
| `fixtures/proto-clinic/` | a one-file clinic prototype with 4 screens and 4 planted faults (see `FAULTS.md`), used by the design and review cases |
| `fixtures/reference/` | a small booking wizard a design case copies from |
| `routing.json` | the 50 asks plus 15 near-misses that should fire no loop |
| `run-intake.mjs` | runs the intake of each case with one arm |
| `grade-intake.mjs` | script checks on each message, plus a blind LLM grade |
| `run-routing.mjs` | asks which skill each ask should fire, from the descriptions only |
| `report.mjs` | joins everything into `results/report.json` for the comparison page |
| `lib.mjs` | what the scripts share, including every script check |
| `work/` | packets, working copies and raw outputs (not committed) |
| `results/` | one JSON per case and arm, `summary.json`, the routing scores and `report.json` |

## A case

```json
{ "id": "build-03", "ask": "add a loyalty points module to the bakery prototype in shop/ ...",
  "files": { "shop/index.html": "...", "shop/README.md": "..." },
  "must_cover": ["persona|customer|who uses", "redeem|free coffee"],
  "findable": ["which product|existing product", "points rule|per £1"],
  "expected_track": "quick", "notes": "why this case is here" }
```

- `files`: written into an empty working folder before the run. A value is the file's text, or
  `{ "copy": "<path under fixtures/>" }`.
- `must_cover`: topics the intake must settle, in the brief or in a question. `a|b|c` means any of these words.
- `findable`: facts the ask or the files already give. Asking a question about one is a fault.
- `expected_track`: `quick` or `full`, the track a good intake would recommend.

The cases vary on purpose: industries from dairy farming to hospitals, one-person shops to enterprises, terse and
rambling voices, a mixed Portuguese and English ask, cases where the files answer almost everything, and 2 or 3 per
loop small enough for the quick track.

## How to run it

The working folders go to `--work-root` (default `$PRODUCT_LOOPS_EVAL_ROOT`, else `<tmp>/product-loops-evals`).
They sit outside the repo on purpose, and are named by a hash, so no path in a message gives the arm away.

### With helper agents (the default)

Use this when headless `claude -p` is not signed in. The scripts write task packets; the main Claude session gives
each packet to a fresh helper agent with the one line "Read <packet> and do exactly what it says."

```bash
# 1. Prepare: a working folder and a PACKET.md per case, for each arm
node evals/run-intake.mjs --arm baseline --loop all --work-root <dir>
node evals/run-intake.mjs --arm improved --loop all --work-root <dir>

# 2. Hand out the intake packets (one fresh helper each); list what is still open with:
node evals/run-intake.mjs --arm baseline --loop all --pending
node evals/run-intake.mjs --arm improved --loop all --pending

# 3. Script checks, and the blind grade packets
node evals/grade-intake.mjs --arm baseline --loop all
node evals/grade-intake.mjs --arm improved --loop all

# 4. Hand out the grade packets listed in evals/work/grade/index.json (one fresh helper each);
#    list what is still open with --pending, as above

# 5. Merge the grades
node evals/grade-intake.mjs --arm baseline --loop all --collect
node evals/grade-intake.mjs --arm improved --loop all --collect

# 6. Routing: one packet per arm, then score it
node evals/run-routing.mjs --arm baseline
node evals/run-routing.mjs --arm improved
#    (hand out evals/work/routing/<arm>/PACKET.md, one fresh helper each)
node evals/run-routing.mjs --arm baseline --collect
node evals/run-routing.mjs --arm improved --collect

# 7. The report
node evals/report.mjs
```

The intake packets of the two arms are the same word for word, except for the plugin path and the folder paths.
The helper plays the session up to the end of its first turn: it runs the real `STATE` commands in the working
folder, writes the message it would show to `message.md`, and stops. The grade packets name no arm, the plugin
paths are blanked out of the message, and they sit in folders named by a hash, mixed in one list.

### With `claude -p`

Add `--executor cli` to steps 1, 3 and 6. Step 1 then runs
`claude -p "/product-loops:<loop> <ask>" --plugin-dir <arm> --permission-mode bypassPermissions --output-format json --max-budget-usd 4 --model <m> --no-session-persistence`
in each working folder, 4 at a time (`--concurrency`), 15 minutes at most each, and keeps `result.json`,
`message.md`, the run folder, and the minutes, cost and turns. Steps 2 and 4 fall away; step 5 is not needed.
`--dry-run` prints the command lines without running them.

## The script checks

Each check is a yes or no with its evidence, except the values at the end.

| Check | Passes when |
|---|---|
| `ended_with_go_line` | the last line is the "Reply with your answers, or just go" sentence |
| `asked_le_7` | 7 numbered questions or fewer (`asked_count` holds the number) |
| `every_question_has_default` | every question names a default (`Recommended:` or `Default:`) |
| `recommended_and_why` | every question has both `Recommended:` and `Why it matters:` |
| `brief_shown` | a brief of 5 lines or more comes before the questions |
| `no_findable_asked` (question lines only; a rival named in a Recommended: line does not count) | no question is about a fact the ask or the files already give |
| `estimate_line` | a line names minutes and helper agents |
| `coverage_shown` | a plain line saying what is still open after reading the files (round 3), a `Coverage:` line with counts (round 2), or the full table (round 1, which the blind grader called a wall) |
| `track_offered` | a line names the track, quick or full; a question only when both fit the ask |
| `message_le_600_words` | the whole message is 600 words or fewer: a person answers it in two minutes |
| `state_initialised` | `state.json` exists, the intake is open, and the person has replied 0 times |
| `turn_ended_without_working` | no file was made outside the fixtures and `loop-runs/` (the deck loop's tool setup in `decks/` is allowed) |
| `asked_count`, `must_cover_hit`, `stop_fact_items`, `message_words` | values, not pass or fail. `stop_fact_items` is 0 for both arms at this point: the improved intake writes them after "go" |

Some checks test features only the improved arm has (the estimate, the table, the track, `Why it matters:`), so
the baseline fails them by design. The fair comparisons are the shared ones and the LLM grade.

## The LLM grade

A fresh grader reads the ask, the files, the must-cover and findable lists, and the message, and scores six things
from 0 to 10, each with one line of evidence: `completeness`, `no_redundancy`, `defaults_quality`, `clarity`,
`respects_words` and `overall`. It runs once per case, since the temperature cannot be set.

## What it proves, and what it does not

It proves how well each arm opens a job: whether it reads the files before asking, asks fewer and better questions
with real defaults, keeps to the person's words, and stops to wait. It also checks that the skill descriptions fire
the right loop and stay quiet on near-misses.

It does not prove that a whole run is better. Nothing after the intake runs here: no building, no review node, no
hand-over. The full runs are smoke-tested separately, one per loop, and saved under `results/smoke/`. A helper agent
playing a session is close to a real session but not the same: it has no hooks, and it may lack tools a real session
has. Both arms get the same helper, so the comparison stays fair, but the absolute numbers are a little off.

## Cost

With `--executor cli`, each intake is capped at 4 US dollars and usually costs far less; 100 intakes (50 cases, two
arms) plus 100 grades and 14 routing calls come to roughly 40 to 120 dollars on Opus, and about an hour at 4 at a
time. With helper agents the cost is the main session's usage instead: about 200 helper runs of a few minutes each.
