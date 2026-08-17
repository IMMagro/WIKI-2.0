<%@ WebHandler Language="C#" Class="GetManuals" %>

using System;
using System.Web;
using System.IO;
using System.Collections.Generic;
using System.Web.Script.Serialization;
using System.Linq;

public class GetManuals : IHttpHandler {
    
    public void ProcessRequest (HttpContext context) {
        // Imposta l'header CORS per sicurezza, utile se testi da localhost
        context.Response.AppendHeader("Access-Control-Allow-Origin", "*");
        context.Response.ContentType = "application/json";
        
        // Risolvi il percorso fisico della cartella Data sul server IIS
        string dataFolder = context.Server.MapPath("~/Data");
        
        List<object> manuals = new List<object>();
        
        if (Directory.Exists(dataFolder)) {
            // Cerca tutti i file .md (Markdown) nella cartella Data
            string[] files = Directory.GetFiles(dataFolder, "*.md");
            
            foreach (string file in files) {
                string fileName = Path.GetFileName(file);
                string title = Path.GetFileNameWithoutExtension(file);
                
                // Formatta il nome del file rimuovendo i trattini o gli underscore per il titolo visivo
                string cleanTitle = title.Replace("_", " ").Replace("-", " ");
                cleanTitle = System.Threading.Thread.CurrentThread.CurrentCulture.TextInfo.ToTitleCase(cleanTitle.ToLower());
                
                manuals.Add(new {
                    title = cleanTitle,
                    desc = "Manuale ufficiale: " + cleanTitle,
                    fileUrl = "/Data/" + fileName,
                    readTime = "5 min"
                });
            }
        }
        
        // Serializza la lista in JSON nativo
        JavaScriptSerializer js = new JavaScriptSerializer();
        context.Response.Write(js.Serialize(manuals));
    }
 
    public bool IsReusable {
        get { return false; }
    }
}
