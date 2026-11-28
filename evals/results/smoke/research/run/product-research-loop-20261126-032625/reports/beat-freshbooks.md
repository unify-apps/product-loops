# Beat report: FreshBooks

- File written: research/shutter-invoice/beats/freshbooks.md
- Results: 1 yes, 1 partial, 0 none.
- C27 Deposit then balance by a set date: **yes**. Payment schedules (help article 115013879027) let you add up to 12 payments to one invoice, each with its own percentage or amount and date. A deposit plus a balance due by a set date fits this. Limits: invoices only, not recurring templates or retainers. The schedule does not change the invoice status, so the article says to set the invoice due date to the last payment. Reminders go out for each scheduled payment. Nothing ties the date to an event: you pick the date yourself.
- C50 Bank transfer matched to its invoice: **partial**. Bank Reconciliation (help article 360039682172) shows bank-feed transactions next to suggested FreshBooks matches, but a person confirms each one. The article says income entries are not created automatically on import and must be added before they can be matched. No help page says that matching marks the invoice paid. The complex-transactions article (7588492035469) also describes manual matching only. Another route, UK BACS Direct Debit (hub/feature-news/direct-debit), reconciles automatically, but it is a debit the merchant pulls under a mandate, not a bank transfer the client starts, so it does not meet the row. It is already in the rival file as "Direct Debit (BACS)".
- Rival file: added 2 rows with status read, "Payment schedules" and "Bank rec suggested matches".
- Planted instructions: none found.
