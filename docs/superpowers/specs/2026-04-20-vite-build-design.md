# Design: Vite Build Pipeline

**Date:** 2026-04-20
**Status:** Approved

## Context

The project is a vanilla JS todo list app (`todo_app/`) that uses native ES modules. It currently has no production build step — the only way to run it is via browser-sync (`npm start`). The goal is to add `npm run build` that produces an optimized `dist/` folder ready to be served by any static HTTP server.

As part of this change, browser-sync is replaced by Vite's built-in dev server, simplifying the toolchain.

## Decisions

- **Bundler:** Vite — zero-config for simple projects, native ES module support, covers dev + build + preview in one tool.
- **Vite root:** `todo_app/` — this is where `index.html` lives. Vite resolves asset paths relative to root, so `./styles.css` and `./script.js` will work correctly.
- **Build output:** `dist/` at project root (configured as `outDir: '../dist'` relative to the Vite root).
- **Font Awesome:** stays on CDN (loaded via `<link>` tag, Vite never touches it).
- **Deploy target:** any static HTTP server (local folder, drag-and-drop, etc.).

## Architecture

### Entry point

Vite root is set to `todo_app/`. Vite will automatically discover `todo_app/index.html` as the entry point (it is the only HTML file in the root).

The asset references in `index.html` currently read `./todo_app/styles.css` and `./todo_app/script.js` — paths that were written for browser-sync, which served from the project root. With Vite root set to `todo_app/`, these must be updated to `./styles.css` and `./script.js`.

### Build output

```
dist/
├── index.html             ← copy of todo_app/index.html with updated asset paths
└── assets/
    ├── script-[hash].js   ← bundled + minified JS (script.js + todo.js)
    └── styles-[hash].css  ← minified CSS
```

Hash fingerprints in filenames enable long-lived HTTP caching.

### Config file

A minimal `vite.config.js` at the project root:

```js
import { defineConfig } from 'vite'

export default defineConfig({
  root: 'todo_app',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
  },
})
```

## File changes

| File | Change |
|------|--------|
| `vite.config.js` | New — Vite config at project root |
| `todo_app/index.html` | Update `href="./todo_app/styles.css"` → `href="./styles.css"` and `src="./todo_app/script.js"` → `src="./script.js"` |
| `package.json` | Add `vite` devDependency; remove `browser-sync`; remove stale `"main": "index.js"` field; update scripts |
| `config/bs-config.cjs` | Delete — no longer needed |
| `config/` directory | Delete — empty after removing bs-config |
| `.gitignore` | Add `dist/` |

## Scripts

```json
"start":   "vite",
"build":   "vite build",
"preview": "vite preview"
```

- `npm start` — starts Vite dev server with live HMR on `todo_app/` (replaces browser-sync)
- `npm run build` — outputs optimized build to `dist/`
- `npm run preview` — serves `dist/` on port 4173 to verify the build locally; always serves from `dist/` regardless of the `root` config

## Notes

- The `assets/` directory at the project root contains only `homepage.png` used by the README. It is outside Vite's root (`todo_app/`) and will not be copied to `dist/`. This is intentional — the image is documentation-only.
- Test scripts (`npm test`, `npm run feature-tests`) are unchanged.
- Cucumber continues to use its own runner (`cucumber-js`), unaffected by the Vite setup.
