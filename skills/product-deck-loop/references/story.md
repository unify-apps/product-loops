# Story: one idea per slide, in an order the reader follows

## Pick the order from the meeting kind

| Meeting | Order of the main slides |
|---|---|
| First meeting | 1. What is changing in their industry. 2. What it means for this company, with its own numbers. 3. Where the openings are. 4. How we help, one slide per opening. 5. Proof: a customer or a number we can stand behind. 6. A small next step |
| Leadership | 1. The answer in one line. 2. What it is worth in money: more revenue or lower cost. 3. The plan, ranked by value. 4. What it takes from them. 5. The ask |
| Technical buyer | 1. Their systems and where they strain today. 2. How our product works, step by step. 3. How it connects to their systems. 4. Data, security and control. 5. A pilot plan with what it will prove |
| Sent to read | The first-meeting order, but every slide must stand alone: full-sentence titles, a little more text, no slide that only works when spoken to |

A start deck's own order wins when the person said "add to it" or "edit it". New slides then go where the brief
says, or next to the slide they extend.

A one-pager is one page: the claim as the title, then 3 or 4 blocks (where they are, what we offer, proof, next
step). A brochure is 4 to 8 pages, one topic a page. A web page is the first-meeting order as full-width sections.

## Rules for every slide

- One idea per slide. If the title needs "and", it is two slides.
- The title is a claim the slide proves, in under 60 characters so it fits one line. "Online orders grew 18%
  in 2024", not "Market overview".
- Each slide leads to the next. Read the titles alone, in order: they must tell the whole story.
- Every line cites the fact ids from `facts.json` that say it. No fact, no claim.
- Read every fact on a topic before a slide states it. Use the newest figure for each measure, and never state
  something another fact says otherwise.
- Talk about their business and their money: revenue, cost, risk, time. Our product comes after their problem.
- Kept start-deck slides count toward the slide count. A slide the person asked to keep is never cut.
- The last main slide is a concrete ask: what we propose, what we need from them, how long, and how both sides
  will judge it worked. Every part of it comes from need 6 or the person's answers.
- Over the count: move the weakest slides to the appendix. Never delete content the person gave.

## Write the story

`OUT/story.md`, one line per slide:

```
1. [main] Shorter waits at every store | why we asked for the meeting
2. [main] Acme in 2024: a $3.1B business | their size and where it grows (f1, f2, f3)
...
9. [appendix] Who we are | kept: start deck slide 2
```

Then `OUT/deck.json` (format in `build.md`). Set `slide_count` to the brief's range, for example `[8, 12]`.
