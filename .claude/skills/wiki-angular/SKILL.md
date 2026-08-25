---
name: wiki-angular
description: >-
  Convenzioni, struttura e workflow di build/verifica per la Wiki clienti
  (Angular 18 standalone + Tailwind, backend IIS .ashx). Usare quando si
  sviluppano o si rifattorizzano componenti, servizi o stili di questo progetto.
---

# Wiki clienti — sviluppo Angular

Web app **Angular 18 standalone components** + **Tailwind CSS**, backend **IIS handler `.ashx` C#** in `public/api/` con dati JSON in `public/Data/`. Deploy: build in `dist/wiki-app/` copiato sulla root del sito IIS (**wiki.quadernoelettronico.it**).

## Comandi
- Dev server: `npm start` (o `npm start -- --port 4250`)
- Build (verifica di riferimento): `npm run build`
- NON sono configurati `lint`/`test`: la verifica è il build verde.

## Regola: verifica sempre col build
Dopo ogni modifica al frontend, esegui `npm run build` e conferma "Application bundle generation complete". I 6 warning CSS ("rules skipped due to selector errors") sono preesistenti e innocui.

## Tema QE (obbligatorio per CSS/UI)
Palette in `.agents/skills/theme-factory/themes/12-qe-theme.md`. Token: qe-blue `#377DFF`, magenta `#F80086`, bg `#F8FAFD`, testo `#1E2022`. Font Poppins, glassmorphism, dark mode via classe `.dark`.

## Struttura componenti
- `app.component.{ts,html}` — shell principale (home, ricerca, pagina FAQ, servizi, wrapper guide, routing admin). **È un monolite: preferire l'estrazione in componenti/servizi dedicati.**
- `components/guide/` — `GuideComponent` (pubblico), `GuideAdminComponent` (editor), `guide.models.ts`.
- `components/admin/` — `admin-layout`, `admin-login`, `admin-dashboard`, `admin-news`, `admin-server`, `news-canvas-editor`.
- `components/sidebar/` — navigazione.
- `services/` — `GuideService` (fonte dati guide, con `publicCategories` che esclude le bozze), `AdminService`.

## Vincoli backend (IIS Medium Trust)
P/Invoke (kernel32), `ServiceController`, WMI sono **bloccati** (danno 500). Gli `.ashx` in "safe mode" leggono/scrivono solo file JSON e `DriveInfo`. Sotto `ng serve` gli `.ashx` non girano: i servizi usano i **fallback** interni.

## Dati e visibilità
- Guide/News in **bozza** (`status: 'draft'`) NON sono visibili all'utente: usare `GuideService.publicCategories` e filtrare `status !== 'draft'` in ogni consumo pubblico.
- La ricerca in home e la pagina FAQ leggono le FAQ reali appiattite da `GuideService` (getter `allFaqItems` in app.component), non dai vecchi dati finti `publicManuals`.

## Convenzioni
- Componenti **standalone** con `imports: []` espliciti; niente NgModule.
- Percorsi API relativi (`api/...`), robusti con `<base href="/">`.
- Commit in stile conventional; committare i lavori (l'ambiente ha subìto `git reset --hard` che ha perso lavoro non committato).
