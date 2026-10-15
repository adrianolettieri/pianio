# Stato implementazione multilingua

Aggiornato il 15 ottobre 2026. Base di lavoro verificata: `37aef6c52825aaceadd8620dc6d97621c9e9aef8` (`37aef6c`, branch `feature/add_i18n_support`). Il checkout era pulito prima della fase 2. Nessun commit, push, PR o deploy. Le fasi 1–2, 4 e 5 sono completate; le riserve storiche delle fasi 0/3 rimangono esplicite. Consegna A funzionalmente pronta per revisione locale con i limiti riportati nel rapporto corrente della fase 5. Le sezioni di baseline sotto conservano gli esiti storici; la verifica corrente della fase 5 e la successiva correzione della suite motore sono in fondo al documento.

## Baseline e ambiente

| Voce | Risultato |
| --- | --- |
| Stato Git iniziale | Pulito; nessuna modifica preesistente da sovrascrivere. |
| Istruzioni repo | Nessun `AGENTS.md` trovato nel repo o nelle directory parent esaminate. |
| Piano nel checkout | La baseline non conteneva il piano locale. Aggiunta in questa fase la copia di riferimento `docs/PIANO-IMPLEMENTAZIONE-MULTILINGUA.md`; sono state spuntate soltanto le attività della fase 1. |
| Node | `node --version` → `v22.20.0`. |
| pnpm richiesto | `package.json` fissa `pnpm@10.18.3`. |
| pnpm disponibile | `/opt/homebrew/bin/pnpm` punta a pnpm 11.21.0. `pnpm --version` è rimasto senza output; anche l'avvio dei comandi nel workspace è rimasto in attesa. Non è stato usato per modificare lockfile o dipendenze. |
| Risoluzione pnpm fissato | `COREPACK_HOME=/private/tmp/pianio-corepack corepack pnpm --version` ha fallito tentando `https://registry.npmjs.org/pnpm/-/pnpm-10.18.3.tgz`, con `getaddrinfo ENOTFOUND registry.npmjs.org`. La cartella temporanea è sotto `/private/tmp`. |
| Manifest pacchetti | Nessun campo `engines` dichiarato nei manifest del progetto. Il lockfile risolve Vite 7.3.1 con requisito Node `^20.19.0 || >=22.12.0`; Node 22.20.0 lo soddisfa. Il comando di test del motore è però incompatibile (vedi sotto). |
| Compatibilità core-engine | `node --help` mostra `--experimental-test-isolation=...`; `node --test --test-isolation=none packages/core-engine/src/practice.test.ts` termina con `node: bad option: --test-isolation=none`. Non sostituito l'argomento e non attribuito un esito positivo alla suite. |
| Modifiche dipendenze | Fase 1: `i18next`, `react-i18next`, Vitest, React Testing Library e jsdom aggiunti al pacchetto web. Manifest e lockfile aggiornati e verificati con pnpm 10.18.3. |

### Aggiornamento dopo la fase 1

Node `v22.20.0`; `corepack pnpm --version` → `10.18.3`. Il Corepack scaricato con accesso approvato ha reso disponibile il package manager fissato. Per aggirare il `pnpm` globale 11.21.0 in conflitto con `packageManager`, i comandi di verifica sono stati eseguiti con uno shim temporaneo in `/private/tmp` che delega a Corepack; non sono state modificate le impostazioni del package manager nel repository.

| Comando | Esito | Nota |
| --- | --- | --- |
| `pnpm check:i18n` | **Superato** | `en`, `it`; 5 namespace. Include fixture di risorse valide/invalide e plurali con categorie specifiche per lingua nei test UI. |
| `pnpm test:ui` | **Superato** | Vitest: 2 file, 9 test superati; copre normalizzazione, precedenze, memoria senza storage, inizializzazione/fallback, metadati e validatore. |
| `pnpm typecheck` | **Superato** | Comprende `i18n.typecheck.ts`: chiavi e namespace inesistenti sono errori TypeScript attesi. |

### Verifica fase 2

Eseguiti con pnpm 10.18.3 tramite lo shim temporaneo già descritto sopra; Node `v22.20.0`.

| Comando | Esito | Nota |
| --- | --- | --- |
| `pnpm test` | **Superato** | 7/7 test MIDI; copre tutti i codici di `describeMidiSupport` e conserva i test esistenti. Per rendere eseguibile la configurazione `types: ["node"]` del package, aggiunto `@types/node` al manifest `packages/midi-web` e al lockfile, riusando la versione già risolta. |
| `pnpm test:ui` | **Superato** | 6 file, 20/20 test; importazione successo/tre fallimenti, fixture export v1, storage mock, note MIDI 60/estremi/alterazioni/input invalido, Do sempre visibili, adattamento degli errori e cambio lingua del messaggio visibile senza ripetere l'operazione. |
| `pnpm check:i18n` | **Superato** | Risorse EN/IT valide nei cinque namespace. |
| `pnpm typecheck` | **Superato** | Web TypeScript, incluse le nuove firme e i descrittori. |
| `pnpm build` | **Superato** | Generazione contenuti e build Vite completate. Avvisi già presenti: import misto di `pianoSampler.ts` e chunk OSMD oltre 500 kB. |

Prove MIDI e storage eseguite con mock nei test automatici; nessuna prova con hardware MIDI reale è stata eseguita o dedotta.
| `pnpm build` | **Superato** | Generazione catalogo e build web completate. Vite segnala il pattern di import misto già presente per `pianoSampler.ts` e chunk OSMD >500 kB; i relativi file/configurazioni non sono stati modificati. La baseline senza build eseguibile non consente un confronto quantitativo precedente. |
| `pnpm test` (MIDI) e suite `core-engine` | **Non eseguite in questa fase** | Le configurazioni esistenti non sono state toccate. Il limite Node del comando `core-engine` riportato nella baseline resta da risolvere nella fase 0. |

Questi sono esiti della fase 1, non riscrivono retroattivamente i tentativi iniziali bloccati. Non sono state rilevate regressioni nei controlli richiesti.

## Comandi richiesti

I comandi pnpm sono stati avviati esattamente come richiesto. L'installazione è rimasta senza output e è stata interrotta; i controlli successivi, ciascuno con un limite diagnostico di 10 secondi, sono rimasti senza output e sono terminati per timeout. L'ambiente non dispone del package manager fissato e Corepack non può scaricarlo per il blocco DNS.

| Comando | Esito osservato | Causa / nota |
| --- | --- | --- |
| `pnpm install --frozen-lockfile` | Non completato; nessun output, interrotto dopo l'attesa. | pnpm 10.18.3 non disponibile; pnpm globale 11.21.0 non è stato usato per installare. Dipendenze non installate in questa esecuzione. |
| `pnpm typecheck` | Timeout dopo 10 s, nessun output. | Blocco all'avvio del pnpm incompatibile, quindi typecheck non eseguito. |
| `pnpm test` | Timeout dopo 10 s, nessun output. | Blocco all'avvio del pnpm; test MIDI non eseguito. |
| `pnpm --filter @pianio/core-engine test` | Timeout dopo 10 s, nessun output. | Blocco all'avvio del pnpm; inoltre il sottocomando Node dichiarato nel pacchetto non è compatibile con Node 22.20.0. |
| `pnpm build` | Timeout dopo 10 s, nessun output. | Blocco all'avvio del pnpm, build web non eseguita. |
| `node scripts/generate-content.mjs` | Completato in `0,31 s` (misura `/usr/bin/time -p`). | Misura diretta dello script, non equivale al `pnpm build`. Nessuna prova hardware eseguita. |

Il timeout non è un errore dei controlli di codice: essi non sono arrivati a partire. Non sono stati dichiarati test, typecheck o build riusciti.

## Contenuti e misure

Conteggi ottenuti leggendo e analizzando direttamente tutti i `content/**/course.json`, controllando gli ID esercizio per corso e confrontando il filtro effettivo di `App.tsx` (`/^(method|technique)-level-\d+$/`).

| Misura | Valore |
| --- | ---: |
| JSON corso sorgente | 80 |
| Esercizi nei sorgenti | 1.557 |
| ID esercizio duplicati nel corso (`courseId/id`) | 0 |
| Catalogo generato prima del filtro | 80 corsi / 1.557 esercizi |
| Catalogo visibile dopo il filtro | 68 corsi / 1.365 esercizi |
| Corsi aggregati esclusi | 12: ID `method-level-N` e `technique-level-N` senza suffisso A–E; sono i corsi aggregatori dei livelli e il filtro opera per ID, non per contenuto. |
| Generazione diretta | 0,31 s; 1.558 file generati (1 catalogo + 1.557 spartiti MusicXML). |
| Catalogo JSON | 8.820.863 byte. |
| Spartiti MusicXML | 13.512.381 byte complessivi. |
| Output generato complessivo | `du -sh apps/web/public/generated` → 24 MiB (misura allocata/arrotondata dal filesystem). |
| Build web | Non misurabile: `pnpm build` non è partito, nessun output build prodotto/verificato. |

L'output generato è ignorato da Git e la generazione non ha modificato file versionati. I conteggi coincidono con la baseline attesa; non sono stati forzati.

## Fasi 0–7

Stati: **completata** = risultato verificabile disponibile; **parziale** = parte della fase completata, parte ancora necessaria; **da fare** = non avviata.

| Fase | Stato | Modifiche / risultati | Verifiche eseguite | Attività residue |
| --- | --- | --- | --- | --- |
| 0. Baseline e inventario | **Parziale** | Inventario stringhe e superfici in `I18N-INVENTORY.md`; glossario in `I18N-GLOSSARY-IT.md`; stato iniziale e misure. Il piano di riferimento è ora presente anche nel checkout. | Conteggi JSON/ID, filtro, generatore e ora build/typecheck di fase 1 verificati. | Resta da documentare install frozen e chiusura completa della baseline. Compatibilità Node/pnpm e comando core-engine ora verificati, 4/4 test. |
| 1. Fondazione | **Completata** | Registro condiviso `localization.config.json`; i18next/react-i18next e risorse EN/IT nei cinque namespace; selezione/persistenza lingua sicure; init prima del render, sincronizzazione `lang`/titolo/descrizione; checker e test UI. Solo metadati e fondazione, nessuna migrazione UI o progressi. | `check:i18n`, `test:ui` (9/9), `typecheck`, `build` superati. Chiavi inesistenti rilevate dal typecheck. | Nessuna nella fase 1. Il selettore e le migrazioni UI appartengono alle fasi successive. |
| 2. Messaggi strutturati e note | **Completata** | Codici MIDI, unione discriminata import, adattatori per MIDI/catalogo/spartito, descrittori UI renderizzati al cambio lingua e formatter C/Do. Campi inglesi transitori mantenuti. | Tutti i cinque comandi in “Verifica fase 2”; compatibilità export v1 verificata con fixture. | Migrare in fase 3 i chiamanti legacy annotati nell'inventario e ampliare le traduzioni UI. |
| 3. Traduzione dell'interfaccia | **Parziale** | Aggiunte risorse UI EN/IT; migrati navigazione attiva, viste di catalogo/corso/progressi, controlli e risultati di pratica, diagnostica, tastiera e spartito. Rimosso `ProgressImportResult.message`; timestamp diagnostici formattati con locale corrente. Mappature esplicite per mani/chiavi, categorie e provenienza. | Checker dizionari, typecheck diretto, 21 test UI (inclusi cambio lingua con notifica visibile e conteggi 0/1/plurale), 7 test MIDI e build eseguiti con binari locali. Ricerca statica dei componenti attivi: nessun copy inglese residuo oltre a marchi, sigle e termini musicali. Revisione visiva non eseguita: Vite riceve `listen EPERM` dal sandbox. `pnpm` resta bloccato senza output anche su `--version`; usati i binari locali equivalenti. | Provare visivamente entrambe le lingue quando la porta locale è disponibile; completare la mappa della politica delle fonti se la UI inizierà a mostrarla. Non avviare la fase 4. |
| 4. Pipeline dei contenuti | **Completata** | Schema parziale/locale compatibile, validazione runtime JSON rigorosa, moduli importabili, cataloghi/score EN/IT e legacy, copertura per campo e registro SHA-256. Solo `method-level-1a`: 20 esercizi, 82/82 campi revisionati. | 11 test contenuti; checker ordinario, 21 test UI, 7 test MIDI, typecheck e build superati; ispezione OSMD di due spartiti. Full fallito atteso (79 corsi). Problemi motore preesistenti confermati. | Traduzioni restanti in fase 6; overflow degli obiettivi su vista stretta da considerare nel viewer fasi 5/7. React/selector non modificati. |
| 5. Cambio lingua completo | **Completata** | Loader validato/cache/deduplicazione, coordinatore UI/contenuti, selettore, differimento audio, riferimenti musicali canonici e viewer con ripristino/ripiego. | 48 test UI, 11 contenuti, 7 MIDI; checker, typecheck e build superati; browser desktop/mobile. | Prova MIDI fisica ancora da eseguire. Suite motore successivamente corretta e superata (4/4). |
| 6. Traduzione di tutti i contenuti | **Da fare** | Nessuna. | Nessuna. | Coprire e revisionare gli 80 corsi e 1.557 esercizi sorgente, inclusi i 12 aggregati non visibili. |
| 7. Verifica finale e documentazione | **Da fare** | Nessuna. | Nessuna. | Revisione UI completa, prove manuali/hardware se disponibile, documentazione e chiusura della matrice di verifica. |

Per l'ordine e la nomenclatura operativa fare riferimento a `PIANO-IMPLEMENTAZIONE-MULTILINGUA.md`.


## Verifica corrente — fase 4 (15 ottobre 2026)

Base effettiva di questa esecuzione: `d89d19d` (Stage 3), fork
`https://github.com/adrianolettieri/pianio`; checkout iniziale pulito. Nessun `AGENTS.md`
locale trovato. Letti piano, inventario e glossario; verificati registro condiviso,
contratti esistenti, checker, migrazioni UI e test delle fasi precedenti. Conservati
sorgenti inglesi, React, motore e tutto il lavoro delle fasi 0–3. Nessun commit, push,
PR o deploy. I riferimenti a vecchi hash e blocchi di ambiente sopra sono storici.

Dettagli completi: [contratti, verifiche e handoff](I18N-CONTENT-PIPELINE.md).

| Verifica | Esito corrente |
| --- | --- |
| Ambiente | Node 22.20.0; pnpm 10.18.3 tramite lo shim Corepack temporaneo già disponibile. Nessuna installazione necessaria o modifica al lockfile. |
| `pnpm check:i18n` | Superato: dizionari UI e file contenuti presenti validi; copertura per corso. |
| `pnpm test:content` | Superato, 11/11: fixture musicali/strutturali, validazione, ripiego, revisione e cataloghi reali. Output dei test sempre temporaneo. |
| `pnpm test:ui` | Superato, 21/21 in 6 file. |
| `pnpm typecheck` | Superato. |
| `pnpm build` | Superato: cataloghi/score EN/IT e copie legacy; avvisi Vite preesistenti su import misto e chunk OSMD. |
| `pnpm test` | Superato, 7/7 MIDI. |
| Suite core-engine dichiarata | Fallisce all'avvio per opzione Node `--test-isolation=none` incompatibile. |
| Suite core-engine con opzione Node 22 compatibile | 0/4 superati: le attese preesistenti non includono `velocityScore: null`/`pedalScore: null`. File del motore identici a HEAD; nessuna correzione musicale estranea alla fase 4. |
| `pnpm check:i18n:full` | **Fallito atteso**: 158 segnalazioni, ossia 79 corsi incompleti + 79 revisioni mancanti. Non dichiarato superato. |

Copertura: 80 corsi / 1.557 esercizi; soltanto il pilota è italiano, 20 esercizi e
82/82 campi, revisione corso/lotto corrente. Totale campi da tradurre 6.069 (escluse
319 note licenza sorgente vuote), di cui 5.987 ancora in ripiego; nessuna revisione
obsoleta presente. Il registro persistente confronta SHA-256 di sorgente e traduzione;
il generatore non aggiorna approvazioni. Build ordinario compatibile con consegna A.

Verifica **testuale**: rivisti i 20 esercizi con glossario e sorgente, inclusi obiettivi,
mani/registro, valori ritmici, pause, metrica e note licenza. Testati escape e accenti;
confrontati strutturalmente gli XML del pilota e la fixture ricca con il renderer
precedente. Tutti i 1.557 vecchi spartiti inglesi sono identici byte per byte a EN.

Verifica **visiva**: OSMD ha caricato i MusicXML italiani di `single-c-pulse` e
`bass-c-position` in un harness locale separato da React. A 1280×900 titoli, obiettivi,
notazione e credito sono leggibili; nella vista stretta a 538 px l'obiettivo lungo
supera l'area visibile. Non è dichiarata una revisione mobile superata. Screenshot in
`docs/i18n-phase4/`; harness riproducibile `scripts/test/preview-score.html`.
Il server localhost è stato avviato con escalation autorizzata dopo `listen EPERM`,
poi arrestato; la copia HTML temporanea nell'app è stata rimossa.

Output verificato: `/generated/{en,it}/catalog.json`, relativi `scores/`, copie EN
agli URL legacy e `i18n-coverage.json`; 4.675 file, 68.624.064 byte. Nessun output
pubblico cancellato dai test. Nessuna prova MIDI fisica eseguita.

La fase 5 riceve `locale`, `coverage`, `scorePath`, ID/ordine stabili e dati musicali
identici; deve coordinare caricamento e UI e preservare i riferimenti musicali dopo
il parsing JSON. Non è stata avviata. La consegna A non è ancora dichiarata pronta:
restano fase 5 e verifiche UI precedenti; la consegna B richiede gli altri 79 corsi.


## Verifica corrente — fase 5 (15 ottobre 2026)

Base effettiva `d226c36` (Stage 4), fork `adrianolettieri/pianio`, checkout iniziale
pulito. Nessun `AGENTS.md` nei parent/checkout. Prerequisiti verificati nel codice:
registro/preferenze/documento, messaggi strutturati, dizionari UI, cataloghi localizzati,
metadati/revisioni e pilota della fase 4. Conservati contenuti, motore, dipendenze,
progressi e contratti. Nessun commit, push, PR o deploy; fase 6 non avviata.

Implementazione, criteri A, matrice test e limiti: [rapporto della fase 5](I18N-LANGUAGE-SESSION.md).

- Loader con validazione runtime, HTML 200, errori/retry, cache/deduplicazione e filtro
  non mutante. Identità/ordine verificati tra lingue; musica canonica riusata.
- UI/catalogo applicati insieme, risposte obsolete scartate, ripiego EN spiegato in
  italiano, doppio fallimento recuperabile senza perdere dati o mostrare corsi mancanti.
- Selettore desktop/mobile/esercizio, preferenza e metadati documento; scorciatoie
  protette; pannello conservato con matcher, MIDI, errori, modalità, velocità, loop e risultati.
- Scelta differita durante anteprima/conteggio/esecuzione e durante audio ancora
  programmato dopo navigazione; callback obsoleti invalidati. Nessuna pausa introdotta.
- Spartito: ripristino immediato di zoom/cursore senza nuove note, isolamento dei
  caricamenti, ripiego inglese esplicito e retry; istruzioni lunghe scorrevoli su mobile.

Esiti finali: `check:i18n`, `test:ui` **48/48** (10 file), `test:content` **11/11**,
`typecheck`, `test` MIDI **7/7**, `build` superati. Node 22.20.0 / pnpm 10.18.3.
Il comando dichiarato `core-engine` inizialmente falliva per opzione Node incompatibile;
con l’opzione compatibile risultavano **0/4** per attese obsolete su due campi null.
La correzione successiva riportata sotto risolve entrambi i problemi: **4/4 superati**.
Logica del motore invariata; aggiornati soltanto script e aspettative. Avvisi build
preesistenti invariati.

Browser reale: catalogo/corso/pratica/progressi/diagnostica, selettore, pilota React/OSMD,
cambio EN/IT, zoom, tastiera e anteprima; 1280×900 e 390×844. Prove in
`docs/i18n-phase5/`. Continuità MIDI/audio avanzata e risultati sono provati con mock:
**nessuna tastiera MIDI fisica disponibile/verificata**; prova reale ancora da eseguire.

**Consegna A funzionalmente pronta per revisione locale**: criteri UI/pilota/copertura
parziale/continuità soddisfatti entro le prove descritte. Resta esplicita la verifica hardware
mancante; non si dichiara una certificazione
integrale delle fasi 0–5 o della fase 7. Copertura invariata: pilota 20 esercizi,
82/6.069 campi italiani; 5.987 campi e 79 corsi / 1.537 esercizi in ripiego.


## Correzione successiva — suite core-engine

Su richiesta esplicita dell’utente, corretto `packages/core-engine/package.json`:
lo script usa `node --test src/practice.test.ts`, senza il flag incompatibile.
Aggiornate le quattro aspettative in `src/practice.test.ts` con `velocityScore: null`
e `pedalScore: null`, coerenti con il contratto già implementato e con fixture
senza valutazione della dinamica o del pedale. Nessuna modifica a `src/index.ts`.

`pnpm --filter @pianio/core-engine test`: **superato, 4/4**, Node 22.20.0 e pnpm
10.18.3. Rimossi quindi i limiti correnti relativi alla suite motore; conservati
gli esiti storici delle fasi precedenti. La prova MIDI fisica rimane da eseguire.
Nessun commit, push, PR o deploy.
