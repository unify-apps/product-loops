# Facts and words: the built-in pass

Use this when no `write-factual-content` skill is installed. When the working folder's `CLAUDE.md` has writing
rules, they win over these.

## Facts first

For every slide, read each claim and ask: which fact in `facts.json` backs this?

- A number with no fact: find the fact, or cut the number.
- A claim about what our product does: it must be in need 6 (what we may claim). If not, cut it or narrow it.
- A guess about the company: keep it only as a question for the meeting ("Do stores still count stock by hand?"),
  or as an estimate fact with its `how`, labelled "our estimate" on the slide.
- An estimate on a slide says so in its label or text.
- Never make a claim stronger than its fact: "up to", "about", "in one pilot" stay in.
- Check sentences, not only numbers. The script checks numbers only. "They bought a rival last year" needs a
  fact as much as "$3.1B" does. Every step of a plan we offer ("we run it next to your plan") must be in need 6.

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

Then `DECK check --dir OUT --only figures` must print PASS.
