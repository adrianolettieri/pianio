# Pipeline dei contenuti multilingua — fase 4

Implementata il 15 ottobre 2026 sul fork `adrianolettieri/pianio`, checkout iniziale pulito
`d89d19d` (Stage 3). Nessun commit, push, PR o deploy. Il caricamento coordinato in React
e il selettore definitivo non sono stati implementati.

## Sorgenti e contratto editoriale

`localization.config.json` resta il registro condiviso. Il generatore legge
`supportedLanguages`, `sourceLanguage` e `fallbackLanguage`, verifica unicità/sicurezza
dei codici e richiede che il ripiego sia la lingua sorgente. Oggi: EN sorgente/ripiego,
EN/IT supportate. Soltanto `content/**/course.json` viene cercato ricorsivamente; non
si cercano corsi nella cartella delle traduzioni. I JSON inglesi restano invariati.

Un file per corso e lingua: `content-locales/it/<courseId>.json`.

```json
{
  "courseId": "method-level-1a",
  "title": "Metodo livello 1A — Fondamenti",
  "summary": "Descrizione italiana del corso.",
  "exercises": {
    "m1a-001": {
      "title": "Pulsazione sul Do",
      "summary": "Semibrevi sul Do centrale.",
      "goal": "Mantieni il suono per tutta la durata.",
      "license": { "notes": "Scritto per il percorso didattico iniziale aperto." }
    }
  }
}
```

Il nome file deve coincidere con `courseId`; la mappa usa **exercise.id**, mai lo slug.
Questa è l'intera lista dei campi ammessi. Sono vietati override di ID, slug, ordine,
URL, mani, chiavi, metrica, BPM, note, durate, swing, dinamiche, pedale, categorie,
`sourceKind`, `sourcePolicy`, `license.type` e `license.attribution`. Questi ultimi
rimangono identici al sorgente, compresi crediti vuoti preesistenti. `license.notes`
contiene solo la descrizione editoriale della licenza.

Controllo ordinario:

- Un file può mancare completamente. In un file presente è obbligatorio `courseId`.
- Titolo, descrizione, mappa esercizi e campi editoriali possono mancare; una stringa
  vuota o di soli spazi produce ripiego. I valori non stringa, compreso `null`, falliscono.
- Oggetti/array di forma sbagliata, campi sconosciuti a qualunque livello, ID orfani,
  corsi duplicati, nomi file incoerenti e caratteri non validi in XML 1.0 falliscono.
- Il parser effettua una visita ricorsiva dei token **prima** di `JSON.parse`: rileva
  anche chiavi duplicate annidate, con escape Unicode equivalenti. Non si affida al
  valore finale che `JSON.parse` avrebbe conservato.
- Anche sorgenti e registro di revisione usano il parser rigoroso. Vengono controllati
  ID/slug unici e sicuri, struttura sorgente, valori musicali e validazioni musicali
  già esistenti. Per compatibilità si conserva il token sorgente legacy `GF` presente
  nei brani, senza alterarne il rendering o ampliare questa fase a correzioni musicali.

Controllo completo: per ogni lingua diversa dalla sorgente e ogni corso sono richiesti
`title`, `summary`, tutti gli ID esercizio e, per ogni esercizio, `title`, `summary`,
`goal`, `license.notes` **se le note sorgente sono non vuote**. Ogni valore richiesto
è una stringa non vuota e non composta soltanto da spazi. Se le note sorgente sono
vuote, non si inventa una descrizione: `license.notes` può essere omesso o vuoto;
una nuova descrizione senza sorgente viene rifiutata. Sono richieste anche revisione
corrente del corso e approvazione del lotto. `validateCourseTranslation(..., {full:true})`
verifica la completezza editoriale; `contentReport(..., {full:true})` aggiunge quella
della revisione per l'intero catalogo.

`CourseTranslationDocument` ed `ExerciseTranslation` esprimono il contratto parziale.
`CompleteCourseTranslationDocument` richiede i testi principali; il requisito di
`license.notes` dipendente dal sorgente è verificato a runtime. `GeneratedCatalog.locale`
e `CatalogCourse.coverage` sono opzionali nei vecchi contratti TS per preservare i
chiamanti; il generatore li emette sempre. `LocalizedCatalog` li rende obbligatori
per i nuovi consumatori dopo la validazione runtime.

## Moduli e generazione

| Modulo | Responsabilità / esportazioni principali |
| --- | --- |
| `scripts/lib/json.mjs` | `parseJsonStrict`, `readJsonStrict` |
| `scripts/lib/content-validation.mjs` | `validateSourceCourse`, `validateCourseTranslation`, `editableFields` |
| `scripts/lib/content-review.mjs` | impronte, validazione registro, `createCourseReview`, `reviewCoverage` |
| `scripts/lib/music.mjs` | logica musicale estratta: `validateExercise`, `buildExpectedNotes`, `renderMusicXml`, `localizeMusicXml`, `escapeXml` |
| `scripts/lib/content-pipeline.mjs` | `loadContent`, `resolveCourse`, `contentReport`, `compileMusic`, `buildCatalog`, `generateContent` |
| `scripts/generate-content.mjs` | solo avvio CLI, gestione esito e directory predefinita |

Le funzioni importate non avviano CLI, non scrivono e non cancellano l'output pubblico.
`generateContent({rootDir, outputDir})` consente output temporanei; `loadContent` accetta
anche `contentDir`, `localesDir`, `configPath`, `reviewPath`. Solo la generazione
esplicita sostituisce la directory di output scelta, dopo aver validato tutti gli input
e compilato i dati. Vengono rifiutati output che coincidono con radice/input o li contengono,
o si trovano dentro i contenuti sorgente/tradotti. Il comando CLI usa
`apps/web/public/generated`; i test forniscono sempre una directory temporanea.

Per ogni esercizio `compileMusic` calcola una sola volta `expectedNotes` e l'XML
canonico. Tutti i cataloghi riusano lo stesso array musicale in memoria. L'XML locale
sostituisce esclusivamente il testo di `work/work-title`, `movement-title` e del
`words` dell'obiettivo nella prima battuta. L'escape copre `&`, `<`, `>`, apostrofi e
virgolette. Non vengono tradotti altri `words`, crediti, diritti o nomi delle parti.
Altezze, durate, tempi, dinamiche, pedale e notazioni rimangono nell'XML canonico.

Per ciascun campo, una traduzione non vuota prevale sul sorgente; altrimenti si usa
l'inglese. Le stringhe valide si conservano senza trasformazioni, inclusi accenti e
apostrofi. Le etichette UI delle categorie o della politica delle fonti rimangono nelle
mappe della fase 3.

## Output e copertura

```text
/generated/en/catalog.json
/generated/it/catalog.json
/generated/en/scores/<courseId>/<slug>.musicxml
/generated/it/scores/<courseId>/<slug>.musicxml
/generated/catalog.json                         # EN, scorePath legacy
/generated/scores/<courseId>/<slug>.musicxml      # copie EN identiche byte per byte
/generated/i18n-coverage.json                    # rapporto per lingua/corso
```

Il catalogo ha `{generatedAt, locale, courses}` e conserva tutti i campi esistenti.
`scorePath` contiene l'URL assoluto appropriato alla variante. Identificativi,
ordine e dati musicali restano uguali. I cataloghi hanno lo stesso `generatedAt`
per una generazione; esso **non** certifica la revisione.

Ogni corso include:

```json
{
  "coverage": {
    "locale": "it",
    "sourceLanguage": "en",
    "totalFields": 82,
    "sourceFields": 0,
    "translatedFields": 82,
    "fallbackFields": 0,
    "reviewStatus": "reviewed",
    "staleFields": [],
    "batchId": "pilot-method-1a",
    "fields": { "title": "translated", "exercises.m1a-001.goal": "translated" }
  }
}
```

L'esempio abbrevia `fields`: l'output contiene tutti i percorsi editoriali richiesti.
Valori: `source`, `translated`, `fallback`. Per EN i campi sono `source`, con zero
traduzioni e zero ripieghi; IT distingue ogni traduzione dal suo eventuale ripiego.
`reviewStatus`: `source`, `missing`, `pending`, `reviewed`, `stale`.
Il rapporto generato contiene `{rows, issues, warnings}`: `rows` include anche
`courseId`, `issues` usa la modalità ordinaria (nessun errore per sola copertura
parziale), `warnings` segnala revisioni obsolete. Non viene salvata una falsa
approvazione dal generatore.

Misura della generazione verificata: 80 corsi / 1.557 esercizi per catalogo,
4.675 file e 68.624.064 byte complessivi (tre serie di spartiti/cataloghi e rapporto).
Cataloghi EN 9.148.046 byte, IT 9.161.392 byte. La duplicazione statica è intenzionale
per mantenere gli URL inglesi. Output generato e build rimangono ignorati da Git.

## Registro persistente di revisione

`content-locales/review-registry.json` è versionato separatamente dall'output:

```json
{
  "version": 1,
  "batches": {
    "pilot-method-1a": {
      "locale": "it",
      "status": "reviewed",
      "reviewedBy": "Nome del revisore",
      "reviewedOn": "2026-10-15"
    }
  },
  "locales": {
    "it": {
      "method-level-1a": {
        "status": "reviewed",
        "batchId": "pilot-method-1a",
        "sourceFingerprints": { "title": "SHA-256 esadecimale, 64 caratteri" },
        "translationFingerprints": { "title": "SHA-256 esadecimale, 64 caratteri" }
      }
    }
  }
}
```

Le impronte sono SHA-256 del testo UTF-8 esatto, senza normalizzazione; si registrano
solo i campi effettivamente tradotti. Vengono confrontate a ogni controllo e generazione.
Cambiare il testo inglese tradotto, modificare la traduzione dopo la revisione o rimuovere
una traduzione approvata rende la revisione `stale`; i percorsi sono in `staleFields`.
Un corso/lotto `pending` o privo di revisione non soddisfa il controllo completo.
Il controllo ordinario segnala gli obsoleti con avviso, il completo fallisce.
Registro presente malformato, chiavi duplicate, riferimenti orfani, impronte di formato
errato e campi sconosciuti falliscono anche nel controllo ordinario.

Flusso editoriale: tradurre → confrontare con sorgente/glossario/spartito → revisionare
il significato → invocare esplicitamente `createCourseReview(course, translation, batchId)`
e salvare il risultato nel registro con stato/dettagli del lotto. La funzione crea le
impronte in memoria; non salva né approva nulla durante build/check. Non aggiornare le
impronte per eliminare un avviso senza aver revisionato i cambiamenti. La revisione del
pilota è attribuita esplicitamente a Codex nel registro.

## Verifiche testuali e musicali

`pnpm test:content`: 11 test con `node:test`, output temporaneo rimosso al termine.
Coprono completezza/parzialità, tutte le omissioni obbligatorie, stringhe vuote,
JSON malformati e chiavi duplicate decodificate, ID/slug/override vietati, ID orfani,
corsi duplicati, ripiego per campo, registro e impronte obsolete, lotti pendenti,
compatibilità delle note licenza sorgente vuote e del token legacy `GF`.

`rich-course.json` copre accordi, due pentagrammi, legature, valori puntati, swing,
dinamiche e pedale. `rich-score.baseline.musicxml` e `rich-score.baseline-notes.json` sono stati
catturati con il renderer precedente all'estrazione. Il confronto XML usa un vero
parser DOM, include dichiarazione/DOCTYPE, commenti, elementi/attributi/testi e ignora soltanto l'indentazione bianca.
Nel confronto EN/IT vengono normalizzati esclusivamente i tre nodi editoriali
esplicitamente autorizzati, senza ignorare metadati/crediti o intere sezioni musicali.
La fixture mantiene anche lo swing nei dati del catalogo: non si introduce una nuova
indicazione MusicXML che il renderer precedente non generava.

Sul catalogo reale si confrontano tutti gli identificativi, ordine e dati musicali
EN/IT; tutti i 1.557 vecchi URL restituiscono la stessa stringa XML di EN. I 20 XML
del pilota sono confrontati strutturalmente, gli altri IT sono identici a EN.
Un test verifica che input malformati non cancellino neppure l'output temporaneo
preesistente. Accenti, apostrofi, `&` e `<` attraversano JSON, cataloghi e XML.

Revisione editoriale del pilota: confronto esercizio per esercizio con il sorgente
(inclusi mano/registro, durate, pause, metrica e obiettivo) e con il glossario.
Usati Do/Re/Mi, semibreve/minima/semiminima, chiave di basso, battuta, grado congiunto
e intervallo di terza. Tutte le 20 note descrittive delle licenze sono tradotte;
tipo e attribuzione sono conservati. Non sono stati tradotti altri corsi.

## Verifica visiva separata

Due spartiti generati caricati con OSMD installato nell'app, via Vite solo su localhost:

- `single-c-pulse`: titolo/obiettivo italiani, due semibrevi sul Do centrale, chiave di
  violino, 4/4 e credito inglese conservato; leggibile a 1280 × 900.
- `bass-c-position`: titolo/obiettivo italiani, chiave di basso e successione di note
  coerente con il sorgente; titolo lungo leggibile a 1280 × 900.
- Vista stretta iniziale (538 px): l'obiettivo lungo supera l'area visibile del riquadro.
  Il testo XML è completo. Gestione di zoom/overflow e revisione del viewer restano
  prove da chiudere nelle fasi 5/7; non è dichiarata una verifica mobile superata.

Il doppio titolo visibile proviene dai preesistenti `work-title` e `movement-title`,
entrambi localizzati; non è stata cambiata l'impaginazione musicale sorgente.
La prova usa un harness separato da React e non dimostra il cambio lingua della sessione.

Prove salvate: [desktop](i18n-phase4/pilot-desktop.jpg),
[basso desktop](i18n-phase4/pilot-bass-desktop.jpg),
[vista stretta](i18n-phase4/pilot-narrow.jpg).
Harness riproducibile: copiare `scripts/test/preview-score.html` in
`apps/web/phase4-score-proof.html`, eseguire `pnpm generate:content` e Vite,
aprire `/phase4-score-proof.html`; rimuovere la copia prima del build.
La copia temporanea è stata rimossa e il server arrestato al termine della verifica.

## Comandi e risultati

Node 22.20.0, pnpm 10.18.3 tramite shim Corepack in `/private/tmp/pianio-corepack-bin`
(prepended a `PATH`, senza modificare configurazioni o lockfile).

| Comando | Esito |
| --- | --- |
| `pnpm check:i18n` | Superato: UI EN/IT e contenuti presenti validi; rapporto per corso. |
| `pnpm test:content` | Superato: 11/11. |
| `pnpm test:ui` | Superato: 6 file, 21/21. |
| `pnpm typecheck` | Superato. |
| `pnpm build` | Superato: contenuti EN/IT/legacy e Vite. Avvisi preesistenti di import misto `pianoSampler` e chunk OSMD >500 kB. |
| `pnpm test` | Superato: 7/7 MIDI. |
| `pnpm --filter @pianio/core-engine test` | Fallisce prima dei test: `--test-isolation=none` non supportato da Node 22.20.0. |
| `node --test --experimental-test-isolation=none packages/core-engine/src/practice.test.ts` | Eseguiti, 0/4 superati: aspettative preesistenti omettono `velocityScore: null` e `pedalScore: null`. Nessun file del motore modificato rispetto a HEAD. |
| `pnpm check:i18n:full` | **Fallito atteso**, 158 segnalazioni: 79 corsi con campi mancanti e 79 revisioni mancanti. Nessuna revisione del pilota obsoleta. |

Copertura IT: 82/6.069 campi, tutti del pilota; 5.987 campi in ripiego.
Il pilota è completo: 20/20 esercizi, 82/82 campi, lotto/corso `reviewed`.
Restano 79 corsi / 1.537 esercizi per la fase 6. I conteggi si ricavano dai sorgenti;
319 note descrittive sorgente vuote non fanno parte dei campi da tradurre.
Il controllo completo non è dichiarato superato né collegato al build.
Il build valida comunque i file presenti attraverso il generatore.

## Contratto di consegna al caricatore della fase 5

Il futuro caricatore potrà richiedere `/generated/<locale>/catalog.json`, verificare
`locale`, forma e identificativi, quindi usare gli `scorePath` già localizzati.
Il catalogo italiano è disponibile anche per gli esercizi in ripiego: il relativo
XML esiste sotto IT con titolo/obiettivo risolti per campo. `coverage` permette di
mostrare parzialità e revisione corrente senza dedurle dal testo o da `generatedAt`.
Non presumere che tutta una lingua sia tradotta se il pilota lo è.

Restano stabili `course.id`, `exercise.id`, `slug`, ordine e chiavi `courseId/slug`;
la migrazione non cambia storage, progressi o export v1. `expectedNotes` è identico
strutturalmente fra cataloghi, ma due richieste JSON creano riferimenti JS distinti:
la fase 5 dovrà riusare i dati canonici per preservare gli effetti/sessioni React.
I sorgenti reali includono il token legacy `GF`: la futura validazione del loader
non deve rifiutare cataloghi oggi esistenti sulla base del solo vecchio union TS.

Coordinamento UI/catalogo, cache, richieste concorrenti, differimento durante anteprima/
esecuzione, selettore e ripristino del cursore appartengono interamente alla fase 5.
Questa fase lascia il frontend sul catalogo legacy inglese. Le prove del pilota italiano
sono state svolte direttamente sull'output e sull'harness OSMD, non mediante un loader
React anticipato.
