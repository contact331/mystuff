# MyStuff — Barrier Simulation Engine

Canonical source: contact331/mystuff. First exhibit BS-001: Intel Core Ultra 9 285K, Noble Collection V2. `index.html` is the frozen working baseline (commit 87a5d8dc4154de7cf65bd110eecffaa10923ec57); SHA-256 of the original local file: `4105a7dd6017ce7da9c374a5f3eeb1699e78f7dce272b68d0ed33911b2a08307`.

## Production plan
- T02: deploy original V2 to Vercel, establish dedicated R2 asset bucket.
- T03: Three.js/PBR renderer on a separate branch; keep baseline recoverable.
- T04: reusable materials, HDR lighting, geometry and asset manifest.
- T05–06: realistic CPU and packaging; clear exhibition footprint, no intersections at any animation stage.
- T07: regression and visual acceptance on desktop and tablet.

## Acceptance gates
Preserve seven unboxing stages, reset, direct CPU rotation, orbit, zoom, flip, exploded view, four pedestal material variants, levitation, audio music/SFX/volume and simulated receipt label. Verify all interactions in a real WebGL browser, record screenshots and performance. Do not claim photorealism without visual review.

## Hosting
Static Vercel app. Versioned large assets in private R2 bucket `mystuff-assets` (proposed until provisioned); enable controlled read delivery only when assets are available. No credentials or unique source in Vercel. No paid Google Cloud compute without separate authorization. V2 has no external asset dependencies.

All receipts are simulated, not evidence of purchase.
