# Review one module: Orders, round 1

You review one module of a web prototype. You did not build it. Change no file (except your own report and the
review files named below). Never run loop-state.mjs. Nobody will answer questions.
The `design-review` skill is not installed (checked ~/.claude/skills and .claude/skills), so use the checks below.

- Brief: `/private/tmp/claude-501/-Users-harshalkotti--claude-spares-spare-81Mfoj/44c366c7-da1f-48f6-b2fa-e04f993e0a17/scratchpad/smokework/build/loop-runs/product-build-loop-20261126-032655/brief.md`. Module: `Orders`, must have: a list of orders; add order; mark done.
  Persona: the shop staff at Bloom & Co (a florist in Bristol) who take orders by phone or at the counter; they come to
  see what is still to make, add a new order, and mark it done when it goes out.
- Quick track: Orders is one page, `#/orders`, list state only by design; add and mark done work inside that page.
  A missing detail, create or empty route is not a finding.
- Links: `/private/tmp/claude-501/-Users-harshalkotti--claude-spares-spare-81Mfoj/44c366c7-da1f-48f6-b2fa-e04f993e0a17/scratchpad/smokework/build/loop-runs/product-build-loop-20261126-032655/links/orders.md`. Product files: `/private/tmp/claude-501/-Users-harshalkotti--claude-spares-spare-81Mfoj/44c366c7-da1f-48f6-b2fa-e04f993e0a17/scratchpad/smokework/build/order-board/index.html` (the server at http://127.0.0.1:4400/ is
  already running; do not start another).
- Run `node "/private/tmp/claude-501/-Users-harshalkotti--claude-spares-spare-81Mfoj/44c366c7-da1f-48f6-b2fa-e04f993e0a17/scratchpad/repo/product-loops/skills/product-build-loop/scripts/check-clicks.mjs" /private/tmp/claude-501/-Users-harshalkotti--claude-spares-spare-81Mfoj/44c366c7-da1f-48f6-b2fa-e04f993e0a17/scratchpad/smokework/build/loop-runs/product-build-loop-20261126-032655/links/orders.md --out /private/tmp/claude-501/-Users-harshalkotti--claude-spares-spare-81Mfoj/44c366c7-da1f-48f6-b2fa-e04f993e0a17/scratchpad/smokework/build/loop-runs/product-build-loop-20261126-032655/reviews/orders-round1-clicks.json --shots
  /private/tmp/claude-501/-Users-harshalkotti--claude-spares-spare-81Mfoj/44c366c7-da1f-48f6-b2fa-e04f993e0a17/scratchpad/smokework/build/loop-runs/product-build-loop-20261126-032655/shots/orders-round1 --tools /private/tmp/claude-501/-Users-harshalkotti--claude-spares-spare-81Mfoj/44c366c7-da1f-48f6-b2fa-e04f993e0a17/scratchpad/smokework/build/loop-runs/product-build-loop-20261126-032655/tools` yourself and open every shot it prints.
- Walk the persona's main job in this module, step by step, from the code and the shots: add an order (try an empty
  form, then a full one with Delivery), see it in the list, mark it done, undo. Count the steps. Note every dead end and
  every thing they would need but cannot find. You may drive the page in a headless browser yourself (playwright-core is
  installed under `/private/tmp/claude-501/-Users-harshalkotti--claude-spares-spare-81Mfoj/44c366c7-da1f-48f6-b2fa-e04f993e0a17/scratchpad/smokework/build/loop-runs/product-build-loop-20261126-032655/tools`) to take extra screenshots at 1440 px and 375 px wide; save any to
  `/private/tmp/claude-501/-Users-harshalkotti--claude-spares-spare-81Mfoj/44c366c7-da1f-48f6-b2fa-e04f993e0a17/scratchpad/smokework/build/loop-runs/product-build-loop-20261126-032655/shots/orders-round1/`.
- Check the list below. Write findings to `/private/tmp/claude-501/-Users-harshalkotti--claude-spares-spare-81Mfoj/44c366c7-da1f-48f6-b2fa-e04f993e0a17/scratchpad/smokework/build/loop-runs/product-build-loop-20261126-032655/reviews/orders-round1.md` in the format below.

## What to check

P1 (fix before anyone sees it):
- A click that opens nothing, a page error, placeholder text, a must-have that is missing.
- A must-have that people do (vote, add notes, sign up) can only be looked at, not done.
- The persona's main job cannot be finished in the module, or needs a step that is not there.
- Text cut off or overlapping, a page that is blank at 1440 px wide.
- A request line from `/private/tmp/claude-501/-Users-harshalkotti--claude-spares-spare-81Mfoj/44c366c7-da1f-48f6-b2fa-e04f993e0a17/scratchpad/smokework/build/loop-runs/product-build-loop-20261126-032655/requests.md` for this module that is ticked but not in the product.

P2 (fix in this run when the fix is clear):
- Uneven gaps, text not aligned to text, more than 5 font sizes, a box inside a box.
- Words the persona would not use, labels that say the obvious, a description nobody needs.
- Data shown raw: "2026-10-15", an id, true/false. A link or button in the browser's default blue or grey.
- A toggle whose label does not say the current state (a "Not going" button next to "5 going").
- A list row that does not say what it is, what proves it, and what to do next.
- A missing empty state or a missing way back.

P3 (polish): anything else, short.

## Format

```
Module: <name> · Round <n> · For: <persona in one line>
Verdict: <one plain sentence>
P1: <count>
1. <what is wrong, where (selector, route or text)> · Fix: <the exact change>
P2: <count>
1. ...
P3: <count>
Proposals (taste or structure; the main session picks and builds): ...
```

Each finding is one problem and one exact fix: a selector and a value, a text and its rewrite, or a pattern and
the pattern that replaces it. At most 15 findings. Group repeats.
