# Research: the company, its industry, the people

Start up to 3 helper agents in ONE message, one per part, with `run_in_background` false: they run at the same
time and you wait for all of them. Give each the brief below with the parts filled in. Helpers use WebSearch and
WebFetch. They never ask the person anything.

## Helper brief (copy, fill the parts in angle brackets)

> You research <part> for a <meeting kind> meeting with <company> (<website>). The reader is <roles>.
> Our side offers: <need 6, one line>.
> Find facts that a slide could use. Prefer, in order:
> the company's own filings and results, its own site and press releases, then well-known news and trade
> sources. Use nothing older than 3 years unless it is history.
> Write `<OUT>/research/<part>.md`: first a list of facts, then 5 short lines on what this means for the meeting.
> Each fact is one line in this exact shape:
> `- [public] <the fact, one sentence, with its number and year> | <the exact page link> | <date of the source>`
> `- [estimate] <the fact> | how: <how it was worked out, from which public facts>`
> Write each fact as the source says it: copy every number exactly, keep its year and what it counts, and add no
> judgement ("small", "fast", "most", "nearly doubled") the source does not make. Open the page before you cite
> it: a search result alone is not a source. Cite a link that opens with WebFetch. When a company site refuses, cite the same document on
> a public filing site or a news wire. When two sources differ, give both. If you cannot find something, say so: never fill a gap.
> Do not run loop-state.mjs. Reply with the path of your file and the 3 facts that matter most.

The parts:

| Part | What to find |
|---|---|
| company | size (revenue, people, sites), how it makes money, its parts, last 12 months of news, stated plans and goals, the systems and vendors it names in public |
| industry | what is changing in the industry, with numbers; what peers are doing; rules and costs that press on it |
| people | for each named person: role, time in role, past roles, public talks, posts or interviews about their work. Work-related and public only. No home, family or private details |

Skip the people helper when need 2 has no names.

## Merge into facts.json

Write `OUT/research/person.md` yourself, in the same line shape: one `- [from-person] <fact> | <where it came from>`
line for each fact the person gave (their answers, their notes) and for each thing we may claim (need 6, one line
each, copied from the claim file). Then run `DECK merge-facts --dir OUT`. It reads every `OUT/research/*.md`,
numbers the facts `f1`, `f2` and so on (the person's first), writes `OUT/facts.json`, and runs the facts check.
Read `OUT/facts.json` once, for the story. Do not retype facts by hand.

```json
{"facts": [
  {"id": "f1", "kind": "from-person", "text": "A pilot takes 7 weeks: 2 weeks to connect data, 4 weeks planning one region, 1 week to review", "where": "what-we-can-claim.md"},
  {"id": "f2", "kind": "public", "text": "Revenue in 2024 was $3.1 billion, up 4%", "source": "https://example.com/results-2024", "date": "2025-02-12"},
  {"id": "f3", "kind": "estimate", "text": "A 2% cut in stock-outs is worth about $9M a year", "how": "2% of the $450M of sales lost to empty shelves (f4). To check in the meeting."}
]}
```

- `kind` is `public`, `estimate` or `from-person`. A public fact needs `source` (a link). An estimate needs `how`.
- A fact you add later (an estimate the story needs) goes as a new line in `OUT/research/added.md`, which is read
  last, so every id already in use stays the same. Then run `merge-facts` again. Never edit `facts.json` by hand.

## Check

`DECK merge-facts --dir OUT` prints PASS: every fact has an id and text, every public fact has a link, every
estimate a `how`. A line it could not read is named: fix its shape and run it again. Then open 3 public links at
random with WebFetch and confirm the number is on the page. Write each of the 3 to `OUT/research/spot-check.md`
(link, number, found or not). Fix or drop a fact that does not match (in its research file), then run
`DECK merge-facts` again.
