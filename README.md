# Seminar guide: Reconstructing Implicit Scientific Knowledge (Wang et al., 2026)

A static website of 13 short chapters. No build step and no external requests: fonts, KaTeX, scripts, styles and figures are all in this folder.

## Deploy on GitHub Pages

1. Create a repository and upload the **contents** of this folder to its root, so that `index.html` sits at the top level.
2. Settings → Pages → Build and deployment → Source: *Deploy from a branch* → Branch: `main`, folder `/ (root)` → Save.
3. After a minute the site is live at `https://<user>.github.io/<repo>/`.

## Layout

- `index.html` and twelve other chapter pages (`contributions.html`, `background.html`, `ai.html`, `agents.html`, `workflows.html`, `audit.html`, `case.html`, `equations.html`, `assumptions.html`, `critique.html`, `kit.html`, `figures.html`)
- `assets/css/style.css`: all styling, light and dark
- `assets/js/data.js`: the guide's content; `assets/js/app.js`: interactive parts
- `assets/img/`: the eleven figures (SVG) and the favicon
- `assets/vendor/katex/`: KaTeX 0.16.11 (MIT), which typesets every equation in the browser
- `assets/fonts/`: subsets of Lora (renamed), Inter and Latin Modern Mono, with their licences in `LICENSES.txt`

An independent study guide; not affiliated with the authors of the paper. Figures are redrawn originals.
