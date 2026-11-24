<h1 align="center">Product Loops</h1>

<p align="center">
  <strong>Hand Claude a product job. Answer its questions once. Come back to the result.</strong>
</p>

Product Loops is a Claude Code plugin for people who design and build products. Each loop is one job, done end to end:

| Type this | It does |
|---|---|
| `/product-loops:product-research-loop` | Decides what to build. Studies rival products, makes a feature sheet with a source on every row, and ends with a ranked list of modules. |
| `/product-loops:product-build-loop` | Builds a clickable prototype of a new product, or adds a feature to one you have. |
| `/product-loops:product-design-loop` | Changes how screens look and work, from your notes or screenshots, all in one go. |
| `/product-loops:product-review-loop` | Reviews a whole prototype screen by screen, fixes what it finds, and checks again. |
| `/product-loops:product-deck-loop` | Makes a deck, one-pager or brochure for a meeting with a company, with a source behind every fact. |

You do not have to type the command. Ask in your own words ("build me a prototype of…", "make a deck for my meeting with…") and Claude picks the loop.

## How a loop runs

1. **You ask.** A short ask is fine.
2. **It asks you everything at once.** It reads your files first, so it only asks what it cannot find. Every question has an answer already picked. Reply with your answers, or just "go".
3. **You can leave.** After "go" it never asks again. It works through each step, checks each one, and keeps going.
4. **You come back to the result**: links to open, the files it made, the choices it made for you, and anything left for you to decide.

It never publishes, deploys or sends anything outside your laptop unless you asked for it in step 2.

## Install

You need Claude Code (the desktop app or the terminal) and access to the UnifyApps GitHub.

**The easy way.** Open Claude Code and paste this:

```text
Install the product-loops plugin for me: run `claude plugin marketplace add unify-apps/product-loops`, then `claude plugin install product-loops@product-loops`. Then tell me to restart.
```

Restart Claude Code when it says so.

**Or in a terminal:**

```bash
claude plugin marketplace add unify-apps/product-loops
```

```bash
claude plugin install product-loops@product-loops
```

If it says it cannot reach the repository, sign in to GitHub first:

```bash
gh auth login
```

## Update

```bash
claude plugin marketplace update product-loops
```

```bash
claude plugin update product-loops@product-loops
```

## Remove

```bash
claude plugin uninstall product-loops@product-loops
```

```bash
claude plugin marketplace remove product-loops
```

## Your own style

The loops start with plain defaults. They pick up your own way of working from:

- the `CLAUDE.md` file in your project folder, for example your colours, fonts and where you share links;
- your own skills, if you have them installed: `product-research`, `think`, `product-design`, `design-review` and `write-factual-content`. A loop uses each one when it is there, and its own steps when it is not.

## What a run leaves behind

Each run keeps its notes in `loop-runs/<loop>-<date>/` in your folder:

| File | What it holds |
|---|---|
| `brief.md` | Your ask, written out in full, with your answers |
| `decisions.md` | Every choice the loop made for you, so you can change it |
| `handover.md` | What was made, the links, and what is left for you |
| `state.json` | Where the run is, so it can pick up again after a restart |

## Good to know

- **Leave the laptop plugged in.** A run can take an hour. A sleeping laptop stops it.
- **Turn on auto mode** before you leave (shift+tab in Claude Code), so no permission prompt stops the run.
- **The deck loop** sets up its own small Python tools the first time, in `~/.cache/product-deck-loop`.
- **The build, design and review loops** use Chrome on your laptop to click through every screen.
