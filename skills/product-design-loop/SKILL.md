---
name: product-design-loop
description: Changes how existing screens of a prototype look and work, from one set of notes, and runs to the end without asking again. Three ways in - a list of notes or screenshot comments ("rows too tight", "rename this", "this button does nothing"), a redesign of named screens, or copying a screen from a reference (a video, a web page, screenshots, a design file). Use when someone types /product-design-loop, sends design notes or screenshots of a prototype to change, asks to "rework", "restyle", "polish these screens" or "make this screen look like" a reference. Not for building a new product or new modules (the build loop), and not for a review of the whole product (the review loop).
argument-hint: "[your notes, a notes file, or 'make <screen> like <reference>']"
---

# Product design loop

Read `${CLAUDE_SKILL_DIR}/shared/loop-rules.md` first, all of it, and follow it.

In this file:
- `STATE` means `node "${CLAUDE_SKILL_DIR}/shared/scripts/loop-state.mjs"`
- `CHECK` means `node "${CLAUDE_SKILL_DIR}/scripts/page-check.mjs"` (screenshots, page text, clicks; run `CHECK help`)
- `SERVE` means `node "${CLAUDE_SKILL_DIR}/scripts/serve.mjs"` (a local server for plain HTML)
- `RUN` means the run folder that `STATE init` prints. Files named below without a folder live in `RUN`.
- The reference files in `${CLAUDE_SKILL_DIR}/references/` use the same names.

Stop fact: every note in `requests.md` is done and swept, no screen that no note names broke or changed
without a reason (the before and after compare says so), and the prototype's link opens.

The stop-fact items intake writes (`STATE stop-fact add`), with the real numbers and link:
1. Every one of the `<n>` rows in `requests.md` is `done` or `swept`, or `left` with a reason.
2. Every `everywhere` row's find in `sweep.md` shows no place left, except places skipped with a reason.
3. The final compare has no UNEXPECTED and no BROKEN screen.
4. Every changed part of the code traces to a row, or to a decision a row needed.
5. The prototype's link, as `RUN/link.txt` has it, answers 200. (Node 2 writes that file; the port can differ
   from 4100 when 4100 is taken, so the stop fact names the file, not a port.)
6. Only with a reference, on the full track: every part in `reference-parts.md` is on `<target screen>`, or
   left out with why.

The person's own taste comes from their installed skills and the folder's `CLAUDE.md`, never from this file.
Nothing is published, pushed, committed or sent unless the person asked for it in node 1, in words.

## Nodes

1. `intake`: reads every note at once into one numbered request list, asks once, waits for "go".
2. `run-prototype`: finds and runs the prototype, gives the link, takes "before" screenshots of every screen.
3. `copy-reference`: copies the reference into the screen it changes. Left when there is no reference.
4. `make-changes`: makes each change on the list and checks each one.
5. `sweep`: applies every "everywhere" note to every screen.
6. `review`: a fresh agent checks the stop fact and looks for serious design faults on the changed screens.
7. `handover`: writes handover.md and finishes the run.

## Quick track

For a list of notes where the reference is only background. It leaves `copy-reference`
(`STATE left copy-reference --why "quick track"`), and the reference's row in `requests.md` becomes
`left: quick track`. The sweep still runs: a note marked everywhere is only half done without it. With no
reference, the two tracks are the same: do not ask, and init with `--track full`. Recommend full whenever the
person asked to copy the reference.

## Node 1: intake

Run `STATE init --loop product-design-loop --nodes intake,run-prototype,copy-reference,make-changes,sweep,review,handover --skill-dir "${CLAUDE_SKILL_DIR}" --track <quick|full> --budget-minutes 60`,
then follow the intake rules in loop-rules.md.

1. Read `${CLAUDE_SKILL_DIR}/references/needs.md`. It lists every need, its default, and where to look first.
2. Find the prototype, the notes, the reference, the folder's `CLAUDE.md` and the step skills, as needs.md says.
3. Write `requests.md` as `${CLAUDE_SKILL_DIR}/references/requests-format.md` says: one numbered row per
   note. Split a note that asks for two things into two rows. A screenshot note becomes words in its row.
4. Run the start check in needs.md.
5. Estimate: helpers are the builder check, one reviewer (count 2 tries), and one per file group when rows
   live in different files (often none).
6. Ask in ONE message: the short brief (goal, `Found:`, a `Track:` line: quick when there is no reference to
   copy, full when there is one, as the quick track below says; the "still open after reading your files" line;
   `Done means`), the
   request list as one line per row (`R1 settings page: move Save to the top right`), the estimate line, then
   the questions needs.md and the builder check leave open (at most 7; the track is a question only when a
   reference makes both tracks fit), each with `Recommended:` and `Why it matters:`. The full needs table, the
   coverage table and `Lessons applied` go in `brief.md`, not in the message. End with `Reply with your
   answers, or just "go" to use the defaults.`
7. After "go": put the answers into `requests.md`, write the stop-fact items, write `brief.md` (the goal, the
   prototype, every need with its value, the step skills found, the stop fact), run `STATE close-intake`, say
   the one line from loop-rules.md, and go straight on.

A note that arrives after "go" is never a question. Add it as a new row and do it in this run.

## Node 2: run-prototype

1. `STATE start run-prototype`
2. Start the prototype the way the project runs. Reuse a server that is already up.
   - With a `dev` or `start` script: `nohup npm run dev > RUN/server.log 2>&1 &` (so the command returns), then
     read `RUN/server.log` until it shows the local address.
   - Plain HTML: `SERVE start --dir <its folder> --state RUN/server.json`.
3. Write `screens.json` (format in `CHECK help`): every screen a person can reach, from the routes, the nav
   and the links in the code. A screen with no address of its own gets an `open` step. Add the reference as a
   screen named `reference-<name>` when it is a local file or a web page.
4. Copy the prototype's source files to `before/source/`. In a git folder, also write `git rev-parse HEAD` and
   `git status --short` to `before/git.txt`. Never commit, stash or reset.
5. `CHECK capture --screens RUN/screens.json --out RUN/before`. Then `CHECK click` each button or link that a
   row renames, moves or restyles but does not ask to make work. Write a broken screen, and each such control
   that is dead, in `requests.md` under "Broken before the run". Not this run's fault, not its job: never fix it.
6. Check: `curl -s -o /dev/null -w "%{http_code}" <link>` prints 200. Write the link and the code to `link.txt`.
   Tell the person the link in one line.
7. Write the link to `RUN/link.txt` (the stop fact's item 5 reads it). Then
   `STATE done run-prototype --check "link answers 200, before screenshots taken" --proof RUN/before/summary.json`

## Node 3: copy-reference

With no reference: `STATE left copy-reference --why "no reference was given"` and go on. On the quick track:
`STATE left copy-reference --why "quick track"`, mark the reference row `left: quick track`, and go on.

1. `STATE start copy-reference`
2. Follow `${CLAUDE_SKILL_DIR}/references/copy-reference.md`: get the reference as screenshots and text, list
   every part of it in `reference-parts.md`, build it into the target screen in exact or flow-only mode.
   Never edit the reference itself.
3. Check: capture the target screen into `RUN/reference-check/` (with `--only`), and mark each row of
   `reference-parts.md` found, with where. Every row must be found, or say `left out: <why>` with a
   `STATE decide`. A part never listed is a fault. Look at both screenshots side by side.
4. Mark the reference row of `requests.md` done.
5. `STATE done copy-reference --check "every part of the reference is on the screen" --proof RUN/reference-parts.md`

## Node 4: make-changes

1. `STATE start make-changes`
2. Read `${CLAUDE_SKILL_DIR}/references/make-changes.md`: its checks always apply. When a `product-design`
   skill (or the design skill `CLAUDE.md` names) is installed, also load it with the Skill tool; its taste wins.
   When a skill says to propose first or wait, take its recommended option, `STATE decide`, and list the
   rest under Proposals.
3. Do each row of `requests.md` that is still `todo`, in order, as make-changes.md says. After each row, run its
   check and write the command and its real output to `change-checks.md`. Mark the row `done`, or retry it.
   Run `STATE decide` the moment you make a choice, not in a batch at the end.
4. Rows that live in different files may go to helper agents, one per file group. Write each one's brief to
   `RUN/briefs/changes-<group>.md` first: the rows, the files and the checks. Rows in the same file are done one
   after another. Helpers never run `STATE`.
5. `CHECK capture --screens RUN/screens.json --out RUN/after`, then
   `CHECK compare --before RUN/before --after RUN/after --explained <screens> --out RUN/compare-changes.md`.
   `<screens>` are only the screens where a row's thing really is (its text in `before/*.txt`, or its code),
   never every screen only because an `everywhere` row lists them. A shared header or nav that every screen
   shows is the one case where that really is every screen. For each UNEXPECTED screen, read what moved. Fix a leak (scope
   the rule to the screen the note named). Fix every BROKEN screen. Run the compare again.
6. Design check on the changed screens: run the `design-review` skill when installed, else
   `${CLAUDE_SKILL_DIR}/references/design-check.md`. Either way, write `RUN/design-check.md`: one line per
   design-check.md rule, with what you ran and what it found. Fix every P1 in the parts this run changed.
   A larger change it suggests goes under Proposals in `requests.md`, not into the build.
7. Check: every row is `done` or `left` with a reason, `compare-changes.md` ends with UNEXPECTED none and
   BROKEN none, and `design-check.md` has a line for every rule and no open P1.
8. `STATE done make-changes --check "every row checked, compare clean, design check has no P1" --proof RUN/change-checks.md`

## Node 5: sweep

1. `STATE start sweep`
2. Follow `${CLAUDE_SKILL_DIR}/references/sweep.md`: for every row marked `everywhere`, write the rule in one
   line, find every place it fits on every screen and in the code, apply it, and list each place in `sweep.md`.
3. Check: run each rule's find again. It must find no place left, or only places listed as skipped with a
   reason. When the sweep changed a file, capture `after/` again and compare, as sweep.md says.
4. Mark each swept row `swept` in `requests.md`.
5. `STATE done sweep --check "every rule found no place left; compare clean, or no file changed" --proof RUN/sweep.md`

## Node 6: review

1. `STATE start review`
2. Write `RUN/briefs/review.md`: the prompt in `${CLAUDE_SKILL_DIR}/references/review-prompt.md`, with RUN,
   the link, the prototype's changed files, `CHECK` written out in full, the design rules found in node 1, the
   rubric path `${CLAUDE_SKILL_DIR}/shared/review-rubric.md` and the stop-fact table (`STATE stop-fact status`).
   Start one helper agent on it that built nothing in this run, on a different model from the builders when one
   is there. It writes `review.md` and `review.json`. Then `STATE stop-fact pass --from RUN/review.json`.
3. Read `review.md`. If it says FAIL, or an item does not pass: fix what it names, `STATE retry review --why "<what failed>"`, and start
   a new review agent in retry mode: rename `review.md` to `review-<try>.md` and fill in the prompt's Retry
   part. After 3 retries,
   `STATE left review --why "<what still fails>"`.
4. `STATE done review --check "fresh agent says PASS, spec <n>, quality <n>, model <m>" --proof RUN/review.md`

## Node 7: handover

Follow the hand-over rules in loop-rules.md. In `handover.md` also give:
- The link, and the commands that start and stop the server, with the port.
- The request table: each row, its status, and its proof line.
- Per changed screen: the before and after screenshot paths.
- The files changed. Nothing was committed, unless the person asked for it in node 1.
- Broken before the run: each item from `requests.md`, so the person knows the run left it as it was.
- Proposals: larger changes the design check or a step skill suggested, and choices taken on the person's
  behalf that they may want to change.

Leave the server running, so the link opens. A row that is still not done goes under "Left for you".
