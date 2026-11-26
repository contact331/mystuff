# BS-005 (1995 Repsol NSR500) — why the bike keeps failing
**Reviewer:** Claude Opus 5.5 · 2026-11-26 ~15:05 CET
**Revision reviewed:** branch `feature/bs005-repsol` @ `3bc00b0` (T28)
**Mode:** Read-only. I rendered a local export headless (software WebGL). Nothing was pushed or deployed.

## Verdict
The bike isn't failing on effort. It fails because the tool doesn't suit the object, and because the full 16-stage experience was built around a model nobody had accepted. Each rejection triggered a new modelling strategy rather than a different tool. After about 70 minutes, 7 turns and 5 strategies, the result reads as neither an NSR500 nor an original bike.

## Timeline (from Git and HANDOVER)
| Turn | Strategy | Outcome |
|---|---|---|
| T22 | Procedural, dimension-anchored model in Three.js + 16-stage experience | Built before the model was accepted |
| T22.2 | Photorealism pass on the procedural model (user-requested F3) | User rejected the visuals |
| T23 | Rebuilt with double-curved shells in native Three.js, "without Blender" | Still stylised; rejected |
| T25 | Free asset search: exact NSR500 not available; tevy CC0 control | Generic road bike; rejected |
| T26 | User relaxed matching; tevy imported | White/graphite paint, fused body |
| T27 | Pivot fix + palette shader on the tevy textures | Still generic |
| T28 | Innerscene CC0 21 MB race replica + shader-painted "REPSOL" | Current state: white superbike with orange wheels and a word on it |

## Root causes
1. **The tool doesn't suit the object.** The CPU worked because it is boxes and flat textures, which code-built geometry handles well. An NSR500 is defined by compound-curved fairings and block livery, which code primitives can't sculpt convincingly. The agent was steered away from Blender, the one tool that suits curved bodies, and that tool is already proven in this workspace (Gem Workbench: `pip bpy`, scripted geometry → GLB).
2. **The acceptance gate was skipped.** BS-001 followed this order: T03 material study → user acceptance → integration. BS-005 built 16 stages, rider, helmet case, engine audio and Trophy Hall around an unaccepted model. Every model swap then breaks stage promises:
   - "Inspect fairings" individually: the imported mesh is fused.
   - Steering: the fork is fused, so it is preview only.
   - Explode: the groups are by material, not by part.
3. **No stop rule.** Each rejection led to a new strategy in the next turn, with nothing escalating the choice to the user. Each turn ended with "acceptance pending".
4. **Identity was traded away.** Retained T23 is toy-like but recognisably the Repsol livery (blue tank, orange/red blocks). T28 has better surfaces but no identity left.

## Concrete defects in T28
| Sev | Defect | Evidence |
|---|---|---|
| P1 | Depends on three outside hosts at runtime: the jsdelivr loader (+ BufferGeometryUtils), the Innerscene 21 MB GLB with a 1 h cache, and the tevy fallback (also external). This breaks the repo's own rules: Git canonical, R2 for large assets, no CDN. If the Innerscene path changes, it silently falls back to another external host | Network log of the headless run; `race-bike.mjs`, `ready-bike.mjs` |
| P1 | 21 MB download per visitor; heavy on mobile | `imported-asset.json` sourceBytes, response headers |
| P2 | The livery is a shader with hard-coded object-space coordinates for that one mesh. It is brittle and paints over a different bike's panel layout | `race-bike.mjs` `panelMark()` |
| P2 | The side UI panels hide the bike at walkaround, exploded and trophy stages; the Trophy Hall shows a small front-on view | Screenshots: s08, s12, s15, trophy |
| P3 | Recolouring by material name (`includes('fairing paint')`) is tied to the source asset's naming | `race-bike.mjs` `paint()` |

What still works: the asset loads (CORS `*`), all 16 stages advance to the end with no page errors, and there are six named assembly groups.

## Proposed course correction (minimal)
1. **Freeze the 16-stage shell.** No stage work until a single hero view of the model is accepted, as T03 was.
2. **Pick one path, with the user deciding (not the agent):**
   - **A. Blender path (recommended if the Repsol identity matters):**
     - Script the NSR500 body in `bpy` from reference silhouettes: subdivision surfaces, separate fairing panels, UV-unwrapped livery texture.
     - Export the GLB and store it in R2 or Git.
     - No GPU needed; CPU is enough.
     - Expect 3–6 bounded turns (the repo's own F3 band).
   - **B. Accept the generic bike and freeze:**
     - Drop the Repsol branding and keep the "Heritage Sportbike" name with an original livery made for it.
     - F2, done in 1 turn.
3. **Whichever path, vendor everything.**
   - Copy the chosen GLB (CC0 allows it) into R2 or Git, compressed to a few MB with meshopt or Draco.
   - Vendor GLTFLoader and BufferGeometryUtils r160 next to `three.module.min.js`.
   - Remove the runtime dependence on jsdelivr, Innerscene and tevy.
4. **Stop rule for agents:**
   - At most 2 attempts per strategy.
   - After a rejection, set out the options to the user rather than switch on their own.
5. **Framing:** offset the camera for the side panels (e.g. `camera.setViewOffset` or shifting the target), and use a 3/4 side view in the Trophy Hall.

## Not checked
- Real-GPU performance.
- Engine audio by ear.
- The protected Vercel preview (I rendered a local export of the same commit instead).