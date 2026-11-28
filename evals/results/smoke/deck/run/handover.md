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
