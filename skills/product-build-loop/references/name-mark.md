# Name and mark (new product only)

The person is not there to pick, so make 3 good options, use the first, and let them switch later.

1. If the brief gives a name but no mark, keep the name and make 3 marks. If it gives a mark file but no name,
   make 3 names. Otherwise make 3 pairs.
2. A name: short, easy to say, says something about the persona's job, and not the name of a product you know
   in the same field. Do not search the web for it unless the brief says the person asked for that.
3. A mark: a small inline SVG (24 px and 64 px), one or two shapes, one colour from the look, readable on white.
   No text inside the mark. Never take a mark from the internet.
4. Write `PRODUCT/brand-options.html`: the real header of the product (copy its markup and CSS), shown 3 times,
   one per option, each wrapped in `<section data-option="<n>">` with the name, the mark and one line on why.
5. Put option 1 on the product's header. `STATE decide --question "Which name and mark" --answer "option 1:
   <name>; the other two are in brand-options.html"`.
6. Check: `grep -c 'data-option=' PRODUCT/brand-options.html` prints 3, and
   `CLICKS <base url>brand-options.html --out RUN/name-mark.json --tools RUN/tools` says PASS.
