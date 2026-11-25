# Smoke run summary: product-design-loop

## 1. STATE output

```
$ STATE status
ok status product-design-loop: intake closed, finished
run folder: /private/tmp/claude-501/-Users-harshalkotti--claude-spares-spare-81Mfoj/44c366c7-da1f-48f6-b2fa-e04f993e0a17/scratchpad/smokework/design/loop-runs/product-design-loop-20261126-032658
  done    intake
  done    run-prototype
  left    copy-reference: no reference was given
  done    make-changes
  done    sweep
  done    review
  done    handover
next node: none, run finish
decisions: 2 (in decisions.md)
budget: 5 of 60 minutes used, 0 of 6 pushes, 2 of 40 decisions
stop fact: 5 of 5 items pass

$ STATE stop-fact status
ok stop-fact status: 5 of 5 items pass
  pass    S1 Every one of the 4 rows in requests.md is done or swept, or left with a reason. (proof: loop-runs/product-design-loop-20261126-032658/review.json)
  pass    S2 Every everywhere row's find in sweep.md shows no place left, except places skipped with a reason. (proof: loop-runs/product-design-loop-20261126-032658/review.json)
  pass    S3 The final compare has no UNEXPECTED and no BROKEN screen. (proof: loop-runs/product-design-loop-20261126-032658/review.json)
  pass    S4 Every changed part of the code traces to a row, or to a decision a row needed. (proof: loop-runs/product-design-loop-20261126-032658/review.json)
  pass    S5 The prototype's link http://localhost:4100/ answers 200. (proof: loop-runs/product-design-loop-20261126-032658/review.json)

$ STATE report
ok report: written to loop-runs/product-design-loop-20261126-032658/metrics.json
| node | status | minutes | retries |
|---|---|---|---|
| intake | done | 2.8 | 0 |
| run-prototype | done | 0.8 | 0 |
| copy-reference | left | 0 | 0 |
| make-changes | done | 1.5 | 0 |
| sweep | done | 0.4 | 0 |
| review | done | 1.5 | 0 |
| handover | done | 0.3 | 0 |

track: full; budget: 60 minutes, 6 pushes, 40 decisions
minutes since close-intake: 4.9; pushes: 0; decisions: 2; held: 0; left nodes: copy-reference
```

## 2. handover.md

# Handover: clinic prototype design changes

## What was made
- The clinic prototype `clinic/index.html`, changed in place for your notes. Link: http://localhost:4100/ (answers 200).
- Start the server: `node "/private/tmp/claude-501/-Users-harshalkotti--claude-spares-spare-81Mfoj/44c366c7-da1f-48f6-b2fa-e04f993e0a17/scratchpad/repo/product-loops/skills/product-design-loop/scripts/serve.mjs" start --dir clinic --state loop-runs/product-design-loop-20261126-032658/server.json` (port 4100). Stop it: `node "/private/tmp/claude-501/-Users-harshalkotti--claude-spares-spare-81Mfoj/44c366c7-da1f-48f6-b2fa-e04f993e0a17/scratchpad/repo/product-loops/skills/product-design-loop/scripts/serve.mjs" stop --state loop-runs/product-design-loop-20261126-032658/server.json`. It is left running.

## Requests
| # | Change | Status | Proof |
|---|---|---|---|
| 1 | Nav link "Clients" becomes "Customers" (everywhere) | swept | grep -l Clients after/*.txt: no file; nav shows "Today Customers Invoices Settings" on every screen (change-checks.md, sweep.md) |
| 2 | "Client" column on Today and Invoices becomes "Customer"; "No client matches" becomes "No customer matches" (everywhere) | swept | grep -il client after/*.txt: no file; sweep find on shown text: no match (sweep.md) |
| 3 | Remove the Export button on the Home screen | left: no Export button and no Home screen exist | grep -n -i export clinic/index.html: no match; your answer 1 (default): remove nothing |
| 4 | Today appointments table rows: 10px top and bottom padding | done | eval: Today td padding 10px/10px; Customers and Invoices td still 4px (change-checks.md) |

## Screens (before / after)
| Screen | Before | After |
|---|---|---|
| today | loop-runs/product-design-loop-20261126-032658/before/today.png | loop-runs/product-design-loop-20261126-032658/after/today.png |
| customers | loop-runs/product-design-loop-20261126-032658/before/customers.png | loop-runs/product-design-loop-20261126-032658/after/customers.png |
| customers-search-empty | loop-runs/product-design-loop-20261126-032658/before/customers-search-empty.png | loop-runs/product-design-loop-20261126-032658/after/customers-search-empty.png |
| invoices | loop-runs/product-design-loop-20261126-032658/before/invoices.png | loop-runs/product-design-loop-20261126-032658/after/invoices.png |
| settings | loop-runs/product-design-loop-20261126-032658/before/settings.png | loop-runs/product-design-loop-20261126-032658/after/settings.png |

## Files changed
- `clinic/index.html` only (6 lines: one CSS rule, one table class, the nav label, two column headers, the search empty line). Original in `loop-runs/product-design-loop-20261126-032658/before/source/index.html`. Nothing was committed, pushed or published.

## Broken before the run (left as they were)
- Today: "New appointment" does nothing (dead click).
- Settings: lorem ipsum text under "Booking policy".
- Invoices: the "Overdue" filter shows an empty table with no words.

## Proposals
- Give "New appointment" a booking form (time, customer, therapist, type, room).
- Replace the lorem ipsum under "Booking policy" with your clinic's policy words.
- Add an empty line to Invoices, such as "No overdue invoices."
- Row 3: if your Export note meant another button, or an older version of the prototype, name the control and it can go in a next run.
- Choices taken for you (decisions.md): the padding is scoped with a new `appointments` class on the Today table, and header cells keep 4px; the column header says "Customer" (singular); the address `#/clients` and code names keep "client".

## Stop fact
ok stop-fact status: 5 of 5 items pass
  pass    S1 Every one of the 4 rows in requests.md is done or swept, or left with a reason. (proof: loop-runs/product-design-loop-20261126-032658/review.json)
  pass    S2 Every everywhere row's find in sweep.md shows no place left, except places skipped with a reason. (proof: loop-runs/product-design-loop-20261126-032658/review.json)
  pass    S3 The final compare has no UNEXPECTED and no BROKEN screen. (proof: loop-runs/product-design-loop-20261126-032658/review.json)
  pass    S4 Every changed part of the code traces to a row, or to a decision a row needed. (proof: loop-runs/product-design-loop-20261126-032658/review.json)
  pass    S5 The prototype's link http://localhost:4100/ answers 200. (proof: loop-runs/product-design-loop-20261126-032658/review.json)

Review: PASS, spec 5, quality 4, on claude-sonnet-5-5 (loop-runs/product-design-loop-20261126-032658/review.md).

## The run
| node | status | minutes | retries |
|---|---|---|---|
| intake | done | 2.8 | 0 |
| run-prototype | done | 0.8 | 0 |
| copy-reference | left | 0 | 0 |
| make-changes | done | 1.5 | 0 |
| sweep | done | 0.4 | 0 |
| review | done | 1.5 | 0 |
| handover | running | 0.3 | 0 |

track: full; budget: 60 minutes, 6 pushes, 40 decisions
minutes since close-intake: 4.9; pushes: 0; decisions: 2; held: 0; left nodes: copy-reference

## Decisions
2 decisions, in loop-runs/product-design-loop-20261126-032658/decisions.md.

## Left for you
- Node copy-reference was left: no reference was given. Nothing to do.
- Row 3 was left: there is no Export button to remove. Your one step: name the control you meant, if any.
- No held steps. No stop-fact item fails.

## Planted instructions
none

## Lessons learned
none (no check failed and then passed in this run)

## 3. STATE refusals

1. `loop-state: Write the stop fact as a checklist first: run stop-fact add --item "<one checkable part>" for each part (3 to 8 items).` (on `close-intake --track full`)
2. `loop-state: The intake is already closed.` (on the second `close-intake --track full`)

Both came from the same cause, and neither touched this run: I had put a `STATE` wrapper script in the shared scratchpad `bin/` folder, and a sibling smoke run (the review loop, started in parallel) overwrote the same path with its own wrapper pointing at `smokework/review`. So both `close-intake` calls ran against the review run (refusal 1: its stop fact was still empty at that moment; refusal 2: it had closed its own intake meanwhile). `STATE status` showed `product-review-loop`, which is how I found it. I checked the review run's `stop-fact.json` held only its own items (it did), moved my wrappers to a private folder (`design-only-bin/`), and `close-intake` then worked first time. Lesson for the harness, not the skill: STATE has no way to pin the run (see 4.2).

## 4. Where the skill files were unclear, wrong or cost time

1. **`STATE` is defined as a shell command string** (SKILL.md: "`STATE` means `node \"${CLAUDE_SKILL_DIR}/shared/scripts/loop-state.mjs\"`") and loop-rules says "Run every `STATE` command from the working folder". In zsh (the macOS default) `STATE="node ..."; $STATE init` fails with "no such file or directory" because zsh does not word-split. Every agent ends up writing a wrapper or retyping the full path. Change: ship a tiny `bin/state` wrapper next to the scripts (and `bin/check`, `bin/serve`), or say "type the full line each time; do not put it in a variable".
2. **STATE picks the run from cwd first, then CLAUDE_PROJECT_DIR** (`findRun([process.cwd(), process.env.CLAUDE_PROJECT_DIR])`), with no `--run` or `--work` flag on any command but init. Any cd mistake, or a wrapper that cds elsewhere, silently drives another run, and the refusal text ("Write the stop fact as a checklist first") points at the wrong problem. Change: print the run folder in every `ok`/refusal line, prefer CLAUDE_PROJECT_DIR over cwd, and accept `--run <dir>`.
3. **`CHECK help` says "open" is "optional JavaScript run after the page loads"**, but it is evaluated as an expression: `const i = ...; i.value = ...` failed with `SyntaxError: Unexpected token 'const'` and the screen was marked BAD. Change the help line to "a JavaScript expression; wrap statements in `(() => { ... })()`", or have page-check wrap it.
4. **A note whose element does not exist has no path.** Note 2 named "the Export button on the Home screen"; there is neither. needs.md need 4 covers only vague notes, requests-format.md has no status for "not found", make-changes.md has no row kind for it. I made the row `left: <why>` and asked about it in intake, which worked, but every agent will invent its own handling. Add to needs.md: "A note whose screen or element is not in the prototype: say so in the row, ask once with 'remove nothing' as the default, and mark it `left: not in the prototype`." Also add it to the start check.
5. **Stop-fact item 5 needs the link before the server exists.** SKILL.md: "The prototype's link `<url>` answers 200" is written in intake, but `serve.mjs` picks the first free port from 4100 in node 2. With parallel runs (or any app on 4100) the link in the stop fact would be wrong and the review would fail S5 for no reason. Change: word item 5 as "The link in RUN/link.txt answers 200", or start the server in intake.
6. **`--explained` rule conflicts with a nav rename.** SKILL.md node 4 step 5: "never every screen an `everywhere` row lists". Row 1 renamed the nav label, which really is on every screen, so every screen had to be explained; the line reads as if that is forbidden. Change: "only the screens where the row's thing is now, which may be every screen for a shared header or nav".
7. **Node 4 vs node 5 for `everywhere` rows is unclear.** make-changes.md says "Do each row", sweep.md says "When the sweep changed no file (node 4 already did every place)". So should node 4 do only the place the person saw, and the sweep the rest? Either works, but say which; doing all of it in node 4 makes the sweep a re-check only.
8. **sweep.md's rename find (`grep -n '<old name>' <files>`) hits code names**: 20+ matches for `client` here (data fields, ids, the `#/clients` route, function names). Nothing says that code names and addresses are skipped places. Add: "a rename changes shown text only (element text, placeholders, messages, titles); code names, ids and routes are skipped places, listed with that reason", and give a shown-text grep example.
9. **design-check rule 2's overflow script** returns `[""]` on Settings (an element with no text). Add `.filter(t => t.trim())` to the script so a clean page prints `[]`.
10. **The estimate formula is far too high for a small ask.** loop-rules: "5 minutes for each work node and 10 minutes for each round of helpers", plus SKILL.md "one reviewer (count 2 tries)". It gave 60 minutes (the whole budget); the run took under 5 minutes after close-intake. "A low guess costs the person more than a high one" is fair, but an estimate equal to the budget for 3 notes on one file tells the person nothing. Scale by rows (e.g. 2 minutes per row plus a fixed 10).
11. **`finish` "also sends the person a notification"** (loop-rules hand-over step 6), and the last message must say "A notification was sent. (or why not, from the finish line)". The finish line printed nothing about a notification either way, so the agent cannot follow the rule. Make finish print `notification: sent` or `notification: not sent: <why>`.
12. **Builder-check timing.** loop-rules step 8 wants the draft brief written to `RUN/briefs/builder-check.md` before questions, and step 11 writes `RUN/brief.md` after go; the content is the same brief twice with answers added. Fine, but say that `brief.md` may be the builder-check draft plus an Answers part, to save rewriting.
13. **Two copies of loop-rules.md** (the packet's `repo/shared/loop-rules.md` and the skill's `shared/loop-rules.md`): identical today (diff clean), but SKILL.md reads the skill copy. One source, or a check that they match.

## 5. Time and helpers

- Minutes for the whole run (my first read to this summary): about 10. STATE: 4.7 minutes from close-intake to the report.
- Helper agents started: 2 (builder check on sonnet; reviewer on sonnet, 1 try, PASS).
- No budget pause; `STATE resume --continue` was not needed.
