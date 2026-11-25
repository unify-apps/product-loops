# Shutter Invoice: what to build first

Date: 2026-11-26. Decision: the first modules to build, ranked in build order. Persona: a UK freelance wedding photographer who invoices 3 clients a week. Market: UK.
Rivals studied: Wave, FreshBooks, Bonsai (product pages and help centres, quick track). Sheet: capability-sheet.csv (73 rows; Excel copy capability-sheet.xlsx).

## Bottom line
Build a wedding payment plan first: an invoice, a deposit and balance dated from the wedding date, and online payment. That is the first release (ranks 1 to 3).
FreshBooks is the only rival of the three that fits a UK photographer today; Wave has stopped invoicing outside the US and Canada, and Bonsai prices in USD.
Our clearest edge, once the core is in: bank transfers matched to their invoice with no one ticking them off (C50, the one row the beat proof kept).

## Persona and job
A freelance wedding photographer in the UK, working alone, who invoices 3 couples a week; she uses the tool and pays for it. Her couples (and sometimes a parent) pay; her accountant gets the year's totals.

1. A couple enquires about their wedding date.
2. She sends a price, usually one of her packages, and they accept it.
3. She invoices a deposit to hold the date.
4. The balance falls due a set time before the wedding.
5. The couple pays, by bank transfer or by card.
6. She sees who has paid and chases who has not.
7. At year end her totals go to her accountant or her tax return.

## Principle
**Every screen answers one question: has this couple paid what is due before their wedding?**

## What the rivals do
| Category | What most rivals have | Where they are weak |
|---|---|---|
| Invoices | Branded invoices, recurring invoices, deposits (C23, C25, C26) | Wave cannot email invoices outside the US and Canada (C31); deposit-then-balance is full only at FreshBooks (C27) |
| Payments | Card payment from the invoice (C43) | UK bank payment: only FreshBooks has Direct Debit, Wave and Bonsai name ACH (C45); Wave online payments are US and Canada only |
| Reminders | Automatic overdue reminders (C64) | Wave reminders are US and Canada only |
| Quotes | Quotes, online approval (C59, C60) | Package choice only at Bonsai (C62) |
| Tax | Tax worked out on the invoice (C24) | HMRC VAT returns only at FreshBooks (C67); Bonsai's tax add-on is US only (C70) |
| Accounting, payroll, time | Books, bank import, payroll, time tracking (C01, C03, C57, C72) | Far more than a photographer invoicing 3 couples a week needs |

## Where we beat them
- C50 Bank transfer matched to its invoice: Wave merges a bank line with an invoice payment only after she marks the invoice paid by hand (https://support.waveapps.com/hc/en-us/articles/4988928647188); FreshBooks suggests matches but a person confirms each one (https://support.freshbooks.com/hc/en-us/articles/360039682172); Bonsai leaves offline payments unpaid and records them by hand. The beat proof ran 3 searches per rival on each rival's own site and help centre, and opened 3 to 4 pages each.
- What was looked at and dropped: deposit then balance by a set date (sheet row in Invoices, now a gap) was a beat until the proof found FreshBooks payment schedules (https://support.freshbooks.com/hc/en-us/articles/115013879027). It is now a gap; what is still different is that no rival page ties the dates to the wedding date.

## Ideas no rival has
1. Balance date set from the wedding date, and moved with it when the date moves. Pain: a balance not chased before the wedding (from C27). No rival page read ties payment dates to an event; they use dates the user types.
2. Bank transfers matched to invoices with no one confirming (C50). Pain: evenings spent ticking off transfers. Rivals rely on bank feeds plus a person confirming, which needs no partner for instant bank data.
3. A pay-by-bank button on the invoice (UK Open Banking), with amount and reference filled in (from C45). Not seen on any rival page read; Wave and Bonsai are built around US ACH.
4. One booking, two payers: the couple and a parent each get an invoice for their share. Pain: parents often pay part (persona, not a sourced fact). No rival page read shows it.

## Later and cut
- Later: Quotes and packages (rank 4: price agreed by email at first), Couples list (rank 5: the booking list does it first), Bank transfer matching (rank 6: needs an Open Banking provider), VAT and year-end export (rank 7), Contracts with e-signature (rank 8), Prints and extras (rank 9), Phone app (rank 10: the web page works on a phone first).
- Cut, because none changes a payment decision for a wedding: double-entry books (C01), payroll (C57), time tracking and billing (C72, C73), deals pipeline (C11), suppliers and purchase orders (C19), team members (C71), retainers (C29). Every one stays in the sheet.

## Not sure yet
- Quick track only: release notes, pricing pages beyond what was opened, and public reviews were not searched, so many cells are `unknown`, mostly for Wave and FreshBooks small invoice features (C32 to C40).
- Complaints lines in the rival files came from review sites seen in search results, not opened pages (FreshBooks, Bonsai).
- Wave's UK status: its own help page says it now serves only the US and Canada (C31); its feature cells are kept as the pages state them, with US- and Canada-only features marked partial.
- Bonsai has no UK pages; its .com pages were read (C43, C45).
- No `unverified` rows: every rival row was read on its page in this run.

## Questions for the build
- Which payment provider takes card payments first? Default: Stripe, since FreshBooks and Bonsai both build on it (C43); fake it in a prototype.
- How is a bank transfer marked paid in release 1? Default: by hand, with a "Mark paid" button (C49); matching comes with rank 6.
- What is the default deposit and balance plan? Default: a deposit due on booking and the balance a set number of weeks before the wedding, both set by her on first use; no number is taken from a source.
- VAT on invoices in release 1? Default: an on or off switch with one VAT rate, since not every photographer is VAT-registered (C24); HMRC filing waits (C67).
- Where does she start? Default: "Add a booking" (couple, wedding date, price), not "New invoice".

## Ranked modules
| Rank | Module | What it does | Must have | Job step | Matrix rows | How we beat or match | First release |
|---|---|---|---|---|---|---|---|
| 1 | Invoice | A clear branded invoice in GBP, emailed from the app and marked paid | Add my logo and bank details; make an invoice with lines and total, VAT on or off; email it to the couple; mark it paid by hand | 3, 4 | C23, C24, C31, C49 | Match: all rivals brand invoices; unlike Wave it emails in the UK | yes |
| 2 | Wedding payment plan | Each booking gets a deposit invoice now and a balance invoice dated from the wedding date, chased when late | Add a booking with couple and wedding date; deposit and balance made for me; balance sent on its date; reminder when late; dates move when the wedding moves | 3, 4, 6 | C26, C27, C64 | Match FreshBooks payment schedules, plus dates set from the wedding date (idea 1) | yes |
| 3 | Online payment | The couple pays from the invoice by card or phone wallet | Pay by card from the invoice; Apple Pay or Google Pay; invoice marked paid when the card payment lands; card provider faked first, then Stripe | 5 | C43, C44 | Match FreshBooks; Wave online payments are US and Canada only | yes |
| 4 | Quotes and packages | She sends a package price the couple accepts online, and it becomes the booking | Pick one of my packages; send the quote; couple accepts with one click; accepted quote becomes the booking | 2 | C59, C60, C61, C62 | Match Bonsai packages and FreshBooks quote to invoice | no |
| 5 | Couples | One page per couple with the wedding date, invoices and what is still owed | List of couples by wedding date; each couple's invoices and payments; what is still owed | 1, 6 | C07, C08 | Match: Wave and FreshBooks keep client histories | no |
| 6 | Bank transfer matching | A bank transfer is matched to its invoice and marked paid with no one confirming | Connect my bank (Open Banking provider, faked first); transfer with the invoice reference marks it paid; unmatched transfers listed to pick by hand | 5, 6 | C50, C45 | Beat: rivals need a person to confirm each match (C50) | no |
| 7 | VAT and year-end export | VAT on invoices and the year's totals for her accountant | VAT rate on invoices when registered; export the year's invoices and payments as a file | 7 | C69, C39, C67 | Match the basics; HMRC filing stays with her accountant for now | no |
| 8 | Contracts | The couple signs her contract online with the deposit | Attach my contract to a booking; couple signs online; signed copy stored | 2 | C13, C14 | Match Bonsai | no |
| 9 | Prints and extras | Albums and prints added to a couple's invoice | Add an extra with its price to a booking; it appears on the next invoice | 2, 3 | C18 | Match FreshBooks and Bonsai billable expenses | no |
| 10 | Phone app | Check who has paid and send a reminder from a phone | See bookings and what is owed; send a reminder; mark paid | 3, 6 | C41 | Match: Wave and FreshBooks invoice from the phone | no |
