# Build: deck.json, the layouts, and looking at every slide

`DECK make` turns `OUT/deck.json` and `OUT/facts.json` into `OUT/out/deck.html` and `OUT/out/deck.pptx`. Both
come from the same layout, so the HTML pictures show what the PowerPoint holds. The PowerPoint is real text boxes
and shapes, never a picture of a slide.

## deck.json

```json
{
  "title": "Acme and us: first meeting",
  "format": "slides",
  "page_size": "a4",
  "outputs": ["html", "pptx", "pdf"],
  "slide_count": [8, 12],
  "brand": {"title_font": "Georgia", "body_font": "Arial", "background": "FFFFFF", "text": "1F2328",
            "muted": "59636E", "accent": "1F4E79", "accent_soft": "E8EEF5"},
  "slides": [
    {"layout": "title", "title": "Shorter waits at every store", "subtitle": "A first conversation with Acme"},
    {"layout": "numbers", "title": "Acme in 2024", "numbers": [
      {"value": "$3.1B", "label": "Revenue, up 4%", "fact": "f1"}]},
    {"layout": "points", "title": "Empty shelves cost Acme $450M of sales", "facts": ["f4"], "points": [
      {"text": "$450M of sales lost to empty shelves in 2024", "facts": ["f4"]},
      {"text": "Do stores still count stock by hand?"}], "notes": "what to say"},
    {"layout": "steps", "title": "A 7-week pilot in one region", "facts": ["f1"], "steps": [
      {"heading": "Weeks 1-2", "text": "Connect your stock data", "facts": ["f1"]}]},
    {"layout": "keep", "from_slide": 3},
    {"layout": "keep", "from_slide": 5, "replace": [{"old": "Hub", "new": "Console"}]},
    {"layout": "section", "title": "Appendix", "part": "appendix"}
  ]
}
```

- `format`: `slides` (16:9), `page` (portrait: one-pager or brochure; `page_size` is `a4` or `letter`), or `web`
  (full-width sections, HTML only). A PowerPoint is made only for `slides`.
- `outputs`: any of `html`, `pptx`, `pdf`. The HTML is always made.
- `part`: `main` (the default) or `appendix`. Only main slides count toward `slide_count`.
- Every line cites its own facts: each point is `{"text": ..., "facts": [...]}`, each step, column and stack
  block has `facts`, each `numbers` item names its `fact`. The slide's own `facts` back its title. A point in a
  column may use its column's `facts`. A line ending in "?" is a question for the meeting and needs no fact.
  Fact ids go in `facts` only, never in the words. `DECK claims` checks all of this.
- `notes`: the speaker notes. Add what to say, in 2 or 3 sentences. Every number in them is in the slide's facts.
- A Sources slide is added at the end on its own. `"sources_slide": false` turns it off (a one-pager).
- `brand`: any key left out takes the plain default. `"title_bold": false` keeps titles regular, as many start decks do. From a start deck, use `fonts_used` and `fills_used` in
  `OUT/start/slides.json` (the most used first): the fonts the slides really use, not the theme's.

## Layouts

| Layout | Fields | Use for |
|---|---|---|
| `title` | title, subtitle | the cover |
| `section` | title, subtitle | a break between parts, and the Appendix break |
| `points` | title, points (2 to 5 short lines) | a claim with its reasons |
| `numbers` | title, numbers (1 to 4: value, label, fact), points (1 or 2, under the boxes) | figures that carry the slide, and what they mean |
| `columns` | title, columns (2 or 3: heading, points, facts) | a comparison, or by-team views |
| `steps` | title, steps (2 to 5: heading, text, facts) | a process, a roadmap, a pilot plan |
| `image` | title, image (a path from `OUT`), caption | a real product screen or diagram the person gave |
| `stack` | title, blocks (each a `points`, `numbers`, `columns`, `steps` or `image` with an optional heading and weight) | a one-pager or a dense brochure page |
| `keep` | from_slide, replace (optional) | a start-deck slide, unchanged except the word swaps |

## The start deck

- `keep` slides from a PowerPoint stay native in the PowerPoint: the copy keeps their shapes, look and notes. New
  slides use the start deck's own blank layout, so its master (logo, background) carries over. The start deck file
  itself is never changed.
- Start-deck slides not listed in `slides` are left out of the copy. "Add to it" means list every slide of the
  start deck, with the new ones placed between them. "Edit it" means list every slide and use `replace` for word
  changes. A slide that needs more than word changes becomes a new slide with the same title.
- From a PDF start deck, a `keep` slide is the page's picture (not editable). Say so in the hand-over.
- A kept slide is the presenter's word, but it may not claim more about our product than need 6 allows. The
  claim checker reads its lines too. A line that goes too far is narrowed with `replace`, and the hand-over says so.
- A 4:3 start deck stays 4:3 when slides are kept: the check then fails on 16:9. Write that down with `STATE decide`
  and say it in the hand-over.

## Draw and look

`DECK render` draws every slide: the HTML through Chrome (this also makes `out/deck.pdf`), and the PowerPoint
through macOS Quick Look, one slide at a time. It ends by putting the pictures on sheets, 6 slides a sheet
(`OUT/renders/pptx-sheet-1.png` and on; `html-sheet-` when there is no PowerPoint). Then:

1. Open every picture in `OUT/renders/pptx/` with the Read tool, one by one (`renders/html/` when there is no
   PowerPoint). Then open the sheets, to compare the slides side by side.
2. Look for: text cut off or running out of its box, a title on two lines, a big empty area, boxes of unequal
   size, a slide with too much text, a kept slide that clashes with the new ones.
3. Fix in `deck.json`: fewer words first, then a different layout, then a split into two slides. Make, render,
   and look again.
4. Write `OUT/looked.md` after the last render, one line per slide: `slide 3: numbers, 3 boxes, all fit`.
   The check fails when `looked.md` is older than the newest picture.

Without Chrome there are no HTML pictures and no PDF; without Quick Look (not a Mac) there are no PowerPoint
pictures. When neither works, mark the node left: nothing was seen.
