# CLAUDE.md — Elide agent context

Read this first in any new session. It is the persistent contract for this repository. `APP_BLUEPRINT.md` holds the architecture, `FRONTEND_SPEC.md` holds every class, animation value and string, `BUILD_GUIDE.md` holds the build order. This file holds the rules that must not drift.

---

## What this is

Elide is a checkpoint in front of cloud AI. It removes client names, patient identifiers, account numbers and postal addresses **on the user's device**, through Gemini Nano via Firebase AI Logic, before the text is sent to a cloud Gemini model. When the answer returns with placeholder tokens, Elide restores the real values locally. The map of what was withheld never leaves the machine.

Built for **#BuildHybridAI 2026**. Deadline 30 November 2026, 23:00 GMT+1. Prize target: **Best Web/Chrome App**.

---

## The one sentence that decides every argument

> If a change makes the privacy claim weaker and the convenience claim stronger, the privacy claim wins.

Reversible design choices are decided in this repository without asking. Claims about privacy, accuracy or guarantees are escalated.

---

## Stack

| Layer | Technology |
|---|---|
| Language | TypeScript, strict mode |
| UI | React 19 + Vite |
| Extension | Chrome MV3, side panel API, loaded unpacked |
| Styling | Tailwind CSS 4 |
| Motion | `motion/react` only |
| AI | `firebase/ai` — one SDK, on-device and cloud |
| Security | Firebase App Check (required), reCAPTCHA Enterprise in prod |
| Config | Firebase Remote Config, for team policy |
| Ledger | Cloud Firestore, opt-in, append-only, counts only |
| Identity | Firebase Authentication, anonymous by default |
| Hosting | Firebase Hosting |
| Tests | Vitest, on the scrub pipeline |
| Licence | Apache-2.0 |

---

## Brand asset sources — use these exact paths

The user has supplied these source locations on their Windows system. They are not workspace-relative paths:

| Asset | Exact source location | Use |
|---|---|---|
| Site logo | `S:\Hackathon\Elide\logo\logo` | The image brand mark throughout the website, including the landing-page header/rail, app navigation, footer, device sheet and About panel. It replaces the text-rendered wordmark. |
| Favicon | `S:\Hackathon\Elide\logo\favicon` | Browser tab/site favicon, linked from the web app's `index.html`. |
| Chrome extension logo/icon | `S:\Hackathon\Elide\logo\extension` | Chrome extension icon and the extension side-panel brand image. |

At build time, inspect the exact path with PowerShell `Get-Item -LiteralPath`. If it is a directory, list it with `Get-ChildItem -LiteralPath` and identify the intended image. Record its real filename, format and dimensions. Do not assume an extension or directory layout. Copy the supplied artwork into the repository and reference the copied file; convert only when a browser or Chrome manifest requires a different technical format/size, without redrawing or changing the design. If the build agent cannot access `S:`, stop and ask the user to copy the files into the workspace. Never substitute a generated logo or render a separate typographic `ELIDE` wordmark on the site. The accessible image alt text may be `Elide`.

See `FRONTEND_SPEC.md` §10 and `BUILD_GUIDE.md` for the import check.

---

## Design system — locked by the user, do not deviate

**Aesthetic:** Customs desk. Warm paper, near-black ink, hairline rules, stamped statuses.
**Dials:** `DESIGN_VARIANCE 5` · `MOTION_INTENSITY 4` · `VISUAL_DENSITY 7`

**Fonts**

```css
@import url('https://fonts.googleapis.com/css2?family=Instrument+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&family=IBM+Plex+Mono:wght@400;500;600&family=Oswald:wght@400;500;600&display=swap');
```

- Sans: Instrument Sans
- Mono: IBM Plex Mono
- Stamp: Oswald

Never Instrument Serif, Inter, JetBrains Mono, Big Shoulders Display or a Big Shoulders font of any kind.

**Colours** — full list in `FRONTEND_SPEC.md` §1.2. The rule that matters:

> `--accent` (#a8402a) appears only on material that has crossed to the cloud. If an element is accent-coloured, something left the device. No decorative use, ever.

`--mark` (#1f5a52) is the on-device colour and appears only on entity marks and on-device stamps.

**Shape:** square. Radius tops out at 2px for controls, 3px for panes. Every division is a 1px rule, never a shadow, never a bare gap.

**Motion:** mechanical, 80 to 240 ms, snapping into ruled positions. Zero ambient motion. No blur-in entrances; entrances lift and fade from 12px. Full table in `FRONTEND_SPEC.md` §6.

**Signature:** The Border. A ruled two-pane crossing with a manifest, a left-to-right scrub sweep, and an in-place restore. Coded in HTML and CSS. No canvas, no WebGL, no 3D, no photography.

---

## Non-negotiable product rules

1. **Originals never leave the tab.** The map from token to original value exists in memory only, for the tab's lifetime. It is never written to storage, never sent to Firestore, never logged, never placed in a URL or an analytics event.
2. **The team ledger stores counts, never content.** A document title is not stored, because a title can be identifying. Firestore rules enforce an allowlist of keys.
3. **Never claim anonymity.** The product reduces exposure before the request. The fixed wording in `FRONTEND_SPEC.md` §7.3 is used everywhere, unsoftened.
4. **`PREFER_ON_DEVICE` for scrubbing, `ONLY_IN_CLOUD` for answering.** Never the reverse. Never `ONLY_ON_DEVICE`, because that throws on machines without Nano and the product must still work.
5. **Report provenance from `response.inferenceSource`.** Never infer the tier from latency, and never hide a cloud fallback in the scrub pass. If the scrub ran in the cloud, the UI says so and the ledger records it.
6. **Deterministic rules run before the model, and always run.** They are what makes the offline promise real.
7. **Minimal extension permissions.** No `tabs`, no `activeTab`, no `<all_urls>`, no content scripts. Elide does not read the page you are on.
8. **No spinner anywhere.** Progress is a 2px rule with a real value, or a skeleton, or nothing.
9. **No `localStorage`, no `sessionStorage`, anywhere.** The ledger is an in-memory ring buffer plus explicit export.
10. **No invented data.** Every figure rendered comes from a real call, a real count or a stated constant. No fabricated savings, timing or adoption numbers.

---

## Code rules

**TypeScript**

- Strict mode on, `noUncheckedIndexedAccess` on. The scrub pipeline indexes strings; off-by-one here is a privacy bug.
- `camelCase` for variables and functions, `PascalCase` for components and types.
- JSDoc on every exported function, especially anything in `lib/scrub/`, stating what it guarantees.
- CSS custom properties from the design system, never a hardcoded hex in a component file.
- Hover and focus states in CSS classes, never `onMouseEnter` handlers.
- `motion/react` for entrance animation; CSS transitions for state changes under 240ms.
- Skeleton shimmer for loading, never a spinner.
- Every `catch` either recovers with a user-visible state or rethrows with context. Silent catches are forbidden in the scrub path.

**Data**

- Spans are half-open, `[start, end)`, and offsets are in the normalised string with a recorded mapping back to the original.
- Every span set passes merge before masking. Masking an unmerged set is a bug.
- Token numbering restarts per type per document: `⟦NAME_1⟧`, `⟦NAME_2⟧`, `⟦ID_1⟧`.
- The mask/restore round-trip is covered by a test that fails the build.

**Writing**

- British English throughout, in copy, comments, JSDoc, README and commit messages.
- No em dashes in interface copy. Comments explaining a decision may use them.
- Short direct sentences. No filler: no "seamless", "powerful", "effortless", "unlock", "leverage", "revolutionary".
- No lorem ipsum. Every string in `FRONTEND_SPEC.md` §11 is final.

---

## Never do these

- Never send an original value to any network destination, including Firebase Analytics, Remote Config or a console log.
- Never persist the manifest to IndexedDB, a cookie, a service worker cache or a file, except through the explicit JSON export the user triggers.
- Never let the answer pane display a token that has no map entry without saying so plainly.
- Never render a logo, icon or favicon that was not supplied. Use only the three supplied assets in the Logo assets section; never generate a substitute.
- Never widen extension permissions to make a demo easier.
- Never introduce a dark theme, a gradient, a glow, or a canvas background. The medium is paper; adding either breaks the argument and the identity.
- Never let an animation be the only carrier of meaning, and never ship an effect without a `prefers-reduced-motion` path.
- Never state or imply a guarantee the tests do not prove.

---

## Where things live

```
FRONTEND_SPEC.md   every class, animation value, z-index, string, state
APP_BLUEPRINT.md   stack, Firebase setup, inference contracts, scrub pipeline,
                   data shapes, rules, performance budget, build priority
BUILD_GUIDE.md     ordered build steps, commands, acceptance checks
MARKETING.md       submission copy, demo video script, launch posts
```

---

## Copy and punctuation

Every piece of user-facing text obeys this. Headings, body copy, labels, button text, helper text, placeholders, tooltips, validation messages, empty states, loading copy, error messages, toasts, onboarding and anything on screen during a transition.

### The rule

**A full stop ends a thought. A comma carries one on. Decide which before writing, not after.**

The failure this prevents is a run of short sentences standing in for one sentence:

```
WRONG   Nothing was changed. You can try again.
RIGHT   Nothing was changed, so you can try again.
```

That reads as two announcements where there was one fact and one instruction. The opposite error is what a mechanical pass produces, and it is the worse one because it looks like the fix:

```
WRONG   Nothing was changed, you can try again.        (comma splice)
RIGHT   Nothing was changed, so you can try again.
```

Two independent clauses joined by punctuation that cannot join them. **There is no mechanical rule here.** Whether two clauses belong to one sentence is a judgement about meaning, and a substitution table cannot make it.

### By context

| Context | Rule | Example |
|---|---|---|
| Label, button, eyebrow, badge, stat | No trailing punctuation | `Add to Chrome` |
| Field label with an aside | Parenthetical, lowercase, normal tracking | `Recipient email (leave blank to keep the last one)` |
| Helper sentence under a field | One sentence, one full stop | `This pattern applies on this device only.` |
| Status confirmation | Full stop | `Copied.` |
| Two related clauses, one thought | Comma or semicolon | `The manifest stays in the tab, so nothing needs clearing up later.` |
| Two independent clauses | Full stop, semicolon, or a conjunction, never a bare comma | |
| Long paragraph | Full stops, used sparingly | Break only where the meaning turns |

### Also

**No em dash in interface copy.** It reads as a flourish in a label and as a tic in body text. Use a comma, semicolon, colon or full stop. Em dashes belong in comments explaining a decision, not in a sentence somebody has to act on.

**A sentence fragment can be correct.** `Not a guarantee.` and `Never auto-sent.` are fragments and they land harder than a padded sentence would. The test is whether the thought is complete without one, not whether it has a subject and a verb.

**Vary the rhythm.** Three sentences of equal length in a row is the tell that copy was generated rather than written. Where the meaning allows, break the pattern.

**On-screen text is not a caption.** It is the product's voice. Write it once, properly, rather than assembling it from fragments that each make sense alone.

### Scope

Every screen, every component and every state. When something new ships, its strings are audited with it rather than in a later sweep. Shared strings get audited once at the source, because a string reused in six places is six chances to be wrong and only one place to fix it.
