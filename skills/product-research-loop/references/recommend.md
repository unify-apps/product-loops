# Recommend: the product brief

Write `brief.md` in the out folder. It is what a person, or a build loop, starts from. It ends in the ranked
module list, so the last `##` section is always `## Ranked modules`.

## Shape

```markdown
# <Product>: what to build first

Date: <today>. Decision: <need 1>. Persona: <persona, one line>. Market: <market>.
Rivals studied: <names, or Rival A, B, C>. Sheet: capability-sheet.csv (<n> rows).

## Bottom line
Three lines at most: what to build first, and the one way it beats the rivals.

## Persona and job
The persona in two lines, then the job steps from thinking.md as a numbered list.

## Principle
The bold rule from thinking.md.

## What the rivals do
A short table: category, what most rivals have, where they are weak. Cite sheet ids.

## Where we beat them
Each `beat` row worth building, one line each, with its sheet id and source.

## Later and cut
What waits, and what is cut, each with the reason in a few words.

## Not sure yet
Claims marked `unverified`, pages that would not open, and the questions for the person. Each with the sheet id.

## Ranked modules
| Rank | Module | What it does | Job step | Matrix rows | How we beat or match | First release |
|---|---|---|---|---|---|---|
| 1 | Online booking | Patients book a free slot from the clinic's site | 1, 2 | C01, C04 | Match: all rivals have it; ours needs no app | yes |
```

## Rules for the ranked list

- Rank by build order: what the persona needs first to get the job done, then what makes us better.
- `Rank` is 1, 2, 3 ... with no gap.
- `Job step` names the step numbers from `## Persona and job`. Never empty.
- `Matrix rows` lists one or more ids that exist in `capability-sheet.csv`.
- `First release` is `yes` for the top N (need 10), `no` for the rest.
- Every module comes from the `## Modules` table in `thinking.md` and was not cut.
- When need 11 says "Rival A, B, C", replace real rival names everywhere in the brief, but not in the sheet or
  the rival files.
