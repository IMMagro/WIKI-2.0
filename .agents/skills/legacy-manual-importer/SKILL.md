---
name: legacy-manual-importer
description: Converts and imports legacy Word/MD manuals from the 'Nuovo HELP clienti' folder into the official Wiki database.
---

# Legacy Manual Importer Skill

Usa questa skill quando l'utente ti chiede di "importare", "aggiungere" o "trascrivere" un vecchio manuale o documento di prova dai file locali verso la Wiki ufficiale (il file `Data/guides.json`).
La cartella dei documenti ufficiali è solitamente situata in:
`C:\Users\massimiliano.magrini\Desktop\Wiki-Agentic\Nuovo HELP clienti`

## Istruzioni per l'Agente

1. **Trova e Leggi il file:**
   Usa `run_command` (es. `Get-ChildItem`) o `view_file` per localizzare il file `.md` richiesto all'interno della cartella `Nuovo HELP clienti` (o altre cartelle indicate dall'utente).
   Leggi attentamente il contenuto testuale grezzo.

2. **Ristruttura e Genera il JSON:**
   Il sistema della Wiki-2.0 richiede una struttura ben precisa per i manuali. Converti il testo grezzo (che potrebbe contenere `[IMG]` o marcatori sparsi) in un JSON strutturato corrispondente all'interfaccia `Guide`:
   
   Esempio di output JSON atteso:
   ```json
   {
     "title": "Titolo della guida estrapolato o fornito",
     "desc": "Breve descrizione visibile nelle card della UI (max 100 char).",
     "overview": "Opzionale. Testo HTML o stringa introduttiva che viene mostrata all'inizio.",
     "faqs": [
       {
         "q": "Procedura Principale",
         "steps": [
           { "t": "Testo del primo step...", "img": false, "video": false },
           { "t": "Secondo step... <strong>puoi usare HTML</strong>.", "img": true, "video": false }
         ]
       },
       {
         "q": "Domanda Frequente aggiuntiva (se presente)",
         "extra": true,
         "steps": [
           { "t": "Testo della risposta..." }
         ]
       }
     ]
   }
   ```
   *Nota: Assicurati che i passaggi della procedura principale siano all'interno di una FAQ senza la property `extra`, mentre eventuali FAQ accessorie o Domande devono avere `"extra": true`.*

3. **Salva il JSON su disco:**
   Scrivi il JSON generato in un file temporaneo, ad esempio eseguendo: `Set-Content scratch/temp_manual.json $jsonString`
   (Puoi usare lo spazio di lavoro corrente per creare file temporanei).

4. **Esegui lo script di importazione:**
   Invoca lo script Node fornito in questa skill per iniettare il JSON nel database ufficiale.
   Comando:
   ```bash
   node .agents/skills/legacy-manual-importer/scripts/import_manual.js "<Nome_Categoria_Target>" "scratch/temp_manual.json"
   ```
   Sostituisci `<Nome_Categoria_Target>` con la categoria corretta (es. "Primi passi", "Agenda", "Utilizzatori", ecc.).
   Assicurati di eseguire il comando posizionato in `C:\Users\massimiliano.magrini\Desktop\Wiki-2.0` oppure passa i path assoluti.
   
5. **Aggiorna l'app e Verifica:**
   Poiché hai modificato `public/Data/guides.json`, copia immediatamente il file su `C:\Users\massimiliano.magrini\Desktop\wiki-bin\Data\guides.json` per rendere effettive le modifiche su IIS senza richiedere una nuova build.
   
   Comando di copia (PowerShell):
   ```powershell
   Copy-Item -Path "public\Data\guides.json" -Destination "C:\Users\massimiliano.magrini\Desktop\wiki-bin\Data\guides.json" -Force
   ```
