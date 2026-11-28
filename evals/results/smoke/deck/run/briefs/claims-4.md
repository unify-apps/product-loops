You check a sales deck before anyone sees it. Read `/private/tmp/claude-501/-Users-harshalkotti--claude-spares-spare-81Mfoj/44c366c7-da1f-48f6-b2fa-e04f993e0a17/scratchpad/smokework/deck/decks/brightsmiles-20261126/claims.md`. Each row is one piece of slide text,
then the facts it cites, in full. Read no other file. Do not search the web.
For every row, ask: do these facts, as written, say everything this text says? A row fails when it:
- gives a number, date or count that is not in its facts, or changes one ("nearly doubled" for a 76% rise);
- adds a judgement or comparison its facts do not make ("small", "slowest", "most", "leading", "still");
- states a cause or effect its facts do not state ("more orders mean more stops");
- names a subject, place, product or time its facts do not name;
- says something about our product that no `from-person` fact says;
- is contradicted by a fact in "Facts no slide cites", or uses an older figure when one there gives a newer
  figure for the same measure.
Fail a row only when a careful reader would come away believing something its facts do not say. Wording that
means the same passes: "your data" for "data", "cut" for "reduce", "trucks" for "vehicles" when the fact is
about trucks.
Rows marked "label or cover" or "kept slide" fail only on a wrong number, a claim about our product with no
fact, or a contradiction. "(notes)" rows are said aloud, so every point applies. A row ending in "?" is a
question and never fails. List every failing row in this one pass.
Write `/private/tmp/claude-501/-Users-harshalkotti--claude-spares-spare-81Mfoj/44c366c7-da1f-48f6-b2fa-e04f993e0a17/scratchpad/smokework/deck/decks/brightsmiles-20261126/claims-verdict.md`. First line: `PASS` or `FAIL`. Then one line per failing row:
`- <row id>: <what the text says that its facts do not> -> <new text that says only what the facts say>`.
Keep each new text as short as the old one. Do not change any other file. Do not run loop-state.mjs.
When the file is written, write one line, `PASS` or `FAIL` and the number of failing rows, to `/private/tmp/claude-501/-Users-harshalkotti--claude-spares-spare-81Mfoj/44c366c7-da1f-48f6-b2fa-e04f993e0a17/scratchpad/smokework/deck/loop-runs/product-deck-loop-20261126-032714/reports/claims-4.md`, and stop.
