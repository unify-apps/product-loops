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

## Questions for the build
Every choice a builder of the first-release modules would still have to ask, each with the answer to use when
nobody replies. For example: which outside system to connect first (or fake it in a prototype), where the
persona starts, what a module leaves out. Write "none" when there is none.

## Ranked modules
| Rank | Module | What it does | Must have | Job step | Matrix rows | How we beat or match | First release |
|---|---|---|---|---|---|---|---|
| 1 | Online booking | Patients book a free slot from the clinic's site | Pick a visit type; see free slots for one week; book with name and phone; staff see it on the day view | 1, 2 | C01, C04 | Match: all rivals have it; ours needs no app | yes |
```

## Rules for the ranked list

- Rank by build order: what the persona needs first to get the job done, then what makes us better.
- `Rank` is 1, 2, 3 ... with no gap.
- `Must have` lists the 2 to 5 things the persona must be able to do when the module is done, in their words,
  separated by `;`. A build starts from this column, so it is never empty. A module that needs an outside
  system (records software, a text sender, a card payment) names which one here, or says "faked first".
- `Job step` names the step numbers from `## Persona and job`. Never empty.
- `Matrix rows` lists one to 4 ids that exist in `capability-sheet.csv`. A module that needs more is two modules.
- `First release` is `yes` for the top N (need 10), `no` for the rest.
- Every module comes from the `## Modules` table in `thinking.md` and was not cut.
- When need 11 says "Rival A, B, C", replace real rival names everywhere in the brief, but not in the sheet or
  the rival files.
