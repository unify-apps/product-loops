---
name: product-deck-loop
description: Makes a deck, one-pager, brochure or simple web page for a meeting with a company, end to end. Researches the company, its industry and the people in the meeting with a source link on every fact, writes a story with one idea per slide, builds it, checks every claim and word, and makes an HTML deck, an editable PowerPoint and a PDF. Use when someone asks for "a deck for my meeting with X", "slides for a first meeting", "an outside-in view on a company", "add 3 slides to this deck for X", "a one-pager for a prospect" or "turn this into an editable PowerPoint". Not for research on a product category (the research loop) or for screens of a product (the build loop).
argument-hint: "<the company, the meeting and any start deck> e.g. \"first meeting with the COO of X next week, add to our-deck.pptx, about 10 slides\""
---

# Product deck loop

Read `${CLAUDE_SKILL_DIR}/shared/loop-rules.md` first, all of it, and follow it.

In this file:
- `STATE` means: `node "${CLAUDE_SKILL_DIR}/shared/scripts/loop-state.mjs"`
- `RUN` is the run folder that `STATE status` prints.
- `OUT` is the deck folder from need 9 (default `decks/<company short name>-<yyyymmdd>/` in the working folder).
- `DECK` means: `"<the python path in OUT/tools.json>" "${CLAUDE_SKILL_DIR}/scripts/deck.py"`. Before node 1's
  setup has run, use `python3` in its place. Run `DECK help` once to see every command.

Stop fact: the deck does what the brief's goal says, for its reader and the person they must convince next; every
output asked for is in `OUT/out/` and opens; every slide was drawn and looked at after the last change, and none
is half empty; every line on a slide cites facts that say it, each with a source link, an estimate note or the
person's word; the main slide count is in the asked range; and every review finding is fixed or left for the
person with why.

The stop-fact items intake writes (`STATE stop-fact add`), with the real numbers and names:
1. The deck does what the goal says for `<the reader>`: `<the goal, G1, in one sentence>`.
2. These files are in `OUT/out/` and open: `<the outputs, for example deck.html, deck.pptx, deck.pdf>`.
3. The main slide count is `<the range, for example 8 to 12>`.
4. `DECK check --dir OUT` prints PASS on every check, after the last change.
5. Every line on a slide cites facts that say it, each with a source link, an estimate note or the person's word.
6. Every finding of an earlier review round is fixed, or left with why, in `OUT/review-fixes.md` (none on the
   first round; the findings of the passing round are answered after it, in node 7).
7. Only with a start deck: the slides the person named to keep are kept: `<their numbers>`.

## Nodes

1. `intake`: reads what is given, sets up the tools, asks what the deck is for first, collects every need,
   writes the brief, waits for "go".
2. `research`: helpers find facts on the company, its industry and the people, each with a source link.
3. `story`: one idea per slide, in an order that builds to the goal, written as `OUT/deck.json`.
4. `build`: makes the deck files, draws every slide, looks at each one and fixes the layout.
5. `facts-and-words`: plain words, and a fresh claim checker finds no line its facts do not say.
6. `outputs`: makes the final files, draws and looks again, runs the full check.
7. `review`: a fresh agent reads the deck as its real audience, checks the goal and the stop fact; every finding
   is fixed or left for the person.
8. `handover`: writes handover.md and finishes the run.

## Quick track

For a short deck for an early talk. Outputs are the HTML deck and its PDF only, no PowerPoint, and the main
slide count is 6 to 8. No node is left: research, the claim checker and the review still run, because a wrong
fact in front of a company costs more than the time it saves. Recommend full when the person asked for a
PowerPoint, gave a start deck, or the reader is senior. When the ask names the track, use it and do not ask.

## Step skills and preferences

A node can use a skill the person has installed. Decide from the skill list this session shows, never by
searching the disk. When the list has a skill with exactly that name, run it with the Skill tool and follow its
method and wording. When it does not, follow the built-in reference file. The loop works fully with none.
The node's output file, its format, its check and the rule never to wait for the person win over any step of
that skill.

| Node | Skill, when installed | Built-in |
|---|---|---|
| research | none | `references/research.md` |
| story | none | `references/story.md` |
| build | none | `references/build.md` |
| facts-and-words | `write-factual-content` | `references/writing.md` |
| review | none | `references/review.md` |

Preferences come from the person, never from this file: the working folder's `CLAUDE.md`, their installed skills,
the start deck's look, and their node 1 answers. The loop's own defaults are neutral.

## Node 1: intake

Run `STATE init --loop product-deck-loop --nodes intake,research,story,build,facts-and-words,outputs,review,handover --skill-dir "${CLAUDE_SKILL_DIR}" --track <quick|full> --budget-minutes 90`,
then follow the intake rules. Read `${CLAUDE_SKILL_DIR}/references/needs.md`: it lists every need, its default and
where to look before asking.

1. Read the ask, every file it names, and the working folder's `CLAUDE.md`. List every file in the folder and in
   any folder the ask names. Read each text file that may say what we offer or may claim, or what is known about
   the company or the meeting (claims, notes, transcripts). Note the deck files (`.pptx`, `.pdf`, `.key`).
2. Start check, in this order. Say in the question message what failed and what it costs.
   - `mkdir -p OUT && python3 "${CLAUDE_SKILL_DIR}/scripts/deck.py" setup --dir OUT`. It makes the Python tools
     (python-pptx, pymupdf, about 1 minute the first time) and finds Chrome and Quick Look. If it fails, the
     PowerPoint and PDF cannot be made: say so. On a Mac with no developer tools, `python3` opens an install
     window instead of running: then nothing can be made until the person installs them
     (`xcode-select --install`) or Python from python.org.
   - A start deck: `DECK read-start <file> --out OUT/start`, then read `OUT/start/slides.md` and look at 2 or 3
     of `OUT/start/renders/`. A slide marked "text sits in a picture" is read from its picture, never guessed.
     A `.key` file cannot be read: ask for a PowerPoint or PDF export of it.
   - Web search: say whether the WebSearch and WebFetch tools are in this session. Without them, research uses
     only the given files.
3. Fill every need you can from the files. Ask the rest in one message, each with its default, as the intake
   rules say. Unless the ask states what the deck is for, question 1 is the goal (G1 in `needs.md`), with 3 to 5
   options written for this company and reader; the angle (G2) and who the reader must convince next (G3) come
   right after. Ask about the company only when the ask does not name it. The track is one of the questions
   when the ask does not name it: quick (HTML and PDF, 6 to 8 slides) or full. At most 7 questions in all, each
   with `Recommended:` and `Why it matters:`. Estimate: helpers are up to 3 for research, one claim checker per
   round (count 2 to 3 rounds, one helper each), one reviewer and the builder check.
4. On "go": write the stop-fact items, then `RUN/brief.md`. It starts with the goal, the angle and the real
   audience, then every other need and its value, the stop fact with the real numbers (for example "8 to 12 main
   slides"), and the reader. Then `STATE close-intake`. On the quick track, `deck.json` lists the outputs
   `html` and `pdf` only, and `slide_count` is 6 to 8.

## Node 2: research

1. `STATE start research`. Follow `references/research.md`.
2. Write `RUN/briefs/research-<part>.md` for each part from `references/research.md`, with the web guard in it.
   Then start up to 3 helper agents on them in one message, not in the background: the company, its industry,
   the people. Each writes its facts to `OUT/research/<part>.md`, in the line shape of `references/research.md`.
3. Write `OUT/research/person.md`: the person's facts and every line of what we may claim. Then
   `DECK merge-facts --dir OUT` writes `OUT/facts.json`. Without web tools, use only the given files and the
   person's facts, and write that down with `STATE decide`.
4. Check: `DECK merge-facts --dir OUT` prints PASS, and the 3 links in `OUT/research/spot-check.md` match.
5. `STATE done research --check "every fact has a link, a how or the person's word" --proof OUT/facts-check.md`

## Node 3: story

1. `STATE start story`. Follow `references/story.md`: the order comes from the brief's goal, then the meeting.
2. Write `OUT/story.md`: one line per slide (its title as a claim, then the one idea), main slides first, then
   the appendix. Then write `OUT/deck.json` (format in `references/build.md`) with the text of every slide, the
   facts each line cites, `slide_count` from the brief, the outputs, the format and the brand.
3. Check: `DECK check --dir OUT --only count,figures` prints PASS.
4. `STATE done story --check "count in range, every figure cited" --proof OUT/check-count-figures.md`

## Node 4: build

1. `STATE start build`. Follow `references/build.md`.
2. `DECK make --dir OUT`, then `DECK render --dir OUT`. `make` names every box whose text does not fit.
3. Look at every slide picture in `OUT/renders/pptx/` (or `OUT/renders/html/` when no PowerPoint is made) with
   the Read tool, one by one, then the sheets `render` made, to compare slides side by side. Fix what is wrong in
   `deck.json`, then make and render again.
4. Write `OUT/looked.md` after the last render: one line per slide, `slide N: <what you saw>`.
5. Check: `DECK check --dir OUT --only fit,body,looked` prints PASS. A `body` failure is fixed now, with
   substance (what the numbers mean, a reason, an example, each with its facts) or by merging thin slides. That
   fix is this node's own work, not a `STATE retry`; note it for the hand-over's lessons.
6. `STATE done build --check "every slide drawn, looked at, filled, text fits" --proof OUT/check-fit-body-looked.md`

## Node 5: facts-and-words

1. `STATE start facts-and-words`. Run the `write-factual-content` skill on every slide's text when it is
   installed; else follow `references/writing.md`.
2. `DECK claims --dir OUT`, then read `OUT/claims.md` yourself, row by row, against the checker's list in
   `references/writing.md`. Change only words in `deck.json`, never the facts. A claim with no fact behind it is
   cut, narrowed, or turned into a question for the meeting. Write each change in `OUT/words.md`.
3. The claim checker, as `references/writing.md` says: `DECK claims --dir OUT`, then one fresh text-only helper
   reads `OUT/claims.md` and writes `OUT/claims-verdict.md`. On FAIL, use its new text for each named row (or cut
   the row), run `DECK claims` and a new helper. Up to 5 rounds are the node's own work, not retries.
4. Check: `DECK check --dir OUT --only figures,claims` prints PASS, and `words.md` exists. Node 6 draws again.
5. `STATE done facts-and-words --check "every line cites facts that say it" --proof OUT/check-figures-claims.md`

## Node 6: outputs

1. `STATE start outputs`. Follow `references/outputs.md`.
2. `DECK make --dir OUT`, `DECK render --dir OUT`, look at every slide again, and write `OUT/looked.md` anew. A word changed here needs `DECK claims` and a new claim checker.
3. `DECK check --dir OUT` must print PASS on all 7 checks. Fix and repeat, as the retry rule says.
4. An Artifact only when node 1's answer asked for one, and only when the Artifact tool is in this session.
   Otherwise write why in `OUT/outputs.md`. Never publish or send anything else anywhere.
5. `STATE done outputs --check "deck check PASS on all 7" --proof OUT/check.md`

## Node 7: review

1. `STATE start review`
2. Write `RUN/briefs/review.md` from `references/review.md`, with the stop-fact table (`STATE stop-fact status`)
   and the rubric path `${CLAUDE_SKILL_DIR}/shared/review-rubric.md`. Start one helper agent on it, not in the
   background, on a different model from the builders when one is there. It reads the deck as the real audience
   in the brief and checks the goal first. It writes `RUN/review.md` and `RUN/review.json`. Then run
   `STATE stop-fact pass --from RUN/review.json`.
3. Answer every finding in `OUT/review-fixes.md`, fixed or left, as `references/review.md` says. Never drop one.
   After fixes: `DECK claims` and a new claim checker, make, render, look, check.
4. If it said FAIL, an item did not pass, or a fix added, cut or reordered slides: `STATE retry review --why "..."` and run a new helper.
   After 3 retries, `STATE left review --why "..."`.
5. Check: `DECK findings --dir OUT --review RUN/review.md` prints PASS, and the last helper said PASS.
6. `STATE done review --check "fresh agent says PASS as the real audience, spec <n>, quality <n>, model <m>; every finding fixed or left" --proof RUN/review.md`

## Node 8: handover

Follow the hand-over rules in loop-rules.md. In `handover.md` also give: the full path of each file in `OUT/out/`
(the person opens these), the goal and how the deck meets it, the slide count, how many facts are public,
estimates or the person's own, the estimates the person should check before the meeting, and the review's
findings. Every finding marked left in `OUT/review-fixes.md` goes under "Left for you", with why and the one step.
