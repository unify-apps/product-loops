Module: Orders · Round 2 · For: Bloom & Co counter and phone staff who check what is still to make, add an order, and mark it done when it goes out
Verdict: All round-1 fixes landed and the whole job still works at 1440 and 375 px; only small polish is left.

Walk (headless, 1440 and 375, fresh storage): Add order (1) → empty Save: status "Some details are missing. See the messages below." + inline messages, focus on Customer name → fill name, what to make, time (date defaults to today), pick Delivery → Save asks for the address → fill address → Save: "Order for Jane Test added.", focus on the status line, To do 7→8, row "Today / 15:30 · Autumn bouquet… · Jane Test · Delivery to 5 Park Street… · 07700 900 123 · £35.00 · Mark done" (7 steps). Mark done: 1 click → "Order for Jane Test marked done. Undo", row at the top of Done. Undo from the status line: 1 click, no scroll → "Order for Jane Test is back in To do." Undo from the Done row also works. Reload keeps it. All marked done → "Nothing left to make. Every order has gone out." Cancel closes the form. CLICKS: pass, 9 clicks, 0 dead, 0 page errors, no placeholders. 0 console errors in the walk. No horizontal scroll at 375 (scrollWidth 375). Font sizes: 5 (28, 20, 16, 14, 13). requests.md R1–R5 all present.

Round-1 fixes checked:
- Status line: 0 px tall and 0 margin when empty; 16 px above "To do" when shown. Landed.
- Due column: "Today" / "Tomorrow" / "Sat 28 Nov" over the time, no year. Landed.
- Undo in the status line after Mark done, brand colour, underlined. Landed.
- Radios in brand colour. Landed.
- "·" before the phone inside the no-wrap span: landed, but see P3 1.
- 720 px and below: row button spans the row and starts left; nav pill hidden. Landed. Side bar padding: see P3 2.
- Focus moves to the status line after Mark done, Undo and Save (no visible ring; Tab goes to its Undo). Landed.
- Sub line "Thursday 26 Nov 2026", no count. Landed.

P1: 0

P2: 0

P3: 4
1. The phone now starts a new line with a leading "·" when the meta line wraps (Mohammed Rahman row at 1440: "…Bristol BS10 5NB" / "· 07588 270 941"; at 375 also Ellie Bancroft, Lucy Pennington, Sarah Whitfield). · Fix: in `row()`, put the phone next to the name and the way after it: `esc(o.customer) + (o.phone ? ' <span class="o-nw">· ' + esc(o.phone) + '</span>' : '') + ' · ' + way` so the wrap falls inside the address, not before the phone.
2. The slimmer side bar padding never applies: the second `@media (max-width: 720px)` block sets `.side { padding: 16px }` after the first block's `.side { padding: 12px 16px }`. · Fix: merge the two 720 px blocks into one and keep `.side { border-right: 0; border-bottom: 1px solid var(--line); padding: 12px 16px; }`.
3. The status-line Undo is a 16 px tall tap target at 375 px. · Fix: `.o-link { padding: 8px 4px; margin: -8px 0; }` (keeps the line height, grows the hit area).
4. At 375 the Mark done button just tapped keeps its hover look (brand text and border) on the next row that slides under the finger (Priya row in walk-m-marked.png). · Fix: wrap `.o-btn:hover` and `.o-btn-main:hover` and `.o-link:hover` in `@media (hover: hover) { … }`.

Round-1 P3 3 (Cancel discards a half-typed order with no warning) and P3 4 (a past due time can be saved, no "late" marker) are still open; not repeated as findings.

Proposals (taste or structure; the main session picks and builds):
- The Done row's "Undo" could read "Back to To do", since there it is not undoing the last action but moving an older order back.
- The 160 px due column is mostly empty at 1440; 120 px would give the item text more room.

Shots: shots/orders-round2/orders.png, walk-d-list.png, walk-d-form.png, walk-d-empty.png, walk-d-noaddr.png, walk-d-added.png, walk-d-marked.png, walk-d-undone.png, walk-d-alldone.png, walk-m-list.png, walk-m-form.png, walk-m-empty.png, walk-m-noaddr.png, walk-m-added.png, walk-m-marked.png, walk-m-undone.png, walk-m-alldone.png
Clicks: reviews/orders-round2-clicks.json
