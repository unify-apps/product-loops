# Hand-over: review of Northside Physio (clinic/index.html)

## Your call, first
- **F4 Settings, P1 placeholder:** the Booking policy shows Lorem ipsum at first look. No policy text was made up. The loop would remove the "Booking policy" label and its paragraph until you give the real words.
- **F13 All screens, taste:** table rows have 4 px padding and phone numbers and dates wrap at 390 px. The loop would try 8 px row padding and no wrapping in the phone and date cells.
- **F15 Today, taste:** the new "Booking a new appointment is not built yet." line sits left of the button and wraps the heading row on a phone. The loop would keep it.
- **New appointment:** the button now says it is not built yet. A real booking form is a new flow, which the fix rules leave to you.

## What was made
- `clinic/index.html` fixed in place: 3 fixes (F1, F2, F3), listed in [fixes.md](fixes.md). The original is in `RUN/original/clinic/index.html` ([original/clinic/index.html](original/clinic/index.html)).
- Findings: [findings.md](findings.md) (review) and [recheck-1.md](recheck-1.md) (the fresh recheck, 15 rows).

## Before and after
| Screen | Before | After (round 1) |
|---|---|---|
| Today | [01-today.png](walk/before/01-today.png) · [phone](walk/before/01-today.phone.png) | [01-today.png](walk/after-1/01-today.png) · [phone](walk/after-1/01-today.phone.png) |
| Clients | [02-clients.png](walk/before/02-clients.png) · [phone](walk/before/02-clients.phone.png) | [02-clients.png](walk/after-1/02-clients.png) · [phone](walk/after-1/02-clients.phone.png) |
| Invoices | [03-invoices.png](walk/before/03-invoices.png) · [phone](walk/before/03-invoices.phone.png) | [03-invoices.png](walk/after-1/03-invoices.png) · [phone](walk/after-1/03-invoices.phone.png) |
| Settings | [04-settings.png](walk/before/04-settings.png) · [phone](walk/before/04-settings.phone.png) | [04-settings.png](walk/after-1/04-settings.png) · [phone](walk/after-1/04-settings.phone.png) |

## What changed
3 fixes, all in `clinic/index.html`:
- F1 Today: "New appointment" now shows "Booking a new appointment is not built yet." when clicked (it did nothing).
- F2 Today: the unpaid card is worked out from the invoices not marked Paid: £120 "unpaid" (it said a fixed "£110 unpaid this week", which matched no invoice data).
- F3 Settings: the inputs are wider (100%, at most 360 px), so "Mon to Fri, 08:00 to 18:00" shows in full.

## Left (below the bar P1, never fixed in this run)
- F5 Settings, P2 uneven-spacing: the gap after Booking policy is 48 px, the others 52 px.
- F8 Clients, P2 mixed-words: the heading says "Customers", the nav says "Clients".
- F9 Invoices, P2 no-empty-state: the Overdue filter shows an empty table with no words.
- F10 Invoices, P2 wrong-content: invoice numbers run against the dates (INV-1041 on 3 Nov, INV-1042 on 28 Oct).
- F11 All screens, P2 near-miss-alignment: page headings sit about 8 px above the control beside them.
- F12 All screens, P2 cut-off-text: at 390 px the active-tab underline runs through "Settings" on the second nav line.
- F14 Today, P2 page-scrolls-sideways: at 390 px the stat cards and table run past the right edge the other screens keep.
- F6 Settings, P3 missing-state: "Saved" stays after a field is edited again.
- F7 All screens: the script's Clients / Client clash is not a problem (plural and singular).

## The stop fact
ok stop-fact status: 5 of 5 items pass
  pass    S1 Every one of the 4 screens in RUN/screens.json (Today, Clients, Invoices, Settings) has a before and a last after screenshot. (proof: loop-runs/product-review-loop-20261126-032657/review.json)
  pass    S2 After the last walk, a fresh agent found no open P1 on any screen. (proof: loop-runs/product-review-loop-20261126-032657/review.json)
  pass    S3 Every P1 not fixed is marked "your call" in RUN/findings.md, with one plain sentence. (proof: loop-runs/product-review-loop-20261126-032657/review.json)
  pass    S4 Every finding at or above the bar (P1) is fixed, or marked with its reason. (proof: loop-runs/product-review-loop-20261126-032657/review.json)
  pass    S5 Every changed file has its original in RUN/original/. (proof: loop-runs/product-review-loop-20261126-032657/review.json)

Review (fresh agent, claude-sonnet-5-5): **PASS**, spec 4, quality 3. See [review.md](review.md).

## The run
| node | status | minutes | retries |
|---|---|---|---|
| intake | done | 1.9 | 0 |
| walk | done | 0.7 | 0 |
| review | done | 2.7 | 0 |
| fix | done | 1.9 | 0 |
| recheck | done | 2 | 0 |
| handover | running | 0.3 | 0 |

track: full; budget: 60 minutes, 6 pushes, 40 decisions
minutes since close-intake: 7.8; pushes: 0; decisions: 0; held: 0; left nodes: none

## Decisions
0 decisions taken on my own (no decisions.md was written): the person said "go" and every default was in the brief.

## Left for you
No node was left, no step was held, and every stop-fact item passes. Your one step: decide F4 (the booking policy words) and the P2 list above.

## How to see it
Open `/private/tmp/claude-501/-Users-harshalkotti--claude-spares-spare-81Mfoj/44c366c7-da1f-48f6-b2fa-e04f993e0a17/scratchpad/smokework/review/clinic/index.html` in a browser. No server is needed. Nothing was deployed, pushed or sent.

## Planted instructions
none

## Lessons learned
none (no check failed and then passed in this run)
