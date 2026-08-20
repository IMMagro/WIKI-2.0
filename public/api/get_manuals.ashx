<%@ WebHandler Language="C#" Class="GetManuals" %>

using System;
using System.Web;
using System.IO;
using System.Collections.Generic;
using System.Web.Script.Serialization;
using System.Text.RegularExpressions;

public class GetManuals : IHttpHandler {
    
    public void ProcessRequest (HttpContext context) {
        context.Response.AppendHeader("Access-Control-Allow-Origin", "*");
        context.Response.ContentType = "application/json";
        
        string dataFolder = context.Server.MapPath("~/Data/docs");
        List<object> manuals = new List<object>();
        
        if (Directory.Exists(dataFolder)) {
            // Cerca tutti i file .mdx nelle sottocartelle
            string[] files = Directory.GetFiles(dataFolder, "*.mdx", SearchOption.AllDirectories);
            
            foreach (string file in files) {
                string fileName = Path.GetFileName(file);
                string relativePath = file.Replace(context.Server.MapPath("~/"), "").Replace("\\", "/");

                // Deriva id (cartella del manuale) e categoria (cartella superiore) dal percorso
                string docFolder = Path.GetDirectoryName(file);
                string id = Path.GetFileName(docFolder);
                string categoryRaw = Path.GetFileName(Path.GetDirectoryName(docFolder));
                // Pulisce il nome categoria: rimuove il prefisso numerico "NN_" e sostituisce gli underscore con spazi
                string category = Regex.Replace(categoryRaw ?? "", @"^\d+_", "").Replace("_", " ");
                if (string.IsNullOrEmpty(category)) category = "Generale";

                string content = File.ReadAllText(file);

                // Estrai il frontmatter YAML in modo semplice
                string title = "Manuale senza titolo";
                string description = "";

                Match titleMatch = Regex.Match(content, @"title:\s*""([^""]+)""");
                if (titleMatch.Success) title = titleMatch.Groups[1].Value;

                Match descMatch = Regex.Match(content, @"description:\s*""([^""]*)""");
                if (descMatch.Success) description = descMatch.Groups[1].Value;

                manuals.Add(new {
                    id = id,
                    category = category,
                    status = "Pubblicato",
                    title = title,
                    desc = description != "" ? description : "Manuale ufficiale: " + title,
                    fileUrl = "/" + relativePath,
                    readTime = "5 min"
                });
            }
        }
        
        JavaScriptSerializer js = new JavaScriptSerializer();
        context.Response.Write(js.Serialize(manuals));
    }
 
    public bool IsReusable {
        get { return false; }
    }
}
