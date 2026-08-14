---
name: agents-context-planner
description: "Ottimizza i file di contesto (es. AGENTS.md) rimuovendo informazioni ridondanti e documentando 'gotchas' operativi, e genera Piani di Implementazione strutturati per nuove funzionalità o refactoring."
allowed-tools: [Bash, Read, Write, Edit, Glob, Grep, AskUserQuestion]
---

# Agents Context & Planner (agents-md-optimizer)

Questa skill combina due funzionalità essenziali per la gestione di un progetto AI:
1. **Ottimizzazione del Contesto (AGENTS.md)**: Mantiene i file di istruzioni puliti, rimuovendo codice scopribile dinamicamente e conservando solo regole operative e "gotchas".
2. **Creazione Piani di Implementazione**: Genera file Markdown standardizzati e machine-readable per pianificare nuove funzionalità o refactoring complessi.

---

## ?? PARTE 1: Ottimizzazione Contesto (AGENTS.md)

### Regola d'Oro (Discoverability Filter)
Rimuovi dal file AGENTS.md (o simili) tutte le informazioni che un agente può scoprire da solo leggendo il codice (es. alberi delle directory, firme di funzioni). Mantieni solo le conoscenze **operative non scopribili** (es. convenzioni non standard, regole architetturali ferree, gotchas).

### Flusso Operativo
1. **Analisi Baseline**: Leggi il file target (es. AGENTS.md).
2. **Classificazione**: Dividi il contenuto in:
   - discoverable: Informazioni deducibili dal codice (DA RIMUOVERE).
   - operational: Regole, vincoli, architettura ad alto livello (DA TENERE).
   - erbose: Dettagli eccessivi (DA COMPRIMERE).
3. **Gotcha Mining**: Scansiona il codice (grep per TODO, FIXME, HACK, WARNING) per trovare regole implicite o difetti operativi non documentati da aggiungere al file.
4. **Aggiornamento File**: Proponi o applica (tramite Edit) la versione ottimizzata, strutturata come segue:
   - Descrizione progetto (1-2 righe)
   - Comandi di sviluppo critici
   - Regole di design / Custom Rules
   - Gotchas e Landmines

---

## ?? PARTE 2: Creazione Piani di Implementazione

Quando ti viene richiesto di creare un piano di implementazione (Implementation Plan) per una feature o un refactoring, **DEVI** utilizzare la struttura rigorosa descritta di seguito.

### Requisiti del Piano
- L'output deve essere testuale, deterministico, e privo di ambiguità (machine-readable).
- Usa il formato markdown e salva il file (se richiesto come file separato) come /plan/[scopo]-[componente].md oppure aggiorna il file di piano esistente fornito dall'utente.
- Le fasi devono essere indipendenti e parallele dove possibile, includendo riferimenti esatti ai file.

### Struttura Obbligatoria del Template

``md
---
goal: [Titolo del Piano]
date_created: [YYYY-MM-DD]
status: 'Planned' | 'In progress' | 'Completed'
tags: [feature, refactoring, bugfix, etc.]
---

# Introduzione
[Breve riepilogo dell'obiettivo]
![Status: Planned](https://img.shields.io/badge/status-Planned-blue)

## 1. Requisiti e Vincoli
- **REQ-001**: [Requisito 1]
- **CON-001**: [Vincolo architetturale 1]

## 2. Fasi di Implementazione

### Fase 1: [Nome Fase]
- **GOAL-001**: [Obiettivo della fase]

| Task ID | Descrizione Tecnica (file, funzioni) | Stato |
|---------|---------------------------------------|-------|
| TASK-001| Modificare fileA.ts riga 45...        | [ ]   |
| TASK-002| Creare componente Button.tsx          | [ ]   |

## 3. Alternative Scartate
- **ALT-001**: [Perché non si è scelto l'approccio X]

## 4. Test e Verifica
- **TEST-001**: [Comando o verifica manuale per testare TASK-001]
``

### Regole per gli Identificatori
- Ogni identificatore (REQ-001, TASK-001, GOAL-001) deve essere **unico e dichiarato una sola volta** come riga o elemento di tabella.
- Se lo stesso ID viene riutilizzato altrove, deve fungere solo da _riferimento_ (es. "Dipende da REQ-001").

---
**Nota per l'Agente Esecutore**: 
In base alla richiesta dell'utente, decidi se applicare la **PARTE 1** (se si chiede di pulire, ridurre o ottimizzare un file di regole come AGENTS.md) oppure la **PARTE 2** (se si chiede di pianificare una feature). Puoi anche combinare le due cose se devi aggiornare il contesto del progetto prima di pianificare una nuova funzione complessa.
