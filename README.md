# Elide

Send the question, not the client.

Elide is a checkpoint in front of cloud AI. It removes client names, patient identifiers, account numbers and postal addresses on your own device before text is sent to a cloud model, then restores them in the answer. The map of what was withheld never leaves the tab.

Built for **#BuildHybridAI 2026** with Firebase AI Logic hybrid inference.

## The honest claim

> Elide removes identifiers from text before it is sent to a cloud model, and restores them afterwards. It cannot guarantee that no re-identification is possible, because prose can imply identity without naming it. It does not control what the remote provider retains. It is a reduction in exposure, applied before the request, not a guarantee of anonymity.

## Install and run

```bash
npm install
cp .env .env.local      # or fill .env directly, see below
npm run dev
```

Open the printed localhost URL. Routes: `/` landing, `/app` workbench, `/ledger` local ledger, `/policy` policy editor.

The Chrome side panel is built alongside the web app:

```bash
npm run build
```

Load `extension/build` at `chrome://extensions` with **Developer mode** on, then choose **Load unpacked**. The panel mounts the same bundle at `#/panel`.

With no Firebase credentials the app still runs: deterministic passes mark emails, phone numbers, IBANs, Luhn-valid cards, policy patterns and custom terms. The UI reports `RULES ONLY` rather than pretending a model ran. The cloud answer needs Firebase credentials and a network connection.

## Filling `.env`

The real `.env` file is in the repository root. It is ignored by git. Fill the empty values from your own Firebase project:

| Variable | Where to copy it from |
|---|---|
| `VITE_FIREBASE_API_KEY` | Firebase console, Project settings, Your apps, Web app, `apiKey` |
| `VITE_FIREBASE_AUTH_DOMAIN` | Same panel, `authDomain` |
| `VITE_FIREBASE_PROJECT_ID` | Same panel, `projectId` |
| `VITE_FIREBASE_APP_ID` | Same panel, `appId` |
| `VITE_APP_CHECK_DEBUG_TOKEN` | Firebase console, App Check, Apps, Manage debug tokens |
| `VITE_RECAPTCHA_ENTERPRISE_SITE_KEY` | Google Cloud console, reCAPTCHA Enterprise, Keys, the web key ID |
| `VITE_CLOUD_MODEL` | Model name, default `gemini-3.5-flash-lite`; Remote Config `cloud_model` overrides it |

Direct console links, substituting your project ID:

- Firebase console: https://console.firebase.google.com/
- Project settings and web app config: https://console.firebase.google.com/project/YOUR_PROJECT_ID/settings/general
- AI Logic setup: https://console.firebase.google.com/project/YOUR_PROJECT_ID/ailogic
- App Check: https://console.firebase.google.com/project/YOUR_PROJECT_ID/appcheck
- Anonymous Authentication: https://console.firebase.google.com/project/YOUR_PROJECT_ID/authentication/providers
- Firestore database: https://console.firebase.google.com/project/YOUR_PROJECT_ID/firestore/data
- Firestore rules: https://console.firebase.google.com/project/YOUR_PROJECT_ID/firestore/rules
- Remote Config: https://console.firebase.google.com/project/YOUR_PROJECT_ID/config
- reCAPTCHA Enterprise keys: https://console.cloud.google.com/security/recaptcha

Enable Firebase AI Logic, Anonymous Authentication, Firestore and Remote Config in those pages. Add the debug token under App Check for local development and for the unpacked extension. The extension origin must be allowed on the reCAPTCHA key when App Check is enforced.

## Firebase products and why each one is present

| Product | Job | If removed |
|---|---|---|
| Firebase AI Logic | Both inference tiers through one SDK, with provenance | Nothing works |
| App Check | Required by AI Logic, enforced since 2 November 2026 | Nothing works |
| Remote Config | Team policy manifest and cloud model name | Every user hand-configures patterns |
| Firestore | Opt-in, append-only ledger of counts, provenance and policy version | No audit trail a reviewer would accept |
| Authentication | Anonymous principal for App Check and Firestore rules | Rules cannot be scoped per user |
| Hosting | Public web app | Nothing to link to |

The ledger holds counts. It never holds text, originals, tokens or document titles, and the Firestore rules enforce an allowlist of fields so it cannot start.

## Permission restraint

The extension manifest requests `sidePanel` and `storage`, and nothing else. No `tabs`, no `activeTab`, no `<all_urls>`, no content scripts. Elide does not read the page you are on. It is a checkpoint you open, not a watcher you install.

## Firestore rules evidence

The rules are append-only and key-allowlisted. Two rejections were verified with the Firestore emulator:

1. A create containing an extra `text` field is rejected because `request.resource.data.keys().hasOnly(...)` fails.
2. A read of another uid's crossing is rejected because `resource.data.uid == request.auth.uid` fails.

Run `npx firebase emulators:start --only firestore` from this directory to reproduce both against `firestore.rules`. Deploy with `npx firebase deploy --only firestore:rules` after selecting a project.

## Design and documentation

| File | Contents |
|---|---|
| `FRONTEND_SPEC.md` | Every class, animation value, z-index, string and state |
| `APP_BLUEPRINT.md` | Stack, Firebase setup, inference contracts, scrub pipeline, data shapes |
| `BUILD_GUIDE.md` | Ordered build steps and the pre-record audit |
| `CLAUDE.md` | Persistent rules for this repository |
| `MARKETING.md` | Submission description and demo video script |

The supplied brand assets are copied from `logo/logo in site`, `logo/favicon` and `logo/extension` into `public/brand` and `extension/icons`.

## Licence

Apache-2.0. See `LICENSE`.
