# APP_BLUEPRINT.md — Elide

Technical blueprint for a Chrome extension and web app that removes identifiers from text **on the user's device** before the text is sent to a cloud model, then restores them in the answer. Firebase AI Logic provides both tiers through one SDK.

Built for **#BuildHybridAI 2026**. Deadline 30 November 2026, 23:00 GMT+1. Prize target: **Best Web/Chrome App ($3,000)**, with a credible path into the runner-up places.

---

## 1. Product summary

A professional opens Elide on a tab. They paste a document. On-device Gemini Nano returns a list of identifiers as JSON, in a few hundred milliseconds, with no network request. Elide rewrites the text, replacing each identifier with a token. The user asks a question. Only the rewritten text and the question go to the cloud model. The answer comes back containing tokens. Elide puts the originals back, on the device, and shows a manifest stating exactly what was withheld.

The manifest never leaves the machine. That is the entire product, and every decision below serves it.

---

## 2. Why Firebase AI Logic is load-bearing

The hackathon scores "how effectively the project uses Firebase AI Logic hybrid inference as part of the solution". In Elide the hybrid split is not a convenience:

- **On-device is the guarantee.** If scrubbing ran in the cloud, the product would be a wrapper that sends your document to a server and claims not to read it. The privacy property is only true because inference runs on the same machine as the document.
- **Cloud is the capability.** Nano cannot hold a long document, cannot reason across more than roughly 4,096 tokens, and cannot answer a non-trivial question about a full contract. The answer tier must be cloud.
- **Neither tier alone ships the product.** Remove the cloud and it is a redaction toy with no answers. Remove the on-device pass and it is the very thing it claims to replace.

There is also a second, honest use of hybrid: if Nano is unavailable on the device, the scrub pass falls back to the cloud under `PREFER_ON_DEVICE`, the UI says so, and the ledger records it. The app is usable on every machine and never silent about the degraded guarantee.

---

## 3. Stack

| Layer | Choice | Reason |
|---|---|---|
| Language | TypeScript, strict | Non-negotiable for a privacy-critical data path |
| UI | React 19 + Vite | No SSR requirement; the extension and the web app share one build target |
| Extension | Chrome Manifest V3, side panel API | The prize platform, and the panel is the right form factor for a checkpoint |
| Styling | Tailwind CSS 4 | Matches `FRONTEND_SPEC.md` classes exactly |
| Motion | `motion/react` | Only for the specified entrances and the sweep; no animation library beyond this |
| AI | `firebase/ai` (`getAI`, `getGenerativeModel`, `InferenceMode`, `Schema`) | One SDK, both tiers, and it exposes provenance |
| AI security | Firebase App Check | Required by AI Logic, enforced since 2 Nov 2026 |
| Config | Firebase Remote Config | Team policy manifests, versioned |
| Ledger | Cloud Firestore, opt-in only | Team audit trail of counts, never content |
| Identity | Firebase Authentication, anonymous by default | Stable principal for App Check and Firestore rules |
| Testing | Vitest for the scrub pipeline | The span/masking logic is the part that must be provably correct |
| Hosting | Firebase Hosting | Same project as the Firebase config; no CORS surface to manage |
| Repo licence | Apache-2.0 | Preferred by the rules, and visible in the About panel |

No image generation, no 3D, no icon library, no component library. Icons are drawn with 1px divs or inline SVG paths authored for this product.

---

## 4. Repository layout

```
elide/
├── extension/                     # MV3 shell, loaded unpacked
│   ├── manifest.json
│   ├── service-worker.ts          # side panel registration, action click
│   └── sidepanel.html             # mounts the shared app at /#/panel
├── src/
│   ├── main.tsx
│   ├── app/
│   │   ├── router.tsx             # hash router: /, /app, /ledger, /policy, /panel
│   │   ├── Landing.tsx
│   │   ├── Workbench.tsx
│   │   ├── Ledger.tsx
│   │   ├── Policy.tsx
│   │   └── Panel.tsx
│   ├── components/
│   │   ├── Rule.tsx  MonoLabel.tsx  Switch.tsx  Token.tsx
│   │   ├── EmptyState.tsx  ProgressRule.tsx  ConfirmDialog.tsx  Toast.tsx
│   │   ├── ManifestSpecimen.tsx    # landing band 1, read-only
│   │   ├── CrossingPanes.tsx       # landing band 2, live scrub
│   │   ├── EntityMirror.tsx        # textarea overlay that draws marks
│   │   ├── DeviceChip.tsx  DeviceSheet.tsx
│   │   ├── ProvenanceStamp.tsx
│   │   └── AnswerPane.tsx
│   ├── lib/
│   │   ├── firebase.ts            # initializeApp, App Check, AI service
│   │   ├── ai/scrub.ts            # on-device structured-output call
│   │   ├── ai/answer.ts           # cloud-only answer call
│   │   ├── scrub/deterministic.ts # regex passes + Luhn
│   │   ├── scrub/merge.ts         # span merge + overlap resolution
│   │   ├── scrub/mask.ts          # apply spans -> redacted text + map
│   │   ├── scrub/restore.ts       # tokens -> originals
│   │   ├── scene/schema.ts        # SCRUB_SCHEMA, shared by both tiers
│   │   ├── scene/prompt.ts        # system prompt, answer prompt builder
│   │   ├── store/policy.ts        # local policy + Remote Config merge
│   │   ├── store/ledger.ts        # local ledger (in-memory + encrypted-at-rest?) 
│   │   ├── store/session.ts       # React context, no localStorage
│   │   └── crypto/id.ts           # token allocation and collision-free numbering
│   └── styles/globals.css         # tokens, grain, base type
├── tests/
│   ├── mask.test.ts
│   ├── merge.test.ts
│   └── restore.test.ts
├── docs/
│   └── screenshots/
├── firestore.rules
├── firebase.json
├── FRONTEND_SPEC.md
├── APP_BLUEPRINT.md
├── CLAUDE.md
├── BUILD_GUIDE.md
├── MARKETING.md
├── README.md
└── LICENSE
```

**No `localStorage` and no `sessionStorage` anywhere.** `CLAUDE.md` forbids it and the product cannot justify persisting a manifest in a plain-text web store. State lives in React context for the tab, and the ledger is an in-memory ring buffer of 200 entries plus an explicit JSON export. If persistence across reloads is wanted later, it goes to IndexedDB behind an explicit user action, and the decision is recorded in the README.

---

## 5. Firebase setup

### 5.1 Project

1. Create a Firebase project. Add a **Web app**.
2. Enable **AI Logic** in the console and complete its guided setup, which enables the Gemini API and registers App Check.
3. Enable **Authentication → Anonymous**.
4. Create a **Firestore** database in production mode.
5. Enable **Remote Config**.
6. Enable **App Check** with **reCAPTCHA Enterprise** for the web app. Register a **debug token** for localhost and load it from `.env` as `VITE_APP_CHECK_DEBUG_TOKEN`.

### 5.2 Environment

```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_APP_ID=
VITE_APP_CHECK_DEBUG_TOKEN=
VITE_RECAPTCHA_ENTERPRISE_SITE_KEY=
VITE_CLOUD_MODEL=gemini-3.5-flash-lite
```

`VITE_CLOUD_MODEL` is a default only; the effective model is the Remote Config value `cloud_model`, falling back to the env default, falling back to the SDK's own default.

### 5.3 Initialisation order

```ts
// lib/firebase.ts — order matters, the debug token must exist before App Check
self.FIREBASE_APPCHECK_DEBUG_TOKEN = import.meta.env.VITE_APP_CHECK_DEBUG_TOKEN
const app  = initializeApp(firebaseConfig)
initializeAppCheck(app, { provider: new ReCaptchaEnterpriseProvider(siteKey), isTokenAutoRefreshEnabled: true })
const auth = getAuth(app)
await signInAnonymously(auth)                    // principal for rules
const ai   = getAI(app, { backend: new GoogleAIBackend() })
```

The AI service is created once at module scope. Model instances are created per concern, because configuration is fixed for the lifetime of an instance.

---

## 6. Inference contracts

### 6.1 Scrub pass, on-device first

```ts
const scrubModel = getGenerativeModel(ai, {
  mode: InferenceMode.PREFER_ON_DEVICE,
  onDeviceParams: {
    createOptions: {
      expectedInputs: [{ type: 'text', languages: ['en'] }],
      expectedOutputs: [{ type: 'text', languages: ['en'] }],
      initialPrompts: [{ role: 'system', content: [{ type: 'text', value: SCRUB_SYSTEM_PROMPT }] }]
    },
    promptOptions: { responseConstraint: SCRUB_SCHEMA }
  },
  inCloudParams: {
    model: cloudModelName,
    generationConfig: { responseMimeType: 'application/json', responseSchema: SCRUB_SCHEMA, temperature: 0 }
  }
})
```

Notes that the code must respect:

- **Single turn, no history.** On-device does not support multi-turn chat on Web. Each scrub is one `generateContent` call with the document text and nothing else.
- **No tools, no function calling on device.** Everything the model needs is in the system prompt and the schema.
- **`initializeDeviceModel()` must be called after a user gesture** and before the first request. Elide calls it from the "Prepare on-device model" button in the device sheet, and also opportunistically on the first keystroke or paste in the editor, because both are gestures.
- **`ONLY_ON_DEVICE` throws when Nano is absent.** Elide never uses that mode for scrubbing; it uses `PREFER_ON_DEVICE` and reports the fallback.
- **Token budget.** Documents longer than the on-device window are chunked at paragraph boundaries to roughly 2,800 words per chunk, scrubbed chunk by chunk, and the maps merged. Chunk offsets are tracked so spans resolve to the original document.

### 6.2 Answer pass, cloud only

```ts
const answerModel = getGenerativeModel(ai, {
  mode: InferenceMode.ONLY_IN_CLOUD,
  inCloudParams: { model: cloudModelName, generationConfig: { temperature: 0.2 } }
})
```

`ONLY_IN_CLOUD` is deliberate. If the network is down the answer pass fails loudly rather than quietly answering from a model that cannot see the whole document, and the UI states the failure in the exact words specified in `FRONTEND_SPEC.md` §11.

### 6.3 Provenance

`response.inferenceSource` is `'ON_DEVICE'` or `'IN_CLOUD'`. It is read on every response, stored on the answer object, rendered as the stamp, and written to the ledger entry. No inference about provenance is ever inferred from timing.

### 6.4 Prompts

`SCRUB_SYSTEM_PROMPT` (abridged here, full text in `lib/scene/prompt.ts`) instructs the model to:

1. Act as an identifier detector for a single document.
2. Return only spans that identify a real person, organisation, account or location, plus contact details. Do not return generic job titles, product names or dates.
3. Return character offsets counted in the exact input string, with `end` exclusive.
4. Allocate tokens as `⟦TYPE_n⟧` where `n` restarts per type in document order.
5. Mark `confidence: "low"` when the span is plausibly an identifier but could be ordinary prose. Never guess high confidence on an ambiguous span.
6. Return an empty `spans` array rather than inventing spans.

`ANSWER_PROMPT` is built as: the scrubbed document, then the user's question, then one line of instruction:

> Text in ⟦DOUBLE_BRACKETS⟧ is a placeholder for a value withheld for privacy. Refer to them as written. Do not ask what they contain.

That instruction is what makes restoration reliable and what stops the model from hedging about the tokens.

---

## 7. The scrub pipeline

Five stages, in this order. Stage 2 and stage 3 are the ones worth testing hardest.

```
1  Normalise      Collapse CRLF, strip zero-width characters, keep a map from normalised
                  index to original index. Nothing is silently dropped: a document with
                  unusual whitespace must still round-trip exactly on restore.
2  Deterministic  Regex passes from the active policy: email, phone, IBAN, card candidates
                  (Luhn-validated), national ID shapes, and every user-added literal term.
                  These are spans with confidence 'high' and origin 'rule'.
3  Model          One structured call per chunk on the scrub model. Spans carry type,
                  offsets, token and confidence. Origin 'model'.
4  Merge          Resolve overlaps:
                  - rule beats model when they intersect
                  - longer span wins within the same origin
                  - adjacent spans of the same type are coalesced
                  - a model span that covers a rule span is trimmed to exclude it
                  Output: a sorted, non-overlapping span list.
5  Mask           Walk the document once, emitting the redacted text and the map.
                  Map entries: { token, type, original, start, end, confidence }.
                  The map lives in memory only, in the tab, for the lifetime of the session.
```

`restore()` is the inverse: scan the answer for `⟦[A-Z]+_\d+⟧`, look up the token, substitute the original, and mark each substitution so the UI can highlight it for 480ms.

**Invariants enforced in tests:**

- `restore(mask(text).redacted, mask(text).map) === normalize(text)` for every fixture.
- No token appears twice in one document's map.
- No span overlaps another after merge.
- A document containing no identifiers produces an empty map and byte-identical text.
- A chunked document produces the same span set as the same document processed in one pass, allowing for chunk-boundary effects that the tests pin explicitly.

---

## 8. Data structures

```ts
type EntityType = 'NAME' | 'ID' | 'ACCOUNT' | 'ADDRESS' | 'CONTACT' | 'CUSTOM'

interface Span {
  type: EntityType
  start: number
  end: number
  token: string
  confidence: 'high' | 'low'
  origin: 'rule' | 'model'
}

interface ManifestEntry {
  token: string
  type: EntityType
  original: string      // in memory only, never persisted, never transmitted
  start: number
  end: number
  confidence: 'high' | 'low'
}

interface Crossing {
  id: string                    // crypto.randomUUID()
  documentId: string
  documentTitle: string
  withheldCount: number
  byType: Record<EntityType, number>
  flaggedCount: number
  scrubInference: 'ON_DEVICE' | 'IN_CLOUD'
  answerInference: 'ON_DEVICE' | 'IN_CLOUD'
  scrubMs: number
  answerMs: number
  policyVersion: number
  createdAt: number             // epoch ms
}

interface FirestoreCrossing {
  uid: string
  counts: Record<EntityType, number>
  flagged: number
  scrubInference: 'ON_DEVICE' | 'IN_CLOUD'
  answerInference: 'ON_DEVICE' | 'IN_CLOUD'
  policyVersion: number
  createdAt: Timestamp
  // no document text, no originals, no tokens, no titles
}
```

`FirestoreCrossing` is the entire team record. Document titles are excluded because a title can itself be identifying; that decision is stated in the README so a reviewer sees it was considered.

---

## 9. Firestore rules

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /crossings/{id} {
      allow read: if request.auth != null && resource.data.uid == request.auth.uid;
      allow create: if request.auth != null
        && request.resource.data.uid == request.auth.uid
        && request.resource.data.keys().hasOnly(
             ['uid','counts','flagged','scrubInference','answerInference','policyVersion','createdAt'])
        && request.resource.data.counts.keys().hasOnly(
             ['NAME','ID','ACCOUNT','ADDRESS','CONTACT','CUSTOM']);
      allow update, delete: if false;   // append-only
    }
    match /{document=**} { allow read, write: if false; }
  }
}
```

Append-only, key-allowlisted, and no text field exists to leak. If a future version wanted richer data, the rule would have to be changed deliberately, which is the point.

---

## 10. Remote Config policy

Parameters, all consumed by `lib/store/policy.ts`:

| Key | Type | Purpose |
|---|---|---|
| `policy_version` | number | Bumped whenever anything below changes; rendered in `/policy` |
| `mandatory_types` | JSON string array | Entity types that cannot be switched off by the user |
| `pattern_library` | JSON object | Named regex patterns per type, versioned |
| `always_withhold_terms` | JSON string array | Literal terms the organisation requires to be withheld |
| `cloud_model` | string | Overrides the default answer model |
| `scrub_chunk_words` | number | Words per on-device chunk, default 2800 |

Cached to the session on fetch; the app is fully functional with defaults if Remote Config fails. Defaults ship in the bundle so a first run offline still has a policy.

---

## 11. Extension specifics

```json
{
  "manifest_version": 3,
  "name": "Elide",
  "version": "0.1.0",
  "description": "Removes client names, record IDs and account numbers before your text reaches a cloud model.",
  "permissions": ["sidePanel", "storage"],
  "host_permissions": ["https://<project>.firebaseapp.com/*", "https://<project>.web.app/*"],
  "background": { "service_worker": "service-worker.js", "type": "module" },
  "side_panel": { "default_path": "sidepanel.html" },
  "action": { "default_title": "Open Elide" },
  "icons": { "128": "icons/128.png" }
}
```

### User-supplied brand assets

| Asset | Exact source location | Purpose and handling |
|---|---|---|
| Site logo | `S:\Hackathon\Elide\logo\logo` | Use the supplied image for all site brand-mark placements: landing-page header/rail, app navigation, footer, device sheet and About panel. Do not render a text wordmark. Inspect the actual file and copy it into `public/` with its actual filename/format. |
| Favicon | `S:\Hackathon\Elide\logo\favicon` | Browser favicon. Inspect, copy into `public/` and link from `index.html`, preserving the supplied format unless a technical conversion is required. |
| Extension logo/icon | `S:\Hackathon\Elide\logo\extension` | Chrome extension icon and side-panel brand image. Inspect the actual file(s), copy into `extension/icons/`, and reference them from `manifest.json` and the side-panel UI. Convert only as required by Chrome's supported formats/sizes, using the supplied artwork without redesign. |

These are Windows source locations on the user's system, not files already present in the repository. The build agent must inspect the exact paths and record actual filenames, formats and dimensions. Do not guess extensions or make substitutes. If `S:` is inaccessible in the build environment, ask the user to copy the files into the workspace.

- **Permissions are minimal on purpose.** No `tabs`, no `<all_urls>`, no content scripts, no `activeTab`. Elide does not read the page you are on, and the manifest proves it. That restraint is a demo line, not just good manners.
- The service worker opens the panel on action click via `chrome.sidePanel.open()`.
- `sidepanel.html` mounts the same React bundle at `#/panel`, so there is one codebase and no drift between the two surfaces.
- App Check in the extension uses the same web provider; the extension origin must be added to the reCAPTCHA Enterprise key's allowed domains, or the debug token used during judging.

---

## 12. App routes and flows

```
/               Statement, live crossing, mechanism, limits, install
/app            Workbench: document rail, compose, answer
/ledger         Local ledger, export, team ledger toggle
/policy         Local pattern editor, Remote Config merge
/panel          Extension side panel: Compose and Check only
```

Primary flow, with the failure branches written out:

```
open /app
  → paste or type a document
      → Nano ready?  yes → live marks as you type (debounced 400ms, single-turn scrub)
                     no  → deterministic marks only, note says so
      → prepare on-device model (gesture) if downloadable
  → write a question, Send (Cmd/Ctrl+Enter)
      → re-scrub if the document changed since the last marks
      → mask → answer in cloud → restore → stamp → ledger entry
      → failure paths:
           offline              → Send disabled, inline note, scrubbing still works
           cloud failure        → inline failure state, Retry, document untouched
           answer contains an unknown token → render it plainly as the token, do not guess
           restore produces no matches → answer shown as returned, with a note
```

---

## 13. Performance budget

| Concern | Target | Method |
|---|---|---|
| Live mark latency on paste | < 600 ms for a 600-word document | Debounce 400 ms, single-turn call, cached result keyed by a hash of the text |
| Scrub model init | Shown honestly | Progress callback drives the `ProgressRule`; no fake percentage |
| Answer time to first token | Streaming | `generateContentStream` on the cloud model; tokens append into the answer pane |
| Bundle | < 220 kB gzipped for the app shell | No icon library, no component library, no polyfills beyond Vite defaults |
| Grain overlay | Zero layout cost | One fixed div with a CSS background, `pointer-events-none`, no canvas |
| Re-render cost while typing | No full-document re-render | The mirror layer updates on the debounced result, not per keystroke |

---

## 14. What is deliberately not built

Stated so a reviewer does not mistake scope for oversight:

- No Chrome page interception. Elide does not read the tab you are on and does not sit in front of ChatGPT's own input box. That version needs a content script with `<all_urls>`, which would undermine the permission-restraint argument, and it breaks whenever a third party changes their DOM. The side panel is the defensible version.
- No images, PDFs or audio in the scrub pass. The on-device model handles text only on Web. Files are refused with a stated reason, not silently truncated.
- No multi-turn conversation with the document. Each question is one cloud call. Multi-turn would mean resending the document, and the budget and the argument both get worse.
- No cross-device sync of manifests. Persisting a map of what was sensitive is a liability, not a feature.
- No team policy administration UI. Remote Config values are set by the owner of the Firebase project; the app shows the active policy version and applies it.
- No payment, no seats, no billing.

---

## 15. Judging criteria, answered concretely

| Criterion | What the reviewer will see |
|---|---|
| **Technological implementation** | One SDK across two tiers with a real division of labour, structured output constrained to a schema on both tiers, `inferenceSource` used as a first-class product signal, deterministic rules merged with model output, and tests proving the mask/restore round-trip. App Check, Remote Config, Firestore and Auth each doing a job that breaks if removed |
| **Design** | A complete product: landing, workbench, ledger, policy, extension panel, every state including offline and cloud failure. Not a proof of concept: a reviewer can use it on their own text in under a minute |
| **Potential impact** | A named audience with a compliance reason to care, a specific mechanism, and an honest measurement (how often the scrub actually ran on device) rather than a claim |
| **Quality of the idea** | Restoring identifiers into the answer is the non-obvious half. Redaction tools stop at the redaction; this one makes the workflow possible end to end, which is why the tool can be adopted rather than admired |

---

## 16. Build priority

Order is chosen so that a working, submittable artefact exists at every point after step 3.

1. Firebase project, App Check, anonymous auth, AI service initialising, a hello-world on-device call that returns structured JSON
2. `scrub/` pipeline with tests: deterministic passes, merge, mask, restore. This is the product's core and it must be provably correct before any UI
3. Workbench: editor, mirror marks, composer, answer pane, provenance stamp, ledger entry. Now there is something to demo
4. Landing page bands 1, 2 and 4. The live crossing is the video
5. Device sheet and the gesture path for `initializeDeviceModel`, including the unavailable and downloading states
6. Remote Config policy, `/policy`, `/ledger`, JSON export
7. Firestore team ledger behind an explicit opt-in, with rules deployed
8. Extension shell, side panel, minimal permissions, loaded unpacked
9. Firebase Hosting deploy of the web app, public and free to use
10. README, `CLAUDE.md`, licence, repo public with Apache-2.0 visible in the About panel
11. Demo video, 3 minutes maximum, YouTube, public: paste, marks sweep, outbound pane, answer, restore, stamp, ledger, extension panel, the limits band
12. Submission: description, repo URL, hosted URL, video URL, platform selected as Web/Chrome

---

## 17. Open items

| Item | Owner | Blocks |
|---|---|---|
| Inspect and import user-supplied brand assets: site logo from `S:\Hackathon\Elide\logo\logo` for all site brand positions (no text wordmark); favicon from `S:\Hackathon\Elide\logo\favicon`; extension icon from `S:\Hackathon\Elide\logo\extension`. Preserve actual formats/filenames unless a technical conversion is required; update app and manifest references | Agent at local build | Final site/extension branding and screenshots; core build can proceed without these files only if references remain unshipped |
| Confirmation that a Chrome desktop with Nano available is the demo machine | User | The on-device half of the video |
| Google Account Quota request, if image generation or higher limits are ever wanted | User | Nothing in this scope; text inference is free within limits |
