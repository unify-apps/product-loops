# The sweep (built-in step)

Used by node 5. A note marked `everywhere` is a rule. The sweep applies each rule to every screen and every
place in the code, not only where the person saw it.

## For each `everywhere` row

1. Write the rule in one line: "No intro line under a page title", "Times read like 6:30 pm",
   "The button is called Save".
2. Write a find for it: a search a script can run, so the check is not your memory. Search both the code and
   the captured page text of every screen:

   | Rule | Find in the code | Find on the pages |
   |---|---|---|
   | No intro line under titles | `grep -n 'class="lede"' <files>` | the old intro texts in `after/*.txt` |
   | Times as "6:30 pm" | `grep -nE '\b[0-2][0-9]:[0-5][0-9]\b' <files>` (then read which are shown to people) | `grep -E '\b[0-2][0-9]:[0-5][0-9]\b' after/*.txt` |
   | A rename | `grep -n '<old name>' <files>` | `grep -l '<old name>' after/*.txt` |
   | A spacing rule for a kind of row | the class or component of that kind of row | `CHECK eval` of the value on each screen that has one |

3. Run the find. List every place in `sweep.md`: the file and line or the screen, and whether you changed it.
4. Change every place, the same way the first one was changed. A place the rule does not fit (a date inside a
   file name, a word that only looks the same) is skipped, with the reason in its line.
5. Run the find again. Write its real output. It must show no place left except the skipped ones.

## Then

- When the sweep changed no file (node 4 already did every place), skip the capture: write "no file changed
  since compare-changes.md" in `sweep.md`.
- Otherwise: `CHECK capture --screens RUN/screens.json --out RUN/after`, then
  `CHECK compare --before RUN/before --after RUN/after --explained <every screen where a row's thing was> --out RUN/compare-sweep.md`.
- UNEXPECTED or BROKEN: fix it and run both again.

`sweep.md` looks like this:

```markdown
## Row 3: No intro line under a page title
Find: grep -n 'class="lede"' app/*.html
Before: 4 places (app/shelf.html:22, app/book.html:18, app/search.html:30, app/about.html:12)
Changed: 3. Skipped: 1 (about.html:12 is the page's body text, not an intro line).
After: grep -n 'class="lede"' app/*.html -> app/about.html:12 (skipped)
```
