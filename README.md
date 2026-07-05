# Duo alarm — web

Statický web pro **Duo alarm, s.r.o.** (elektroinstalace a zabezpečení, Hradec Králové).
Žádný build pro provoz — jde o čisté HTML/CSS/JS, hostovatelné kdekoli (Netlify, Vercel, FTP, GitHub Pages…).

## Spuštění lokálně

```bash
node server.js        # → http://localhost:8077
```
Nebo jakýkoli statický server, případně stačí otevřít `index.html` v prohlížeči.

## Struktura

```
index.html              Domovská stránka
sluzby/                 Stránky služeb (elektroinstalace, jablotron, ajax, …)
realizace.html          Přehled realizací
o-firme.html            O firmě
certifikace.html        Certifikace
kontakt.html            Kontakt + formulář
gdpr.html               Ochrana osobních údajů
css/styles.css          Kompletní design systém (tmavý + zlatá #F5B700)
js/main.js              Animace, mobilní menu, počítadla, formulář
assets/img/             Logo, fotky, ikony
build.js                Generátor stránek (viz níže)
server.js               Lokální statický server pro náhled
```

## Úprava obsahu

Stránky se **generují** z jednoho zdroje, aby byla hlavička/patička i komponenty konzistentní.
Texty a sekce uprav v `build.js` a znovu vygeneruj:

```bash
node build.js
```

Příkaz přepíše všechny `.html` soubory. HTML soubory tedy needituj ručně — změny dělej v `build.js`.

## Stránky

- `index.html` — domovská
- `sluzby/*.html` — 6 služeb (chytrá domácnost má interaktivní taby)
- `realizace.html` + `realizace/*.html` — přehled + 5 detailů projektů s galerií a lightboxem
- `o-firme.html`, `certifikace.html` (certifikáty s lightboxem), `kontakt.html` (Google mapa), `gdpr.html`

## Co je dobré ještě doplnit / zvážit

- **Kontaktní formulář**: nyní funguje přes `mailto:` (otevře e‑mailový klient s předvyplněnou zprávou) — funguje všude bez serveru. Pro odesílání bez e‑mailového klienta lze napojit např. [Formspree](https://formspree.io) (stačí změnit `data-mailto` / `action` ve formuláři).
- **Loga partnerů** (Jablotron, Ajax, Dahua, Hikvision, Hanwha, Mercury): v patičce/stripu jsou zatím textové wordmarky. Pokud chceš oficiální loga, doplň je jako SVG dle brand guidelines výrobců.
- **GDPR text** je vzorový — před zveřejněním doporučuji právní kontrolu.
- Po nasazení doplnit `sitemap.xml`, `robots.txt` a případně Google Analytics / Search Console.

---
Tmavý (navy) vzhled se zlatým akcentem (`#F5B700`) navazuje na stávající brand a inspirační reference.
Písmo: **Archivo** (nadpisy) + **Hanken Grotesk** (text) — záměrně mimo defaultní Inter/Roboto.
Žluté kruhové ikony, žlutý kontrastní pruh, marquee s partnery, mobilní spodní CTA lišta.
Fotky služeb, realizací i certifikáty jsou reálné (převzaté z duoalarm.cz). Animace respektují `prefers-reduced-motion`.
