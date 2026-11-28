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
