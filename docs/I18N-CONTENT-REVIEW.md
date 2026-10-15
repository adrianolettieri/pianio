# Registro di revisione dei contenuti — fase 6

Aggiornato il 15 ottobre 2026. Le impronte SHA-256 sono conservate in `content-locales/review-registry.json`. “Codex” indica una revisione editoriale eseguita in questa sessione; non è revisione umana. Nessuna revisione umana è stata ricevuta. La revisione testuale registrata nel registro JSON è distinta dal controllo visuale riportato qui.

## Baseline e copertura

- Sorgenti analizzati: **80 corsi, 1557 esercizi, 6069 campi editoriali**. I campi includono titolo/descrizione del corso e titolo/descrizione/obiettivo dell’esercizio, più le note di licenza quando non vuote nel sorgente.
- Italiano: **642/6069 campi tradotti**, 5427 in fallback; corsi completi 7/80, con un corso parziale (2A, 80/82). Conteggi effettivi uguali alla baseline 80/1.557; il piano indica 68 visibili e 12 aggregati nascosti.
- Impronte: pilota 1A, aggregati Metodo livello 1–2 e sottocorsi 1B–1E correnti; 2A ha revisione pendente per due incongruenze del sorgente; nessun caso obsoleto.
- Dopo i lotti completati finora: `node scripts/check-translations.mjs` superato; `node --test scripts/test/*.test.mjs` 11/11; `node scripts/generate-content.mjs` superato. I comandi richiesti `pnpm check:i18n` e `pnpm test:content` restano in attesa senza output e sono stati interrotti; i comandi Node equivalenti sono passati.
- Anteprima locale: renderer OSMD avviato su `127.0.0.1:4173` dopo autorizzazione al binding locale; anteprima temporanea rimossa al termine. Uno spartito esaminato per ciascuno dei sei corsi nuovi. I render di 1C–1E e dell’aggregato 2 risultano leggibili al viewport desktop. Aggregato 1 e 1B mostrano taglio orizzontale di titolo/obiettivo al viewport stretto; problema del renderer da correggere in fase 7.

## Lotti registrati

| Lotto | Revisione testuale | Controllo su sorgente/dati musicali | Visuale | Note / problemi |
| --- | --- | --- | --- | --- |
| Pilota preesistente — Metodo 1A | Completata prima della fase 6; impronte correnti | Sorgente e notazione confrontati nella fase 4 | 2 spartiti esaminati in fase 4 | Un obiettivo lungo eccede l’area visibile stretta; registrato per la fase 7 |
| Metodo livello 1 — aggregato | Completata da Codex; 90/90 campi, impronte aggiornate | 22 esercizi: alternanza mani/chiavi, registro/altezza dove espliciti, ritmi, direzioni e obiettivi confrontati | Sì: `method-021`, doppio pentagramma | Titolo e obiettivo tagliati sul viewport stretto; problema renderer per fase 7. Nessuna contraddizione sorgente; nessuna revisione umana |
| Metodo livello 1B | Completata da Codex in passata distinta; 82/82 campi, impronte aggiornate | 20 esercizi: MD/MS, Do3–Sol4, posizioni, crome, minime, metro, dinamiche/istruzioni presenti e obiettivi confrontati | Sì: `m1b-018`, semibrevi in chiave di basso | In viewport stretto l’obiettivo è tagliato; problema renderer per fase 7. In seconda passata “half notes” corretto in “minime”. Titoli Hot Cross Buns, Merrily We Roll Along e Mary Had a Little Lamb mantenuti intenzionalmente come nomi propri internazionali. Nessuna contraddizione sorgente. Nessuna revisione umana. |
| Metodo livelli 1C–1E | Completata da Codex in tre revisioni testuali distinte; 246/246 campi, impronte aggiornate | 60 esercizi: mani, registro, durate, dinamiche, legature, obiettivi e nomi dei canti confrontati | Sì: un brano per ciascun corso (`grand-waltz`, `lullaby-phrase`, `camptown-races`) | Nessuna contraddizione sorgente. I tre spartiti sono leggibili nel viewport desktop esaminato. Nomi propri Camptown Races/Jolly Old Saint Nicholas mantenuti intenzionalmente. Nessuna revisione umana. |
| Metodo livello 2 — aggregato | Completata da Codex; 62/62 campi, impronte aggiornate | 15 esercizi: posizioni Do/Re/Sol/La minore, Fa♯, crome, durate, metro e obiettivi confrontati | Sì: `level-two-finale` | Leggibile al viewport desktop esaminato; nessuna contraddizione sorgente. Nessuna revisione umana. |

| Metodo livello 2A — sottolivello | Tradotte 80/82; revisione pendente per due conflitti sorgente | 20 esercizi: mani, registro, Fa♯, estensioni, minime, 3/4 e La minore confrontati; due campi lasciati in fallback | Sì: `d-position-intro` | `m2a-009.goal`: “G four-line position” non concorda con le cinque altezze G4–D5. `m2a-020.summary`: dichiara tre posizioni ma la partitura usa solo Re4–La4. Nessuna correzione silenziosa; serve chiarimento sorgente. Nessuna revisione umana. | Chiarire i due campi; proseguire poi con 2B |

## Registro per corso

“Spartito esaminato” è positivo solo se la prova è stata davvero eseguita e registrata.

| Corso | Campi IT | Revisione testuale | Spartito esaminato | Problemi | Prossima attività |
| --- | ---: | --- | --- | --- | --- |
| `method-level-1` | 90/90 | Codex: completata; impronte correnti | Sì: `method-021` | Titolo/obiettivo tagliati a viewport stretto (renderer, fase 7) | Correzione renderer in fase 7; proseguire Metodo 1–2 |
| `method-level-1a` | 82/82 | Codex: completata; impronte correnti | Sì: 2 spartiti (prova fase 4) | Obiettivo lungo eccede area visibile stretta, segnalato in fase 4 | Proseguire il lotto Metodo 1–2 |
| `method-level-1b` | 82/82 | Codex: completata; impronte correnti | Sì: `m1b-018` | Obiettivo tagliato a viewport stretto (renderer, fase 7) | Correzione renderer in fase 7; proseguire Metodo 1–2 |
| `method-level-1c` | 82/82 | Codex: completata; impronte correnti | Sì: `grand-waltz` | Nessuna; leggibile al viewport desktop esaminato | Proseguire Metodo 1–2 |
| `method-level-1d` | 82/82 | Codex: completata; impronte correnti | Sì: `lullaby-phrase` | Nessuna; leggibile al viewport desktop esaminato | Proseguire Metodo 1–2 |
| `method-level-1e` | 82/82 | Codex: completata; impronte correnti | Sì: `camptown-races` | Nessuna; leggibile al viewport desktop esaminato | Proseguire Metodo 1–2 |
| `method-level-2` | 62/62 | Codex: completata; impronte correnti | Sì: `level-two-finale` | Nessuno; leggibile al viewport desktop esaminato | Proseguire Metodo 1–2 |
| `method-level-2a` | 80/82 | Codex: 80 campi rivisti; lotto pendente | Sì: `d-position-intro` | Due conflitti: `m2a-009.goal` (quattro linee contro cinque altezze) e `m2a-020.summary` (tre posizioni contro dati solo in Re) | Chiarire i campi; poi Metodo 2B |
| `method-level-2b` | 0/82 | Da fare | No — verifica da eseguire | Nessun problema sorgente rilevato | Traduzione, revisione testuale e visiva |
| `method-level-2c` | 0/82 | Da fare | No — verifica da eseguire | Nessun problema sorgente rilevato | Traduzione, revisione testuale e visiva |
| `method-level-2d` | 0/82 | Da fare | No — verifica da eseguire | Nessun problema sorgente rilevato | Traduzione, revisione testuale e visiva |
| `method-level-2e` | 0/82 | Da fare | No — verifica da eseguire | Nessun problema sorgente rilevato | Traduzione, revisione testuale e visiva |
| `method-level-3` | 0/62 | Da fare | No — verifica da eseguire | Nessun problema sorgente rilevato | Traduzione, revisione testuale e visiva |
| `method-level-3a` | 0/82 | Da fare | No — verifica da eseguire | Nessun problema sorgente rilevato | Traduzione, revisione testuale e visiva |
| `method-level-3b` | 0/82 | Da fare | No — verifica da eseguire | Nessun problema sorgente rilevato | Traduzione, revisione testuale e visiva |
| `method-level-3c` | 0/82 | Da fare | No — verifica da eseguire | Nessun problema sorgente rilevato | Traduzione, revisione testuale e visiva |
| `method-level-3d` | 0/82 | Da fare | No — verifica da eseguire | Nessun problema sorgente rilevato | Traduzione, revisione testuale e visiva |
| `method-level-3e` | 0/63 | Da fare | No — verifica da eseguire | Nessun problema sorgente rilevato | Traduzione, revisione testuale e visiva |
| `method-level-4` | 0/62 | Da fare | No — verifica da eseguire | Nessun problema sorgente rilevato | Traduzione, revisione testuale e visiva |
| `method-level-4a` | 0/62 | Da fare | No — verifica da eseguire | Nessun problema sorgente rilevato | Traduzione, revisione testuale e visiva |
| `method-level-4b` | 0/62 | Da fare | No — verifica da eseguire | Nessun problema sorgente rilevato | Traduzione, revisione testuale e visiva |
| `method-level-4c` | 0/62 | Da fare | No — verifica da eseguire | Nessun problema sorgente rilevato | Traduzione, revisione testuale e visiva |
| `method-level-4d` | 0/62 | Da fare | No — verifica da eseguire | Nessun problema sorgente rilevato | Traduzione, revisione testuale e visiva |
| `method-level-4e` | 0/62 | Da fare | No — verifica da eseguire | Nessun problema sorgente rilevato | Traduzione, revisione testuale e visiva |
| `method-level-5` | 0/62 | Da fare | No — verifica da eseguire | Nessun problema sorgente rilevato | Traduzione, revisione testuale e visiva |
| `method-level-5a` | 0/82 | Da fare | No — verifica da eseguire | Nessun problema sorgente rilevato | Traduzione, revisione testuale e visiva |
| `method-level-5b` | 0/82 | Da fare | No — verifica da eseguire | Nessun problema sorgente rilevato | Traduzione, revisione testuale e visiva |
| `method-level-5c` | 0/82 | Da fare | No — verifica da eseguire | Nessun problema sorgente rilevato | Traduzione, revisione testuale e visiva |
| `method-level-5d` | 0/82 | Da fare | No — verifica da eseguire | Nessun problema sorgente rilevato | Traduzione, revisione testuale e visiva |
| `method-level-5e` | 0/82 | Da fare | No — verifica da eseguire | Nessun problema sorgente rilevato | Traduzione, revisione testuale e visiva |
| `method-level-6` | 0/62 | Da fare | No — verifica da eseguire | Nessun problema sorgente rilevato | Traduzione, revisione testuale e visiva |
| `method-level-6a` | 0/82 | Da fare | No — verifica da eseguire | Nessun problema sorgente rilevato | Traduzione, revisione testuale e visiva |
| `method-level-6b` | 0/82 | Da fare | No — verifica da eseguire | Nessun problema sorgente rilevato | Traduzione, revisione testuale e visiva |
| `method-level-6c` | 0/82 | Da fare | No — verifica da eseguire | Nessun problema sorgente rilevato | Traduzione, revisione testuale e visiva |
| `method-level-6d` | 0/82 | Da fare | No — verifica da eseguire | Nessun problema sorgente rilevato | Traduzione, revisione testuale e visiva |
| `method-level-6e` | 0/82 | Da fare | No — verifica da eseguire | Nessun problema sorgente rilevato | Traduzione, revisione testuale e visiva |
| `technique-level-1` | 0/82 | Da fare | No — verifica da eseguire | Nessun problema sorgente rilevato | Traduzione, revisione testuale e visiva |
| `technique-level-1a` | 0/82 | Da fare | No — verifica da eseguire | Nessun problema sorgente rilevato | Traduzione, revisione testuale e visiva |
| `technique-level-1b` | 0/82 | Da fare | No — verifica da eseguire | Nessun problema sorgente rilevato | Traduzione, revisione testuale e visiva |
| `technique-level-1c` | 0/82 | Da fare | No — verifica da eseguire | Nessun problema sorgente rilevato | Traduzione, revisione testuale e visiva |
| `technique-level-1d` | 0/82 | Da fare | No — verifica da eseguire | Nessun problema sorgente rilevato | Traduzione, revisione testuale e visiva |
| `technique-level-1e` | 0/62 | Da fare | No — verifica da eseguire | Nessun problema sorgente rilevato | Traduzione, revisione testuale e visiva |
| `technique-level-2` | 0/62 | Da fare | No — verifica da eseguire | Nessun problema sorgente rilevato | Traduzione, revisione testuale e visiva |
| `technique-level-2a` | 0/62 | Da fare | No — verifica da eseguire | Nessun problema sorgente rilevato | Traduzione, revisione testuale e visiva |
| `technique-level-2b` | 0/62 | Da fare | No — verifica da eseguire | Nessun problema sorgente rilevato | Traduzione, revisione testuale e visiva |
| `technique-level-2c` | 0/62 | Da fare | No — verifica da eseguire | Nessun problema sorgente rilevato | Traduzione, revisione testuale e visiva |
| `technique-level-2d` | 0/62 | Da fare | No — verifica da eseguire | Nessun problema sorgente rilevato | Traduzione, revisione testuale e visiva |
| `technique-level-2e` | 0/82 | Da fare | No — verifica da eseguire | Nessun problema sorgente rilevato | Traduzione, revisione testuale e visiva |
| `technique-level-3` | 0/62 | Da fare | No — verifica da eseguire | Nessun problema sorgente rilevato | Traduzione, revisione testuale e visiva |
| `technique-level-3a` | 0/62 | Da fare | No — verifica da eseguire | Nessun problema sorgente rilevato | Traduzione, revisione testuale e visiva |
| `technique-level-3b` | 0/62 | Da fare | No — verifica da eseguire | Nessun problema sorgente rilevato | Traduzione, revisione testuale e visiva |
| `technique-level-3c` | 0/62 | Da fare | No — verifica da eseguire | Nessun problema sorgente rilevato | Traduzione, revisione testuale e visiva |
| `technique-level-3d` | 0/62 | Da fare | No — verifica da eseguire | Nessun problema sorgente rilevato | Traduzione, revisione testuale e visiva |
| `technique-level-3e` | 0/62 | Da fare | No — verifica da eseguire | Nessun problema sorgente rilevato | Traduzione, revisione testuale e visiva |
| `technique-level-4` | 0/62 | Da fare | No — verifica da eseguire | Nessun problema sorgente rilevato | Traduzione, revisione testuale e visiva |
| `technique-level-4a` | 0/82 | Da fare | No — verifica da eseguire | Nessun problema sorgente rilevato | Traduzione, revisione testuale e visiva |
| `technique-level-4b` | 0/82 | Da fare | No — verifica da eseguire | Nessun problema sorgente rilevato | Traduzione, revisione testuale e visiva |
| `technique-level-4c` | 0/82 | Da fare | No — verifica da eseguire | Nessun problema sorgente rilevato | Traduzione, revisione testuale e visiva |
| `technique-level-4d` | 0/82 | Da fare | No — verifica da eseguire | Nessun problema sorgente rilevato | Traduzione, revisione testuale e visiva |
| `technique-level-4e` | 0/82 | Da fare | No — verifica da eseguire | Nessun problema sorgente rilevato | Traduzione, revisione testuale e visiva |
| `technique-level-5` | 0/62 | Da fare | No — verifica da eseguire | Nessun problema sorgente rilevato | Traduzione, revisione testuale e visiva |
| `technique-level-5a` | 0/82 | Da fare | No — verifica da eseguire | Nessun problema sorgente rilevato | Traduzione, revisione testuale e visiva |
| `technique-level-5b` | 0/82 | Da fare | No — verifica da eseguire | Nessun problema sorgente rilevato | Traduzione, revisione testuale e visiva |
| `technique-level-5c` | 0/82 | Da fare | No — verifica da eseguire | Nessun problema sorgente rilevato | Traduzione, revisione testuale e visiva |
| `technique-level-5d` | 0/82 | Da fare | No — verifica da eseguire | Nessun problema sorgente rilevato | Traduzione, revisione testuale e visiva |
| `technique-level-5e` | 0/82 | Da fare | No — verifica da eseguire | Nessun problema sorgente rilevato | Traduzione, revisione testuale e visiva |
| `technique-level-6` | 0/62 | Da fare | No — verifica da eseguire | Nessun problema sorgente rilevato | Traduzione, revisione testuale e visiva |
| `technique-level-6a` | 0/82 | Da fare | No — verifica da eseguire | Nessun problema sorgente rilevato | Traduzione, revisione testuale e visiva |
| `technique-level-6b` | 0/82 | Da fare | No — verifica da eseguire | Nessun problema sorgente rilevato | Traduzione, revisione testuale e visiva |
| `technique-level-6c` | 0/82 | Da fare | No — verifica da eseguire | Nessun problema sorgente rilevato | Traduzione, revisione testuale e visiva |
| `technique-level-6d` | 0/82 | Da fare | No — verifica da eseguire | Nessun problema sorgente rilevato | Traduzione, revisione testuale e visiva |
| `technique-level-6e` | 0/82 | Da fare | No — verifica da eseguire | Nessun problema sorgente rilevato | Traduzione, revisione testuale e visiva |
| `songs-advanced` | 0/122 | Da fare | No — verifica da eseguire | Nessun problema sorgente rilevato | Traduzione, revisione testuale e visiva |
| `songs-beginner` | 0/122 | Da fare | No — verifica da eseguire | Nessun problema sorgente rilevato | Traduzione, revisione testuale e visiva |
| `songs-folk` | 0/62 | Da fare | No — verifica da eseguire | Nessun problema sorgente rilevato | Traduzione, revisione testuale e visiva |
| `songs-holiday` | 0/62 | Da fare | No — verifica da eseguire | Nessun problema sorgente rilevato | Traduzione, revisione testuale e visiva |
| `songs-hymns` | 0/62 | Da fare | No — verifica da eseguire | Nessun problema sorgente rilevato | Traduzione, revisione testuale e visiva |
| `songs-intermediate` | 0/122 | Da fare | No — verifica da eseguire | Nessun problema sorgente rilevato | Traduzione, revisione testuale e visiva |
| `songs-jazz-blues` | 0/62 | Da fare | No — verifica da eseguire | Nessun problema sorgente rilevato | Traduzione, revisione testuale e visiva |
| `songs-pro` | 0/62 | Da fare | No — verifica da eseguire | Nessun problema sorgente rilevato | Traduzione, revisione testuale e visiva |

## Ripresa

Primo corso incompleto nell’ordine richiesto: **`method-level-2a`**, campi `exercises.m2a-009.goal` e `exercises.m2a-020.summary` lasciati in fallback per conflitti sorgente. Dopo averli risolti o documentato il blocco, proseguire da `method-level-2b`, poi Metodo 3–6, Tecnica e tutte le otto raccolte di Brani. Prove visuali registrate per aggregati 1–2, corsi 1B–1E e 2A, oltre al pilota 1A; restano gli altri corsi. Controllare anche gli esercizi con istruzioni lunghe. Non dichiarare conclusa la fase finché copertura, impronte, revisioni testuali e prove visive richieste sono complete.
