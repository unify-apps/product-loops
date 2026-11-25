---
name: product-research-loop
description: Decides what to build before anyone builds it. Researches the rival products in a category on their public pages, builds a capability sheet (Excel and CSV) with a source link on every cell, searches each rival's own site before calling anything "no rival has it", thinks the product through for its persona (the job, the principle, the flow, the simplicity cut), and ends in a product brief with a ranked module list. Asks every question once at the start, then runs alone. Use when someone asks "what should we build first", "which modules does X need", "benchmark us against A, B and C", "what are rivals doing", "research the competitors", "decide the feature set", or wants a brief to hand to a build. It builds no product.
argument-hint: "<the product or category, and the decision> e.g. \"first modules for a booking tool for small clinics, vs A, B and C\""
---

# Product research loop

Read `${CLAUDE_SKILL_DIR}/shared/loop-rules.md` first, all of it, and follow it.

In this file:
- `STATE` means: `node "${CLAUDE_SKILL_DIR}/shared/scripts/loop-state.mjs"`
- `CHECK` means: `node "${CLAUDE_SKILL_DIR}/scripts/check-research.mjs"`. Its first word is always the check
  name, then the out folder: `CHECK research research/<short name> --rivals 3 --kinds "<KINDS>"`. The default out
  folder also starts with `research/`, so never drop the check name.
- `SHEET` means: `node "${CLAUDE_SKILL_DIR}/scripts/make-sheet.mjs"`. It turns the CSV into the Excel file.
- `KINDS` is the list of source kinds from need 7, and `GROUPS` the person's own group words from need 14, each
  comma separated, exactly as the brief writes them. Leave `--groups` out when the person gave no group words.
- `RUN` is the run folder that `STATE status` prints. `OUT` is the out folder from need 12
  (default `research/<short name>/` in the working folder). Make `OUT/rivals/` and `RUN/checks/` at the start
  of node 2. When `OUT` already holds files from an earlier run, add today's date to its name
  (`research/<short name>-<yyyymmdd>/`), so old rival files are never counted. Make `OUT/beats/` at the start of
  node 3.
- **Waiting for helpers.** Helper agents run in the background. To wait for their files, run one Bash command in
  the foreground (not in the background) with a 600000 ms timeout, for example
  `until [ "$(ls OUT/rivals 2>/dev/null | grep -c '\.md$')" -ge 3 ]; do sleep 10; done`. Never use `sleep` alone,
  ScheduleWakeup or ListAgents. When it times out or is moved to the background, check which files are
  missing and run the same wait once more.

Stop fact: `OUT/capability-sheet.xlsx` and `OUT/capability-sheet.csv` exist, every sheet row says what it does,
every yes or partial cell has a link from that rival's own pages, every beat row has a search of every rival's
own site behind it, and `OUT/brief.md` ends in a ranked module list whose every module cites sheet rows.

## Nodes

1. `intake`: reads what is given, collects every need, writes the brief, waits for "go".
2. `research`: one helper per rival writes that rival's features, each with a source link.
3. `matrix`: merges the rival files into the capability sheet, searches every rival's site for each beat row, and
   makes the Excel file.
4. `think`: persona, job steps, principle, flow, modules and the simplicity cut.
5. `recommend`: writes the product brief, ending in the ranked module list.
6. `review`: a fresh agent checks the files, opens 5 sources, and reads the brief as the buyer.
7. `handover`: writes handover.md and finishes the run.

## Step skills and preferences

Some nodes can use a skill the person has installed. Decide from the skill list this session shows, never by
searching the disk. When the list has a skill with exactly that name, run it with the Skill tool and use its
method, bar and wording. When it does not, follow the built-in reference file.

| Node | Skill, when installed | Built-in |
|---|---|---|
| research | none (helpers use the built-in brief) | `references/research.md` |
| matrix | `product-research` | `references/matrix.md`, `references/beat-proof.md` |
| think | `think` | `references/think.md` |
| recommend | none | `references/recommend.md` |
| review | none | `references/review.md` |

Inside this loop, the loop rules win over any skill. A skill that says "answer in chat", "wait for a go" or
"ask first" means: write the output to the node's file, take the default, and run `STATE decide`. The file
shapes in the built-in references stay the same either way, because `CHECK` reads them.

The person's taste comes from their installed skills and the working folder's `CLAUDE.md`, never from this file.

Never publish, post, send or share any file unless the person's answer in node 1 clearly asks for it, with
where to. "Go" or "use the defaults" never means publish. Never sign in, sign up or pay on a rival's site.

## Node 1: intake

Run `STATE init --loop product-research-loop --nodes intake,research,matrix,think,recommend,review,handover`,
then follow the intake rules.

Needs: read `${CLAUDE_SKILL_DIR}/references/needs.md`. It lists every need, its default, and where to look
before asking. Ask at most 6 questions, only for what is missing and changes the result. Show every other
need in the brief with its value or default.

Start check: one WebSearch for the category and one WebFetch of a rival's home page, as `needs.md` says.
Say the result in the same message as the questions.

The brief (`RUN/brief.md`) holds: the decision, the product, the persona and buyer, the rivals, the market,
every need with its value, `OUT`, `KINDS`, `GROUPS` with the person's examples under each, and the stop fact.
When the person asked for a feature list or a matrix, the brief says the sheet is the main output.

## Node 2: research

1. `STATE start research`
2. When fewer than 3 rivals are named, find the rest: WebSearch for lists of the best products in the category
   for this market, and take the names that show up in the most lists. Run `STATE decide` for each one added.
3. Start one helper agent per rival with the Agent tool, all in one message. Each gets the task in
   `${CLAUDE_SKILL_DIR}/references/research.md`, filled in, with every source kind, group word and named example
   from the brief. Each writes only `OUT/rivals/<rival-slug>.md`.
   Then wait for all the files, as "Waiting for helpers" says.
4. Check: `CHECK research OUT --rivals <number of rivals> --kinds "<KINDS>" --write RUN/checks/research.txt`
5. A FAIL names the file and the problem. Send one helper to fix that file only, then
   `STATE retry research --why "<the FAIL line>"` and check again.
6. `STATE done research --check "every rival file has source links and 5+ rows read" --proof RUN/checks/research.txt`

A rival whose site blocks every page and gives fewer than 5 read rows after the retries: write why in its
file, run `STATE decide` to drop it, and check again with one rival fewer.

## Node 3: matrix

1. `STATE start matrix`
2. Run `product-research` if installed. Then build `OUT/capability-sheet.csv` as
   `${CLAUDE_SKILL_DIR}/references/matrix.md` says, from the rival files only.
3. Beat proof. When the sheet has `beat` rows, start one helper per rival with the Agent tool, all in one message,
   with the task in `${CLAUDE_SKILL_DIR}/references/beat-proof.md`, filled in with every beat row: the same full
   list for every rival, even a row you think that rival has or lacks. `CHECK matrix` needs a line per row and
   rival. Each writes
   `OUT/beats/<rival-slug>.md`. Wait for all the files, as "Waiting for helpers" says. Then change the cells and
   marks as `matrix.md` § Beat proof says.
4. `SHEET OUT`, so the Excel file matches the CSV.
5. Check: `CHECK matrix OUT --groups "<GROUPS>" --write RUN/checks/matrix.txt`
6. On FAIL: fix the rows it names (a missing or thin beat proof: send that rival's helper again for those rows
   only), run `SHEET OUT` again, `STATE retry matrix --why "..."`, check again.
7. `STATE done matrix --check "every row says what it does, every yes cell has its own rival's labelled link, every beat row has a search of every rival's site, xlsx matches" --proof RUN/checks/matrix.txt`

## Node 4: think

1. `STATE start think`
2. Run `think` if installed. Then write `OUT/thinking.md` with the sections in
   `${CLAUDE_SKILL_DIR}/references/think.md`, from the brief, the sheet and the rival files.
3. Check: `CHECK think OUT --write RUN/checks/think.txt`
4. On FAIL: fix it, `STATE retry think --why "..."`, check again.
5. `STATE done think --check "every module names the job step it serves" --proof RUN/checks/think.txt`

## Node 5: recommend

1. `STATE start recommend`
2. Write `OUT/brief.md` as `${CLAUDE_SKILL_DIR}/references/recommend.md` says. When the decision is a capability
   matrix, the brief opens with the sheet and its groups; the modules come after.
3. Check: `CHECK brief OUT --write RUN/checks/brief.txt`
4. On FAIL: fix it, `STATE retry recommend --why "..."`, check again.
5. `STATE done recommend --check "ranked list is last, every module has a must have and cites real sheet rows" --proof RUN/checks/brief.txt`

## Node 6: review

1. `STATE start review`
2. Start one helper agent with the Agent tool, with the task in `${CLAUDE_SKILL_DIR}/references/review.md`,
   filled in. It writes `RUN/review.md`. Wait for that file, as "Waiting for helpers" says.
3. Read `RUN/review.md`. On FAIL: fix what it names (in the node that made it), `STATE retry review --why "..."`,
   and start a new review agent. For each `WRONG BEAT` line: add that page to the rival's file, change the cell,
   label the link in `sources`, change the mark unless every rival is still clearly weak, run `SHEET OUT`, and
   take the beat out of the brief everywhere it is used (bottom line, `## Where we beat them`, the module's
   "How we beat or match"). Run `STATE decide` for each one.
4. `STATE done review --check "fresh agent says PASS" --proof RUN/review.md`. When the retries run out, a wrong
   beat that is still in the sheet goes under `## Not sure yet` in the brief before `STATE left review`.

## Node 7: handover

Follow the hand-over rules in loop-rules.md. Take the decision count from `STATE status --json` (its
`decisions` field), never from memory, and link `decisions.md` only when it exists. In
`STATE finish --stop-fact`, write the real out folder, not `OUT`.
Before you write `handover.md`: when the person asked for a Google Sheet or a link to the sheet (need 15), upload
`OUT/capability-sheet.xlsx` with the Google Drive tool this session has. When there is no such tool, or it asks
for a sign-in, run `STATE hold --step "Put the sheet in Google Drive" --kind sign-in --why "<what stopped it>"`.
In `handover.md` also put:
- First, the sheet: `OUT/capability-sheet.xlsx` (and the Google Sheet link, when it was made), its row count and
  its tabs. Call each file and link what it is. Never give a web page or another kind of link as the sheet.
- Links to `OUT/brief.md`, `OUT/capability-sheet.csv`, `OUT/thinking.md`, each rival file and each beat proof file.
- Beats the proof or the review changed to `gap`, with the page that showed the rival has it.
- Every source kind from `KINDS` that gave no rows for a rival, with the "why none" from its file.
- The ranked module list's top 3, one line each, and the `## Questions for the build` from the brief.
- What was not checked: rivals dropped, pages that would not open, `unverified` rows.
- Next step: a build can start from `OUT/brief.md` (for example `/product-build-loop OUT/brief.md`, when that
  loop is installed).
