# Cambio lingua e continuità della sessione — fase 5

15 ottobre 2026, fork `adrianolettieri/pianio`, base `d226c36` (Stage 4).
Checkout iniziale pulito; nessun `AGENTS.md` nel checkout o nei parent. Letti piano,
stato, glossario e contratto della pipeline. Nessun commit, push, PR o deploy;
nessuna traduzione aggiunta al catalogo e fase 6 non avviata.

## Contratto runtime

`content/catalogLoader.ts` richiede `/generated/{en,it}/catalog.json`. Valida oggetto,
locale richiesta, data, corsi/esercizi, ID/slug sicuri e unici, conteggi, copertura,
licenze, note MIDI/accordi, durate, metrica, dinamiche, pedale e percorsi esatti dello
spartito. Accetta anche la chiave legacy `GF` effettivamente presente nei dati.
HTTP non riuscito, JSON malformato e HTML 200 falliscono prima della cache.
Le richieste simultanee della stessa lingua condividono la promessa; soltanto i
risultati validi entrano in cache e un fallimento permette un nuovo tentativo.

La prima lingua valida stabilisce identità/ordine dei corsi/esercizi e musica
canonica. Le lingue successive devono coincidere; differenze vengono rifiutate.
`expectedNotes` e `timeSignature` riusano i riferimenti canonici anche dopo parsing
separati. Il filtro dei 12 aggregati restituisce un nuovo catalogo con nuovo array:
la cache completa mantiene tutti gli 80 corsi. Restano visibili 68 corsi / 1.365 esercizi.
La cache dura per la vita della pagina; non viene aggiunto storage dei cataloghi.

`LanguageProvider` distingue:

- `requestedLanguage`: ultima preferenza, persistita subito tramite l’helper esistente;
- `activeLanguage`: lingua confermata dell’interfaccia;
- `contentLanguage`: lingua del catalogo effettivamente caricato;
- `pending` e `deferred`: caricamento/scelta in attesa dell’attività audio.

Una revisione monotona scarta risultati e fallimenti obsoleti. Prima si caricano e
validano i dati, poi si applicano dizionari già inclusi nel bundle e catalogo nella
stessa applicazione React. Il catalogo precedente resta disponibile durante il
caricamento e dopo un doppio fallimento. In quest’ultimo caso la UI attiva resta
quella precedente e compare un errore con pulsante Riprova. Senza dati iniziali si
mostra caricamento/errore recuperabile, anche entrando direttamente in un esercizio;
non si deduce che il corso sia inesistente da una richiesta fallita.

Se IT fallisce e EN riesce, la UI diventa italiana, `contentLanguage` è `en` e un
messaggio italiano spiega il ripiego. Il selettore rimane utilizzabile mentre una
scelta è pendente e mostra sempre l’ultima richiesta. `lang`, titolo e descrizione
riusano la sincronizzazione della fondazione; i titoli di progressi/diagnostica sono
ora localizzati e si aggiornano anche quando non cambia la rotta.

## Sessione e attività audio

Il pannello ha come identità soltanto `course.id/exercise.id`. Il cambio lingua non
lo smonta e non azzera catalogo, matcher, modalità, velocità, loop, errori o risultati.
La sequenza di pratica è memoizzata sulla musica canonica; il timer auto-loop non
riparte per nuovi testi. La sottoscrizione MIDI dipende ancora soltanto dall’accesso,
quindi cambiare lingua non provoca richieste né nuove sottoscrizioni MIDI.

Il pannello acquisisce un token di attività prima di inizializzare audio/anteprima/
esecuzione. Il token copre anteprima, conteggio e riproduzione fino alla conclusione
prevista dall’app (incluse le code già esistenti di 800/1.500 ms). I dati possono
caricarsi intanto, ma si applica soltanto l’ultima scelta quando tutti i token sono
rilasciati. Nessuna pausa e nessun arresto audio sono associati al cambio lingua.

Navigazione/smontaggio: l’anteprima o l’audio già programmato conservano il token
fino alla loro conclusione naturale, anche nella nuova schermata. I callback non
aggiornano un pannello smontato né registrano vecchi risultati. Un conteggio abbandonato
rilascia il token e i suoi callback non possono iniziare la vecchia esecuzione.
Gli arresti/reset già presenti invalidano la rispettiva esecuzione; se l’audio era
già programmato, il token resta fino alla fine. Il rilascio è idempotente.

Le scorciatoie escludono `SELECT`, input, textarea, pulsanti, elementi modificabili
(anche discendenti), textbox e area scorrevole dello spartito. Le frecce e R del
selettore non navigano né reimpostano la pratica. Il controllo nativo conserva la
navigazione da tastiera e l’etichetta accessibile anche quando nascosta su mobile.

## Spartito

Ogni caricamento possiede un host OSMD separato e un AbortController; i caricamenti
obsoleti non possono sostituire il DOM corrente. Vengono rifiutati HTML/XML non
musicali, risposte HTTP fallite ed errori del renderer. Il ripiego IT → EN usa
esattamente lo stesso corso/slug, con messaggio esplicito e pulsante per riprovare IT.
Se fallisce anche EN compare un errore recuperabile. Durante il caricamento il vecchio
spartito è nascosto per evitare istruzioni linguistiche obsolete visibili come attuali.

Dopo rendering e costruzione della mappa del cursore, si ripristinano subito zoom
e posizione dall’ultimo stato della sessione; non occorre una nuova nota. Lo stesso
ripristino vale per ripiego, resize e zoom. A esercizio completato il cursore resta
nascosto anche dopo un nuovo rendering.

OSMD può disegnare un obiettivo oltre il viewBox SVG. Il viewer estende il viewport
alla misura effettiva del disegno, senza scalare le note, e offre scorrimento
orizzontale focalizzabile con istruzione mobile localizzata. Verificato a 390 px:
pagina larga 390 px; area spartito 368 px, contenuto scorrevole 820 px. Il testo React
rimane interamente a capo. Non vengono modificati MusicXML o dati musicali canonici.

## Prove automatiche

`pnpm test:ui`: 48 test complessivi in 10 file, inclusi i 21 precedenti.

- Loader: cache/deduplicazione, filtro non mutante, riferimenti musicali canonici,
  HTTP/JSON/HTML 200, lingua errata, retry, ID duplicati/insicuri, percorsi esterni,
  musica/copertura malformate, identità/ordine fra lingue e cataloghi reali della fase 4.
- Coordinatore: EN→IT→EN con risposte fuori ordine, applicazione UI/contenuti,
  preferenza/documento, ripiego EN con UI italiana, doppio fallimento/recupero,
  ultima scelta durante più attività contemporanee.
- App/pannello reali con trasporto MIDI e audio simulati: matcher già avanzato,
  errori, velocità, loop di sezione, timer auto-loop, connessione/sottoscrizione e
  numero di richieste MIDI; selettore/frecce/R/elementi modificabili; modalità e
  risultati di esecuzione; scelta differita durante anteprima, conteggio e playing;
  applicazione al termine; navigazione durante anteprima/conteggio; diagnostica con
  eventi, conteggio richieste ed errore persistente; avvio diretto con errore e retry;
  doppio fallimento senza smontare il pannello e messaggio italiano di ripiego.
- Viewer con OSMD simulato: cursore avanzato e zoom dopo cambio senza nuovo MIDI;
  caricamento obsoleto; cursore completato; HTML 200, errore di rendering,
  doppio fallimento e retry dello spartito mantenendo la posizione.

I mock audio verificano coordinamento e timer, non certificano l’audio fisico.
Le prove MIDI simulate non sostituiscono una tastiera reale con note/accordi/pedale.

## Prove browser

Build statico servito da Vite preview su `127.0.0.1:4173`, nessun deploy. Dopo il
blocco `listen EPERM` nel sandbox è stato consentito il solo avvio localhost.
Browser in-app, viewport desktop 1280×900 e mobile 390×844 (anche vista iniziale 538 px).

Verificati selettore presente/accessibile, EN/IT e preferenza dopo reload, catalogo,
corso pilota, progressi e diagnostica; pilota italiano nei testi React e nelle
istruzioni OSMD reali. Cambiato EN/IT nella schermata di esercizio, verificati zoom,
frecce/R sul selettore e scelta pendente durante anteprima, seguita dall’applicazione
italiana alla fine. Verificata navigazione orizzontale da tastiera nello spartito
senza cambiare rotta. Conteggi UI residui, etichetta reset/errori e titoli documento
corretti; completate mappe categorie e chiave `GF` e nomi accessibili dei pager.

Prove: [desktop](i18n-phase5/pilot-desktop.jpg), [mobile](i18n-phase5/pilot-mobile.jpg).
Il browser non è stato usato per richiedere permessi MIDI o certificare hardware.
La continuità durante pratica già avanzata/esecuzione è verificata automaticamente
con eventi simulati; l’ispezione OSMD reale copre rendering e cambio dello spartito.

## Consegna A e limiti

| Criterio funzionale A | Esito |
| --- | --- |
| UI EN/IT, selettore desktop/mobile/esercizio | Verificato sulle superfici attive, con test automatici e controlli browser mirati. |
| Pilota italiano, catalogo e istruzioni spartito | Verificato; 20 esercizi, 82/82 campi revisionati della fase 4. |
| Copertura parziale esplicita | Avviso globale derivato dai metadati, avviso del corso con campi in ripiego e messaggi separati per catalogo/spartito non disponibili. |
| Continuità della sessione e differimento | Verificati con pannello reale, eventi MIDI/audio simulati, viewer simulato e prove browser mirate. |

**Consegna A funzionalmente pronta per revisione locale**, con i limiti dichiarati:
la prova con tastiera MIDI fisica rimane da eseguire. Il problema preesistente della
suite `core-engine` è stato corretto nel seguito della fase: 4/4 test superati. Non viene dichiarata una certificazione complessiva di
tutte le fasi 0–5 né una verifica hardware completata. Le caselle storiche delle
fasi 0/3 non vengono chiuse retroattivamente sulla base di prove soltanto mirate.

Copertura invariata: IT 82/6.069 campi, 5.987 campi in ripiego; 79 corsi / 1.537
esercizi sorgente ancora inglesi. Nessuna traduzione della fase 6. Il controllo
completo non è un criterio della consegna A e non è collegato al build.

Ambiente corrente: Node 22.20.0, pnpm 10.18.3 tramite lo shim Corepack temporaneo.

| Comando | Esito finale |
| --- | --- |
| `pnpm check:i18n` | Superato, UI e contenuti parziali validi. |
| `pnpm test:ui` | Superato, 48/48, 10 file. |
| `pnpm test:content` | Superato, 11/11. |
| `pnpm typecheck` | Superato. |
| `pnpm test` | Superato, 7/7 MIDI. |
| `pnpm --filter @pianio/core-engine test` | Superato, 4/4 su Node 22.20.0 dopo la correzione successiva dello script e delle aspettative. |
| Diagnostica motore precedente alla correzione | Il flag incompatibile impediva l’avvio; usando il flag sperimentale emergevano 4 aspettative obsolete prive di `velocityScore: null`/`pedalScore: null`. Problemi ora risolti. |
| `pnpm build` | Superato; avvisi preesistenti di import misto `pianoSampler` e chunk OSMD >500 kB. |

Nessuna modifica a dipendenze/lockfile, logica del motore, storage progressi/export v1, sorgenti
musicali, traduzioni o approvazioni editoriali. Il server di verifica viene arrestato
al termine; screenshot e documentazione sono conservati nel checkout.

### Correzione successiva della suite motore

Su richiesta dell’utente, rimosso `--test-isolation=none` dallo script del pacchetto:
`node --test src/practice.test.ts` funziona con Node 22.20.0. Allineate le quattro
aspettative di riepilogo al contratto esistente, includendo `velocityScore: null` e
`pedalScore: null` quando dinamica/pedale non vengono valutati. Nessuna modifica alla
logica musicale. Comando ufficiale rieseguito: **4/4 superati**. Gli esiti negativi
delle fasi precedenti rimangono registrazioni storiche.
