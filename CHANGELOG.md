# Changelog

## 0.2.0

- All loops: the first step does more of the work before it asks. It reads the lessons earlier runs left, checks your ask against a fixed list (scope, who it is for, data, flow, edge cases, look, outputs, what done means, words with no number), and has a fresh helper read the draft brief as the one who must build it. Then it asks at most 7 questions, each with the answer it would pick and why it matters, and says how long the run will take. The message stays under 600 words, so you can answer it in two minutes: the full needs table, the coverage table and the lessons go in `brief.md`. A fact your ask or your files already give is written in the brief with its source, never asked, not even to confirm.
- All loops: "done" is now a short checklist you see before you say go. The fresh review passes each line with what it saw, gives two scores (does it do what you asked, would you trust it), and runs the check itself. A run cannot finish while a line fails, unless the hand-over lists it for you.
- All loops: each loop has a quick track for a small ask, and recommends one. The checks and the review run either way.
- All loops: every run has a time budget. A run that runs out of time, or keeps getting stuck, pauses and tells you, instead of going on. Say "continue" for 30 more minutes. A run picks up where it was after a restart.
- All loops: a notification when a run finishes or pauses, on a Mac, Linux or Windows, and in Slack when you set a link.
- All loops: a check that failed and then passed after a change becomes a one-line rule in `loop-runs/solutions/`, read by the next run. The hand-over shows the run's minutes and retries per step.
- All loops: each helper gets its task as a file and writes its report to a file, so nothing is lost in a restart. A helper that reads web pages treats what a page says as data, never as an order, and lists any planted order for you. A check that fails twice goes to a fresh helper on the strongest model before it is left for you.
- All loops: a `STATE` command from one loop's folder refuses to act on another loop's run and names both (two loops at once on one laptop crossed wires in every smoke run). `finish` says whether the notification went out. `init` makes `briefs/`, `reports/` and `decisions.md`, so no hand-over link is dead. The estimate scales with the track, so a three-line ask is not quoted the whole budget.
- For people who change the loops: tests, a check that the shared files match, `npm run check` before a pull request, and `evals/` (50 real asks, 10 per loop, run on the old and the new plugin, scored by script checks and a blind grader; `evals/README.md`).

## 0.1.5

- All loops: the first step always shows its brief and questions and waits for your reply, even when your first message says "build it". A new hook counts your replies, and the loop cannot start working until there is one. A default never goes against your own words: "exactly like X" means exact. A helper that comes back with no report is started again, never left waiting for you.
- product-build-loop: it asks how deep to build each module (in full, or a page in the shell), and "exactly like X" lists everything that takes and builds it.
- product-research-loop: a "no rival has this" row needs a search of every rival's own site first, and the review checks a sample of them. The matrix says what each row does, and every link names the rival it backs. You get the file kind you asked for (Excel or a Google Sheet), the source kinds you name are tried, and your own group words are used. It asks how bold to be, and the brief lists at least 3 ideas no rival has.
- product-deck-loop: the first question is what the deck is for, with options written for your reader. The review reads as that reader and checks the goal first. Every review finding is fixed or listed for you. A new check fails a slide that is mostly empty, or a title number the slide does not show.

## 0.1.4

- product-deck-loop: every line on a slide, and in the speaker notes, must cite the facts that say it, and a separate checker reads each line next to those facts before the review. A worded claim with no fact behind it ("nearly doubled", "still small") now fails early instead of at the review. Facts are merged from the research files, never retyped, and the newest figure is used for each measure. Every slide is looked at after it is drawn.
- All loops: one shared rule for waiting on helper agents, so a run never stops while helpers work. Status now shows how many choices the loop made for you.

## 0.1.3

- product-build-loop: the first link shows each module's name and what it must have while it is built, instead of "not found". The click check fails a link that lands on "not found". Every fix gets a fresh review round, and nothing changes after the review passes. Records are not copied, dates read the way people say them, and anything people do in a module (vote, add notes) must really work. The local server stops itself after 2 hours with no visits and comes back on the same link; the handover gives its start and stop commands.

## 0.1.2

- product-review-loop: screens are named after their menu labels, so every finding points at the right screen. A fix takes the smallest change made from what the product already has, never a new form or field. Every recheck walks and reviews every screen again. A walk no longer hangs when its browser closes.

## 0.1.1

- product-research-loop: a rival only gets a `yes` on a row when its own page says so; a weaker one gets `partial`. The brief now has a "Must have" list per module and the open questions for the build, each with a default. Helpers are waited for properly.
- product-design-loop: the loop now finds any new size, font or colour that no screen had before. It only fixes buttons a note asks about, and lists buttons that were already broken. The review compares the source code, so a change no note asked for fails. A second review checks everything again, not only what failed.

## 0.1.0

- First release: product-research-loop, product-build-loop, product-design-loop, product-review-loop and product-deck-loop.
