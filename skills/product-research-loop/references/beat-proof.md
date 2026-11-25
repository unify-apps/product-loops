# Beat proof: one helper per rival

A `beat` row says we can do something no rival does, or that every rival does badly. "No rival does it" is the
claim a reader trusts most and the one most often wrong: a rival names the thing differently, puts it in its help
centre, or shows it on the very page the row cites. So before a row may stay `beat`, each rival's own site is
searched for it.

The main session sends one helper per rival, all in one message, once the sheet has its `beat` rows. Fill in the
angle brackets and send the text below as the helper's whole task.

---

You check one rival for capabilities we think it does not have. Your job is to find each one if it is there.
A wrong "none" costs more than a wrong "found". You work alone: never ask a question. Do not run
`loop-state.mjs`. Write only the two files named below.

- Rival: **<rival name>**. Its own site: <home page>. Its file: `<out folder>/rivals/<rival-slug>.md`.
- The rows to check (id, capability, what it does, the links the row cites for this rival, the sheet's note):
  <one line per beat row: every beat row of the sheet, the same list for every rival>

For each row:
1. Open every link the row cites for this rival, and read it for the capability. A cited page often shows it.
2. Search the rival's own site with at least 3 ways of saying the capability: the row's words, the words the
   rival uses for this group on its pages, and a plainer or wider word. Use WebSearch with
   `site:<its site> <words>`, and the same for its help centre or docs site when it has one.
3. Open at least 2 pages, at least 1 of them on the rival's own site: the best hits, the product page of that
   group, and the help-centre article closest to it.
4. Decide:
   - `yes`: a page shows the capability as the row words it, even under another name or done another way that
     gets the person the same result.
   - `partial`: a page shows part of it, or says it only with a person in the loop where the row says without.
   - `none`: no page you opened shows it.
   A search result line you could not open proves nothing either way: open the page.
5. When the result is `yes` or `partial`, add a row for it to the feature table in the rival's file, with that
   page as `Source` and status `read`, and write the same link in `Link` below.

Write `<out folder>/beats/<rival-slug>.md` in exactly this shape:

```markdown
# Beat proof: <Rival name>

| Row | Capability | Searches | Pages | Result | Link |
|---|---|---|---|---|---|
| C07 | Fill a cancelled slot from a wait list | site:a.example wait list; site:a.example waitlist; site:help.a.example cancellation | https://a.example/features https://help.a.example/article/42 | none | |
```

- `Searches`: the search phrases you ran, split by `;`. At least 3.
- `Pages`: the links of the pages you opened, split by spaces. At least 2, at least 1 on the rival's own site.
- `Result`: `yes`, `partial` or `none`. `Link`: the page that shows it, when found. Empty for `none`.
- No `|` inside a cell. One line per row in the list. Write each link exactly as the browser shows it.

When the file is written, reply with one line: the file path, and how many rows came back `yes`, `partial` and
`none`.
