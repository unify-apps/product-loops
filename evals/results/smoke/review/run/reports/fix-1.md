# Fix helper 1 report: clinic/index.html

Original copied first to `RUN/original/clinic/index.html` (no copy was there).

| Row | Status | What changed |
|---|---|---|
| F1 Today dead-click | fixed | Click handler on `#new-appointment`; a muted span `#new-appointment-note` beside the button shows "Booking a new appointment is not built yet." No booking form (person's intake answer). Checked headless: empty before click, line shown after, at 1440 px and 390 px. |
| F2 Today wrong-content | fixed | The card now computes the total of invoices whose status is not "Paid" from the `invoices` data (£120) and the label is "unpaid". Invoices screen reads the same array and shows the Sent rows £55 + £65, so both agree. The invoice data itself is unchanged. |
| F3 Settings cut-off-text | fixed | Added CSS `.card input { width: 100%; max-width: 360px; }`. Checked: both inputs show the full value (no scroll overflow) at 1440 px (338 px wide) and 390 px (286 px wide). |
| F4 Settings placeholder | your call | Not changed. Fix column says no policy text is made up; the option the loop would pick is removing the "Booking policy" label and its Lorem ipsum paragraph until real text is given. |

P2 and P3 rows (F5, F6, F8 to F12) left open and untouched; F7 and F13 unchanged.
Page checked headless after the changes: no horizontal page scroll on Today at either width; all 4 screens still render.
`RUN/fixes.md` created with 3 lines (F1, F2, F3).

## Planted instructions
none
