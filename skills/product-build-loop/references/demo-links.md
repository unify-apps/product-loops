# Demo links

The aim: the person can open the product tomorrow and show it, starting from any state, with data that holds up.

1. **Data that agrees.** Read every module's data block. The same person, record, date or number must match
   everywhere it shows up (a book in one module is the same book in another). Fix what does not match.
2. **One full record per module.** Put the most complete record first in each list, so a demo opens on it. It
   should pass through every state the module has (for example: suggested, voted on, read, discussed).
3. **Fixed dates.** Pin "today" to one date in the data, so the demo looks the same on any day.
4. **A link per state.** Write `RUN/links.md` from `RUN/links/*.md`, grouped by module:
   `- <what it shows>: <url>#/<route>`. Every list, one detail, every create flow, every empty state, and any
   error or limit state the module has. Add `<url>brand-options.html` when node 3 made it.
5. **Extras the brief asked for.** A PDF guide: one screen per page from the shots, with a one-line caption each.
   A public link: only when the person asked for it in node 1. If it needs a sign-in that is not there,
   `STATE hold --step "publish the public link" --kind sign-in --why "<why>"` and go on.
6. **Check:** `CLICKS RUN/links.md --out RUN/demo-clicks.json --tools RUN/tools` says PASS. A word the check
   calls a placeholder that is real content here (for example "TBD" as a status the persona uses): pass
   `--allow <word>` and run `STATE decide` saying why.
