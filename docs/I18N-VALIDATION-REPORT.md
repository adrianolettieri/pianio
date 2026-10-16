# Verifica finale multilingua — fase 7 e consegna B

Data: **15–16 ottobre 2026**, fuso di riferimento Europe/Rome. Fork
`https://github.com/adrianolettieri/pianio`, checkout
`/Users/adriano/Dev/codex/pianio/pianio`, HEAD iniziale `cc47eed` (Stage 6),
working tree inizialmente pulito. Nessun `AGENTS.md` trovato nel checkout o nei
parent esaminati. Letti piano, stato, inventario, glossario, contratti della
pipeline, registro di revisione e rapporto della continuità di sessione.

**Implementazione italiana completata; consegna B ancora con validazione finale
parziale.** Dopo la prima verifica sono stati tradotti e revisionati tutti i 5.427
campi rimasti in ripiego. Ora UI e contenuti obbligatori EN/IT sono disponibili,
il checker completo e tutta la matrice passano, e il build impone copertura e
revisioni correnti. È stato esaminato uno spartito italiano per ciascuno degli
80 corsi. Rimangono aperte le prove hardware MIDI e i flussi manuali specificati
sotto: il solo build verde non certifica la consegna B integralmente.
Nessun commit, push, pull request, deploy o pubblicazione del sito.

## Prerequisiti verificati e copertura

Nel codice sono disponibili registro EN/IT, risoluzione/persistenza sicura della
lingua, cinque namespace UI, messaggi strutturati e formatter note, migrazione
delle schermate attive, pipeline localizzata con revisioni, loader/cache e
coordinamento del cambio lingua delle fasi 1–5. Inventario e baseline della fase 0
sono disponibili; l'installazione iniziale dal lockfile resta una riserva storica:
questa verifica ha riusato le dipendenze presenti, senza reinstallarle.

La fase 6 è ora completa nel perimetro editoriale: **80 corsi / 1.557 esercizi**
sorgente, **6.069/6.069 campi italiani**, **zero ripieghi** e **80/80 revisioni
correnti**, nessuna mancante, pendente o obsoleta per i corsi. Il filtro applicativo
invariato rende visibili 68 corsi / 1.365 esercizi; anche i 12 aggregati nascosti
sono tradotti. Le 319 note licenza sorgente vuote non impongono testi inventati.

La prima matrice di questa fase aveva rilevato 642 campi tradotti e 146 segnalazioni
nel full: 73 coperture incomplete e 73 revisioni mancanti/pendenti. È un esito
storico reale, conservato nei log `final-02.log` e `matrix-final.json`; non descrive
il risultato finale dopo il completamento. I due conflitti 2A sono stati risolti
nel testo italiano sulla base dei dati musicali, senza modificare la sorgente EN.

Traduzioni e revisioni sono di **Codex**, senza revisione umana. Titoli propri
internazionali e crediti rimangono intenzionalmente invariati quando appropriato;
le descrizioni e istruzioni sono italiane. Nessuna stringa italiana preesistente
è stata sostituita; `git diff -- content` è vuoto. Metodo di revisione, chiarimenti
editoriali e campioni per tutti i corsi nel [registro](I18N-CONTENT-REVIEW.md).
[Snapshot della copertura finale](i18n-phase7/coverage-completion.json).

## Ambiente e matrice automatica

macOS 27.0.1 arm64, Node **22.20.0**, pnpm **10.18.3**, Vite **7.3.1**,
Vitest **5.0.4**. Il pnpm globale punta a una versione diversa: usato uno shim
in `/private/tmp/pianio-phase7-bin/pnpm` che esegue `corepack pnpm "$@"`, aggiunto
al PATH solo per i processi della verifica. Nessuna modifica a lockfile o dipendenze.

| Comando eseguito | Esito finale | Evidenza |
| --- | --- | --- |
| `pnpm check:i18n` | Superato, EN/IT e 5 namespace | [log](i18n-phase7/logs/completion-01.log) |
| `pnpm check:i18n:full` | Superato, 6.069/6.069 campi e 80 revisioni correnti | [log](i18n-phase7/logs/completion-02.log) |
| `pnpm test:ui` | 56/56, 10 file | [log](i18n-phase7/logs/completion-03.log) |
| `pnpm test:content` | 11/11 | [log](i18n-phase7/logs/completion-04.log) |
| `pnpm typecheck` | Superato | [log](i18n-phase7/logs/completion-05.log) |
| `pnpm test` | 7/7, suite MIDI soltanto | [log](i18n-phase7/logs/completion-06.log) |
| `pnpm --filter @pianio/core-engine test` | 4/4 | [log](i18n-phase7/logs/completion-07.log) |
| `pnpm build` | Superato, include checker completo, generazione e Vite | [log](i18n-phase7/logs/completion-08.log) |

[Matrice iniziale](i18n-phase7/matrix.json), [prima verifica parziale](i18n-phase7/matrix-final.json),
[matrice sui contenuti completi](i18n-phase7/matrix-completion.json).
I test dei contenuti verificano identità/ordine, dati musicali, escape XML, accordi,
doppio pentagramma, legature, valori puntati, swing, dinamiche, pedale e confronto
strutturale degli spartiti. Tutti i 1.557 MusicXML EN/legacy restano identici.
Il controllo della copertura non certifica da solo una traduzione didatticamente corretta.

## Problemi della baseline e correzioni

Baseline originale `df5526d` estratta in una directory temporanea con `git archive`,
senza cambiare branch o indice del checkout. Con lo stesso ambiente e le stesse
dipendenze installate: typecheck e MIDI **6/6** superati; comando motore originale
fallito per `--test-isolation=none` non supportato da Node 22. Il checkout corrente
contiene già la correzione della fase precedente e passa **4/4**. Log
[baseline typecheck](i18n-phase7/logs/baseline-typecheck.log),
[MIDI](i18n-phase7/logs/baseline-midi.log),
[motore](i18n-phase7/logs/baseline-core.log).
Gli avvisi Vite su import misto di `pianoSampler.ts` e chunk OSMD oltre 500 kB sono
presenti anche nel build della baseline; non sono regressioni della localizzazione.

Correzioni della fase 7:

- **Storage negato:** letture/scritture non protette di tema, strumenti e velocità
  esistevano già in `df5526d`, ma impedivano di rispettare il contratto multilingua
  con storage indisponibile. Introdotti `readPreference`/`savePreference`; UI e
  preferenze restano in memoria. Il nuovo test di integrazione aveva rilevato un
  `SecurityError` nella pratica dopo la prima correzione della sola shell: risolto
  anche quel percorso. I progressi persistenti richiedono comunque storage disponibile.
- **Import/export su profilo vuoto:** già nella baseline i pulsanti erano visibili
  soltanto dopo un completamento. Ora sono disponibili anche nello stato iniziale,
  riusando le stesse azioni; la notifica import è visibile anche per un export vuoto.
- **Selettore scuro:** regressione della UI i18n; `--panel` non esisteva e il ripiego
  bianco rendeva il testo chiaro poco leggibile. Usa ora il token di tema `--paper`.
- **Singolare italiano dei progressi:** la schermata mostrava “1 perfetti”. Ora il
  messaggio intero usa plurali e parametro `count`: “1 perfetto” / “2 perfetti”.
  Due prove di integrazione verificano il riepilogo al cambio EN→IT.
- **Estensione lingue:** selettore da registro/nomi lingua, risoluzione messaggi
  condivisa, tipi `Language` nei formatter e ripiego dello spartito basato sulla
  configurazione. Rimossi vincoli EN/IT nei punti attivi interessati senza duplicare
  schermate o logica musicale. Nessuna terza lingua attivata.
- **Build:** dopo il completamento editoriale, `check:i18n:full` precede la
  generazione; nessun errore viene ignorato e non ci sono cicli fra script.

Durante lo sviluppo un'opzione `exact` nei nuovi test RTL causava errori TypeScript:
rimossa e ripetuti typecheck/UI con successo. Il log del tentativo fallito resta
in `logs/final-05.log`; non è un problema della baseline né un esito finale positivo.

## Anteprima statica e richieste del browser

Avviato realmente:

```sh
pnpm --filter @pianio/web exec vite preview --host 127.0.0.1 --port 4173 --strictPort
node scripts/validate-static-preview.mjs
```

Il sandbox aveva negato il bind/HTTP localhost (`EPERM`); i processi necessari
sono stati eseguiti con escalation per il solo localhost. Nessun rifiuto di
approvazione ha impedito queste prove. Il server è stato arrestato al termine.

[Verifica HTTP ripetuta sui contenuti completi](i18n-phase7/logs/static-preview-completion.log): **3 cataloghi** leggibili,
ciascuno con 80 corsi / 1.557 esercizi; **4.671 MusicXML** caricati; **1.557 confronti
byte per byte** tra EN localizzato e vecchio URL inglese, tutti identici.
Lo script è ripetibile contro una preview già avviata e rifiuta host di produzione.

Una configurazione temporanea di Vite ha registrato esclusivamente gli URL
`/generated/` richiesti dal browser. Durante riavvio diretto in IT risultano
soltanto `/generated/it/catalog.json` e lo spartito IT corrente: nessun catalogo EN,
legacy o precaricamento di tutti gli spartiti. [Richieste osservate](i18n-phase7/browser-requests-it.txt).
Il cambio esplicito in EN carica la relativa variante; i test del loader verificano
anche cache/deduplicazione e assenza di preload per ciascuna lingua.
Entrambi i dizionari UI sono intenzionalmente inclusi nel bundle; i cataloghi non
sono importati nel codice JavaScript. Configurazione temporanea rimossa.

**Questa preview non è Firebase Hosting.** Non prova il suo rewrite SPA. Il caso
catalogo/score mancante restituito come **HTML con HTTP 200** è invece eseguito
nei test del loader/viewer, insieme a 404/503, JSON invalido, retry e doppio fallimento.

## Browser, prove di sessione e schermate

Browser controllato reale del Codex in-app browser, viewport **1280×900** e
**390×844**. Queste sono emulazioni di dimensione desktop/mobile, non prove su
telefono fisico o certificazioni di tutti i browser. Nessun mock è stato iniettato
nell'app aperta nel browser. Dove indicato sotto, i mock appartengono alle suite UI.

| Caso | Prova effettiva / esito |
| --- | --- |
| Catalogo e corso EN/IT | Browser: catalogo, 1A e pratica 1B, selettore, titoli, tooltip/nome accessibile dei controlli e avvisi di contenuto parziale. Dopo il completamento il catalogo italiano non ha avvisi di copertura parziale; i ripieghi restano verificati tramite fixture nei test. |
| Apertura diretta | Browser: URL di `single-c-pulse` e `whole-note-voyage`, anche con reload; score e UI corretti. Test: avvio fallito/recupero senza falso corso mancante. |
| Pratica iniziata e loop | Test di integrazione con MIDI simulato: posizione avanzata, errori, loop di sezione/automatico, velocità, riferimenti musicali e sottoscrizione conservati EN→IT→EN. Browser: controlli/pratica visualizzati; nessuna nota reale suonata. |
| Zoom e cursore | Browser: 115% mantenuto cambiando lingua. Test viewer: posizione 3 e cursore completato conservati senza nuovo evento MIDI, richieste OSMD obsolete escluse. |
| Anteprima | Browser: scelta EN durante anteprima IT rinviata con avviso, poi applicata al termine. Test: richieste multiple, nessun arresto audio introdotto e continuità dopo navigazione. Non certificata la qualità audio con hardware. |
| Count-in, esecuzione, risultati | Test con MIDI/audio simulati: rinvio durante count-in/playing, modalità e risultati mantenuti, callback obsoleti invalidati. Nel browser l'avvio è rimasto in attesa dell'accesso MIDI: **count-in/esecuzione/risultati reali non completati**. |
| Richieste lente/fuori ordine | Test: EN→IT→EN, ultimo intento prevalente, dati precedenti conservati; nessuna prova di throttling manuale dichiarata. |
| Catalogo IT mancante | Test: ripiego EN con UI italiana e avviso; doppio fallimento conserva la sessione e consente Retry. |
| Spartito IT mancante/HTML 200 | Test: ripiego allo spartito EN corrispondente, posizione/zoom, retry, errori render e caricamenti concorrenti. |
| Storage indisponibile | Test: letture/scritture negate, app avviabile, cambio EN→IT→EN, tema e velocità conservati in memoria. Non simulato tramite impostazioni del browser reale. |
| Diagnostica | Browser EN/IT: schermata, timestamp, sessione e controlli. Test: eventi, errori e numero richieste conservati. Accesso MIDI reale rimasto pendente, non equiparato a nessun dispositivo fisico disponibile. |
| Tastiera e scorciatoie | Browser: focus visibile del selettore, Tab verso diagnostica, R/freccia destra senza navigazione; regione score scorribile da tastiera. Test: selettore ed elementi modificabili proteggono una sessione già avanzata. |
| Note e layout | Browser: C4/Do4, viewport mobile e desktop, temi chiaro/scuro. Istruzione lunga 1B raggiungibile per intero: pagina 390 px, regione 368, contenuto 793, scroll massimo 425. Nessuna necessità di ridisegnare il viewer: la correzione della fase 5 era già presente. |
| Import/export/ripresa/reset | Browser e test descritti nella sezione seguente; reset manuale EN, reset automatico EN/IT. Il secondo tentativo di importazione manuale ha fallito nel file chooser del browser. |

Schermate raccolte:

- [Pratica EN desktop, zoom e focus](i18n-phase7/desktop-en.jpg).
- [Spartito IT lungo, mobile scuro, fine dell'istruzione raggiungibile](i18n-phase7/mobile-it-dark-long-score.jpg).
- [Mobile IT chiaro](i18n-phase7/mobile-it-light.jpg), [mobile EN chiaro](i18n-phase7/mobile-en-light.jpg).
- [Diagnostica IT desktop](i18n-phase7/diagnostics-it-desktop.jpg).
- [Progressi IT dopo importazione](i18n-phase7/progress-it-mobile.jpg),
  [ripresa EN](i18n-phase7/resume-en-mobile.jpg). Queste due schermate precedono
  l'ultima correzione del singolare “perfetto”, verificata nei test finali.

Dopo il completamento: esaminati **80 spartiti italiani, uno per ogni corso**,
scegliendo l'obiettivo più lungo di ciascuno. Venti schermate `scores-it-00.png`
fino a `scores-it-76.png`, quattro corsi per immagine; ID esatti nel
[manifest visuale](i18n-phase7/visual-course-samples.json) e collegamenti per corso
nel registro editoriale. OSMD del bundle di produzione, viewport 1280×900,
[harness tecnico](i18n-phase7/review-scores.html) separato da React. Estensione SVG
uguale al viewer per evitare il taglio delle istruzioni. Non sono prove di tutti
i 1.557 spartiti o di ogni combinazione di layout.

Nel viewer React è stata inoltre aperta direttamente la Sarabanda `m6d-001`,
nuovo obiettivo più lungo (178 caratteri), a 390×844 in chiaro/scuro. Pagina larga
390 px, regione 368 px, scorrimento massimo effettivo 1.310 px. Le frecce da
tastiera raggiungono la fine del testo senza cambiare esercizio; screenshot
[mobile italiano, testo finale in scuro](i18n-phase7/mobile-it-longest-dark.png).
Il tasto End scorre verticalmente: la prova orizzontale è stata eseguita con
ArrowRight. Nessuna nuova correzione del viewer necessaria.

Per ripetere il harness, dopo il build copiare temporaneamente il file HTML in
`apps/web/dist/.i18n-review.html`, sostituire `__OSMD_MODULE__` con il percorso
`/assets/vendor-osmd-<hash>.js` effettivamente prodotto, aprirlo in preview e
usare Successivi per i 20 gruppi. Il file temporaneo è stato rimosso prima della
consegna; il normale build non lo include. Preview arrestata e viewport ripristinato.
Schermata finale del [corso Tecnica 4B tradotto](i18n-phase7/course-it-complete.png).

## Compatibilità progressi versione 1 e protezione dei dati

Non trovato un export storico reale. Creata una **fixture sintetica**, derivata
dall'interfaccia `ProgressExport` e dalle chiavi presenti in `df5526d`:
[`progress-v1.baseline.json`](../apps/web/src/fixtures/progress-v1.baseline.json).
Contiene due completamenti reali per ID/slug di 1A, stelle 3/2 e date ISO
2025-01-01/02. Non contiene dati storici dell'utente.

Prima delle mutazioni browser eseguito **Export**: file JSON v1 scaricato, verificato
vuoto (0 completamenti, 0 stelle, 0 date) e copiato in
`/private/tmp/pianio-phase7-progress-backup.json`. Nessun dato reale inserito nelle
prove o pubblicato nei documenti. L'import IT della fixture ha mostrato 2 completati,
1 perfetto e link di ripresa al terzo esercizio `three-steps-up`; riepilogo e notifica
letti anche in EN. Reset con conferma in EN riuscito; infine verificata la schermata
vuota IT, semanticamente uguale al backup iniziale. Tema riportato a chiaro, lingua
IT iniziale conservata e viewport ripristinato.

Il secondo import tramite file chooser ha restituito un errore di nodo browser.
Un ulteriore tentativo dopo il completamento delle traduzioni ha riprodotto
`No node found for given backend id` durante `fileChooser.setFiles`:
non è dichiarato riuscito. Per questo reset IT manuale e secondo round-trip browser
restano aperti. I **test automatici** eseguono import/export via Blob/FileReader,
confrontano tutte le chiavi, completamenti, stelle e date, fanno reset e reimport
in entrambe le lingue e verificano che lingua/tema non siano cancellati.
Prima di questo nuovo tentativo è stato eseguito nuovamente Export e verificato
il backup v1 vuoto (0 completamenti/stelle/date), conservato in
`/private/tmp/pianio-phase7-progress-backup-completion.json`. Il tentativo fallito
non ha importato dati. Tema riportato a chiaro e lingua IT conservata.
La UI non mostra un elenco delle date storiche: la loro preservazione è verificata
nei dati riesportati, senza inventare una schermata di cronologia.

## Prestazioni e dimensioni

Confronto sullo **stesso host/runtime/dipendenze**: baseline `df5526d` estratta con
`git archive` in `/private/tmp/pianio-phase7-baseline`; collegati soltanto i
`node_modules` già installati. Nessun checkout/commit/worktree Git aggiuntivo.
Si controlla così l'effetto del codice e degli asset; non si pretende di ricreare
le versioni storiche delle dipendenze del lockfile della baseline.

Un build di riscaldamento per ciascuna variante, poi **tre esecuzioni alternate**
baseline/corrente senza browser attivo. `time.perf_counter`, processi sequenziali,
`pnpm generate:content` separato e `pnpm build` comprensivo della generazione;
byte logici dei file, non `du` allocato. Nessuna misura di prima installazione,
rete di produzione, download MIDI/audio o dispositivo mobile fisico.

| Misura | Baseline | Corrente | Variazione |
| --- | ---: | ---: | ---: |
| Generazione, mediana 3 esecuzioni | 0.4705 s | 1.0683 s | +127.1% |
| Build totale, mediana 3 esecuzioni | 3.3187 s | 5.0057 s | +50.8% |
| Output generato, byte | 22.333.244 | 68.736.499 | +207.8% |
| Output generato, file | 1.558 | 4.675 | +200.1% |
| Dist completo, byte | 24.152.375 | 70.644.591 | +192.5% |
| Assets JS/CSS, byte | 1.814.956 | 1.903.887 | +4.9% |


Il delta riguarda l'intera migrazione multilingua rispetto alla baseline originale,
non soltanto la fase 7. Cataloghi e spartiti esistono in tre famiglie: EN localizzato,
IT localizzato e copie EN legacy per compatibilità. Il rapporto di copertura aggiunge
un file. La duplicazione è quindi soprattutto contenuto statico, non tre download
iniziali del browser. La crescita JS/CSS comprende risorse UI e coordinamento i18n;
non è possibile attribuirla esclusivamente ai dizionari senza un esperimento diverso.
Il checker completo nel build finale è incluso nei tempi correnti. Rispetto alla
prima misura sui contenuti parziali (68.637.447 byte generati), completare tutti
i testi e le revisioni aggiunge 99.052 byte (+0,14%); i file sono gli stessi.

| Famiglia corrente | File | Byte |
| --- | ---: | ---: |
| `catalog.json` | 1 | 9.143.375 |
| `scores` | 1557 | 13.512.381 |
| `en/catalog.json` | 1 | 9.148.046 |
| `en/scores` | 1557 | 13.512.381 |
| `it/catalog.json` | 1 | 9.222.845 |
| `it/scores` | 1557 | 13.547.926 |
| `i18n-coverage.json` | 1 | 649.545 |


Dati grezzi, tutte le ripetizioni e limiti metodologici:
[performance.json](i18n-phase7/performance.json). Script ripetibile dalla radice:
`python3 docs/i18n-phase7/measure.py /percorso/assoluto/baseline`; richiede pnpm
corretto nel PATH e una baseline estratta con dipendenze disponibili. Non usare
misure singole di esecuzioni storiche con ambiente diverso per dedurre regressioni.

## Gate del build e aggiunta di lingue

Build corrente: `check:i18n:full → generate:content → web build`; `--full`
comprende i controlli ordinari e nessun checker richiama il build. Nessun ciclo.
Il build sui dati validi è passato nella matrice e nelle tre misure ripetute.

In una **copia temporanea isolata** del checkout completo è stato rimosso soltanto
`it/technique-level-6e/exercises.t6e-020.goal`. `pnpm build` termina con codice 1,
segnala il campo obbligatorio mancante e la revisione obsoleta e **non genera
output**. [Log negativo editoriale](i18n-phase7/logs/build-missing-editorial.log),
[fixture e SHA-256 originale invariato](i18n-phase7/negative-editorial.json).
Il file dell'utente non è stato mutato. Rimane anche la precedente prova negativa
su chiave UI mancante: [log](i18n-phase7/logs/build-missing-ui.log).
I test dei contenuti verificano inoltre copertura incompleta e impronte obsolete
con fixture valide/invalide. Nessun controllo aggirato o traduzione esclusa.

[README](../README.md) aggiornato con lingue, selezione/persistenza, ripieghi,
struttura, comandi e limiti. [ADDING-A-LANGUAGE.md](ADDING-A-LANGUAGE.md) descrive
registrazione ES, cinque dizionari, plurali, nomi note, overlay editoriali, revisione,
generazione e controlli, senza attivare ES. Il registro prodotto resta `en`, `it`.

## Criteri finali e attività residue

| Criterio | Stato |
| --- | --- |
| Fondazione UI EN/IT e pipeline disponibili | Implementate, verificate entro la matrice e i campioni descritti |
| Tutti i contenuti obbligatori italiani e revisionati | **Completato**: 6.069 campi e 80 revisioni testuali correnti; campione visivo per ogni corso |
| ID, URL, dati musicali e compatibilità progressi | Test e HTTP superati; fixture v1 esplicitamente sintetica |
| Tutti i controlli automatici richiesti riusciti | **Superati tutti e otto** nella matrice sui dati completi |
| Tutte le prove manuali obbligatorie riuscite | **Parziale**: mancano esecuzione reale, reset IT manuale; campioni dei corsi completati |
| Hardware MIDI: note, accordi, pedale | **Prova hardware non eseguita** |
| Gate completo nel build e prova negativa editoriale | **Completato**: gate full e build positivo/negativo editoriale verificati |
| Documentazione e procedura terza lingua | Disponibili; nessuna nuova lingua attivata |

Per chiudere la validazione B: completare conteggio/esecuzione/risultati nel
browser con MIDI operativo, provare note/accordi/pedale reali e la continuità della
connessione e della sessione durante i cambi lingua; completare il reset IT manuale
con un file chooser funzionante. Mock e test del contratto v1 sono superati, ma
non sostituiscono queste prove. Non rimangono campi italiani da tradurre.

Per la prova hardware: aprire la preview in un browser con Web MIDI operativo,
collegare una tastiera reale, concedere l'accesso e verificare nome/disconnessione/
riconnessione; in diagnostica provare note-on/off, accordi e CC64 del pedale;
poi pratica, loop, conteggio/esecuzione e risultati EN/IT, verificando durante i
cambi lingua MIDI, posizione/zoom, preferenze e progressi con backup o storage di
test. Registrare modello/dispositivo, browser, esiti e schermate. I mock delle suite
attuali non sostituiscono questa prova.
