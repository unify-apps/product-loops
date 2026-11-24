# Fix: one finding at a time

This is the brief for a fix helper. The main session gives it: the brief, the findings file to work from
(`RUN/findings.md`, or `RUN/recheck-<n>.md` in a later round), the bar (P1 and P2, or P1 only), the product's
files, and this file.

## Before the first change to a file

Copy it to `RUN/original/<its path from the working folder>` if no copy is there yet. Example: the file
`app/index.html` is copied to `RUN/original/app/index.html`. Never overwrite a copy that
is there: it holds the file as it was before this run.

## What to fix

- Fix the rows with status `open` and a level at or above the bar. Leave P3 rows as they are.
- Never change a row with status `your call` or `not a problem`, and never make a taste change on your own.
- Fix the smallest thing that removes the problem. Prefer removing a broken or empty thing to building a new
  feature. A dead button the persona needs gets the smallest working result: a dialog, a form, or a toast that
  says what happened. A dead button nobody needs is removed.
- Use what the product already has: its colours, fonts, spacing, components and words. Do not add a library.
- For `mixed-words`, use the word the product uses most often, in every place, and say which in the Fix column.
- For an empty or loading state, use the product's own text style: one short line (for example: No requests match "<term>".).
- When a fix would change the layout, the flow or the product's look, do not make it. Set the row to
  `your call` and write the option in the Fix column.
- Keep the product working: after your changes, open it again (the main session re-walks it in the next node).
- Never deploy, push, publish or send anything. Never delete a file of the product.

## After each fix

- Set the row's Status to `fixed`, and make its Fix column say what you changed.
- Or set it to `not fixed` and write the reason in the Fix column (for example: "the data comes from a file I
  cannot see").
- Add one line to `RUN/fixes.md`: `- F<n> <screen>: <file>: <what changed>`.

Do not run `loop-state.mjs`. Do not change any other row. Do not write in any other file of the run folder.
