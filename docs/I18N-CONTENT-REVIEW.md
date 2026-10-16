# Registro di revisione dei contenuti — completamento italiano

Aggiornato il 16 ottobre 2026. **6.069/6.069 campi obbligatori italiani, 80/80 corsi,
1.557 esercizi; zero ripieghi, revisioni mancanti, pendenti o obsolete per i corsi.**
I conteggi derivano dai sorgenti e dal rapporto generato, non da un elenco escluso
dal checker. Le 319 note licenza vuote nella sorgente non richiedono testi inventati.

La prima verifica della fase 7 aveva confermato lo stato incompleto ereditato dalla
fase 6: 642 campi, 5.427 ripieghi, 7 corsi completi, 1 parziale e 72 assenti.
Dopo la richiesta di completamento sono stati tradotti i 5.427 campi mancanti:
Metodo 2A–6E e aggregati, tutti i corsi di Tecnica e le otto raccolte di Brani.
Nessun valore italiano preesistente è stato sostituito. Nessun JSON canonico sotto
`content/` è cambiato; ID, slug, ordine, note, durate, metrica, dinamiche, pedale,
crediti e identificativi delle licenze rimangono invariati.

## Metodo e limiti della revisione

Traduzione e controllo testuale eseguiti da **Codex**, confrontando titolo,
descrizione, obiettivo e note di licenza con il glossario e con mani, chiave,
altezze, durate, metro, dinamiche e pedale dei dati musicali. Il registro
`content-locales/review-registry.json` conserva le impronte SHA-256 correnti e
il lotto di ogni corso. L'azione esplicita di revisione segue la verifica testuale;
checker e generatore non approvano automaticamente le traduzioni.
**Non è una revisione umana o una certificazione didattica indipendente.**

Nomi propri di brani senza un titolo italiano convenzionale sicuro (per esempio
Amazing Grace, Greensleeves, Oh! Susanna), autori/crediti, MIDI, BPM e simboli
musicali standard restano intenzionalmente invariati. Non sono ripieghi: i campi
sono presenti e le descrizioni/istruzioni circostanti sono italiane.

Controllo visivo effettivamente eseguito: **uno spartito per ciascuno degli 80
corsi**, selezionando l'obiettivo italiano più lungo del corso. OSMD del bundle
corrente, viewport desktop 1280×900, acquisizione dell'intera pagina, gruppi di
quattro. Il [harness](i18n-phase7/review-scores.html) è separato da React e riproduce
l'estensione del viewport SVG di `ScoreViewer.fitInstructions`; non accede a
storage o MIDI. I testi che superano la larghezza originaria restano interamente
esposti. Le immagini e gli ID sono elencati sotto. Non si afferma di avere
ispezionato visivamente tutti i 1.557 spartiti o tutti i dispositivi.

Nel viewer React è stato verificato anche il nuovo obiettivo più lungo in assoluto
(`m6d-001`, 178 caratteri): a 390×844 la pagina resta larga 390 px, la regione
misura 368 px e scorre fino a 1.310 px; il testo finale è raggiungibile da tastiera.
Tema scuro e chiaro provati. Il precedente campione lungo 1B e zoom EN/IT sono
conservati nel [rapporto](I18N-VALIDATION-REPORT.md).

## Chiarimenti editoriali rispetto alla sorgente

Le incongruenze seguenti sono state risolte nel testo italiano descrivendo i dati
realmente presenti. Non sono state aggiunte note o funzioni musicali per adattare
lo spartito alla prosa inglese. La sorgente EN e gli URL restano compatibili.

- `m2a-009.goal`: le cinque altezze della posizione di Sol sostituiscono l'ambigua
  indicazione inglese “four-line”. `m2a-020.summary`: la melodia è nella posizione
  di Re e conclude lo studio delle tre posizioni del corso; non attraversa tutte
  e tre le posizioni nello stesso spartito. Entrambi i campi ora tradotti e rivisti.
- Metodo 2E/3C/3D: corretti nel testo i riferimenti troppo assoluti a mani sempre
  unite, basso sempre in semiminime, estensione Sol4–Re5 e dinamica mf invariata,
  quando la notazione contiene eccezioni (per esempio `m3c-009`, `m3d-002`).
- Metodo 4A/5B: distinta l'armatura teorica dalle alterazioni effettivamente suonate
  nella posizione di cinque dita (`m4a-001`, `m4a-002`, `m4a-004`, `m5b-018`).
  Non si chiede di suonare il Do diesis o Re diesis se assenti nelle battute.
- Metodo 5D/5E: non si richiede una sensibile assente nei dati (`m5d-014`,
  `m5d-017`, `m5e-016`, `m5e-019`). `m6e-002` usa crome, non semicrome;
  in 6D le descrizioni del basso seguono le durate e le note realmente presenti.
- Tecnica 1C e 2A: `t1c-001/002` non promettono semibrevi assenti;
  `t2a-012` nomina correttamente Fa–Sol–La–Si bemolle–Do.
- Tecnica 2E: `t2e-013` descrive entrate in levare e pause senza inventare legature.
  In 3B i frammenti cromatici non sono limitati a estremi smentiti dai dati;
  `t3b-020` non promette una seconda scala minore assente.
- Tecnica 3D/4D: i cambi di pedale seguono gli eventi scritti; non si promette
  valutazione del mezzo pedale quando sono disponibili soltanto down/up.
- Tecnica 5/5B/6: arpeggi detti di due ottave nella prosa ma privi dell'estremo
  corrispondente sono chiamati “estesi”. Un arpeggio di Sol maggiore non richiede
  Fa diesis, né quello di Fa maggiore Si bemolle: le triadi sono Sol–Si–Re e
  Fa–La–Do. Analoga correzione per il Sol diesis assente nella triade di La.
- Tecnica 5C/6B: la formula dq+e è “semiminima puntata e croma”, non croma
  puntata. Le note di avvicinamento sono scritte per esteso con le loro durate;
  non sono aggiunti simboli di abbellimento inesistenti. Le indicazioni di studio
  stilistico non vengono presentate come nuove regole del valutatore.
- Brani: descrizioni e obiettivi di accompagnamenti a note singole non diventano
  “accordi” inesistenti. Nei tre titoli Pro che promettevano un'opera completa
  (`songs-p-002`, `013`, `015`) si dichiara un arrangiamento: i dati disponibili
  sono estratti brevi, non le opere integrali. L'identità del brano non cambia.

## Registro per corso

Tutti i corsi sotto hanno revisione testuale Codex e impronte correnti. Ogni
collegamento visuale contiene il campione specificato; si tratta di prova desktop
campionaria, distinta dalle prove hardware e di continuità della sessione.

| Corso | Campi IT | Lotto testuale | Spartito esaminato / schermata |
| --- | ---: | --- | --- |
| `method-level-1` | 90/90 | `method-level-1-aggregate-2026-10-15` | [`method-021`](i18n-phase7/scores-it-00.png) |
| `method-level-1a` | 82/82 | `pilot-method-1a` | [`m1a-017`](i18n-phase7/scores-it-00.png) |
| `method-level-1b` | 82/82 | `method-level-1b-2026-10-15` | [`m1b-020`](i18n-phase7/scores-it-00.png) |
| `method-level-1c` | 82/82 | `method-level-1c-2026-10-15` | [`m1c-020`](i18n-phase7/scores-it-00.png) |
| `method-level-1d` | 82/82 | `method-level-1d-2026-10-15` | [`m1d-001`](i18n-phase7/scores-it-04.png) |
| `method-level-1e` | 82/82 | `method-level-1e-2026-10-15` | [`m1e-017`](i18n-phase7/scores-it-04.png) |
| `method-level-2` | 62/62 | `method-level-2-aggregate-2026-10-15` | [`method2-009`](i18n-phase7/scores-it-04.png) |
| `method-level-2a` | 82/82 | `it-completion-method-level-2a` | [`m2a-007`](i18n-phase7/scores-it-04.png) |
| `method-level-2b` | 82/82 | `it-completion-method-level-2a` | [`m2b-020`](i18n-phase7/scores-it-08.png) |
| `method-level-2c` | 82/82 | `it-completion-method-level-2a` | [`m2c-020`](i18n-phase7/scores-it-08.png) |
| `method-level-2d` | 82/82 | `it-completion-method-level-2a` | [`m2d-020`](i18n-phase7/scores-it-08.png) |
| `method-level-2e` | 82/82 | `it-completion-method-level-2a` | [`m2e-020`](i18n-phase7/scores-it-08.png) |
| `method-level-3` | 62/62 | `it-completion-method-level-3` | [`method3-014`](i18n-phase7/scores-it-12.png) |
| `method-level-3a` | 82/82 | `it-completion-method-level-3` | [`m3a-019`](i18n-phase7/scores-it-12.png) |
| `method-level-3b` | 82/82 | `it-completion-method-level-3` | [`m3b-020`](i18n-phase7/scores-it-12.png) |
| `method-level-3c` | 82/82 | `it-completion-method-level-3` | [`m3c-013`](i18n-phase7/scores-it-12.png) |
| `method-level-3d` | 82/82 | `it-completion-method-level-3` | [`m3d-019`](i18n-phase7/scores-it-16.png) |
| `method-level-3e` | 63/63 | `it-completion-method-level-3` | [`m3e-005`](i18n-phase7/scores-it-16.png) |
| `method-level-4` | 62/62 | `it-completion-method-level-4` | [`method4-001`](i18n-phase7/scores-it-16.png) |
| `method-level-4a` | 62/62 | `it-completion-method-level-4` | [`m4a-001`](i18n-phase7/scores-it-16.png) |
| `method-level-4b` | 62/62 | `it-completion-method-level-4` | [`m4b-014`](i18n-phase7/scores-it-20.png) |
| `method-level-4c` | 62/62 | `it-completion-method-level-4` | [`m4c-019`](i18n-phase7/scores-it-20.png) |
| `method-level-4d` | 62/62 | `it-completion-method-level-4` | [`m4d-004`](i18n-phase7/scores-it-20.png) |
| `method-level-4e` | 62/62 | `it-completion-method-level-4` | [`m4e-019`](i18n-phase7/scores-it-20.png) |
| `method-level-5` | 62/62 | `it-completion-method-level-5` | [`method5-005`](i18n-phase7/scores-it-24.png) |
| `method-level-5a` | 82/82 | `it-completion-method-level-5` | [`m5a-005`](i18n-phase7/scores-it-24.png) |
| `method-level-5b` | 82/82 | `it-completion-method-level-5` | [`m5b-018`](i18n-phase7/scores-it-24.png) |
| `method-level-5c` | 82/82 | `it-completion-method-level-5` | [`m5c-019`](i18n-phase7/scores-it-24.png) |
| `method-level-5d` | 82/82 | `it-completion-method-level-5` | [`m5d-006`](i18n-phase7/scores-it-28.png) |
| `method-level-5e` | 82/82 | `it-completion-method-level-5` | [`m5e-019`](i18n-phase7/scores-it-28.png) |
| `method-level-6` | 62/62 | `it-completion-method-level-6` | [`method6-009`](i18n-phase7/scores-it-28.png) |
| `method-level-6a` | 82/82 | `it-completion-method-level-6` | [`m6a-006`](i18n-phase7/scores-it-28.png) |
| `method-level-6b` | 82/82 | `it-completion-method-level-6` | [`m6b-001`](i18n-phase7/scores-it-32.png) |
| `method-level-6c` | 82/82 | `it-completion-method-level-6` | [`m6c-006`](i18n-phase7/scores-it-32.png) |
| `method-level-6d` | 82/82 | `it-completion-method-level-6` | [`m6d-001`](i18n-phase7/scores-it-32.png) |
| `method-level-6e` | 82/82 | `it-completion-method-level-6` | [`m6e-009`](i18n-phase7/scores-it-32.png) |
| `songs-advanced` | 122/122 | `it-completion-songs-advanced` | [`songs-a-001`](i18n-phase7/scores-it-36.png) |
| `songs-beginner` | 122/122 | `it-completion-songs-beginner` | [`songs-b-008`](i18n-phase7/scores-it-36.png) |
| `songs-folk` | 62/62 | `it-completion-songs-beginner` | [`songs-f-001`](i18n-phase7/scores-it-36.png) |
| `songs-holiday` | 62/62 | `it-completion-songs-holiday` | [`songs-h-003`](i18n-phase7/scores-it-36.png) |
| `songs-hymns` | 62/62 | `it-completion-songs-beginner` | [`songs-hy-004`](i18n-phase7/scores-it-40.png) |
| `songs-intermediate` | 122/122 | `it-completion-songs-holiday` | [`songs-i-006`](i18n-phase7/scores-it-40.png) |
| `songs-jazz-blues` | 62/62 | `it-completion-songs-holiday` | [`songs-jb-008`](i18n-phase7/scores-it-40.png) |
| `songs-pro` | 62/62 | `it-completion-songs-advanced` | [`songs-p-015`](i18n-phase7/scores-it-40.png) |
| `technique-level-1` | 82/82 | `it-completion-technique-level-1` | [`technique-005`](i18n-phase7/scores-it-44.png) |
| `technique-level-1a` | 82/82 | `it-completion-technique-level-1` | [`t1a-005`](i18n-phase7/scores-it-44.png) |
| `technique-level-1b` | 82/82 | `it-completion-technique-level-1` | [`t1b-005`](i18n-phase7/scores-it-44.png) |
| `technique-level-1c` | 82/82 | `it-completion-technique-level-1` | [`t1c-020`](i18n-phase7/scores-it-44.png) |
| `technique-level-1d` | 82/82 | `it-completion-technique-level-1` | [`t1d-020`](i18n-phase7/scores-it-48.png) |
| `technique-level-1e` | 62/62 | `it-completion-technique-level-1` | [`t1e-015`](i18n-phase7/scores-it-48.png) |
| `technique-level-2` | 62/62 | `it-completion-technique-level-2` | [`tech2-014`](i18n-phase7/scores-it-48.png) |
| `technique-level-2a` | 62/62 | `it-completion-technique-level-2` | [`t2a-006`](i18n-phase7/scores-it-48.png) |
| `technique-level-2b` | 62/62 | `it-completion-technique-level-2` | [`t2b-015`](i18n-phase7/scores-it-52.png) |
| `technique-level-2c` | 62/62 | `it-completion-technique-level-2` | [`t2c-001`](i18n-phase7/scores-it-52.png) |
| `technique-level-2d` | 62/62 | `it-completion-technique-level-2` | [`t2d-003`](i18n-phase7/scores-it-52.png) |
| `technique-level-2e` | 82/82 | `it-completion-technique-level-2` | [`t2e-019`](i18n-phase7/scores-it-52.png) |
| `technique-level-3` | 62/62 | `it-completion-technique-level-3` | [`tech3-014`](i18n-phase7/scores-it-56.png) |
| `technique-level-3a` | 62/62 | `it-completion-technique-level-3` | [`t3a-018`](i18n-phase7/scores-it-56.png) |
| `technique-level-3b` | 62/62 | `it-completion-technique-level-3` | [`t3b-015`](i18n-phase7/scores-it-56.png) |
| `technique-level-3c` | 62/62 | `it-completion-technique-level-3` | [`t3c-006`](i18n-phase7/scores-it-56.png) |
| `technique-level-3d` | 62/62 | `it-completion-technique-level-3` | [`t3d-011`](i18n-phase7/scores-it-60.png) |
| `technique-level-3e` | 62/62 | `it-completion-technique-level-3` | [`t3e-019`](i18n-phase7/scores-it-60.png) |
| `technique-level-4` | 62/62 | `it-completion-technique-level-4` | [`tech4-014`](i18n-phase7/scores-it-60.png) |
| `technique-level-4a` | 82/82 | `it-completion-technique-level-4` | [`t4a-019`](i18n-phase7/scores-it-60.png) |
| `technique-level-4b` | 82/82 | `it-completion-technique-level-4` | [`t4b-001`](i18n-phase7/scores-it-64.png) |
| `technique-level-4c` | 82/82 | `it-completion-technique-level-4` | [`t4c-020`](i18n-phase7/scores-it-64.png) |
| `technique-level-4d` | 82/82 | `it-completion-technique-level-4` | [`t4d-010`](i18n-phase7/scores-it-64.png) |
| `technique-level-4e` | 82/82 | `it-completion-technique-level-4` | [`t4e-001`](i18n-phase7/scores-it-64.png) |
| `technique-level-5` | 62/62 | `it-completion-technique-level-5` | [`tech5-004`](i18n-phase7/scores-it-68.png) |
| `technique-level-5a` | 82/82 | `it-completion-technique-level-5` | [`t5a-019`](i18n-phase7/scores-it-68.png) |
| `technique-level-5b` | 82/82 | `it-completion-technique-level-5` | [`t5b-017`](i18n-phase7/scores-it-68.png) |
| `technique-level-5c` | 82/82 | `it-completion-technique-level-5` | [`t5c-006`](i18n-phase7/scores-it-68.png) |
| `technique-level-5d` | 82/82 | `it-completion-technique-level-5` | [`t5d-020`](i18n-phase7/scores-it-72.png) |
| `technique-level-5e` | 82/82 | `it-completion-technique-level-5` | [`t5e-012`](i18n-phase7/scores-it-72.png) |
| `technique-level-6` | 62/62 | `it-completion-technique-level-6` | [`tech6-014`](i18n-phase7/scores-it-72.png) |
| `technique-level-6a` | 82/82 | `it-completion-technique-level-6` | [`t6a-018`](i18n-phase7/scores-it-72.png) |
| `technique-level-6b` | 82/82 | `it-completion-technique-level-6` | [`t6b-006`](i18n-phase7/scores-it-76.png) |
| `technique-level-6c` | 82/82 | `it-completion-technique-level-6` | [`t6c-001`](i18n-phase7/scores-it-76.png) |
| `technique-level-6d` | 82/82 | `it-completion-technique-level-6` | [`t6d-003`](i18n-phase7/scores-it-76.png) |
| `technique-level-6e` | 82/82 | `it-completion-technique-level-6` | [`t6e-019`](i18n-phase7/scores-it-76.png) |

## Esiti e attività residue

`pnpm check:i18n`, `pnpm check:i18n:full`, `pnpm test:content` (11/11) e
`pnpm build` superati sui dati completi; matrice e log nel rapporto finale.
Il build ora richiede il controllo completo e fallisce nella fixture isolata con
un obiettivo obbligatorio mancante. Nessun controllo allentato.

Traduzione e revisione testuale concluse, campione visivo per tutti i corsi
eseguito. La consegna B mantiene **validazione finale parziale** per le prove
manuali/hardware effettivamente mancanti, elencate nel rapporto; nessuna revisione
umana è stata ricevuta. Non rimangono campi da tradurre in questo inventario.
