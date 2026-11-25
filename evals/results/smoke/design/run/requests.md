# Requests

Prototype: clinic/index.html (http://localhost:4100/)
Reference: none

| # | Note, in words | Screens | Where | Check | Status |
|---|---|---|---|---|---|
| 1 | Call the clients "Customers" everywhere: the nav link "Clients" becomes "Customers" (the Customers screen heading already says Customers) | today, customers, invoices, settings (the nav is on every screen) | everywhere | "Clients" gone from every after/*.txt; nav shows "Customers" on every screen; heading still "Customers" | swept |
| 2 | Name the person "Customer" wherever the screens show the word client: the "Client" column header on Today and Invoices becomes "Customer", and the Customers search empty line "No client matches" becomes "No customer matches" (my reading of "everywhere") | today, invoices, customers (search empty state) | everywhere | no visible "client"/"Client" word in any after/*.txt or in the empty-state text; "Customer" headers on today and invoices | swept |
| 3 | Remove the Export button on the Home screen. The prototype has no Home screen and no Export button: Home is read as Today (the first screen), and there is no Export control in the code or on any screen. Answer 1 (default): remove nothing; "New appointment" stays | today | this place | `grep -n -i export clinic/index.html` finds nothing; today.txt has no "Export" | left: no Export button and no Home screen exist (grep -i export clinic/index.html finds nothing); answer 1: remove nothing |
| 4 | Appointments list rows (the table on Today): more space between rows, cell padding from 4px to 10px top and bottom (my reading; 10px is already on the page as the cells' side padding) | today | this place | eval paddingTop of a Today `td` is "10px"; Customers and Invoices table cells still "4px" | done |

## Broken before the run

- today: "New appointment" button is dead (`CHECK click --text "New appointment"` -> dead: nothing changed after the click). No row asks to make it work; left as it is.
- settings: lorem ipsum text under "Booking policy" (before/settings.txt). No row names it; left as it is.
- invoices: the "Overdue" filter shows an empty table with no words (code comment line 125). No row names it; left as it is.
- No screen had page errors in before/summary.json.

## Proposals

- Settings: replace the lorem ipsum under "Booking policy" with the clinic's real policy text (needs the words from the person).
- Today: "New appointment" does nothing; give it a booking form (time, customer, therapist, type, room).
- Invoices: the "Overdue" filter shows an empty table; add a line such as "No overdue invoices."
- Row 3 may have meant a different button or an older version of the prototype; tell the run which control, if any, should go.
