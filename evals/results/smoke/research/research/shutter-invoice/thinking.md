# Shutter Invoice: thinking

## Persona
- A freelance wedding photographer in the UK who invoices 3 clients a week (CLAUDE.md). She works alone; she uses the product and pays for it.
- What she uses today is not given by any source. The bar is set by the rivals she could pick: FreshBooks is the only one of the three that is UK-ready (GBP prices, Direct Debit, MTD VAT: C45, C67); Wave has stopped invoicing by email outside the US and Canada (C31); Bonsai prices in USD only.
- Her words: booking, enquiry, package, deposit (or retainer, as many UK photographers say), balance, the wedding date, the couple.
- If it is wrong: a balance is not chased before the wedding, she shoots unpaid, or she spends evenings matching bank transfers to invoices by hand.
- Others who touch it: the couple (gets the quote and invoices, pays); sometimes a parent who pays part; her accountant at year end.

## The job
1. A couple enquires about their wedding date.
2. She sends a price, usually one of her packages, and they accept it.
3. She invoices a deposit to hold the date.
4. The balance falls due a set time before the wedding.
5. The couple pays, by bank transfer or by card.
6. She sees who has paid and chases who has not.
7. At year end her totals go to her accountant or her tax return.

The product covers steps 2 to 6. Step 1 (enquiry forms, C10) and step 7 (books and tax, C01, C67) stay in other tools for now; step 7 gets an export.

## What this really is
Not an accounting app with invoices on the side. It is a payment plan for each wedding.
The one thing underneath: a booking is a couple plus a wedding date plus a price, paid in parts by dates set from that wedding date.

## Principle
**Every screen answers one question: has this couple paid what is due before their wedding?** A feature that does not help answer it waits.

## Flow
1. First use: she adds her name, logo and bank details, and her usual plan (for example 25% deposit, balance 6 weeks before). Empty state: "No bookings yet. Add your first couple."
2. She adds a booking: the couple's names and email, the wedding date, the package and price.
3. The product has already made the plan: a deposit invoice now and a balance invoice dated from the wedding date. She checks it and sends the deposit invoice.
4. The couple opens the invoice, pays by card or by bank transfer using the reference on it.
5. A bank transfer arrives; she marks it paid by hand in release 1 (matching from the bank comes later, C50). The booking shows "Deposit paid".
6. The balance invoice goes out by itself on its date; a reminder follows if it is late (C64).
7. Change of plan: the wedding date moves, so the balance date moves with it. A cancelled wedding: she writes off what is unpaid (C37).
8. Error: an email bounces, so the booking shows "Not delivered" with the address to fix.

## Modules

| Module | Job step it serves | Matrix rows | Why the persona needs it |
|---|---|---|---|
| Invoice | 3, 4 | C23, C24, C31, C49 | She must send a clear, branded invoice and mark it paid |
| Wedding payment plan | 3, 4, 6 | C26, C27, C64 | Deposit and balance dates come from the wedding date, and late balances are chased for her |
| Online payment | 5 | C43, C44, C45 | Couples pay from the invoice without typing bank details |
| Quotes and packages | 2 | C59, C60, C61, C62 | She sends a package price and it becomes the booking with one click |
| Couples | 1, 6 | C07, C08 | One place per couple: their date, invoices and what is still owed |
| Bank transfer matching | 5, 6 | C50, C03 | Couples paying by transfer must be ticked off by hand today; matching ends the evening of ticking off payments |
| VAT and year-end export | 7 | C67, C69, C39 | A VAT-registered photographer needs VAT on invoices and totals for her accountant |
| Contracts | 2 | C13, C14 | Many photographers sign a contract with the deposit |
| Prints and extras | 2, 3 | C18 | Albums and prints are sold on top of the package |
| Phone app | 3, 6 | C41 | She checks who has paid away from her desk |

## The simplicity cut
- **Keep** (first release): Invoice, Wedding payment plan, Online payment. With these she can book, bill and get paid end to end.
- **Later**: Quotes and packages (for now she agrees the price by email), Couples (the booking list does this at first), Bank transfer matching (needs an Open Banking provider; hand marking first), VAT and year-end export, Contracts, Prints and extras, Phone app (the web page works on a phone first).
- **Cut**: double-entry books (C01), payroll (C57), time tracking and time billing (C72, C73), deals pipeline (C11), suppliers and purchase orders (C19), team members (C71), retainers (C29): none changes a decision she makes about a wedding's payments. They stay in the sheet.
- Depth before breadth: three complete modules, not ten thin ones.

## Ideas
1. Balance date set from the wedding date, and moved with it when the date moves. From C27: FreshBooks splits an invoice into dated payments and Bonsai schedules an invoice, but no rival page ties the dates to an event.
2. Bank transfers matched to invoices with no one confirming. From C50, the one beat row: Wave and FreshBooks need a person to confirm each match, Bonsai none.
3. A pay-by-bank button on the invoice (UK Open Banking), so a couple pays by transfer with the right amount and reference filled in. From C45: Wave and Bonsai name only ACH; FreshBooks has Direct Debit. Not seen on any rival page read.
4. Split a payment between two payers (the couple and a parent), each with their own invoice for their share. From the persona's "a parent who pays part"; no rival page read shows it.
