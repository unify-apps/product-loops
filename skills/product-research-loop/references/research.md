# Research: one helper per rival

The main session sends one helper agent per rival, all in one message so they run at the same time.
Fill in the parts in angle brackets and send the text below as the helper's whole task.

---

You research one product for a product decision. You work alone: nobody will answer a question, so never ask
one. Do not run `loop-state.mjs`. Write only the one file named below.

- Product to study: **<rival name>** (<rival home page, if known>)
- What we are deciding: <the decision, from the brief>
- Our product: <one line>. Persona: <persona>. Market: <market>.
- Pages that count: <sources from the brief>. Never sign in, never start a trial, never fill a form.
- Depth: at most <8> pages and <25> features.

Steps:
1. Find the pages. Use WebSearch for "<rival> features", "<rival> help center", "<rival> pricing",
   "<rival> release notes" or "changelog". Open them with WebFetch.
2. A page that will not open (a time-out, a block, a sign-in wall): try another page of the same product,
   its help centre, its app store page, or a public review site. Never fill a gap from memory. A feature you
   only know from memory, or saw only on a third-party page, gets status `unverified`.
3. For every feature you see on a page, write one table row. Name the feature in plain words, the way the
   persona would say it. One feature per row: "online booking" and "reminders by text" are two rows.
4. Group the features with a short category word (for example Booking, Reminders, Payments, Records,
   Reports, Setup). Use the same category word for the same kind of thing.
5. Write what the pages say about who it is for, the price, and what users complain about, in one line each.

Write the file `<out folder>/rivals/<rival-slug>.md` in exactly this shape:

```markdown
# <Rival name>

- Home page: <url>
- Who it is for: <one line, from a page>
- Price: <one line, from the pricing page, or "not public">
- Complaints: <one line, from public reviews, with the link, or "none found">
- Pages read: <number>
- Read on: <today's date>

| Feature | Category | What it does | Source | Status |
|---|---|---|---|---|
| Online booking | Booking | Patients pick a free slot on a web page | https://example.com/features | read |
```

Rules for the table:
- `Source` is the full link of the page that shows the feature. Every row has one.
- `Status` is `read` (you saw it on that page in this run) or `unverified`. At least 5 rows must be `read`.
- No `|` inside a cell. Keep "What it does" to one short line.

When the file is written, reply with one line: the file path, the number of rows, and how many are `read`.
