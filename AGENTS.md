# AGENTS.md — MyStuff

Applies to all contributors (GPT, Codex, Claude, human). Read this file, README.md, and assets/manifest.json before modifying anything. Git is canonical. This is an interactive simulated acquisition/exhibition engine, not a static image generator.

## Current checkpoint (T02, 2026-11-26)
- BS-001: Intel Core Ultra 9 285K — Noble Collection V2, user accepted as a good starting point.
- Frozen baseline: commit 87a5d8dc4154de7cf65bd110eecffaa10923ec57, index.html blob c3f62c5264a550ec960dcfc044d0100cd0f673f4. Original self-contained custom WebGL app, approximately 33 KB.
- Production: https://mystuff-seven.vercel.app ; alternate https://mystuff-marquisemuseumnfts-projects.vercel.app
- Vercel project prj_5hGKKZfAVjRPwg8PgInAmUTUgyjz, team slug marquisemuseumnfts-projects, deployment dpl_D9mfZ3JZXXg6dDJE3DYWEqMeg1sR (READY).
- R2 bucket mystuff-assets, Standard, EEUR. Private; manifest.json uploaded and read back successfully. Git copy: assets/manifest.json. No binary dependencies yet.
- Known defect: exhibition pedestal overlaps the packaging/tray. User requests photorealism and collision correction, not an interface redesign.
- Real-browser visual/audio regression validation remains outstanding.

## Reproduce the baseline
```sh
git clone https://github.com/contact331/mystuff.git
cd mystuff
git show 87a5d8dc4154de7cf65bd110eecffaa10923ec57:index.html > /tmp/mystuff-v2.html
python -m http.server 8000
```
Open http://localhost:8000/ for current source, or open /tmp/mystuff-v2.html directly for the frozen V2. Requires a WebGL-capable browser; no npm, CDN, credentials, or GPU cloud required for V2. Audio starts after user interaction. To compare against V2 during development use a separate git worktree or the saved HTML; do not overwrite baseline history.

## Next task: T03–T06
1. Create feature branch renderer/pbr-v3 from current main. Preserve V2 and extract reusable scene state, interaction and audio logic. Use Three.js with version-pinned dependencies and committed lockfile (Vite is acceptable). Keep initial project simple; document exact install/build commands.
2. Implement physically based materials and color management, studio environment reflections, shadow/contact occlusion, bevels, brushed aluminium, PCB detail, gold contacts, realistic packaging, and refined gemstone/engraved pedestal surfaces. Use legal assets with provenance and licensing metadata; synthetic originals preferred. No need for Unreal or paid GPU at this stage.
3. Correct pedestal collision: reserve separate staging and exhibition footprints; move packaging/lid/tray clear before revealing pedestal. Check world-space bounds and clearance along the whole animation, not just end state. Keep processor accessible, levitating, rotatable and inspectable.
4. Keep reusable components independent of BS-001: acquisition/unboxing state machine, object inspection, exhibition stage, materials, audio and VFX. Scene-specific geometry and simulated receipt remain in asset modules. No new unrelated features in the realism pass.
5. Start with a representative CPU/pedestal vertical slice and compare against frozen V2 before replacing the whole renderer. Target premium browser PBR, not an unverified numerical quality score.

## Regression gates (T07)
- Seven unboxing stages, forward/back, reset, gift/ribbon/lid, retail carton, tray and CPU extraction.
- Direct CPU drag rotation, camera orbit, zoom, flip, exploded view, auto-spin toggle; touch/pen support.
- Four material themes (gold/onyx, sapphire/platinum, ruby/rose gold, emerald/gold); levitation, rotation, particles and engraved pedestal.
- Original lounge soundtrack and each step's sound effects; independent music/SFX and volume controls; user gesture unlocks Web Audio.
- Simulated Alza receipt, 16,790 CZK, conspicuous simulation labeling; no genuine purchase claim or personal data.
- No visible intersections throughout stages; inspect desktop and tablet sizes, Chrome and Firefox when available.
- Capture actual screenshots of closed gift, extracted chip, all pedestal themes, top and underside. Record console errors, load time, GPU/frame performance and any limitations. If WebGL/audio testing unavailable, state it and do not mark visual acceptance passed.
- Build/test before deployment; report regression outcomes and source commit. Keep current live version until replacement has passed the available checks and user-directed release is appropriate.

## Hosting and asset rules
- All unique source, build scripts, asset recipes, manifests, docs and version history belong in Git. Never put secrets into public Git.
- Vercel automatic Git integration failed with repo_no_access (its GitHub integration lacks access). Direct deployment from reviewed Git source worked. Use authenticated deployment tool/CLI on the existing project, with explicit team/project and exact source revision; for static V2 deploy index.html. For future Vite app deploy reproducible build output from a clean checkout. Record source SHA, deployment ID/URL, status and verification. No new project unless necessary.
- R2: versioned keys e.g. bs-001/v3/cpu.glb, shared/v1/materials/...; manifest records key, MIME, bytes, SHA-256, license, source/recipe. Verify readback; do not silently replace old assets. Keep bucket private until deliberate read-only delivery design; never expose write credentials in client. No runtime R2 dependency for baseline. Use small assets in Git where sensible.
- Use existing accounts and authorized connectors; Claude may need its own connector/CLI authorization. If access fails, still commit reproducible source and report exact blocker. Do not request secrets in chat.
- Do not provision paid Google Cloud/GPU resources or enable new billable services without user approval. Blender optional for mesh generation; browser rendering is performed on user's hardware.

## Multi-agent collaboration
- Read current branch/head, open PRs and handovers before starting. One integration owner at a time; independent asset work on distinct branches and paths. Avoid simultaneous modifications to shared renderer and main.
- Use small reviewable commits; never force-push or overwrite another agent's work. Resolve conflicts explicitly. Do not deploy unreviewed parallel branches to production.
- Each turn records: task, starting SHA, changed files, commands/tests and evidence, new SHA/PR, known defects, next action, deployment status and cost. Keep docs/HANDOVER.md current; if unavailable add a new dated handover. No fake successful test or deployment claims.
- User priority: visual realism and collision fix, preserve V2 interaction and polish, reusable architecture for future acquisitions. Do not create an artificial large backlog.

## Definition of done
A visually reviewed, collision-free, interactive upgrade that is reproducible from Git and works at the live URL without regressions. If full visual review is blocked, mark candidate as pending acceptance, not done.

## Latest checkpoint: T03
The PBR vertical slice is live at https://mystuff-seven.vercel.app/t03/index.html; full V2 remains at the root. Read the [T03 handover](https://github.com/contact331/mystuff/blob/renderer/pbr-v3/docs/HANDOVER.md) on branch `renderer/pbr-v3` before continuing. T03 is pending visual acceptance; do not restart the completed prototype. Main remains the frozen baseline; future renderer development continues on the feature branch. For additive deployments preserve both the V2 root and the T03 study until the user approves replacement.

## T04 companion checkpoint
User accepted T03's visual speed/quality point. F2 is the default; F3–F4 are selective. Follow [docs/ARTIFACT-STANDARD.md](docs/ARTIFACT-STANDARD.md). Mandatory technical companion PDF + dimensioned reference + manifest for each acquisition; printable exports optional. BS-001 companion is now live at https://mystuff-seven.vercel.app/t03/companions/bs-001.pdf and integrated into both V2 and T03. Source/assets remain on renderer/pbr-v3; deployed source commit 00a9fdb18c1da04888766b50cdcd13033ec9bdc3, deployment dpl_atyh1y3HsboXHoCLzzoUMuh5iSv6. Next prioritize full collision-free unboxing integration, preserve accepted T03 visual grade. See branch handover. No paid GPU infrastructure.

## T06 full unboxing checkpoint
Integrated F2 V3 candidate at https://mystuff-seven.vercel.app/v3/index.html. V2 and T03 retained. Source f3f7fdd1af3df6fdfec0f22f9ce2a370d03c877a on renderer/pbr-v3, deployment dpl_3VbZd5HKNeonE7EFaeUW3onUbinV. Collision audit: 121 sampled positions, no packaging/pedestal intersections. Follow branch docs/HANDOVER.md. Next: T07 acceptance and consolidate reusable engine before adding new artifacts; do not rebuild or escalate fidelity unnecessarily.

## T09 collection-engine checkpoint
V5 live: https://mystuff-seven.vercel.app/v5/index.html (CPU BS-001 and RAM BS-002). Read [ENGINE-V5.md](https://github.com/contact331/mystuff/blob/renderer/pbr-v3/docs/ENGINE-V5.md) and branch handover. Use shared registry/models/scene interface for future acquisitions. F2 remains default. Cumulative installed state is browser-local. Current slot reconstruction and lifecycle support CPU/RAM; extend adapters for other object types without duplicating the renderer. Deployed source 31ca9b31d495bfeaebc7a82ea2721d61d8da421c; keep V4 unchanged as baseline. No paid GPU provisioning.

## T10–T14 virtual commerce checkpoint
MyStuff Market V6 is live at https://mystuff-seven.vercel.app/market/index.html. Read [MARKET-V6.md](https://github.com/contact331/mystuff/blob/renderer/pbr-v3/docs/MARKET-V6.md). Shared V5 engine preserved; virtual wallet/order state browser-local. Source e3c8a3e9290215ef6ad5a58999a228e0ad42a6d2. Add catalog entries together with working artifact registry entries. Do not introduce real payments or request personal payment/address details. Maintain original routes.
