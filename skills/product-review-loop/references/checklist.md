# Review checklist

You are a reviewer who did not build this product. Review the screens you were given, as the persona in the brief,
doing their one job. Change no file. Write only your findings file.

## How to review one screen

1. Read the screenshot at the main width, then the phone one.
2. Read the script findings for the screen in `checks.md`. For each, look at the screenshot and the source, and
   decide: a real problem (give it a level), or not a problem (say why in one line).
3. Walk the persona's job: what they see first, what they click, what opens. Read the source for what the script
   cannot reach: what shows with no data, while data loads, after an error, after a save.
4. Go through the rules below, top to bottom.
5. Write the findings table.

When a review skill of the person's is given to you (for example `design-review`), follow it as well. Its rules
add to these. Its findings still go into the table below, with a rule from the list below (`taste` for any rule
of theirs that is a matter of taste).

## The rules a check can decide

| Rule | Problem | Usual level |
|---|---|---|
| `dead-click` | Something looks clickable and nothing happens. | P1 on the persona's main path, P2 elsewhere |
| `broken-link` | A link goes to a page that does not load. | P1 |
| `console-error` | An error in the console, even when the screen looks fine. | P1 |
| `persona-path` | The persona cannot finish their one job from this screen: a step is missing or leads nowhere. | P1 |
| `placeholder` | Lorem ipsum, TODO, "undefined", sample names like "John Doe", stand-in images. | P1 when on screen at first look, P2 when hidden |
| `broken-image` | An image that does not load. | P1 |
| `cut-off-text` | Text cut by its box, so a word or a number is lost. | P1 in a title or a value the persona needs, P2 otherwise |
| `page-scrolls-sideways` | The page is wider than the window. | P2 (P1 when the brief says phones matter) |
| `no-empty-state` | A list, table or search with no results shows a blank area and no message. | P2 (P1 on the first screen) |
| `no-loading-state` | Content arrives late with nothing showing it is on its way. | P2 |
| `missing-state` | No error message after something fails, no sign a save worked, a disabled button with no reason. | P2 |
| `mixed-words` | One thing has two names across screens (nav "Clients", heading "Customers"), or one label is spelt two ways. | P2 |
| `near-miss-alignment` | Text or boxes almost line up, 1 to 6 px off. | P2 |
| `uneven-spacing` | Gaps between alike items differ for no reason. | P2, P3 when under 4 px |
| `wrong-content` | Numbers that do not add up, dates out of order, a total that does not match its rows. | P1 when a persona would act on it, P2 otherwise |

Levels: **P1** breaks the persona's job or looks broken to anyone who opens it. **P2** works but looks careless.
**P3** polish. A check rule decides the problem, not the level: move a level up or down when the screen calls
for it, and say why in the Problem column. Never move a slip the script measured (`near-miss-alignment`, `uneven-spacing` of 4 px
or more, `cut-off-text`) below its usual level because it is small or hard to see: the people the product is
shown to look closely, and the fix is usually one line.

## Taste: always the person's call

Colour, fonts, icons, illustration, how dense a screen is, the layout, the product's name and tone, adding or
removing a screen, tab or column, and anything you would "make nicer". Write these as rule `taste` with status
`your call`, in one plain sentence each: what you see, and the option you would pick. Never as a fix to apply.
At most 5 taste rows per screen: pick the ones that matter most to the persona.

A rule from the person's own skill or `CLAUDE.md` is not taste: it is their check. Use the closest rule above.

## The findings table

Exactly these columns, in this order, one finding per row:

```
| ID | Screen | Rule | Level | Problem | Fix | Status |
|---|---|---|---|---|---|---|
| F1 | Inbox | dead-click | P2 | "Export", a button the persona does not need for their job, does nothing when clicked. | Remove the "Export" button. | open |
| F2 | All screens | mixed-words | P2 | The nav says "Clients", the page title says "Customers". | Use "Clients" in both: the nav uses it on every screen. | open |
| F3 | Inbox | taste | P3 | The purple header is loud next to the grey page. | Keep it, or try a darker purple. | your call |
| F4 | Reports | uneven-spacing | P3 | The script found one 2 px gap difference; it comes from a hidden row. | none | not a problem |
```

- One row per line. Never put a `|` sign inside a cell: it splits the cell.
- **Screen**: a name from `screens.json`, or `All screens` for a problem across screens.
- **Rule**: one of the rule names above, or `taste`.
- **Level**: `P1`, `P2` or `P3`.
- **Problem**: what is wrong, where, and the evidence (the words on screen, a number from `checks.md`).
- **Fix**: ONE exact change, the smallest that removes the problem, in the product's own terms (the element, the
  words, the value), or "none". Never two options ("add a form, or remove the button"): pick the smaller one.
  Prefer a fix made from what the product already has: a message, a label, a value from data it already holds,
  removing a thing. Keep such a row `open`, at any level. Only the fixer may move a row to `your call`.
- **Status**: `open` for a problem to fix, `your call` for taste, `not a problem` for a script finding you
  checked and rejected. The fix node uses `fixed` and `not fixed`.

Every script finding in `checks.md` for your screens needs a row, with the same screen and the script's kind as
the rule, even when its status is `not a problem`. Group repeats into one row ("all 4 cards: ...").
Cap the table at about 15 rows per screen, most serious first.
