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

## Request list
(see requests.md, copied)
| 1 | nav "Clients" -> "Customers" | everywhere |
| 2 | "Client" headers -> "Customer", "No client matches" -> "No customer matches" (my reading) | everywhere |
| 3 | Remove Export on Home: none exists; Home = Today; nothing to remove | this place |
| 4 | Today table rows: td padding 4px -> 10px top/bottom, scoped to Today's table (my reading) | this place |

## Needs
1 Prototype: clinic/index.html (only one). 2 Run: serve.mjs on clinic/. 3 Notes: the 3 above, as 4 rows. 4 Vague notes: rows 2 and 4 are my readings. 5 Everywhere: rows 1, 2; this place: 3, 4. 6-8 Reference: none (copy-reference left). 9 Screens that must not change: none named (default). 10 Result: local link only, nothing published (default). 11 Commit: no (default). 12 Design rules: no product-design or design-review skill installed, no CLAUDE.md in the folder: built-in make-changes.md and design-check.md.
Track: full (no reference, so both tracks are the same).

## Done means
1. Every one of the 4 rows in requests.md is done or swept, or left with a reason.
2. Every everywhere row's find in sweep.md shows no place left, except places skipped with a reason.
3. The final compare has no UNEXPECTED and no BROKEN screen.
4. Every changed part of the code traces to a row, or to a decision a row needed.
5. The prototype's link (http://localhost:4100/) answers 200.

Budget: 60 minutes.
