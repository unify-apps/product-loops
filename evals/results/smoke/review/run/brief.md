# Brief: product review of clinic/index.html

Goal: review the Northside Physio prototype (`clinic/index.html`) screen by screen as its user, fix every P1 problem in place, and re-review until no P1 is left.

## Facts
- The person's words: `/product-loops:product-review-loop review clinic/index.html, fix mode, P1 only`
- The product: `clinic/index.html`, one static HTML file with hash routes (found in the message). No server: the walk serves it itself.
- No `CLAUDE.md`, README or PRD in the folder. No earlier runs of this loop. No `design-review` or `product-design` skill found.
- Start check: Node 25.9.0 ok, browser Google Chrome found. The file exists.

## Needs
| Need | Value | Source |
|---|---|---|
| Prototype | `clinic/index.html` | found: the message |
| Screens | all 4 the nav reaches: Today, Clients, Invoices, Settings (`RUN/screens.json`) | default: `walk.mjs --find-screens` |
| Who uses it and their job | a front-desk receptionist at a small physio clinic, who checks today's appointments and books new ones | default: a guess from the screens' words ("Today", "New appointment") |
| Fix or report | fix, in place, a copy of every changed file in `RUN/original/` | found: the message ("fix mode") |
| Bar | P1 only (`--bar P1`). P2 and P3 are listed, never fixed | found: the message ("P1 only") |
| Own rules | the built-in checklist only | default: no CLAUDE.md or review skill found |
| Track | full (phone width 390 px checked as well as 1440 px) | default: the ask does not say quick |
| Where the result goes | `handover.md` in the run folder; nothing deployed or sent | default |

## Coverage scan
| Topic | Mark | Why |
|---|---|---|
| Scope | clear | the one file, its 4 nav screens |
| Who and their job | partial | no brief file; guessed from the screens |
| Data and facts | clear | sample data in the file |
| Main flow | partial | Today, then New appointment; guessed |
| Edge cases | clear | the checklist covers empty, error, cut-off states |
| Look | clear | keep the product's own CSS tokens |
| Outputs | clear | the fixed file, findings.md, fixes.md, handover.md |
| Done signal | clear | the stop fact below |
| Words with no number | clear | "P1 only" is defined by the checklist |

## Lessons applied
none yet

Budget: 60 minutes

## Done means
1. Every one of the 4 screens in `RUN/screens.json` has a before and a last after screenshot.
2. After the last walk, a fresh agent found no open P1 on any screen.
3. Every P1 not fixed is marked "your call" in `RUN/findings.md`, with one plain sentence.
4. Every finding at or above the bar (P1) is fixed, or marked with its reason.
5. Every changed file has its original in `RUN/original/`.

## The person's answers
The person replied "go": every default below is taken.
1. Track: full (bar P1, walk at 1440 px and 390 px).
2. Persona: a front-desk receptionist at Northside Physio who checks today's appointments and books new ones.
3. "New appointment" (dead button on Today): the smallest working result with what the product has (a line that says what happened); a new booking form is not built and stays the person's call.
4. "Booking policy" Lorem ipsum in Settings: marked your call with one plain sentence; no policy text is made up.
5. Own rules: the built-in checklist only.
