---
name: product-build-loop
description: Builds a clickable web prototype of a new product, or adds a feature or module to a prototype that already exists, in one unattended run. It asks every question once at the start, gives a local link before it builds, builds and reviews every module on the list, checks every click in a real browser, makes a link per state for a demo, and hands over. Use when someone types /product-build-loop, or asks to "build a prototype of", "make a clickable demo of", "start a new product", "add a module to my prototype", or "build this end to end". For changes to how existing screens look, or a list of screenshot notes, use a design loop instead.
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

## Nodes

1. `intake`: reads what exists, asks everything in one round, writes the brief, waits for "go".
2. `run-link`: starts a local server and gives the first link, before any build.
3. `name-mark`: three name and mark options on the real header (new product only).
4. `build-modules`: builds every module on the list, each by a helper agent, and checks its clicks.
5. `review-modules`: a helper that did not build a module reviews it; fixes until no P1 is left.
6. `demo-links`: sample data that hangs together, and a link per state.
7. `review`: a fresh agent checks the stop fact.
8. `handover`: writes handover.md and finishes the run.

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
- **Optional step skills.** Where a node names a skill, check `~/.claude/skills/<name>/SKILL.md` and
  `.claude/skills/<name>/SKILL.md`. If it is there, run it with the Skill tool (or tell the helper to). If not,
  follow the node's own file in `${CLAUDE_SKILL_DIR}/references/`. The loop works fully with none installed.

## Node 1: intake

Run `STATE init --loop product-build-loop --nodes intake,run-link,name-mark,build-modules,review-modules,demo-links,review,handover`,
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
   build order: `| # | Module | Must have | Files | Status |`. R1 is the whole ask; node 6 ticks it.
5. Ask the rest in one round (see `needs.md` § The questions), then close the intake as the rules say.

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
   link: <url>. It reloads by itself as each module lands."
5. Check: `CLICKS <url> <url>#/<module>... --out RUN/run-link.json --tools RUN/tools` (the base link, plus each
   new module's route on a new product) passes.
6. `STATE done run-link --check "server answers 200, shell routes pass" --proof RUN/run-link.json`

## Node 3: name-mark

An existing product, or a brief that gives both the name and the mark files: `STATE left name-mark --why "<the
product already has its name and mark>"`, and put the given files on the header in node 4. Otherwise:
`STATE start name-mark`, then follow `${CLAUDE_SKILL_DIR}/references/name-mark.md`.
Check: `PRODUCT/brand-options.html` shows 3 options, each on a copy of the real header, and
`CLICKS <url>brand-options.html --out RUN/name-mark.json --tools RUN/tools` passes (give the link, not the file).
`STATE done name-mark --check "3 options on the real header" --proof RUN/name-mark.json`

## Node 4: build-modules

1. `STATE start build-modules`
2. For each module in `modules.md`, start one helper agent with the brief in
   `${CLAUDE_SKILL_DIR}/references/build-module.md`. Modules that own separate files get their helpers at the
   same time, in one message. Modules that share a file (the one-file default) get theirs one after another.
3. After each helper: `CLICKS RUN/links/<module>.md --out RUN/build/clicks-<module>.json --shots RUN/shots/<module> --tools RUN/tools`.
   If it fails, send the failing lines back to a helper to fix, and check again. At most 3 rounds per module.
   Write each round in `modules.md` (`Status: built, round 2, clicks pass`).
4. Tick the module's lines in `requests.md`. Say the module's link in one line.
5. Write `RUN/build-modules.md`: one row per module with its rounds and its click result.
6. Check: every module's click report says `"pass": true`.
   `STATE done build-modules --check "every module's clicks pass" --proof RUN/build-modules.md`.
   A module still failing after 3 rounds: `STATE left build-modules --why "<module>: <what still fails>"`.

## Node 5: review-modules

1. `STATE start review-modules`
2. For each module, start a helper that did not build it, with the brief in
   `${CLAUDE_SKILL_DIR}/references/review-module.md` (it runs the `design-review` skill when installed). It writes
   `RUN/reviews/<module>-round<n>.md`: P1, P2 and P3 findings, each with one exact fix.
3. Apply every P1 and every P2 that has one clear fix (spacing, words, a missing state, a dead end). Taste and
   structure calls go to `proposals.md`. Run `CLICKS` again, then a new review round by a fresh helper: it checks
   each fix landed and nothing broke. A round with 0 P1 and nothing left to fix ends that module's review. At most
   3 rounds per module. A round that changed no file needs no next round.
4. Write `RUN/review-modules.md`: one row per module, its rounds, and the P1 count of its last round.
5. Check: every module's last round has 0 P1, its clicks pass, and no file changed after that round was written.
   `STATE done review-modules --check "no P1 left in any module" --proof RUN/review-modules.md`

## Node 6: demo-links

1. `STATE start demo-links`
2. Follow `${CLAUDE_SKILL_DIR}/references/demo-links.md`: sample data that agrees across modules, and
   `RUN/links.md` with one link per state (each list, a detail, each create flow, each empty and error state).
3. Tick R1, the whole ask, when every module is built. Then `grep -c '^- \[ \]' RUN/requests.md` must print 0.
   An open line: build it now, or write in it why it is not built. The review fails on any open line.
4. Check: `CLICKS RUN/links.md --out RUN/demo-clicks.json --tools RUN/tools` passes, and the grep printed 0.
   `STATE done demo-links --check "every link opens, every click works, no open request" --proof RUN/demo-clicks.json`

## Node 7: review

1. `STATE start review`
2. Start one helper agent that built nothing in this run. Tell it: "Read RUN/brief.md, RUN/modules.md,
   RUN/requests.md, RUN/links.md and the files in PRODUCT. Run `CLICKS RUN/links.md --out RUN/review-clicks.json
   --shots RUN/shots/review --tools RUN/tools` yourself and open some of the shots. Check the stop fact: <stop
   fact>. Also check that every ticked line in requests.md is really in the product. Write PASS or FAIL, with one
   line per reason, to RUN/review.md. Change no file in PRODUCT. Do not run loop-state.mjs."
3. If it says FAIL: fix what it names, `STATE retry review --why "<reason>"`, and run a new fresh agent.
4. `STATE done review --check "fresh agent says PASS" --proof RUN/review.md`
5. After PASS, change no file in PRODUCT. A small fix the reviewer noted goes to `proposals.md` for the person.

## Node 8: handover

Follow the hand-over rules in loop-rules.md. In `handover.md` also put:
- The base link and every link from `links.md`, and which browser checked the clicks.
- Under "Left for you": the server is still running at <url> and stops by itself after 2 hours with no open
  page. To open the links again later: `SERVE PRODUCT --info RUN/server.json` (it takes the same port). To stop it
  now: `SERVE --stop --info RUN/server.json`. Write both as full commands with real paths.
- The decisions exactly as `decisions.md` has them, never retold.
- `proposals.md`, each with the pick that was built, and the name options from node 3.
- Every line of `requests.md`, ticked or not.
