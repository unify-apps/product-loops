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
2. **It asks you everything at once.** It reads your files first, so it only asks what it cannot find: at most 7 questions, each with the answer it would pick and why it matters. It says how long the run will take, and what "done" will mean, as a short checklist. Reply with your answers, or just "go".
3. **You can leave.** After "go" it never asks again. It works through each step, checks each one, and keeps going.
4. **You get a notification** when it finishes, or when it pauses.
5. **You come back to the result**: links to open, the files it made, the checklist with each line passed or not, the choices it made for you, and anything left for you to decide.

### Quick or full

Each loop offers a quick track for a small ask, and recommends one. The quick track skips the extras (for example, the build loop skips the name options and the demo links; the deck loop makes the HTML deck and a PDF of 6 to 8 slides, with no PowerPoint). The checks and the fresh review run either way.

### Time budget and pause

Every run has a time budget (60 to 120 minutes, by loop). If it runs out, or the loop keeps getting stuck, the run pauses instead of going on forever, and you get a notification. Say "continue" to give it 30 more minutes, or "stop" to end it. A run also picks up where it was after Claude Code restarts.

### It learns

When a check fails and then passes after a change, the loop writes that down as a one-line rule in `loop-runs/solutions/<loop>/`. The next run reads those rules before it asks you anything, and lists the ones it used in its brief.

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
| `stop-fact.json` | The "done means" checklist, and which lines the fresh review passed |
| `review.md` | The fresh review's verdict, with two scores: does it do what you asked, and would you trust it |
| `metrics.json` | Minutes, retries and choices per step |
| `decisions.md` | Every choice the loop made for you, so you can change it |
| `handover.md` | What was made, the links, and what is left for you |
| `state.json` | Where the run is, so it can pick up again after a restart |

Lessons from all runs of a loop live in `loop-runs/solutions/<loop>/`, one small file per rule. Delete one to make the loops forget it.

## Good to know

- **Leave the laptop plugged in.** A run can take an hour. A sleeping laptop stops it.
- **Turn on auto mode** before you leave (shift+tab in Claude Code), so no permission prompt stops the run.
- **The deck loop** sets up its own small Python tools the first time, in `~/.cache/product-deck-loop`.
- **The build, design and review loops** use Chrome on your laptop to click through every screen.
- **Notifications.** On a Mac you get a notification and a short spoken line when a run finishes or pauses. Set `PRODUCT_LOOPS_QUIET=1` to turn off the spoken line. Set `PRODUCT_LOOPS_NOTIFY_URL` to a Slack webhook link to get a message there too.

## Changing the loops

The rules every loop shares live in `shared/`. A script copies them into each loop, so edit `shared/`, never a loop's own `shared/` folder. Run `npm run check` before a pull request: it copies the shared files, checks every skill file, and runs the tests.
