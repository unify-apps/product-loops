# Build one module (the helper's brief)

The main session sends this to one helper agent per module, with the blanks filled in. The helper never talks
to the person and never runs `loop-state.mjs`.

## The brief to send

> You build one module of a web prototype. Nobody will answer questions, so decide and write down why.
>
> - Product folder: `<PRODUCT>`. Files you may change: `<files this module owns>`. In a shared file, change only
>   the parts for this module (its route, its section, its data) and keep every other part as it is.
> - The brief: `<RUN>/brief.md`. The module: `<name>`, must have `<must-haves>`. The persona: `<persona>`.
> - Requests for this module: `<the open lines of requests.md that belong to it>`.
> - The look: `<the look from the brief>`. If the `product-design` skill is installed (look in
>   `~/.claude/skills/product-design/SKILL.md` and `.claude/skills/product-design/SKILL.md`), load it with the
>   Skill tool first and follow it. Its rules win over the plain look below.
> - If the `write-factual-content` skill is installed, follow it for every word on screen.
>
> Rules:
> 1. Every thing that looks clickable opens real content: a detail, a form that saves, a menu that does what it
>    says, a state change. Never a dead button, never "coming soon", never lorem ipsum or "TODO".
>    If an action cannot really happen in a prototype (send, pay, sync), show its result in the page and say
>    in one short line that it is a demo action. A button that needs a filled field shows a short message on the
>    page when the field is empty, so the click is never silent.
> 2. Use sample data the persona would recognise: real-looking names, dates and numbers that agree with each
>    other. Keep it in one data block for the module, so the demo node can extend it.
> 3. Every state gets a hash route, so it has its own link: `#/<module>` (the list), `#/<module>/<id>` (a detail),
>    `#/<module>/new` (create), `#/<module>/empty` (no data yet). Add others the module has.
> 4. Start from the plainest version that does the whole job. Leave out what does not help the persona decide
>    or act.
> 5. No page error in the console. No file from the internet unless the brief says so.
> 6. Write every link of this module, one per line with what it shows, to `<RUN>/links/<module>.md`, using the
>    base link `<url>`.
> 7. Then run `node "<CLICKS path>" <RUN>/links/<module>.md --out <RUN>/build/clicks-<module>.json --shots
>    <RUN>/shots/<module> --tools <RUN>/tools`, fix what it names, and run it again until it says PASS.
>    Open two or three of the shots and fix anything cut off or overlapping.
> 8. Reply in at most 10 lines: the files changed, the links, the click result, the request lines done (by
>    number), and each choice you made on your own.

## The plain look (when the person has no look and no `product-design` skill)

- One sans-serif font stack: `system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`. Sizes 13, 14, 16, 20, 28.
- White background, near-black text (`#1a1a1a`), grey for secondary text (`#6b6b6b`), hairlines (`#e6e6e6`).
- One accent colour for the main action and the selected item. Colour means something: status, danger, selected.
- A left navigation with the modules, a page header with the title and the one main action, then a list.
  A row opens its detail.
- Spacing on a 4 px grid. Equal gaps. Text aligned to text.
- Calm motion: 150 to 250 ms, no jumps, nothing moves the layout.

## After the helper

The main session runs the same `CLICKS` command itself. The helper's own PASS is not the proof.
