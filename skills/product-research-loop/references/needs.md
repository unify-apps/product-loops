# What each node needs

Node 1 reads this file to build its one round of questions. For every need: look in the places listed first.
Ask only what is still missing and would change the result. Ask at most 7 questions, the track (quick or full)
included. A persona you drafted
yourself (need 3) is always one of them; a persona the message or `CLAUDE.md` gives is shown in the brief, never
asked. How bold (need 16) is one of them unless the message says. A need whose default
you could fill from what you found (for example the market, when every rival found sells in one country) is
not a question: show it in the brief. Every other need shows
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
| 1 | **The decision.** What this run decides: a capability matrix (a full feature list of the rivals), the first modules, a full feature set, how to stand out, names, or go or no-go. | matrix, think, recommend | When the message asks for a feature list, a matrix, a comparison sheet or a benchmark: the matrix is the main output, then where we beat the rivals, then the modules. Else: the first modules to build, ranked in build order. |
| 2 | **The product.** What it is, in one line, and the category it sits in. | research, think | The product the message names. Ask when the message names none. |
| 3 | **The persona.** Who uses it every day, and who pays for it when that is someone else. | think, recommend, review | The one the message names. When it names none, draft one from the rivals' "who it is for" lines and ask it as a question, with your draft as the default. Say in the question that the persona only ranks the modules: it never takes a row out of the sheet. |
| 4 | **What we have today.** Features that already exist, so a row can be marked `have`. | matrix | Nothing yet: a new product. Every row is `gap` or `beat`. |
| 5 | **Rivals.** The products to study. | research | The ones named. When fewer than 3 are named, add the best-known ones found by web search until there are 3. At most 5. |
| 6 | **Market.** The country or region, since rivals and rules change by market. | research | The market the message or the rivals point to. Else the rivals' main market. |
| 7 | **Sources.** Which pages count, and which kinds of source every helper must try. | research | Public pages only, no sign-in, no paid reports, no trial sign-up. Kinds to try for every rival: product pages, help centre or docs, release notes or changelog, pricing, public reviews, and every kind the person names (videos, social posts, press releases, ...), in their words. |
| 8 | **Depth.** How much to read per rival. | research | Up to 12 pages and 40 features per rival. When the person says comprehensive, full, every or all: up to 25 pages and 100 features. |
| 9 | **Fixed and refused.** Modules that must be in, things that must not be in, names that are taken. | think, recommend | None. |
| 10 | **First release size.** How many ranked modules make the first release. | recommend | Rank every module. The top 3 are the first release. |
| 11 | **Rival names in the brief.** Keep real names, or use "Rival A, B, C". | recommend | Keep real names: the brief stays on this laptop. |
| 12 | **Where to save.** The folder for the brief and the sheet. | all | `research/<short name>/` in the working folder. Nothing is published or sent. |
| 13 | **Sharing.** Publish or send the brief anywhere. | handover | No. The files stay on this laptop. Only a clear "publish it to X" in the answer changes this. |
| 14 | **Groups.** The category words of the sheet. | research, matrix | The person's own group words, exactly as they wrote them, first. Each example they gave under a group is a capability every helper looks for. Then plain words for what does not fit them. |
| 15 | **Sheet file.** The file kind the person wants the sheet in. | matrix, handover | `capability-sheet.xlsx` (Excel, which Google Sheets also opens) and `capability-sheet.csv` are always made. A Google Sheet or a shared link is made only when the person asks for one, and only with a Google Drive tool this session has. |
| 16 | **How bold.** Which ideas the brief leads with: catching up with the rivals, or ideas no rival has (a new way to do the job, not a small addition). | think, recommend, review | Both. The brief gets `## Ideas no rival has`: at least 3, each tied to a persona pain or a sheet row, ranked by how big the win is. When the person picks bold, the ranked modules lead with them; when they pick catch-up, the ideas stay a short list. Unless the message already says, this is always one of the questions. |

## The start check (node 1, before the questions)

- Run one WebSearch for the category (for example "<category> software"). It must return results.
- Run one WebFetch on the home page of one named rival, or of the first search result. It must return text.
- The run opens 30 to 50 web pages after the person leaves. If the start check's WebSearch or WebFetch asked
  the person for permission first, add this line to the questions message:
  "Allow web reads for this run (choose 'don't ask again' when asked), or the research will stop while you
  are away."
- When the person asks for a Google Sheet, or a link to the sheet: look in this session's tool list for a Google
  Drive or Google Sheets tool. When there is one, the default is the `.xlsx` plus an upload to their Drive, and the
  link goes in the hand-over. When there is none, say so with the questions: "I can make the Excel file, but not a
  Google Sheet link: no Google Drive tool is connected." The default is then the `.xlsx` file only. Never offer a
  web page or another kind of link in its place.
- If WebSearch is missing, say research will use only pages the person names or that can be guessed
  (`<rival>.com`, `<rival>.com/pricing`, `help.<rival>.com`). If both fail, say so with the questions: the run
  can still go, but the stop fact will not be met and the hand-over will say why.

## What "go with the defaults" means

Every need above takes its default. It never means publish, send, sign up or pay.
