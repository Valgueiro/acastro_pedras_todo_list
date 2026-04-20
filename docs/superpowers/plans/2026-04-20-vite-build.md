# Vite Build Pipeline Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace browser-sync with Vite and add `npm run build` that outputs an optimized production-ready `dist/` folder.

**Architecture:** Vite is configured with `root: 'todo_app'` so it discovers `index.html` directly. The build outputs to `dist/` at the project root. Two asset path references in `index.html` must be updated from `./todo_app/...` to `./...` to match the new root.

**Tech Stack:** Vite, vanilla JS/CSS/HTML, native ES modules.

---

## File Map

| File | Action |
|------|--------|
| `vite.config.js` | Create |
| `todo_app/index.html` | Modify — fix 2 asset paths |
| `package.json` | Modify — add `vite`, remove `browser-sync`, remove `"main"`, update scripts |
| `config/bs-config.cjs` | Delete |
| `config/` | Delete (empty after above) |
| `.gitignore` | Modify — add `dist/` |

---

### Task 1: Fix asset paths in `todo_app/index.html`

The current paths (`./todo_app/styles.css`, `./todo_app/script.js`) were written for browser-sync serving from the project root. With Vite root set to `todo_app/`, they must be relative to that directory.

**Files:**
- Modify: `todo_app/index.html`

- [ ] **Step 1: Update the CSS link**

In `todo_app/index.html` line 9, change:
```html
<link rel="stylesheet" href="./todo_app/styles.css">
```
to:
```html
<link rel="stylesheet" href="./styles.css">
```

- [ ] **Step 2: Update the script tag**

In `todo_app/index.html` line 28, change:
```html
<script type="module" src="./todo_app/script.js"></script>
```
to:
```html
<script type="module" src="./script.js"></script>
```

- [ ] **Step 3: Commit**

```bash
git add todo_app/index.html
git commit -m "fix: update asset paths in index.html for Vite root"
```

---

### Task 2: Create `vite.config.js`

**Files:**
- Create: `vite.config.js`

- [ ] **Step 1: Create the config file at the project root**

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

- `root: 'todo_app'` — Vite serves and builds from the `todo_app/` directory
- `outDir: '../dist'` — output lands in `dist/` at the project root (relative to `root`)
- `emptyOutDir: true` — clears `dist/` before each build (required when `outDir` is outside `root`, otherwise Vite refuses to clear it)

- [ ] **Step 2: Commit**

```bash
git add vite.config.js
git commit -m "feat: add vite.config.js"
```

---

### Task 3: Update `package.json`

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Remove `"main": "index.js"` field**

Delete the line `"main": "index.js"` — the project has no Node.js entry point.

- [ ] **Step 2: Replace scripts**

Change the `scripts` section from:
```json
"scripts": {
  "test": "qunit ./tests/*",
  "start": "browser-sync start --config config/bs-config.cjs ./features -r ./features/step_definitions",
  "feature-tests": "cucumber-js"
}
```
to:
```json
"scripts": {
  "test": "qunit ./tests/*",
  "start": "vite",
  "build": "vite build",
  "preview": "vite preview",
  "feature-tests": "cucumber-js"
}
```

- [ ] **Step 3: Replace `browser-sync` with `vite` in devDependencies**

Change:
```json
"browser-sync": "^3.0.4",
```
to:
```json
"vite": "^6.0.0",
```

The final `devDependencies` should be:
```json
"devDependencies": {
  "@cucumber/cucumber": "^12.8.1",
  "qunit": "^2.25.0",
  "vite": "^6.0.0"
}
```

- [ ] **Step 4: Install dependencies**

```bash
npm install
```

Expected: `vite` installed, `browser-sync` removed, no errors.

- [ ] **Step 5: Commit**

```bash
git add package.json
git commit -m "feat: replace browser-sync with vite, add build and preview scripts"
```

> Note: `package-lock.json` is listed in `.gitignore` and will not be staged.

---

### Task 4: Delete `config/` directory

**Files:**
- Delete: `config/bs-config.cjs`
- Delete: `config/` directory

- [ ] **Step 1: Delete the directory**

```bash
rm -rf config/
```

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "chore: remove browser-sync config"
```

---

### Task 5: Add `dist/` to `.gitignore`

`dist/` is a build artifact — it should not be committed.

**Files:**
- Modify: `.gitignore`

- [ ] **Step 1: Add `dist/` to `.gitignore`**

Append to `.gitignore`:
```
dist/
```

- [ ] **Step 2: Commit**

```bash
git add .gitignore
git commit -m "chore: ignore dist/ build output"
```

---

### Task 6: Verify the build

- [ ] **Step 1: Run the build**

```bash
npm run build
```

Expected output (approximate):
```
vite v6.x.x building for production...
✓ N modules transformed.
dist/index.html          X.XX kB
dist/assets/script-[hash].js   X.XX kB
dist/assets/styles-[hash].css  X.XX kB
✓ built in Xs
```

- [ ] **Step 2: Inspect `dist/` output**

```bash
ls dist/ dist/assets/
```

Expected: `index.html` at root, `script-[hash].js` and `styles-[hash].css` inside `assets/`.

- [ ] **Step 3: Preview the build**

```bash
npm run preview
```

Open `http://localhost:4173` in a browser and verify:
- The todo app loads and Font Awesome icons are visible.
- Add a todo — it should appear in the list.
- Click the trash icon on a todo — it should be removed from the list.
- Add two todos, click "Clear All" — both should disappear.
- The "You have N pending tasks" counter should update correctly throughout.

- [ ] **Step 4: Run tests to confirm nothing regressed**

```bash
npm test && npm run feature-tests
```

Expected: 6 QUnit tests pass (1 skipped), 1 Cucumber scenario passes.

- [ ] **Step 5: Commit verification note (no code change needed)**

If everything passes, no commit is required for this task.
