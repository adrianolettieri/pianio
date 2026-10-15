# Stato implementazione multilingua

Aggiornato il 15 ottobre 2026. Base di lavoro verificata: `37aef6c52825aaceadd8620dc6d97621c9e9aef8` (`37aef6c`, branch `feature/add_i18n_support`). Il checkout era pulito prima della fase 2. Nessun commit, push, PR o deploy. Le fasi 1–2 sono completate; la fase 2 aggiunge adattatori localizzati solo ai flussi di messaggi già migrabili, senza avviare la traduzione complessiva della UI.

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
| 0. Baseline e inventario | **Parziale** | Inventario stringhe e superfici in `I18N-INVENTORY.md`; glossario in `I18N-GLOSSARY-IT.md`; stato iniziale e misure. Il piano di riferimento è ora presente anche nel checkout. | Conteggi JSON/ID, filtro, generatore e ora build/typecheck di fase 1 verificati. | Eseguire install frozen e suite baseline; risolvere il comando `core-engine` incompatibile con Node 22.20.0 e acquisire una baseline completa. |
| 1. Fondazione | **Completata** | Registro condiviso `localization.config.json`; i18next/react-i18next e risorse EN/IT nei cinque namespace; selezione/persistenza lingua sicure; init prima del render, sincronizzazione `lang`/titolo/descrizione; checker e test UI. Solo metadati e fondazione, nessuna migrazione UI o progressi. | `check:i18n`, `test:ui` (9/9), `typecheck`, `build` superati. Chiavi inesistenti rilevate dal typecheck. | Nessuna nella fase 1. Il selettore e le migrazioni UI appartengono alle fasi successive. |
| 2. Messaggi strutturati e note | **Completata** | Codici MIDI, unione discriminata import, adattatori per MIDI/catalogo/spartito, descrittori UI renderizzati al cambio lingua e formatter C/Do. Campi inglesi transitori mantenuti. | Tutti i cinque comandi in “Verifica fase 2”; compatibilità export v1 verificata con fixture. | Migrare in fase 3 i chiamanti legacy annotati nell'inventario e ampliare le traduzioni UI. |
| 3. Traduzione dell'interfaccia | **Da fare** | Nessuna traduzione complessiva avviata. La fase 2 ha localizzato solo i messaggi strutturati previsti. | I controlli di fase 2 non equivalgono alla revisione manuale delle schermate EN/IT. | Migrare navigazione, catalogo, pratica, accessibilità e testi residui; rimuovere i campi inglesi transitori quando non usati. |
| 4. Pipeline dei contenuti | **Da fare** | Nessuna. | Nessuna. | Schema traduzioni, generatore/catalogo/spartiti localizzati e controlli di copertura. |
| 5. Cambio lingua completo | **Da fare** | Nessuna. | Nessuna. | Loader e cache catalogo, coordinamento del cambio e continuità della sessione. |
| 6. Traduzione di tutti i contenuti | **Da fare** | Nessuna. | Nessuna. | Coprire e revisionare gli 80 corsi e 1.557 esercizi sorgente, inclusi i 12 aggregati non visibili. |
| 7. Verifica finale e documentazione | **Da fare** | Nessuna. | Nessuna. | Revisione UI completa, prove manuali/hardware se disponibile, documentazione e chiusura della matrice di verifica. |

Per l'ordine e la nomenclatura operativa fare riferimento a `PIANO-IMPLEMENTAZIONE-MULTILINGUA.md`.
