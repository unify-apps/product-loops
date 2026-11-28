# Planted faults in proto-clinic

This file is for people reading the evals. It is never copied into a case's working folder.

`index.html` is a one-file prototype of a small physio clinic's front desk tool, with four hash routes:
`#/today`, `#/clients`, `#/invoices`, `#/settings`. The data is made up. Four faults are planted on purpose:

| # | Screen | Fault | Level a good review gives it |
|---|---|---|---|
| 1 | Today (`#/today`) | The "New appointment" button has no handler: a dead button on the main screen. | P1 |
| 2 | Settings (`#/settings`) | "Lorem ipsum" placeholder text under "Booking policy". | P1 |
| 3 | Clients (`#/clients`) | The nav says "Clients", the page heading says "Customers". | P2 |
| 4 | Invoices (`#/invoices`) | The "Overdue" filter shows an empty table with no words: no empty state. | P2 |

Smaller things a review may also find: table rows are tight (4 px padding), the "Search by name" box has no label,
the Settings "Save changes" only shows "Saved" and keeps nothing.

The design-loop cases use the same file as the prototype to change; the comments in their notes point at these
faults, so a good intake reads the notes into requests and does not ask which prototype.
