# Make the changes (built-in step)

Used by node 4 when no design skill is installed. When one is, the skill's rules win over the taste parts of
this file. The checks below still apply.

## Before the first edit

- Read the prototype's own styles first (its CSS variables, classes and components). Every change uses them.
  A new colour, size or font that the prototype does not already use needs a reason in `decisions.md`.
- Find each row's element in the code by its visible text, then read the code around it. Check what else uses
  the same class or component. A rule on a shared class changes every screen that uses it.
- A rule changes every element its selector matches, not only the one the note named. After a style change,
  list what it matches: `CHECK eval ... --js "[...document.querySelectorAll('<selector>')].map(e => e.className + ' ' + e.innerText.slice(0, 20))"`.
  Each one must be something the row names. Narrow the selector when it is not (a list's header row is not a
  list row, unless the note says so).

## How to make each kind of change

| Kind of note | How | Check (write the real output to change-checks.md) |
|---|---|---|
| Spacing or size ("too tight", "8px", "too big") | Change the one rule that sets it, scoped to the element the note names. Use a value already on the page when the note gives none. | `CHECK eval ... --js "getComputedStyle(document.querySelector('<sel>')).paddingTop"` prints the value. |
| Rename | Change the label where it is defined. In a prototype with a label list or a constant, change it there once. | The old text is gone from `after/<screen>.txt`; the new text is there. |
| Remove (a description, a line, a badge) | Delete the element and the code that only it used. Do not leave an empty gap. | The text is gone from `after/<screen>.txt`; the screenshot shows no gap. |
| A button or link that does nothing | Make it do the thing the note says. With no detail in the note, give it the plainest working result: open the panel, page or form its label promises, with real content. Never a "coming soon" message. | `CHECK click ... --text "<label>"` prints `works:` with the new thing. Then try the next step of that flow in one `CHECK eval` (set each field's `value`, click the submit button, return the result), and add the open state to `screens.json` as its own screen (`<screen>-<state>`, with an `open` step), so every later capture, the design check and the review see it. |
| Move or align ("put them side by side", "not aligned") | Change the layout rule of the parent, not with a fixed offset. | `CHECK eval` with `getBoundingClientRect()` of both elements: same top, or same left edge, as the note says. |
| Colour | Use the prototype's own colour variable. | `CHECK eval` of `getComputedStyle(...).color` or `backgroundColor`. |
| A vague note ("looks off", "clean this up") | Do the reading written in the row in node 1. | Open the before and after screenshots and say in one line what changed and why it answers the note. |
| A redesign of a named screen | Keep its job, its data and its links. Change the layout and parts as the notes say. Propose nothing bigger than the notes. | Every action the screen had before still works (`CHECK click` each one), and every row on it is done. |

## Rules

- Change only what a row asks for. A fault you notice that no row names goes under Proposals. This covers
  code too: no extra fallback text, no changed format for a case the note did not name, no wiring for a
  control that was dead before the run. Each is a Proposal, or a `STATE decide` when a row cannot work without it.
- Keep every screen's links and actions working. A click that worked before must still work.
- Real content only: no "lorem ipsum", no "TODO", no placeholder names.
- After each row, reload and look. A check that passes on text alone can still look wrong.
- When a note leaves a real choice open, pick the plainer option, run `STATE decide`, and name the other one
  under Proposals.
