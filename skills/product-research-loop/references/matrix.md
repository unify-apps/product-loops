# Matrix: the capability sheet

Turn the rival files into one sheet: one row per capability, one column per rival, a source on every row.
The sheet is `capability-sheet.csv` in the out folder. A CSV opens in Excel, Numbers and Google Sheets.

## Columns, in this order

```
id,category,capability,<rival 1>,<rival 2>,<rival 3>,sources,mark,note
```

- `id`: `C01`, `C02`, ... in sheet order. The brief cites these ids, so never renumber after the brief exists.
- `category`: the category word from the rival files. Sort the sheet by category.
- `capability`: the thing the persona gets, in plain words ("Text reminder before the visit"), not a rival's
  brand name for it.
- One column per rival, named with the rival's short name in small letters (for example `rival-a`). Each cell is
  `yes`, `partial`, `no` or `unknown`. `no` only when that rival's pages were read and it is clearly missing.
  `unknown` when the pages did not say.
- `sources`: the links, from the rival files, that prove the `yes` and `partial` cells. Separate links with a
  space. Every row has at least one link, and every link must appear in a rival file, exactly as written there.
  `CHECK matrix` fails any other link.
- `mark`: our side.
  - `have`: we already have it (from need 4, "what we have today").
  - `gap`: a rival has it and we do not, yet.
  - `beat`: where we can do clearly better than every rival: nobody has it, or everyone does it badly. The
    source is the page that shows the need or the weak spot (a complaint in a review, a missing feature on a
    pricing page). That page must be in a rival file too, for example on its `Complaints` line.
- `note`: one short line: what is weak in the rivals' version, or why it matters to the persona. May be empty.

Put a cell in quotes when it holds a comma: `"Booking, online"`.

## How to build it

1. Read every file in `rivals/`. Use only what they hold. Do not add a capability from memory.
2. Merge the same capability across rivals into one row, even when they name it differently.
3. A rival-file row with status `unverified` may make a cell `partial` or `unknown`, never `yes`.
4. An idea that nobody has and no page proves a need for is not a row. Write it in `thinking.md` as an idea.
5. Mark every row. When need 4 says "nothing yet", every row is `gap` or `beat`.

## Example

```
id,category,capability,rival-a,rival-b,rival-c,sources,mark,note
C01,Booking,Patient books a free slot online,yes,yes,partial,https://a.example/features https://b.example/booking,gap,
C02,Reminders,Text reminder before the visit,yes,no,yes,https://a.example/reminders https://c.example/sms,gap,
C03,Booking,Fill a cancelled slot from a wait list,no,partial,no,https://b.example/waitlist https://reviews.example/b,beat,Reviews say B's wait list is manual
```
