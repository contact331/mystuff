# MyStuff V5 — collection engine / T09

## Current release
- V5 live: https://mystuff-seven.vercel.app/v5/index.html
- BS-001: https://mystuff-seven.vercel.app/v5/index.html?asset=BS-001
- BS-002: https://mystuff-seven.vercel.app/v5/index.html?asset=BS-002
- Deployed source: 31ca9b31d495bfeaebc7a82ea2721d61d8da421c
- Deployment dpl_DjkzfbWUkLi3Lv6EkkRbECwSXuKP READY. Existing V2/T03/V3/V4 preserved using verified SHA-1 references. No new cloud GPU or paid service provisioned.

## Architecture
v5/index.html: one common shell with artifact selector, acquisition UI, inspection controls, receipt, PDF/HTML reader and performance overlay.
v5/scene.js: shared Three.js renderer, environment, pedestal, textures, packaging, animation, camera, pointer handling, VFX, controls, metrics and collection integration.
v5/models.js: independent CPU and RAM model recipes. Each builds under a supplied group using shared helpers; returns explode/reset, and optional pair/installation behavior.
v5/registry.js: metadata, model factory, scale, stage wording, install adapter, camera profile, metric data, receipt, PDF paths and local storage. Query parameter asset selects a registry entry.
v4/audio.js, v4/layout.js, v4/motherboard.js: reused implementation. t03/vendor: version-pinned Three.js r160.
v5/companions: BS-002 editable engineering source, dimensional SVG and manifest. Binary PDF stored in private R2 mystuff-assets/bs-002/rev-a/companion.pdf; 193446 bytes, 4 pages, SHA-256 6f1c5ac0254df2ef950d3939b20e04657b12857cef9a9edee0fbe18002b27474. Rev B CPU PDF is reused.

## Adding an acquisition
1. Allocate a unique BS identifier; define name, edition, package artwork strings, plaque, specs and source-grounded metrics in registry.js. Use F2 unless directed otherwise. No unsupported benchmark claims or purchase records.
2. Implement a model factory in models.js or an imported asset module. Input context includes chip (object group), box, mesh, tex, seeded rnd, brushed and metalRough textures, dummy. Return explode(ex) and reset(); optional pair() for packed/inspection transforms. Set scale so model fits the current package/exhibition envelope.
3. Provide installation environment factory and install({root,chip,model,board,p,ease}) adapter. Current engine supports 7 acquisition + 4 installation stages; provide stage copy, camera targets/distances/pitch/yaw, macro focus and reversible placement. The board interface currently exposes group and set(open,lock,power); other environment types need an adapter or an explicit lifecycle extension. Do not pretend the current fixed electronics layout can represent a vehicle or building at native scale without further work.
4. For cumulative assembly, model slots and installed-peer reconstruction are currently implemented specifically for BS-001/BS-002 in scene.js; generalize to a declarative slot graph before scaling beyond these two assets. Do not add unlimited special-case branches.
5. Add an engineering companion PDF/HTML, dimensional reference, provenance manifest. Verify PDF pages and layout; hash and store binary in versioned R2. Deploy a verified static copy.
6. Test all stages forward/back/reset; collision, actual geometry alignment, object manipulation, metrics, audio, companion, browser storage and mobile/tablet. Preserve the old routes and use a separate candidate when modifying lifecycle architecture.

## Persistence
Browser key mystuff.collection.v1 contains artifact IDs with installed:true and updatedAt. Final arrival marks installed; reset restarts presentation without deleting inventory. Selecting another object navigates to the same shell with a different registry ID. CPU and RAM peers reconstruct on the shared motherboard if installed in this browser. Local only; no sync, user accounts, database, or claim of real purchase. Clearing site data removes collection state.

## Verification / evidence
CPU V5: browser traversed all 11 states, final socket [-0.9,0.405,-2.6], 6 metric nodes, correct Rev B PDF route, AudioContext running, persisted BS-001. Original collision audit 121 samples, 0 failures, min 5.57 scene units.
RAM V5: separate browser run seeded an installed BS-001 record; loaded BS-002 with one installed peer, traversed all 11 states, 3 metric nodes, BS-002 companion route, AudioContext running, collection contained both installed IDs. Same collision audit passed. Final screenshot showed CPU and two RAM modules seated on same motherboard, with 2/2 installed counter. Counters appeared after staggered reveal; final screenshot taken just after arrival did not show all counters. RAM metrics are capacity +100%, data rate +14%, theoretical bandwidth +14% versus reference 2×16 GB DDR5-5600. No measured workload benchmark. Actual audible output and exact physical fit not established. Software browser ~1 FPS; hardware-accelerated performance and touch remain outstanding.
RAM is an original concept 2×32 GB DDR5-6400 kit, not a specific retail SKU; price not assigned. Reference geometry, not fabrication CAD. Four-page PDF generated and R2 checksum verified; full per-page visual review still outstanding.

## Next
Freeze V5 candidate after user review. Generalize assembly-slot registry and arbitrary-length lifecycle only when next non-electronics asset requires them. Avoid premature complexity. New assets should use V5 interface rather than fork renderer. Browser-only collection state is sufficient until cross-device sync becomes a requirement.
