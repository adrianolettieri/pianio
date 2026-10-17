# Aggiungere una lingua a Pianio

[English guide](ADDING-A-LANGUAGE.en.md).

Esempio: spagnolo (`es`). Questa guida non registra né attiva lo spagnolo nel
prodotto: il registro corrente contiene soltanto `en` e `it`. Applicare i passaggi
in un checkout di lavoro dedicato e rilasciare la lingua solo dopo le verifiche.
Non copiare schermate, motore, audio o logica dei progressi.

## 1. Registrazione e risorse UI

Nel checkout dedicato aggiornare `localization.config.json`:

```json
{
  "supportedLanguages": ["en", "it", "es"],
  "sourceLanguage": "en",
  "fallbackLanguage": "en"
}
```

Creare `apps/web/src/i18n/locales/es/` con **tutti e cinque** i file `common.json`,
`catalog.json`, `practice.json`, `diagnostics.json`, `progress.json`. Conservare la
struttura semantica dell'inglese. Tradurre anche tooltip, nomi accessibili, errori,
metadati, messaggi di ripiego e istruzioni delle scorciatoie. Non tradurre chiavi,
parametri `{{count}}`, `{{note}}`, URL o nomi dei dispositivi.

Per ottenere una lista completa senza spacciare copie inglesi per traduzioni:

```sh
node --input-type=module <<'JS'
import { readFile, mkdir, writeFile } from 'node:fs/promises';
const target = 'apps/web/src/i18n/locales/es';
await mkdir(target, { recursive: true });
function blank(value) {
  return typeof value === 'string' ? '' : Object.fromEntries(
    Object.entries(value).map(([key, child]) => [key, blank(child)]));
}
for (const ns of ['common', 'catalog', 'practice', 'diagnostics', 'progress']) {
  const source = JSON.parse(await readFile(`apps/web/src/i18n/locales/en/${ns}.json`, 'utf8'));
  // flag wx evita di sovrascrivere traduzioni già avviate.
  await writeFile(`${target}/${ns}.json`, JSON.stringify(blank(source), null, 2) + '\n', { flag: 'wx' });
}
JS
```

Riempire ogni stringa. Esempi di valori in `common.json` (sono sottoinsiemi del file,
non sostituiscono gli altri campi obbligatori):

```json
{
  "document": {
    "title": "Pianio — Lecciones de piano gratuitas y abiertas",
    "description": "Aprende piano con comentarios MIDI en tiempo real."
  },
  "language": {
    "label": "Idioma",
    "loading": "Cargando el idioma…"
  }
}
```

Per i plurali usare le categorie di `Intl.PluralRules('es')`, non soltanto quelle
copiate dall'inglese. Il checker richiede anche `many` quando previsto dal runtime.
Ad esempio, per una chiave con `{{count}}`, fornire `_one`, `_many`, `_other`,
con gli stessi parametri del sorgente; tradurre l'intera frase in ciascuna forma.

In `apps/web/src/i18n/resources.ts` importare i cinque JSON e aggiungere:

```ts
// Dopo gli import esCommon, esCatalog, esPractice, esDiagnostics, esProgress:
// dentro resources:
es: { common: esCommon, catalog: esCatalog, practice: esPractice,
      diagnostics: esDiagnostics, progress: esProgress },
// dentro languageLabels:
es: "Español",
```

`Language` viene derivato dalle risorse; il selettore usa registro e `languageLabels`.
Non aggiungere un altro componente o rami `language === 'es'` alle schermate.
In `formatNote.ts` estendere soltanto i dati `NOTE_NAMES` e `INVALID_NOTE_LABEL`:

```ts
// NOTE_NAMES.es (12 semitoni, ordinati da MIDI % 12):
["Do", "Do#", "Re", "Re#", "Mi", "Fa", "Fa#", "Sol", "Sol#", "La", "La#", "Si"]
// INVALID_NOTE_LABEL.es:
"Nota"
```

Il formatter conserva l'ottava: MIDI 60 → Do4. MIDI, token `C4:q`, accordi, chiavi,
swing, dinamiche e pedale rimangono invariati. Normalizzazione regionale (`es-MX`),
persistenza, messaggi, date e caricamento usano le funzioni condivise.

## 2. Contenuti editoriali

Creare `content-locales/es/<courseId>.json` per ognuno degli **80 corsi**, inclusi
i 12 aggregati nascosti. Fonte unica: `content/**/course.json`. Indicizzare gli
esercizi per `exercise.id`, non per slug o posizione nell'array.

Esempio completo di un'entrata esercizio reale nel documento di `method-level-1a`:

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

Questo esempio è valido come traduzione **parziale**; per completare il corso
aggiungere anche `m1a-002`–`m1a-020`, ciascuno con titolo, descrizione, obiettivo e
note descrittive della licenza. Per completare la lingua servono tutti gli altri
corsi e le revisioni. Il controllo ordinario consente l'avanzamento graduale;
`check:i18n:full` deve fallire finché esistono lacune.

Tradurre `license.notes` solo quando il sorgente non è vuoto. Conservare
`license.type` e `license.attribution` nel sorgente; non sono campi ammessi
nell'overlay. Non copiare né modificare ID, slug, ordine, `sourcePolicy`, mani,
registro, metrica, BPM, note, durate, legature, dinamiche o pedale. Il generatore
compila i dati musicali una volta e li riusa per tutte le lingue.

## 3. Revisione esplicita

Creare un glossario della lingua, controllare ogni testo contro sorgente **e dati
musicali** e annotare eventuali contraddizioni senza correggerle silenziosamente.
Esaminare almeno uno spartito per corso, oltre ai casi con istruzioni lunghe,
accordi, doppio pentagramma, legature, swing, dinamiche e pedale. Registrare separatamente
revisione testuale e visuale, autore/data, problemi e passi residui. Un test di
copertura non certifica il significato didattico e un'impronta non è una revisione.

Solo dopo una revisione effettiva, registrare le impronte del corso e il lotto in
`content-locales/review-registry.json`. Esempio per il pilota spagnolo completo:

```sh
node --input-type=module <<'JS'
import { readFile, writeFile } from 'node:fs/promises';
import { loadContent } from './scripts/lib/content-pipeline.mjs';
import { createCourseReview } from './scripts/lib/content-review.mjs';
const rootDir = process.cwd(), locale = 'es', batchId = 'es-method-1a';
const content = await loadContent({ rootDir });
const course = content.courses.find(c => c.courseId === 'method-level-1a');
const translation = content.translations[locale].get(course.courseId);
const file = 'content-locales/review-registry.json';
const registry = JSON.parse(await readFile(file, 'utf8'));
// Sostituire nome e data con chi ha DAVVERO svolto la revisione.
registry.batches[batchId] = { locale, status: 'reviewed',
  reviewedBy: 'Nome del revisore effettivo', reviewedOn: '2026-10-16' };
registry.locales[locale] ??= {};
registry.locales[locale][course.courseId] = createCourseReview(course, translation, batchId);
await writeFile(file, JSON.stringify(registry, null, 2) + '\n');
JS
```

Non eseguire questo blocco per approvare un corso incompleto o senza revisione.
Non aggiornare le impronte automaticamente nel generatore. Modifiche successive
al sorgente o alla traduzione devono produrre stato `stale` e una nuova revisione.

## 4. Generazione, verifica e criterio di disponibilità

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

Controllare `/generated/es/catalog.json` e i relativi `/scores/`, oltre a EN/IT e
URL inglesi legacy. `validate-static-preview.mjs` oggi controlla EN/IT/legacy:
estenderne l'elenco delle lingue per aggiungere ES alla verifica HTTP, senza duplicare
il caricatore applicativo. I test del loader devono continuare a coprire HTML 200,
404, JSON invalido, cache, richieste fuori ordine e parità degli identificativi.

Provare su desktop/mobile e tema chiaro/scuro: catalogo, corso, esercizio diretto,
pratica e loop già avviati, anteprima, conteggio/esecuzione, risultati, diagnostica,
focus/scorciatoie, zoom/cursore e nomi note. Importare la fixture v1 sintetica
`apps/web/src/fixtures/progress-v1.baseline.json` in storage di test; controllare
completamenti, stelle e date, esportazione e reset senza modificare dati reali.
Provare catalogo/spartito ES mancante e storage negato; verificare il ripiego EN.
Una simulazione MIDI non sostituisce note, accordi e pedale su hardware reale.

Il build radice richiede già copertura e revisione complete per **tutte le lingue
registrate**. Conservare questo gate anche quando si aggiunge la terza lingua:

```json
"build": "pnpm check:i18n:full && pnpm generate:content && pnpm --filter @pianio/web build"
```

`--full` comprende i controlli ordinari; nessuno dei checker invoca il build,
quindi non si crea un ciclo. Provare il build su dati validi e, in una copia
isolata, rimuovere una traduzione obbligatoria: deve fallire prima della generazione.
Non togliere il gate per far passare una nuova lingua incompleta. Aggiornare README,
inventario, copertura, registro di revisione e rapporto di validazione con prove e
limiti effettivi prima di dichiarare disponibile la nuova lingua.
