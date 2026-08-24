<%@ WebHandler Language="C#" Class="GetGuides" %>

using System;
using System.Web;
using System.IO;

// Serve l'albero completo delle Guide (categorie -> guide -> FAQ -> step)
// da Data/guides.json. GET pubblico; POST protetto per il salvataggio da admin.
public class GetGuides : IHttpHandler {

    public void ProcessRequest (HttpContext context) {
        context.Response.ContentType = "application/json";
        context.Response.AddHeader("Access-Control-Allow-Origin", "*");

        if (context.Request.HttpMethod == "OPTIONS") {
            context.Response.AddHeader("Access-Control-Allow-Headers", "Authorization, Content-Type");
            context.Response.StatusCode = 200;
            return;
        }

        string dataPath = context.Server.MapPath("~/Data/guides.json");

        try {
            if (context.Request.HttpMethod == "GET") {
                if (File.Exists(dataPath)) {
                    context.Response.Write(File.ReadAllText(dataPath));
                } else {
                    context.Response.Write("{\"categories\": [], \"journey\": {\"intro\": \"\", \"steps\": []}}");
                }
            }
            else if (context.Request.HttpMethod == "POST") {
                // Scrittura riservata all'area admin
                if (!Auth.IsAuthorized(context)) {
                    context.Response.StatusCode = 401;
                    context.Response.Write("{\"error\": \"Non autorizzato: sessione mancante, non valida o scaduta\"}");
                    return;
                }
                using (var reader = new StreamReader(context.Request.InputStream)) {
                    string jsonBody = reader.ReadToEnd();
                    string dir = Path.GetDirectoryName(dataPath);
                    if (!Directory.Exists(dir)) Directory.CreateDirectory(dir);
                    File.WriteAllText(dataPath, jsonBody);
                    context.Response.Write("{\"success\": true}");
                }
            }
            else {
                context.Response.StatusCode = 405;
                context.Response.Write("{\"error\": \"Metodo non consentito\"}");
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
