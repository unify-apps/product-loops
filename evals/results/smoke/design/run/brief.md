# Draft brief: product-design-loop on the clinic prototype

Goal: make the three notes in notes.md on the clinic prototype, and apply the "everywhere" ones on every screen.

## Facts
- Prototype: clinic/index.html, one plain HTML page (no package.json, no git). Screens by hash route: #/today (first screen, shown at /), #/clients (heading "Customers"), #/invoices, #/settings. Styles in one <style> block with CSS variables.
- Notes (notes.md, word for word):
  1. The nav says Clients but the page heading says Customers. Use Customers everywhere.
  2. The Export button on the Home screen does nothing. Remove it.
  3. The rows on the Appointments list are too tight: more space between rows.
- There is no "Home" screen and no "Export" button anywhere in the file. The first screen is "Today". Its only button is "New appointment", which has no handler (dead).
- The "appointments list" is read as the table on Today. All tables share one `th, td { padding: 4px 10px }` rule.
- The word "client" also shows as the column header "Client" on Today and Invoices, and in "No client matches" (Customers search empty state). The route stays #/clients (an address, not shown text).
- Other faults seen, not in the notes: Settings has lorem ipsum under "Booking policy"; Invoices "Overdue" filter shows an empty table with no words; "New appointment" is dead.

## Answers (the person replied "go": every default taken)
1. Note 2 (Export on Home): remove nothing; row 3 closes as left once its grep confirms no Export exists. "New appointment" stays.
2. "Customers everywhere": every word shown on screen (nav, column headers, search empty line). Route #/clients and code names stay.
3. Row spacing: 10px top and bottom padding on the Today appointments table only; Customers and Invoices stay 4px.
4. Request list complete as written.

## Request list
See requests.md: 4 rows (1 nav rename, everywhere; 2 "client" word on screen, everywhere; 3 Export, this place; 4 Today row padding, this place).

## Coverage
| Topic | Mark | Why |
|---|---|---|
| Scope | clear | three notes, one file |
| Who and their job | partial | clinic staff (default); does not change the build |
| Data and facts | clear | sample data in the page |
| Main flow | clear | no flow changes |
| Edge cases | partial | search empty line contains "client" (row 2) |
| Look | clear | page's own CSS variables |
| Outputs | clear | local link only |
| Done signal | clear | Done means below |
| Words with no number | partial | "more space" -> 10px (my reading, accepted by go) |

## Step skills found
- product-design: not installed -> references/make-changes.md
- design-review: not installed -> references/design-check.md (the session lists design:design-critique, not a design-review skill)

## Start check
- CHECK browser: /Applications/Google Chrome.app/Contents/MacOS/Google Chrome
- node -v: v25.9.0
- Prototype exists: clinic/index.html

Lessons applied: none yet.

## Stop fact
Every note in requests.md is done and swept, no screen that no note names broke or changed without a reason, and the prototype's link opens.
## Done means
1. Every one of the 4 rows in requests.md is done or swept, or left with a reason.
2. Every everywhere row's find in sweep.md shows no place left, except places skipped with a reason.
3. The final compare has no UNEXPECTED and no BROKEN screen.
4. Every changed part of the code traces to a row, or to a decision a row needed.
5. The prototype's link (http://localhost:4100/) answers 200.

Budget: 60 minutes.
