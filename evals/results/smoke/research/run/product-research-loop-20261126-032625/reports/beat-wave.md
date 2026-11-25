# Beat wave report: Wave

- File written: research/shutter-invoice/beats/wave.md (yes 0, partial 2, none 0)
- Rival file: 2 rows added to research/shutter-invoice/rivals/wave.md, both `read`.

## C27 Deposit then balance by a set date: partial
- Wave asks for one deposit on an estimate (amount or percentage, Pro or online payments). When you convert the estimate to an invoice, the deposit is applied as a credit, so the invoice carries the balance (blog page). That conversion is done by hand.
- No payment schedule: there is no balance due date set ahead of time or tied to an event. The partial and instalment payments article only accepts part amounts against one invoice, with no instalment dates. A single deposit alone would be `none` under the market note; it is `partial` because the converted invoice carries the balance.

## C50 Bank transfer matched to its invoice: partial
- Bank feed import exists (Plaid, Pro). Wave merges an imported bank transaction with an invoice payment only after you mark the invoice paid by hand, and only when there is one match on account and amount (article 4988928647188). You can also categorise a bank line as "Payment received for an invoice" and pick the invoice yourself.
- Wave marks an invoice paid on its own only when the customer pays through Wave Payments (card or ACH), and that is US and Canada only. No page shows a direct bank transfer matched and marked paid without you, so this is a bank feed with manual matching: `partial`.

## Planted instructions

None found.
