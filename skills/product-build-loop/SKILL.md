---
name: product-build-loop
description: Builds a clickable web prototype of a new product, or adds a module to a prototype that exists, in one unattended run. It asks every question once, gives a local link before it builds, builds and reviews every module, checks every click in a real browser, makes a link per demo state, and hands over. Use when someone types /product-build-loop, or asks to "build a prototype of", "make a clickable demo of", "start a new product", "add a module to my prototype", "mock up an app for" or "build this end to end". Not for restyling screens that already exist or working through screenshot notes (the design loop does that), and not for deciding what to build (the research loop does that).
argument-hint: "<what to build, or which module to add>"
---

# Product build loop

Read `${CLAUDE_SKILL_DIR}/shared/loop-rules.md` first, all of it, and follow it.

In this file:
- `STATE` means `node "${CLAUDE_SKILL_DIR}/shared/scripts/loop-state.mjs"`.
- `SERVE` means `node "${CLAUDE_SKILL_DIR}/scripts/serve.mjs"`.
- `CLICKS` means `node "${CLAUDE_SKILL_DIR}/scripts/check-clicks.mjs"`.
- `RUN` is the run folder that `STATE init` prints. `PRODUCT` is the product folder the brief names.

The ask: `$ARGUMENTS`

Stop fact: every module in `RUN/modules.md` is built and reviewed with no P1 left, `CLICKS` passes on every link
in `RUN/links.md` (each link opens, no dead click, no placeholder text, no page error), and `RUN/requests.md` has
no open item.

The stop-fact items intake writes (`STATE stop-fact add`), with the real names and numbers:
1. Every module in `RUN/modules.md` is built: `<the module names>`.
2. Every module's last review round has 0 P1.
3. `CLICKS` passes on every link in `RUN/links.md`: each opens, no dead click, no placeholder text, no page error.
4. `RUN/requests.md` has no open line.
5. Up to 3 must-haves the person stressed, one item each, in their words (for example "a patient can move their
   own booking").
6. Full track only: `RUN/links.md` has a link for every list, one detail, every create flow and every empty state.

## Nodes

1. `intake`: reads what exists, asks everything in one round, writes the brief, waits for "go".
2. `run-link`: starts a local server and gives the first link, before any build.
3. `name-mark`: three name and mark options on the real header (new product only).
4. `build-modules`: builds every module on the list, each by a helper agent, and checks its clicks.
5. `review-modules`: a helper that did not build a module reviews it; fixes until no P1 is left.
6. `demo-links`: sample data that hangs together, and a link per state.
7. `review`: a fresh agent checks the stop fact.
8. `handover`: writes handover.md and finishes the run.

## Quick track

For a small ask: one or two modules, "a quick demo", or a shell to look at. It leaves two nodes,
`STATE left name-mark --why "quick track"` and `STATE left demo-links --why "quick track"`, and builds every
module as one page in the shell with its list state only (no detail, create or empty routes). Node 4 then joins
`RUN/links/*.md` into `RUN/links.md` itself and ticks R1. Recommend full for a new product with 3 or more
modules, or when the person will demo it to someone.

## Rules for every node

- **The request list.** `RUN/requests.md` holds every thing the person asked for, one line each:
  `- [ ] R3 <what, in their words> (from: ask | intake | mid-run)`. A line is ticked `- [x]` only when it is in
  the product, with where: `- [x] R3 ... · done in index.html, #/books`.
- **When the person types during the run**, add each message to `requests.md` as a new line at once, say in one
  line that it is on the list, and fold it into the module being built or the next one. Never answer with a
  question. A message that says to stop the run: `STATE stop --why "<their words>"`.
- **No gates.** Never stop to ask "should I build it this way?". A structural or taste choice goes to
  `RUN/proposals.md` with your pick, and you build your pick.
- **A link after every module.** Each time a module is built or fixed, say its link in one line.
- **Local only.** Never deploy, publish or send anything off this laptop unless the brief says the person asked
  for it in node 1. "go" with the defaults never means publish.
- **Preferences come from the person**, at run time: the brief, the working folder's `CLAUDE.md`, and the person's
  installed skills. Nothing else.
- **No browser.** When `CLICKS` prints `LOAD-ONLY PASS`, it checked that links load, not clicks. Then say so in
  each proof, write "clicks not checked: no browser" into the stop fact at `finish`, and list it under "Left for
  you" in `handover.md` with the one step: install a browser for Playwright, then run node 7's `CLICKS` line.
- **Optional step skills.** Where a node names a skill, check `~/.claude/skills/<name>/SKILL.md`,
  `.claude/skills/<name>/SKILL.md`, and the session's own skill list (a plugin skill shows as `<plugin>:<name>`). If it is there, run it with the Skill tool (or tell the helper to). If not,
  follow the node's own file in `${CLAUDE_SKILL_DIR}/references/`. The loop works fully with none installed.
- **Helper briefs.** Every helper below gets its brief as a file first (`RUN/briefs/<helper>.md`), as the loop
  rules say, and writes its report to `RUN/reports/<helper>.md`.

## Node 1: intake

Run `STATE init --loop product-build-loop --nodes intake,run-link,name-mark,build-modules,review-modules,demo-links,review,handover --skill-dir "${CLAUDE_SKILL_DIR}" --track <quick|full> --budget-minutes 120`,
then follow the intake rules.

Read `${CLAUDE_SKILL_DIR}/references/needs.md`. It lists every need of every node, its default, and where to
look before asking. Fill all you can find. Then:

1. **New or existing.** Look in the working folder for a product (an `index.html`, a `package.json` with a dev
   script) and for earlier runs (`loop-runs/product-build-loop-*/brief.md`). List up to 5 products found, newest
   first. The default is the one the ask names, else a new product in `<working folder>/<slug>/`.
2. **Research first.** When no brief exists (no `loop-runs/product-research-loop-*/` folder, no file named like
   `*brief*`, `*research*`, `*spec*` or `*prd*`) and the ask is a new product whose feature set is open, add the
   question "Run product-research-loop first?" with the default **no** and the module list you drafted. If the
   person says yes: write `brief.md`, run `STATE stop --why "the person chose research first"`, and end with one
   line naming the command to type: `/product-research-loop <the idea>`. This loop then finds that brief next time.
3. **Start check.** Run `CLICKS --probe --tools RUN/tools`. It says which browser the click checks will use. If
   it says none, say so with the questions: links will then be checked by loading only.
4. Write `RUN/requests.md` with every thing the ask and the answers name, and `RUN/modules.md` with the modules in
   build order: `| # | Module | Must have | Files | Status |`. R1 is the whole ask; node 6 ticks it (node 4 on
   the quick track).
5. **Estimate.** Helpers: one builder per module, one reviewer per module per round (count 2 rounds), one final
   reviewer and the builder check. On the full track that is about 3 per module plus 2.
6. Ask the rest in one round (see `needs.md` § The questions), then close the intake as the rules say.

## Node 2: run-link

1. `STATE start run-link`
2. A new product: write the shell first, `PRODUCT/index.html`, one file with its CSS and JS inside (unless the
   person chose one file per module). Keep it small: this node is about speed. It holds the header with the
   working name, the navigation with every module from `modules.md`, and a hash route per module (`#/<module>`).
   Until a module lands, its route shows the module's name, its must-haves as a list, and one line: "Being
   built now. This page fills in by itself." Never "Not found" or an empty page. An existing product: change
   nothing.
3. Start the server. A folder with a dev script runs its own (`npm run dev`, started in the background with its
   output to `RUN/server.log`; read the link from the log and write `RUN/server.json` with `url` and `pid`).
   Any other folder: `SERVE PRODUCT --info RUN/server.json`. It reuses a server that is already running, and it
   stops by itself after 2 hours with no open page.
4. `curl -s -o /dev/null -w "%{http_code}" <url>` prints 200. Then at once say the link in one line: "First
   link: <url>. It reloads by itself as each module lands." (True because `SERVE` puts a reload script into
   each page it serves.)
5. Check: `CLICKS <url> <url>#/<module>... --out RUN/run-link.json --tools RUN/tools` (the base link, plus each
   new module's route on a new product) passes.
6. `STATE done run-link --check "server answers 200, shell routes pass" --proof RUN/run-link.json`

## Node 3: name-mark

Quick track: `STATE left name-mark --why "quick track"`. An existing product, or a brief that gives both the
name and the mark files: `STATE left name-mark --why "<the product already has its name and mark>"`, and put the
given files on the header in node 4. Otherwise: `STATE start name-mark`, then follow
`${CLAUDE_SKILL_DIR}/references/name-mark.md`.
Check: `PRODUCT/brand-options.html` shows 3 options, each on a copy of the real header, and
`CLICKS <url>brand-options.html --out RUN/name-mark.json --tools RUN/tools` passes (give the link, not the file).
`STATE done name-mark --check "3 options on the real header" --proof RUN/name-mark.json`

## Node 4: build-modules

1. `STATE start build-modules`
2. For each module in `modules.md`, write `RUN/briefs/build-<module>.md` from
   `${CLAUDE_SKILL_DIR}/references/build-module.md`, then start one helper on it. Modules that own separate files
   get their helpers at the same time, in one message. Modules that share a file (the one-file default) get
   theirs one after another. On the quick track, the brief says: the list state only, no other routes.
3. After each helper: `CLICKS RUN/links/<module>.md --out RUN/build/clicks-<module>.json --shots RUN/shots/<module> --tools RUN/tools`.
   If it fails, send the failing lines back to a helper to fix (the retry ladder), and check again. At most 3
   rounds per module. Write each round in `modules.md` (`Status: built, round 2, clicks pass`).
4. Tick the module's lines in `requests.md`. Say the module's link in one line.
5. Write `RUN/build-modules.md`: one row per module with its rounds and its click result.
6. Quick track: join `RUN/links/*.md` into `RUN/links.md`, grouped by module, and tick R1 when every module is
   built. `grep -c '^- \[ \]' RUN/requests.md` must print 0.
7. Check: every module's click report says `"pass": true`.
   `STATE done build-modules --check "every module's clicks pass" --proof RUN/build-modules.md`.
   A module still failing after 3 rounds: `STATE left build-modules --why "left because: <module>: <what still fails> · the person's one step: <step>"`.

## Node 5: review-modules

1. `STATE start review-modules`
2. For each module, write `RUN/briefs/review-<module>-round<n>.md` from
   `${CLAUDE_SKILL_DIR}/references/review-module.md`, then start a helper that did not build it (it runs the
   `design-review` skill when installed). It writes `RUN/reviews/<module>-round<n>.md`: P1, P2 and P3 findings,
   each with one exact fix.
3. Apply every P1 and every P2 that has one clear fix (spacing, words, a missing state, a dead end): you apply
   them yourself when they stay inside one module's files; a fix that crosses modules goes to one helper with
   a brief. Taste and structure calls, and the P3s of a module's last round, go to `proposals.md`. Run `CLICKS` again, then a new review round by a fresh helper: it checks
   each fix landed and nothing broke. A round with 0 P1 and nothing left to fix ends that module's review. At most
   3 rounds per module. A round that changed no file needs no next round.
4. Write `RUN/review-modules.md`: one row per module, its rounds, and the P1 count of its last round.
5. Check: every module's last round has 0 P1, its clicks pass, and no file changed after that round was written.
   `STATE done review-modules --check "no P1 left in any module" --proof RUN/review-modules.md`

## Node 6: demo-links

Quick track: `STATE left demo-links --why "quick track"` (node 4 wrote `RUN/links.md`). Otherwise:

1. `STATE start demo-links`
2. Follow `${CLAUDE_SKILL_DIR}/references/demo-links.md`: sample data that agrees across modules, and
   `RUN/links.md` with one link per state (each list, a detail, each create flow, each empty and error state).
3. Tick R1, the whole ask, when every module is built. Then `grep -c '^- \[ \]' RUN/requests.md` must print 0.
   An open line: build it now, or write in it why it is not built. The review fails on any open line.
4. Check: `CLICKS RUN/links.md --out RUN/demo-clicks.json --tools RUN/tools` passes, and the grep printed 0.
   `STATE done demo-links --check "every link opens, every click works, no open request" --proof RUN/demo-clicks.json`

## Node 7: review

1. `STATE start review`
2. Write `RUN/briefs/review.md` with: "Read RUN/brief.md, RUN/modules.md, RUN/requests.md, RUN/links.md and the
   files in PRODUCT. Follow `${CLAUDE_SKILL_DIR}/shared/review-rubric.md`. The check command: `CLICKS
   RUN/links.md --out RUN/review-clicks.json --shots RUN/shots/review --tools RUN/tools` (with `CLICKS` written
   out in full); run it yourself and open some of the shots. Also check that every ticked line in requests.md is
   really in the product. Write RUN/review.json and RUN/review.md (PASS or FAIL, one line per reason). Change no
   file in PRODUCT." Paste the stop-fact table (`STATE stop-fact status`) into it.
3. Start one helper that built nothing in this run on that brief, on a different model from the builders when
   one is there. Then `STATE stop-fact pass --from RUN/review.json`.
4. If it says FAIL, or an item does not pass: fix what it names, `STATE retry review --why "<reason>"`, and run
   a new fresh agent.
5. `STATE done review --check "fresh agent says PASS, spec <n>, quality <n>, model <m>" --proof RUN/review.md`
6. After PASS, change no file in PRODUCT. A small fix the reviewer noted goes to `proposals.md` for the person.

## Node 8: handover

Follow the hand-over rules in loop-rules.md. In `handover.md` also put:
- The base link and every link from `links.md`, and which browser checked the clicks.
- Under "Left for you": the server is still running at <url> and stops by itself after 2 hours with no open
  page. To open the links again later: `SERVE PRODUCT --info RUN/server.json` (it takes the same port). To stop it
  now: `SERVE --stop --info RUN/server.json`. Write both as full commands with real paths.
- The decisions exactly as `decisions.md` has them, never retold.
- `proposals.md`, each with the pick that was built, and the name options from node 3.
- Every line of `requests.md`, ticked or not.
- On the quick track: what it left out (name and mark options, the demo states), and that a full run adds them.
