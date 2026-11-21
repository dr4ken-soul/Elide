# Elide brand assets

The user has supplied the following source locations on their Windows system. These are the authoritative sources; inspect the actual file(s) and formats when building locally.

| Exact source location | Purpose | Use |
|---|---|---|
| `S:\Hackathon\Elide\logo\logo` | Site logo | Use on the landing-page header/rail, app navigation, footer, device sheet, About panel and every other site location that displays the brand mark. No separate text-rendered wordmark. |
| `S:\Hackathon\Elide\logo\favicon` | Browser favicon | Link from the web app's `index.html`. |
| `S:\Hackathon\Elide\logo\extension` | Chrome extension logo/icon | Use for the extension icon and extension side-panel brand image. |

## Import instructions

1. On the user's Windows machine, inspect each exact path with PowerShell `Get-Item -LiteralPath`. If it resolves to a directory, use `Get-ChildItem -LiteralPath` to identify the intended image file(s).
2. Record the actual filenames, formats and dimensions. Do not assume these paths are directories or that an image has a particular extension.
3. Copy the supplied artwork into the project and update the website, `index.html` and extension manifest references to match the actual copied files.
4. Convert only if a web browser or Chrome manifest requires a supported size/format. A conversion must use the supplied artwork without redrawing, redesigning or substituting it.
5. If the build agent cannot access the `S:` drive, stop and ask the user to copy the assets into the project. Do not generate placeholders.

This folder is documentation/staging only; the original sources remain at the paths above until they are copied into the repository.
