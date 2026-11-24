# What each node needs

Node 1 reads this file to build its one round of questions. For every need: fill it from the places in "Look
first" when you can, else take the default. Ask only what you could not find and what changes the build.

Places to look, in this order:
1. The ask itself, and every file or link it gives.
2. The working folder: `CLAUDE.md`, `README*`, an `index.html` or `package.json`, logo and icon files
   (`*.svg`, `*.png` with logo, icon or mark in the name), screenshots.
3. Earlier runs here: `loop-runs/product-build-loop-*/brief.md` and `handover.md`, and a research brief
   (`loop-runs/product-research-loop-*/`, or a file named like `*brief*`, `*research*`, `*spec*`, `*prd*`).
4. The person's installed skills, when present: `product-design` (their look and rules), `design-review` (their
   review bar), `think`, `product-research`, `write-factual-content` (their writing rules).

## Needs per node

| Node | Need | Default | Look first |
|---|---|---|---|
| intake | New product, or which existing one | the one the ask names, else new | 1, 2, 3 |
| intake | Is there a brief, or run research first | build from the module list drafted here | 3 |
| run-link | Product folder | existing: where its `index.html` or `package.json` is; new: `<working folder>/<slug>/` | 2, 3 |
| run-link | How it runs | the folder's own dev script if it has one, else plain files served by `serve.mjs` | 2 |
| run-link | File shape | what the folder uses; new: one `index.html` with its CSS and JS inside | 2 |
| name-mark | Name and mark | 3 options, the first one used in the product | 1, 2 |
| build-modules | Persona: who uses it, and the one job they come to do | drafted from the ask, shown in the brief | 1, 3 |
| build-modules | Modules in build order, with the must-haves of each | drafted from the ask: 2 to 4 modules | 1, 3 |
| build-modules | Screens or products to follow, and exact or flow only | none; flow only | 1, 2 |
| build-modules | Look: logo and icon files, colours, fonts | the product's own look; else the `product-design` skill; else the plain look in `build-module.md` | 2, 4 |
| build-modules | Photos of people | none: initials only (nothing is downloaded) | 1 |
| build-modules | Two versions behind a key where a layout choice is open | no: build the pick, list the other in proposals | 1, 4 |
| review-modules | The review bar | the `design-review` skill; else `review-module.md` | 4 |
| demo-links | Demo extras: a PDF guide of the screens | none | 1 |
| demo-links | Where it ships | this laptop only (a local link) | 1 |
| review | Nothing new | the stop fact | — |
| handover | Nothing new | — | — |

## The questions

Show the brief first. Then ask, as one numbered list, only the questions below whose answer you could not find.
Each question names the default you picked. At most 8. Leave out a question when the ask already answers it.

1. What we build on: a new product in `<folder>`, or the existing one at `<path>` (list up to 5 found).
   Default: <your pick>.
2. Only when no brief exists and the feature set is open: run `product-research-loop` first?
   Default: no, build from the modules below.
3. Who uses it, and the one job they come to do. Default: <drafted persona>.
4. The modules in build order, and what each must have. Default: <drafted list>.
5. Screens or products to follow, and exact or flow only. Default: none, flow only.
6. Your logo and icon files, colours and fonts. Default: <what was found, or the plain look>.
7. Only for a new product: a name you have, or 3 options to pick from later. Default: 3 options, the first used.
8. Extras: photos of people, two versions behind a key, a PDF guide, a public link.
   Default: none of them; the product stays on this laptop.

End with: `Reply with your answers, or just "go" to use the defaults.`

## What goes in the brief

The goal in one line, the persona, the module list with must-haves, what to follow, the look, the name plan, the
extras, the product folder, how it runs, the browser the start check found, every request line, and the stop fact.
Write what the person said in their words. Mark each default as a default.
