<!-- PER AGENTI AI - La leggibilità umana è un effetto collaterale, non l'obiettivo -->
<!-- Gestito dall'agente: mantieni sezioni e ordine; modifica il contenuto, non la struttura -->
<!-- Ultimo aggiornamento: 2026-08-25 | Ultima verifica: 2026-08-25 -->

# AGENTS.md

**Precedenza:** vince l'**`AGENTS.md` più vicino** ai file che stai modificando. Il file nella cartella root contiene solo i valori predefiniti globali.

## Comandi
> Fonte: Configurazione Manuale

<!-- AGENTS-GENERATED:START commands -->
| Task | Comando | ~Tempo |
|------|---------|--------|
| Server di sviluppo (Dev server) | `npm start` | — |
| Build di produzione | `npm run build` | ~20s |
| Build in modalità watch | `npm run watch` | — |

> NB: `lint`, `format` e `test` non sono attualmente configurati in `package.json`. La verifica di riferimento è `npm run build` (vedi "Angular Build Checker"). Aggiungerli richiede di installare il tooling relativo (ESLint/Prettier/Karma).
<!-- AGENTS-GENERATED:END commands -->

> Se i comandi falliscono, verifica rispetto a package.json o chiedi all'utente di aggiornarli.

## Stile di Risposta
- Rispondi prima di tutto al punto, elabora solo se necessario. Nessuna apertura adulatoria o convenevole.
- Per domande con risposta sì/no o di stato, inizia direttamente con la risposta.
- Salta i preamboli. Adatta la lunghezza della risposta alla complessità del task.

## Regole Personalizzate per l'Agente (Azioni Concrete)

- **Orchestrazione Proattiva**: Prima di eseguire una richiesta, valuta l'intero ambito. Se lavori sulla UI, LEGGI proattivamente il design system e le linee guida sulle animazioni prima di scrivere codice. Se lavori sul backend, controlla proattivamente l'architettura e i pattern di sicurezza.
- **Auto-Commit**: Ogni volta che completi una porzione significativa di lavoro o raggiungi un traguardo, DEVI eseguire `git add` e `git commit` usando il formato conventional commit. Fai riferimento a `.agents/skills/auto-git-commit/SKILL_git.md` per il formato dei messaggi.
- **Theme Factory (CSS/UI)**: Ogni volta che modifichi CSS, fogli di stile o componenti UI, DEVI LEGGERE il file `.agents/skills/theme-factory/themes/12-qe-theme.md` e applicarne rigorosamente le regole. Tavolozza: qe-blue `#377DFF`, magenta `#F80086`, bg `#F8FAFD`, testo `#1E2022`, font Poppins.
- **Design Frontend**: Prima di creare nuovi layout, allineati con le best practice standard dei componenti standalone di Angular 18. Fai riferimento a `.agents/skills/frontend-design/` e `.agents/skills/frontend_checklist/`.
- **Linee Guida sulle Animazioni**: Quando implementi animazioni o transizioni UI, LEGGI proattivamente i file corrispondenti in `.agents/skills/animation/` (es. gsap-web, micro-interaction, svg-animation) per garantire prestazioni a 60fps.
- **Angular Build Checker**: Ogni volta che modifichi il codice frontend, DEVI ESEGUIRE `npm run build` per assicurarti che l'applicazione compili. I 6 avvisi CSS relativi a `::view-transition` sono preesistenti e innocui. Se si verificano errori, correggili automaticamente e riprova prima di notificare l'utente.
- **Aggiustamenti del Layout UI**: Sei "cieco" rispetto al rendering visivo. Quando ti viene chiesto di risolvere problemi di sovrapposizione, elementi tagliati o spaziatura, apporta modifiche significative e decise. Verifica sempre le proprietà del contenitore genitore come overflow, flex-wrap o altezze fisse.
- **Test Visivo**: Quando ti viene chiesto di correggere problemi visivi, usa `.agents/skills/webapp-testing/SKILL_testing.md` per verificare. Mostra l'output del test come prova prima di dichiarare il lavoro completato — non dire mai "testato" o "verificato" senza incollare l'output del terminale.
- **ui-ux-pro**: Ogni volta che progetti, crei, revisioni o correggi interfacce UI/UX, invoca la skill `ui-ux-pro` (`.agents/skills/ui-ux-pro/`) per linee guida UX, palette e design token.
- **ui-tester**: Ogni volta che modifichi template Angular o vuoi verificare le interazioni della UI (pulsanti, modali, link), usa `.agents/skills/ui-tester/SKILL.md` per eseguire controlli visivi e logici.
- **api-generator**: Ogni volta che devi creare un nuovo endpoint backend per IIS (`.ashx`), usa `.agents/skills/api-generator/SKILL.md` per seguire i pattern C# standard di gestione JSON.
- **mock-data-cleaner**: Ogni volta che devi preparare il frontend per l'integrazione HTTP reale, usa `.agents/skills/mock-data-cleaner/SKILL.md` per rimuovere in modo pulito i dati di prova hardcoded.
- **manual-generator**: Ogni volta che devi creare, formattare o scrivere un manuale (guida wiki), usa `.agents/skills/manual-generator/SKILL.md` per assicurarti che l'output rispetti la struttura MDX richiesta, la formattazione HTML e i tag UI.
- **Controllo Console**: Dopo qualsiasi modifica al codice, controlla l'output del terminale (`ng serve` / `npm run build`) per assicurarti che non ci siano errori (`TypeError`, `HttpErrorResponse`, ecc.) prima di considerare l'attività completata.

## Limiti e Confini (Boundaries)

### Fai Sempre (Always Do)
- Esegui `npm run build` prima di effettuare il commit (controllo pre-commit).
- Usa il formato conventional commit: `tipo(ambito): oggetto` (es. `feat(scope): messaggio`).
- Usa **commit atomici** (un singolo cambiamento logico per commit).
- **Mostra l'output del test come prova prima di dichiarare il lavoro completato** — non dire mai "testato" o "verificato" senza incollare l'output del terminale.
- Verifica che `pwd` (directory corrente) sia all'interno del repository previsto prima di qualsiasi modifica.

### Chiedi Prima (Ask First)
- Aggiunta di nuove dipendenze.
- Modifica della configurazione CI/CD.
- Modifica delle firme delle API pubbliche.
- Refactoring o riscritture a livello dell'intero repository.

### Non Fare Mai (Never Do)
- Fare commit di segreti, credenziali o dati sensibili.
- Modificare file in vendor/, node_modules/ o file generati automaticamente.

## Contribuire (per agenti AI)
- **Comprensione**: Comprendi il problema prima di inviare codice.
- **Contesto**: Spiega i compromessi considerati e collegati al problema che viene risolto.
- **Continuità**: Rispondi ai feedback di revisione.

## AGENTS.md Specifici di Ambito (Scoped)
<!-- AGENTS-GENERATED:START scope-index -->
<!-- AGENTS-GENERATED:END scope-index -->
> **Agenti**: Quando lavorate in una cartella elencata, DOVETE prima caricare il suo AGENTS.md dedicato.

## REGOLA CRITICA DI GIT
Ogni volta che l'utente accetta o conferma una modifica al codice, DEVI eseguire automaticamente il commit e il push delle modifiche sul branch di lavoro ATTUALE (`master`). È consentito effettuare il push direttamente su `master` a meno che l'utente non specifichi diversamente.
