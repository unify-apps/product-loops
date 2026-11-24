# Walk: open every screen and run the script checks

`WALK` is `node "${CLAUDE_SKILL_DIR}/scripts/walk.mjs"`. It needs Node 22 or newer and a Chrome, Chromium, Edge or
Brave already on the computer (or `BROWSER_PATH` set to one). It downloads nothing and changes no file of the
product. It writes only into its `--out` folder.

## 1. Open the product

- A single HTML file or a folder of static files: give the path to `--url`. The walk serves it from 127.0.0.1
  itself, so the page can load its own files.
- An app with a dev server: start it in the background (`npm run dev` or the script `package.json` names), wait
  until `curl -sI http://localhost:<port>` answers, and give that URL. Stop it in the hand-over node only if
  this run started it.
- A URL on another host (a staging link): the walk only looks there. It does not click or type, because a click
  on a real site can send or change something. Say so in `decisions.md`.

## 2. The screens file

`RUN/screens.json` is a list. Each entry is one screen:

```json
[
  { "name": "Inbox", "open": "#inbox" },
  { "name": "Settings", "open": "settings.html" },
  { "name": "New request dialog", "open": "click:text=New request" }
]
```

- `open` is a hash or path from the start page, or a click: `click:text=<the label>` or `click:<css selector>`.
- `WALK --url <product> --find-screens` prints the screens the nav reaches. Start from that list, then add
  screens the nav does not reach: a dialog, a detail page, a second step. Read the source to find them.
- Use the name the product shows for each screen.

## 3. Run it

```bash
WALK --url <product> --screens RUN/screens.json --out RUN/walk/before
```

It prints one line: how many screens, screenshots and script findings. It exits 1 when a screen has no
screenshot or could not open. Then read the line for that screen in `checks.md` and fix `screens.json`.

What it writes:

- `NN-<screen>.png`: the screen at the main width, the whole page. `NN-<screen>.phone.png`: the screen at 390 px.
- `checks.json` and `checks.md`: per screen, the script findings and the words on it, then the words that clash
  across screens.

## 4. What the script checks, and what it cannot

| Finding | How the script finds it |
|---|---|
| `dead-click` | It clicks every visible button, link, tab and pointer-cursor thing (60 at most per screen). Nothing on the page changed, the URL did not change, and nothing opened. |
| `broken-link` | A link to another page of the product that does not load. |
| `console-error` | An error in the browser console while the screen opened or after a click on it. |
| `cut-off-text` | Text wider or taller than its box, in a box that hides the rest. At both widths. |
| `placeholder` | Lorem ipsum, TODO, TBD, "coming soon", `undefined`, `NaN`, `{{ }}`, stand-in images. |
| `broken-image` | An image that did not load. |
| `no-empty-state` | It types a word nothing matches into each search box. The screen emptied and said nothing. |
| `no-loading-state` | Data came in after the first paint, with no loading sign in between. |
| `near-miss-alignment` | Text that starts 1 to 6 px away from the edge its neighbours share. |
| `uneven-spacing` | Alike items in a row or a stack where one gap differs from the others. |
| `mixed-words` | The same words with different capitals across screens, two common names for one thing (sign in / log in, delete / remove), or one name written two ways ("Sign-in" / "Sign in"). |
| `page-scrolls-sideways` | The page is wider than the window, at the main width or at 390 px. |

These are facts, not verdicts. The reviewer decides which are real problems. The script cannot judge: whether
the persona can do their job, whether the content is right, states it cannot reach (an error after a failed
save, a list with no data at all), or anything of taste. The reviewer reads the screenshots and the source for those.

## 5. Look at the screenshots

Read every PNG. A screenshot that is blank, shows the wrong screen, or shows a screen half loaded means the
screens file or the wait is wrong. Fix `screens.json` and walk again before the review starts.
