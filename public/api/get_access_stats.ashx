<%@ WebHandler Language="C#" Class="GetAccessStats" %>

using System;
using System.Web;
using System.IO;

// Serve le statistiche di accesso (heatmap giorno x ora + nodi mappa) da Data/access_stats.json.
// GET pubblico; POST protetto per eventuali correzioni dall'area admin.
public class GetAccessStats : IHttpHandler {

    public void ProcessRequest (HttpContext context) {
        context.Response.ContentType = "application/json";
        context.Response.AddHeader("Access-Control-Allow-Origin", "*");
        context.Response.Cache.SetCacheability(HttpCacheability.NoCache);
        context.Response.Cache.SetNoStore();
        context.Response.AddHeader("Cache-Control", "no-cache, no-store, must-revalidate");
        context.Response.AddHeader("Pragma", "no-cache");
        context.Response.AddHeader("Expires", "0");

        if (context.Request.HttpMethod == "OPTIONS") {
            context.Response.AddHeader("Access-Control-Allow-Headers", "Authorization, Content-Type");
            context.Response.StatusCode = 200;
            return;
        }

        string dataPath = context.Server.MapPath("~/Data/access_stats.json");

        try {
            if (context.Request.HttpMethod == "GET") {
                if (File.Exists(dataPath)) {
                    context.Response.Write(File.ReadAllText(dataPath));
                } else {
                    context.Response.Write("{\"heatmap\": [], \"mapNodes\": []}");
                }
            }
            else if (context.Request.HttpMethod == "POST") {
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
