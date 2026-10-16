# Piano di implementazione: multilingua e italiano

Stato al 16 ottobre 2026: implementazione EN/IT completata, inclusi tutti i 6.069 campi editoriali di 80 corsi / 1.557 esercizi, revisione testuale Codex corrente e un campione visuale per corso. Tutta la matrice passa; `check:i18n:full` è nel build, verificato anche con fixture negativa. **Validazione finale B ancora parziale**: prova hardware MIDI, esecuzione/risultati reali e reset IT manuale non completati. Esiti e limiti in [I18N-VALIDATION-REPORT.md](I18N-VALIDATION-REPORT.md). Le note delle singole fasi conservano la cronologia.

Documento di partenza: `PIANO-MULTILINGUA.md`, nella cartella che contiene il repository. Repository di destinazione: [adrianolettieri/pianio](https://github.com/adrianolettieri/pianio). Baseline del codice analizzato: `df5526d`.

Questo piano descrive attività, dipendenze e verifiche. La sua creazione non introduce modifiche al funzionamento dell'app.

I prompt pronti da copiare per eseguire le singole fasi sono raccolti nell'[indice dei prompt](prompts-multilingua/README.md), in ordine da 00 a 07.

## Obiettivo e perimetro

Rendere Pianio utilizzabile in inglese e italiano, includendo interfaccia, messaggi, nomi delle note, contenuti didattici e testi degli spartiti. Una lingua successiva deve poter essere aggiunta tramite configurazione e traduzioni, senza duplicare schermate o logica musicale.

La copertura finale comprende tutti gli 80 corsi e 1.557 esercizi sorgente, inclusi i corsi aggregati attualmente esclusi dalla UI. Il filtro attuale del catalogo rimane applicato: 68 corsi e 1.365 esercizi visibili.

Conservare URL delle rotte, identificativi, dati musicali, progressi ed esportazioni esistenti. La pubblicazione del sito, nuove funzionalità musicali e pagine multilingua prerenderizzate per SEO/social restano fuori da questa implementazione.

## Decisioni da applicare

| Tema | Decisione |
| --- | --- |
| Libreria | `i18next` e `react-i18next`, con dizionari UI importati nel bundle. |
| Lingue | Registro condiviso `localization.config.json` alla radice: lingue supportate `en`, `it`, lingua di ripiego `en`, lingua sorgente `en`. Frontend e generatore leggono la stessa configurazione. |
| Preferenza | `pianio:language` se valida; altrimenti prima lingua supportata di `navigator.languages`; altrimenti `en`. Normalizzare varianti regionali. |
| Dizionari UI | Namespace `common`, `catalog`, `practice`, `diagnostics`, `progress`, chiavi semantiche tipizzate. |
| Contenuti | Inglese negli attuali `content/**/course.json`; traduzioni in `content-locales/it/<courseId>.json`, indicizzate per ID. |
| Output | Catalogo e MusicXML sotto `/generated/<lingua>/`; vecchi percorsi mantenuti come copie inglesi per compatibilità con hosting statico. |
| Progressi | Chiavi `courseId/slug`, nomi delle chiavi di storage e formato di export versione 1 invariati. |
| Note | In italiano Do–Re–Mi–Fa–Sol–La–Si; MIDI 60 = Do4. Nessun cambiamento a token musicali o numeri MIDI. |
| Cambio lingua | Confermare la lingua attiva quando il catalogo è pronto. Differire il cambio durante anteprima, conteggio iniziale ed esecuzione cronometrata. |
| Test UI | Aggiungere Vitest, React Testing Library e ambiente DOM per i test mirati; usare i test Node esistenti per MIDI e motore e `node:test` per gli script `.mjs`. |

## Ordine e consegne

```text
0. Baseline e inventario
   → 1. Fondazione i18n
   → 2. Messaggi strutturati e formato note
   → 3. Traduzione dell'interfaccia
   → 4. Pipeline dei contenuti e corso pilota
   → 5. Cambio lingua completo e continuità della sessione
   → 6. Traduzione di tutti i contenuti
   → 7. Verifica finale e documentazione
```

Eseguire i controlli rilevanti in ogni fase. La fase 7 raccoglie le prove trasversali e chiude la consegna.

**Consegna A:** fasi 0–5, interfaccia bilingue e corso `method-level-1a` completamente italiano. Il resto del catalogo usa il ripiego inglese, segnalato come copertura parziale.

**Consegna B:** fasi 6–7, italiano completo e verificato. Solo questa consegna soddisfa la copertura integrale del documento di partenza.

## 0. Baseline e inventario

- [x] Verificare versioni di Node e pnpm. Usare una versione Node compatibile anche con il comando TypeScript nativo del pacchetto `core-engine`; annotare la versione usata. Verificati Node 22.20.0 / pnpm 10.18.3; script corretto e suite motore 4/4.
- [ ] Installare le dipendenze dal lockfile ed eseguire i comandi esistenti riportati nella sezione di verifica; registrare eventuali problemi già presenti.
- [x] Censire testi visibili, tooltip, attributi accessibili, errori e messaggi conservati nello stato React. Registrare namespace e chiave previsti in `docs/I18N-INVENTORY.md`.
- [x] Creare `docs/I18N-GLOSSARY-IT.md` con terminologia e convenzioni: Practice → Esercitazione, Performance → Esecuzione, LH/RH → MS/MD, mani unite, battuta, lettura a prima vista, dinamica e pedale.
- [x] Verificare ID e conteggi dal filesystem e registrare la copertura iniziale. Annotare `HomeScreen.tsx` come componente non utilizzato; non estendere il lavoro a una sua riattivazione.

**Completata quando:** inventario, glossario e stato dei controlli iniziali sono disponibili; le regressioni future sono distinguibili dai problemi della baseline.

## 1. Fondazione i18n

File principali: `localization.config.json`, `apps/web/package.json`, `pnpm-lock.yaml`, `apps/web/src/main.tsx`, nuovi file sotto `apps/web/src/i18n/`.

- [x] Installare le due librerie di traduzione e gli strumenti per i test UI; aggiungere configurazione e script `test:ui`.
- [x] Creare `i18n/index.ts`, risorse EN/IT nei cinque namespace e dichiarazioni TypeScript per le chiavi.
- [x] Implementare risoluzione e persistenza della lingua con gestione degli errori di lettura e scrittura dello storage; conservare la scelta in memoria quando lo storage non è disponibile.
- [x] Inizializzare i18n prima del rendering React. Caricare nel bundle entrambi i dizionari UI, per rendere disponibili anche i messaggi di errore iniziali.
- [x] Aggiungere `scripts/check-translations.mjs` e il comando `check:i18n`: controllo della struttura dei dizionari, chiavi, stringhe vuote, parametri e forme plurali richieste per ciascuna lingua.
- [x] Preparare la funzione che sincronizza `lang`, titolo e descrizione del documento con la lingua attiva. Mantenere un HTML iniziale inglese valido prima dell'avvio JavaScript.

**Verifica:** test della precedenza delle preferenze, varianti regionali, lingua non supportata, storage non disponibile e ripiego per chiave mancante. Il controllo statico rileva parametri incoerenti e traduzioni UI incomplete.

## 2. Messaggi strutturati e formato delle note

File principali: `packages/midi-web/src/index.ts`, relativi test, `apps/web/src/progress.ts`, nuovi `i18n/messages.ts` e `i18n/formatNote.ts`.

- [x] Aggiungere un codice stabile a `MidiSupportDescription` per ambiente non browser, contesto non sicuro, API assente e disponibilità. Mantenere temporaneamente `summary` e `detail` per migrare i chiamanti senza romperli.
- [x] Restituire da `importProgress` un'unione discriminata con esito, codice e numero di esercizi importati. Conservare temporaneamente `message`, quindi rimuoverlo dopo la migrazione dei chiamanti.
- [x] Normalizzare gli errori MIDI, catalogo e spartito in codici applicativi con parametri; mantenere eventuali dettagli nativi separati per la diagnostica tecnica.
- [x] Conservare nello stato notifiche ed errori come codice e parametri, traducendoli durante il rendering. Una notifica già visibile deve aggiornarsi al cambio lingua.
- [x] Implementare un formatter delle note per la UI e usarlo sia nella tastiera sia nei suggerimenti e nella diagnostica. Mantenere `formatMidiNote` del pacchetto MIDI per i suoi consumatori tecnici e per compatibilità.

**Verifica (fase 2):** superati `pnpm test` (7 test MIDI, inclusi i quattro codici), `pnpm test:ui` (20 test, inclusi esiti/import v1, errori, cambio lingua a notifica visibile e Do sempre visibili), `pnpm check:i18n`, `pnpm typecheck` e `pnpm build`. I test UI verificano MIDI 60 → C4/Do4, estremi 0/127, alterazioni e input non valido. I pacchetti MIDI e motore non dipendono da React o da i18next. Build con gli avvisi Vite preesistenti di import misto `pianoSampler.ts` e chunk OSMD oltre 500 kB.

## 3. Traduzione dell'interfaccia

File principali: `App.tsx`, `ExercisePracticePanel.tsx`, `PianoKeyboard.tsx`, `ScoreViewer.tsx`, `DiagnosticsScreen.tsx`, `progress.ts` e dizionari UI.

- [x] Testi delle viste attive di navigazione, catalogo, corso, progressi e pagina non trovata migrati a chiavi semantiche; inventario e prove correnti nel rapporto finale.
- [x] Comandi di pratica, modalità, velocità, loop, metronomo, connessione MIDI, risultati e notifiche migrati; continuità dei messaggi EN/IT verificata nei test. Prova hardware distinta nella fase 7.
- [x] Migrare la schermata diagnostica, i messaggi di errore degli spartiti e il formatter temporale sensibile alla lingua attiva.
- [x] Le viste attive usano mappe esplicite per mani, chiavi, categorie e provenienza. Dizionari della politica delle fonti presenti; la politica non è esposta nella UI. Il formatter `capitalize` legacy non è un chiamante attivo; la sua presenza non implica copy visibile da tradurre.
- [x] Gestire conteggi con le regole plurali e numeri/date tramite `Intl` usando la lingua selezionata. Conservare i formati macchina in storage, JSON e MusicXML.
- [x] Includere `aria-label`, `title`, etichette dei controlli e testi delle scorciatoie. Usare traduzioni di frasi intere con parametri, evitando concatenazioni di frammenti.
- [x] Chiamanti attivi migrati ai messaggi strutturati e `ProgressImportResult.message` rimosso. Campi MIDI legacy conservati per API non attive/compatibilità, senza copy inglese nelle viste attive.

**Verifica:** test dei messaggi dinamici e dei principali controlli; revisione manuale di tutte le schermate attive in entrambe le lingue. Aggiornare l'inventario indicando le voci migrate. I testi dei corsi restano responsabilità della fase 4.

## 4. Pipeline dei contenuti e corso pilota

File principali: `packages/content-schema/src/index.ts`, `scripts/generate-content.mjs`, nuovi moduli `scripts/lib/`, `content-locales/it/`, `scripts/check-translations.mjs`.

- [x] Definire tipi e validazione runtime delle traduzioni. Il TypeScript da solo non valida i JSON letti dal generatore `.mjs`.
- [x] Usare una struttura per corso con `courseId`, `title`, `summary` ed `exercises` indicizzati per `exercise.id`. Ogni esercizio contiene `title`, `summary`, `goal` ed eventuali `license.notes` tradotte; vietare override dei campi musicali e degli identificativi.
- [x] Estrarre in funzioni importabili risoluzione delle traduzioni, costruzione catalogo e rendering MusicXML. Separare l'avvio CLI per eseguire i test senza scrivere nella directory pubblica.
- [x] Risolvere il ripiego per campo: traduzione italiana valida → testo inglese sorgente. Nel rapporto di copertura distinguere un campo tradotto da uno ottenuto per ripiego.
- [x] Calcolare i dati musicali dal solo sorgente e riutilizzarli nelle varianti linguistiche. Tradurre anche obiettivi e titoli MusicXML, applicando l'escape XML.
- [x] Generare cataloghi e spartiti EN/IT e copie inglesi ai vecchi URL. Aggiungere `locale` ai cataloghi generati e metadati di copertura per corso utilizzabili dalla UI.
- [x] Tradurre interamente `method-level-1a`, incluse le note descrittive delle licenze, conservando tipo e attribuzioni originali.
- [x] Estendere `check:i18n` con ID orfani, file duplicati, campi sconosciuti e rapporto della copertura. Aggiungere `check:i18n:full`, che fallisce anche per traduzioni mancanti. Il controllo ordinario consente la copertura parziale dei contenuti durante la consegna A.
- [x] Segnalare le traduzioni da revisionare quando cambia il testo inglese: registrare nel rapporto di revisione un'impronta dei campi sorgente, senza alterare ID o dati musicali.

**Verifica:** test con traduzioni complete, incomplete, malformate e ID inesistenti; confronto dei cataloghi per identità e dati musicali; confronto strutturale MusicXML limitando le differenze ai testi previsti. Usare fixture con accordi, due pentagrammi, legature, note puntate, swing, dinamiche e pedale. Verificare accenti e caratteri XML come `&` e `<`.

**Completata quando:** il pilota ha testi italiani nel catalogo e negli spartiti, tutti i corsi inglesi funzionano ai vecchi URL e il rapporto distingue correttamente copertura e ripiego.

Verifica del 15 ottobre 2026: pilota 20/20 esercizi, 82/82 campi italiani e revisione corrente; 11 test Node dei contenuti, 21 test UI, 7 test MIDI, checker ordinario, typecheck e build superati. Il controllo completo **fallisce come previsto**: 79 corsi, 1.537 esercizi e 5.987 campi ancora in ripiego; 79 revisioni mancanti. Suite motore con problemi preesistenti documentati nello stato. Ispezione OSMD di due spartiti: leggibili su desktop, obiettivo lungo eccedente l’area visibile stretta. Contratti, prove testuali/visive distinte e consegna al caricatore: `I18N-CONTENT-PIPELINE.md`. Nessun lavoro React della fase 5.

## 5. Cambio lingua completo e continuità della sessione

File principali: nuovi `apps/web/src/content/catalogLoader.ts`, `apps/web/src/i18n/LanguageProvider.tsx`, `apps/web/src/components/LanguageSelector.tsx`; modifiche ad `App.tsx`, `ExercisePracticePanel.tsx`, `ScoreViewer.tsx` e `app.css`.

- [x] Implementare caricamento e cache dei cataloghi per lingua, con deduplicazione delle richieste e validazione runtime minima: lingua, corsi, esercizi, identificativi e percorsi degli spartiti.
- [x] Gestire errori HTTP, JSON malformato e risposta HTML con stato 200. Quest'ultimo caso è possibile con il rewrite SPA di `firebase.json`: `response.ok` non basta per riconoscere un catalogo valido.
- [x] Gestire `requestedLanguage`, `activeLanguage` e richiesta pendente. Ignorare risposte obsolete dopo selezioni rapide; confermare dizionari UI e catalogo insieme solo quando i dati necessari sono disponibili.
- [x] Se il catalogo italiano non è disponibile, usare quello inglese e mostrare un messaggio italiano che chiarisce il ripiego dei contenuti. Se entrambi falliscono, mantenere i dati precedenti se disponibili e mostrare un errore recuperabile.
- [x] Applicare il filtro dei corsi con una trasformazione non mutante: non modificare gli oggetti conservati nella cache.
- [x] Aggiungere il selettore «Italiano / English» nella navigazione desktop/mobile e nelle viste di esercizio. Includere etichetta accessibile, stato di caricamento e conferma del cambio.
- [x] Escludere anche `SELECT` ed elementi modificabili dalle scorciatoie globali, affinché l'uso da tastiera del selettore non navighi tra esercizi né avvii un reset.
- [x] Mantenere montato il pannello durante il cambio; conservarne l'identità per corso/esercizio, senza usare la lingua come `key` e senza azzerare `catalog` durante un cambio già avviato.
- [x] Riutilizzare per lo stesso esercizio i dati musicali canonici, evitando che nuovi riferimenti a `expectedNotes` riattivino effetti quali l'auto-loop. Separare l'aggiornamento dei testi dal reset della sessione.
- [x] Far comunicare al coordinatore l'attività del pannello. Durante `isPreviewing`, `counting-in` o `playing`, accodare la scelta e applicarla al termine o all'arresto già previsto dall'app. Non introdurre una nuova funzione di pausa.
- [x] Ripristinare cursore e zoom di `ScoreViewer` dopo il caricamento del MusicXML localizzato usando la posizione corrente della sessione; non affidarsi a un nuovo avanzamento MIDI per riallineare il cursore.
- [x] Gestire gli errori dello spartito localizzato con messaggio e possibilità di ripiego allo spartito inglese corrispondente. Conservare posizione e identità dell'esercizio anche nel ripiego.

**Verifica:** test del caricatore con richieste concorrenti, HTML 200, errori e cache; test dei cambi EN→IT→EN durante pratica e diagnostica. Verificare il rinvio del cambio durante anteprima ed esecuzione, senza perdita di collegamento MIDI, loop, velocità, punteggio o progressi.

**Consegna A pronta quando:** UI italiana completa, pilota interamente italiano, copertura parziale chiaramente indicata e continuità della sessione verificata.

Verifica del 15 ottobre 2026: loader, coordinatore, selettore e continuità implementati; test UI 48/48, contenuti 11/11 e MIDI 7/7, checker, typecheck e build superati. Browser desktop/mobile e pilota OSMD verificati; MIDI/audio di sessione simulati. Suite core-engine corretta nel seguito della fase: comando compatibile con Node 22 e 4/4 test superati; prova MIDI fisica ancora da eseguire. Criteri e limiti della consegna A: [rapporto fase 5](I18N-LANGUAGE-SESSION.md). La fase 6 è in corso: registro e punto di ripresa in [I18N-CONTENT-REVIEW.md](I18N-CONTENT-REVIEW.md). I JSON correnti contengono 80 corsi, 1.557 esercizi e 6.069 campi; sono tradotti 642 campi, con 7 corsi completi e `method-level-2a` parziale (80/82 campi, due conflitti sorgente). Checker ordinario e test contenuti 11/11 superati; prove visuali OSMD eseguite per i sette corsi nuovi. L’overflow di titolo/obiettivo su viewport stretto resta per fase 7.

## 6. Traduzione di tutti i contenuti

File principali: `content-locales/it/*.json`, glossario, rapporto di copertura e revisione.

Completamento al 16 ottobre 2026:

- [x] Conteggi ricavati dai JSON e pilota `method-level-1a` completo e non obsoleto.
- [x] Registro per corso/lotti aggiornato con revisioni testuali e impronte correnti.
- [x] Due conflitti di `method-level-2a` chiariti confrontando la notazione; tradotti anche i due campi lasciati in ripiego.
- [x] Tradotti Metodo livelli 1–6, sottolivelli e aggregati, conservando i testi italiani già presenti.
- [x] Tradotti tutti i corsi di Tecnica e le otto raccolte di Brani.
- [x] Verificati titoli, descrizioni, obiettivi e note delle licenze; conservati crediti, identificativi e simboli standard, con titoli italiani convenzionali dove appropriati.
- [x] Significato didattico confrontato da Codex con sorgente e dati musicali; chiarimenti editoriali documentati. Non si dichiara revisione umana.
- [x] Validazione dei lotti e controlli finali eseguiti; copertura e revisioni aggiornate. Esaminato uno spartito per ciascuno degli 80 corsi, scegliendo l'obiettivo più lungo, con estensione SVG del viewer. Ulteriore prova React mobile sul massimo assoluto `m6d-001` e sul precedente caso 1B.
- [x] Copertura integrale e nessuna traduzione da revisionare secondo il registro corrente: `check:i18n:full` passa. Conteggi dinamici, senza esclusioni di corsi.

**Completata quando:** `check:i18n:full` passa per tutti gli 80 corsi e 1.557 esercizi della baseline; il rapporto attesta anche la revisione dei lotti, non soltanto l'esistenza delle stringhe.

## 7. Verifica finale e documentazione

- [ ] Verificare in inglese e italiano catalogo, corso, pratica, esecuzione, risultati, diagnostica, importazione/esportazione e reset dei progressi.
- [x] Verificati layout desktop/mobile, menu, tooltip, pulsanti, nomi note e istruzioni lunghe nei campioni documentati, in chiaro/scuro. Confermata l’estensione/scorrimento SVG della fase 5; corretto il contrasto del selettore scuro.
- [ ] Eseguire una prova con tastiera MIDI reale, comprendendo note, accordi e pedale. Se l'hardware non è disponibile, registrare esplicitamente la prova ancora da eseguire; le simulazioni non la sostituiscono.
- [x] Compatibilità export v1 verificata con fixture sintetica derivata dal contratto originale, come alternativa esplicitamente ammessa in assenza di un export storico reale: completamenti, stelle e date preservati EN/IT. Import/riepilogo/ripresa nel browser e round-trip completo nei test. Il reset IT manuale rimane aperto nel primo criterio.
- [x] Verificare l'output statico con `pnpm --filter @pianio/web exec vite preview`, inclusi cataloghi, MusicXML e vecchi URL inglesi. Nessun deploy è necessario per questa verifica.
- [x] Documentare nel README selezione lingua, convenzioni, comandi e ripieghi; aggiungere `docs/ADDING-A-LANGUAGE.md` con un esempio completo per una terza lingua.
- [x] Collegato `check:i18n:full` al normale `pnpm build` dopo il completamento delle traduzioni e revisioni. Build valido passato; fixture isolata con obiettivo italiano mancante fallisce prima della generazione.
- [x] Rieseguire la matrice di verifica e registrare esiti, ambiente, eventuali limiti e prove manuali nel rapporto finale.

Verifica fase 7 del 16 ottobre, dopo il completamento: tutti gli otto comandi
superati, inclusi checker completo e build con gate full. UI 56/56, contenuti
11/11, MIDI 7/7, motore 4/4. Preview HTTP, confronti prestazionali e build negativo
editoriale documentati. Revisione testuale e campione visuale per tutti gli 80
corsi completati. Fixture v1 sintetica verificata senza cancellare dati reali.
Il primo criterio resta aperto per i flussi manuali non completati; il criterio
hardware resta aperto perché la simulazione non equivale a una tastiera reale.
Nessuna pubblicazione del sito.

## Comandi di verifica

Comandi esistenti, da eseguire nella radice del repository:

```sh
pnpm install --frozen-lockfile
pnpm typecheck
pnpm test
pnpm --filter @pianio/core-engine test
pnpm build
```

Comandi da introdurre nelle fasi precedenti:

```sh
pnpm check:i18n
pnpm test:ui
pnpm test:content
pnpm check:i18n:full
```

`test:content` eseguirà i test Node del generatore e dei validatori usando directory temporanee. `check:i18n:full` è richiesto per la consegna B; nella consegna A deve riportare le lacune attese, senza essere presentato come superato. La suite radice attuale `pnpm test` copre solo MIDI: tenere espliciti anche gli altri comandi fino a una loro eventuale aggregazione.

## Suddivisione proposta delle modifiche

| Unità | Contenuto | Dipendenza |
| --- | --- | --- |
| 1 | Baseline, inventario, glossario e fondazione i18n con test. | Nessuna |
| 2 | Messaggi strutturati, formato delle note e UI EN/IT. | 1 |
| 3 | Schema dei contenuti localizzati, generatore, validatore e corso pilota. | 1–2 |
| 4 | Caricatore, selettore e conservazione della sessione; consegna A. | 3 |
| 5 | Traduzioni e revisioni del Metodo. | 4 |
| 6 | Traduzioni e revisioni della Tecnica e dei Brani. | 5 |
| 7 | Verifica completa, documentazione e controllo bloccante; consegna B. | 6 |

Le unità identificano cambiamenti revisionabili; non implicano creazione automatica di commit, pull request o pubblicazioni.

## Rischi da verificare durante l'implementazione

| Rischio | Controllo previsto |
| --- | --- |
| Reset implicito cambiando catalogo o `scorePath`. | Identità stabile, dati musicali riutilizzati, ripristino esplicito del cursore e test di sessione. |
| UI italiana con catalogo precedente dopo richieste veloci. | Coordinamento della lingua attiva e esclusione delle risposte obsolete. |
| Catalogo mancante restituito come HTML da Firebase. | Validazione della risposta e ripiego testato. |
| Traduzioni presenti ma didatticamente scorrette o obsolete. | Glossario, revisione per lotti e rapporto delle modifiche al sorgente. |
| Maggior numero di file e dati duplicati nel build. | Misurare dimensioni e tempi prima/dopo; caricare nel browser soltanto il catalogo richiesto e conservare copie statiche per compatibilità. |
| Regressioni non coperte dal comando test attuale. | Matrice esplicita di suite MIDI, motore, UI e contenuti, più prove manuali. |

La parte tecnica è conclusa alla consegna A; il supporto italiano completo richiede anche traduzione, revisione e verifiche della consegna B.
