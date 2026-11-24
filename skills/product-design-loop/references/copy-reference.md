# Copy the reference (built-in step)

Used by node 3. The reference is read only. Never edit, move or rename it.

## 1. Get the reference as pictures and text

| The reference is | How to read it |
|---|---|
| A local HTML file, or a web page | Add it to `screens.json` as `reference-<name>` (node 2 does this). `CHECK capture --screens RUN/screens.json --out RUN/reference --only reference-<name>`. You get a screenshot, the page text and the boxes. |
| Screenshots | Read each image. Copy them to `RUN/reference/`. |
| A video file (.mov, .mp4) | `ffmpeg -i <video> -vf fps=1 RUN/reference/frame-%03d.png` (one frame a second). Read the frames, and keep the ones that show a new state. Without `ffmpeg`, `STATE left copy-reference --why "no ffmpeg to read the video"`. |
| A design file link (for example Figma) | Use a design tool the session has, to get a picture and the sizes of the frame. With none, `STATE left copy-reference --why "no tool to open the design file; send screenshots of it"`. |
| A live app that needs a sign-in | Do not sign in. `STATE hold --step "read the reference app" --kind sign-in --why "it needs the person's sign-in"`, then `left`. |

## 2. List every part

Write `reference-parts.md`, one row per part, in the reference's order:

```markdown
Mode: flow only
Target screen: checkout

| # | Part | In the reference | Found on the target | Where |
|---|---|---|---|---|
| 1 | Steps bar at the top | Address, Delivery, Payment | | |
| 2 | Address step with Name, Street, City, Postcode | step 1 | | |
| 3 | Order summary on the right, with the total last | all steps | | |
| 4 | Pay button under the summary | step 3 | | |
```

A part is anything a person would miss if it were gone: a section, a field, a column, a button, a step of a
flow, a state (empty, loading, error), and the order they come in.

## 3. Build it into the target screen

- **Flow only** (the default): the same parts, in the same order, doing the same things. Use the prototype's own
  colours, fonts, sizes and components. Do not copy the reference's look or its sample content; keep the
  prototype's own data.
- **Exact**: also match sizes, spacing, colours and fonts. Measure both with `CHECK eval` (for example
  `getComputedStyle(el).fontSize`, `getBoundingClientRect().width`) and write both values in the row.
- Keep what the target screen already did that the reference does not show. List it in the row notes.

## 4. Check

Capture the target screen: `CHECK capture --screens RUN/screens.json --out RUN/reference-check --only <screen>`.
For each row, find the part in `RUN/reference-check/<screen>.txt` or with `CHECK eval`, and fill
"Found" (yes or no) and "Where". Every row must say yes. Then read the two screenshots side by side and write
one line under the table on what still looks different, and whether the mode allows it.
