# BUILD_GUIDE.md — Elide

Ordered build. Read `CLAUDE.md`, `APP_BLUEPRINT.md` and `FRONTEND_SPEC.md` before writing a line of code. Where a step says "as specified in X", open X and read that section; do not reconstruct it from memory.

The order is chosen so a submittable artefact exists from step 3 onward.

---

## Prerequisites

```bash
node --version    # 20 or higher
npm --version     # 10 or higher
```

A **Chrome desktop** install, version 139 or higher, where Gemini Nano can be enabled. This is the demo machine and the machine the video is recorded on. Without it the on-device half of the product cannot be shown.

A Firebase project. A free Spark plan is enough for text inference within the free tier, App Check, Auth, Remote Config and Firestore at this volume.

### Brand-asset preflight (run on the user's Windows system)

The user has identified these exact source locations:

| Source | Purpose |
|---|---|
| `S:\Hackathon\Elide\logo\logo` | Site logo for landing-page header/rail, app navigation, footer, device sheet and About panel. Use the image everywhere the site shows its brand mark; no text-rendered wordmark. |
| `S:\Hackathon\Elide\logo\favicon` | Browser favicon. |
| `S:\Hackathon\Elide\logo\extension` | Chrome extension icon and side-panel brand image. |

Before importing, inspect each location in PowerShell with `Get-Item -LiteralPath 'S:\Hackathon\Elide\logo\logo'` (repeat for `favicon` and `extension`). If the path is a directory, use `Get-ChildItem -LiteralPath '...'` to find the supplied image. Record its real filename, format and dimensions. Do not assume a file extension or that the path is a directory. Copy the supplied artwork into the project and reference the real output path; convert only if web/Chrome technical requirements demand it, without redrawing or substituting. If the local build agent cannot access `S:`, stop and ask the user to copy the assets into the project. Do not leave generated placeholders or invent a logo.

---

## Phase 0 — Repository and project

```bash
mkdir elide && cd elide
git init
npm create vite@latest . -- --template react-ts
npm install
npm install firebase motion
npm install -D tailwindcss @tailwindcss/vite vitest @vitest/ui
```

`vite.config.ts`: add the React and Tailwind plugins, and set `build.target` to `'es2022'`.

Translate `FRONTEND_SPEC.md` §1.1 and §1.2 into `src/styles/globals.css`: the font import, the `:root` block verbatim, and the base type rules. Then generate the grain SVG once into the same file as a data URI with `feTurbulence`, `baseFrequency 0.8`, `numOctaves 3`, `stitchTiles stitch`.

Create `.env` from `APP_BLUEPRINT.md` §5.2 and add it to `.gitignore` before the first commit. Confirm `git status` does not list it.

Commit. Then create the Firebase project per `APP_BLUEPRINT.md` §5.1.

---

## Phase 1 — The spine, before any interface

The scrub pipeline is the product. Building UI first means debugging privacy logic through a textarea, which is the wrong order.

### Step 1.1 — Types and schema

`src/lib/scene/schema.ts`: define `SCRUB_SCHEMA` exactly as `APP_BLUEPRINT.md` §7.1, and export the TypeScript types from §8. One source of truth for both tiers.

### Step 1.2 — Deterministic passes

`src/lib/scrub/deterministic.ts`. Implement the rule passes listed in `APP_BLUEPRINT.md` §7 stage 2. Each pass returns `Span[]` with `origin: 'rule'`, `confidence: 'high'`. Card candidates are Luhn-validated; a failed Luhn means no span. National ID shapes come from the active policy, not from a hardcoded list.

### Step 1.3 — Merge

`src/lib/scrub/merge.ts`. Implement the four merge rules in §7 stage 4. Sort by `start`, resolve overlaps, coalesce adjacent same-type spans. Write the JSDoc to state the postcondition: the returned list is sorted, non-overlapping, and covers no character twice.

### Step 1.4 — Mask and restore

`src/lib/scrub/mask.ts` and `src/lib/scrub/restore.ts`. Mask walks the normalised text once. Restore scans for `⟦[A-Z]+_\d+⟧` with the exact token regex and substitutes from the map.

### Step 1.5 — Tests, and make them fail first

`tests/mask.test.ts`, `tests/merge.test.ts`, `tests/restore.test.ts`. Cover every invariant in `APP_BLUEPRINT.md` §7, plus:

- a document with CRLF line endings round-trips byte-identically after restore
- a document with an identifier at index 0 and at the final character
- a document with nested spans that the model returns overlapping
- a token that appears in the answer twice restores in both places
- an unknown token in the answer is left as-is and reported
- empty document, single character, and a document of only whitespace

`npm run test` must pass before Phase 2. This is the gate, not a formality.

---

## Phase 2 — Firebase and the two inference calls

### Step 2.1 — Initialisation

`src/lib/firebase.ts` per `APP_BLUEPRINT.md` §5.3. The debug token is assigned to `self` **before** App Check initialises, or the token is not honoured.

### Step 2.2 — Scrub model

`src/lib/ai/scrub.ts`. Create the model per §6.1 with both `onDeviceParams.promptOptions.responseConstraint` and `inCloudParams.generationConfig.responseSchema` pointing at the same schema. Export:

```ts
prepareOnDevice(onProgress: (p: number) => void): Promise<void>   // gesture-gated
scrub(text: string): Promise<{ spans: Span[]; source: 'ON_DEVICE' | 'IN_CLOUD'; ms: number }>
```

`scrub` must chunk per §6.1's token budget, call once per chunk, merge across chunks with offset correction, and return the resolved source from `response.inferenceSource`.

### Step 2.3 — Answer model

`src/lib/ai/answer.ts`. `ONLY_IN_CLOUD`, streaming. Export `answer(redacted: string, question: string, onToken: (t: string) => void)`.

### Step 2.4 — Console verification

Before any UI: a scratch route that pastes a fixture document, runs the scrub, prints the redacted text, the manifest and the inference source, then sends the answer and prints it restored. Verify on a machine **with** Nano, and again with Nano disabled, and confirm the UI-free path reports `IN_CLOUD` honestly in the second case.

---

## Phase 3 — Workbench

Follow `FRONTEND_SPEC.md` §4 in order: layout, then the editor and mirror, then the composer, then the answer pane, then the provenance stamp.

**The mirror layer is the risky part.** Build it as specified: a transparent-text textarea over an identically-metriced mirror div. Check first that a long line wraps identically in both, at 200% zoom, with a custom scrollbar, and with an IME that composes characters. If metrics diverge by even a pixel, fix the metrics rather than switching to `contenteditable`, which would break native selection and caret behaviour.

Acceptance for this phase:

- marks appear within 600ms of a 600-word paste
- the composer summary matches the manifest count exactly
- the stamp reads the real `inferenceSource`
- a ledger entry is written per send
- `Cmd/Ctrl+Enter` sends, and send is blocked while offline with the exact string from §11

---

## Phase 4 — Landing

Bands in `FRONTEND_SPEC.md` §3.1, §3.2, §3.4 first; those three carry the argument and the video. Band 3 (mechanism) and band 5 (install) after.

The live crossing in §3.2 must be the real scrub function, not a mocked animation. A judge who types their own sentence into it must get a real result, or the band is theatre.

---

## Phase 5 — Device sheet and honest states

`FRONTEND_SPEC.md` §4.5 and §4.3. The gesture gate on `initializeDeviceModel` is a real constraint: the button is the gesture, and the progress callback drives a real percentage. Then walk all ten states in §4.3 on a real machine, including the two that are easy to fake and easy to get wrong: offline, and cloud failure.

---

## Phase 6 — Policy, ledger, Firestore

`/policy` and `/ledger` per `FRONTEND_SPEC.md` §4.8 and §4.7, then Remote Config wiring per `APP_BLUEPRINT.md` §10, then the opt-in team ledger with the rules in §9 deployed:

```bash
firebase deploy --only firestore:rules
```

Verify with the rules emulator that a write containing a `text` field is rejected, and that a read of another user's crossing is rejected. Record both rejections; they belong in the README as evidence.

---

## Phase 7 — Extension

Per `APP_BLUEPRINT.md` §11. Build the shell, load unpacked, open the side panel, and confirm the panel runs the same bundle. Add the extension origin to the reCAPTCHA key or use the debug token.

Then read `manifest.json` out loud in the video. The absence of `tabs`, `activeTab` and `<all_urls>` is a product argument.

---

## Phase 8 — Deploy

```bash
npm run build
firebase deploy --only hosting
```

Public, HTTPS, free to use, no login wall for the landing page or the workbench. Anonymous auth handles the principal invisibly.

---

## Phase 9 — Submission assets

`README.md` with: what it does, the honest claim verbatim from `FRONTEND_SPEC.md` §7.3, install steps for both entry points, the Firebase products and their jobs, the permission restraint, the two rule rejections, and the Apache-2.0 licence. Then `MARKETING.md` for the description and the video script.

Demo video: 3 minutes maximum, YouTube, public, English. Storyboard in `MARKETING.md`.

Submission form: platform **Web/Chrome**, repo URL, hosted URL, video URL, description.

---

## Audit before recording

**Privacy path**

- [ ] Search the whole repository for the map type. It is referenced only in memory and in `restore`. No `console.log` of it survives.
- [ ] Network tab, one full crossing: exactly the scrubbed text and the question leave. No originals in any payload.
- [ ] Firestore document, one crossing: counts, provenance and policy version only.
- [ ] No `localStorage` or `sessionStorage` call in the bundle.
- [ ] A reload clears the manifest and the UI says the document is unchanged but unmarked.

**Honesty**

- [ ] With Nano available, the stamp reads `Answered on device` on the scrub and `Answered in cloud` on the answer.
- [ ] With Nano disabled, the scrub falls back, the UI says so, and the ledger records `scrubInference: IN_CLOUD`.
- [ ] The four limits band is present and readable at 320px.
- [ ] No number on screen is invented.

**Interface**

- [ ] All ten states in `FRONTEND_SPEC.md` §4.3 walked on a real machine.
- [ ] Reduced motion on: nothing translates, sweeps or counts.
- [ ] Keyboard only: reach the editor, send, open the device sheet, close it, reach the ledger.
- [ ] 200% zoom and 320px width: no horizontal page scroll.
- [ ] Contrast pairs from §1.2 measured, not assumed.
- [ ] Inspect the three user paths (`S:\Hackathon\Elide\logo\logo`, `S:\Hackathon\Elide\logo\favicon`, `S:\Hackathon\Elide\logo\extension`), import the supplied assets, and verify the site logo is used at all site brand locations with no text wordmark; all app/manifest references match the actual files.

**Submission**

- [ ] Repository public, Apache-2.0 visible in the About panel
- [ ] README complete and accurate
- [ ] Hosted URL live and free
- [ ] Video under 3 minutes, public, English
- [ ] Platform selected as Web/Chrome
- [ ] Written description names Firebase AI Logic, the hybrid division of labour, and the value proposition
