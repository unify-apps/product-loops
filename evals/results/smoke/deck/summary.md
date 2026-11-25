# Smoke run summary: product-deck-loop (quick track, Bright Smiles Dental)

## 1. STATE status, STATE stop-fact status, STATE report (after finish)

```
ok status product-deck-loop: intake closed, finished
run folder: /private/tmp/claude-501/-Users-harshalkotti--claude-spares-spare-81Mfoj/44c366c7-da1f-48f6-b2fa-e04f993e0a17/scratchpad/smokework/deck/loop-runs/product-deck-loop-20261126-032714
  done    intake
  done    research
  done    story
  done    build
  done    facts-and-words
  done    outputs
  done    review
  done    handover
next node: none, run finish
decisions: 3 (in decisions.md)
budget: 10 of 90 minutes used, 0 of 6 pushes, 3 of 40 decisions
stop fact: 6 of 6 items pass

ok stop-fact status: 6 of 6 items pass
  pass    S1 The deck does what the goal says for Priya Nair, COO of Bright Smiles Dental: she believes Clinic Scheduler can cut her no-shows (about 9% today) and agrees to a small pilot in a few of her clinics. (proof: loop-runs/product-deck-loop-20261126-032714/review.json)
  pass    S2 These files are in decks/brightsmiles-20261126/out/ and open: deck.html, deck.pdf. (proof: loop-runs/product-deck-loop-20261126-032714/review.json)
  pass    S3 The main slide count is 6 to 8. (proof: loop-runs/product-deck-loop-20261126-032714/review.json)
  pass    S4 deck.py check --dir decks/brightsmiles-20261126 prints PASS on every check, after the last change. (proof: loop-runs/product-deck-loop-20261126-032714/review.json)
  pass    S5 Every line on a slide cites facts that say it, each with a source link, an estimate note or the person's word. (proof: loop-runs/product-deck-loop-20261126-032714/review.json)
  pass    S6 Every finding of an earlier review round is fixed, or left with why, in decks/brightsmiles-20261126/review-fixes.md (none on the first round). (proof: loop-runs/product-deck-loop-20261126-032714/review.json)

ok report: written to loop-runs/product-deck-loop-20261126-032714/metrics.json
| node | status | minutes | retries |
|---|---|---|---|
| intake | done | 2.9 | 0 |
| research | done | 0.2 | 0 |
| story | done | 0.5 | 0 |
| build | done | 1.8 | 0 |
| facts-and-words | done | 2.9 | 0 |
| outputs | done | 0.4 | 0 |
| review | done | 3.7 | 0 |
| handover | done | 0.5 | 0 |

track: quick; budget: 90 minutes, 6 pushes, 40 decisions
minutes since close-intake: 10.7; pushes: 0; decisions: 3; held: 0; left nodes: none
```

## 2. handover.md

# Hand-over: Bright Smiles Dental first-meeting deck

## What was made
- /private/tmp/claude-501/-Users-harshalkotti--claude-spares-spare-81Mfoj/44c366c7-da1f-48f6-b2fa-e04f993e0a17/scratchpad/smokework/deck/decks/brightsmiles-20261126/out/deck.html: the deck, 7 main slides plus an Appendix break and 2 Sources slides (10 in all). Open it in a browser.
- /private/tmp/claude-501/-Users-harshalkotti--claude-spares-spare-81Mfoj/44c366c7-da1f-48f6-b2fa-e04f993e0a17/scratchpad/smokework/deck/decks/brightsmiles-20261126/out/deck.pdf: the same deck, one slide a page (10 pages).
- No PowerPoint (quick track) and no Artifact (not asked for). Nothing was published or sent anywhere.
- Fonts: Arial for titles and body. Look: plain, dark text on white, one dark blue accent.
- Working files: /private/tmp/claude-501/-Users-harshalkotti--claude-spares-spare-81Mfoj/44c366c7-da1f-48f6-b2fa-e04f993e0a17/scratchpad/smokework/deck/decks/brightsmiles-20261126/deck.json (slide text and speaker notes), /private/tmp/claude-501/-Users-harshalkotti--claude-spares-spare-81Mfoj/44c366c7-da1f-48f6-b2fa-e04f993e0a17/scratchpad/smokework/deck/decks/brightsmiles-20261126/facts.json, /private/tmp/claude-501/-Users-harshalkotti--claude-spares-spare-81Mfoj/44c366c7-da1f-48f6-b2fa-e04f993e0a17/scratchpad/smokework/deck/decks/brightsmiles-20261126/story.md, /private/tmp/claude-501/-Users-harshalkotti--claude-spares-spare-81Mfoj/44c366c7-da1f-48f6-b2fa-e04f993e0a17/scratchpad/smokework/deck/decks/brightsmiles-20261126/words.md, /private/tmp/claude-501/-Users-harshalkotti--claude-spares-spare-81Mfoj/44c366c7-da1f-48f6-b2fa-e04f993e0a17/scratchpad/smokework/deck/decks/brightsmiles-20261126/review-fixes.md.

## The goal, and how the deck meets it
Goal: Priya Nair, COO, believes Clinic Scheduler can cut her no-shows (about 9% today) and agrees to a small pilot in a few of her clinics.
- Slide 2 states her own number: about 9% of appointments are no-shows, across 40 clinics.
- Slide 3 shows what the product does: online booking, text reminders, a waitlist that fills cancelled slots.
- Slide 4 is the proof: no-shows fell from 8% to 5% in 3 months in our 3 pilot clinics (labelled as our pilot report's estimate).
- Slide 5 is our estimate for her: the same 3-point fall would take her to about 6%, labelled as an estimate, not a promise.
- Slides 6 and 7 ask for the pilot: a few clinics at £120 per clinic per month list price; clinics, count, length and start date agreed with her; judged on the no-show rate before and after.
Main slide count: 7 (asked 6 to 8).

## Facts
9 facts: 0 public (no web research, as you asked), 7 from you (6 from facts.md, 1 from your "go" on the pilot terms), 2 our estimates.
Estimates to check before the meeting:
- f7: about 6% no-shows for Bright Smiles if the pilot's 3-point fall carries over (about 9% minus 3 points). It rests on 3 clinics.
- f8: £4,800 a month for all 40 clinics at list price (40 x £120). It is in slide 7's speaker notes only.
Also check: facts.md calls the pilot result (8% to 5%) an estimate in your internal pilot report; the deck says so on slide 4.

## The stop fact
Review: PASS, spec 4, quality 3, by a fresh agent on claude-sonnet-5-5 reading as Priya Nair.

  pass    S1 The deck does what the goal says for Priya Nair, COO of Bright Smiles Dental: she believes Clinic Scheduler can cut her no-shows (about 9% today) and agrees to a small pilot in a few of her clinics.
  pass    S2 These files are in decks/brightsmiles-20261126/out/ and open: deck.html, deck.pdf.
  pass    S3 The main slide count is 6 to 8.
  pass    S4 deck.py check --dir decks/brightsmiles-20261126 prints PASS on every check, after the last change.
  pass    S5 Every line on a slide cites facts that say it, each with a source link, an estimate note or the person's word.
  pass    S6 Every finding of an earlier review round is fixed, or left with why, in decks/brightsmiles-20261126/review-fixes.md (none on the first round).

Review findings (7, all taste): R1 fixed (slide 5 notes say the estimate rests on 3 clinics), R3 fixed (40-clinic cost moved from slide 7 to its notes), R4 fixed (slide 7 notes: size the cost of no-shows with her appointment numbers first), R6 fixed (cover names Clinic Scheduler); R2, R5, R7 left (below).

## The run
| node | status | minutes | retries |
|---|---|---|---|
| intake | done | 2.9 | 0 |
| research | done | 0.2 | 0 |
| story | done | 0.5 | 0 |
| build | done | 1.8 | 0 |
| facts-and-words | done | 2.9 | 0 |
| outputs | done | 0.4 | 0 |
| review | done | 3.7 | 0 |
| handover | running | 0 | 0 |

track: quick; budget: 90 minutes, 6 pushes, 40 decisions
minutes since close-intake: 10.2; pushes: 0; decisions: 3; held: 0; left nodes: none

## Decisions
3 decisions, in /private/tmp/claude-501/-Users-harshalkotti--claude-spares-spare-81Mfoj/44c366c7-da1f-48f6-b2fa-e04f993e0a17/scratchpad/smokework/deck/loop-runs/product-deck-loop-20261126-032714/decisions.md.

## Left for you
- R2 (slide 4): the pilot clinics are not described (type, size, any comparison group), so Priya cannot tell whether they look like hers. No fact describes them. Your one step: if the pilot report describes its clinics, add that line to facts.md before the meeting.
- R5 (slides 3, 6, 7): the cards have room left inside; the body check passes and there are no more facts to fill them. Your one step: none needed, or give more product facts.
- R7 (Sources slides): every fact from you shows "(Given by the presenter)", including Bright Smiles' own 9%. The script writes that label. Your one step: none needed.
- No node was left, no step was held, every stop-fact item passes.
- Questions for you before the meeting: how many appointments does one clinic book in a month, and what does an empty slot cost? The deck asks Priya both; knowing your own guess helps.

## Planted instructions
none

## Lessons learned
- STATE learn --rule "With few facts, use the steps layout (boxed cards) instead of columns or a long points list, or the body check fails on an empty bottom third" --because "body check failed on slides 3, 4 and 7 (61%, 36%, 44% empty) with columns and points; passed after slide 3 and 7 became steps and slide 4 got a second point" --node build
- STATE learn --rule "When copying the person's facts into person.md, keep every qualifier in the fact text (where it was said, 'estimate'), not only in the where field, because the claim checker reads only the text" --because "claim checker round 1 failed 3 rows that said 'intro call', which was only in f3's where field; passed after the rows dropped it (and f5 regained its 'estimate')" --node facts-and-words

## 3. STATE refusals

None. Every STATE command printed `ok ...` the first time. (One non-STATE failure: in zsh, `ST="node .../loop-state.mjs"; $ST status` fails with "no such file or directory: node /...loop-state.mjs" because zsh does not word-split a variable. I wrote two tiny wrapper scripts, `STATE` and `DECK`, in the scratchpad bin and used them for the rest of the run.)

## 4. Where the instructions were unclear, wrong or wasted time

1. **No-web runs have no path through research.** research.md assumes helpers and public links: "Then open 3 public links at random with WebFetch and confirm the number is on the page", and SKILL.md node 2 check 4 says "the 3 links in `OUT/research/spot-check.md` match". With "no web research" every fact is from-person and there are no links, so the check cannot pass as written. SKILL.md only says "Without web tools, use only the given files ... and write that down with `STATE decide`", which covers the helpers but not the check. Change: "With no public facts, the spot check compares each from-person line with its source file instead; write that in spot-check.md."
2. **from-person qualifiers vanish from the claim checker's view.** The line shape `- [from-person] <fact> | <where it came from>` puts "from the intro call" and "estimate" in `where`, and claims.md shows only `text`. Round 1 then failed 3 rows for saying "intro call", which the person had said. I also dropped facts.md's word "estimate" for the pilot result in the same way. Change: claims.md should print `where` for from-person facts, or research.md should say "keep every qualifier (when, where said, estimate) in the fact text".
3. **No way to cite the person's intake answers.** story.md: the ask "Every part of it comes from need 6 or the person's answers", and build.md: "Every line cites its own facts". But a "go" on a default (here: the pilot terms) is not a fact anywhere. I added it as a `[from-person]` line in `research/added.md`, which research.md describes only as for "an estimate the story needs". Change: say that intake answers used on slides become from-person lines in person.md (or added.md after merge), citing brief.md.
4. **Fix-now vs retry is contradicted.** SKILL.md node 4: "A `body` failure is fixed now"; loop-rules: "If the check failed: `STATE retry <node>`". I fixed it inside the node with no retry. Result: the report shows 0 retries though the body check failed once and the claim checker failed 3 rounds of 5. The hand-over lesson rule ("Look back over this run's retries (`STATE status`)") then finds nothing, though real fail-then-pass happened. Change: say plainly that a check failing during a node's own work (body fixes, checker rounds) is not a retry, and make lessons come from "any check that failed, then passed", not only from STATE retries. Or let STATE count inner rounds.
5. **Claim checkers contradict each other.** writing.md: "use its new text exactly as given ... Write no new wording of your own". Round 1 proposed "Say the meeting is about one number she gave us"; round 2 failed that exact text. The rule makes the loop take on checker errors and spend a round. Change: the checker brief should require each new text to pass its own row's test (and a notes row with no cited facts may state nothing). Or allow the builder to cut instead.
6. **Track question vs the person's words.** SKILL.md: "Recommend full when the person asked for a PowerPoint, gave a start deck, or the reader is senior" (a COO is senior). The ask said "Quick track", and loop-rules says "A default never goes against the person's own words" and "Never ask for what you can find". SKILL.md also says "The track is one of the questions". I recommended quick and still asked. Change: "When the ask names the track, use it and do not ask."
7. **"The reader alone" is read as "read alone".** needs.md G3 default "the reader alone" led the builder-check helper to ask whether the deck is "read alone or presented live". Change the default's words to "no one further: only the reader".
8. **The review brief does not fit quick or no-web runs.** review.md: "`<OUT>/renders/pptx/` (or `renders/html/` ...) ... When a PDF is an output, also open 3 pictures in `<OUT>/renders/html/`" repeats itself when there is no PowerPoint. "Open 3 public links with WebFetch" is impossible with no public facts. I rewrote both parts by hand. Change: give a branch for "no PowerPoint" and for "no public facts: check from-person facts against the person's files".
9. **S6 on the first round.** Stop-fact item 6 ("none on the first round") gives the reviewer no evidence to find. The reviewer passed it with "No earlier review exists". Change: add S6 only from the second round, or say in the rubric how to pass it on round 1.
10. **Fixes after a PASS are never re-reviewed.** review.md: fixes that do not add, cut or reorder slides need no new helper. So stop-fact items stay "pass" with evidence from the deck before the fixes (here a card left slide 7 and the cover subtitle changed). The claim checker and `DECK check` do run again, so this is low risk, but `stop-fact pass` evidence goes stale. Also writing.md's "Up to 5 checker rounds are this node's own work" names only facts-and-words; I ran rounds 4 and 5 in review with no stated cap.
11. **The estimate is far too high for the quick track.** The loop-rules formula (5 min per work node, 10 per helper round, round up) gave "About 80 minutes and 4 helper agents". The run took about 14 minutes and used 7 helpers (5 claim-checker rounds). SKILL.md's "one claim checker per round (count 2)" does not say whether 2 is rounds or helpers. Change: give quick-track numbers, and count claim checkers as 2 to 3 rounds.
12. **The `columns` layout fails `body` almost always.** build.md lists columns for "a comparison". With 1 or 2 short lines per column it rendered 51 to 61% empty. Only `steps` (boxed cards) passed with the same text. Change: add to build.md "with short text, use steps or numbers; columns need 3+ lines each", or make columns boxed like steps.
13. **Small points.** `STATE init` does not create `briefs/` and `reports/`, though loop-rules says to write there before the first helper. `finish` says nothing about the notification, though loop-rules says the last message must say "A notification was sent." or why not, so I cannot confirm one was sent. The Sources slide labels the client's own 9% "(Given by the presenter)" and orders facts by first use, not by id (R7). SKILL.md's `${CLAUDE_SKILL_DIR}/shared/` is a copy of the plugin's `shared/` (identical today). The packet's hook ran from `repo/shared/hooks` but STATE from `skills/.../shared/scripts`, so the two copies can drift.

## 5. Time and helpers

- Whole run: about 14 minutes wall clock, from reading the packet to `finish` (STATE: 10.7 minutes since close-intake).
- Helper agents started: 7. One builder check, five claim checkers (rounds 1 to 3 in facts-and-words, rounds 4 and 5 after the review fixes), one reviewer (sonnet). No research helpers: no web research, as asked.
- Not paused; `STATE resume --continue` was not needed.
