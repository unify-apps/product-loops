# What each node needs

Node 1 reads this file to build its one round of questions. For every need: look in the places listed first.
Ask only what is still missing and would change the result. Ask at most 6 questions. Every other need shows
in the brief with its value or its default, so the person can change it in the same reply.

Where to look, in this order, for every need:
1. The person's message and any file or link they gave.
2. Files in the working folder: notes, interview write-ups, an earlier `research/*/brief.md`.
3. The working folder's `CLAUDE.md` and the person's own `~/.claude/CLAUDE.md` (voice, naming rules, rivals
   they always use, what may never leave the laptop).
4. The installed skills `product-research` and `think`, when the session lists them. They may hold the person's
   usual rivals for a category, their persona habits and their bar.
5. Earlier runs of this loop: `loop-runs/product-research-loop-*/brief.md` (the answers they gave last time).

| # | Need | Used by | Default |
|---|---|---|---|
| 1 | **The decision.** What this run decides: the first modules, a full feature set, how to stand out, names, or go or no-go. | think, recommend | The first modules to build, ranked in build order. |
| 2 | **The product.** What it is, in one line, and the category it sits in. | research, think | The product the message names. Ask when the message names none. |
| 3 | **The persona.** Who uses it every day, and who pays for it when that is someone else. | think, recommend, review | The person who does the job every day, as the message suggests. The buyer is the owner of the business. |
| 4 | **What we have today.** Features that already exist, so a row can be marked `have`. | matrix | Nothing yet: a new product. Every row is `gap` or `beat`. |
| 5 | **Rivals.** The products to study. | research | The ones named. When fewer than 3 are named, add the best-known ones found by web search until there are 3. At most 5. |
| 6 | **Market.** The country or region, since rivals and rules change by market. | research | The market the message or the rivals point to. Else the rivals' main market. |
| 7 | **Sources.** Which pages count. | research | Public pages only: product pages, help centre, pricing, release notes, public reviews. No sign-in, no paid reports, no free trial sign-up. |
| 8 | **Depth.** How much to read per rival. | research | Up to 8 pages and 25 features per rival. |
| 9 | **Fixed and refused.** Modules that must be in, things that must not be in, names that are taken. | think, recommend | None. |
| 10 | **First release size.** How many ranked modules make the first release. | recommend | Rank every module. The top 3 are the first release. |
| 11 | **Rival names in the brief.** Keep real names, or use "Rival A, B, C". | recommend | Keep real names: the brief stays on this laptop. |
| 12 | **Where to save.** The folder for the brief and the sheet. | all | `research/<short name>/` in the working folder. Nothing is published or sent. |
| 13 | **Sharing.** Publish or send the brief anywhere. | handover | No. The files stay on this laptop. Only a clear "publish it to X" in the answer changes this. |

## The start check (node 1, before the questions)

- Run one WebSearch for the category (for example "<category> software"). It must return results.
- Run one WebFetch on the home page of one named rival, or of the first search result. It must return text.
- If WebSearch is missing, say research will use only pages the person names or that can be guessed
  (`<rival>.com`, `<rival>.com/pricing`, `help.<rival>.com`). If both fail, say so with the questions: the run
  can still go, but the stop fact will not be met and the hand-over will say why.

## What "go with the defaults" means

Every need above takes its default. It never means publish, send, sign up or pay.
