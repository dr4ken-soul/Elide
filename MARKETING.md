# MARKETING.md — Elide

Submission copy, the demo video script, and public posts. The product argues with evidence, not adjectives. Where a claim appears here, it appears identically in the product, the README and the video.

---

## Position

The category is crowded with tools that promise privacy and deliver a policy page. Elide's differentiator is not that it redacts. It is that it **restores**, so the workflow survives the redaction. That is the sentence to repeat.

**Tagline:** Send the question. Not the client.

**Alternate, for the submission title:** Elide, the checkpoint in front of cloud AI.

### Supplied brand assets

- Site logo: `S:\Hackathon\Elide\logo\logo`. Use the supplied image at the landing-page header/rail, navigation, footer and any other site brand-mark location. Do not use a separate text wordmark.
- Favicon: `S:\Hackathon\Elide\logo\favicon`.
- Chrome extension logo/icon: `S:\Hackathon\Elide\logo\extension`.

Inspect the actual files and formats on the user's Windows system before composing the site, extension listing screenshot or thumbnail. Use only these supplied assets; do not invent or redraw brand artwork.

---

## Honest claim

Use verbatim, never softened:

> Elide removes identifiers from text before it is sent to a cloud model, and restores them afterwards. It cannot guarantee that no re-identification is possible, because prose can imply identity without naming it. It does not control what the remote provider retains. It is a reduction in exposure, applied before the request, not a guarantee of anonymity.

---

## Submission description

Under Devpost's required sections. Keep it tight; judges read hundreds.

**What it does**

Elide is a Chrome side panel and web app for people who must use cloud AI but cannot paste client names, patient identifiers, account numbers or addresses into it. Paste a document. Gemini Nano, running on the device through Firebase AI Logic, returns every identifier it can find as schema-constrained JSON in a few hundred milliseconds, with no network request. Elide rewrites the text with placeholder tokens, sends only the rewritten text and your question to a cloud Gemini model, then restores the real values into the answer on the device. The map from token to original value never leaves the tab.

**How Firebase AI Logic is used**

Two tiers, one SDK, with a division of labour neither tier could do alone. The scrub pass runs `PREFER_ON_DEVICE` with a shared JSON schema set as `responseConstraint` on-device and `responseSchema` in the cloud, so a machine without Nano degrades to a cloud scrub and says so. The answer pass runs `ONLY_IN_CLOUD` because a long document exceeds the on-device window. `response.inferenceSource` is read on every call and rendered as a stamp on every answer, so provenance is a product surface rather than a log line. App Check protects both, Remote Config ships the team's policy manifest, Firestore holds an append-only ledger of counts, and anonymous Authentication gives the security rules a principal.

**Features**

- Live identifier marks as you type, drawn without a canvas or a contenteditable
- A manifest stating exactly what was withheld, by type and confidence
- Deterministic regex passes merged ahead of the model, so the offline promise is real
- An honest fallback: if the scrub ran in the cloud, the UI and the ledger both record it
- Provenance stamps on every answer
- A local ledger with JSON export, and an opt-in team ledger of counts with Firestore rules that reject any content field
- A policy editor with a Remote Config policy version
- An extension manifest with no `tabs`, no `activeTab`, no `<all_urls>` and no content scripts

**Value proposition**

Every professional who wants to use AI on real work hits the same wall: the useful document is the confidential one. Elide removes the wall without pretending the risk is gone. It is a reduction in exposure, applied before the request, and it tells you exactly what it removed.

---

## Demo video — 3 minutes maximum

Record on a desktop where Nano is available. 1080p, no music, a quiet room, real typing. Never cut away from a state that would be awkward to show; the honest limits band is a feature.

**0:00 – 0:14 — The wall**

Open `/app`. Paste a short clinic note containing a patient name, a record number, an address and an account number. Say the problem in one line: "The document I need help with is the one I am not allowed to paste."

*On screen:* raw text, no marks yet.

**0:14 – 0:34 — The device does the reading**

Marks populate. Point at the device chip: `NANO READY`. Open the network panel and keep it visible for the rest of the segment.

> "That was Gemini Nano, on this machine, through Firebase AI Logic. Nothing has been sent. Watch the network panel stay empty while I paste a second document."

**0:34 – 0:58 — The crossing**

Ask a question. The scrub sweep runs left to right. The outbound pane fills with tokens and the summary reads `4 withheld · 1 flagged`.

> "Only this text leaves. The map from token back to name was built here and stays here."

Show the request payload briefly. It contains tokens and no originals.

**0:58 – 1:20 — The restore**

The answer streams in with tokens. They resolve in place into the real values, each highlighted once.

> "The model never saw a name. I still get an answer I can use."

Point at the stamp: `ANSWERED IN CLOUD`. Then point at the scrub line: `SCRUBBED ON NANO · 41 MS`.

**1:20 – 1:40 — Provenance is not decoration**

Open the device sheet, set Nano unavailable (or use a second profile without it), rerun the same document.

> "No Nano on this machine. The scrub pass falls back to the cloud, and the product says so, and the ledger records it. A privacy tool that hides its own fallback is lying to you."

**1:40 – 1:58 — The ledger**

`/ledger`. Three real rows. Then the team ledger, opt-in, showing counts only.

> "Counts, provenance and a policy version. No text, no titles, no originals. The Firestore rules reject any document containing a content field, and I will show that rejection."

Show the terminal rejection from the rules test.

**1:58 – 2:20 — The policy and the extension**

`/policy`, toggle a category off, show the Remote Config version line. Then open the side panel on a normal tab and run one crossing there.

> "The extension requests no access to the page you are on. No `tabs`, no `all_urls`, no content script. It is a panel, not a watcher."

**2:20 – 2:42 — The limits**

Scroll to the limits band and read two rows aloud.

> "It cannot catch an identifier it has never seen. It cannot stop a description from identifying someone. It does not control what a remote provider retains. What it does is reduce what leaves, before it leaves, and record what it withheld."

**2:42 – 2:58 — Close**

Statement band. Logo. Hosted URL and repository on screen.

> "Elide. Send the question, not the client."

Under 3 minutes. If a take runs long, cut the ledger-to-policy transition, never the limits.

---

## Submission checklist

- [ ] Devpost registration complete for #BuildHybridAI 2026
- [ ] Platform selected: **Web/Chrome**
- [ ] Repository public with Apache-2.0 visible in the About panel
- [ ] README with install steps, the honest claim, the Firebase product table and the permission restraint
- [ ] Hosted URL live, HTTPS, free, no login wall
- [ ] Video under 3 minutes, YouTube, public, English
- [ ] Description includes how Firebase AI Logic is used, a feature summary and the value proposition
- [ ] Repository demonstrates AI Logic imported and called at runtime, in `lib/ai/scrub.ts` and `lib/ai/answer.ts`
- [ ] No existing-app clause needed, this is a new build

---

## Public posts

**Post 1 — build announcement**

```
building elide for the @Firebase #BuildHybridAI hackathon

paste a client document, and gemini nano — running on your own machine — marks every name, record id and account number before anything is sent

only the rewritten text leaves. the answer comes back with placeholders, and they get put back on your device

the map from token to name never leaves the tab

the part i think is actually interesting: the product tells you when it could not run on device, and records that in the ledger. a privacy tool that hides its own fallback is lying to you
```

Attach a 30 second capture: paste, marks sweep, payload, answer, restore.

**Post 2 — submission**

```
submitted elide to #BuildHybridAI

one sdk, two tiers, neither of which can do the job alone. on-device scrubbing through gemini nano, cloud answers through gemini, both via firebase ai logic

app check, remote config for team policy, firestore for an append-only ledger of counts, anonymous auth. firestore rules reject any content field, which i test on camera

chrome side panel with no tabs, no all_urls, no content script. it is a checkpoint, not a watcher

[hosted link] [repo] [video]
```

---

## Reviewer quick answers

Prepare these, because a judge may open the app and ask.

**"Could a determined user deanonymise the text?"**
Sometimes, yes. Prose implies identity. That is one of the four limits, on the landing page, stated before the install button.

**"Why not intercept the input box in ChatGPT?"**
That needs `<all_urls>` and a content script, and it breaks on any DOM change they make. The panel is the version I can defend and maintain.

**"Is the fallback a loophole?"**
It is a stated degradation. The stamp changes, the ledger entry changes, and the copy above the result changes. The guarantee weakens visibly rather than silently.

**"Why is the ledger in Firestore if the product is private?"**
Because it holds counts, not content. The rules enforce an allowlist of keys, and I can show the rejection.
