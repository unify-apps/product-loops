# Builder check: Bloom & Co order board

Read as the one person who must build it alone. Three questions whose answer changes what gets built.

1. **Does a new or done order survive a page reload?** The brief says plain files and made-up data, but not whether added orders are kept. This decides whether there is a storage layer at all.
   Default: keep the 8 sample orders in the code and save changes in the browser (localStorage, in try/catch), with no reset button. If storage is blocked, the page still works for that visit.

2. **What does "mark done" do in the list: stay, move, or hide, and can it be undone?** Done means 6 only says the order "changes in the list". The empty line "all done" suggests done orders leave the to-do view.
   Default: the list shows To do first (sorted by due time), then a Done group below, shown muted with a "Done" tag. Each row has a Mark done button; a done row has Undo. "All done" shows when To do is empty.

3. **Which order fields must be filled before Add saves?** The brief lists 8 fields and says empty fields get an inline message, but not which are required. The address only matters for delivery.
   Default: required are customer name, what to make, and due date and time; address is required only when Delivery is picked. Phone, price and note are optional; price must be a number of 0 or more if given.
