Module: Orders · Round 1 · For: Bloom & Co counter and phone staff who check what is still to make, add an order, and mark it done when it goes out
Verdict: The whole job works on one page at 1440 and 375 px (add with checks, see it in the list, mark done, undo, survives reload, empty state); what is left is spacing, the date wording, and phone-width layout.

Walk (headless, 1440 and 375): Add order (1 click) → empty Save shows 3 inline messages + status line, focus on Customer name → fill name, what, time, pick Delivery (date defaults to today) → Save asks for the address → fill address → Save: "Order for Jane Test added.", row sorted into To do, count 7→8 (about 7 steps). Mark done: 1 click, row moves to the top of Done (struck through), count drops. Undo: 1 click, but only after scrolling to the Done group. Reload keeps it. Marking all done shows "Nothing left to make. Every order has gone out." CLICKS: pass, 9 clicks, 0 dead, 0 page errors, no placeholders. requests.md R1–R5 all present. No horizontal scroll at 375.

P1: 0

P2: 7
1. Empty status line leaves a dead gap, then crowds the list when filled: `.o-status` has `min-height: 20px; margin: 0 0 8px` and is always rendered, so with no message there is ~40 px blank between `.o-sub` and "To do", and with a message it sits 8 px above "To do (7)" (see walk-d-marked.png). · Fix: render `<p class="o-status">` only when `state.status` is not empty (keep an empty `role="status"` node with `min-height:0`), and set `.o-status { margin: 0 0 16px; }`; set `.o-sub { margin: 0 0 24px; }` unchanged.
2. Due column shows the date raw and twice: "Today" over "26 Nov 2026, 14:00" (year and date repeat the day word). · Fix: in `when()`, return text `14:00` for Today/Tomorrow and `Sat 28 Nov, 11:00` otherwise (drop the year); render as `<span class="o-day">Today</span>14:00`.
3. Undo after Mark done is far away: the only Undo is in the Done group at the bottom, below 7+ rows, so a mis-click needs a scroll to fix. · Fix: after Mark done, render the status as `Order for <name> marked done. <button class="o-btn o-link" data-undo="<id>">Undo</button>` (a text-style button in `--brand`), keeping the Undo in the Done row.
4. Radio buttons are the browser's default blue ("Pickup" / "Delivery" in the form). · Fix: add `.o-way input[type=radio] { accent-color: var(--brand); }`.
5. Meta line wraps with a dangling "·" at line end (Mohammed Rahman row at 1440: "…BS10 5NB ·" then "07588 270 941"). · Fix: put the separator inside the no-wrap span: `'<span class="o-nw">· ' + esc(o.phone) + '</span>'` and join `way` and phone with a space, not `' · '`.
6. At 375 px the Mark done / Undo button floats mid-row (it lands in column 1, right-aligned against the price column), not lined up with anything. · Fix: in the `@media (max-width: 720px)` block add `.o-row .o-btn { grid-column: 1 / -1; justify-self: start; }`.
7. At 375 px the side bar becomes a 110 px band holding only the brand and a single "Orders" pill that repeats the page title. · Fix: in the 720 px media block add `.nav { display: none; } .side { padding: 12px 16px; } .brand { margin: 0; }`.

P3: 4
1. Keyboard focus is lost after Mark done, Undo, Save and Cancel (focus goes to `<body>` because the view re-renders). Focus the status line (`tabindex="-1"`) or the Add order button after each render.
2. `.o-sub` "Thursday 26 Nov 2026 · 7 to make" repeats the count in "To do (7)"; make it "Thursday 26 Nov 2026".
3. Cancel throws away a half-typed order with no warning; ask "Discard this order?" only when a field has text.
4. A new order can be saved with a time already past today; no "late" marker exists anywhere in To do.

Proposals (taste or structure; the main session picks and builds):
- Split To do into "Today", "Tomorrow" and later headings instead of a day word on every row; staff scan by day.
- Show a small "Delivery" / "Pickup" tag in the due column so the van run can be read down one column.
- Put Add order's form in a right-side panel at 1440 px so the list does not jump down when it opens.

Shots: shots/orders-round1/orders.png, walk-d-form.png, walk-d-empty.png, walk-d-noaddr.png, walk-d-added.png, walk-d-marked.png, walk-d-alldone.png, walk-m-list.png, walk-m-form.png, walk-m-empty.png, walk-m-noaddr.png, walk-m-added.png, walk-m-marked.png, walk-m-alldone.png
