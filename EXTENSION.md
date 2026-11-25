# Loading the extension and checking on-device Nano

## Load the Chrome side panel

1. In `S:\Hackathon\Elide`, run `npm run build`. The packaged extension is written to `S:\Hackathon\Elide\extension\build`.
2. Open `chrome://extensions` in desktop Chrome.
3. Turn on **Developer mode** at the top right.
4. Click **Load unpacked**.
5. Select `S:\Hackathon\Elide\extension\build`, the folder that contains `manifest.json`, `sidepanel.html`, `service-worker.js`, `icons` and `assets`.
6. Pin Elide from the extensions menu and click its icon. The side panel opens with `Compose` and `Check` tabs.
7. After any future `npm run build`, return to `chrome://extensions` and click the reload icon on the Elide card. Without that reload, Chrome keeps serving the old files.

If clicking the icon shows the landing page instead of the panel, the extension is still running an older build. Reload the unpacked extension from `chrome://extensions`. The current build opens `sidepanel.html` directly at the panel route.

To confirm the permission claim, open `extension\build\manifest.json`. The `permissions` array contains only `sidePanel` and `storage`. There is no `tabs`, `activeTab`, `<all_urls>` or content script.

## Enable Gemini Nano on the demo machine

The on-device half needs desktop Chrome 139 or newer and hardware Chrome supports for the built-in model.

1. Open `chrome://flags/#prompt-api-for-gemini-nano` and set it to **Enabled**.
2. Open `chrome://flags/#optimization-guide-on-device-model` and set it to **Enabled BypassPerfRequirement**.
3. Restart Chrome. If those exact flag names have changed, search `chrome://flags` for `Gemini Nano` and enable the Prompt API and on-device model entries.
4. Chrome downloads the model in the background. Check `chrome://components` for **Optimization Guide On Device Model**.
5. Open the app, click the device chip, then click **Prepare on-device model**. This button is the required user gesture.
6. Paste a document. The footer should read `SCRUBBED ON NANO · <ms>` and the answer stamp should read `ANSWERED ON DEVICE` when Nano handled the scrub.

If the chip reads `NANO UNAVAILABLE`, the machine cannot provide Gemini Nano. Elide still works: the deterministic rules run locally, the scrub falls back to the cloud where configured, and the UI states the real provenance rather than claiming on-device inference. That is a supported honest state, not a broken build.

For the extension, the debug token baked from `.env` is used for App Check. If you remove it later, add your `chrome-extension://<id>` origin to the reCAPTCHA Enterprise key's domain list.
