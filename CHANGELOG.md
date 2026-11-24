# Changelog

## 0.1.2

- product-review-loop: screens are named after their menu labels, so every finding points at the right screen. A fix takes the smallest change made from what the product already has, never a new form or field. Every recheck walks and reviews every screen again. A walk no longer hangs when its browser closes.

## 0.1.1

- product-research-loop: a rival only gets a `yes` on a row when its own page says so; a weaker one gets `partial`. The brief now has a "Must have" list per module and the open questions for the build, each with a default. Helpers are waited for properly.
- product-design-loop: the loop now finds any new size, font or colour that no screen had before. It only fixes buttons a note asks about, and lists buttons that were already broken. The review compares the source code, so a change no note asked for fails. A second review checks everything again, not only what failed.

## 0.1.0

- First release: product-research-loop, product-build-loop, product-design-loop, product-review-loop and product-deck-loop.
