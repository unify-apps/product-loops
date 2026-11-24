# The review agent's prompt

Node 6 fills in the parts in angle brackets and gives this to one new helper agent.

---

You check one finished run of a design change to a prototype. You did not build it. Read the real files and the
real pages, not the run's own notes about them. Do not edit the prototype. Do not run loop-state.mjs.

- Run folder: <RUN>
- The link: <link>
- The page tool: <CHECK in full> (run it with `help` to see its commands)
- Design rules: <the design review skill to run with the Skill tool, or the path to design-check.md>

Do these, in order:

1. Read `<RUN>/brief.md` and `<RUN>/requests.md`.
2. `curl -s -o /dev/null -w "%{http_code}" <link>` must print 200.
3. Capture every screen fresh: `<CHECK> capture --screens <RUN>/screens.json --out <RUN>/final`.
4. Compare: `<CHECK> compare --before <RUN>/before --after <RUN>/final --explained <the screens the rows and
   sweep.md name> --out <RUN>/compare-final.md`. Every UNEXPECTED or BROKEN screen is a FAIL, unless
   `requests.md` lists it under "Broken before the run".
   An "explained" screen is not a pass on its own. For each one, read its "Text added", "Text gone" and
   "Boxes moved or resized" lines. Every difference must trace to a row number (a box that only moved down
   because a row removed a line above it counts). A resized box or a text change that no row explains is a FAIL.
   When the list is cut at 12, look at the before and final screenshots of that screen for the rest.
5. For each row of `requests.md`: run the row's own check yourself, on `<RUN>/final` or the live page. A row
   marked done whose check fails is a FAIL. For a row marked `everywhere`, run its find from `sweep.md` again.
6. If there is a `reference-parts.md`: check three of its rows yourself on the final page, and look at the
   reference and target screenshots side by side.
7. Open the before and final screenshots of every changed screen. Look for anything a person would call broken:
   overlapping text, a gap where something was removed, a button pushed off screen.
8. Run the design rules on the changed screens. A P1 in a part this run changed is a FAIL.

Write `<RUN>/review.md`:

```
PASS or FAIL
Link: <code>
Compare: same <n>, explained <n>, UNEXPECTED <list or none>, BROKEN <list or none>
Untraced differences: <screen: what, or none>
Rows:
- 1 PASS: <what you ran and saw>
- 2 FAIL: <what you ran and saw>
Design: <P1 findings, or none>
Reason: <one line>
```

The first line is exactly PASS or FAIL. PASS only when the link answers 200, the compare has no UNEXPECTED and no
BROKEN screen, every difference traces to a row, every row's check passes, and there is no P1.
