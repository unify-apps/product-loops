# Facts and words: the built-in pass

The word pass below is used when no `write-factual-content` skill is installed. When the working folder's
`CLAUDE.md` has writing rules, they win over these. The claim checker at the end always runs, skill or not.

## Facts first

Every line on a new slide cites the facts that say it (format in `build.md`). For each line, read its facts and ask:
do these facts say this line, all of it?

- A number with no fact: find the fact, or cut the number.
- A claim about what our product does: it must be a `from-person` fact from need 6. If not, cut it or narrow it.
- A guess about the company: keep it only as a question for the meeting ("Do stores still count stock by hand?"),
  or as an estimate fact with its `how`, labelled "our estimate" on the slide.
- An estimate on a slide says so in its label or text.
- Never make a claim stronger than its fact: "up to", "about", "in one pilot", "at 2026 prices" stay in.
- No judgement the facts do not make: "small", "slowest", "most", "fast", "nearly doubled", "record". Give the
  number instead.
- No cause the facts do not state: "more orders mean more stops" needs a fact that says so.
- Titles and speaker notes count. A title states only what the slide's facts say.

## Plain words

- Lead with the point. Name who does what: "Store staff count stock by hand", not "Stock counting is a challenge".
- Everyday verbs: counts, reads, checks, sends, cuts, saves. Keep real product and company names.
- No metaphors, slogans or keynote phrases ("unlock", "supercharge", "journey", "next-gen", "seamless").
- No "not X, it is Y" contrasts, no em dashes, no exclamation marks.
- Short sentences. A point on a slide is one line, two at most.
- Titles state the takeaway. "Empty shelves cost more than extra stock", not "Cost drivers".
- Use the company's own words for its parts and products, as its site and filings write them.

## Write down each change

`OUT/words.md`, one row per change:

| Slide | Before | After | Why |
|---|---|---|---|
| 3 | Unlock smarter stock | Count stock each night, by store | metaphor |
| 6 | Cuts stock-outs by 20% | Cut stock-outs by 6% in one pilot | no fact for 20% |

## The claim checker

1. `DECK claims --dir OUT` writes `OUT/claims.md`: every line of every new slide, each followed by the full text of
   the facts it cites, and every line of each kept slide, next to what we may claim. It prints FAIL when a line that states something cites no fact, or cites an id that is not
   in `facts.json`. Fix those first.
2. Start one helper agent with the Agent tool, `run_in_background` false, with the brief below. It reads only
   `claims.md`: no pictures, no web. It did not write the slides, so it reads them as the reviewer will.
3. Its answer is `OUT/claims-verdict.md`. On FAIL, change each named row in `deck.json`: use its new text as given
   (shorten it if it no longer fits), or cut the row, or make it a question. A kept-slide row (`s5.k2`) changes
   through a `replace` swap on that `keep` slide; write it down with `STATE decide`, as the person asked to keep
   the slide. Add each change to `words.md`, run `DECK claims` again, and start a new helper.
   Each new helper is one `STATE retry facts-and-words`.

> You check a sales deck before anyone sees it. Read `<OUT>/claims.md`. Each row is one piece of slide text,
> then the facts it cites, in full. Read no other file. Do not search the web.
> For every row, ask: do these facts, as written, say everything this text says? A row fails when it:
> - gives a number, date or count that is not in its facts, or changes one ("nearly doubled" for a 76% rise);
> - adds a judgement or comparison its facts do not make ("small", "slowest", "most", "leading", "still");
> - states a cause or effect its facts do not state ("more orders mean more stops");
> - names a subject, place, product or time its facts do not name;
> - says something about our product that no `from-person` fact says;
> - is contradicted by a fact in "Facts no slide cites", or uses an older figure when one there gives a newer
>   figure for the same measure.
> Everyday words for the same thing pass: "your data" for "data", "cut" for "reduce".
> Rows marked "label or cover" or "kept slide" fail only on a wrong number, a claim about our product with no
> fact, or a contradiction. "(notes)" rows are said aloud, so every point applies. A row ending in "?" is a
> question and never fails. List every failing row in this one pass.
> Write `<OUT>/claims-verdict.md`. First line: `PASS` or `FAIL`. Then one line per failing row:
> `- <row id>: <what the text says that its facts do not> -> <new text that says only what the facts say>`.
> Keep each new text as short as the old one. Do not change any other file. Do not run loop-state.mjs.

Then `DECK check --dir OUT --only figures,claims` must print PASS. The claims check passes only when
`claims-verdict.md` says PASS and is newer than `claims.md`, and `claims.md` matches the slides' words now. So a
word changed later, in any node, needs `DECK claims` and a new checker again.
