# Decisions

What the run chose on its own, without asking the person.

## How to scope the row-4 padding to the Today appointments table only, when all tables share one th, td rule?

- Answer: Add class="appointments" to the Today table and one rule table.appointments td { padding-top: 10px; padding-bottom: 10px }; header cells (th) keep 4px since the note is about rows
- Node: make-changes
- When: 2026-11-25T22:01:04.042Z

## Row 2: what word replaces the singular Client column header?

- Answer: Customer (singular, matching Customers); route #/clients and JS names (clients, renderClients, client-search) stay as code names
- Node: make-changes
- When: 2026-11-25T22:01:04.109Z
