# Performance (Session 22 lab)

Measure first, fix, then measure again in exactly the same way.

## How we measured

- The **real build**, not the dev server: `npm run build` then `npm run preview` in `client/`, on `http://localhost:4173`.
- **Lighthouse 13.6.0** from the terminal, on the home page, with the default mobile settings (slow 4G and a slower CPU):
  ```
  npx lighthouse http://localhost:4173 --quiet --chrome-flags="--headless=new" --output=json --output-path=./lh-before-1.json
  ```
- **3 runs** before and 3 runs after, because one run can be noisy. The table shows the middle value. The JSON reports are not in the repo.
- Date: 13 November 2026.

## Lighthouse scores

| | Before | After |
| --- | --- | --- |
| Performance | 100 (the 3 runs: 99, 100, 100) | 100 (100, 100, 100) |
| Accessibility | 100 | 100 |
| Best practices | 100 | 100 |
| SEO | 91 | 91 |
| First Contentful Paint | 1.5 s | 1.5 s |
| **LCP** (good ≤ 2.5 s) | 1.5 s | 1.5 s |
| **TBT** | 0 ms | 0 ms |
| **CLS** (good ≤ 0.1) | 0.002 | 0.002 |
| "Reduce unused JavaScript" | 51 KiB | **48 KiB** |
| Total page weight | 160 KiB | **158 KiB** |

The scores were already good, so the numbers move only a little. Most of our JavaScript is React, React DOM and React Router, which every page needs.

## What we fixed

### 1. Code splitting (`client/src/App.jsx`)
`MyListsPage`, `ListPage` and `SearchPage` are loaded with `lazy()`, inside one `<Suspense>`. A visitor on the home page or the login page doesn't download the code of the logged-in pages until they open one. Home, Log in and Sign up stay normal imports, because they're small and they're the first pages people see. While a page downloads, the fallback shows the loading skeleton.

Bundle sizes from `npm run build`:

| Before (one bundle) | Size | gzip |
| --- | --- | --- |
| `index.js` | 277.64 kB | 87.04 kB |
| `index.css` | 9.84 kB | 2.54 kB |

| After (one file per logged-in page) | Size | gzip |
| --- | --- | --- |
| `index.js` (home, login, sign up, React, router) | 268.22 kB | 85.02 kB |
| `ListPage.js` | 4.67 kB | 1.90 kB |
| `SearchPage.js` | 3.97 kB | 1.74 kB |
| `MyListsPage.js` | 3.36 kB | 1.28 kB |
| `Cover.js` (shared by 2 pages) | 0.64 kB | 0.40 kB |
| `CategoryBadge.js` (shared by 3 pages) | 0.47 kB | 0.32 kB |
| `index.css` (+ the skeleton styles) | 10.61 kB | 2.79 kB |

The first download is about 9.4 kB smaller (2 kB gzip). That is the 51 → 48 KiB of unused JavaScript in Lighthouse.

### 2. Image sizes (`client/src/components/Cover.jsx`)
Every cover and poster `<img>` now has `width` and `height` (52 × 76, or 46 × 68 in the search results), the same as the CSS. The browser keeps the space empty before the picture arrives, so nothing jumps (CLS). `loading="lazy"` stays, because the covers are below the header. Lighthouse only audits the home page, which has no covers, so this fix helps the list pages and doesn't show in the table above.

### 3. Database indexes (`server/models/List.js`, `server/models/Item.js`)
- `listSchema.index({ userId: 1, createdAt: -1 })` matches `List.find({ userId }).sort({ createdAt: -1 })` (My Lists).
- `itemSchema.index({ listId: 1, userId: 1, createdAt: -1 })` matches `Item.find({ listId, userId }).sort({ createdAt: -1 })` (a list page).

We checked both on Atlas with `.explain('executionStats')`. Both queries use their index, `FETCH > IXSCAN`, with no extra sort step. Without the indexes, MongoDB would read every document in the collection (`COLLSCAN`), and that gets slower as more people use the app.

## Not fixed (on purpose)

- **SEO 91:** `robots.txt is not valid`. We have no `robots.txt`, so the server sends our `index.html` instead (that's how a React Router app works). It doesn't slow the app down.
- **Render-blocking request:** the Google Fonts stylesheet. The fonts are part of our design (Space Grotesk and Inter), and the page still paints in 1.5 s.
