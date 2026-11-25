# What each node needs

Node 1 reads this file. For each need: fill it from the places in "Look first", in that order. Ask only for what
is still empty, in one message, with the default shown. "go" takes every default.

## First: what the deck is for

Needs G1 to G3 come before every other need. Every later node builds to them, and the review checks them first.
Unless the ask states the goal in words, the goal is question 1 of the message, with 3 to 5 options written for
this company and this reader, each one line saying what the deck would hold. Pick the default from the reader's
role and say why in a few words. Typical options, to adapt, never to copy:

- An outside-in view: what is changing in their industry, what it means for them, where the openings are.
- A plan for them: what they should do, ranked by impact, each item tied to more revenue or lower cost.
- A vision the reader can retell to their own boss: why now, what good looks like, the first steps.
- A pitch: their problem, how our product solves it, proof, a next step.
- A technical walk-through: their systems, how ours connects, a pilot plan.

| # | Need | Used by | Default | Look first |
|---|---|---|---|---|
| G1 | The goal: what the reader should believe or do after the deck, in one sentence, and which option above | story, review, stop fact | the option that fits the reader's role, named in question 1 | the ask ("help me form a view", "pitch", "roadmap", "guide her") |
| G2 | The angle and shape: the one idea the deck argues, and whether to follow the usual order for the meeting kind or a different one | story | the order in `story.md` for the goal | the ask, `CLAUDE.md` |
| G3 | The real audience: who the reader must convince next, and what that person cares about (money, risk, speed) | story, review | the reader alone | the ask ("for her CEO", "she will share it") |

| # | Need | Used by | Default | Look first |
|---|---|---|---|---|
| 1 | The company: its name, and its website when the name is common | research, story | none: ask when the ask does not name it | the ask, file names, a start deck's title slide |
| 2 | Who is in the meeting: names, roles, public profile links | research, story, review | roles unknown: write for a senior business reader | the ask, pasted notes, a meeting notes file |
| 3 | The meeting kind: first meeting, leadership, technical buyer, or sent to read (no one presents) | story, review | first meeting | the ask ("intro", "CTO", "send to") |
| 4 | The start deck, and what to do with it: edit it, add slides to it, or build new in its look; which of its slides to keep | build | a deck file in the folder: build new in its look and keep the slides that fit (say which). No deck: build new | the ask, deck files in the folder, `CLAUDE.md` |
| 5 | Slide count, and what goes to the appendix | story, check | first meeting or leadership 8 to 12; technical buyer 10 to 15; sent to read 8 to 12; extras to an appendix. A one-pager is 1 page, a brochure 4 to 8 | the ask ("about 10", "max 20") |
| 6 | What we offer, and what we may claim: products, customers, numbers we can stand behind, things we must not say | story, facts-and-words | only what the start deck, the folder's files and `CLAUDE.md` say; nothing more | start deck, `CLAUDE.md`, product files in the folder |
| 7 | Facts only the person knows about the company: its systems, the deal so far, what it said it needs | research, story | none | the ask, meeting notes, a call transcript in the folder |
| 8 | Output: format (slides, one-pager, brochure, web page) and files (HTML deck, editable PowerPoint, PDF, a private claude.ai Artifact) | outputs | slides; HTML deck and editable PowerPoint; PDF too when sent to read; no Artifact | the ask |
| 9 | Where the files go | all | `decks/<company short name>-<yyyymmdd>/` in the working folder | the ask |
| 10 | The look: fonts and colours, or "plain" | build | the start deck's look (from `OUT/start/slides.md`); else the look in `CLAUDE.md`; else plain: Arial, dark text on white, one dark blue accent | start deck, `CLAUDE.md` |
| 11 | Things to lead with or leave out: a product, a topic, a competitor not to name | story | none | the ask, `CLAUDE.md` |
| 12 | Product pictures to use (screenshots, diagrams) | build | none: no made-up product screens | files in the folder the ask names |

## Set without asking

- Slides are 16:9. A one-pager or brochure is A4 portrait, or US Letter when the company or the person is in the
  US or Canada.
- Speaker notes on each slide hold what to say and the fact ids used.
- A Sources slide at the end of the appendix lists every fact used, with its link or how it was worked out.
- No footers, page counters or small labels over titles.
- The start deck file is never changed. A changed copy is made in `OUT/out/`.
- People research uses only public, work-related information. Nothing private about a person goes on a slide.

## Questions for a weak ask

Ask these when the ask has fewer than 3 of needs 1 to 5. G1, the goal, is always the first of them. Example of a
weak ask and a full one:

- Weak: "need a deck for the X meeting".
- Full: "First meeting with X's head of operations next Tuesday. Give her a plan ranked by what it saves, that she
  can take to her COO. Start from our-deck.pptx and keep its slides 2 and 4. Research X, its industry and her
  public talks. About 10 slides, extras in an appendix. Mark every figure as public or our estimate. HTML deck and
  an editable PowerPoint."
