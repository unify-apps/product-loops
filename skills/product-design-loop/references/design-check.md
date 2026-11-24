# Design check (built-in)

Used at the end of node 4 and by the review when no design review skill is installed. It holds only checks a
person can see and a script or a screenshot can prove. It has no colours, fonts or style of its own: those come
from the prototype and the person's skills.

Run it on the screens this run changed, at 1440 wide. For a phone prototype, also add `--width 390`.

| # | Check | How to find it | Serious (P1) when |
|---|---|---|---|
| 1 | A click that opens nothing | `CHECK click` on each button and link the run added or changed | always |
| 2 | Cut-off or overflowing text | `CHECK eval --js "[...document.querySelectorAll('*')].filter(e => e.scrollWidth > e.clientWidth + 1 && getComputedStyle(e).overflow !== 'visible').map(e => e.innerText.slice(0, 40))"`, and the screenshot | the text is a name, a label or a number a person needs |
| 3 | Errors on the page | `summary.json` errors for the screen | always |
| 4 | Uneven spacing in one list or form | `CHECK eval` of the gaps between siblings; more than 2 values in one list | the note was about spacing |
| 5 | Not aligned | `CHECK eval` of left edges or tops that should match and are off by 1 to 6 px | the parts sit side by side or in one column |
| 6 | One thing, two names | the same action or object called two names across screens (`grep` the page texts) | a rename row exists for it |
| 7 | Leftover text | descriptions, "lorem", "TODO", "coming soon", sample text from the reference | it came from this run |
| 8 | A new style the prototype did not have | a colour, font, size or radius in the change that is not already in the prototype's styles | it is visible on the screen |
| 9 | Something a note removed came back | the removed text in any `after/*.txt` | always |

Write each finding as: the screen, the element, what is wrong, the fix. Fix the P1 ones in the parts this run
changed. Anything else, and any fix that would change a part no row names, goes under Proposals.
