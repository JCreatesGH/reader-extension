# Quiet Reader — browser extension

[![CI](https://github.com/JCreatesGH/reader-extension/actions/workflows/ci.yml/badge.svg)](https://github.com/JCreatesGH/reader-extension/actions)
[![Manifest V3](https://img.shields.io/badge/manifest-v3-orange)](https://developer.chrome.com/docs/extensions/mv3/intro/)
[![License: MIT](https://img.shields.io/badge/license-MIT-green)](LICENSE)

A small **Manifest V3** browser extension that shows the reading time for any article and toggles a one-click, distraction-free reader mode. Privacy-friendly: `activeTab` only, no tracking, no network calls.

![screenshot](assets/screenshot.png)

## Features

- ⏱️ **Reading time** computed from the article's main content (not the whole page chrome).
- 🧘 **Reader mode** — marks the scored content block and reveals just that, so it works on any site (not only `<article>`/`<main>`, but also `.post`/`#content`/etc.), widening the column and bumping the type.
- 🧠 **Readability scoring** — picks the real content block by length, sentence density, and link density (link density is clamped, so scores never go negative).
- 🔤 **Entity-aware text** — `extractText` decodes named *and* numeric HTML entities (`&#39;`, `&mdash;`, `&#x263A;`, …) and leaves unknown ones intact.
- 🔒 Minimal permissions, MV3, TypeScript.

## Install (developer mode)

```bash
npm install
npm run build        # compiles src -> dist
```

Then in Chrome/Edge: `chrome://extensions` → enable **Developer mode** → **Load unpacked** → select this folder. `npm run zip` produces a store-ready archive.

## How it works

- `src/reading.ts` — pure functions: `readingTime`, `countWords`, `extractText`, `decodeEntities`, `scoreBlock`, `bestBlockIndex`. Fully unit-tested, no browser APIs.
- `src/content.ts` — maps page candidates to blocks, uses `bestBlockIndex` to pick the article, marks it `.reader-content`, and responds to popup messages.
- `src/popup.ts` + `popup.html` — the toolbar UI; `reader.css` powers the reader view.

## Development

```bash
npm test          # 13 tests
npm run build     # tsc, clean
```

## License

MIT
