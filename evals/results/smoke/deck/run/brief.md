# Brief: first-meeting deck for Bright Smiles Dental

The person replied "go": every default below is taken.

## Goal, angle, real audience
- **Goal (G1):** a pitch. After the deck, Priya Nair (COO of Bright Smiles Dental) believes Clinic Scheduler can cut her no-shows (about 9% of appointments today) and agrees to a small pilot in a few of her clinics. (default, taken with "go")
- **Angle (G2):** no-shows are a cost she already named; text reminders and a waitlist that fills cancelled slots cut them (our 3 pilot clinics: 8% to 5% in 3 months); a pilot in her own clinics proves it. Usual first-meeting order from story.md. (default)
- **Real audience (G3):** Priya Nair alone; nobody named she must convince next. (default)
- **Reader:** Priya Nair, COO of Bright Smiles Dental since March 2026, a senior business reader.

## The ask (person's words)
"a short HTML deck (6 to 8 slides) and PDF for a first meeting with the COO of Bright Smiles Dental, a 40-clinic UK chain, about our clinic scheduler. Use only the facts in facts.md, no web research. Quick track."

## Facts (facts.md, the only source; no web research)
- Bright Smiles Dental runs 40 clinics in England and Wales (the person, from their website visit 20 Nov 2026).
- Their COO is Priya Nair, joined March 2026 (the person).
- They told us no-shows run at about 9% of appointments (the person, intro call).
- Our product: Clinic Scheduler. Online booking, text reminders, a waitlist that fills cancelled slots (our product page, internal).
- In our 3 pilot clinics no-shows fell from 8% to 5% in 3 months (our pilot report, internal, estimate).
- Price: £120 per clinic per month (our price list).

## Needs
| # | Need | Value | Default? |
|---|---|---|---|
| 1 | Company | Bright Smiles Dental, 40 clinics in England and Wales | from the ask |
| 2 | Who is in the meeting | Priya Nair, COO since March 2026 | from facts.md |
| 3 | Meeting kind | first meeting, presented live; speaker notes hold what to say | default |
| 4 | Start deck | none in the folder: build new | from the folder |
| 5 | Slide count | 6 to 8 main slides; Sources in an appendix | from the ask |
| 6 | What we may claim | only facts.md's product, pilot and price lines | from facts.md |
| 7 | Facts only the person knows | no-shows about 9%; 40 clinics; COO since March 2026 | from facts.md |
| 8 | Outputs | slides; deck.html and deck.pdf; no PowerPoint; no Artifact | from the ask (quick) |
| 9 | Where | decks/brightsmiles-20261126/ | default |
| 10 | Look | plain: Arial, dark text on white, one dark blue accent | default |
| 11 | Lead with / leave out | lead with no-shows; name no competitor | default |
| 12 | Product pictures | none; no made-up screens | default |
| Q3 | The ask on the last slide | a pilot in a few of her clinics at the list price of £120 per clinic per month; clinic count, length and start date to agree together; no invented terms | default |
| Q4 | Money | percentages only; the cost of no-shows is a question to size together with her appointment numbers | default |
| Q6 | Track | quick | from the ask |

## Coverage scan
| Topic | Mark | Why |
|---|---|---|
| Scope | clear | 6 to 8 slides, HTML and PDF, facts.md only |
| Who and their job | clear after go | COO; pitch toward a pilot |
| Data and facts | partial | 6 facts; no appointment counts or value per visit: cost of no-shows not sized (Q4 default) |
| Main flow | clear | first-meeting order |
| Edge cases | n/a | a deck |
| Look | missing | plain default |
| Outputs | clear | deck.html, deck.pdf |
| Done signal | clear | stop fact below |
| Words with no number | clear | "short" = 6 to 8 slides |

## Lessons applied
none yet

## Budget
Budget: 90 minutes

## Done means (the stop fact)
1. The deck does what the goal says for Priya Nair, COO of Bright Smiles Dental: she believes Clinic Scheduler can cut her no-shows (about 9% today) and agrees to a small pilot in a few of her clinics.
2. These files are in decks/brightsmiles-20261126/out/ and open: deck.html, deck.pdf.
3. The main slide count is 6 to 8.
4. deck.py check --dir decks/brightsmiles-20261126 prints PASS on every check, after the last change.
5. Every line on a slide cites facts that say it, each with a source link, an estimate note or the person's word.
6. Every finding of an earlier review round is fixed, or left with why, in decks/brightsmiles-20261126/review-fixes.md (none on the first round).
