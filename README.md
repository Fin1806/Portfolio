# Finley’s portfolio

A portable, dependency-free portfolio built with HTML, CSS, and JavaScript. Uses a light desktop design and an Apple-style local system font stack; no external fonts are requested.

## Preview locally

From this directory:

```bash
python3 -m http.server 8000 --directory dist
```

Open http://localhost:8000. Stop with Ctrl+C. All three project pages work via normal directory URLs. Deploy the contents of `dist/` to any static web host when ready.

## Content

- Homepage: `dist/index.html`
- Shared styling and clock: `dist/assets/`
- Case studies: `dist/projects/`
- Downloadable resume: `dist/assets/finley-darma-resume.pdf`

Descriptions are grounded in the supplied resume and public GitHub repositories. Project diagrams are illustrations, not product screenshots. Project contributions use neutral wording because individual and team roles have not been specified. No project metrics, availability claims, or live model demos are invented.

The social preview is an original SVG; create a PNG version and set an absolute image URL when configuring production sharing metadata. Dates and ongoing roles reflect the supplied October 2026 resume.

## Interactive desktop

The homepage adds movable widgets and project folders, a proximity-responsive navigation dock, and folder-shaped project panels. On desktop, drag an object or focus its move handle and use arrow keys (Shift for larger steps). Home restores the focused object. Mobile uses a normal grid without dragging. Reduced motion disables magnification and entrance movement.

Homepage styles and interactions: `dist/assets/homepage.css`, `desktop.mjs`, and `desktop-math.mjs`. Run `node tests/desktop-math.test.mjs` to check movement boundaries, resize recovery, and dock proximity. No packages, API keys, or agent backend are needed.

The pre-edit homepage and README are preserved in `backups/before-interactive-desktop/`.

## Shared light appearance

`dist/assets/light.css` styles the homepage and all three case studies. The introduction focuses on machine learning, data, and automation. The previous dark version is backed up in `backups/before-light-mode/`.

## Project color identities

Language/summarization uses violet, housing uses amber, and image classification uses teal. Desktop folders, project tabs, and preview windows share these colors; navigation icons use brighter app-like colors. The light background and existing drag interactions are preserved.

## macOS-inspired refresh

Cool silver surfaces, Finder-blue project folders, system-color dock icons, a simple monochrome F mark, and a movable personal sticky note. The homepage top bar is removed. CSS stages the greeting before the widgets; inner wrappers keep entrance transforms independent of dragging. Reduced motion shows all content immediately. Backup: `backups/before-macos-refresh/`.

The greeting has no logo above it. Widget interaction finishes its entrance animation permanently; it never replays on drop or blur. Project stack margins are contained so all folders share the same sticky exit boundary.
