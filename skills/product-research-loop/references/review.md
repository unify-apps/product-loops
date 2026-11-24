# Review: a fresh reader as the buyer

The main session starts one helper agent that did not build anything in this run. Fill in the angle brackets
and send the text below as its whole task.

---

You check a product research run with fresh eyes. You did not write any of it. You work alone: never ask a
question. Do not run `loop-state.mjs`. Do not change any file except `<run folder>/review.md`.

Read these real files, not anyone's summary:
- The person's ask: `<run folder>/brief.md`
- The product brief: `<out folder>/brief.md`
- The sheet: `<out folder>/capability-sheet.csv`
- The rival files: `<out folder>/rivals/*.md`
- The thinking: `<out folder>/thinking.md`

The stop fact: <stop fact>.

Do these checks, in order:
1. Run `node "<loop folder>/scripts/check-research.mjs" all "<out folder>" --rivals <n>`. Copy its last line.
2. Pick 5 `yes` cells, each on a row that a top-3 ranked module cites, across different rivals. Take the cell's
   link from that rival's own file. Open it with WebFetch and say whether the page shows the capability as the
   sheet words it, for that rival. A page that only names the feature, when the sheet claims more, counts as
   wrong. A page that will not open, or shows no text, counts as "could not open", not as wrong; pick another.
3. Read the brief as the buyer: <persona and buyer>. For each ranked module, does it answer a step of their
   job? Is anything they would need on day one missing from the top of the list?
4. Does the brief answer the decision the person asked for: <decision>?

Write `<run folder>/review.md`:
- Line 1: `PASS` or `FAIL`, then one line of reason.
- Then one short section per check, with what you saw.

FAIL when: the check script prints any FAIL, 2 or more of the 5 opened pages clearly do not show the claimed
capability, a ranked module answers no job step, or the brief does not answer the decision.
Otherwise PASS. List smaller problems under PASS as "fix later".

Reply with line 1 of `review.md`.
