# Glossario italiano per Pianio

Baseline terminologica per interfaccia, catalogo e istruzioni musicali. Le traduzioni si applicano alle etichette per l'utente; i token macchina, le sigle standard e la notazione restano nel loro formato tecnico.

| Inglese / simbolo | Forma italiana | Uso e nota |
| --- | --- | --- |
| Practice | Esercitazione | Modalità libera con riscontro sugli eventi suonati. Usare «Esercitazione» come etichetta coerente, anche se in altri contesti l'inglese *practice* può essere «studio». |
| Performance | Esecuzione | Modalità cronometrata con accompagnamento e valutazione. |
| LH / left hand | MS / mano sinistra | Nel testo esteso usare «mano sinistra»; nelle etichette compatte usare `MS`. |
| RH / right hand | MD / mano destra | Nel testo esteso usare «mano destra»; nelle etichette compatte usare `MD`. |
| Hands together | Mani unite | Etichetta della parte eseguita con entrambe le mani. |
| Treble clef (G) | Chiave di violino | Conservare il simbolo `G` nei dati. |
| Bass clef (F) | Chiave di basso | Conservare il simbolo `F` nei dati. |
| Measure / bar | Battuta | Numerazione compatta: «battuta 3»; eventuale abbreviazione `batt.` solo se lo spazio lo richiede. |
| Eighth note | Croma | Token tecnico `e`; non tradurre nei dati. |
| Quarter note | Semiminima | Token tecnico `q`. |
| Half note | Minima | Token tecnico `h`. |
| Whole note | Semibreve | Token tecnico `w`. |
| Dotted eighth / quarter / half | Croma / semiminima / minima puntata | Token tecnici `de`, `dq`, `dh`; il punto è notazione, non parte della traduzione. |
| Sight-reading | Lettura a prima vista | Usare in esteso nei tooltip e nelle istruzioni; abbreviare solo in spazi stretti. |
| Dynamics | Dinamica | In istruzioni e risultati: «dinamica» / «precisione della dinamica». Conservare i simboli standard `pp`, `p`, `mp`, `mf`, `f`, `ff`. |
| Pedal / sustain pedal | Pedale / pedale di risonanza | Per il controller MIDI 64 usare «pedale»; nei testi didattici preferire «pedale di risonanza» quando serve precisione. «Premi»/«rilascia il pedale» per feedback operativo. |
| MIDI note names | Do–Re–Mi–Fa–Sol–La–Si | Per l'interfaccia italiana, con alterazioni espresse `♯`/`♭` (o testo leggibile diesis/bemolle se richiesto). MIDI 60 è sempre `Do4` nel sistema di ottava adottato dal progetto. |

## Convenzioni da preservare

- Non cambiare numeri MIDI, canali, velocity, timestamp ISO, identificativi, slug, URL, JSON esportato, chiavi `localStorage` o formato delle note nel sorgente `C4:q`.
- MusicXML conserva step anglosassoni `A`–`G`, alterazioni numeriche, ottave, durata, battute, dinamiche standard e direzioni del pedale.
- Conservare simboli e sigle musicali standard: `𝄞`/`𝄢` se resi graficamente, `G`/`F` nel tipo, `mf`, `pp`, `♯`, `♭`, `♮`, indicazione metrica e `bpm`.
- Le etichette tecniche e i dati del dispositivo MIDI non si traducono; tradurre soltanto le descrizioni applicative.
- Le note del catalogo e i titoli di brani devono usare nomi italiani convenzionali quando esistono, mantenendo invariati autore, attribuzione e identificativo della licenza.
