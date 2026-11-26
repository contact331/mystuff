# T16 — Experience-first stack
Live gallery: https://mystuff-seven.vercel.app/gallery/index.html
Market: https://mystuff-seven.vercel.app/market/index.html
Deployed source 55364d56b8e7278b755ac6a82a60df78f39ffa07; deployment dpl_5z2KSUMnb3wQpC7JS1aTA2QUC3w4 READY.

## User experience
- Private gallery: one shared 3D room, four exhibits, selectable camera approach, orbit/zoom, four exhibition finishes per object, optional synthesized selection sound, motion toggle, inventory status and dossier links.
- CPU and RAM reuse V5 model recipes. Delivered or installed types count as acquired; unacquired models remain browsable showroom previews, not owned objects. Collection reads existing market and V5 localStorage, no migration. Finish preferences stored separately under mystuff.gallery.v1.
- Heritage: original celestial orrery with animated orbital arms and gear; not a calibrated astronomical simulator. Frontier: speculative molecular atelier with moving head and animated lattice; not a proven fabrication mechanism. Both are interactive previews, not purchasable items; no new engineering dossier required until promoted to acquisition.
- Market exposes three era departments. Contemporary retains original checkout; Heritage/Frontier link directly to preview exhibits.
- Delivered order has optional cinematic gift reveal, per-item links to V5 acquisition and gallery. Payment and delivery state unchanged. Certificate HTML printable from gallery for acquired items. V5 accepts whitelisted finish query param and has return link to gallery. Existing reset retains gold default.
- No new backend/paid services, no modifications to T15 engineering kernel. Original V2–V4 preserved by verified file SHA-1 references; V5 small additive UI/finish patch, market store unchanged.

## Verification
Public desktop screenshot at 1440x900 reviewed: all four exhibits visible, coherent room, labels, navigation and swatches. Isolated browser market test: 3 department entries, 23,329 CZK purchase, 76,671 remaining, stage 3, ceremony revealed 2 item links. Isolated gallery test seeded delivered orders: 2 acquired IDs, 4 models, ruby finish selected, correct V5 link including finish=ruby, Heritage selects HX-001, motion pause works, Frontier selects FX-001. Combined certificate/V5 finish browser test was blocked by security review; not independently verified end-to-end. Device performance, sound playback, mobile controls and physical fidelity not assessed. No extra provider resources provisioned; billing not audited.

## Next
Prioritize completed user-facing acquisitions. Promote one era preview to full acquisition only if it has checkout, delivery, unboxing/exhibit interaction and technical companion. Keep backend enrichment optional. Do not imply that preview models are already purchased. Avoid creating a second wallet or duplicating V5 renderer.
