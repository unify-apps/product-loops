# Matrix: the capability sheet

Turn the rival files into one sheet: one row per capability, one column per rival, and on every cell the person
can check, the link that backs it. The sheet is `capability-sheet.csv` in the out folder. `make-sheet.mjs` turns
it into `capability-sheet.xlsx`, the file the person opens.

The sheet holds every capability the rivals have. The persona never takes a row out: it only ranks the modules
later. A capability only one kind of buyer uses still gets its row.

## Columns, in this order

```
id,category,capability,what it does,<rival 1>,<rival 2>,<rival 3>,sources,mark,note
```

- `id`: `C01`, `C02`, ... in sheet order. The brief cites these ids, so never renumber after the brief exists.
- `category`: the group. Use the person's own group words (need 14) exactly as they wrote them, then the words
  the rival files added. Sort the sheet by category.
- `capability`: the thing the persona gets, in plain words ("Text reminder before the visit"), not a rival's
  brand name for it.
- `what it does`: one or two short sentences: what the person can do with it, from the rival rows. Never empty.
- One column per rival, named exactly like its file in `rivals/` without `.md` (file `rival-a.md`, column
  `rival-a`). Each cell is `yes`, `partial`, `no` or `unknown`. `no` only when that rival's pages were read and
  it is clearly missing. `unknown` when the pages did not say.
- `sources`: each link with the rival it backs in front of it: `rival-a: https://a.example/x rival-b: https://b.example/y`.
  The label is the rival's column name, then a colon and a space. Every `yes` or `partial` cell needs a link
  labelled with that rival, from that rival's own file (its home page line does not count). Every row has at
  least one link, and every link must appear in a rival file, exactly as written there.
- `mark`: our side.
  - `have`: we already have it (from need 4, "what we have today").
  - `gap`: a rival has it and we do not, yet.
  - `beat`: where we can do clearly better than every rival: nobody has it, or everyone does it badly. A beat
    stays a beat only after the beat proof below. When a rival has it in full (`yes`), the note must name its
    weak spot, and the source labelled with that rival must show it (a complaint, a limit on a pricing page).
- `note`: at most 15 words: what is weak in the rivals' version, or why it matters to the persona. May be empty.

Put a cell in quotes when it holds a comma: `"Booking, online"`.

## How to build it

1. Read every file in `rivals/`. Use only what they hold. Do not add a capability from memory.
2. Merge the same capability across rivals into one row, even when they name it differently.
3. Word the capability at what every `yes` rival's own row says, never at the strongest rival's wording. A
   rival whose row says less gets `partial`. Example: one rival "texts the wait list when a slot opens", another
   only "keeps a wait list": the second is `partial`, or the two are separate rows.
4. A rival-file row with status `unverified` may make a cell `partial` or `unknown`, never `yes`.
5. An idea that nobody has and no page proves a need for is not a row. Write it in `thinking.md` as an idea.
6. Every example capability the person named (need 14) gets a row, even when no rival has it. Its source is the
   rival page closest to it.
7. Mark every row. When need 4 says "nothing yet", every row is `gap` or `beat`. Mark a row `beat` whenever it
   may be one, and let the beat proof decide. Never leave a likely beat as `gap` to skip the proof. When no row
   is a beat, the brief says so under `## Where we beat them`, with what was looked at.
8. Before the check, read each `yes` cell once more next to the rival row it came from. When that row says less
   than the capability line, change the cell to `partial`.

## Beat proof

Every `beat` row gets searched for on every rival's own site, by one helper per rival with the task in
`beat-proof.md`. Each helper writes `beats/<rival-slug>.md` and adds what it found to its rival file (the depth
cap counts these rows too; a helper that would pass it merges rows instead). After the beat proof, run the
research check again, since the rival files changed. Then:

1. For each line that came back `yes` or `partial`: change that rival's cell to match, and add the link to
   `sources` with the rival's label.
2. A row where a rival now has it: when every rival's version is still clearly weak, keep `beat` and name the weak
   spot in the note. Otherwise change the mark to `gap`. Run `STATE decide` for each beat that changed.
3. A cell that is `unknown` on a beat row is never left so: the search makes it `no`, `partial` or `yes`.
4. `CHECK matrix` fails a beat row whose proof is missing, has fewer than 3 searches, opened fewer than 2 pages
   or none on the rival's own site, or disagrees with the cell.

## The Excel file

After the last change to the CSV, run `node "<loop folder>/scripts/make-sheet.mjs" <out folder>`. It writes
`capability-sheet.xlsx`: a Matrix tab where each rival's cell sits next to the link that backs it, a Sources tab
(one line per link: row, rival, cell), a Beat proof tab, one tab per rival with all its rows, and a Read me tab.
Run it again after every later change to the CSV. `CHECK matrix` fails an `.xlsx` older than the CSV.

## Example

```
id,category,capability,what it does,rival-a,rival-b,rival-c,sources,mark,note
C01,Booking,Patient books a free slot online,Patients pick a free time on the clinic's page and book it,yes,yes,partial,rival-a: https://a.example/features rival-b: https://b.example/booking rival-c: https://c.example/request,gap,
C02,Reminders,Text reminder before the visit,Sends the patient a text a day before the visit,yes,no,yes,rival-a: https://a.example/reminders rival-c: https://c.example/sms,gap,
C03,Booking,Fill a cancelled slot from a wait list,Texts people on the wait list when a slot opens,no,partial,no,rival-b: https://b.example/waitlist rival-a: https://a.example/features,beat,B keeps a list but staff call each person
```
