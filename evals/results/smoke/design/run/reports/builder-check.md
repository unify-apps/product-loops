# Builder check: questions that change what gets built

1. Note 2 says remove the Export button on the Home screen, but no Home screen and no Export button exist. Is the note about a different build, or does it mean the dead "New appointment" button on Today?
   Default: treat it as stale. Remove nothing, record "nothing to remove" in the report. Do not delete "New appointment".

2. Does "Use Customers everywhere" include the data and column labels (Client column headers on Today and Invoices, "No client matches", and the "Clients" nav text), or only the nav and page heading?
   Default: yes, change all shown text to Customer/Customers. Keep the route #/clients and the code names unchanged.

3. Note 3 says "Appointments list" rows are too tight. Is that only the Today table, or should every table (Customers, Invoices) get the same row spacing?
   Default: Today table only, td padding 4px -> 10px top and bottom, scoped to that table. Other tables stay as they are.
