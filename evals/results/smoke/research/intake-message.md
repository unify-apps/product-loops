# Brief: Shutter Invoice, first modules (draft)

Goal: decide the first modules of Shutter Invoice, a simple invoicing tool for freelance photographers in the UK, by studying Wave, FreshBooks and Bonsai on their product pages and help centres.

## Facts
- The ask (word for word): "first modules for a simple invoicing tool for freelance photographers, vs Wave, FreshBooks and Bonsai. quick: 3 rivals, product pages and help centre only."
- From the working folder's CLAUDE.md: the product is "Shutter Invoice"; "We sell to freelance photographers in the UK. Persona: a wedding photographer who invoices 3 clients a week."
- Start check: WebSearch for the category returned 16 results; WebFetch of waveapps.com returned text (Wave: accounting, invoicing, payments, payroll for small businesses and freelancers; its page names Canadian payroll, no UK).
- No earlier runs of this loop, no lessons yet.

## Needs
| # | Need | Value |
|---|---|---|
| 1 | Decision | The first modules to build, ranked in build order (default: the ask says "first modules", not a matrix) |
| 2 | Product | Shutter Invoice: a simple invoicing tool. Category: invoicing for freelancers (from CLAUDE.md and the ask) |
| 3 | Persona | A UK wedding photographer who invoices 3 clients a week; uses it and pays for it (from CLAUDE.md) |
| 4 | What we have today | Nothing yet, a new product: every row is gap or beat (default) |
| 5 | Rivals | Wave, FreshBooks, Bonsai (named) |
| 6 | Market | UK (from CLAUDE.md) |
| 7 | Sources | Public pages only, no sign-in, no trial. KINDS = "product pages, help centre" (the ask: "product pages and help centre only") |
| 8 | Depth | Up to 12 pages and 40 features per rival (default) |
| 9 | Fixed and refused | None (default) |
| 10 | First release size | Rank every module; the top 3 are the first release (default) |
| 11 | Rival names in the brief | Keep real names (default) |
| 12 | Where to save | OUT = research/shutter-invoice/ (default) |
| 13 | Sharing | No; files stay on this laptop (default) |
| 14 | Groups | None given: plain words chosen from what the rivals show (default). GROUPS: none, so --groups is left out |
| 15 | Sheet file | capability-sheet.xlsx and capability-sheet.csv; no Google Sheet (default) |
| 16 | How bold | Both: catch-up modules first, plus at least 3 ideas no rival has (default) |

Track: quick (3 rivals, 2 source kinds; beat proof and review still run).

## Coverage scan
| Topic | Mark | Why |
|---|---|---|
| Scope | clear | first modules, 3 named rivals, 2 source kinds |
| Who and their job | clear | CLAUDE.md names the persona and her volume |
| Data and facts | clear | rivals' public pages |
| Main flow | partial | the invoicing flow comes from the rivals and the think node |
| Edge cases | partial | e.g. deposits and balances for weddings; found in research |
| Look | n/a | no screens made |
| Outputs | clear | sheet (xlsx, csv), thinking.md, brief.md in OUT |
| Done signal | clear | stop fact below |
| Words with no number | partial | "simple": taken as the simplicity cut keeping at most 3 modules in the first release |

Lessons applied: none yet.
Budget: 90 minutes.

## Done means
1. research/shutter-invoice/capability-sheet.xlsx and research/shutter-invoice/capability-sheet.csv exist, and the Excel file matches the CSV.
2. The sheet covers these rivals: Wave, FreshBooks, Bonsai, each with at least 5 rows read on its own pages.
3. Every sheet row says what it does, and every yes or partial cell has a link from that rival's own pages.
4. Every beat row has a search of every rival's own site behind it, in research/shutter-invoice/beats/.
5. Every source kind was tried for every rival: product pages, help centre.
6. research/shutter-invoice/brief.md ends in a ranked module list whose every module cites sheet rows.

About 60 minutes and 8 helper agents, within a budget of 90 minutes.

1. Quick or full track?
   Recommended: quick — 3 rivals, product pages and help centre only, as you asked. Full would add release notes, pricing and public reviews, and up to 5 rivals.
   Why it matters: full reads about twice as many pages and finds features the marketing pages leave out.
2. How bold: catch up with the rivals, ideas no rival has, or both?
   Recommended: both — catch-up modules fill the first release, and the brief lists at least 3 ideas no rival has, ranked 4 and below.
   Why it matters: it decides whether the top of the ranked list is the safe invoicing core or a new way to do the job.
3. Which country's pages do we read for each rival?
   Recommended: the UK page wherever one exists; else the .com page, with a US- or Canada-only feature marked partial and noted.
   Why it matters: Wave's page names Canadian payroll and no UK, so VAT, GBP and card-payment cells change with the page.
4. Can a new idea take a first-release slot?
   Recommended: only one the wedding flow cannot work without, such as a deposit invoice followed by a balance invoice; that one may take slot 3, with the reason.
   Why it matters: the first release is the top 3 modules.
5. What counts as a module for a "simple" invoicing tool?
   Recommended: the sheet keeps every rival feature, but only invoicing-close modules are ranked (clients, quotes and invoices, getting paid, reminders, deposits, VAT on invoices); accounting, payroll and tax filing go under "Later and cut".
   Why it matters: it decides which of the rivals' many products can reach the ranked list.

Reply with your answers, or just "go" to use the defaults.
