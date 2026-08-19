---
name: mock-data-cleaner
description: Rimuove i dati hardcoded di prova (mock data) dai componenti Angular. Usa questa skill quando l'utente chiede di "svuotare i dati di prova", "pulire il componente" o "collegare il backend" per preparare il codice all'integrazione con chiamate HTTP reali.
---

# Mock Data Cleaner Skill

Questa skill serve a "pulire lo sporco" generato durante la fase di prototipazione, dove array e oggetti finti vengono inseriti direttamente nei file `.ts` (come `app.component.ts`) per testare la UI.

## Workflow di Pulizia

Quando applichi questa skill su un componente (es. `app.component.ts`), segui rigorosamente questi step:

1. **Identifica i Mock Data**
   - Cerca array giganti o oggetti hardcoded (es. liste di manuali, notizie finte, statistiche statiche) che sono chiaramente dati temporanei.

2. **Svuota le Variabili**
   - Non cancellare la dichiarazione della variabile, ma svuotala.
   - Es: `documents = [{ title: '...', ... }]` diventa `documents: any[] = [];`.
   - Se c'erano interfacce, cerca di tipizzare l'array vuoto.

3. **Crea Placeholder per HTTP**
   - Aggiungi un commento del tipo `// TODO: Popolare tramite chiamata HTTP al backend (es. /api/manuals.ashx)` vicino alla variabile svuotata.
   - Crea (o aggiorna) il metodo `ngOnInit()` per invocare eventuali funzioni di caricamento dati (es. `this.loadDocuments();`).
   - Crea i metodi vuoti `loadDocuments() { ... }` pronti per accogliere il servizio `HttpClient`.

4. **Verifica l'Impatto sull'HTML**
   - Assicurati che l'HTML (es. `*ngFor="let doc of documents"`) sia compatibile con un array vuoto (non deve crasciare, semplicemente mostrerà zero elementi o un messaggio "Nessun documento trovato").
   - Se l'UI appare troppo "rotta" senza dati, aggiungi un controllo `*ngIf="documents.length === 0"` con un messaggio di caricamento o di stato vuoto ben formattato in Tailwind.

## Esempio di Utilizzo

L'utente ti dice: *"Usa la mock-data-cleaner per svuotare i manuali."*

Tu eseguirai un `replace_file_content` sul `.ts`:
```typescript
// PRIMA
documents = [
  { title: 'Manuale Utente', date: '...' },
  { title: 'Modulo Privacy', date: '...' }
];

// DOPO
documents: any[] = []; 
// TODO: Recuperare dal backend tramite HTTP GET a /api/manuals.ashx

ngOnInit() {
  this.loadDocuments();
}

loadDocuments() {
  // Integrazione API da fare qui
}
```
