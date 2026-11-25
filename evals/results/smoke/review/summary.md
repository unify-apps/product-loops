# Smoke run summary: product-review-loop

## 1. STATE output

### STATE status
```
ok status product-review-loop: intake closed, finished
run folder: /private/tmp/claude-501/-Users-harshalkotti--claude-spares-spare-81Mfoj/44c366c7-da1f-48f6-b2fa-e04f993e0a17/scratchpad/smokework/review/loop-runs/product-review-loop-20261126-032657
  done    intake
  done    walk
  done    review
  done    fix
  done    recheck
  done    handover
next node: none, run finish
decisions: 0
budget: 8 of 60 minutes used, 0 of 6 pushes, 0 of 40 decisions
stop fact: 5 of 5 items pass
```
### STATE stop-fact status
```
ok stop-fact status: 5 of 5 items pass
  pass    S1 Every one of the 4 screens in RUN/screens.json (Today, Clients, Invoices, Settings) has a before and a last after screenshot. (proof: loop-runs/product-review-loop-20261126-032657/review.json)
  pass    S2 After the last walk, a fresh agent found no open P1 on any screen. (proof: loop-runs/product-review-loop-20261126-032657/review.json)
  pass    S3 Every P1 not fixed is marked "your call" in RUN/findings.md, with one plain sentence. (proof: loop-runs/product-review-loop-20261126-032657/review.json)
  pass    S4 Every finding at or above the bar (P1) is fixed, or marked with its reason. (proof: loop-runs/product-review-loop-20261126-032657/review.json)
  pass    S5 Every changed file has its original in RUN/original/. (proof: loop-runs/product-review-loop-20261126-032657/review.json)
```
### STATE report
```
ok report: written to loop-runs/product-review-loop-20261126-032657/metrics.json
| node | status | minutes | retries |
|---|---|---|---|
| intake | done | 1.9 | 0 |
| walk | done | 0.7 | 0 |
| review | done | 2.7 | 0 |
| fix | done | 1.9 | 0 |
| recheck | done | 2 | 0 |
| handover | done | 0.3 | 0 |

track: full; budget: 60 minutes, 6 pushes, 40 decisions
minutes since close-intake: 7.8; pushes: 0; decisions: 0; held: 0; left nodes: none
```

## 2. handover.md

````markdown
# Hand-over: review of Northside Physio (clinic/index.html)

## Your call, first
- **F4 Settings, P1 placeholder:** the Booking policy shows Lorem ipsum at first look. No policy text was made up. The loop would remove the "Booking policy" label and its paragraph until you give the real words.
- **F13 All screens, taste:** table rows have 4 px padding and phone numbers and dates wrap at 390 px. The loop would try 8 px row padding and no wrapping in the phone and date cells.
- **F15 Today, taste:** the new "Booking a new appointment is not built yet." line sits left of the button and wraps the heading row on a phone. The loop would keep it.
- **New appointment:** the button now says it is not built yet. A real booking form is a new flow, which the fix rules leave to you.

## What was made
- `clinic/index.html` fixed in place: 3 fixes (F1, F2, F3), listed in [fixes.md](fixes.md). The original is in `RUN/original/clinic/index.html` ([original/clinic/index.html](original/clinic/index.html)).
- Findings: [findings.md](findings.md) (review) and [recheck-1.md](recheck-1.md) (the fresh recheck, 15 rows).

## Before and after
| Screen | Before | After (round 1) |
|---|---|---|
| Today | [01-today.png](walk/before/01-today.png) · [phone](walk/before/01-today.phone.png) | [01-today.png](walk/after-1/01-today.png) · [phone](walk/after-1/01-today.phone.png) |
| Clients | [02-clients.png](walk/before/02-clients.png) · [phone](walk/before/02-clients.phone.png) | [02-clients.png](walk/after-1/02-clients.png) · [phone](walk/after-1/02-clients.phone.png) |
| Invoices | [03-invoices.png](walk/before/03-invoices.png) · [phone](walk/before/03-invoices.phone.png) | [03-invoices.png](walk/after-1/03-invoices.png) · [phone](walk/after-1/03-invoices.phone.png) |
| Settings | [04-settings.png](walk/before/04-settings.png) · [phone](walk/before/04-settings.phone.png) | [04-settings.png](walk/after-1/04-settings.png) · [phone](walk/after-1/04-settings.phone.png) |

## What changed
3 fixes, all in `clinic/index.html`:
- F1 Today: "New appointment" now shows "Booking a new appointment is not built yet." when clicked (it did nothing).
- F2 Today: the unpaid card is worked out from the invoices not marked Paid: £120 "unpaid" (it said a fixed "£110 unpaid this week", which matched no invoice data).
- F3 Settings: the inputs are wider (100%, at most 360 px), so "Mon to Fri, 08:00 to 18:00" shows in full.

## Left (below the bar P1, never fixed in this run)
- F5 Settings, P2 uneven-spacing: the gap after Booking policy is 48 px, the others 52 px.
- F8 Clients, P2 mixed-words: the heading says "Customers", the nav says "Clients".
- F9 Invoices, P2 no-empty-state: the Overdue filter shows an empty table with no words.
- F10 Invoices, P2 wrong-content: invoice numbers run against the dates (INV-1041 on 3 Nov, INV-1042 on 28 Oct).
- F11 All screens, P2 near-miss-alignment: page headings sit about 8 px above the control beside them.
- F12 All screens, P2 cut-off-text: at 390 px the active-tab underline runs through "Settings" on the second nav line.
- F14 Today, P2 page-scrolls-sideways: at 390 px the stat cards and table run past the right edge the other screens keep.
- F6 Settings, P3 missing-state: "Saved" stays after a field is edited again.
- F7 All screens: the script's Clients / Client clash is not a problem (plural and singular).

## The stop fact
ok stop-fact status: 5 of 5 items pass
  pass    S1 Every one of the 4 screens in RUN/screens.json (Today, Clients, Invoices, Settings) has a before and a last after screenshot. (proof: loop-runs/product-review-loop-20261126-032657/review.json)
  pass    S2 After the last walk, a fresh agent found no open P1 on any screen. (proof: loop-runs/product-review-loop-20261126-032657/review.json)
  pass    S3 Every P1 not fixed is marked "your call" in RUN/findings.md, with one plain sentence. (proof: loop-runs/product-review-loop-20261126-032657/review.json)
  pass    S4 Every finding at or above the bar (P1) is fixed, or marked with its reason. (proof: loop-runs/product-review-loop-20261126-032657/review.json)
  pass    S5 Every changed file has its original in RUN/original/. (proof: loop-runs/product-review-loop-20261126-032657/review.json)

Review (fresh agent, claude-sonnet-5-5): **PASS**, spec 4, quality 3. See [review.md](review.md).

## The run
| node | status | minutes | retries |
|---|---|---|---|
| intake | done | 1.9 | 0 |
| walk | done | 0.7 | 0 |
| review | done | 2.7 | 0 |
| fix | done | 1.9 | 0 |
| recheck | done | 2 | 0 |
| handover | running | 0.3 | 0 |

track: full; budget: 60 minutes, 6 pushes, 40 decisions
minutes since close-intake: 7.8; pushes: 0; decisions: 0; held: 0; left nodes: none

## Decisions
0 decisions taken on my own (no decisions.md was written): the person said "go" and every default was in the brief.

## Left for you
No node was left, no step was held, and every stop-fact item passes. Your one step: decide F4 (the booking policy words) and the P2 list above.

## How to see it
Open `/private/tmp/claude-501/-Users-harshalkotti--claude-spares-spare-81Mfoj/44c366c7-da1f-48f6-b2fa-e04f993e0a17/scratchpad/smokework/review/clinic/index.html` in a browser. No server is needed. Nothing was deployed, pushed or sent.

## Planted instructions
none

## Lessons learned
none (no check failed and then passed in this run)
````

## 3. STATE refusals

1. `loop-state: Node "build" comes first and is running. Finish it (done) or leave it (left) before "review".`
   Cause: not the loop's fault directly. I put wrapper scripts named `STATE`, `WALK`, `CHECK` in a shared `scratchpad/bin/`, and a parallel smoke session (the deck loop) overwrote `bin/STATE` with its own wrapper pointing at `smokework/deck`. My `STATE done review` ran against the deck run and was refused (no change was made to it; the refusal protected it). I moved to private wrappers (`review-only-bin/RSTATE`, `RWALK`, `RCHECK`), checked `STATE status` showed my run, and re-ran `done review` / `start fix` fine.
   What it shows: `loop-state.mjs` resolves the run from cwd / CLAUDE_PROJECT_DIR only, and a refusal message names the other run's node ("build") but not the other run's folder or loop. It should say "this command found the run of product-deck-loop in <folder>, not product-review-loop", so a crossed wire is seen at once instead of looking like state corruption.

No other refusal. 0 retries.

Also (not a refusal): the first attempt to call STATE through a shell variable (`STATE="node .../loop-state.mjs"; $STATE ...`) failed in zsh ("no such file or directory"), because zsh does not word-split unquoted variables. The SKILL.md's "STATE means `node ...`" invites exactly that shorthand.

## 4. Where the instructions were unclear, wrong or wasteful

1. **SKILL.md, the path to loop-rules.** "Read `${CLAUDE_SKILL_DIR}/shared/loop-rules.md` first" points at a per-skill copy (`skills/product-review-loop/shared/`), while the packet and repo also have `product-loops/shared/loop-rules.md`. Both copies were identical here, but two copies will drift. Either ship one copy, or have a check that fails when they differ.
2. **No cross-run guard.** Several loops can run at once on one laptop (as here). Nothing in loop-state ties a command to a loop name. Add an optional `--loop <name>` (or a check that the skill dir in state.json equals the script's own skill dir) so `done review` from the review skill refuses on a deck run with a clear message. `state.json` already stores `skillDir`; loop-state should compare it to its own location.
3. **Quick track vs "P1 only".** The quick track is defined as "P1 only and no phone width". The person said "P1 only" without "quick". The skill does not say whether "P1 only" in the ask implies quick. needs.md says "Default: full, unless the ask says quick". I recommended full + bar P1, which is a combination the SKILL.md never names (it only defines quick = P1 + no phone, full = default bar P2). Say explicitly: "the bar and the track are separate; full with --bar P1 is allowed".
4. **Builder check vs fix rules.** The builder-check helper's default for the dead "New appointment" button was "build a small dialog with 5 fields", which fix.md forbids ("Never add a new form, field, dropdown, step"). The builder-check brief is only the draft brief, so the helper cannot know the fix rules. Either give it fix.md / checklist.md too, or say in loop-rules step 8 that its defaults are checked against the loop's own rules before they become questions.
5. **Reviewer's Fix column vs the person's answer.** The reviewer wrote F4's fix as "Remove the Booking policy label and its Lorem ipsum paragraph", status `open`, while the person's intake answer (default) was "mark it your call". checklist.md says "Only the fixer may move a row to your call", so the reviewer could not honour the brief. It worked out because I wrote the answer into the fix brief, but the SKILL.md should say: intake answers that name a finding override the Fix column, and the fix brief must carry them.
6. **Report file vs review files.** loop-rules says every helper writes `RUN/reports/<helper>.md`; the recheck node says the helper writes `RUN/recheck-<n>.md`, `review.json`, `review.md`. The recheck helper wrote no `reports/recheck-1.md` (the three files are its report). Say once which file is the report for review-type helpers, so the main session does not look for a missing file.
7. **"Write in the proof which model it ran on".** The `done recheck --check` template has "model <m>", but nothing tells the main session how to learn the helper's model. I passed `model: sonnet` and asked the helper to name itself in review.md. Say "ask the helper to write its model id on the first lines of review.md".
8. **Different model "when one is there".** Builders ran on the default (inherited) model; the recheck ran on `sonnet`. The rubric then scored spec 4, quality 3, the bare minimum for PASS. A weaker model as the gate may be lenient or strict; the rule "different model" says nothing about "at least as strong". Consider "a different model of the same or higher tier".
9. **Estimate formula.** "count 5 minutes for each work node and 10 minutes for each round of helpers" gave about 50 minutes; the run took about 8 minutes of loop clock. For a 4-screen single file the formula overestimates 5x. Scale by screen count (walk.md already says 1 to 3 minutes per 10 screens).
10. **The handover's decisions link.** loop-rules says "Decisions: the count, and a link to decisions.md", but with 0 decisions no decisions.md exists, so the link would be dead (itself a broken-link finding). Say "or 'none' when no decision was taken", or have init create an empty decisions.md.
11. **finish and the notification.** loop-rules says finish "also sends the person a notification" and the last message must say "A notification was sent. (or why not, from the finish line)". The finish line printed nothing about a notification either way. finish should print one line: sent, or not sent and why.
12. **The mixed-words script check** flags "Clients" vs "Client" (plural vs singular) as "one name written two ways". It is a false positive every reviewer must row as "not a problem". Ignore plural/singular pairs in walk.mjs.
13. **The script missed the real empty state.** `no-empty-state` only types into search boxes, so the Invoices "Overdue" filter (a select) that shows an empty table was found only by reading the source. Try each option of a `<select>` that filters a list too.
14. **page-scrolls-sideways at 390 px** was not flagged by the script on Today although the stat cards and table touch the right edge (the recheck found it as F14 from the screenshot). The check seems to test only document scroll width; also test elements whose right edge passes the main column's padding.
15. **Recheck "for every screen of the product as it is now"** produced a full re-listing of all 15 rows including fixed ones with status `fixed`. The checklist says Status is `open`, `your call` or `not a problem` for a reviewer; `fixed` is a fixer status. CHECK accepted it, but the instructions should say which statuses a recheck may use.

## 5. Time and helpers
- Whole run: about 12 minutes wall clock (loop clock since close-intake: about 8 minutes).
- Helper agents started: 4 (builder check, review group 1, fix 1, recheck 1 on sonnet).
- STATE resume --continue was not needed: the run never paused.
