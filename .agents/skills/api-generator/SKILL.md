---
name: api-generator
description: Crea handler API (.ashx) in C# standardizzati per IIS. Usa questa skill quando devi generare un nuovo endpoint backend per leggere o scrivere dati su file JSON o quando vuoi "creare un'API" per il frontend.
---

# API Generator Skill

Questa skill ti aiuta a scrivere file C# `.ashx` in modo pulito e omogeneo, garantendo che tutte le API scritte per l'infrastruttura IIS funzionino in modo coerente, leggano/scrivano su file JSON nella cartella `Data/` e gestiscano correttamente le intestazioni CORS e gli errori.

## Linee Guida per la Creazione delle API (.ashx)

Quando generi un nuovo file `.ashx`, devi **sempre** rispettare questo template standard:

1. **Intestazioni CORS e Content-Type**
   - Assicurati di includere gli header per permettere l'accesso se il frontend è su una porta diversa in fase di sviluppo (es. `Access-Control-Allow-Origin: *`).
   - Imposta sempre `context.Response.ContentType = "application/json";`.

2. **Gestione dei Verbi HTTP (GET, POST, PUT, DELETE)**
   - Usa `context.Request.HttpMethod` per discriminare l'operazione da eseguire.
   - Ad esempio: se è `GET`, leggi il file JSON. Se è `POST`, scrivi/aggiorna il file JSON.

3. **Lettura e Scrittura File JSON**
   - I dati devono sempre essere salvati in percorsi relativi alla root del server: `context.Server.MapPath("~/Data/nomefile.json")`.
   - Utilizza i metodi standard di `System.IO.File` (`ReadAllText`, `WriteAllText`).
   - Gestisci le eccezioni: se il file non esiste, crealo al volo come array vuoto `[]`.

4. **Gestione degli Errori**
   - Avvolgi la logica in un blocco `try-catch`.
   - In caso di eccezione, restituisci uno status code `500` con un JSON contenente `{"error": "messaggio di errore"}`.

## Esempio di Template .ashx (da usare come base)

```csharp
<%@ WebHandler Language="C#" Class="ApiHandler" %>

using System;
using System.Web;
using System.IO;

public class ApiHandler : IHttpHandler {
    
    public void ProcessRequest (HttpContext context) {
        context.Response.ContentType = "application/json";
        context.Response.AddHeader("Access-Control-Allow-Origin", "*");
        
        string dataPath = context.Server.MapPath("~/Data/example.json");
        
        try {
            if (context.Request.HttpMethod == "GET") {
                if (File.Exists(dataPath)) {
                    context.Response.Write(File.ReadAllText(dataPath));
                } else {
                    context.Response.Write("[]");
                }
            } 
            else if (context.Request.HttpMethod == "POST") {
                using (var reader = new StreamReader(context.Request.InputStream)) {
                    string jsonBody = reader.ReadToEnd();
                    File.WriteAllText(dataPath, jsonBody);
                    context.Response.Write("{\"success\": true}");
                }
            }
        } catch (Exception ex) {
            context.Response.StatusCode = 500;
            context.Response.Write("{\"error\": \"" + ex.Message.Replace("\"", "\\\"") + "\"}");
        }
    }
 
    public bool IsReusable {
        get { return false; }
    }
}
```
