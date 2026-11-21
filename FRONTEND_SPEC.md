# FRONTEND_SPEC.md — Elide

The checkpoint in front of any AI tool. Elide removes client names, patient identifiers, account numbers and addresses **on your device** before anything is sent, then puts the real values back into the answer when it returns. The map of what was withheld never leaves the machine.

Built for **#BuildHybridAI 2026** (Firebase AI Logic, hybrid inference). Submission deadline 30 November 2026, 23:00 GMT+1.

**Convention in this document.** Values marked `[FACT]` come from the Firebase documentation or the hackathon rules. Values marked `[DECISION]` are this project's choices. Values marked `[ASSUMPTION]` need confirming during the build. Where a value is a placeholder awaiting user supply, it says so and is never substituted with invented art.

---

## 0. Project Identity

### 0.1 Core facts `[DECISION]`

- **Name:** Elide
- **Brand assets:** User-specified source locations are `S:\Hackathon\Elide\logo\logo` (site logo), `S:\Hackathon\Elide\logo\favicon` (browser favicon) and `S:\Hackathon\Elide\logo\extension` (Chrome extension logo/icon). Use the site logo at every site brand-mark position, including the landing-page rail, app navigation, footer, device sheet and About panel. Do not render a separate text wordmark. The build agent must inspect the exact source locations and actual formats on the user's Windows system, then copy and reference those supplied assets as specified in section 10; do not assume a filename extension or invent a substitute.
- **One-line pitch:** Everything crossing to the cloud is declared, listed and stamped. What is not declared is not carried.
- **Category:** Chrome extension (side panel) plus an identical-instance web app. One build, two entry points.
- **Name rationale:** *elide* is the verb for omitting a sound or syllable. It names the mechanism, not the metaphor. It avoids the shield/vault/guard lexicon the privacy category has exhausted.

### 0.2 Aesthetic (Gate 1) `[DECISION]`

**Customs desk.** Warm paper ground, near-black ink, hairline rules, stamped statuses, one signal colour reserved exclusively for material that has crossed the border. Dense and evidentiary, not atmospheric. Typography and rules carry the character, so there is no particle field, no gradient glow, no 3D and no photography anywhere in the product.

Why this and not a dark console: the product's promise is accountability. A lab worksheet makes the promise legible in a screen recording at 1080p, on a projector, and in a still thumbnail. A dark hacker terminal does not.

### 0.3 Identity Fingerprint (§0C) `[DECISION]`

```
User and task      A professional who must use cloud AI but cannot paste client
                   names, patient identifiers, account numbers or addresses into
                   it. Task: get the answer without the sensitive detail leaving
                   the machine.

Product metaphor   A customs checkpoint. Everything crossing the border is
                   declared, listed and stamped.

Composition        A ruled two-pane border. Left of the line is the device.
                   Right of the line is the cloud. The line is the product, and
                   content physically crosses it during use.

Information rhythm Dense, ruled, tabular, evidentiary. Mono for anything that
                   crosses. Hairline rules. Stamped statuses. Quiet space around
                   the crossing itself.

Image role         No photography, no 3D, no canvas. The visual material is the
                   manifest, the ruled surface and the entity marks.

Type character     Instrument Sans (interface), IBM Plex Mono (crossing data),
                   Oswald (stamps and labels only).

Interaction        The crossing. Send assembles the manifest, sweeps the entities,
signature          fills the outbound pane with redacted tokens, and restores
                   withheld values into the returned answer.

Motion character   Mechanical and short, 80 to 240 ms. Elements snap into ruled
                   positions. The scrub pass is a left-to-right sweep. No ambient
                   drift anywhere in the product.

Constraints        Chrome extension side panel. On-device inference requires a
                   user gesture to initialise. On-device is single-turn, text
                   only, no tools, ~4,096 tokens, with JSON schema output.
```

### 0.4 Dials `[DECISION]`

`DESIGN_VARIANCE 5` · `MOTION_INTENSITY 4` · `VISUAL_DENSITY 7`

High-frequency review tool on real documents. Density earns its place; variance and motion stay disciplined so the crossing reads as consequential. The personality is in the border metaphor, not in layout novelty.

### 0.5 Trend note

Primary signal: **quiet utility and information craft**. The product is a tool people will use forty times a day; calm type, ruled structure and low-friction motion serve that. Supporting signal: **human texture** in the paper ground and the stamped statuses, which keeps it from reading as generic enterprise grey. Deliberately excluded: immersive 3D, expressive maximalism, glow treatments. Research date 18 November 2026, per `DESIGN_TRENDS_SKILL.md`.

---

## 1. Global Design System

### 1.1 Fonts `[DECISION]`

```css
@import url('https://fonts.googleapis.com/css2?family=Instrument+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&family=IBM+Plex+Mono:wght@400;500;600&family=Oswald:wght@400;500;600&display=swap');
```

- `--font-sans`: `'Instrument Sans', system-ui, sans-serif` — interface, body, answer text
- `--font-mono`: `'IBM Plex Mono', ui-monospace, monospace` — crossing data, tokens, counts, IDs, timestamps
- `--font-stamp`: `'Oswald', 'Instrument Sans', sans-serif` — stamps, eyebrows, entity-type tags, uppercase only

Never use JetBrains Mono, Inter or Big Shoulders Display in this project.

### 1.2 Colour `[DECISION]` (Gate 5)

The accent rule is the identity: **`--accent` appears only on material that has crossed the border, and nowhere else.** If a piece of UI is signal-coloured, something left the device. No decorative accent use.

```css
:root {
  /* ground and paper */
  --bg-page:        #f4f1ea;   /* warm off-white page ground */
  --bg-surface:     #fbf9f4;   /* raised card, outbound pane */
  --bg-sunken:      #eae5da;   /* input wells, table stripes */
  --bg-device:      #f0ece2;   /* device-side column tint */
  --bg-cloud:       #f7f4ec;   /* cloud-side column tint */

  /* ink */
  --ink:            #131313;
  --ink-secondary:  #4a4741;
  --ink-muted:      #8a857a;
  --ink-inverse:    #f4f1ea;

  /* rules */
  --rule:           #d8d2c4;   /* hairline, 1px */
  --rule-strong:    #b3ab99;   /* border emphasis */
  --rule-ink:       #131313;   /* the border line itself */

  /* the one signal colour: crossed material only */
  --accent:         #a8402a;
  --accent-hover:   #8d3521;
  --accent-wash:    #f6e4de;
  --accent-ink:     #fbf9f4;

  /* entity highlight: on-device marks, never sent */
  --mark:           #1f5a52;
  --mark-wash:      #dcebe7;

  /* state */
  --ok:             #2f6b3f;
  --warn:           #8a5b00;
  --warn-wash:      #f7ecd6;
  --fail:           #a8402a;

  /* paper grain */
  --grain:          rgba(19, 19, 19, 0.035);

  --radius-none: 0px;
  --radius-sm:   2px;
  --radius-md:   3px;

  --shadow-raised: 0 1px 0 rgba(19,19,19,0.04), 0 2px 6px rgba(19,19,19,0.06);
  --shadow-stamp:  inset 0 0 0 1px var(--accent);

  --dur-1: 80ms;   /* hover, press */
  --dur-2: 140ms;  /* state change, pane fill */
  --dur-3: 240ms;  /* panel, sheet, crossing sweep */
  --dur-4: 480ms;  /* restore reveal, only once per answer */

  --ease-snap:  cubic-bezier(0.2, 0, 0, 1);
  --ease-out:   cubic-bezier(0.16, 1, 0.3, 1);
}
```

Contrast checks `[ASSUMPTION]`, verify at build: `--ink` on `--bg-page` = 15.8:1. `--ink-secondary` on `--bg-page` = 8.7:1. `--ink-muted` on `--bg-page` = 3.6:1, so `--ink-muted` is allowed for 12px-and-under metadata only if it reaches 4.5:1 against its actual ground; measure and darken to `#767067` if it fails. `--accent-ink` on `--accent` = 6.1:1. `--mark` on `--mark-wash` = 6.4:1.

### 1.3 Radii, rules and surfaces

The system is square. Radius tops out at `2px` on inputs and buttons and `3px` on panes. Every horizontal division is a 1px `--rule` line, never a shadow and never a gap alone. Surfaces are separated by rules and ground tint, not by elevation.

### 1.4 Paper grain `[DECISION]`

One texture layer, applied once at the app root, never per section.

```
Element: <div aria-hidden="true" class="grain" />
Class:   fixed inset-0 z-[3] pointer-events-none opacity-[0.6]
CSS:     background-image: url("data:image/svg+xml,...");  /* feTurbulence, baseFrequency 0.8, numOctaves 3 */
         background-size: 180px 180px;
         background-repeat: repeat;
         mix-blend-mode: multiply;
Token:   uses --grain as the SVG's fill alpha
Disable: @media (prefers-reduced-motion) does not affect it (it is static),
         but a user "reduced texture" preference is not implemented; opacity
         stays 0.6 everywhere.
```

The SVG data URI is generated once at build into `styles/grain.css`. It must not be a PNG.

### 1.5 Global z-index map `[DECISION]`

```
z-0    page ground and section grounds
z-[3]  paper grain overlay, fixed, pointer-events-none
z-10   all section content (relative)
z-20   sticky table headers, in-pane floating labels
z-30   the border line at x = 50% in the Playground, when extended full-height
z-40   command palette, global search
z-45   scrim for sheet or dialog, fixed inset-0, bg-[rgba(19,19,19,0.28)]
z-50   dialogs, sheets, toasts
z-60   skip link on focus
```

### 1.6 Motion primitives `[DECISION]`

Standard entrance, used by every section unless overridden. Note it is a rule-draw plus lift, not a blur-in; blur would fight the paper medium.

```
initial:    { opacity: 0, y: 12 }
animate:    { opacity: 1, y: 0 }
transition: { duration: 0.24, ease: [0.2, 0, 0, 1] }
viewport:   { once: true, amount: 0.35 }     /* once: true, replays are noise here */
stagger:    delay: 0.05 * index, base 0.06
```

Reduced motion: all entrances become `opacity 0 → 1, duration 0.001`. Nothing translates, sweeps or counts.

---

## 2. Navigation (Gate 2) `[DECISION]`

No drawer, no hamburger, no edge-drag zone. Both entry points use a fixed top rail; the extension narrows it.

### 2.1 Top rail — web app

```
Element: <header role="banner">
Position:  sticky top-0 z-50
Height:    h-14
Surface:   bg-[var(--bg-page)]/95 backdrop-blur-[2px]
Rule:      border-b border-[var(--rule)]

Inner:     mx-auto flex h-14 max-w-[1180px] items-center gap-6 px-6

Left cluster:
  Logo:          <img src={SITE_LOGO_SRC} alt="Elide" className="h-6 w-auto" />
                 SITE_LOGO_SRC resolves to the supplied file from S:\Hackathon\Elide\logo\logo;
                 preserve its actual format and extension when copying it into public/.
                 This image replaces the text wordmark; do not show both.
  Section tabs:  ml-6 flex items-center gap-1
    Tab:         px-3 py-1.5 font-sans text-[13px] font-medium
                 text-[var(--ink-secondary)] hover:text-[var(--ink)]
                 border-b-2 border-transparent transition-colors duration-[80ms]
    Tab active:  text-[var(--ink)] border-b-2 border-[var(--ink)]
    Tabs:        "Playground" "Ledger" "Policy"
    Semantics:   <nav aria-label="Primary"><a aria-current="page">

Right cluster: ml-auto flex items-center gap-3
  Device chip:   flex items-center gap-2 px-2.5 py-1.5
                 border border-[var(--rule)] bg-[var(--bg-surface)] font-mono text-[11px]
                 text-[var(--ink-secondary)] rounded-[2px]
    Dot:         w-1.5 h-1.5 rounded-full, bg-[var(--ok)] if Nano ready,
                 bg-[var(--ink-muted)] if not, bg-[var(--warn)] if downloading
    Label:       "NANO READY" | "NANO UNAVAILABLE" | "NANO 62%"
    Click:       opens the Device sheet (section 4.5)
  Account pill:  h-8 px-3 rounded-[2px] border border-[var(--rule)] bg-[var(--bg-surface)]
                 font-sans text-[12px] font-medium
                 Anonymous state label: "Sign in"    (see 7.4 on identity)
```

### 2.2 Top rail — extension side panel (400px default)

```
Position:  sticky top-0 z-50, h-12
Inner:     flex items-center gap-2 px-3
Left:      <img src={EXTENSION_LOGO_SRC} alt="Elide" className="h-5 w-auto" />
           Use the supplied extension asset from S:\Hackathon\Elide\logo\extension.
           The packaged icon path and any required format/size conversion are resolved
           from the actual supplied file(s); see section 10. Do not render a text wordmark.
Right:     ml-auto, icon-free. A single <button> with mono label "LEDGER"
           px-2 py-1 border border-[var(--rule)] rounded-[2px] text-[11px]
           Click opens the Ledger as a full-height sheet over the panel
Device chip: collapses to a 6px dot plus the word NANO, no percentage
Tabs:      replaced by a segmented control beneath the rail:
           <div role="tablist" class="grid grid-cols-2 border-b border-[var(--rule)]">
             two tabs, "Compose" and "Check", each h-9
             active: bg-[var(--bg-surface)] text-[var(--ink)] shadow-[inset_0_-2px_0_var(--ink)]
             inactive: text-[var(--ink-muted)]
```

### 2.3 The web app is three routes, not a page of sections

`/` is a single statement page (section 3). `/app` is the workbench. `/ledger` is the log. `/policy` is the rules editor. There is no marketing scroll after the first screen; a privacy tool that makes you scroll past three feature cards to reach the product has already lost the argument.

---

## 3. Landing — `/` (Gate 4) `[DECISION]`

Five bands, one screen-and-a-half on a 1440×900 desktop. Composition recipes referenced by behaviour, adapted: a statement lead, a live product artifact, a mechanism sequence, an honest-limits band, an install close. No hero image, no decorative section.

```text
Band 1  Statement            100dvh minus rail, the border is already visible
Band 2  Live crossing        a real, running interception on sample text
Band 3  Mechanism            three steps, each with its own micro-artifact
Band 4  Limits              what Elide cannot protect, stated plainly
Band 5  Install             one action, one line of copy
```

### 3.1 Band 1 — Statement

```text
SECTION: Statement
data-density="sparse"
Layout:  relative min-h-[calc(100dvh-3.5rem)] grid grid-cols-1 lg:grid-cols-12
         content-start, pt-16 pb-20
Background: bg-[var(--bg-page)]

Border rule (the product line, at rest):
  Position: absolute top-0 bottom-0 left-1/2 w-px bg-[var(--rule-ink)] z-30
  Desktop only: hidden lg:block
  Above it, a mono label rotated:
    absolute left-1/2 top-8 -translate-x-1/2, but sits offset right:
    ml-3 font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--ink-muted)]
    Text: "THIS SIDE NEVER LEAVES THE DEVICE"  (left of line, text-right, mr-3, -translate-x-full)
    Text: "THIS SIDE IS THE CLOUD"             (right of line, ml-3)

Left column (lg:col-span-6, pr-16, pl-6 md:pl-10):
  Eyebrow:  font-stamp text-[11px] font-medium uppercase tracking-[0.28em]
            text-[var(--mark)] mb-7
            Text: "ON-DEVICE SCRUBBING · CLOUD ANSWERS"
  Headline: font-sans text-[clamp(2.25rem,5.2vw,4.25rem)] font-semibold
            leading-[0.96] tracking-[-0.03em] text-[var(--ink)]
            max-w-[15ch]
            Lines: "Send the question." / "Not the client."
  Subhead:  mt-6 max-w-[42ch] font-sans text-[16px] leading-[1.6] text-[var(--ink-secondary)]
            Text: "Elide rewrites what you type into a manifest. Names, records and
                   account numbers are replaced on your device before the request
                   leaves, then put back into the answer when it returns."
  CTA row:  mt-9 flex items-center gap-3
    Primary: bg-[var(--ink)] text-[var(--ink-inverse)] px-5 py-3 rounded-[2px]
             font-sans text-[13px] font-medium tracking-[0.01em]
             hover:bg-[#000] transition-colors duration-[80ms]
             Label: "Add to Chrome"
    Secondary: border border-[var(--rule-strong)] px-5 py-3 rounded-[2px]
             font-sans text-[13px] text-[var(--ink)]
             hover:border-[var(--ink)] transition-colors duration-[80ms]
             Label: "Open the web app"
             href: /app
  Micro:    mt-4 font-mono text-[11px] text-[var(--ink-muted)]
            Text: "No account. No server-side history. The manifest stays in the tab."

Right column (lg:col-span-6, pl-16 pr-6 md:pr-10):
  A static, real manifest specimen (the same component the app uses, read-only):
  "THE CROSSING" caption above, font-stamp text-[10px] uppercase tracking-[0.24em]
  text-[var(--ink-muted)] mb-3

  Specimen card: border border-[var(--rule)] bg-[var(--bg-surface)] rounded-[3px]
    Header: flex justify-between px-3 py-2 border-b border-[var(--rule)]
      mono text-[10px] uppercase tracking-[0.14em] text-[var(--ink-muted)]
      Left: "MANIFEST 001"   Right: "4 WITHHELD"
    Rows (x4): grid grid-cols-[64px_1fr_auto] gap-3 px-3 py-2.5
      border-b border-[var(--rule)] last:border-0
      Col 1: font-stamp text-[10px] uppercase tracking-[0.12em] text-[var(--mark)]
             Values: NAME, ID, ACCOUNT, ADDRESS
      Col 2: original, struck: font-sans text-[13px] text-[var(--ink-muted)]
             line-through decoration-[var(--accent)] decoration-1
      Col 3: token, font-mono text-[12px] text-[var(--accent)]
             Values: ⟦NAME_1⟧ ⟦ID_1⟧ ⟦ACCT_1⟧ ⟦ADDR_1⟧
    Footer: px-3 py-2 border-t border-[var(--rule)] bg-[var(--bg-sunken)]
      flex justify-between font-mono text-[10px] text-[var(--ink-secondary)]
      Left: "OUTBOUND PAYLOAD" Right: "0 IDENTIFIERS"

Animation:
  Border rule:    scaleY 0 -> 1, transform-origin top, duration 0.48s, ease --ease-out, delay 0.05s
  Left column:    standard entrance, children staggered at 0.06s from 0.12s
  Specimen card:  standard entrance, delay 0.30s
  Rows:           each row's Col 3 token fades in 0 -> 1 at delay 0.55 + i*0.06
  Struck values:  clip-path inset(0 100% 0 0) -> inset(0 0 0 0), duration 0.32s,
                  ease --ease-snap, delay 0.50 + i*0.06  (the strike draws, it does not blink)
Reduced motion: border rule appears at scaleY 1 immediately; rows render final; entries opacity-only.
```

### 3.2 Band 2 — Live crossing

```text
SECTION: Live crossing
Layout:  py-24 md:py-28 px-6
Background: bg-[var(--bg-sunken)]/60, border-y border-[var(--rule)]

Container: mx-auto max-w-[1180px] grid grid-cols-1 lg:grid-cols-12 gap-10
Left (lg:col-span-4):
  Label:   font-stamp text-[10px] uppercase tracking-[0.24em] text-[var(--mark)] mb-4
           Text: "TRY IT ON THIS TEXT"
  Heading: font-sans text-[26px] md:text-[30px] font-semibold leading-[1.1]
           tracking-[-0.02em] text-[var(--ink)] max-w-[18ch]
           Text: "The same sentence, on both sides of the line."
  Body:    mt-4 font-sans text-[14px] leading-[1.65] text-[var(--ink-secondary)] max-w-[38ch]
           Text: "This runs on your machine now. If Nano is not ready it borrows the
                  cloud for the scrub pass and says so above the result."
  Toggle:  mt-6, a real switch, see component 5.3

  Sample picker: mt-6 flex flex-wrap gap-2
    Chip: px-2.5 py-1.5 border border-[var(--rule)] bg-[var(--bg-surface)] rounded-[2px]
          font-mono text-[11px] text-[var(--ink-secondary)]
          hover:border-[var(--ink)] transition-colors duration-[80ms]
          aria-pressed styling: aria-pressed=true -> border-[var(--ink)] text-[var(--ink)]
    Chips: "Clinic note" "Legal memo" "Support ticket"

Right (lg:col-span-8):
  Two panes with the border between them:
    grid grid-cols-1 md:grid-cols-2 border border-[var(--rule)] rounded-[3px]
    bg-[var(--bg-surface)]
    Each pane: p-4 min-h-[260px]
      Pane header: flex justify-between items-baseline pb-2 mb-3
                   border-b border-[var(--rule)]
        Title: font-stamp text-[10px] uppercase tracking-[0.2em] text-[var(--ink-muted)]
        Left pane title: "ON THIS DEVICE"
        Right pane title: "SENT TO THE CLOUD"
      Body: font-sans text-[14px] leading-[1.7] text-[var(--ink)] whitespace-pre-wrap
      Right pane body: same, and any ⟦TOKEN⟧ rendered as
        inline-block px-1 rounded-[2px] bg-[var(--accent-wash)]
        font-mono text-[12px] text-[var(--accent)]
      Left pane entities: <mark> with
        bg-[var(--mark-wash)] text-[var(--mark)] px-0.5 rounded-[1px]
        border-b border-[var(--mark)]

  Divider between panes: md:border-l md:border-[var(--rule-ink)]
  Footer strip across both panes: border-t border-[var(--rule)] px-4 py-2
    flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.12em]
    Left: "SCRUBBED ON NANO · 41 MS" (or "SCRUBBED IN CLOUD · 612 MS")
    Right: a button "VERIFY" px-2 py-1 border border-[var(--rule)]
           hover:border-[var(--ink)] rounded-[2px] text-[10px]

Animation on scrub:
  Sweep: a 2px vertical bar in var(--mark) travels left to right across the LEFT
         pane only, from x=0 to x=100%, duration 0.24s, ease --ease-snap, opacity 0.5.
         Implemented as an absolutely positioned div that animates `left` via
         transform: translateX(); it unmounts on animation end.
  During sweep: each entity's <mark> background expands from scaleX 0.2 to 1,
         transform-origin left, staggered 24ms in document order.
  Right pane:    fills after the sweep completes, tokens fading 0 -> 1 with a
         40ms stagger, duration 0.14s, ease --ease-snap.
  Footer strip:  text swaps, no animation, after both panes settle.
```

### 3.3 Band 3 — Mechanism

```text
SECTION: Mechanism
Layout:  py-24 md:py-32 px-6
Background: bg-[var(--bg-page)]

Header:  max-w-[1180px] mx-auto mb-14 grid grid-cols-1 lg:grid-cols-12 items-baseline
  Label (col-span-3): font-stamp text-[10px] uppercase tracking-[0.24em] text-[var(--ink-muted)]
    Text: "HOW IT WORKS"
  Title (col-span-9): font-sans text-[clamp(1.75rem,3.2vw,2.5rem)] font-semibold
    leading-[1.06] tracking-[-0.025em] text-[var(--ink)] max-w-[26ch]
    Text: "Three calls. One of them never leaves the machine."

Steps:   max-w-[1180px] mx-auto divide-y divide-[var(--rule)]
         border-y border-[var(--rule)]

Step row (x3): grid grid-cols-1 lg:grid-cols-12 gap-6 py-8
  Number (lg:col-span-1): font-mono text-[11px] text-[var(--ink-muted)] pt-1
    Values: "01" "02" "03"
  Body (lg:col-span-5):
    Title: font-sans text-[17px] font-semibold text-[var(--ink)]
      "Declare" / "Cross" / "Restore"
    Copy:  mt-2 font-sans text-[14px] leading-[1.65] text-[var(--ink-secondary)] max-w-[40ch]
      "A single structured call to Gemini Nano returns every identifier it can find
       as JSON: type, exact span, replacement token. It runs on the tab, in a few
       hundred milliseconds, with no network request."
      "Only the rewritten text is sent. The cloud model answers questions about the
       document without ever receiving a name, a record number or an address."
      "Tokens are matched back to their originals on the device. The answer reads
       normally, and the ledger records exactly what was withheld."
  Artifact (lg:col-span-6):
    Each row carries a different, live micro-artifact, never the same card three times.
    01: the schema, rendered as a mono code block, 4 lines, real field names
    02: a request line with a byte count that animates 842 -> 611 on hover of the row
    03: the restore diff, a token replacing itself in place, replaying on row hover
    Style: border border-[var(--rule)] bg-[var(--bg-surface)] rounded-[2px] p-3
           font-mono text-[11.5px] leading-[1.7] text-[var(--ink-secondary)]
           overflow-x-auto

  Row hover: bg-[var(--bg-sunken)]/40 transition-colors duration-[80ms]
  Row entrance: standard entrance, stagger 0.06s
```

### 3.4 Band 4 — Limits

The band that wins trust, and the one every competitor will skip.

```text
SECTION: Limits
Layout:  py-20 md:py-24 px-6
Background: bg-[var(--bg-sunken)] border-y border-[var(--rule)]

Container: max-w-[1180px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10
Left (col-span-4):
  Label: font-stamp text-[10px] uppercase tracking-[0.24em] text-[var(--accent)] mb-4
    Text: "WHAT THIS DOES NOT DO"
  Heading: font-sans text-[26px] md:text-[30px] font-semibold leading-[1.1]
    tracking-[-0.02em] text-[var(--ink)] max-w-[20ch]
    Text: "Four honest limits."
Right (col-span-8):
  Rows (x4): divide-y divide-[var(--rule)] border-y border-[var(--rule)]
    Row: grid grid-cols-[1fr_auto] gap-4 py-4 items-baseline
      Lead: font-sans text-[14px] font-medium text-[var(--ink)]
      Tail: font-sans text-[13px] text-[var(--ink-secondary)] text-right max-w-[34ch]
    Content:
      1 "An identifier Elide has never seen"       "→ the manifest shows it was not withheld, and you can add the pattern."
      2 "Images and PDFs"                          "→ the on-device pass handles text only. Files are flagged, never auto-sent."
      3 "Meaning that hides in plain prose"        "→ a description can re-identify someone. The warning stays visible."
      4 "The remote model's own retention"         "→ Elide cannot control a server it does not run. It only controls what arrives."
  Each row has a right-aligned mono counter of the pattern count, e.g. "12 PATTERNS"
```

### 3.5 Band 5 — Install

```text
SECTION: Install
Layout:  py-28 md:py-36 px-6
Background: bg-[var(--bg-page)]
Container: max-w-[680px] mx-auto
  Heading: font-sans text-[clamp(1.9rem,3.6vw,2.75rem)] font-semibold
    leading-[1.04] tracking-[-0.03em] text-[var(--ink)]
    Text: "Add Elide once. Use it everywhere you were already pasting."
  Body:   mt-4 font-sans text-[15px] leading-[1.65] text-[var(--ink-secondary)] max-w-[46ch]
    Text: "It opens as a side panel on any tab. Compose once, then send the
           scrubbed version to whichever assistant you already pay for."
  CTA row: mt-8 flex flex-wrap items-center gap-3
    Primary: bg-[var(--accent)] text-[var(--accent-ink)] px-5 py-3 rounded-[2px]
             font-sans text-[13px] font-medium
             hover:bg-[var(--accent-hover)] transition-colors duration-[80ms]
             Label: "Add to Chrome"
    Secondary: font-mono text-[12px] text-[var(--ink-secondary)]
               underline decoration-[var(--rule-strong)] underline-offset-4
               hover:decoration-[var(--ink)]
               Label: "chrome://extensions → Load unpacked"
  Install snippet: mt-8 border border-[var(--rule)] bg-[var(--bg-surface)]
    rounded-[3px] px-4 py-3 font-mono text-[11.5px] text-[var(--ink-secondary)]
    One line: the repository URL, with a copy button that flips label to "COPIED" for 1.8s
```

### 3.6 Footer (shared)

```text
Element: <footer>
Layout:  border-t border-[var(--rule)] py-10 px-6
Background: bg-[var(--bg-page)]
Container: mx-auto max-w-[1180px] flex flex-col md:flex-row md:items-end
           md:justify-between gap-6
Left:
  Logo:     <img src={SITE_LOGO_SRC} alt="Elide" className="h-5 w-auto" />
            Reuse the supplied site logo; no text-rendered wordmark.
  Line:     mt-2 font-sans text-[12px] text-[var(--ink-muted)] max-w-[44ch]
            Text: "Built for #BuildHybridAI 2026. Inference by Firebase AI Logic,
                   on-device through Gemini Nano, in the cloud through Gemini."
Right: flex flex-wrap gap-x-6 gap-y-2
  Links: font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--ink-secondary)]
         hover:text-[var(--accent)] transition-colors duration-[80ms]
  Links: "Ledger" "Policy" "GitHub" "Rules"
Bottom: mt-8 pt-5 border-t border-[var(--rule)] flex flex-wrap justify-between gap-3
  font-mono text-[10.5px] text-[var(--ink-muted)]
  Left: "© 2026 Elide"
  Right: "Apache-2.0 · Firebase AI Logic · App Check enforced"
```

---

## 4. App interior — `/app` (Gate 6)

The workbench. Composition follows the reference project's workbench pattern in structure only; the voice, surfaces and states below are this product's.

### 4.1 Layout

```text
Page: flex h-[calc(100dvh-3.5rem)] overflow-hidden bg-[var(--bg-page)]

Left rail (document list), hidden below lg:
  w-[248px] shrink-0 border-r border-[var(--rule)] flex flex-col
  Header: h-11 px-3 flex items-center justify-between border-b border-[var(--rule)]
    Label: font-stamp text-[10px] uppercase tracking-[0.2em] text-[var(--ink-muted)]
      Text: "DOCUMENTS"
    Add:   <button aria-label="New document"> w-6 h-6 flex items-center justify-center
           border border-[var(--rule)] rounded-[2px] text-[var(--ink-secondary)]
           hover:border-[var(--ink)] hover:text-[var(--ink)]
           Content: a 10px plus, drawn with two 1px divs, no icon font
  List: flex-1 overflow-y-auto
    Item: group flex flex-col gap-0.5 px-3 py-2.5 border-b border-[var(--rule)]
          hover:bg-[var(--bg-surface)] cursor-pointer
          aria-current=true -> bg-[var(--bg-surface)] shadow-[inset_2px_0_0_var(--ink)]
      Title: font-sans text-[13px] font-medium text-[var(--ink)] truncate
      Meta:  font-mono text-[10px] text-[var(--ink-muted)]
             "{n} IDENTIFIERS · {relative time}"
  Footer: h-10 px-3 border-t border-[var(--rule)] flex items-center
    font-mono text-[10px] text-[var(--ink-muted)]
    Text: "LOCAL ONLY · NOT SYNCED"

Compose pane (centre), flex-1 min-w-0 flex flex-col:
  Toolbar: h-11 px-4 flex items-center gap-2 border-b border-[var(--rule)]
    Title input: flex-1 min-w-0 bg-transparent font-sans text-[13px] font-medium
      text-[var(--ink)] outline-none placeholder:text-[var(--ink-muted)]
      placeholder: "Untitled document"
    Right cluster: flex items-center gap-2
      DeviceChip (2.1)
      Policy button: h-7 px-2.5 border border-[var(--rule)] rounded-[2px]
        font-mono text-[10.5px] uppercase tracking-[0.1em] text-[var(--ink-secondary)]
        hover:border-[var(--ink)] hover:text-[var(--ink)]
        Label: "POLICY · 12"
  Editor well: flex-1 overflow-y-auto
    Inner: mx-auto max-w-[720px] px-6 py-6
    The editor is a controlled textarea, styled to look typeset:
      w-full min-h-[40vh] resize-none bg-transparent outline-none
      font-sans text-[15px] leading-[1.75] text-[var(--ink)]
      caret-[var(--accent)]
    Entity marks inside the editor: the textarea is overlaid by a mirror <div>
      aria-hidden="true" positioned absolute inset-0 with identical type metrics;
      the textarea itself is transparent-text (color: transparent; caret-color: var(--accent)).
      Mirror renders text with <mark> spans for detected entities, styled per 4.4.
      Rationale: a contenteditable would break caret and IME behaviour; the mirror keeps
      native textarea semantics and selection while drawing the marks.
  Composer bar: border-t border-[var(--rule)] bg-[var(--bg-surface)]
    Inner: mx-auto max-w-[720px] px-6 py-3
      Row 1: the prompt textarea, 2 rows, bg-transparent, resize-none, outline-none,
             font-sans text-[14px] leading-[1.6] text-[var(--ink)]
             placeholder: "Ask about this document"
      Row 2: mt-2 flex items-center justify-between
        Left: the crossing summary, font-mono text-[10.5px] text-[var(--ink-secondary)]
              "{n} withheld · {k} flagged"  or  "Nothing withheld"
        Right: Send button
          bg-[var(--ink)] text-[var(--ink-inverse)] px-4 py-2 rounded-[2px]
          font-sans text-[12px] font-medium hover:bg-black transition-colors duration-[80ms]
          disabled: bg-[var(--bg-sunken)] text-[var(--ink-muted)] cursor-not-allowed
          Label: "Send"  |  when sending: "Sending" with an inline 12px progress rule
          Keyboard: Cmd/Ctrl+Enter

Answer pane (right), hidden below xl then shown as a sheet:
  w-[420px] shrink-0 border-l border-[var(--rule)] flex flex-col bg-[var(--bg-surface)]
  Header: h-11 px-4 flex items-center justify-between border-b border-[var(--rule)]
    Left: font-stamp text-[10px] uppercase tracking-[0.2em] text-[var(--ink-muted)]
      Text: "ANSWER"
    Right: the provenance stamp (4.6)
  Body: flex-1 overflow-y-auto px-4 py-4
    Answer text: font-sans text-[14px] leading-[1.7] text-[var(--ink)] whitespace-pre-wrap
    Restored tokens: inline, bg-[var(--accent-wash)] text-[var(--accent)]
      border-b border-[var(--accent)] px-0.5 font-sans text-[13.5px]
      with a 1px dotted underline marking "restored on device"
  Footer: border-t border-[var(--rule)] px-4 py-2.5 flex items-center justify-between
    Left: font-mono text-[10px] text-[var(--ink-muted)]  "LEDGER ENTRY #0421"
    Right: flex gap-2
      "COPY" and "COPY REDACTED" buttons, mono 10.5px uppercase, bordered, 2px radius

Mobile / narrow (<xl): the answer pane becomes a bottom sheet, 70dvh, with a grab bar
  (w-10 h-1 rounded-full bg-[var(--rule-strong)] mx-auto my-2) plus an explicit
  "Close answer" button in its header. Never gesture-only.
```

### 4.2 The border in the app

The vertical line at the seam between the compose pane and the answer pane is `border-l border-[var(--rule-ink)]`, sitting at z-30. During a send it thickens to `2px` for `--dur-3` then returns. That single 1px change is the only chrome that marks the crossing in the app interior, which keeps the metaphor present without adding a diagram.

### 4.3 States — the scrub pass

| State | Visible result | Copy |
|---|---|---|
| Idle, Nano ready | Device chip dot `--ok`, editor marks render live as you type or paste | `NANO READY` |
| Idle, Nano unavailable | Dot `--ink-muted`, no live marks, composer summary reads `Marks appear after send` | `NANO UNAVAILABLE` |
| Model downloading | Dot `--warn`, a 2px progress rule directly under the device chip, width bound to the progress callback | `NANO 62%` |
| Initialising | Device chip dot pulses opacity 0.4↔1 over 900ms, loop, until resolved | `NANO STARTING` |
| Scanning | Editor mirror marks sweep in; send button disabled with label `Scanning` | — |
| Scanned | Marks visible, summary populates, send enabled | `{n} withheld · {k} flagged` |
| Escalation | A row in the manifest is marked `UNSURE`, and if the user has allowed it, that single item is re-checked in the cloud with only surrounding context, never the whole document | `UNSURE · CHECK IN CLOUD?` |
| Offline | Device chip reads `NANO READY`, cloud chip appears in the composer as `OFFLINE`, Send disabled | `Send needs a connection. Scrubbing still works.` |
| Cloud failure | Answer pane shows the failure state | `The cloud call failed. Nothing was sent again. Your document is unchanged.` plus `Retry` |
| Empty document | Editor shows the empty state, centred, not a placeholder string in a box | Heading `Nothing to check yet`, sub `Paste a document, or pick a sample.`, then three sample chips (same as 3.2) |

### 4.4 Entity mark treatment `[DECISION]`

```
<mark> base:
  bg-[var(--mark-wash)] text-[var(--mark)] px-0.5 rounded-[1px]
  border-b border-[var(--mark)] box-decoration-clone
<mark data-type="name">    underline style solid, 1px
<mark data-type="id">      underline style solid, 1px
<mark data-type="account"> underline style dashed, 1px   (financial: distinct at a glance)
<mark data-type="address"> underline style dotted, 1px   (addresses: distinct)
<mark data-uncertain="true">
  bg-[var(--warn-wash)] text-[var(--warn)] border-b border-dashed border-[var(--warn)]
  Title/aria: "Elide is not certain this is an identifier"

Never encode type by colour alone: the underline style plus the manifest's type column
both carry the information.
```

### 4.5 Device sheet

```
Trigger: the device chip in the top rail, or the chip in the composer toolbar
Surface: right-anchored sheet, w-[380px] max-w-[92vw], h-full, z-50
  bg-[var(--bg-surface)] border-l border-[var(--rule)]
  enter: translateX(100%) -> 0, duration 0.24s, ease --ease-out
  exit:  -> 100%, duration 0.18s, ease --ease-snap
Scrim: z-45 bg-[rgba(19,19,19,0.28)], opacity 0 -> 1, 0.18s
Content:
  Header:  h-12 px-4 flex items-center justify-between border-b border-[var(--rule)]
    Title:  font-stamp text-[10px] uppercase tracking-[0.2em] "ON-DEVICE MODEL"
    Close:  <button aria-label="Close"> 24x24, an X drawn with two 1px divs
  Rows:    divide-y divide-[var(--rule)]
    "Availability"   -> mono value: `available` | `downloadable` | `downloading` | `unavailable`
    "Progress"       -> mono value, percentage, updates live
    "Cloud fallback" -> mono value: `gemini-3.5-flash-lite` (default) or the configured model
    "Inference mode" -> mono value: `PREFER_ON_DEVICE`
    "App Check"      -> mono value: `debug token` | `enforced`
  Init button:
    If availability is `downloadable` or `downloading`, a primary button:
      "Prepare on-device model" — this is the required user gesture.
      While running: label "Preparing", disabled, progress rule beneath.
    Copy under it, font-sans text-[12px] text-[var(--ink-muted)]:
      "Chrome downloads the model once. It stays on this device."
  Footer note: px-4 py-3 border-t border-[var(--rule)]
    font-mono text-[10px] text-[var(--ink-muted)]
    "NO ON-DEVICE LOGS LEAVE THIS TAB. CLOUD CALLS ARE LOGGED IN FIREBASE AI MONITORING."
Focus: trapped, Escape closes, focus returns to the triggering chip.
```

### 4.6 Provenance stamp `[FACT: inferenceSource]` `[DECISION: presentation]`

Every answer carries exactly one stamp, derived from `response.inferenceSource`, which the SDK returns as `ON_DEVICE` or `IN_CLOUD`.

```
Stamp shell: inline-flex items-center gap-1.5 px-2 py-1 rounded-[2px]
             font-stamp text-[9.5px] uppercase tracking-[0.16em]
ON_DEVICE:   border border-[var(--mark)] text-[var(--mark)] bg-[var(--mark-wash)]
             Label: "ANSWERED ON DEVICE"
IN_CLOUD:    border border-[var(--accent)] text-[var(--accent)] bg-[var(--accent-wash)]
             Label: "ANSWERED IN CLOUD"
Struck, rotated look: rotate-[-2deg] and shadow-[inset_0_0_0_1px_currentColor]
  applied only to the ON_DEVICE stamp, so the two read as different objects.
Transition: on arrival, scale 1.08 -> 1 over 0.18s, ease --ease-snap.
Motion never the only signal: the label text is the primary carrier.
```

### 4.7 The ledger — `/ledger`

```
Page: mx-auto max-w-[1100px] px-6 py-8
Header row: flex items-end justify-between mb-6
  Left: h1 font-sans text-[24px] font-semibold tracking-[-0.02em] "Ledger"
        sub: font-sans text-[13px] text-[var(--ink-secondary)] mt-1
             "Every crossing this browser made. Stored locally, exportable."
  Right: two buttons, mono 10.5px uppercase, bordered:
         "EXPORT JSON" and "CLEAR LEDGER" (destructive, opens confirm dialog)

Table: w-full border border-[var(--rule)] rounded-[3px] bg-[var(--bg-surface)]
  Head: sticky top-14 z-20 bg-[var(--bg-surface)] border-b border-[var(--rule-strong)]
    Cells: px-3 py-2 text-left font-stamp text-[9.5px] uppercase tracking-[0.16em]
           text-[var(--ink-muted)]
    Columns: TIME | DOCUMENT | WITHHELD | ANSWERED | FALLBACK | ENTRY
  Body rows: border-b border-[var(--rule)] hover:bg-[var(--bg-sunken)]/40
    Cells: px-3 py-2.5 font-mono text-[11.5px] text-[var(--ink-secondary)]
    TIME: relative time, title attribute carries the ISO string
    WITHHELD: "{n}" plus a type breakdown on hover, via a popover row that expands
    ANSWERED: mini stamp per 4.6, text only, 9px
    FALLBACK: "yes" rendered in var(--accent) if the scrub ran in cloud, else "--"
    ENTRY: a "VIEW" text button opening the entry detail sheet
  Empty state (no rows): a ruled block, not an illustration
    min-h-[220px] flex flex-col items-center justify-center gap-2
    font-sans text-[14px] text-[var(--ink)] "Nothing has crossed yet."
    font-sans text-[12px] text-[var(--ink-muted)] "Send a document from the Playground."
Mobile (<md): the table becomes a list of ruled entries, each two lines:
  line 1 mono time + mini stamp, line 2 document name + withheld count.
  No horizontal scroll, no card-per-row shadow.

Entry detail sheet: right sheet, w-[460px], same shell as 4.5.
  Content is the full manifest for that crossing plus the exact outbound payload,
  rendered in a <pre> with font-mono text-[11px] and a copy button.
```

### 4.8 Policy editor — `/policy`

```
Page: mx-auto max-w-[860px] px-6 py-8
Intro: h1 "Policy" + sub "What counts as an identifier. Changes apply on this device only."

Per-category block (x6): border border-[var(--rule)] rounded-[2px] bg-[var(--bg-surface)]
  mb-3
  Header: flex items-center justify-between px-3 py-2.5 border-b border-[var(--rule)]
    Left: flex items-center gap-2.5
      Switch (5.3, small variant)
      Label: font-sans text-[13px] font-medium text-[var(--ink)]  e.g. "Person names"
    Right: font-mono text-[10px] text-[var(--ink-muted)] "12 PATTERNS"
  Body: px-3 py-3
    Pattern chips: flex flex-wrap gap-1.5
      Chip: font-mono text-[11px] px-1.5 py-1 rounded-[2px] bg-[var(--bg-sunken)]
            text-[var(--ink-secondary)] border border-[var(--rule)]
      Add chip: dashed border, "add pattern", opens an inline input
  Categories: Person names · Record and patient IDs · Account and card numbers ·
              Postal addresses · Email and phone · Custom terms

Footer: a sticky bar with one action
  "Save policy" primary; a mono note "Policy version 3 · stored on this device".
  If Remote Config supplies a newer team policy, a second line:
  "A workspace policy is available. Applying it will replace your local patterns."
  with an "Apply" text button. This is the only place the product mentions workspaces,
  and only if Firebase Remote Config returns a policy version.
```

---

## 5. Shared components

Recipes defined once, referenced by number.

### 5.1 `Rule` — the divider

```
<div role="separator" class="h-px w-full bg-[var(--rule)]" />
Emphasis variant: bg-[var(--rule-strong)]
Ink variant (the border line): w-px h-full bg-[var(--rule-ink)]
```

### 5.2 `MonoLabel`

```
font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--ink-muted)]
Optional leading rule: before a 12px 1px line in currentColor.
```

### 5.3 `Switch`

```
Button: role="switch", aria-checked, min-h-[44px] hit area via padding, visible track 34x18
Track:  w-[34px] h-[18px] rounded-full border border-[var(--rule-strong)]
        bg-[var(--bg-sunken)]
        checked: bg-[var(--ink)] border-[var(--ink)]
Thumb:  absolute w-3.5 h-3.5 rounded-full bg-[var(--bg-surface)] border border-[var(--rule-strong)]
        left-[2px] -> translateX(16px)
        checked: bg-[var(--bg-page)] border-transparent
Motion: transform 140ms --ease-snap; track colours 80ms
Focus:  focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2
        focus-visible:outline-[var(--ink)]
Small variant (policy rows): track 28x15, thumb 2.5, offset 14px.
Label is always a real <label for>, clickable, and the whole row toggles.
```

### 5.4 `Token`

```
<span class="inline-block px-1 rounded-[2px] bg-[var(--accent-wash)]
             font-mono text-[11.5px] text-[var(--accent)] select-all">⟦NAME_1⟧</span>
```

### 5.5 `EmptyState`

```
min-h-[160px] flex flex-col items-center justify-center gap-2 text-center px-6
Title: font-sans text-[14px] font-medium text-[var(--ink)]
Body:  font-sans text-[12.5px] text-[var(--ink-muted)] max-w-[36ch]
Rule above title: w-8 h-px bg-[var(--rule-strong)] mb-1
No illustration, no icon.
```

### 5.6 `ProgressRule`

```
<div role="progressbar" aria-valuenow={pct} aria-valuemin="0" aria-valuemax="100"
     class="h-[2px] w-full bg-[var(--rule)]">
  <div class="h-full bg-[var(--ink)] transition-[width] duration-200 ease-linear"
       style="width: {pct}%" />
</div>
Used for model download and for send progress. Never a spinner anywhere in the product.
```

### 5.7 `ConfirmDialog`

```
Scrim z-45, panel z-50, w-[380px] max-w-[92vw] bg-[var(--bg-surface)]
border border-[var(--rule-strong)] rounded-[3px] p-5
Title: font-sans text-[15px] font-semibold
Body:  font-sans text-[13px] text-[var(--ink-secondary)] mt-2 leading-[1.6]
Actions: flex justify-end gap-2 mt-5
  Cancel: bordered, mono-free sans 12px
  Destructive: bg-[var(--accent)] text-[var(--accent-ink)] px-3.5 py-2 rounded-[2px]
  Destructive label names the object: "Clear ledger", never "Continue".
Focus trap, Escape cancels, focus returns to trigger.
```

### 5.8 `Toast`

```
Position: fixed bottom-4 left-1/2 -translate-x-1/2 z-50
Shell: bg-[var(--ink)] text-[var(--ink-inverse)] px-3.5 py-2 rounded-[2px]
       font-sans text-[12.5px] shadow-[var(--shadow-raised)]
Enter: y 8 -> 0, opacity 0 -> 1, 0.18s --ease-out
Exit:  opacity -> 0, 0.14s, after 3.2s; or immediately on Escape
Used only for copy confirmations and policy saves. Never for errors, those are inline.
```

---

## 6. Motion specification

Consulted once, in one place, so nothing drifts.

| Event | Property | From → To | Duration | Easing | Notes |
|---|---|---|---|---|---|
| Section entrance | opacity, translateY | 0, 12px → 1, 0 | 240ms | `--ease-snap` | Once only |
| Staggered children | delay | — | 0.05s × i | — | Base delay 60ms |
| Border line draw (landing) | scaleY | 0 → 1 | 480ms | `--ease-out` | Origin top |
| Scrub sweep (landing) | translateX | 0 → pane width | 240ms | `--ease-snap` | Leaves no residue |
| Entity mark reveal | scaleX | 0.2 → 1 | 140ms | `--ease-snap` | Stagger 24ms, origin left |
| Token fill (outbound pane) | opacity | 0 → 1 | 140ms | `--ease-snap` | Stagger 40ms |
| Restore in answer | background-color, opacity | wash → transparent over 480ms | 480ms | `--ease-out` | Once per answer; the restored span keeps its underline |
| Stamp arrival | scale | 1.08 → 1 | 180ms | `--ease-snap` | — |
| Send button label swap | opacity | 0 → 1 | 80ms | linear | No width animation |
| Sheet enter | translateX | 100% → 0 | 240ms | `--ease-out` | — |
| Sheet exit | translateX | 0 → 100% | 180ms | `--ease-snap` | — |
| Scrim | opacity | 0 → 1 | 180ms | linear | — |
| Toast | opacity, translateY | 0, 8px → 1, 0 | 180ms | `--ease-out` | — |
| Hover states | colour/border | token change | 80ms | linear | CSS only, no JS |
| The border in `/app` | width | 1px → 2px → 1px | 240ms / 240ms | `--ease-snap` | On send only |

Reduced motion: every row above collapses to an instant state change. The scrub sweep does not render at all; marks appear already revealed. The restore highlight becomes a static 480ms fade of the wash only.

Ambient motion is zero. Nothing loops, drifts, pulses or floats. The only repeating animation in the product is the device-chip initialising pulse, and it stops the moment availability resolves.

---

## 7. Data, model and honest limits

### 7.1 What crosses the border, precisely

`[FACT]` The on-device model on Web is single-turn, text-only, has no tools or function calling, and accepts roughly 4,096 tokens. `[FACT]` Structured output is supported on-device through `onDeviceParams.promptOptions.responseConstraint`. `[FACT]` `response.inferenceSource` returns `ON_DEVICE` or `IN_CLOUD`. `[FACT]` The default cloud fallback for `PREFER_ON_DEVICE` is `gemini-3.5-flash-lite` starting SDK v13.0.0, overridable via `inCloudParams.model`.

```
Scrub pass   model: getGenerativeModel(ai, {
               mode: InferenceMode.PREFER_ON_DEVICE,
               onDeviceParams: {
                 createOptions: {
                   expectedInputs:  [{ type: 'text', languages: ['en'] }],
                   expectedOutputs: [{ type: 'text', languages: ['en'] }],
                   initialPrompts: [{ role: 'system',
                     content: [{ type: 'text', value: SCRUB_SYSTEM_PROMPT }] }]
                 },
                 promptOptions: { responseConstraint: SCRUB_SCHEMA }
               },
               inCloudParams: {
                 model: 'gemini-3.5-flash-lite',
                 generationConfig: {
                   responseMimeType: 'application/json',
                   responseSchema: SCRUB_SCHEMA
                 }
               }
             })
             Single turn. No history. No tools. Document text only.

Answer pass  model: getGenerativeModel(ai, {
               mode: InferenceMode.ONLY_IN_CLOUD,
               inCloudParams: { model: 'gemini-3.5-flash-lite' }
             })
             Receives: the scrubbed text, the prompt, and nothing else.
             Never receives: originals, the map, document metadata or file names.
```

`SCRUB_SCHEMA`, exact shape used for both tiers:

```ts
{
  type: 'object',
  properties: {
    spans: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          type:   { type: 'string', enum: ['NAME','ID','ACCOUNT','ADDRESS','CONTACT','CUSTOM'] },
          start:  { type: 'integer' },
          end:    { type: 'integer' },
          token:  { type: 'string' },
          confidence: { type: 'string', enum: ['high','low'] }
        },
        required: ['type','start','end','token','confidence']
      }
    }
  },
  required: ['spans']
}
```

`confidence: 'low'` is what produces the `UNSURE` manifest row and the dashed warn mark. The UI never claims certainty it does not have.

### 7.2 Deterministic backstop

Regex passes run **before** the model, for the shapes a model should not be trusted with: email, phone, IBAN, card-number patterns (Luhn-checked), national ID shapes per the active policy, and any literal terms the user has added to policy. Model output is merged with those, and overlapping spans are resolved by preferring the deterministic one. This is also what makes the offline promise real: with Nano unavailable and no network, the deterministic pass still runs.

### 7.3 The honest claim, worded

Fixed copy, used in the README, the submission description and the demo video, and never softened:

> Elide removes identifiers from text before it is sent to a cloud model, and restores them afterwards. It cannot guarantee that no re-identification is possible, because prose can imply identity without naming it. It does not control what the remote provider retains. It is a reduction in exposure, applied before the request, not a guarantee of anonymity.

### 7.4 Identity and Firebase products, and why each is present

`[FACT]` App Check is required for Firebase AI Logic and enforced automatically as of 2 November 2026. `[DECISION]` The rest:

| Product | Actual job in this product | If it were removed |
|---|---|---|
| **App Check** | Required by AI Logic. Debug token in dev, reCAPTCHA Enterprise in prod | Nothing works |
| **Remote Config** | Ships the **team policy manifest**: which entity types are mandatory, the pattern library version, and a per-organisation kill list of terms that must always be withheld. Fetched at start, cached, versioned | Every user hand-configures patterns, so teams cannot enforce a standard |
| **Firestore** | **Team ledger**: an opt-in, write-only record containing only counts, types, timestamps, `inferenceSource` and the policy version. Never document text, never originals, never tokens | An audit trail that a compliance reviewer would accept does not exist |
| **Authentication** | Anonymous sign-in by default, so App Check and Firestore security rules have a stable principal. Google sign-in only when joining a team ledger | Rules cannot be scoped per principal |
| **Analytics** *(optional)* | Device-capability distribution: how often Nano was unavailable and the scrub fell back to cloud. This is the evidence for the product thesis | The team cannot see how much of the promise is actually being kept |

The privacy claim survives every one of those rows: what Firestore stores is a count, and Firestore rules reject any payload containing a field outside the declared schema.

### 7.5 The demo device

A triple meter, present on `/ledger` and in the demo video, computed from real data only:

```
"41 CROSSINGS · 218 VALUES WITHHELD · 34 RUN ON DEVICE"
Rendered as three mono figures separated by 1px rules, no cards, no icons.
Never shows a fabricated saving or a dollar figure that was not measured.
```

---

## 8. Responsive summary

| Breakpoint | Behaviour |
|---|---|
| `< 640px` | Landing stacks; the border line and its labels are hidden, replaced by a 1px rule between the two panes of the specimen (vertical seams become horizontal). Tabs collapse into a single `<select>` styled as a bordered field. Answer pane is a sheet. All tap targets ≥44px |
| `640–1023px` | Two-pane specimen becomes a single column with a horizontal seam. Mechanism steps stack with the artifact below the copy. Ledger becomes the ruled list |
| `1024–1279px` | Landing gains the vertical border. App shows the compose pane and the answer pane; the document rail stays hidden |
| `≥ 1280px` | Full three-pane app. Answer pane fixed at 420px, document rail 248px, compose takes the remainder with the editor capped at 720px |
| Extension panel (400px) | Top rail 48px, segmented Compose/Check control, no document rail, no answer pane (answer arrives in the same column below the composer), device chip collapses to a dot plus the word |

Long text and localisation: every ruled row uses `min-w-0` plus `truncate` on the flexible cell and `whitespace-nowrap` on numeric cells. British English throughout. Font sizes never go below 10px, and 10px is reserved for uppercase mono metadata with `tracking-[0.12em]` or wider.

---

## 9. Accessibility

- The landing statement is a real `<h1>`; each band begins an `<h2>`; the manifest is a `<table>` with `<th scope="col">` on `/ledger`, and a `<dl>` in the specimen.
- The entity mirror layer is `aria-hidden="true"`; the textarea carries `aria-describedby` pointing at the crossing summary, which is a polite live region announcing `"{n} identifiers withheld"` after a scan settles. It never announces per keystroke.
- Entity type is carried by underline style, the manifest's type column and the summary count, not by colour alone.
- The scrub sweep and the restore highlight are decorative; both have a final state that is readable without them, and both are removed under `prefers-reduced-motion`.
- Focus order in the workbench: document rail → title → editor → prompt → send → answer → ledger link. The sheet is trapped, Escape closes, focus returns to the trigger.
- Contrast: `--ink` on every ground ≥ 7:1. `--accent` on `--accent-wash` ≥ 4.5:1. `--mark` on `--mark-wash` ≥ 4.5:1. `--warn` on `--warn-wash` ≥ 4.5:1. Verified at build, not assumed.
- Keyboard: `Cmd/Ctrl+Enter` sends, `Cmd/Ctrl+K` opens the command palette (document switch and route jump), `Escape` closes any layer, `Tab` never enters the grain overlay or the sweep bar (both `pointer-events-none`, `aria-hidden`).
- No action is reachable only by hover. The mechanism artifacts replay on focus as well as hover, and their content is present without either.
- Zoom to 200% and 320px width must not produce horizontal page scroll; the manifest tables scroll inside their own container.

---

## 10. Asset briefs

No photography, no illustration, no 3D, no generated background. Assets below are coded or supplied by the user. The three logo source locations are on the user's Windows system; inspect and copy the actual files at build time.

| Slot | Type | Brief | Status |
|---|---|---|---|
| Paper grain | Coded | SVG `feTurbulence`, `baseFrequency 0.8`, `numOctaves 3`, `stitchTiles stitch`, 180×180 tile, multiplied at 0.6 opacity | Build |
| Site logo | Supplied | Source location: `S:\Hackathon\Elide\logo\logo`. Use this supplied image at every site brand-mark location: landing-page rail, app navigation, footer, device sheet and About panel. No text-rendered wordmark. At build, inspect the source, copy it into `public/` with its actual filename/format, and point `SITE_LOGO_SRC` to that file. Render at h-5 to h-6, `w-auto` | Source path provided; import at build |
| Favicon | Supplied | Source location: `S:\Hackathon\Elide\logo\favicon`. Use as the browser favicon. Inspect the actual file, copy it into `public/` with its actual filename/format, and link it from `index.html`. Create only technical size/format variants from this supplied art if required | Source path provided; import at build |
| Extension logo/icon | Supplied | Source location: `S:\Hackathon\Elide\logo\extension`. Use the supplied asset for Chrome extension branding. Inspect its actual file(s), copy to `extension/icons/`, then point `manifest.json` and the side-panel brand image at the copied asset(s). Create only technical size/format variants from the supplied art if required | Source path provided; import at build |
| Screenshot (extension listing) | Capture | A real capture of the side panel mid-crossing, 1280x800, no invented UI | Capture at build |
| Demo thumbnail | Composed | The supplied site logo plus the specimen manifest on paper ground, no stock imagery or text wordmark | Build |

The paths above are Windows source locations, not paths inside this workspace. On the user's system, inspect each with `Get-Item -LiteralPath`; if a path is a directory, list its contents with `Get-ChildItem -LiteralPath`. Record the actual filename, format and dimensions. If the build agent cannot access `S:`, stop and ask for the assets to be copied into the workspace. Never guess an extension, redraw, or generate a replacement.

---

## 11. Copy rules for this project

Carried forward from the reference project's guidance:

- British English. No em dashes in interface copy; use a comma, semicolon, colon or full stop.
- Labels, buttons, eyebrows, badges and stat figures take no trailing punctuation.
- A full stop ends a thought, a comma carries one on. Decide before writing.
- Status confirmations take a full stop: `Copied.` `Policy saved.`
- No filler: no "seamless", "powerful", "effortless", "unlock", "leverage".
- Fragments are allowed and often land harder: `Not a guarantee.` `Never auto-sent.`
- Vary sentence length. Three equal sentences in a row is the tell.

Fixed strings, final:

| Slot | String |
|---|---|
| Primary CTA | `Add to Chrome` |
| Secondary CTA | `Open the web app` |
| Send button | `Send` |
| Send disabled (offline) | `Send needs a connection. Scrubbing still works.` |
| Composer summary | `{n} withheld · {k} flagged` |
| Composer summary, none | `Nothing withheld` |
| Stamp, on device | `Answered on device` |
| Stamp, in cloud | `Answered in cloud` |
| Cloud failure | `The cloud call failed. Nothing was sent again. Your document is unchanged.` |
| Empty editor | `Nothing to check yet` / `Paste a document, or pick a sample.` |
| Empty ledger | `Nothing has crossed yet.` / `Send a document from the Playground.` |
| Device sheet note | `Chrome downloads the model once. It stays on this device.` |
| Policy destructive | `Clear ledger` |
| Toast on copy | `Copied.` |

---

## 12. Gate confirmations

| Gate | Decision | Status |
|---|---|---|
| G1 Aesthetic | Customs desk: paper, ink, hairline rules, stamped statuses, one signal colour | Locked, user approved |
| G2 Navigation | Fixed top rail plus three routes. Extension uses a segmented control. No drawer, no hamburger, no edge drag | Locked |
| G3 Signature | The Border: ruled two-pane crossing with a manifest, a sweep and a restore, coded in HTML/CSS only | Locked |
| G4 Rhythm | Five bands on `/`, three-pane workbench in `/app` | Locked |
| G5 Colour and type | Section 1.2 and 1.1. Accent reserved for crossed material only | Locked |
| G6 States | Section 4.3 table, ten states | Locked |
| G7 Assets | User supplied source locations: site logo `S:\Hackathon\Elide\logo\logo`, favicon `S:\Hackathon\Elide\logo\favicon`, extension logo/icon `S:\Hackathon\Elide\logo\extension`. Use the image, not a text wordmark; inspect/copy files at local build | Locked by user direction; asset files still need importing |
| G8 Platform scope | Chrome extension plus web app only. Claims `Best Web/Chrome App`. Does not claim Android or iOS | Locked, user approved |
| G9 Name | Elide | Locked, user approved |

---

## 13. Spec self-check

- [x] Every element carries concrete Tailwind classes, not adjectives
- [x] Every animation lists start, end, duration, easing and delay
- [x] Every section is placed against the global z-index map in 1.5
- [x] Every positional and sizing value has a responsive rule, summarised in section 8
- [x] All ten states from 4.3 are specified, including offline, cloud failure and no-Nano device
- [x] Provenance is carried by the SDK's `inferenceSource` and shown on every answer
- [x] No fabricated metrics, no invented customer logos, no fake dashboards; section 7.5 states the rule
- [x] All copy is final text, listed in section 11, with no placeholder strings
- [x] Asset sources and purposes are named in section 10; the local build agent must inspect and import the user-supplied files without guessing formats or generating substitutes
- [x] Reduced-motion and keyboard paths exist for every animated or hover-dependent element
- [x] Contrast pairs are named and marked for verification at build rather than assumed
- [x] Every Firebase product in the stack is listed with its real job and what breaks without it
- [x] The product makes no claim it cannot demonstrate, including the four limits in 3.4 and the wording in 7.3
