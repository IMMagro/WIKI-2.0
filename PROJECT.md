# Wiki 2.0 — Quaderno Elettronico

> Portale wiki interno per **Quaderno Elettronico** (Windent / Poliwin / Winodlab).
> Deploy: **wiki.quadernoelettronico.it** (IIS)

## Stack

| Layer | Tecnologia |
|-------|-----------|
| Frontend | Angular 18 (standalone components, strict templates) |
| Styling | Tailwind CSS 3.4 + design tokens QE (Poppins, `#377DFF`, `#F80086`) |
| Build | `@angular-devkit/build-angular:application` (Vite/esbuild) |
| Backend | IIS — handler C# `.ashx` in `public/api/`, dati JSON in `public/Data/` |
| Deploy | `npm run build` → copia `dist/wiki-app/` su root IIS |

## Comandi

| Task | Comando |
|------|---------|
| Dev server | `npm start` (porta 4200) |
| Build prod | `npm run build` (~20s) |
| Watch | `npm run watch` |

## Architettura Componenti

```
app.component (shell di orchestrazione)
├── home/                    ← Spotlight search, hero
├── servizi/                 ← Carosello card + titolo animato FLIP
├── guide/                   ← Albero categorie/manuali/FAQ
├── faq-page/                ← Ricerca, filtri, 5 varianti card
├── news-carousel/           ← Carosello 3D prodotti (Windent/Poliwin/Winodlab)
├── shared/
│   ├── news-bell/           ← Campanella + dropdown notifiche
│   ├── news-popup/          ← Overlay schermo intero notizia
│   ├── news-block-renderer/ ← Renderer blocchi canvas (shared)
│   └── faq-reading-panel/   ← Pannello lettura FAQ (variante C)
├── sidebar/                 ← Menu laterale
└── admin/
    ├── admin-login/
    ├── admin-layout/
    ├── admin-dashboard/
    ├── admin-news/
    ├── admin-server/
    └── news-canvas-editor/  ← Editor drag&resize per news
```

## Servizi

| Servizio | Responsabilità |
|----------|---------------|
| `GuideService` | Albero categorie/manuali, `publicCategories` (filtra draft), `allFaqItems` |
| `NewsService` | News, filtro per programma, badge "non viste" (localStorage), popup |
| `ThemeService` | Dark/light mode (View Transitions API), toggle animazioni globali |
| `FaqReadingService` | Stato drawer lettura FAQ, tracciamento "già lette" |
| `AdminService` | Autenticazione, dashboard stats, CRUD news, telemetria server |

## Vincoli

- **IIS Medium Trust**: P/Invoke, ServiceController, WMI → bloccati (500).
  Gli `.ashx` sono "safe-mode" (solo JSON + `DriveInfo`).
- **Sotto `ng serve`** le API non girano → i servizi usano fallback mock interni.
- **Bozze invisibili**: `publicCategories` esclude guide `status:'draft'` e categorie vuote;
  news hanno `status` published/draft filtrato in `generalNews`/`updateProgramNews`.
- **Budget bundle**: warning a 650 kB, errore a 1 MB.

## MCP Angular CLI

Configurato in `.mcp.json` — usa un'installazione isolata della CLI v22
(`~/.angular-mcp/`) con `NG_DISABLE_VERSION_CHECK=true` per aggirare il
bootstrap alla CLI locale v18 (che non ha il comando `mcp`).

## Refactoring Completato

Il monolite `app.component` (1281 righe TS + 1130 HTML) è stato ridotto a
**488 righe TS + 319 HTML** (shell di orchestrazione) tramite 6 step di
estrazione componenti/servizi. Dettagli nel commit history.
