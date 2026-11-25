# Change checks

## Row 1: nav Clients -> Customers
$ grep -c "Clients" loop-runs/.../after/*.txt
after/customers.txt:0
after/customers-search-empty.txt:0
after/invoices.txt:0
after/settings.txt:0
after/today.txt:0
$ grep -h "^Today" after/*.txt | sort -u
Today Customers Invoices Settings
Today, Thursday 26 November
$ CHECK eval --screen customers --js "document.querySelector(\"h1\").innerText"
"Customers"
$ CHECK click --screen today --text "Customers"
clicked <a href="#/clients">Customers</a>
works: the address changed to http://localhost:4100/#/clients; new text: "Customers", "Name	Phone	Last visit	Visits", "Priya Nair	07700 900123	12 Nov 2026	6", "Owen Brooks	07700 900456	New	0", "Mei Chen	07700 900789	3 Nov 2026	11", "Luis Ortega	07700 900321	28 Oct 2026	3", "Hannah Weiss	07700 900654	19 Nov 2026	8", "Ade Okoye	07700 900987	2 Sep 2026	2"
Result: PASS

## Row 2: Client -> Customer on screen
$ grep -il "client" after/*.txt
$ grep -h "Customer" after/today.txt after/invoices.txt after/customers-search-empty.txt
No customer matches "zzz".
Number	Customer	Date	Amount	Status
Time	Customer	Therapist	Type	Room
Result: PASS

## Row 3: Export button on Home
$ grep -n -i export clinic/index.html
(no match, exit 1)
$ grep -il export after/*.txt before/*.txt
(no match)
Result: nothing to remove; row left (answer 1)

## Row 4: Today appointment rows padding
$ CHECK eval --screen today --js paddingTop/Bottom of a td
[
  "10px",
  "10px"
]
$ selector matches:
"25 td, all in Today table; th paddingTop 4px"
$ customers td paddingTop
"4px / table.appointments count 0"
$ invoices td paddingTop
"4px / table.appointments count 0"
Result: PASS
