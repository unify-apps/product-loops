You check one finished run of a design change to a prototype. You did not build it. Read the real files and the
real pages, not the run's own notes about them. Do not edit the prototype. Do not run loop-state.mjs.

- Run folder: /private/tmp/claude-501/-Users-harshalkotti--claude-spares-spare-81Mfoj/44c366c7-da1f-48f6-b2fa-e04f993e0a17/scratchpad/smokework/design/loop-runs/product-design-loop-20261126-032658
- The link: http://localhost:4100/
- The prototype's files: /private/tmp/claude-501/-Users-harshalkotti--claude-spares-spare-81Mfoj/44c366c7-da1f-48f6-b2fa-e04f993e0a17/scratchpad/smokework/design/clinic/index.html. Its copy from before the run: `/private/tmp/claude-501/-Users-harshalkotti--claude-spares-spare-81Mfoj/44c366c7-da1f-48f6-b2fa-e04f993e0a17/scratchpad/smokework/design/loop-runs/product-design-loop-20261126-032658/before/source/`.
- The page tool: `cd "/private/tmp/claude-501/-Users-harshalkotti--claude-spares-spare-81Mfoj/44c366c7-da1f-48f6-b2fa-e04f993e0a17/scratchpad/smokework/design" && node "/private/tmp/claude-501/-Users-harshalkotti--claude-spares-spare-81Mfoj/44c366c7-da1f-48f6-b2fa-e04f993e0a17/scratchpad/repo/product-loops/skills/product-design-loop/scripts/page-check.mjs"`. Its commands: `capture`, `compare`, `click`, `eval` (run `help` for the options).
  To try a form, use one `eval` that sets each field's `value`, clicks the submit button, and returns what changed.
  An "open" step or --js value is evaluated as an expression: wrap statements in `(() => { ... })()`.
- Design rules: no design review skill is installed; use `/private/tmp/claude-501/-Users-harshalkotti--claude-spares-spare-81Mfoj/44c366c7-da1f-48f6-b2fa-e04f993e0a17/scratchpad/repo/product-loops/skills/product-design-loop/references/design-check.md`.
- The rubric: `/private/tmp/claude-501/-Users-harshalkotti--claude-spares-spare-81Mfoj/44c366c7-da1f-48f6-b2fa-e04f993e0a17/scratchpad/repo/product-loops/skills/product-design-loop/shared/review-rubric.md`. Follow it as well: two scores, and `/private/tmp/claude-501/-Users-harshalkotti--claude-spares-spare-81Mfoj/44c366c7-da1f-48f6-b2fa-e04f993e0a17/scratchpad/smokework/design/loop-runs/product-design-loop-20261126-032658/review.json`
  with one item per line of this stop-fact table:

  not yet S1 Every one of the 4 rows in requests.md is done or swept, or left with a reason.
  not yet S2 Every everywhere row's find in sweep.md shows no place left, except places skipped with a reason.
  not yet S3 The final compare has no UNEXPECTED and no BROKEN screen.
  not yet S4 Every changed part of the code traces to a row, or to a decision a row needed.
  not yet S5 The prototype's link http://localhost:4100/ answers 200.

Do these, in order:

1. Read `/private/tmp/claude-501/-Users-harshalkotti--claude-spares-spare-81Mfoj/44c366c7-da1f-48f6-b2fa-e04f993e0a17/scratchpad/smokework/design/loop-runs/product-design-loop-20261126-032658/brief.md`, `/private/tmp/claude-501/-Users-harshalkotti--claude-spares-spare-81Mfoj/44c366c7-da1f-48f6-b2fa-e04f993e0a17/scratchpad/smokework/design/loop-runs/product-design-loop-20261126-032658/requests.md` and `/private/tmp/claude-501/-Users-harshalkotti--claude-spares-spare-81Mfoj/44c366c7-da1f-48f6-b2fa-e04f993e0a17/scratchpad/smokework/design/loop-runs/product-design-loop-20261126-032658/decisions.md`.
2. `curl -s -o /dev/null -w "%{http_code}" http://localhost:4100/` must print 200.
3. Capture every screen fresh: `cd "/private/tmp/claude-501/-Users-harshalkotti--claude-spares-spare-81Mfoj/44c366c7-da1f-48f6-b2fa-e04f993e0a17/scratchpad/smokework/design" && node "/private/tmp/claude-501/-Users-harshalkotti--claude-spares-spare-81Mfoj/44c366c7-da1f-48f6-b2fa-e04f993e0a17/scratchpad/repo/product-loops/skills/product-design-loop/scripts/page-check.mjs" capture --screens /private/tmp/claude-501/-Users-harshalkotti--claude-spares-spare-81Mfoj/44c366c7-da1f-48f6-b2fa-e04f993e0a17/scratchpad/smokework/design/loop-runs/product-design-loop-20261126-032658/screens.json --out /private/tmp/claude-501/-Users-harshalkotti--claude-spares-spare-81Mfoj/44c366c7-da1f-48f6-b2fa-e04f993e0a17/scratchpad/smokework/design/loop-runs/product-design-loop-20261126-032658/final`.
4. Compare: `cd "/private/tmp/claude-501/-Users-harshalkotti--claude-spares-spare-81Mfoj/44c366c7-da1f-48f6-b2fa-e04f993e0a17/scratchpad/smokework/design" && node "/private/tmp/claude-501/-Users-harshalkotti--claude-spares-spare-81Mfoj/44c366c7-da1f-48f6-b2fa-e04f993e0a17/scratchpad/repo/product-loops/skills/product-design-loop/scripts/page-check.mjs" compare --before /private/tmp/claude-501/-Users-harshalkotti--claude-spares-spare-81Mfoj/44c366c7-da1f-48f6-b2fa-e04f993e0a17/scratchpad/smokework/design/loop-runs/product-design-loop-20261126-032658/before --after /private/tmp/claude-501/-Users-harshalkotti--claude-spares-spare-81Mfoj/44c366c7-da1f-48f6-b2fa-e04f993e0a17/scratchpad/smokework/design/loop-runs/product-design-loop-20261126-032658/final --explained today,customers,customers-search-empty,invoices,settings --out /private/tmp/claude-501/-Users-harshalkotti--claude-spares-spare-81Mfoj/44c366c7-da1f-48f6-b2fa-e04f993e0a17/scratchpad/smokework/design/loop-runs/product-design-loop-20261126-032658/compare-final.md`
   (the nav, which row 1 renames, is on every screen). Every UNEXPECTED or BROKEN screen is a FAIL, unless
   `requests.md` lists it under "Broken before the run".
   An "explained" screen is not a pass on its own. For each one, read its "Text added", "Text gone" and
   "Boxes moved or resized" lines. Every difference must trace to a row number (a box that only moved down
   because a row removed a line above it counts). A resized box or a text change that no row explains is a FAIL.
   When the list is cut at 12, look at the before and final screenshots of that screen for the rest.
5. Diff `/private/tmp/claude-501/-Users-harshalkotti--claude-spares-spare-81Mfoj/44c366c7-da1f-48f6-b2fa-e04f993e0a17/scratchpad/smokework/design/loop-runs/product-design-loop-20261126-032658/before/source/index.html` against `/private/tmp/claude-501/-Users-harshalkotti--claude-spares-spare-81Mfoj/44c366c7-da1f-48f6-b2fa-e04f993e0a17/scratchpad/smokework/design/clinic/index.html`. Every changed part of the code must trace to a row,
   or to a choice in `decisions.md` that a row needed. Code no row asked for (extra fallback text, a changed
   format for a case no note named, wiring for a control that was dead before the run) is a FAIL.
6. For each row of `requests.md`: run the row's own check yourself, on `/private/tmp/claude-501/-Users-harshalkotti--claude-spares-spare-81Mfoj/44c366c7-da1f-48f6-b2fa-e04f993e0a17/scratchpad/smokework/design/loop-runs/product-design-loop-20261126-032658/final` or the live page. A row
   marked done whose check fails is a FAIL. For a style row, also list every element the changed selector
   matches; one the row does not name is a FAIL. For a row marked `everywhere`, run its find from `sweep.md` again.
7. There is no `reference-parts.md` in this run (no reference); skip.
8. Open the before and final screenshots of every changed screen, and of every open state in `screens.json`.
   Look for anything a person would call broken: overlapping text, a gap where something was removed, a button
   pushed off screen, a row of fields that wraps.
9. Run the design rules on the changed screens. A P1 in a part this run changed is a FAIL. A control that was
   already dead before the run, and that no row asks to make work, is not a FAIL: say it under Proposals.
   For new styles, read the "New styles" lines of your compare; do not judge them from the CSS source.

Write `/private/tmp/claude-501/-Users-harshalkotti--claude-spares-spare-81Mfoj/44c366c7-da1f-48f6-b2fa-e04f993e0a17/scratchpad/smokework/design/loop-runs/product-design-loop-20261126-032658/review.md`:

```
PASS or FAIL
Link: <code>
Compare: same <n>, explained <n>, UNEXPECTED <list or none>, BROKEN <list or none>, new styles <list or none>
Untraced differences: <screen or file: what, or none>
Rows:
- 1 PASS: <what you ran and saw>
- 2 FAIL: <what you ran and saw>
Design: <P1 findings, or none>
Proposals: <faults you saw that no row names, or none>
Reason: <one line>
```

Then write `/private/tmp/claude-501/-Users-harshalkotti--claude-spares-spare-81Mfoj/44c366c7-da1f-48f6-b2fa-e04f993e0a17/scratchpad/smokework/design/loop-runs/product-design-loop-20261126-032658/review.json` as the rubric says. Writing the two files is your last step. End your turn
right after it: the run waits on you.

The first line is exactly PASS or FAIL. PASS only when the link answers 200, the compare has no UNEXPECTED and no
BROKEN screen, every difference on screen and in the code traces to a row, every row's check passes, and there
is no P1, and the rubric's verdict is PASS.

Also write in review.md which model you ran on.
