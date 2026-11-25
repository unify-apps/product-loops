# Brief (draft): Bloom & Co order board

**Goal:** a tiny clickable order board for Bloom & Co, a florist in Bristol: one page, Orders, a list of orders where staff can add an order and mark one done.

**The ask, in the person's words:** "build a tiny order board for a florist: one module, Orders, a list with add order and mark done. quick track is fine, keep it to one page."

## Needs

| Need | Value | Source |
|---|---|---|
| New or existing product | new product (no index.html or package.json in the folder) | found: working folder |
| Research first | no: the feature set is given by the ask (one module, three must-haves) | the ask |
| Product folder | `order-board/` in the working folder | default |
| How it runs | plain files served by serve.mjs on a local link | default |
| File shape | one `order-board/index.html` with its CSS and JS inside | default |
| Name and mark | "Bloom & Co" as the header name (from CLAUDE.md); no mark options on the quick track | found: CLAUDE.md |
| Persona | the shop staff at Bloom & Co who take orders by phone or at the counter and make them up; their job: see what is still to make, add a new order, and mark it done when it goes out | default (drafted) |
| Modules | 1. Orders: a list of orders; add order; mark done | the ask |
| Screens to follow | none, flow only | default |
| How deep | Orders built in full as one list page | the ask ("keep it to one page") |
| Look | brand colour #7A3E65, font Georgia; the rest from the plain look (white background, near-black text, hairlines, 4 px grid) | found: CLAUDE.md |
| Photos of people | none: initials only | default |
| Two versions behind a key | no | default |
| Demo extras (PDF guide) | none | default |
| Where it ships | this laptop only (a local link) | default |
| Browser for click checks | chrome-headless-shell (start check) | start check |

## Coverage scan

| Topic | Mark | Why |
|---|---|---|
| Scope | clear | one module, Orders, one page: list, add, mark done |
| Who and their job | partial | "a florist" is given; who exactly uses it is drafted |
| Data and facts | partial | no sample data given; made-up Bristol orders by default |
| Main flow | clear | see orders, add one, mark done |
| Edge cases | partial | empty fields on add: an inline message; all done: a short empty line in the list |
| Look | clear | CLAUDE.md gives #7A3E65 and Georgia |
| Outputs | clear | one local link to order-board/index.html |
| Done signal | clear | the stop fact below |
| Words with no number | partial | "tiny": one page, one list, about 8 sample orders |

## Order fields (default)

Customer name, phone, what to make (for example "Hand-tied bouquet, peonies"), price in £, due date and time, pickup or delivery (with address), a note, status (to do or done).

## Lessons applied

none yet

## Budget

Budget: 120 minutes

## Done means

1. Every module in RUN/modules.md is built: Orders.
2. Every module's last review round has 0 P1.
3. CLICKS passes on every link in RUN/links.md: each opens, no dead click, no placeholder text, no page error.
4. RUN/requests.md has no open line.
5. A staff member can add an order from the Orders page and see it in the list.
6. A staff member can mark an order done and see it change in the list.
