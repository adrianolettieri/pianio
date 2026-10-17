# Adding a supported language to Pianio

This guide uses Spanish (`es`) as an example. English (`en`) is the canonical
source and fallback language; the currently supported languages are English and
Italian (`it`). Replace `es` and the example translations with your target language.
All paths and commands below are relative to the repository root, which contains
`package.json` and `localization.config.json`.

## 1. Prepare the working environment

Use Node.js 22.20.0 (or compatible) and pnpm 10.18.3, as declared in
`package.json`. Install dependencies with `pnpm install`. Work on a dedicated
branch and keep the new language unpublished until translation and review are
complete: adding it to the registry makes it available in the language selector
and includes it in the build's completeness gate.

Choose a lowercase base language code such as `es`, `fr`, or `de`. The current
browser-language normalizer reduces regional tags to their base language, so
`es-MX` resolves to `es`. Supporting separate regional variants requires changes
to `apps/web/src/i18n/language.ts` and its tests first. For a right-to-left
language, also implement document direction and audit layouts: the current
metadata synchronization sets `lang`, but does not set `dir`.

## 2. Know exactly which files need translation

There are two separate translation layers: interface dictionaries and course
editorial content. Both must be complete before the language can ship.

| English source | New translation file | What to translate |
| --- | --- | --- |
| `apps/web/src/i18n/locales/en/common.json` | `apps/web/src/i18n/locales/es/common.json` | Shared UI, navigation, language controls, document title/description, accessibility labels and shared messages |
| `apps/web/src/i18n/locales/en/catalog.json` | `apps/web/src/i18n/locales/es/catalog.json` | Catalog/course UI, categories, source-policy labels and content-loading notices |
| `apps/web/src/i18n/locales/en/practice.json` | `apps/web/src/i18n/locales/es/practice.json` | Practice/performance UI, results, coaching, score controls, shortcuts and errors |
| `apps/web/src/i18n/locales/en/diagnostics.json` | `apps/web/src/i18n/locales/es/diagnostics.json` | MIDI diagnostics, statuses, instructions and errors |
| `apps/web/src/i18n/locales/en/progress.json` | `apps/web/src/i18n/locales/es/progress.json` | Progress UI, streaks, import/export and reset messages |
| Every `content/**/course.json` | One `content-locales/es/<courseId>.json` per source course | Course title/summary, exercise title/summary/goal and nonempty exercise `license.notes` |

The current content inventory is **80 courses, including 12 hidden aggregate
courses, and 1,557 exercises**. Translate hidden courses too:

| Source files | Destination filenames in `content-locales/es/` | Count |
| --- | --- | --- |
| `content/method/level-{1..6}/course.json` | `method-level-1.json` through `method-level-6.json` | 6 |
| `content/method/level-{1..6}{a..e}/course.json` | `method-level-1a.json` through `method-level-6e.json` (every level/suffix combination) | 30 |
| `content/technique/level-{1..6}/course.json` | `technique-level-1.json` through `technique-level-6.json` | 6 |
| `content/technique/level-{1..6}{a..e}/course.json` | `technique-level-1a.json` through `technique-level-6e.json` (every level/suffix combination) | 30 |
| `content/songs/<name>/course.json`, where `<name>` is `advanced`, `beginner`, `folk`, `holiday`, `hymns`, `intermediate`, `jazz-blues`, or `pro` | `songs-<name>.json`, one for each of the eight names | 8 |

The ranges above describe the inventory, not commands to run. Always derive the
destination filename from the source's `courseId`, and exercise keys from
`exercise.id`. The scaffold command in step 5 discovers the actual source files,
so it also includes courses added later.

Other required edits are registration in `localization.config.json`, imports and
labels in `apps/web/src/i18n/resources.ts`, note-name data in
`apps/web/src/i18n/formatNote.ts`, review records in
`content-locales/review-registry.json`, and validation coverage described below.
English and Italian files can be consulted as references; add the new language
alongside them.

## 3. Register the language

Update `localization.config.json`, keeping English as source and fallback:

```json
{
  "supportedLanguages": ["en", "it", "es"],
  "sourceLanguage": "en",
  "fallbackLanguage": "en"
}
```

The content pipeline rejects locale directories that are not in this registry.
Register the language before validating its new `content-locales/es/` directory.

## 4. Translate and wire up all five UI namespaces

Create the five files listed in step 2, using the English dictionaries as the
structural reference. Translate every string, including tooltips, screen-reader
labels, document metadata, error/fallback messages and shortcut instructions.

- Preserve JSON keys, nesting, interpolation parameters such as `{{count}}`,
  `{{note}}` and `{{importedCount}}`, URLs and device names. Parameters must match
  the source, including repeated occurrences. Do not leave empty strings.
- For plural groups, provide every category required by the target locale's
  `Intl.PluralRules`, preserving the source parameters in each form. Do not assume
  English `_one` and `_other` are sufficient. Inspect the categories with:

  ```sh
  node -e "console.log(new Intl.PluralRules('es').resolvedOptions().pluralCategories)"
  ```

  Spanish may require `_one`, `_many` and `_other` in the supported runtime.
  Translate the whole sentence for each required form.
- Use valid UTF-8 JSON with unique keys. Keep the existing namespaces; adding a
  language does not require a new namespace or a copy of any screen component.

In `apps/web/src/i18n/resources.ts`, add these imports:

```ts
import esCommon from "./locales/es/common.json";
import esCatalog from "./locales/es/catalog.json";
import esPractice from "./locales/es/practice.json";
import esDiagnostics from "./locales/es/diagnostics.json";
import esProgress from "./locales/es/progress.json";
```

Add an entry inside the existing `resources` object:

```ts
es: {
  common: esCommon,
  catalog: esCatalog,
  practice: esPractice,
  diagnostics: esDiagnostics,
  progress: esProgress,
},
```

Add `es: "Español"` to the existing `languageLabels` object. `Language` is derived
from `resources`, and `LanguageSelector` reads the shared registry and labels.
No additional selector or language-specific screen branches are needed. The CLI
checker reads JSON files directly, so passing it alone does not prove that the
new imports and runtime resource entry are present.

In `apps/web/src/i18n/formatNote.ts`, add the language to both `NOTE_NAMES` and
`INVALID_NOTE_LABEL`. For Spanish, the entries are:

```ts
// Inside NOTE_NAMES, ordered by MIDI pitch class (MIDI number % 12):
es: ["Do", "Do#", "Re", "Re#", "Mi", "Fa", "Fa#", "Sol", "Sol#", "La", "La#", "Si"],
// Inside INVALID_NOTE_LABEL:
es: "Nota",
```

Choose the appropriate convention for your target language. Preserve octave
numbering: MIDI 60 should produce `Do4` for this example. These are display names;
MIDI numbers and source notation tokens such as `C4:q` stay unchanged.

## 5. Translate every course and exercise

Create `content-locales/es/` with one JSON file per `courseId`. The following
command creates empty translation templates and prints the complete source-to-
destination mapping. Run it once after registration; `flag: 'wx'` refuses to
overwrite existing work. The empty values are placeholders to fill, not completed
translations.

```sh
node --input-type=module <<'JS'
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { findCourseFiles } from './scripts/lib/content-pipeline.mjs';

const locale = 'es';
const target = `content-locales/${locale}`;
await mkdir(target, { recursive: true });
for (const file of await findCourseFiles('content')) {
  const course = JSON.parse(await readFile(file, 'utf8'));
  const translation = {
    courseId: course.courseId,
    title: '',
    summary: '',
    exercises: Object.fromEntries(course.exercises.map(exercise => [exercise.id, {
      title: '',
      summary: '',
      goal: '',
      ...(exercise.license.notes.trim() ? { license: { notes: '' } } : {}),
    }])),
  };
  const destination = `${target}/${course.courseId}.json`;
  await writeFile(destination, JSON.stringify(translation, null, 2) + '\n', { flag: 'wx' });
  console.log(`${file} -> ${destination}`);
}
JS
```

Fill every template from its canonical English source. The overlay shape is:

```json
{
  "courseId": "method-level-1a",
  "title": "Método nivel 1A — Fundamentos",
  "summary": "Patrones con una mano, ritmos básicos y lectura en posición de Do para las primeras semanas de estudio.",
  "exercises": {
    "m1a-001": {
      "title": "Pulso sobre Do",
      "summary": "Redondas sobre el Do central: el ejercicio de lectura más sencillo.",
      "goal": "Produce un sonido estable sobre el Do central y mantenlo durante todo su valor.",
      "license": { "notes": "Escrito para el programa inicial abierto." }
    }
  }
}
```

This example contains only the first exercise. The complete file must also
include every other exercise in that course, using IDs rather than slugs or array
positions. The only allowed translated fields are course `title`/`summary` and
exercise `title`/`summary`/`goal`/`license.notes`. Translate `license.notes` when
the English value is nonempty; omit it or leave it empty when the source is empty.

Keep `license.type`, `license.attribution`, IDs, slugs, ordering, source policy,
categories, hands, clefs, time signatures, BPM, pitches, durations, ties, swing,
dynamics and pedal data in the canonical source. These fields are not allowed in
translation overlays. Never translate musical tokens or modify the English
course files to add another language.

During development, missing/blank editorial fields fall back to the corresponding
English field. `pnpm check:i18n` allows partial editorial coverage, but still
requires complete UI dictionaries and valid overlay structure. Unknown fields,
orphan IDs, duplicate keys, mismatched filenames, non-string text values and
invalid XML characters fail validation. `pnpm check:i18n:full` rejects missing
required fields and missing, pending or stale reviews.

## 6. Review terminology, teaching content and rendered scores

Create a language glossary, for example `docs/I18N-GLOSSARY-ES.md`, using
[the Italian glossary](I18N-GLOSSARY-IT.md) as a structural reference. Agree on
note naming, rhythms, practice instructions and musical terminology.
The repository ignores new files under `docs/` by default; add explicit
exceptions in `.gitignore` for the new glossary and any review evidence you
intend to commit.

Review every translated field against both the English text and the actual
musical data. Record source inconsistencies explicitly. Generate the content
with `pnpm generate:content` and inspect at least one rendered score per course,
plus cases with long goals, chords, two staves, ties, swing, dynamics and pedal.
Keep a record of textual and visual reviews, reviewer identity/date, issues and
remaining work. Coverage checks cannot judge musical meaning or layout.

After actually reviewing a complete course, record it in
`content-locales/review-registry.json` using `createCourseReview`. This example
records one course; replace the reviewer placeholder and repeat for every reviewed
course, assigning each to an appropriate review batch:

```sh
node --input-type=module <<'JS'
import { readFile, writeFile } from 'node:fs/promises';
import { loadContent } from './scripts/lib/content-pipeline.mjs';
import { createCourseReview } from './scripts/lib/content-review.mjs';
import { validateCourseTranslation } from './scripts/lib/content-validation.mjs';

const locale = 'es', courseId = 'method-level-1a', batchId = 'es-method-1a';
const reviewedBy = 'REPLACE WITH ACTUAL REVIEWER';
if (reviewedBy === 'REPLACE WITH ACTUAL REVIEWER') throw new Error('Set the actual reviewer first');
const content = await loadContent({ rootDir: process.cwd() });
const course = content.courses.find(course => course.courseId === courseId);
if (!course) throw new Error(`Unknown course: ${courseId}`);
const translation = content.translations[locale]?.get(courseId);
validateCourseTranslation(translation, course, { full: true });
const file = 'content-locales/review-registry.json';
const registry = JSON.parse(await readFile(file, 'utf8'));
registry.batches[batchId] = {
  locale, status: 'reviewed', reviewedBy,
  reviewedOn: new Date().toISOString().slice(0, 10),
};
registry.locales[locale] ??= {};
registry.locales[locale][courseId] = createCourseReview(course, translation, batchId);
await writeFile(file, JSON.stringify(registry, null, 2) + '\n');
JS
```

Use the actual review date if recording an earlier review. Fingerprints track the
exact source and translated text. Later edits can make reviews `stale`; review
the changed text before refreshing the record. Do not automatically approve
courses or refresh fingerprints during generation/build to silence failures.

## 7. Extend validation to include the new language

Add cases for the target language in the existing tests:

- `apps/web/src/i18n/language.test.ts`: base/regional normalization, browser
  preference order, persistence and denied storage. Revisit any fixture that
  previously treated your new code as unsupported.
- `apps/web/src/i18n/formatNote.test.ts`: note names, octave boundaries, sharps
  and invalid values.
- `apps/web/src/i18n/i18n.test.tsx` and `LanguageProvider.test.tsx`: actual
  resource loading, plural forms/interpolation, metadata and coordinated
  UI/catalog switching, including deferred switches during performance.
- `apps/web/src/content/catalogLoader.test.ts`: include the new language in
  existing language lists and verify catalog identity, cache, failed requests,
  invalid JSON/HTML responses and English fallback. Retain session and score
  fallback coverage in `apps/web/src/sessionLanguage.test.tsx` and
  `apps/web/src/components/ScoreViewer.test.tsx`.
- `scripts/test/content.test.mjs`: retain translation validation, review
  freshness, musical-data parity and English compatibility-output coverage.

Extend `scripts/validate-static-preview.mjs` as well. It currently hardcodes
English, Italian and the legacy English catalog. Include
`/generated/es/catalog.json` and every referenced Spanish MusicXML file; check
locale, identical course/exercise IDs and slugs, and valid score XML while
retaining the English legacy byte comparisons.

## 8. Generate, build and verify locally

Run these commands from the repository root after translations and reviews are
complete:

```sh
pnpm check:i18n
pnpm generate:content
pnpm test:content
pnpm test:ui
pnpm typecheck
pnpm test
pnpm --filter @pianio/core-engine test
pnpm check:i18n:full
pnpm build
pnpm --filter @pianio/web exec vite preview --host 127.0.0.1 --port 4173 --strictPort
```

With preview running, use another terminal to run:

```sh
node scripts/validate-static-preview.mjs
```

Inspect these generated outputs; they are regenerated assets, not files to
translate or edit manually:

```text
apps/web/public/generated/es/catalog.json
apps/web/public/generated/es/scores/<courseId>/<slug>.musicxml
apps/web/public/generated/i18n-coverage.json
```

The generator derives MusicXML titles and goal text from the editorial overlays.
Musical data is compiled from the canonical source and reused across languages.
English/Italian outputs and the legacy `/generated/catalog.json` and
`/generated/scores/` URLs must remain valid. Generated content and build output
are ignored by Git.

Test the new language on desktop/mobile and in light/dark themes. Check catalog,
course and direct exercise navigation; long text and score layout; note names;
practice, loops, preview, count-in, performance and results; diagnostics;
keyboard/focus behavior; and document language/title/description. Switch languages
during a session and confirm that UI and content change together after any
protected playback/performance finishes.

In a separate test browser profile, import
`apps/web/src/fixtures/progress-v1.baseline.json`; verify stars, completion,
localized dates, export and reset. Exercise IDs and version 1 progress data must
stay language-independent. Test denied storage and missing/invalid target
catalogs/scores, English fallback notices and Retry. Verify note/chord/pedal
behavior with real MIDI hardware before claiming hardware validation.

Keep the root build gate intact:

```json
"build": "pnpm check:i18n:full && pnpm generate:content && pnpm --filter @pianio/web build"
```

In an isolated copy, remove a required UI/editorial translation or invalidate a
review and confirm the build fails before generation. Do not bypass the gate to
ship an incomplete language. Vite preview validates local static assets; it does
not reproduce Firebase hosting rewrites or deploy the site.

## 9. Document completion

Update the supported-language list and file map in `README.md`,
`docs/I18N-INVENTORY.md`, `docs/I18N-IMPLEMENTATION-STATUS.md`,
`docs/I18N-CONTENT-REVIEW.md` and `docs/I18N-VALIDATION-REPORT.md` with the actual
coverage, review evidence and remaining limitations. Commit the new UI files,
course overlays, configuration/resource/note-name edits, review registry,
validation changes and documentation together. The generated coverage report
must show zero required field fallbacks and current reviews for every course in
the new language before it is declared supported.

For detailed data contracts, see [the content pipeline](I18N-CONTENT-PIPELINE.md).
The [Italian version of this guide](ADDING-A-LANGUAGE.md) is also available.
