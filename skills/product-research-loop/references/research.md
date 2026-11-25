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
- Kinds of source to try, every one: <the source kinds from need 7, in the person's words>.
- Group words, in this order: <the groups from need 14>. Use them as written for the `Category` column. Add a
  new word only when no group fits, and then reuse it.
- Capabilities the person named as examples, to look for one by one: <the examples from need 14, or "none">.
- Depth: at most <pages> pages and <features> features.

The person wants every capability this product has, not the ones that fit our persona. Write down every feature
you see, even one our persona would not use.

Steps:
1. Find the pages. Use WebSearch for "<rival> features", "<rival> help center", "<rival> docs",
   "<rival> pricing", "<rival> release notes" or "changelog". Open them with WebFetch. Read the release notes
   and help centre as well as the product pages: they name features the marketing pages leave out.
2. Try every kind of source in the list. For a video site: search "<rival> site:youtube.com" and read the video
   pages' titles and descriptions. For a social site: search "<rival> site:linkedin.com" and read the posts that
   open. For press releases: search "<rival> press release" and "<rival> announces". A feature seen only in a
   video title, a social post or a search result is `unverified`.
3. Look for each named example capability by name and by two other ways of saying it. Write a row when you find
   it. When you do not, write nothing for it: the matrix step searches again.
4. A page that will not open (a time-out, a block, a sign-in wall): try another page of the same product,
   its help centre, its app store page, or a public review site. Never fill a gap from memory. A feature you
   only know from memory, or saw only on a third-party page, gets status `unverified`.
5. For every feature you see on a page, write one table row. Name the feature in plain words, the way the
   persona would say it. One feature per row: "online booking" and "reminders by text" are two rows.
6. Write what the pages say about who it is for, the price, and what users complain about, in one line each.

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

## Source kinds

| Kind | Searched | Rows | Why none |
|---|---|---|---|
| release notes | example release notes; example changelog | 6 | |
| videos | example site:youtube.com | 0 | Only video titles came back; no page gave text |
```

Rules for the feature table:
- `Source` is the full link of the page that shows the feature. Every row has one.
- `Status` is `read` (you saw it on that page in this run) or `unverified`. At least 5 rows must be `read`.
- "What it does" says only what the page says, not what such a feature usually does. A page that names a
  feature without saying how it works gives a short line like "Has a wait list", nothing more.
- No `|` inside a cell. Keep "What it does" to one short line.
- Write each link the same way every time you use it, exactly as the browser shows it.

Rules for `## Source kinds`: one line for every kind in the list, with the searches you ran, the number of
feature rows it gave, and why none when that number is 0. Keep this section after the feature table.

When the file is written, reply with one line: the file path, the number of rows, and how many are `read`.
