# What each node needs

Node 1 reads this file to build its one round of questions. For each need: look in the places listed first.
Ask only what is still unknown after that, and always name the default in the question.

Where to look, in this order: the person's message and the files or images in it, the working folder's
`CLAUDE.md`, the notes files in the folder (`notes*.md`, `feedback*.md`, `*.txt` the message points at), the
prototype's own code, and the person's installed skills (see "Step skills" below).

| # | Need | Used by | Default | Where node 1 looks first | Ask? |
|---|---|---|---|---|---|
| 1 | Which prototype | run-prototype | The only one in the working folder. With several, the one changed last. | The message; then `package.json` with a `dev` or `start` script; then `*.html` files, skipping `loop-runs/`, `.claude/`, `node_modules/` and every file named as a reference. List at most 5, newest first. | Only when there are 2 or more and the message names none. |
| 2 | How to run it | run-prototype | Its own `dev` or `start` script; for plain HTML, `scripts/serve.mjs` on its folder. | `package.json`, `README*`, `CLAUDE.md`. | No. |
| 3 | The notes, all of them | make-changes | None: this is the job. | The message, notes files, images. Each image becomes words in `requests.md`: the screen, the element, the change. | Always show the numbered list and ask "anything missing or wrong". Say that notes sent later still join this run. |
| 4 | What a vague note means ("fix the spacing here") | make-changes | Node 1's own concrete reading (a number, the new words, the fields), written in the row and marked `(my reading)`. | The image with the note, the screen it shows, the code. | Only for a note with two real readings. Give your reading as the default. |
| 5 | Each note: this place only, or everywhere it fits | sweep | Everywhere, for a note about a kind of thing (descriptions, dates, spacing of a kind of row, a name). This place only, for a note about one named element. | The words: "everywhere", "all", "every screen", "only". | Only when the words do not say. One question for all the notes, naming which you marked everywhere. |
| 6 | The reference to copy, if any | copy-reference | None. With none, copy-reference is skipped. | The message: a file path, a link, images, a video file, a design file link. | Only when the message mentions a reference but does not give it. |
| 7 | Exact copy, or the flow only | copy-reference | Flow only: the same parts, order and steps, in the prototype's own look. | The words "exactly", "pixel", "same as", "just the flow", "for reference". | Only when there is a reference and the words do not say. |
| 8 | Which screen the reference changes | copy-reference | The screen with the same job (a checkout page for a checkout reference). | The message, the reference's title. | Only when two screens could be it. |
| 9 | Screens that must not change | make-changes, sweep, review | None named: every screen may change only through a note or the sweep. | The words "don't touch", "leave", "only". | No. |
| 10 | Where the result goes | handover | A local link only. Nothing is published, pushed or sent. | The message and `CLAUDE.md`. Publishing happens only when the person asks for it in node 1, in words. "Go" or "use the defaults" never means publish. | No. Mention the default in the brief. |
| 11 | Commit the change | handover | No. The run leaves the changes uncommitted and says which files changed. | The message and `CLAUDE.md`. | No. |
| 12 | Which design rules to follow | make-changes, review | The person's installed design skills and the folder's `CLAUDE.md`; with none, `references/design-check.md`. | The skills list and `CLAUDE.md`. | No. Name what was found in the brief. |

## Step skills

Look in the session's list of skills. When one of these is there, the node runs it with the Skill tool. When it
is not, the node follows the built-in file. Write in `brief.md` which ones were found.

| Skill name | Node | Built-in when missing |
|---|---|---|
| `product-design` (or a design skill the folder's `CLAUDE.md` names) | make-changes, sweep | `references/make-changes.md` |
| `design-review` (or a review skill the folder's `CLAUDE.md` names) | make-changes (its last step), review | `references/design-check.md` |

A step skill may say "propose first" or "wait for approval". Inside this loop nobody is there to answer: take the
option the skill recommends, run `STATE decide`, and list the other options under Proposals in `handover.md`.

## Start check (node 1)

| Check | Command | When it fails |
|---|---|---|
| A browser for screenshots | `CHECK browser` (`CHECK` is defined in SKILL.md) | Say so with the questions. The run then compares page text only, and records that with `decide`. |
| Node 22 or newer | `node -v` | Same as above: `page-check` needs it for the browser. `serve.mjs` works on Node 18. |
| The prototype exists | the search in need 1 | Say so with the questions. Without a prototype the run cannot start. |

**A note whose screen or element is not in the prototype** (an Export button that does not exist, a Home screen
under another name): say so in its row, ask once in the intake with "remove nothing" as the recommended answer,
and after "go" mark the row `left: not in the prototype`. Never guess which other control was meant.
