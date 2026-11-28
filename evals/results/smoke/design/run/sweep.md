# Sweep

## Row 1: The section is called "Customers" wherever it is shown
Find in code: grep -nE '>[^<>$]*\bClients\b[^<>]*<' clinic/index.html
Before (on before/source/index.html): index.html:40 
Changed: 1 (line 40 nav link, done in make-changes). Skipped: 0.
After: no match (exit 1)
Find on pages: grep -l 'Clients' after/*.txt -> no file

## Row 2: A person on the list is called a "customer" wherever the screens show it
Find in code: grep -niE '>[^<>$]*\bclient\b[^<>]*<|placeholder="[^"]*client|No client' clinic/index.html (shown text only: element text, placeholders, messages)
Before (on before/source/index.html): index.html:81 index.html:99 index.html:120 
Changed: 3 (line 81 Today header, line 99 Invoices header, line 120 search empty line; all done in make-changes). Skipped: code names, not shown to people: route #/clients and screen key clients() (lines 40, 85, 134), data fields client: (50-54, 65-68, 82, 126), array clients and renderClients (56, 117, 118), element ids client-search and client-rows (87, 90, 119, 134). They are an address and code names (answer 2: they stay).
After: no match (exit 1)
Find on pages: grep -il 'client' after/*.txt -> no file

No file changed since compare-changes.md (node 4 already did every place), so no new capture.
Check: 6f149809ae623191d48f6e8ba71b2324 clinic/index.html, same file as at compare-changes.md.
