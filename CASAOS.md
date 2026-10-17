# Pianio su CasaOS (Intel/AMD, Proxmox, reverse proxy HTTPS)

Tutti i comandi Docker vanno eseguiti nella VM o nel container LXC che ospita
CasaOS, sullo stesso Docker Engine usato da CasaOS. Non sul nodo Proxmox.
È previsto un dominio dedicato, con Pianio alla radice `/`.

## 1. Trasferisci questa copia locale

Il repository upstream non contiene queste modifiche italiane, gli asset audio
locali e la configurazione Docker. Copia questa cartella completa oppure usa
l'archivio preparato insieme alla guida.

Dal Mac, sostituendo `UTENTE` e `IP_CASAOS`:

```sh
scp /private/tmp/pianio-casaos.tar.gz UTENTE@IP_CASAOS:~/pianio-casaos.tar.gz
ssh UTENTE@IP_CASAOS
```

Sul sistema CasaOS:

```sh
mkdir -p ~/pianio
tar -xzf ~/pianio-casaos.tar.gz -C ~/pianio
cd ~/pianio
sudo docker version
sudo docker compose version
sudo ss -ltnp 'sport = :8088'
```

Il controllo `docker version` deve mostrare anche Server. Se `ss` mostra un
servizio in ascolto sulla porta 8088, scegli una porta libera e modifica sia
`8088:80` sia `x-casaos.port_map` nel Compose.

## 2. Costruisci l'immagine sul server

```sh
sudo docker build --pull -t pianio:local .
sudo docker image inspect pianio:local --format '{{.Os}}/{{.Architecture}}'
sudo docker compose -f compose.casaos.yaml config -q
```

Risultato previsto per l'architettura: `linux/amd64`.
Serve Internet per scaricare immagini base e dipendenze durante la build.
Non occorre installare Node o pnpm sul server. La build controlla campioni,
traduzioni e revisioni dei contenuti, poi genera cataloghi, spartiti e frontend.
L'immagine finale contiene Nginx e file statici, inclusi i 30 MP3 e le attribuzioni.

## 3. Installa in CasaOS

Apri CasaOS: **+ → Installa un'app personalizzata / Custom Install → Importa**.
Importa il contenuto di `compose.casaos.yaml` (puoi copiarlo dal Mac).
Controlla immagine `pianio:local`, porta host `8088`, porta container `80`,
riavvio `unless-stopped`, quindi installa. L'immagine è già presente sul server:
`pull_policy: never` indica di usarla localmente. Non aggiungere volumi.

Se la tua versione di CasaOS tenta comunque un pull e mostra `pull access denied`,
avvia lo stesso Compose dal terminale:

```sh
cd ~/pianio
sudo docker compose -f compose.casaos.yaml up -d --pull never
```

In questo caso la gestione resta tramite Compose; la visualizzazione/importazione
dei container esterni dipende dalla versione di CasaOS. Puoi aggiungere alla home
CasaOS un collegamento esterno al dominio HTTPS di Pianio.

## 4. Verifica il servizio

```sh
sudo docker ps --filter name=pianio
sudo docker inspect pianio --format '{{.State.Status}} / {{.State.Health.Status}}'
sudo docker logs --tail 50 pianio
curl -fsS http://127.0.0.1:8088/healthz
curl -fI http://127.0.0.1:8088/audio/salamander/C4.mp3
```

Dopo circa 30 secondi lo stato atteso è `running / healthy`; healthz risponde `ok`;
il campione risponde `200` con tipo audio. Se `curl` non è installato usa il browser
per aprire gli stessi percorsi su `http://IP_CASAOS:8088`.

Se il container non parte, controlla `docker logs`, l'eventuale conflitto sulla
porta e che l'immagine sia stata costruita sul Docker Engine corretto.

## 5. Collega il reverse proxy

Configura il tuo dominio (es. `pianio.tuodominio.it`) con:

- destinazione HTTP: `IP_CASAOS`, porta `8088`;
- certificato HTTPS attendibile e reindirizzamento HTTP → HTTPS;
- dominio dedicato, senza prefisso `/pianio`;
- nessuna cache forzata dell'HTML o dei cataloghi.

Il DNS del dominio deve puntare al reverse proxy. Se il proxy è in un altro
container o in un'altra VM, `127.0.0.1` indica quel container/VM: usa l'IP LAN
del sistema CasaOS. Verifica che firewall Proxmox/guest consentano al proxy di
raggiungere la porta 8088. Non serve aprire 8088 su Internet.

## 6. Verifica dal browser

Apri il dominio HTTPS con Chrome o Edge desktop, collega la tastiera al computer
che esegue il browser e autorizza MIDI. Verifica catalogo italiano, spartito,
anteprima audio, MIDI e aggiornamento pagina.
L'URL `/audio/salamander/C4.mp3` deve rispondere dal dominio Pianio.
I campioni non richiedono più il CDN; restano esterni i Google Fonts.

La scheda CasaOS inizialmente apre l'URL HTTP diretto. Per l'uso MIDI apri sempre
il dominio HTTPS e, se necessario, aggiungilo come collegamento esterno in CasaOS.
Non occorre passare dispositivi USB al container Docker o alla VM Proxmox.

## Aggiornamenti e backup

I progressi sono nel browser e associati all'origine (protocollo, dominio, porta):
esportali dall'app prima di cambiare indirizzo. Non c'è un database o volume
server da salvare. Conserva sorgenti, configurazione e copia dell'immagine.

Per aggiornare, ricopia i sorgenti mantenendo il Compose con le tue impostazioni,
poi, prima di sostituire il container, salva l'immagine corrente:

```sh
cd ~/pianio
sudo docker tag pianio:local pianio:backup
sudo docker build --pull -t pianio:local .
```

Se installato da CasaOS, ricrea l'app dalla sua configurazione mantenendo
`pianio:local` (un semplice riavvio non aggiorna l'immagine del container).
Se avviato tramite Compose:

```sh
sudo docker compose -f compose.casaos.yaml up -d --pull never --force-recreate
```

Per ripristinare l'immagine precedente:

```sh
sudo docker tag pianio:backup pianio:local
```

Ricrea poi il container con lo stesso metodo usato per l'aggiornamento.
