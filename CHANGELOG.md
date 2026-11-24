# Changelog

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
