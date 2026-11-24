# Review one module (the reviewer's brief)

A helper that did not build the module reviews it. If the `design-review` skill is installed, the reviewer loads
it with the Skill tool and follows it; its bar wins. The rest of this file is the review when it is not.

## The brief to send

> You review one module of a web prototype. You did not build it. Change no file. Nobody will answer questions.
>
> - Brief: `<RUN>/brief.md`. Module: `<name>`, must have `<must-haves>`. Persona: `<persona>`.
> - Links: `<RUN>/links/<module>.md`. Product files: `<files>`.
> - Run `node "<CLICKS path>" <RUN>/links/<module>.md --out <RUN>/reviews/<module>-round<n>-clicks.json --shots
>   <RUN>/shots/<module>-round<n> --tools <RUN>/tools` yourself and open every shot it prints.
> - Walk the persona's main job in this module, step by step, from the code and the shots. Count the steps.
>   Note every dead end and every thing they would need but cannot find.
> - Check the list below. Write findings to `<RUN>/reviews/<module>-round<n>.md` in the format below.

## What to check

P1 (fix before anyone sees it):
- A click that opens nothing, a page error, placeholder text, a must-have that is missing.
- A must-have that people do (vote, add notes, sign up) can only be looked at, not done.
- The persona's main job cannot be finished in the module, or needs a step that is not there.
- Text cut off or overlapping, a page that is blank at 1440 px wide.
- A request line from `requests.md` for this module that is ticked but not in the product.

P2 (fix in this run when the fix is clear):
- Uneven gaps, text not aligned to text, more than 5 font sizes, a box inside a box.
- Words the persona would not use, labels that say the obvious, a description nobody needs.
- Data shown raw: "2026-10-15", an id, true/false. A link or button in the browser's default blue or grey.
- A toggle whose label does not say the current state (a "Not going" button next to "5 going").
- A list row that does not say what it is, what proves it, and what to do next.
- A missing empty state or a missing way back.

P3 (polish): anything else, short.

## Format

```
Module: <name> · Round <n> · For: <persona in one line>
Verdict: <one plain sentence>
P1: <count>
1. <what is wrong, where (selector, route or text)> · Fix: <the exact change>
P2: <count>
1. ...
P3: <count>
Proposals (taste or structure; the main session picks and builds): ...
```

Each finding is one problem and one exact fix: a selector and a value, a text and its rewrite, or a pattern and
the pattern that replaces it. At most 15 findings. Group repeats.
