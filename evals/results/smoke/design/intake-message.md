**Brief: design changes to the clinic prototype**

Goal: make the three notes in `notes.md` on `clinic/index.html`, and apply the "everywhere" ones on every screen.

- Prototype: `clinic/index.html`, one plain HTML page with four screens (Today, Customers at `#/clients`, Invoices, Settings). I will serve it locally with the loop's own server (http://localhost:4100/).
- Reference: none, so the copy-reference step is skipped and the track is full.
- Design rules: no design skill and no `CLAUDE.md` in the folder, so the loop's built-in change and design checks apply.
- Result: a local link only. Nothing is published, pushed or committed. The changed files are listed at the end.
- Screens that must not change: none named. Any screen may change only through a note or the sweep.
- Seen but not in your notes (left as they are, listed as Proposals): Settings has lorem ipsum under "Booking policy", the Invoices "Overdue" filter shows an empty table with no words, and "New appointment" on Today does nothing.

Coverage: scope clear · who and job partial (clinic staff, default) · data clear (sample data in the page) · main flow n/a · edge cases n/a · look clear (the page's own styles) · outputs clear (local link) · done signal clear · words with no number partial ("more space": my reading is 10px).

Lessons applied: none yet.

**Request list** (one row per change)

| # | Change | Where |
|---|---|---|
| 1 | Nav link "Clients" becomes "Customers" (the heading already says Customers) | everywhere |
| 2 | The word client on screen becomes customer: "Client" column on Today and Invoices becomes "Customer", "No client matches" becomes "No customer matches" (my reading) | everywhere |
| 3 | Remove the Export button on the Home screen: there is no Home screen and no Export button in the prototype, so there is nothing to remove | this place |
| 4 | Appointments table on Today: more space between rows, cell padding 4px to 10px top and bottom, on that table only (my reading) | this place |

Done means:
1. Every one of the 4 rows in `requests.md` is done or swept, or left with a reason.
2. Every everywhere row's find in `sweep.md` shows no place left, except places skipped with a reason.
3. The final compare has no UNEXPECTED and no BROKEN screen.
4. Every changed part of the code traces to a row, or to a decision a row needed.
5. The prototype's link http://localhost:4100/ answers 200.

Budget: 60 minutes.

About 60 minutes and 3 helper agents, within a budget of 60 minutes.

1. Note 2 names an Export button on a Home screen that does not exist. What should happen?
   Recommended: remove nothing; row 3 is closed as "left: no Export button exists". "New appointment" on Today stays as it is.
   Why it matters: the only other button on Today is "New appointment"; removing it by guess would delete a real control.
2. How far does "Customers everywhere" reach?
   Recommended: every word shown on screen (nav, column headers, the search empty line); the address `#/clients` and code names stay.
   Why it matters: it decides whether the column headers on Today and Invoices change too.
3. How much space between the appointment rows, and on which tables?
   Recommended: 10px top and bottom padding, on the Today appointments table only; Customers and Invoices tables stay at 4px.
   Why it matters: all tables share one padding rule, so a wider change would also change the other two screens.
4. Is anything missing or wrong in the request list? Notes you send later still join this run.
   Recommended: the list is complete as written.
   Why it matters: after "go" the run works without asking anything.

Reply with your answers, or just "go" to use the defaults.
