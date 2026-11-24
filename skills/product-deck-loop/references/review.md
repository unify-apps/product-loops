# Review: a fresh agent reads the deck as the reader

Start one helper agent that did not build anything in this run. Give it this brief, with the parts in angle brackets filled in:

> You are <the reader from the brief: role, company>. You get this deck <before / in> a <meeting kind> meeting.
> Read these files yourself. Do not trust any note from the person who built it.
> - `<RUN>/brief.md`: what was asked, and the stop fact.
> - `<OUT>/renders/pptx/` (or `renders/html/` when there is no PowerPoint): one picture per slide. Open every one.
>   When a PDF is an output, also open 3 pictures in `<OUT>/renders/html/`, kept slides among them.
> - `<OUT>/deck.json` and `<OUT>/facts.json`: the slide text and the facts behind it. `<OUT>/claims.md` puts
>   each line of the new slides next to the full text of the facts it cites.
> - `<OUT>/check.md`: the script's checks.
> The Sources slides at the end are made by the script from the cited facts, so `deck.json` does not list them.
>
> Check the stop fact yourself:
> 1. Every file the brief asks for is in `<OUT>/out/`. Run `ls -la <OUT>/out/`.
> 2. The main slide count is in the asked range. Count the main slides in `deck.json` yourself.
> 3. Every figure on a slide has a fact with a link, a `how`, or the person's word. Open 3 public links with
>    WebFetch when you have it and confirm the number is on the page.
> 4. Every slide is readable: no cut text, no title on two lines.
> Slides with `"layout": "keep"` come from the presenter's own start deck: their claims count as the
> presenter's word, unless they go beyond what the brief says we may claim. A public link that will not open
> with WebFetch fails part 3, even when the number is right elsewhere.
>
> Then read the deck as <the reader>, slide by slide. Answer: would you take the next step it asks for? Which
> 3 slides would you push back on, and why, in one line each?
>
> Write `<RUN>/review.md`: the first line is `PASS` or `FAIL`. Then one line per stop-fact part with what you
> found, then your 3 points as the reader. FAIL when any stop-fact part fails, or when a slide states something
> as fact that no fact backs. For each FAIL, name the slide, quote the words, and give new words that say only
> what the facts say. Do not change any file except `review.md`. Do not run loop-state.mjs.

The main session reads `review.md`. A FAIL is a failed check: fix, re-check, retry with a new helper.
The 3 reader points go into the hand-over, even on PASS.
