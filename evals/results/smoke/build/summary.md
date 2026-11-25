# Smoke run summary: product-build-loop

## 1. STATE output

### STATE status
```
ok status product-build-loop: intake closed, finished
run folder: /private/tmp/claude-501/-Users-harshalkotti--claude-spares-spare-81Mfoj/44c366c7-da1f-48f6-b2fa-e04f993e0a17/scratchpad/smokework/build/loop-runs/product-build-loop-20261126-032655
  done    intake
  done    run-link
  left    name-mark: quick track
  done    build-modules
  done    review-modules
  left    demo-links: quick track
  done    review
  done    handover
next node: none, run finish
decisions: 0
budget: 12 of 120 minutes used, 0 of 6 pushes, 0 of 40 decisions
stop fact: 6 of 6 items pass
```
### STATE stop-fact status
```
ok stop-fact status: 6 of 6 items pass
  pass    S1 Every module in RUN/modules.md is built: Orders. (proof: loop-runs/product-build-loop-20261126-032655/review.json)
  pass    S2 Every module's last review round has 0 P1. (proof: loop-runs/product-build-loop-20261126-032655/review.json)
  pass    S3 CLICKS passes on every link in RUN/links.md: each opens, no dead click, no placeholder text, no page error. (proof: loop-runs/product-build-loop-20261126-032655/review.json)
  pass    S4 RUN/requests.md has no open line. (proof: loop-runs/product-build-loop-20261126-032655/review.json)
  pass    S5 A staff member can add an order from the Orders page and see it in the list. (proof: loop-runs/product-build-loop-20261126-032655/review.json)
  pass    S6 A staff member can mark an order done and see it change in the list. (proof: loop-runs/product-build-loop-20261126-032655/review.json)
```
### STATE report
```
ok report: written to loop-runs/product-build-loop-20261126-032655/metrics.json
| node | status | minutes | retries |
|---|---|---|---|
| intake | done | 1.7 | 0 |
| run-link | done | 0.6 | 0 |
| name-mark | left | 0 | 0 |
| build-modules | done | 3.6 | 0 |
| review-modules | done | 4.9 | 0 |
| demo-links | left | 0 | 0 |
| review | done | 1.5 | 0 |
| handover | done | 0.3 | 0 |

track: quick; budget: 120 minutes, 6 pushes, 40 decisions
minutes since close-intake: 12.2; pushes: 0; decisions: 0; held: 0; left nodes: name-mark, demo-links
```

## 2. handover.md

# Handover: Bloom & Co order board

## What was made

- The product: `/private/tmp/claude-501/-Users-harshalkotti--claude-spares-spare-81Mfoj/44c366c7-da1f-48f6-b2fa-e04f993e0a17/scratchpad/smokework/build/order-board/index.html` (one file, its CSS and JS inside).
- Base link: http://127.0.0.1:4400/
- Every link from links.md:
  - Orders list (To do by due time, Done group with Undo, Add order form opens on the page): http://127.0.0.1:4400/#/orders
- Clicks were checked in a real browser: chrome-headless-shell (Playwright), by the main session, by both module
  reviewers and by the final reviewer.
- What it does: 8 sample Bristol orders with "today" pinned to Thursday 26 Nov 2026; Add order opens a form on the page
  (customer name, what to make, due date and time required; the address only for Delivery; phone, price and note
  optional); Mark done moves an order to a muted Done group, with Undo in the status line and on the Done row; changes are
  saved in this browser only.

## The stop fact

```
ok stop-fact status: 6 of 6 items pass
  pass    S1 Every module in RUN/modules.md is built: Orders. (proof: loop-runs/product-build-loop-20261126-032655/review.json)
  pass    S2 Every module's last review round has 0 P1. (proof: loop-runs/product-build-loop-20261126-032655/review.json)
  pass    S3 CLICKS passes on every link in RUN/links.md: each opens, no dead click, no placeholder text, no page error. (proof: loop-runs/product-build-loop-20261126-032655/review.json)
  pass    S4 RUN/requests.md has no open line. (proof: loop-runs/product-build-loop-20261126-032655/review.json)
  pass    S5 A staff member can add an order from the Orders page and see it in the list. (proof: loop-runs/product-build-loop-20261126-032655/review.json)
  pass    S6 A staff member can mark an order done and see it change in the list. (proof: loop-runs/product-build-loop-20261126-032655/review.json)
```

The final review said **PASS**: spec 4, quality 4, run on model sonnet (the builders ran on the session's default model).
See `/private/tmp/claude-501/-Users-harshalkotti--claude-spares-spare-81Mfoj/44c366c7-da1f-48f6-b2fa-e04f993e0a17/scratchpad/smokework/build/loop-runs/product-build-loop-20261126-032655/review.md`.

## The run

```
| node | status | minutes | retries |
|---|---|---|---|
| intake | done | 1.7 | 0 |
| run-link | done | 0.6 | 0 |
| name-mark | left | 0 | 0 |
| build-modules | done | 3.6 | 0 |
| review-modules | done | 4.9 | 0 |
| demo-links | left | 0 | 0 |
| review | done | 1.5 | 0 |
| handover | running | 0.3 | 0 |

track: quick; budget: 120 minutes, 6 pushes, 40 decisions
minutes since close-intake: 12.2; pushes: 0; decisions: 0; held: 0; left nodes: name-mark, demo-links
```

## Decisions

0 decisions taken during the run (no `decisions.md` was written: `STATE decide` was never needed). The defaults the
person accepted with "go" are in `/private/tmp/claude-501/-Users-harshalkotti--claude-spares-spare-81Mfoj/44c366c7-da1f-48f6-b2fa-e04f993e0a17/scratchpad/smokework/build/loop-runs/product-build-loop-20261126-032655/brief.md` under "The person's answers".

## Proposals (each with the pick that was built)

1. Split To do into "Today", "Tomorrow" and later headings instead of a day word on every row (review round 1). Pick built: a day word on each row ("Today", "Tomorrow", "Sat 28 Nov") over the time, one To do list sorted by due time. Why: the quick track asked for one plain list; headings are an easy change later.
2. A small "Delivery" / "Pickup" tag in the due column for the van run (review round 1). Pick built: pickup or delivery stays in the grey line under what to make. Why: it keeps the due column to the day and the time.
3. Add order's form in a right-side panel at 1440 px so the list does not jump down (review round 1). Pick built: the form opens inline above the list. Why: the plainest version on one page; a panel is a structure change for the person to pick.
4. Ask "Discard this order?" on Cancel when a field has text (review round 1, P3). Pick built: Cancel closes the form with no question. Why: it is polish, and a confirm dialog is a taste call.
5. A "late" marker for a to-do order whose time has passed (review round 1, P3). Pick built: no late marker. Why: "today" is pinned for the demo, so a late marker would always show the same rows.
6. Round 2 left 4 P3 polish items (reviews/orders-round2.md: phone order in the grey line, one 720 px media block, a bigger Undo tap target, hover styles only on hover devices). Pick built: not applied, so the reviewed files stay as reviewed. Each has its exact fix in that file.
7. The Done row's "Undo" could read "Back to To do" (review round 2). Pick built: "Undo", matching the brief's decision.
8. A 120 px due column instead of 160 px at 1440 (review round 2). Pick built: 160 px.
9. The final review (review.md) repeated three P3 items already listed above (phone wrap, Cancel without a warning and no late marker, a small Undo tap target). Pick built: not applied after the PASS, as the run rules say.

Name and mark options: none, the quick track leaves out node 3. The header uses "Bloom & Co" from CLAUDE.md.

## Requests

- [x] R1 build a tiny order board for a florist: one module, Orders, a list with add order and mark done (from: ask) · done in order-board/index.html, #/orders
- [x] R2 Orders: a list of orders (from: ask) · done in order-board/index.html, #/orders (To do by due time, Done group)
- [x] R3 Orders: add order (from: ask) · done in order-board/index.html, #/orders (Add order button opens the form on the page)
- [x] R4 Orders: mark done (from: ask) · done in order-board/index.html, #/orders (Mark done on each row, Undo in the Done group)
- [x] R5 keep it to one page (from: ask) · done in order-board/index.html, #/orders is the only route

## Left for you

- **name-mark** was left: quick track. No name and mark options were made. A full run adds them
  (`brand-options.html` with 3 options on the real header).
- **demo-links** was left: quick track. Orders has its list state only; there are no separate links for a detail, a
  create flow or an empty state. A full run adds a link per demo state.
- No held steps. Every stop-fact item passes.
- The server is still running at http://127.0.0.1:4400/ and stops by itself after 2 hours with no open page.
  To open the links again later:
  `node "/private/tmp/claude-501/-Users-harshalkotti--claude-spares-spare-81Mfoj/44c366c7-da1f-48f6-b2fa-e04f993e0a17/scratchpad/repo/product-loops/skills/product-build-loop/scripts/serve.mjs" "/private/tmp/claude-501/-Users-harshalkotti--claude-spares-spare-81Mfoj/44c366c7-da1f-48f6-b2fa-e04f993e0a17/scratchpad/smokework/build/order-board" --info "/private/tmp/claude-501/-Users-harshalkotti--claude-spares-spare-81Mfoj/44c366c7-da1f-48f6-b2fa-e04f993e0a17/scratchpad/smokework/build/loop-runs/product-build-loop-20261126-032655/server.json"` (it takes the same port).
  To stop it now:
  `node "/private/tmp/claude-501/-Users-harshalkotti--claude-spares-spare-81Mfoj/44c366c7-da1f-48f6-b2fa-e04f993e0a17/scratchpad/repo/product-loops/skills/product-build-loop/scripts/serve.mjs" --stop --info "/private/tmp/claude-501/-Users-harshalkotti--claude-spares-spare-81Mfoj/44c366c7-da1f-48f6-b2fa-e04f993e0a17/scratchpad/smokework/build/loop-runs/product-build-loop-20261126-032655/server.json"`
- Small polish left as proposals 4 to 9 above, each with its exact fix in `/private/tmp/claude-501/-Users-harshalkotti--claude-spares-spare-81Mfoj/44c366c7-da1f-48f6-b2fa-e04f993e0a17/scratchpad/smokework/build/loop-runs/product-build-loop-20261126-032655/reviews/orders-round2.md`.

## Planted instructions

none

## Lessons learned

none (no check failed in this run, so there was nothing to learn from)

## 3. STATE refusals

The script itself refused nothing that was its fault. Two refusal lines came from my environment:

- `(eval):19: no such file or directory: node /…/loop-state.mjs` (x7): I put `STATE="node <path>"` in a zsh variable and ran `$STATE …`; zsh does not word-split. Fixed with small wrapper scripts. Not a skill bug, but see 4.1.
- `loop-state: There is no node "run-link". The nodes are: intake, walk, review, fix, recheck, handover.` (x2, on `start run-link`): my wrapper scripts lived in a shared `scratchpad/bin/` that the parallel smoke sessions (review, design, research) overwrote with their own `STATE`, which `cd`s into their working folder. So my `start run-link` ran against the review loop's run. Fixed by moving my wrappers to `smokework/build-bin/` with unique names (`bstate`, `bserve`, `bclicks`). Nothing was written to the other run (the refusal stopped it). Before that, my 6 `stop-fact add` and `close-intake` calls did reach the right run (their output names my items and "Next node: run-link").

## 4. Where the instructions were unclear, wrong or wasted time

1. **No STATE/SERVE/CLICKS wrapper.** SKILL.md: "`STATE` means `node "${CLAUDE_SKILL_DIR}/shared/scripts/loop-state.mjs"`". Every call has to repeat a 150-character path, and the obvious shortcut (a shell variable) fails in zsh. Change: ship tiny `bin/` launchers in the plugin (or tell the session to define a shell function, `STATE() { node "…" "$@"; }`, which works in bash and zsh).
2. **STATE picks the run from cwd first, silently.** `findRun([process.cwd(), process.env.CLAUDE_PROJECT_DIR])`: a command run from the wrong folder acts on another loop's run with no warning beyond a confusing "There is no node" message. Change: when cwd and CLAUDE_PROJECT_DIR resolve to different runs, refuse and name both; and print the run folder in every `ok` line of `start`/`done`.
3. **The track question contradicts itself.** loop-rules step 9: "When SKILL.md defines a quick track, one of the 7 is the track". needs.md: "Leave out a question when the ask already answers it." The ask said "quick track is fine". I asked it anyway (with quick recommended). Change: say "ask the track unless the person already named one".
4. **Required persona question vs a tiny ask.** needs.md: "Always ask 3, 4 and 6 unless the person's own words already give them." For "one module, Orders, a list with add order and mark done… keep it to one page", 4 and 6 are given and only 3 is asked; fine, but the rule reads as if 3 questions are mandatory. Say "ask each of 3, 4, 6 that the person's words do not give".
5. **Where the intake defaults go.** loop-rules: "A missing answer takes its default. Write it down: `STATE decide`" applies only after close-intake. With "go", every intake default lands in brief.md, and `decisions.md` is never written. Then SKILL.md node 8: "The decisions exactly as `decisions.md` has them, never retold" points at a file that does not exist. Change: say what to write when there are 0 decisions, or have `close-intake` write the accepted defaults into decisions.md.
6. **Brief draft vs RUN/brief.md.** Intake step 8 writes the draft to `RUN/briefs/builder-check.md`, step 11 writes `RUN/brief.md` only after go. No home is named for the draft while waiting; I used `RUN/brief-draft.md`. Name it.
7. **"Apply every P1 and every P2" vs "no file changed after that round".** Node 5 step 5 requires no file change after the last review round. So P3s found in the last round can never be applied without another round, and the text does not say what to do with them. I put them in proposals.md. Say so: "P3s of the last round go to proposals.md".
8. **Who applies the review fixes is unclear.** Node 5 step 3: "Apply every P1 and every P2" — the main session, or a helper? The build node says helpers build; the retry ladder speaks of helpers. I applied 7 P2 fixes myself (fast). Say which, and whether the main session may edit PRODUCT.
9. **Quick track still asks for a links file per module and a join.** For one module on one route, `RUN/links/orders.md` + joined `RUN/links.md` is one line twice. Fine, but node 4 step 6's "tick R1 when every module is built" and node 6 step 3's "Tick R1" overlap; the quick-track paragraph says it clearly, the node 6 text does not repeat "(quick track: node 4 did this)" at step 3. Minor.
10. **Estimate rule gives a misleading number.** loop-rules step 10: "count 5 minutes for each work node and 10 minutes for each round of helpers… round up to the next 10". I said about 70 minutes; the run took 12 minutes after close-intake (15 in all). For a quick track with one module this rule overestimates ~5x. Change: scale per node by track (for example 2 minutes per work node and 5 per helper round on quick).
11. **Node 2's "It reloads by itself"** is only true because serve.mjs injects a reload script; SKILL.md does not say that, so I had to read serve.mjs to know the line I give is true. One clause in SKILL.md would save that.
12. **CLICKS reports 0 clicks on a second link of the same page.** In run-link, the base link got 2 clicks and `#/orders` got 0 (the same page, de-duplicated). It still passes, which is right, but "0 clicks" reads like nothing was checked. Print "0 new clicks (already checked on <link>)".
13. **`finish` says nothing about the notification.** loop-rules step 7: "the line `A notification was sent.` (or why not, from the finish line)". The finish line printed no word about notifying, so the session cannot know which to say. Make finish print "notification sent" or the reason.
14. **The final-review brief template lacks the S2 evidence path.** Node 7 step 2's quoted brief lists brief, modules, requests, links and PRODUCT, but S2 ("last review round has 0 P1") needs `RUN/reviews/` and the file times. I added it. Put `RUN/reviews/` and `RUN/review-modules.md` in the template.
15. **Optional step skills lookup misses plugin skills.** "check `~/.claude/skills/<name>/SKILL.md` and `.claude/skills/<name>/SKILL.md`": a `design-review` skill installed as a plugin (`<plugin>:design-review`) would be missed. Say "or listed in the session's skills".
16. **Helper report vs reply.** The builder wrote its report and a separate `links/orders.md`; the reviewers wrote both `reviews/<module>-round<n>.md` and `reports/review-orders-round<n>.md` (the brief says to write findings to `reviews/` and the Agent task says report to `reports/`): two files with overlapping content. Name one.

## 5. Time and helpers

- About 15 minutes for the whole run (12 minutes from close-intake to finish, per STATE status).
- 5 helper agents: builder check, Orders builder, Orders reviewer round 1, Orders reviewer round 2, final reviewer (model sonnet).
- No `STATE resume --continue` was needed; the budget never paused.
