---
name: product-review-loop
description: Reviews a whole clickable product prototype screen by screen, as the person who will use it, fixes what it finds, and reviews again until no P1 problem is left. It clicks every button, takes a screenshot of every screen, and checks for dead clicks, console errors, cut-off text, placeholder text, broken images, missing empty and loading states, alignment and spacing slips, mixed words across screens, and pages that scroll sideways on a phone. Taste calls are listed for the person, never changed. Use when someone types /product-review-loop, or asks to review, audit, QA, polish or "check everything" in a prototype, mock-up or demo app before showing it, or asks "what is wrong with my prototype" about the whole product rather than one screen.
argument-hint: "[path or URL of the prototype] [what to focus on]"
---

# Product review loop

Read `${CLAUDE_SKILL_DIR}/shared/loop-rules.md` first, all of it, and follow it.

In this file:
- `STATE` means `node "${CLAUDE_SKILL_DIR}/shared/scripts/loop-state.mjs"`
- `WALK` means `node "${CLAUDE_SKILL_DIR}/scripts/walk.mjs"`
- `CHECK` means `node "${CLAUDE_SKILL_DIR}/scripts/check-findings.mjs"`
- `RUN` means the run folder that `STATE status` prints.

The person's ask: $ARGUMENTS

Stop fact, fix mode: after the last walk, a fresh agent found no open P1 on any screen, and every P2 is fixed or
listed in `handover.md`. Report-only mode: every screen has a screenshot and a reviewed list of findings, each with
a screen, a rule and a level, and a fresh agent confirmed the list against the screenshots.

This loop works on the person's laptop only. It never deploys, publishes or sends anything, even when the
prototype has a deploy script, unless the person's intake answer asks for it in words.

## Nodes

1. `intake`: collects the needs, writes the brief, waits for "go".
2. `walk`: opens the prototype, takes a screenshot of every screen and runs the script checks.
3. `review`: helper agents that did not build it review every screen against the checklist.
4. `fix`: a helper fixes each finding at or above the bar, or marks it as the person's call.
5. `recheck`: walks again; a fresh agent checks that no P1 is left. At most 3 rounds.
6. `handover`: writes handover.md with before and after screenshots, and finishes the run.

## Node 1: intake

Run `STATE init --loop product-review-loop --nodes intake,walk,review,fix,recheck,handover`, then follow the
intake rules. Read `${CLAUDE_SKILL_DIR}/references/needs.md`: it lists every need, its default and where to look
before asking. In short, the questions are:

1. Which prototype (a file, a folder or a local URL). Default: the one found in this folder.
2. Which screens. Default: every screen the nav reaches (`WALK --url <product> --find-screens`).
3. Who uses it, and the one job they come to do. Default: read from the product's own words, stated in the brief.
4. Fix, or report only. Default: fix, in place, with a copy of every changed file kept in `RUN/original/`.
5. The bar: fix P1 and P2 (`--bar P2` below), or P1 only (`--bar P1`). Default: P1 and P2. P3 is listed, never fixed.
6. Any rule of their own to add. Default: the built-in checklist, plus the rules found in step skills and `CLAUDE.md`.

Start check: run `WALK --check`. It must print `ok` for Node and a browser path. If it fails, say so with the
questions: without a browser the walk node is left, the review and recheck work from the source files only,
and every `CHECK` below runs without `--checks`.
Also check the product opens: a file or folder exists, or a local URL answers `curl -sI`.

Write `RUN/screens.json` before close-intake: a JSON list of `{ "name": "<screen name>", "open": "<how>" }`.
`open` is a hash or path from the start page (`"#settings"`), or `"click:text=<label>"`, or `"click:<css selector>"`.

## Node 2: walk

1. `STATE start walk`
2. Follow `${CLAUDE_SKILL_DIR}/references/walk.md`. In short: start the product if it needs a server (in the
   background, local only), then run
   `WALK --url <product> --screens RUN/screens.json --out RUN/walk/before`
   Add `--no-phone` only when the brief says the product is desktop only.
3. Look at every screenshot yourself (Read the PNG). A blank or wrong screenshot means `screens.json` is wrong:
   fix it and walk again.
4. Check: `WALK` exits 0, and `RUN/walk/before/checks.md` names a screenshot for every screen in `screens.json`.
5. `STATE done walk --check "every screen has a screenshot and script checks" --proof RUN/walk/before/checks.md`

## Node 3: review

1. `STATE start review`
2. Start the review helpers with the Agent tool, side by side: one per group of up to 4 screens. Give each the
   brief, its screens, `RUN/walk/before/checks.md`, the screenshot paths, the source file paths, and
   `${CLAUDE_SKILL_DIR}/references/checklist.md`. When a `design-review` skill is installed, also give the path
   of its SKILL.md and tell the helper to follow it (with the Skill tool when it has one). Its rules add to the
   checklist; the checklist's finding format and levels still win. The first group also reviews the
   "Across screens" part of checks.md.
3. Each helper writes `RUN/review/<group>.md` with the findings table from checklist.md, and changes nothing else.
4. Join the tables into `RUN/findings.md` (one table, IDs F1, F2, ... with no gaps or repeats).
5. Check: `CHECK RUN/findings.md --screens RUN/screens.json --checks RUN/walk/before/checks.json` prints OK.
   Every script finding needs a row, even one the helper marks "not a problem" (with the reason).
6. `STATE done review --check "every finding has a screen, a rule and a level" --proof RUN/findings.md`

## Node 4: fix

1. `STATE start fix`
2. Report-only mode: write `RUN/fixes.md` with the line "Report only: no file was changed.", then go to step 6.
3. Fix mode: follow `${CLAUDE_SKILL_DIR}/references/fix.md`. Start fix helpers with the Agent tool. Screens that
   share a file get one helper, and helpers that touch the same file never run at the same time. When a
   `product-design` skill is installed, give its SKILL.md path too, for the look of anything new.
4. Each helper fixes the open rows at or above the bar, sets each row's Status in `RUN/findings.md`, and adds a
   line per change to `RUN/fixes.md` (file, what changed, which row).
5. Check: `CHECK RUN/findings.md --screens RUN/screens.json --bar <bar> --after-fix` prints OK.
6. `STATE done fix --check "each finding fixed, the person's call, or not fixed with a reason" --proof RUN/fixes.md`

## Node 5: recheck (the fresh review)

Round n (n starts at 1):

1. In round 1 only: `STATE start recheck`
2. Walk again: `WALK --url <product> --screens RUN/screens.json --out RUN/walk/after-<n>`
3. Start one new helper with the Agent tool, one that did no review or fix in this run. Give it the brief, the
   stop fact, `references/checklist.md`, `RUN/findings.md`, and `RUN/walk/after-<n>/checks.md` with its
   screenshots. Tell it to read the real screenshots and files, not your notes, and to write
   `RUN/recheck-<n>.md`: the findings table for the product as it is now (old problems still there, and new
   ones the fixes caused; the header row even when no problem is left), then a last line `RESULT: PASS` or
   `RESULT: FAIL` with one line of reason.
   In report-only mode it checks instead that every row of findings.md is true on the screenshots and that
   nothing at P1 is missing from it.
4. Check: `CHECK RUN/recheck-<n>.md --screens RUN/screens.json --checks RUN/walk/after-<n>/checks.json --no-open-p1`
   prints OK, and the file ends with `RESULT: PASS`. In report-only mode, leave out `--no-open-p1`.
5. Passed: `STATE done recheck --check "fresh agent: no open P1 after the last walk" --proof RUN/recheck-<n>.md`
6. Failed in round 1 or 2: `STATE retry recheck --why "<the open P1s>"`, start a new fix helper on the open rows
   of `recheck-<n>.md` (as in node 4), then do round n+1.
7. Failed in round 3: `STATE left recheck --why "<the P1s still open>"`. No fourth round.

## Node 6: handover

Follow the hand-over rules in loop-rules.md. In `handover.md`, also put:
- Before and after: per screen, the before and the last after screenshot as links, side by side in a table.
- What changed: the count of fixes, a link to `fixes.md`, and where the original files are (`RUN/original/`).
- Your call, first: every P1 marked "your call", then every taste row and every other "your call" row, each in
  one plain sentence with the option the loop would pick. Write them as statements, not questions.
- Left: every P2 not fixed (below the bar, or not fixed with its reason), and every P3.
- How to see it: the file to open or the local URL, and how to start it.
Finish with `STATE finish --stop-fact "<the stop fact for the mode, as now true>"`.
