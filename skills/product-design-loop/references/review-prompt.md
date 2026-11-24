# The review agent's prompt

Node 6 fills in the parts in angle brackets and gives this to one new helper agent. On a retry, it also fills
in the "Retry" part at the end.

---

You check one finished run of a design change to a prototype. You did not build it. Read the real files and the
real pages, not the run's own notes about them. Do not edit the prototype. Do not run loop-state.mjs.

- Run folder: <RUN>
- The link: <link>
- The prototype's files: <the files the run changed, full paths>. Their copy from before the run: `<RUN>/before/source/`.
- The page tool: <CHECK in full>. Its commands: `capture`, `compare`, `click`, `eval` (run `help` for the options).
  To try a form, use one `eval` that sets each field's `value`, clicks the submit button, and returns what changed.
- Design rules: <the design review skill to run with the Skill tool, or the path to design-check.md>

Do these, in order:

1. Read `<RUN>/brief.md`, `<RUN>/requests.md` and `<RUN>/decisions.md`.
2. `curl -s -o /dev/null -w "%{http_code}" <link>` must print 200.
3. Capture every screen fresh: `<CHECK> capture --screens <RUN>/screens.json --out <RUN>/final`.
4. Compare: `<CHECK> compare --before <RUN>/before --after <RUN>/final --explained <the screens where a row's
   thing really is> --out <RUN>/compare-final.md`. Every UNEXPECTED or BROKEN screen is a FAIL, unless
   `requests.md` lists it under "Broken before the run".
   An "explained" screen is not a pass on its own. For each one, read its "Text added", "Text gone" and
   "Boxes moved or resized" lines. Every difference must trace to a row number (a box that only moved down
   because a row removed a line above it counts). A resized box or a text change that no row explains is a FAIL.
   When the list is cut at 12, look at the before and final screenshots of that screen for the rest.
5. Diff `<RUN>/before/source/` against the prototype's files. Every changed part of the code must trace to a row,
   or to a choice in `decisions.md` that a row needed. Code no row asked for (extra fallback text, a changed
   format for a case no note named, wiring for a control that was dead before the run) is a FAIL.
6. For each row of `requests.md`: run the row's own check yourself, on `<RUN>/final` or the live page. A row
   marked done whose check fails is a FAIL. For a style row, also list every element the changed selector
   matches; one the row does not name is a FAIL. For a row marked `everywhere`, run its find from `sweep.md` again.
7. If there is a `reference-parts.md`: check three of its rows yourself on the final page, and look at the
   reference and target screenshots side by side. A part of the reference that is on no row is a FAIL.
8. Open the before and final screenshots of every changed screen, and of every open state in `screens.json`.
   Look for anything a person would call broken: overlapping text, a gap where something was removed, a button
   pushed off screen, a row of fields that wraps.
9. Run the design rules on the changed screens. A P1 in a part this run changed is a FAIL. A control that was
   already dead before the run, and that no row asks to make work, is not a FAIL: say it under Proposals.
   For new styles, read the "New styles" lines of your compare; do not judge them from the CSS source.

Write `<RUN>/review.md`:

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

Writing `review.md` is your last step. End your turn right after it: the run waits on you.

The first line is exactly PASS or FAIL. PASS only when the link answers 200, the compare has no UNEXPECTED and no
BROKEN screen, every difference on screen and in the code traces to a row, every row's check passes, and there
is no P1.

## Retry

A review before you said FAIL. Its `review.md` is `<RUN>/review-<try>.md`. What it named and what was fixed:
<the failed items, and the diff of the fix>.

Do every step again in full, on the whole prototype, as if no review had run: a fix can break a row that passed
before. Then check each failed item again yourself, and say in its line that it failed on try <n>. Write
`review.md` in the same shape.
