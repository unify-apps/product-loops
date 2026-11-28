# Builder check: briefs/builder-check.md

Read as the one person who must run this review and fix it alone. Three questions whose answer changes what gets built. Nothing else was changed.

## 1. "New appointment" does nothing. Do I build the booking form, or mark it "your call"?
The brief says the user's job is to "check today's appointments and book new ones", and the button on Today has no handler, so this is the clearest P1. But a fix means building a new form (a 5th screen or a dialog) that the brief's 4 screens and its done list do not cover, and its fields (client, therapist, time, room, type) are not defined anywhere.
**Default I would take:** build a small dialog on Today with those 5 fields, filled from the file's sample data, that adds the row to today's table in memory only (no save, no clash check). It counts as part of the Today screen, so its before and after shots go with Today's.

## 2. The Settings "Booking policy" is lorem ipsum. Do I write policy words, or leave it?
Placeholder text on a shipped screen is a P1 on the checklist, but a booking policy is clinic policy (cancellation notice, fees), and writing it would invent a rule nobody gave me.
**Default I would take:** do not write a policy. Mark it "your call" in findings.md with one sentence asking for the clinic's real words.

## 3. "£110 unpaid this week" on Today does not match Invoices. Which number is right?
The figure is typed in. The invoices marked Sent add up to £120 (INV-1043 £55, INV-1044 £65), and neither is dated this week. A wrong number on the first screen is a P1, but the fix depends on what the tile means: all unpaid, or unpaid and dated this week (which would be £0).
**Default I would take:** rename the tile to "unpaid" and work it out from the invoices whose status is not Paid (£120), so it can never drift again.

Not asked, because the default is plain: the Clients screen's heading says "Customers"; I would change it to "Clients" to match the menu and the table words.
