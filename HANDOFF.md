# HANDOFF — punto di lavoro (aggiornato 2026-08-25)

> Documento per riprendere il lavoro in una nuova sessione Claude (in questa cartella).
> Leggi anche la skill `.claude/skills/wiki-angular/SKILL.md` e `AGENTS.md`.

## Stato repo
- Branch `master`. Commit locali `0c92ca9` e `188c65a` (step 5, pulizia dead code) da pushare —
  verificare `git status`/`git log origin/master..HEAD` a inizio sessione.
- Ultimo commit funzionale: `188c65a` (step 5 completato: app.component ridotto a shell +
  rimozione codice morto). **Il piano di refactoring a 5 step è concluso.**
- Build di riferimento: `npm run build` → verde (6 warning CSS preesistenti, innocui).
- Dev server: `npm start -- --port 4250`.

## MCP Angular — CONFIGURATO e verificato
- `.mcp.json` lancia l'MCP ufficiale (`ng mcp`) da un'installazione **isolata** della CLI v22:
  `node C:/Users/massimiliano.magrini/.angular-mcp/node_modules/@angular/cli/bin/ng.js mcp`
- Motivo dell'install isolata: `npx @angular/cli@22 mcp` nel progetto usa la CLI locale v18 (senza `mcp`).
- ⚠️ **BUG risolto (2026-08-25):** anche puntando all'`ng.js` della v22, il launcher Angular
  fa *bootstrap* alla CLI locale v18 quando gira dentro la cartella del progetto → il comando
  `mcp` sparisce e il server MCP muore subito (approvato ma senza tool). **Fix:** in `.mcp.json`
  è impostato `env.NG_DISABLE_VERSION_CHECK=true`, che forza l'uso della v22 invocata direttamente.
- Per usarlo: aprire la cartella in Claude Code e **approvare/riconnettere** il server `angular-cli`
  (verifica con `/mcp`). Dopo modifiche a `.mcp.json` va **riconnesso**.
- `ng mcp` è un comando *nascosto* (non compare in `ng help`); opzioni utili: `--read-only`, `--local-only`.
- ⚠️ Il path in `.mcp.json` è assoluto e legato a QUESTO PC.

## Refactoring COMPLETATO (2026-08-25) — a tappe, con commit dopo ognuna
Obiettivo: sciogliere il monolite `app.component.{ts,html}` (partito da ~1290+1130 righe,
arrivato a 567+482 dopo gli step 1-5) in componenti/servizi. Piano a 5 step concluso;
possibile lavoro futuro annotato in fondo allo step 5.

Piano approvato:
1. **`NewsBlockRenderer` condiviso** — dedup del rendering blocchi (popup pubblico + anteprima admin). ← **FATTO (2026-08-25)**
   - `src/app/components/shared/news-block-renderer/` agganciato in `app.component` (popup `selectedNews`) e in `admin-news` (anteprima); markup canvas duplicato sostituito da `<app-news-block-renderer [blocks] [width]>`.
   - Rimossi `canvasHeight`/`canvasH` locali (l'altezza è calcolata dal componente condiviso via `minH`).
   - Bump minore del budget bundle in `angular.json` (600kB → 620kB) per il peso extra del componente.
   - Build verde (solo i 6 warning CSS preesistenti).
2. **`NewsService` + `ThemeService`** — estrarre logica news e dark-mode/animazioni da app.component. ← **FATTO (2026-08-25)**
   - `src/app/services/news.service.ts`: `allNews`, `loadNews()`, `newsForProgram()`, `generalNews`, `hasUnseenGeneralNews`, tracciamento "già viste" (`qe_seen_news`), `selectedNews` + `openNewsPopup`/`closeNewsPopup`.
   - `src/app/services/theme.service.ts`: `isDarkMode`, `toggleTheme()` (con View Transitions), `globalAnimationsEnabled` (get/set su localStorage).
   - `app.component` ora inietta `newsService`/`themeService` (public, usati anche nel template) invece di duplicare lo stato; `admin-layout.component` usa lo stesso `ThemeService.globalAnimationsEnabled` al posto del getter/setter locale che duplicava la stessa chiave localStorage.
   - `app.component.ts`: 1281 → 1183 righe. Build verde (solo i 6 warning CSS preesistenti).
3. **`NewsBellComponent` + `NewsPopupComponent`** ← **FATTO (2026-08-25)**
   - `src/app/components/shared/news-bell/`: bottone campanella + tendina "Comunicazioni" (`isOpen` locale, click-outside via proprio `#notificationDropdown`, `openNews()` che apre il popup e blocca lo scroll). Inietta `NewsService` direttamente.
   - `src/app/components/shared/news-popup/`: overlay a schermo intero, usa `NewsBlockRendererComponent` (larghezza di default 720, non più passata esplicitamente). Inietta `NewsService`.
   - `app.component.html`: i due blocchi di markup sono ora `<app-news-bell>` e `<app-news-popup *ngIf="!isAdminRoute">`.
   - Rimossi da `app.component`: `isNotificationOpen`, `notificationDropdown` (ViewChild + ramo del click-outside), `openNewsPopup`/`closeNewsPopup`, `newsCanvasW`.
   - `app.component.ts`: 1183 → 1165 righe. Build verde (solo i 6 warning CSS preesistenti).
4. **`FaqPageComponent` + `ServiziComponent` + `HomeComponent`** ← **FATTO (2026-08-25)**, in 4 commit:
   - `guideService.allFaqItems`: la vista appiattita delle FAQ (prima in app.component) ora vive
     in `GuideService`, così Home e FaqPage la usano senza passaggi dal parent.
   - `src/app/services/faq-reading.service.ts`: `selectedFaq`/`readingDesignVariant`, tracciamento
     "già letta" (`qe_read_faqs`), `openFaq()`/`closeFaq()` — sul modello di `NewsService`.
   - `src/app/components/home/`: ricerca spotlight (query, dropdown, click-outside) — locale,
     inietta `GuideService`/`FaqReadingService`. Input: `isActive`, `titleVisible`, `homeStage`, `tags`.
   - `src/app/components/servizi/`: titolo animato + carosello card. Il titolo richiede un FLIP
     (misura/muta/misura/anima) sul suo DOM: `ServiziComponent` espone `getTitleRect()`/
     `animateTitleFlip()`, chiamati da `app.component` via `@ViewChild(ServiziComponent)`
     (stesso pattern di `guideRef`/`GuideComponent.openCat()`). Wheel scroll resta condiviso con
     le altre viste tramite Output `wheelScroll` → `onWheel($event)` in app.component.
   - `src/app/components/faq-page/`: animazione d'ingresso, ricerca/filtro, 5 varianti di card,
     popover statistiche lettura — tutto locale, inietta `GuideService`/`FaqReadingService`/`ThemeService`.
   - `src/app/components/shared/faq-reading-panel/`: pannello di lettura (4 varianti), condiviso
     tra Home e FaqPage tramite `FaqReadingService`; Output `categorySelected` per il bottone
     "Vai alla guida" (l'orchestratore cambia `activeIndex` e chiama `guideRef.openCat()`).
   - Rimossi da `app.component`: `filteredFAQ`, `getReadCount/getUnreadCount/getReadPercentage/
     getPieGradient`, `manualsDesignVariant`, `faqSearchQuery`, `isFaqStatsModalOpen`, `openFaq`/
     `closeFaq`, `allFaqItems` (deprecato), `getCardAnimation`, `homeSearchQuery`/`isHomeSearchOpen`/
     `homeSearchResults`/`onHomeSearchFocus`/`onHomeSearchInput`/`openFaqFromHome`,
     `goToAllFaqs` (dead code, dipendeva solo da `closeFaq`).
   - Bump budget bundle in `angular.json` (620kB → 650kB) per il peso dei nuovi componenti.
   - `app.component.ts`: 1165 → 961 righe. `app.component.html`: 1030 → 482 righe. Build verde
     (solo i 6 warning CSS preesistenti).
5. **`app.component` = sola shell di orchestrazione.** ← **FATTO (2026-08-25)**, in 2 commit di pulizia:
   - **Carosello 3D "documenti"** (`documents`/`loadDocuments`/`docAngleStep`/`docTargetRotation`/
     `docCurrentRotation`/`docActiveIndex`/`docAnimationId`/`hoveredDocIndex`/`isReadingMode`/
     `documentSearchQuery`/`isSearchExpanded`/`docTitleLetters`/`docEntranceStage`/`toggleSearch`/
     `closeSearch`/`onDocumentSearch`/`updateDocActiveIndex`/`docPopupStage`/`startDocAnimation`/
     `getDocTransform`/`toggleReadingMode`/`getDocStyles`) — **rimosso**, zero riferimenti nel
     template: superato da `<app-guide>`, completamente autonomo (nessun `@Input` dal parent).
     Rimossa anche la sua diramazione nel branch `'Guide'` di `selectMenuItem` e in `onWheel`.
   - **Login/logout admin inline** (`loginEmail`/`loginPassword`/`loginError`/`loginLoading`/
     `loginAdmin`/`logoutAdmin`) — **rimosso**: superato da `AdminLoginComponent`/`AdminLayoutComponent`,
     che hanno la propria logica via `AdminService`.
   - **Fetch dati admin duplicato** (`loadAdminData`/`handleAuthError`/`loadNotifications`,
     `adminNews`/`adminDashboardStats`/`adminServerStats`/`adminServerServices`/`adminServerLogs`/
     `adminNotifications`, il mock in `goToAdmin()`) — **rimosso**: verificato che
     `AdminDashboardComponent`/`AdminServerComponent`/`AdminNewsComponent` caricano già da soli i
     propri dati (HttpClient/AdminService diretti, nessun `@Input`); questi scrivevano su campi
     che nessun template leggeva. `goToAdmin()`/`onLoginSuccess()`/`ngOnInit()` ora impostano solo
     `isAdminRoute`/`isAdminAuthenticated`.
   - **Rotazione sfondo admin** (`backgroundImages`/`currentBgIndex`/`bgInterval`/
     `startBackgroundRotation`/`stopBackgroundRotation`) — **rimossa**: calcolava un indice mai
     renderizzato.
   - **Campi orfani** (`activeFaqCategory`, `query`, `publicManuals`, `activeAdminTab`, popup
     statistiche manuale `selectedManualStats`/`isStatsPanelOpen`/`openManualStats`/
     `closeManualStats`, filtri admin inline `adminSearchQuery`/`adminCategoryFilter`/
     `adminStatusFilter`/`isAdminFilterMenuOpen`/`filteredAdminDocuments`) — **rimossi**, zero
     consumatori verificato via grep sull'intero repo.
   - Rimane in app.component (orchestrazione vera): `activeIndex`/`menuItems`/`selectMenuItem`/
     `triggerPageAnimation` (macchina a stati delle 5 viste), gating admin (`isAdminRoute`/
     `isAdminAuthenticated`/`goToAdmin`/`exitAdmin`), carosello "Prodotti & Novità" del tab News
     (`programs`/`activeProgramIndex`/`newsStage`/`newsItems`/carousel styles — usato anche dagli
     orb di sfondo "Aurora" in cima al template, non solo dalla vista News), sidebar, contatti,
     dark mode toggle nel footer, `goToCategoryFromFaq` (riceve il categoryId dall'Output di
     `FaqReadingPanelComponent`).
   - `app.component.ts`: 961 → 693 → 567 righe (partito da 1281). `app.component.html` invariato
     a 482 (nessun markup toccato in questo step, solo `.ts`). Bundle -10kB circa. Build verde
     (solo i 6 warning CSS preesistenti).
   - **Non estratto** (giudicato fuori scope rispetto al piano a 5 step, non "shell" ma vista vera
     e propria): il carosello "Prodotti & Novità" del tab News (Windent/Poliwin/Winodlab). È
     l'ultimo pezzo di vista rimasto grande in `app.component`, ma richiederebbe lo stesso pattern
     di delega DOM già usato per `ServiziComponent` (FLIP-style) più la gestione degli orb di
     sfondo condivisi a livello di root — se si vuole procedere, seguire l'esempio di
     `ServiziComponent`/`servizi.component.ts`.

Regola: **un pezzo alla volta**, `npm run build` verde + `git commit` dopo ognuno (l'ambiente ha subìto `git reset --hard` che perde il lavoro NON committato).

## Contesto funzionale chiave (già implementato)
- Ricerca home + pagina FAQ leggono le FAQ reali da `GuideService` via getter `allFaqItems` (app.component); NON i vecchi dati finti `publicManuals`.
- FAQ si apre come pannello laterale (variante `C`).
- News: campanella in home con pallino rosso "non viste" (localStorage `qe_seen_news`), niente auto-open; click → popup a schermo che rende i **blocchi liberi** (`NewsBlock`: box/text/image/link con x,y,w,h ecc.).
- Editor grafico news: `components/admin/news-canvas-editor/` (drag&resize, upload immagini inline, pannello proprietà); anteprima nella modale admin.
- **Bozze non visibili all'utente**: `GuideService.publicCategories` (esclude guide `status:'draft'` e categorie vuote); news hanno `status` published/draft filtrato in `generalNews`/`updateProgramNews`.

## Vincoli
- Backend IIS **Medium Trust**: P/Invoke/ServiceController/WMI bloccati (500). Gli `.ashx` in `public/api/` sono "safe-mode" (solo JSON + DriveInfo). Sotto `ng serve` non girano → i servizi usano i fallback interni.
- Deploy: `npm run build` → copiare `dist/wiki-app/` sulla root IIS di **wiki.quadernoelettronico.it**.
