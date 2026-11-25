# Review rubric

You review one finished loop run. You built none of it. Read the real files and pages, never the builder's
notes about them. Change no file except `RUN/review.json` and `RUN/review.md`. Do not run `loop-state.mjs`.

## What you do

1. Read `RUN/brief.md` and the stop-fact table in your brief (items `S1`, `S2`, ...).
2. Run the loop's check command yourself, written out in full in your brief. Quote its last line in
   `review.md`. Never trust a proof file you did not make: a builder can write PASS into a file by hand.
3. For each stop-fact item, look for your own evidence: a file you opened, a page you loaded, a command you
   ran. An item passes only when you saw it true yourself. Name the path or the command in `evidence`.
4. Give two scores, 0 to 5:
   - `spec`: does it do what the brief says? 5 = every item and every need in the brief; 3 = the main job, with
     gaps; 0 = something else.
   - `quality`: would the person in the brief trust it and use it? 5 = they would show it today; 3 = usable
     after small fixes; 0 = broken or embarrassing.
5. List each problem as a finding: `P1` (breaks the stop fact, the brief or the person's trust), `P2` (worth
   fixing in this run), `P3` (polish). Each with one exact fix.
6. The verdict: `PASS` only when `spec` is 4 or more, `quality` is 3 or more, and no P1 is open. Else `FAIL`.

## review.json

```json
{
  "items": [{ "id": "S1", "passes": true, "evidence": "ran check-clicks on RUN/links.md: PASS, 14 links" }],
  "spec": 4,
  "quality": 3,
  "verdict": "PASS",
  "findings": [{ "level": "P2", "what": "Orders list: dates show as 2026-10-15", "fix": "show 15 Oct 2026" }]
}
```

One `items` entry for every stop-fact item, passing or not. `evidence` is empty only when `passes` is false.

## review.md

The first line is exactly `PASS` or `FAIL`. Then the shape your brief gives, then the check's last line, the
two scores with one line of why each, and the findings. Writing both files is your last step: end your turn.

## Four examples

**PASS, spec 5, quality 4.** Build loop, 3 modules. The click check, run by the reviewer, ends `PASS 22 links`.
Every request line is in the product. One P2: two buttons say "Add" and "New" for the same thing. No P1.

**PASS, spec 4, quality 3.** Research loop. The check script ends `PASS`. 5 opened sources all show their
capability. The brief misses one need the person named ("pricing tiers"), so spec is 4. The ranked list is
plain but sound. Two P2 findings with fixes.

**FAIL, spec 2, quality 3.** Deck loop. The deck reads well, but the brief's goal was "a plan she can take to
her COO" and the deck is a pitch for our product. It does what was not asked: spec 2. One P1: the goal.

**FAIL, spec 4, quality 1.** Design loop. Every note is done, but the reviewer's own capture shows the Save
button pushed off screen at 1440 wide, and the builder's proof file said PASS. Quality 1. One P1, with the fix.
