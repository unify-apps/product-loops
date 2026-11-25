# Build one module: Orders

You build one module of a web prototype. Nobody will answer questions, so decide and write down why.
Never run loop-state.mjs. Never deploy, publish, push or commit anything.

- Product folder: `/private/tmp/claude-501/-Users-harshalkotti--claude-spares-spare-81Mfoj/44c366c7-da1f-48f6-b2fa-e04f993e0a17/scratchpad/smokework/build/order-board`. Files you may change: `/private/tmp/claude-501/-Users-harshalkotti--claude-spares-spare-81Mfoj/44c366c7-da1f-48f6-b2fa-e04f993e0a17/scratchpad/smokework/build/order-board/index.html`. In this shared file, change only
  the parts for this module (its render function in `MODULES.orders`, its CSS, its data) and keep every other part as it is
  (header, navigation, router). You may add CSS rules for the Orders page.
- The brief: `/private/tmp/claude-501/-Users-harshalkotti--claude-spares-spare-81Mfoj/44c366c7-da1f-48f6-b2fa-e04f993e0a17/scratchpad/smokework/build/loop-runs/product-build-loop-20261126-032655/brief.md`. The module: `Orders`, must have: a list of orders; add order; mark done.
  The persona: the shop staff at Bloom & Co (a florist in Bristol) who take orders by phone or at the counter; they come to
  see what is still to make, add a new order, and mark it done when it goes out.
- Requests for this module: R2 a list of orders; R3 add order; R4 mark done; R5 keep it to one page.
- **Quick track: the list state only, no other routes.** Orders is one page at `#/orders`. Add order and mark done work
  inside that page (for example an add form or panel that opens on the same page, and a Mark done button on each row).
  Do not add `#/orders/<id>`, `#/orders/new` or `#/orders/empty` routes.
- Decided in the brief (the person said "go" to these defaults):
  - Mark done: the order moves to a muted "Done" group under the "To do" orders, with an Undo button. When nothing is
    left to do, the To do part says so in one line.
  - Saved in this browser only (localStorage, every read and write wrapped in try/catch; the page still works when
    storage is blocked), starting from 8 sample orders.
  - Required fields to add: customer name, what to make, due date and time; the address only when Delivery is picked.
    Phone, price (in £, a number 0 or more) and note are optional. A missing field shows a short message on the page.
  - Order fields: customer name, phone, what to make, price in £, due date and time, pickup or delivery (with address),
    a note, status (to do or done). To do is sorted by due time, soonest first.
- The look: brand colour #7A3E65, font Georgia (from the working folder's CLAUDE.md, already in the shell's CSS variables).
  The rest from the plain look below. No `product-design` or `write-factual-content` skill is installed
  (checked ~/.claude/skills and .claude/skills), so follow the plain look.

Rules:
1. Every thing that looks clickable opens real content: a form that saves, a menu that does what it says, a state change.
   Never a dead button, never "coming soon", never lorem ipsum or "TODO". Add order and mark done are working actions:
   the persona can do them and see the result. A button that needs a filled field shows a short message on the page when
   the field is empty, so the click is never silent.
2. Sample data the persona would recognise: 8 orders with real-looking Bristol names, phone numbers (07... or 0117...),
   dates and £ prices that agree with each other. Pin "today" to one fixed date in the data (Thursday 26 November 2026)
   so the demo looks the same on any day. Keep it in one data block for the module.
3. Hash route: only `#/orders` (the list) on this quick track.
4. Start from the plainest version that does the whole job. Leave out what does not help the persona decide or act.
5. No page error in the console. No file from the internet (no web fonts, no CDN).
6. Write every link of this module, one per line with what it shows, to `/private/tmp/claude-501/-Users-harshalkotti--claude-spares-spare-81Mfoj/44c366c7-da1f-48f6-b2fa-e04f993e0a17/scratchpad/smokework/build/loop-runs/product-build-loop-20261126-032655/links/orders.md`, using the base link
   `http://127.0.0.1:4400/`. Format: `- <what it shows>: http://127.0.0.1:4400/#/orders`.
7. Then run `node "/private/tmp/claude-501/-Users-harshalkotti--claude-spares-spare-81Mfoj/44c366c7-da1f-48f6-b2fa-e04f993e0a17/scratchpad/repo/product-loops/skills/product-build-loop/scripts/check-clicks.mjs" /private/tmp/claude-501/-Users-harshalkotti--claude-spares-spare-81Mfoj/44c366c7-da1f-48f6-b2fa-e04f993e0a17/scratchpad/smokework/build/loop-runs/product-build-loop-20261126-032655/links/orders.md --out /private/tmp/claude-501/-Users-harshalkotti--claude-spares-spare-81Mfoj/44c366c7-da1f-48f6-b2fa-e04f993e0a17/scratchpad/smokework/build/loop-runs/product-build-loop-20261126-032655/build/clicks-orders.json --shots
   /private/tmp/claude-501/-Users-harshalkotti--claude-spares-spare-81Mfoj/44c366c7-da1f-48f6-b2fa-e04f993e0a17/scratchpad/smokework/build/loop-runs/product-build-loop-20261126-032655/shots/orders --tools /private/tmp/claude-501/-Users-harshalkotti--claude-spares-spare-81Mfoj/44c366c7-da1f-48f6-b2fa-e04f993e0a17/scratchpad/smokework/build/loop-runs/product-build-loop-20261126-032655/tools`, fix what it names, and run it again until it says PASS.
   Open two or three of the shots and fix anything cut off or overlapping. The server is already running at
   http://127.0.0.1:4400/ and serves the product folder; do not start another.
8. Report (in your report file, at most 10 lines): the files changed, the links, the click result, the request lines done
   (by number), and each choice you made on your own.

## The plain look

- Font: Georgia (the brand font) for everything; sizes 13, 14, 16, 20, 28.
- White background, near-black text (#1a1a1a), grey for secondary text (#6b6b6b), hairlines (#e6e6e6).
- One accent colour (#7A3E65) for the main action and the selected item. Colour means something: status, danger, selected.
- A left navigation with the modules, a page header with the title and the one main action, then a list.
- Spacing on a 4 px grid. Equal gaps. Text aligned to text.
- Calm motion: 150 to 250 ms, no jumps, nothing moves the layout.
- No browser-default look: a link in text uses the accent colour, a button has the product's button style.
- Data as a person says it: "26 Nov 2026, 14:30", never "2026-11-26" or an id. Same for true/false and codes. Money as "£45.00".
