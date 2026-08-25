# HANDOFF — punto di lavoro (aggiornato 2026-08-24)

> Documento per riprendere il lavoro in una nuova sessione Claude (in questa cartella).
> Leggi anche la skill `.claude/skills/wiki-angular/SKILL.md` e `AGENTS.md`.

## Stato repo
- Branch `master`, tutto pushato su GitHub `IMMagro/WIKI-2.0`.
- Ultimo commit funzionale: `159e03c` (bozze non visibili all'utente).
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

## Refactoring in corso (a tappe, con commit dopo ognuna)
Obiettivo: sciogliere il monolite `app.component.{ts,html}` (~1290+1130 righe) in componenti/servizi.

Piano approvato:
1. **`NewsBlockRenderer` condiviso** — dedup del rendering blocchi (popup pubblico + anteprima admin). ← **FATTO (2026-08-25)**
   - `src/app/components/shared/news-block-renderer/` agganciato in `app.component` (popup `selectedNews`) e in `admin-news` (anteprima); markup canvas duplicato sostituito da `<app-news-block-renderer [blocks] [width]>`.
   - Rimossi `canvasHeight`/`canvasH` locali (l'altezza è calcolata dal componente condiviso via `minH`).
   - Bump minore del budget bundle in `angular.json` (600kB → 620kB) per il peso extra del componente.
   - Build verde (solo i 6 warning CSS preesistenti).
2. `NewsService` + `ThemeService` (estrarre logica news e dark-mode/animazioni da app.component).
3. `NewsBellComponent` + `NewsPopupComponent`.
4. `FaqPageComponent` + `ServiziComponent` + `HomeComponent`.
5. `app.component` = sola shell di orchestrazione.

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
