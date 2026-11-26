# MyStuff Market — V6 / T10–T14
Live: https://mystuff-seven.vercel.app/market/index.html
Source revision e3c8a3e9290215ef6ad5a58999a228e0ad42a6d2. Deployment dpl_Cb1zL245xWjPayc9Zgq4cvH1NuRB READY.
Additive deployment; all V2–V5 routes preserved by checked SHA-1 references.

## Features
- Responsive original storefront, category/search/sort, illustrated product cards, details, dossier links.
- CPU BS-001 16,790 CZK; RAM BS-002 6,490 CZK (fictional reference prices).
- Basket quantities 1–9, 21% VAT-inclusive arithmetic with integer minor-unit net/VAT, locker 49 CZK or courier 99 CZK.
- Three-step checkout: delivery, virtual wallet, review. Default wallet 100,000 CZK; configurable locally.
- Single localStorage market key mystuff.market.v1 stores cart, balance, serial and orders. Orders snapshot unit prices and totals. Rejected payments do not debit; basket clears after payment.
- Four-stage manually advanced order tracker, virtual receipt, delivered order links to V5 with artifact query, collection view reads existing mystuff.collection.v1.
- Independent branding; no real payments, addresses, card details, retailer API, or actual delivery.
- Model/store.mjs, view/app.mjs, style.css, index.html, original SVG illustrations, test.mjs (node market/test.mjs).

## Verification
Actual public browser screenshot inspected at 1440x1000. Browser test imported store.mjs and verified exact gross/net/VAT, duplicate empty-basket payment rejection, insufficient funds, delivery gating. UI clicked both add buttons, basket, checkout, payment, review, confirmed order, receipt dialog, and three delivery advances. Result: gross 23,329 CZK, remaining 76,671 CZK, one order, persisted balance, stage 3, both correct V5 URLs. Test browser isolated from user state. No real funds used. Full UI mobile, real-device touch, tab-concurrent transaction atomicity and full round-trip from V5 installation back to shop not yet independently tested. Direct V5 showroom remains accessible without purchase; delivered order gating applies to shop links, not global engine access. Repeated copies can be ordered but V5 collection tracks installed types, not distinct serial-numbered items. Delivery is manual rather than a timed logistics simulation. No cloud backend, auth or cross-device sync. For new objects, extend both catalog and V5 artifact registry; no mock purchasable items without a functional acquisition unless explicitly marked preview.
