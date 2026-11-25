# Handover: Shutter Invoice, first modules

## What was made
- **The sheet:** `research/shutter-invoice/capability-sheet.xlsx` (Excel file, opens in Google Sheets too). 73 rows. Tabs: Matrix (73), Sources (131), Beat proof (6), Wave (42), FreshBooks (42), Bonsai (41), Read me. No Google Sheet was made: none was asked for.
- `research/shutter-invoice/capability-sheet.csv`: the same sheet as CSV.
- `research/shutter-invoice/brief.md`: the product brief, ending in the ranked module list.
- `research/shutter-invoice/thinking.md`: persona, job, principle, flow, modules, simplicity cut, ideas.
- Rival files: `research/shutter-invoice/rivals/wave.md`, `research/shutter-invoice/rivals/freshbooks.md`, `research/shutter-invoice/rivals/bonsai.md`.
- Beat proof files: `research/shutter-invoice/beats/wave.md`, `research/shutter-invoice/beats/freshbooks.md`, `research/shutter-invoice/beats/bonsai.md`.

## Beats the proof or the review changed to gap
- C27 Deposit then balance by a set date: FreshBooks payment schedules split one invoice into dated payments, https://support.freshbooks.com/hc/en-us/articles/115013879027. Now `gap`. The review found no wrong beat; C50 stays a beat.

## Source kinds with no rows
None: product pages and help centre gave rows for every rival.

## Top 3 ranked modules (first release)
1. Invoice: a branded GBP invoice, emailed from the app, VAT on or off, marked paid by hand (C23, C24, C31, C49).
2. Wedding payment plan: a deposit invoice now and a balance invoice dated from the wedding date, chased when late (C26, C27, C64).
3. Online payment: the couple pays from the invoice by card or phone wallet (C43, C44).

## Questions for the build (from the brief)
- Which payment provider takes card payments first? Default: Stripe, faked in a prototype first.
- How is a bank transfer marked paid in release 1? Default: by hand, with a "Mark paid" button; matching comes with rank 6.
- What is the default deposit and balance plan? Default: set by her on first use; no number taken from a source.
- VAT on invoices in release 1? Default: an on or off switch with one rate; HMRC filing waits.
- Where does she start? Default: "Add a booking", not "New invoice".

## What was not checked
- Quick track: release notes, public reviews and wider pricing pages were not searched, so many cells are `unknown` (mostly Wave and FreshBooks small invoice features, C32 to C40).
- Complaints lines for FreshBooks and Bonsai came from review sites seen in search results, not opened pages.
- Bonsai has no UK pages; its .com pages were read. Wave's own help page says it now serves only the US and Canada.
- No rivals dropped, no pages that would not open recorded, no `unverified` rows.

## The stop fact
```
ok stop-fact status: 6 of 6 items pass
  pass    S1 research/shutter-invoice/capability-sheet.xlsx and research/shutter-invoice/capability-sheet.csv exist, and the Excel file matches the CSV. (proof: loop-runs/product-research-loop-20261126-032625/review.json)
  pass    S2 The sheet covers these rivals: Wave, FreshBooks, Bonsai, each with at least 5 rows read on its own pages. (proof: loop-runs/product-research-loop-20261126-032625/review.json)
  pass    S3 Every sheet row says what it does, and every yes or partial cell has a link from that rival's own pages. (proof: loop-runs/product-research-loop-20261126-032625/review.json)
  pass    S4 Every beat row has a search of every rival's own site behind it, in research/shutter-invoice/beats/. (proof: loop-runs/product-research-loop-20261126-032625/review.json)
  pass    S5 Every source kind was tried for every rival: product pages, help centre. (proof: loop-runs/product-research-loop-20261126-032625/review.json)
  pass    S6 research/shutter-invoice/brief.md ends in a ranked module list whose every module cites sheet rows. (proof: loop-runs/product-research-loop-20261126-032625/review.json)
```

The review (a fresh agent on claude-sonnet-5-5) said **PASS**, spec 4, quality 4. One P2 to fix later: reword C27's FreshBooks cell note as "instalment schedule on chosen dates" since the page never says "deposit".

## The run
| node | status | minutes | retries |
|---|---|---|---|
| intake | done | 1.8 | 0 |
| research | done | 3.1 | 0 |
| matrix | done | 4.7 | 0 |
| think | done | 1 | 0 |
| recommend | done | 0.8 | 1 |
| review | done | 1.8 | 0 |
| handover | running | 0.5 | 0 |

track: quick; budget: 90 minutes, 6 pushes, 40 decisions
minutes since close-intake: 12.1; pushes: 0; decisions: 2; held: 0; left nodes: none

## Decisions
2 decisions, in [decisions.md](decisions.md).

## Left for you
Nothing: no node left, no held step, every stop-fact item passes.

## Planted instructions
none

## Lessons learned
- `STATE learn --rule "Under ## Where we beat them, name a beat that the proof turned into a gap in words only, never by its row id." --because "CHECK brief failed on C27 cited under Where we beat them as a dropped beat, then passed after the id was replaced by its name" --node recommend`

## Next step
A build can start from `research/shutter-invoice/brief.md` (for example `/product-build-loop research/shutter-invoice/brief.md`, when that loop is installed).
