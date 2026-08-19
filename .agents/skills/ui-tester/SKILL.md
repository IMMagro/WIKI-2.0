---
name: ui-tester
description: Analizza i componenti Angular (HTML e TS) per verificare l'integrità della UI, assicurandosi che tutti i bottoni e i link siano cablati e funzionanti (nessun link vuoto, direttive (click) corrette) e che gli stati delle modali/animazioni scattino come previsto. Usa questa skill quando l'utente chiede di "testare la UI", "controllare i pulsanti", o "verificare le funzionalità".
---

# UI Tester Skill

Questa skill ti guida nell'ispezione visiva e logica dei componenti frontend (in particolare Angular) per assicurarti che la UI sia pronta e priva di "buchi".

## Workflow di Ispezione

Ogni volta che invochi questa skill, esegui i seguenti controlli sul componente target:

1. **Check dei Bottoni e dei Link (HTML)**
   - Cerca tutti i tag `<button>` e `<a>`.
   - Verifica che i bottoni abbiano una direttiva `(click)="azione()"` o siano di tipo submit per un form.
   - Verifica che i link `<a>` abbiano un `href` valido (non `href="#"` vuoto) o un `routerLink`.
   - Segnala qualsiasi pulsante "fantasma" che non produce azioni.

2. **Check del Controller (TypeScript)**
   - Verifica che tutte le funzioni menzionate nell'HTML (es. `(click)="apriModale()"`) esistano nel file `.ts`.
   - Verifica che le variabili di stato legate all'UI (es. `*ngIf="isModalOpen"`) siano inizializzate.

3. **Check dell'Accessibilità e degli Stati**
   - I bottoni interattivi hanno uno stato in hover (es. `hover:bg-blue-600`) per dare feedback visivo all'utente?
   - Le modali si chiudono correttamente? (es. cliccando fuori o su un tasto "Chiudi").

4. **Correzione Proattiva**
   - Se trovi bottoni non funzionanti (es. un tasto "Salva" che non fa nulla), auto-fixa il codice inserendo una funzione di placeholder nel `.ts` (es. `console.log('Salva cliccato')`) e avvisa l'utente.

## Esempio di Utilizzo

```markdown
### Report UI Tester per app.component.html
- [x] Bottoni Navbar: OK (tutti collegano al (click)="cambiaTab()")
- [!] Bottone "Carica Manuale": **ERRORE** Manca l'evento (click). 
  - *Azione intrapresa*: Ho aggiunto `(click)="openUploadModal()"` nell'HTML e il metodo vuoto nel `.ts`.
```
