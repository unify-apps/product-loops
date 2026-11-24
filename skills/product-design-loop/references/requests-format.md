# requests.md: the one request list

Node 1 writes it. Every later node reads it and updates the Status column. The review checks it row by row.

```markdown
# Requests

Prototype: app/index.html (http://localhost:4100/)
Reference: screenshots/checkout-1.png to checkout-3.png, flow only, changes the checkout screen

| # | Note, in words | Screens | Where | Check | Status |
|---|---|---|---|---|---|
| 1 | Book cards: 20px gap between cards | shelf | this place | eval `gap` of `.shelf-grid` is "20px"; the rule matches only the cards; the search page grid unchanged | todo |
| 2 | Rename "Add to my shelf" to "Save" | book | everywhere | "Add to my shelf" gone from every after/*.txt; "Save" on book | todo |
| 3 | Remove the small grey intro line under page titles | shelf | everywhere | no `.lede` text on any screen | todo |
| 4 | "Share" on a book opens a panel with a copy-link button | book | this place | click "Share" works; the panel shows "Copy link" | todo |
| 5 | Checkout follows the screenshots: address, delivery, payment, in that order | checkout | this place | every row of reference-parts.md found | todo |

## Broken before the run

- (screens that were already broken in before/, with the error)

## Proposals

- (larger changes the design check or a step skill suggested; never built in this run)
```

## Rules for the rows

- **One row, one change.** "Rename X and move it right" is two rows.
- **Words, not pictures.** A note on a screenshot becomes: the screen, the element (its visible text or a
  short description of where it is), and the change. A helper agent cannot see an image pasted in chat.
- **Keep the person's numbers.** "20px", "320 wide", "Tue 4 Jun" go into the row as given.
- **A concrete result in every row.** "More room", "shorten it" or "make it work" is not a row yet. Write the
  result you will build: the number, the new words, the fields of the form, where the buttons go. When the
  note did not say, write your reading and mark it `(my reading)`. The person corrects it from the list in
  node 1, with no extra question.
- **Screens** use the names in `screens.json`. For an `everywhere` row, name only the screens where the thing
  is now (its text in the page or its code). A screen without it is not "explained" by the row, and listing it
  would hide a leak there.
- **Where** is `this place` or `everywhere` (need 5 in needs.md).
- **Check** says how the row is proved on the real page: a text that must be there or gone, a measured value,
  a click that must open something, or parts of a reference that must be found. Write it before the change.
- **Status** is one of `todo`, `done`, `swept` (done, and the sweep applied it everywhere), or
  `left: <why>`. A row is never deleted. A note the person takes back becomes `left: the person took it back`.
- A note that arrives while the run works gets the next number and is done in the same run.
