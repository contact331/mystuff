# MyStuff artifact standard — Rev A (2026-11-26)

Approved baseline: F2 / premium PBR. T03 accepted visually by user. Prefer representative output and reusable infrastructure over exhaustive realism. Each bounded agent turn should target one coherent deliverable; estimates are planning bands, not guarantees.

| Grade | Definition | Typical bounded turns per simple object after shared engine exists | Risk |
|---|---|---|---|
| F1 | Recognizable interactive object | 1–2 | Low |
| F2 | Premium PBR, functioning manipulation and presentation | 1–3 | Low after stabilization |
| F3 | Reference-grounded photorealism, accurate scale and detailed materials | 3–6 | Moderate |
| F4 | Precision replica with CAD and functional articulation where available | 6–15+ | High |
| F5 | Engineering-validated digital twin | Project-specific | Very high |

Do not treat these as measured scores. Default F2; use F3/F4 selectively for flagship objects when incremental value merits effort. F5 needs real data and validation. No requirement to fabricate a real object.

## Mandatory acquisition assets
- Interactive geometry and source/recipe; GLB when appropriate.
- Manifest including ID, dimensions/units, sources, fidelity grade, assumptions, revision, asset hashes, provenance/license and known limitations.
- Dimensioned reference drawing (SVG or PDF). Distinguish sourced and estimated dimensions. Use a precise CAD master/STEP when feasible.
- Technical companion PDF, with editable source in Git and a versioned binary in R2. Include object architecture, real engineering/design workflow, manufacturing, validation, public references, and an accessible educational exercise where applicable.
- A simulated receipt if applicable; clearly labeled, never genuine proof of purchase.
- 3MF/STL optional for physical replicas, with material/scale/tolerance limitations; not proof of functional or manufacturing readiness.

## Companion style
A4 pages; warm off-white base, dark ink, serif headings and readable sans body; domain accent bar, page number, object ID/revision. Original vector diagrams, tables, plain-language blocks ("In plain language") next to engineering content; source register with clickable citations. Distinguish conceptual schematics from manufacturer data. Default color roles: architecture blue #347a9b; logic violet #8b64ab; design teal #258578; fabrication amber #b46d3c; package/thermals steel #477baf; validation red #b35e61; lab teal; collection/reference gold #b9914f. Adapt domain labels to each object.
- Generate PDF from reviewed source, verify page count, layout clearance and visual proof, hash binary, upload to R2 and verify readback.
- Use isolated companion reader (PDF, HTML reading mode, open external PDF, close); avoid touching renderer. Test each route and checksum live PDF response.
- Do not make R2 public merely to serve a document. Vercel can serve a verified copy from R2 as a static artifact; Git remains canonical source.
