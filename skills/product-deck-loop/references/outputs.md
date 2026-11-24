# Outputs: the final files

`DECK make`, `DECK render`, look at every slide, write `looked.md`, then `DECK check --dir OUT`. The full check is
the stop fact:

| Check | What it proves |
|---|---|
| count | the main slide count is in `slide_count` |
| figures | every number on a new slide is in a fact the slide cites; every public fact has a link, every estimate a `how` |
| fit | every text box fits; titles are on one line |
| open | each output opens: the PowerPoint loads, is 16:9, has the right number of slides, real text on every new slide, and no slide that is one big picture; the PDF has one page per slide |
| looked | a picture of every slide exists, made after the last `make`, and `looked.md` has a line for each, written after the last picture |

## The files

| File | What it is |
|---|---|
| `OUT/out/deck.html` | the deck in a browser, one slide after another; prints one slide a page; holds its pictures inside, so it still works when moved or sent |
| `OUT/out/deck.pptx` | the editable PowerPoint. Opens in PowerPoint, Keynote and Google Slides |
| `OUT/out/deck.pdf` | made from the HTML by Chrome, when `pdf` is in `outputs` |

The PowerPoint uses the fonts named in the brand. A font the reader's computer lacks is replaced when the file
opens. Say in the hand-over which fonts the deck uses.

## Artifact (only when node 1's answer asked for one)

A claude.ai Artifact is a private web page the person can share later. Make one only when the person's node 1
answer asked for it in words. "go" never means publish.

- When the Artifact tool is in this session: publish `OUT/out/deck.html`. Pass the kept slides' pictures it uses
  with `files`. Put the link in `OUT/outputs.md` and in the hand-over.
- When it is not (a headless run has none): do not look for another way to publish. Write in `OUT/outputs.md`:
  "Artifact not made: the Artifact tool is not in this session. Open deck.html, or publish it from a Claude chat."
  The node is still done: the Artifact is an extra, not part of the stop fact.

Nothing else is sent anywhere. No upload, no email, no shared drive.
