# Final review of the run

Read /private/tmp/claude-501/-Users-harshalkotti--claude-spares-spare-81Mfoj/44c366c7-da1f-48f6-b2fa-e04f993e0a17/scratchpad/smokework/build/loop-runs/product-build-loop-20261126-032655/brief.md, /private/tmp/claude-501/-Users-harshalkotti--claude-spares-spare-81Mfoj/44c366c7-da1f-48f6-b2fa-e04f993e0a17/scratchpad/smokework/build/loop-runs/product-build-loop-20261126-032655/modules.md, /private/tmp/claude-501/-Users-harshalkotti--claude-spares-spare-81Mfoj/44c366c7-da1f-48f6-b2fa-e04f993e0a17/scratchpad/smokework/build/loop-runs/product-build-loop-20261126-032655/requests.md, /private/tmp/claude-501/-Users-harshalkotti--claude-spares-spare-81Mfoj/44c366c7-da1f-48f6-b2fa-e04f993e0a17/scratchpad/smokework/build/loop-runs/product-build-loop-20261126-032655/links.md and the files in PRODUCT (/private/tmp/claude-501/-Users-harshalkotti--claude-spares-spare-81Mfoj/44c366c7-da1f-48f6-b2fa-e04f993e0a17/scratchpad/smokework/build/order-board/).
Follow `/private/tmp/claude-501/-Users-harshalkotti--claude-spares-spare-81Mfoj/44c366c7-da1f-48f6-b2fa-e04f993e0a17/scratchpad/repo/product-loops/skills/product-build-loop/shared/review-rubric.md`. Read the real files and pages, never the builders' notes about them.
The check command:
`node "/private/tmp/claude-501/-Users-harshalkotti--claude-spares-spare-81Mfoj/44c366c7-da1f-48f6-b2fa-e04f993e0a17/scratchpad/repo/product-loops/skills/product-build-loop/scripts/check-clicks.mjs" /private/tmp/claude-501/-Users-harshalkotti--claude-spares-spare-81Mfoj/44c366c7-da1f-48f6-b2fa-e04f993e0a17/scratchpad/smokework/build/loop-runs/product-build-loop-20261126-032655/links.md --out /private/tmp/claude-501/-Users-harshalkotti--claude-spares-spare-81Mfoj/44c366c7-da1f-48f6-b2fa-e04f993e0a17/scratchpad/smokework/build/loop-runs/product-build-loop-20261126-032655/review-clicks.json --shots /private/tmp/claude-501/-Users-harshalkotti--claude-spares-spare-81Mfoj/44c366c7-da1f-48f6-b2fa-e04f993e0a17/scratchpad/smokework/build/loop-runs/product-build-loop-20261126-032655/shots/review --tools /private/tmp/claude-501/-Users-harshalkotti--claude-spares-spare-81Mfoj/44c366c7-da1f-48f6-b2fa-e04f993e0a17/scratchpad/smokework/build/loop-runs/product-build-loop-20261126-032655/tools`
Run it yourself and open some of the shots. The server is already running at http://127.0.0.1:4400/; do not start another.
You may also drive the page yourself in a headless browser (playwright-core is installed under /private/tmp/claude-501/-Users-harshalkotti--claude-spares-spare-81Mfoj/44c366c7-da1f-48f6-b2fa-e04f993e0a17/scratchpad/smokework/build/loop-runs/product-build-loop-20261126-032655/tools) to check that
an order can be added and marked done; use a fresh browser context so saved data from earlier walks does not mix in.
Also check that every ticked line in requests.md is really in the product.
Write /private/tmp/claude-501/-Users-harshalkotti--claude-spares-spare-81Mfoj/44c366c7-da1f-48f6-b2fa-e04f993e0a17/scratchpad/smokework/build/loop-runs/product-build-loop-20261126-032655/review.json and /private/tmp/claude-501/-Users-harshalkotti--claude-spares-spare-81Mfoj/44c366c7-da1f-48f6-b2fa-e04f993e0a17/scratchpad/smokework/build/loop-runs/product-build-loop-20261126-032655/review.md (PASS or FAIL on the first line, one line per reason). Change no file in PRODUCT.
Never run loop-state.mjs. Nobody will answer questions.

This is a quick-track run by the person's choice: one page, `#/orders`, list state only; no detail, create or empty
routes, no name and mark options, no demo states. Do not count those as missing.

## The stop-fact table

```
ok stop-fact status: 0 of 6 items pass
  not yet S1 Every module in RUN/modules.md is built: Orders.
  not yet S2 Every module's last review round has 0 P1.
  not yet S3 CLICKS passes on every link in RUN/links.md: each opens, no dead click, no placeholder text, no page error.
  not yet S4 RUN/requests.md has no open line.
  not yet S5 A staff member can add an order from the Orders page and see it in the list.
  not yet S6 A staff member can mark an order done and see it change in the list.
```

For S2, the module review rounds are in /private/tmp/claude-501/-Users-harshalkotti--claude-spares-spare-81Mfoj/44c366c7-da1f-48f6-b2fa-e04f993e0a17/scratchpad/smokework/build/loop-runs/product-build-loop-20261126-032655/reviews/ (orders-round1.md, orders-round2.md); check the last round's P1
count and that order-board/index.html was not changed after it was written (compare file times).
In review.json give one `items` entry per stop-fact id (S1 to S6), as the rubric shows.
