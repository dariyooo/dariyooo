# Dario — portfolio site

A single-page static site. **No build step.** Files are split by concern:

```
site/
├─ index.html          ← page structure only (markup + script tags)
├─ css/
│  └─ styles.css       ← global styles, animations, responsive rules
├─ js/
│  ├─ render.js        ← builds each section's HTML from the data
│  ├─ field.js         ← floating-kanji background canvas
│  ├─ head.js          ← the 3D draggable head (three.js)
│  └─ app.js           ← boot: loads data, renders, starts the head
├─ data/
│  └─ content.json     ← ALL your text/content — edit this
└─ assets/
   ├─ avatar-head.obj  ← the 3D character model
   └─ avatar-head.png  ← its texture
```

## Editing content
Open **`data/content.json`** and change the text. The UI re-renders from it on reload — no code changes needed. Examples:

- **Add a project** → add an object to `work.items`.
- **Add a toolkit category** → add to `toolkit.categories`.
- **Add a job** → add to `experience.roles`.
- **Change colors** → edit `theme.accent` / `theme.accent2`.
- **Swap the character** → replace the files in `assets/` and point `character.model` / `character.texture` at them.

The **Open source** section is pulled live from GitHub for `opensource.githubUser` — nothing to edit there.

## Running / deploying
It must be served over HTTP (it fetches `data/content.json` and the model), not opened as a `file://`.

Local preview:
```
cd site
python3 -m http.server 8000
# open http://localhost:8000
```

Deploy: upload the `site/` folder to any static host — GitHub Pages, Netlify, Vercel, Cloudflare Pages, etc.
