# Pianio

Free piano lessons that listen.

https://github.com/user-attachments/assets/c39e6335-71bb-4d38-9abf-772879aa217a

**80 courses · 1500+ exercises · Open source**

🎹 [Try it live](https://pianio.org)

---

A free, open-source piano learning platform. Practice method courses, technique drills, and real songs — all in your browser with a MIDI keyboard.

## Features

- **80 courses, 1500+ exercises** across Method, Technique, and Songs
- **Web MIDI** — plug in any MIDI keyboard and play
- **Sheet music rendering** via OpenSheetMusicDisplay (OSMD)
- **Practice & Performance modes** — untimed practice or timed performance with star ratings
- **Chords** — multi-note chord recognition and grading
- **Dynamics coaching** — velocity feedback (pp through ff) without blocking progress
- **Sustain pedal tracking** — CC64 pedal detection with coaching feedback
- **Ties & dotted rhythms** — full rhythmic notation support
- **Swing timing** — automatic off-beat adjustment for jazz/blues pieces
- **Section looping** — select measure ranges to drill specific passages
- **Progress tracking** — stars, streaks, and completion stored in localStorage
- **Dark mode** — full light/dark theme support

## Tech Stack

React 19 · TypeScript · Vite 7 · Tone.js · OSMD · Web MIDI API · Firebase Hosting

## Getting Started
```bash
pnpm install
pnpm dev
```

This regenerates content assets and starts the Vite dev server at `http://localhost:5173`.

## Build
```bash
pnpm build
```

For a self-hosted Docker installation with local piano samples and an HTTPS
reverse proxy, see [the CasaOS deployment guide](CASAOS.md).

## Project Structure
```
apps/web/              Vite SPA (React)
packages/core-engine/  Practice matching engine
packages/midi-web/     Browser MIDI adapter
packages/content-schema/ TypeScript content types
content/               Course source files (JSON)
scripts/               Content generation pipeline
```

## Audio Samples

Piano sounds use the [Salamander Grand Piano](https://sfzinstruments.github.io/pianos/salamander/) samples by Alexander Holm, licensed under [CC-BY-3.0](https://creativecommons.org/licenses/by/3.0/).
The 30 MP3 files used by both samplers are bundled in `apps/web/public/audio/salamander/`,
alongside the upstream README and `ATTRIBUTION.txt`. They are served by Pianio itself;
piano playback no longer needs the Tone.js CDN. Vite copies this directory into
`apps/web/dist/audio/salamander/` during the build, so a static Docker image includes it.

```sh
pnpm fetch:audio   # restore missing/modified assets from a pinned Tone.js revision
pnpm check:audio   # verify SHA-256 checksums locally; also runs in pnpm build
pnpm build
```

The downloader skips verified files and fails on checksum mismatches. Internet access
is required only when restoring assets, not when checking or playing bundled samples.
Keep the attribution and upstream README when redistributing the image. This makes
audio self-hosted; it does not add offline page caching or synchronize browser progress.

## License

Code: [MIT](LICENSE) · Content: [CC0-1.0](https://creativecommons.org/publicdomain/zero/1.0/)

## Languages and localized content

The interface supports **English and Italian**, including note names (C4 / Do4),
accessibility labels, practice, performance, diagnostics and progress tools.
Italian teaching content is complete: **6,069 required editorial fields across all
80 courses and 1,557 exercises**, with current textual reviews and no English
field fallbacks. One Italian score per course has been visually checked. Reviews
were performed by Codex, not a human editor. Delivery B still has partial final
validation because real MIDI hardware and some manual flows remain unverified.

Choose **English / Italiano** in the header or mobile menu, also while practicing.
An explicit choice is kept in `pianio:language`; otherwise the first supported
`navigator.languages` preference wins, then English. Regional tags are normalized.
When browser storage is denied, language, theme and practice preferences remain
available in memory for the current session. Progress requires working storage.
Language changes wait for preview, count-in and timed performance to finish;
UI and catalog switch together. Exercise IDs, routes, musical data and version 1
progress exports are independent of language.

Missing Italian text uses the corresponding English field. A missing/invalid
localized catalog uses English content with a localized notice; if both fail the
existing session remains available with Retry. Missing/invalid localized MusicXML
(including HTML returned with HTTP 200) uses the matching English score, with Retry.
Only the requested content catalog is fetched and cached; both small UI dictionaries
are bundled. Static English compatibility copies intentionally remain in the build.

```text
localization.config.json                 shared language registry (en source/fallback)
apps/web/src/i18n/locales/{en,it}/*.json    five UI namespaces
apps/web/src/i18n/resources.ts            typed resources and language labels
apps/web/src/i18n/formatNote.ts           UI note spelling
content/**/course.json                   canonical English and musical data
content-locales/it/<courseId>.json        editorial translations, indexed by exercise ID
content-locales/review-registry.json      explicit course/batch review fingerprints
apps/web/public/generated/{en,it}/        generated catalogs and MusicXML (ignored)
apps/web/public/generated/catalog.json    English compatibility catalog
apps/web/public/generated/scores/         English compatibility scores
apps/web/public/generated/i18n-coverage.json  field coverage and review report
```

Use Node 22.20.0 (or compatible) and pnpm 10.18.3 from `packageManager`.

```sh
pnpm check:i18n       # UI parity, content validity, coverage and review warnings
pnpm check:i18n:full  # additionally requires every content field and current review
pnpm test:ui
pnpm test:content
pnpm typecheck
pnpm test            # MIDI suite only
pnpm --filter @pianio/core-engine test
pnpm build           # full i18n coverage/review gate, generation, Vite build
pnpm --filter @pianio/web exec vite preview --host 127.0.0.1 --port 4173 --strictPort
# In another terminal, with the preview running:
node scripts/validate-static-preview.mjs
```

The full check passes for EN/IT and is a prerequisite of `build`. Missing required
translations or stale reviews stop the build before generation. Preview serves
the static build locally, without deploying to Firebase or reproducing its hosting
rewrite configuration. Adding another language must preserve this gate.

See [validation report and delivery B gaps](docs/I18N-VALIDATION-REPORT.md),
[adding a language (English)](docs/ADDING-A-LANGUAGE.en.md),
[Italian guide](docs/ADDING-A-LANGUAGE.md),
[content contracts](docs/I18N-CONTENT-PIPELINE.md),
[Italian glossary](docs/I18N-GLOSSARY-IT.md) and
[course review register](docs/I18N-CONTENT-REVIEW.md).
