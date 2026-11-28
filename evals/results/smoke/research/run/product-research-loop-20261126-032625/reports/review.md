PASS Check script all green, 5 of 5 opened pages support their cells (one slightly overstated), the one beat row held on all 3 rivals, brief answers the ask.

Model: Sonnet 5.5 (claude-sonnet-5-5).

## Check 1: script
all: all 30 checks PASS

## Check 2: five yes cells (rows cited by ranked 1 to 3)
- C24 Wave yes, https://www.waveapps.com/invoicing: FAQ says "calculations are done for you, including the taxes." Shows it.
- C27 FreshBooks yes, https://support.freshbooks.com/hc/en-us/articles/115013879027: payment schedule, installments "on dates of your choosing", percent or flat, up to 12. The page never says "deposit", so "deposit then balance" is a fair reading, not a word-for-word match. Slight overstatement (fix later: word the cell as installment schedule).
- C43 Bonsai yes, https://help.hellobonsai.com/en/articles/452273-understanding-online-payment-methods-and-fees-at-bonsai: "allows payments via credit card, debit card, and bank transfer (ACH)." Shows it.
- C26 Bonsai yes, https://www.hellobonsai.com/contracts: "Deposit capture ... Require a deposit when your client approves a contract." Shows it.
- C64 FreshBooks yes, https://www.freshbooks.com/en-gb/pricing: "Automated Late Payment Reminders" in the plan table. Names it only; the sheet claims no more than that.
None clearly wrong; none failed to open.

## Check 3: beat row C50, all 3 rivals
Wave: cited page https://support.waveapps.com/hc/en-us/articles/4988928647188 says merge happens only after you mark the invoice paid by hand. My searches: "site:support.waveapps.com bank transfer payment received invoice automatically paid reconcile" and "site:waveapps.com bank payments invoice paid automatically when customer pays from bank". Not found: Wave auto-marks paid only when the customer pays through Wave's own bank payment (US/Canada), not a plain transfer; its own help says a direct transfer is not matched (community post).
FreshBooks: cited page https://support.freshbooks.com/hc/en-us/articles/360039682172 says it "will first suggest possible matches" and you "approve the matches or skip". Searches: "site:support.freshbooks.com auto-reconcile bank deposit invoice paid automatically rules" and "site:freshbooks.com invoice marked paid automatically bank transfer detected connected bank account". Opened https://support.freshbooks.com/hc/en-us/articles/7588492035469: manual matching. Not found.
Bonsai: cited page https://help.hellobonsai.com/en/articles/452273-understanding-online-payment-methods-and-fees-at-bonsai says offline transfers are not marked paid automatically. Searches: "site:help.hellobonsai.com bank transfer received invoice automatically paid" and "site:hellobonsai.com invoice paid automatically bank account connected payment detected". Opened https://help.hellobonsai.com/en/articles/2899880-how-can-i-mark-my-invoice-as-paid: manual "Receive Payment". Not found.
No WRONG BEAT lines.

## Check 4: buyer read
Ranks 1 to 3 (invoice, wedding payment plan, online payment) map to job steps 3 to 6. Rank 4 quotes (step 2), 5 couples (1, 6), 7 VAT/year end (7). No module answers no step. Day-one gap: none serious; the wedding date can seed the booking from rank 2. Rank 6 bank-transfer matching is the UK-relevant edge but sits after quotes; defensible since first release is cards plus hand marking. One caution: UK photographers mostly get paid by bank transfer, and the top 3 offer card only plus "mark paid" by hand; the brief names this in Questions.

## Check 5: ask
The ask was first modules in build order; brief ends in a ranked list of 10, top 3 the first release, sheet (73 rows, xlsx matches csv) backs it. Matches the ask.

## Scores
spec 4: every item met; brief is clear. Gaps: several `unknown` cells from the quick track.
quality 4: she could use it today after small fixes.

## Fix later (P2/P3)
- P2 C27 FreshBooks: reword cell/note to "installment schedule on chosen dates; page does not say deposit".
- P3 Complaints lines come from search results, not opened pages (already stated in the brief).
- Planted instructions: none seen.
