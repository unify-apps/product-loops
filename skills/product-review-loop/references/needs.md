# What each node needs

Node 1 reads this file to build its one round of questions. For each need: what it is, its default, and where
to look before asking. Ask only what you could not find. Put every value, found or default, in `brief.md`.

## Where to look first, for every need

1. The person's message, and any files or links in it.
2. The working folder's `CLAUDE.md`, and any `README`, brief, spec or PRD file in the folder.
3. The prototype itself: its file names, its title, its headings, the words on its screens.
4. The person's installed skills. A skill named `design-review` holds their review rules. A skill named
   `product-design` holds their look and their words. Read their SKILL.md when they are there.
5. Earlier runs of this loop in `loop-runs/`: their `brief.md` and `handover.md`, for the persona and the bar.

## walk

| Need | Default | Where to look |
|---|---|---|
| The product: a file, a folder or a local URL | The only prototype in the folder. With several: the HTML file or app folder changed last. Name your pick in the brief. | The message; `index.html` or `*.html` in the folder; a `package.json` with a `dev` or `start` script; `CLAUDE.md` |
| How to run it | A single HTML file or a plain folder: no server (the walk serves it itself). An app with `package.json`: its `dev` script, on localhost. | `package.json` scripts; `README` |
| The screens | Every screen the nav reaches, from `walk.mjs --find-screens`, plus any screen the message names. | The message; the nav; the source's routes |
| Screen width | 1440 px, plus a check at 390 px for a phone. | `CLAUDE.md`; the message ("desktop only", "phone first") |

## review

| Need | Default | Where to look |
|---|---|---|
| Who uses it, in one line | Read from the product's words. Example: "a nurse who swaps shifts with others on the ward". Say it is a guess. | `CLAUDE.md`; brief or PRD files; the screens' words |
| The one job they come to do | The main action on the first screen. | The same places; the first screen's primary button |
| Their own rules | The built-in `checklist.md` only. | `CLAUDE.md`; the `design-review` skill; the message |
| What to focus on | Every screen equally. | The message (`$ARGUMENTS`) |

## fix

| Need | Default | Where to look |
|---|---|---|
| Fix or report only | Fix. | The message ("just list", "don't change anything" means report only) |
| The bar | Fix P1 and P2. P3 is listed, never fixed. | The message; `CLAUDE.md` |
| How new things should look | Match what the product already does: its own colours, fonts, spacing and words. | The product's CSS; the `product-design` skill; `CLAUDE.md` |
| May it change files in place | Yes, with a copy of each file kept in `RUN/original/` before its first change. | A git repo with changes not yet saved is still fine: the copy is kept anyway. |

## recheck

| Need | Default | Where to look |
|---|---|---|
| Rounds | At most 3. Fixed: not a question. | none |

## handover

| Need | Default | Where to look |
|---|---|---|
| Where the result goes | `handover.md` in the run folder, on this laptop. Nothing is deployed, posted or sent. | Only the person's own intake answer can change this. "Go with the defaults" never means publish. |

## The questions, as node 1 asks them

Ask only the ones still open after the look-up. Each names its default.

1. Which prototype should I review? Default: `<the one you found>`.
2. Which screens? Default: all `<n>` screens the nav reaches: `<names>`.
3. Who uses it, and what one job do they come to do? Default: `<your guess from the screens>`.
4. Should I fix what I find, or only report it? Default: fix, keeping a copy of every file I change.
5. What should I fix: P1 and P2, or P1 only? Default: P1 and P2.
6. Any rule of your own to check? Default: the built-in checklist `<plus the skills or CLAUDE.md rules you found>`.
