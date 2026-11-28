# Design check (built-in references/design-check.md; no design-review skill installed)

Changed screens: today, customers, customers-search-empty, invoices, settings (nav label on all). Width 1440.

1 click: CHECK click nav a[href="#/clients"] (renamed "Customers") on today -> works: address changed to #/clients, Customers list shown. The run added no control. "New appointment" was dead before the run, no row asks to make it work: under Broken before the run, not P1. OK
2 cut-off text: CHECK eval overflow filter on every changed screen -> today [], customers [], customers-search-empty [], invoices [], settings [""] (an empty-text element, not a name, label or number). OK
3 errors: after/summary.json errors -> none on any screen. OK
4 uneven spacing: CHECK eval of row heights in table.appointments tbody -> one value [39]. OK
5 not aligned: CHECK eval left edge of the Customer column across all Today rows -> one value [349]; nav link tops [9,9,9,9], no wrap after the longer "Customers" label. OK
6 one thing, two names: grep -il client after/*.txt -> no file (exit 1); nav, heading, column headers and empty line all say Customer(s). OK
7 leftover text: grep lorem/TODO/coming soon -> settings.txt "Lorem ipsum..." under Booking policy, present in before/settings.txt too; not from this run, no row names it: Proposals. OK
8 new styles: compare-changes.md "New styles: none". OK
9 removed text came back: rows removed "Clients" and "Client"; grep -il client after/*.txt -> none. OK

No P1.
