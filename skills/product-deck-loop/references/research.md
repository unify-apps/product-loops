# Research: the company, its industry, the people

Start up to 3 helper agents at once, one per part. Give each the brief below with the part filled in. Helpers
use WebSearch and WebFetch. They never ask the person anything.

## Helper brief (copy, fill the parts in angle brackets)

> You research <part> for a <meeting kind> meeting with <company> (<website>). The reader is <roles>.
> Our side offers: <need 6, one line>.
> Find facts that a slide could use. Prefer, in order: the company's own filings and results, its own site and
> press releases, then well-known news and trade sources. Use nothing older than 3 years unless it is history.
> Write `<OUT>/research/<part>.md`: first a list of facts, then 5 short lines on what this means for the meeting.
> Each fact is one line in this exact shape:
> `- [public] <the fact, one sentence, with its number and year> | <the exact page link> | <date of the source>`
> `- [estimate] <the fact> | how: <how it was worked out, from which public facts>`
> Copy every number exactly as the source gives it. Open the page before you cite it: a search result alone is
> not a source. Cite a link that opens with WebFetch. When a company site refuses, cite the same document on
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

Write `OUT/facts.json` in this shape. Ids are `f1`, `f2` and so on.

```json
{"facts": [
  {"id": "f1", "kind": "public", "text": "Revenue in 2024 was $3.1 billion, up 4%", "value": "$3.1B",
   "source": "https://example.com/results-2024", "date": "2025-02-12"},
  {"id": "f2", "kind": "estimate", "text": "A 2% cut in stock-outs is worth about $9M a year", "value": "$9M",
   "how": "2% of the $450M of sales lost to empty shelves (f4). To check in the meeting."},
  {"id": "f3", "kind": "from-person", "text": "They run two stock systems after the merger"}
]}
```

- `kind` is `public`, `estimate` or `from-person`. A public fact needs `source` (a link). An estimate needs `how`.
- `text` holds every number that a slide will show, written as the slide writes it (or as close as can be).
  The figure check looks for each slide number in the text or `value` of the facts that slide cites.
- Facts from the person's node 1 answers and files are `from-person`.

## Check

`DECK facts --dir OUT` prints PASS: every fact has an id and text, every public fact has a link, every estimate a
`how`. Then open 3 public links at random with WebFetch and confirm the number is on the page. Write each of the 3 to
`OUT/research/spot-check.md` (link, number, found or not). Fix or drop a fact that does not match, then run
`DECK facts` again.
