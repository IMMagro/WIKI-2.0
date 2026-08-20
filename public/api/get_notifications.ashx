<%@ WebHandler Language="C#" Class="GetNotifications" %>

using System;
using System.Web;
using System.IO;

public class GetNotifications : IHttpHandler {

    public void ProcessRequest (HttpContext context) {
        context.Response.ContentType = "application/json";
        context.Response.AddHeader("Access-Control-Allow-Origin", "*");

        if (context.Request.HttpMethod == "OPTIONS") {
            context.Response.AddHeader("Access-Control-Allow-Headers", "Authorization");
            context.Response.StatusCode = 200;
            return;
        }

        if (!Auth.IsAuthorized(context)) {
            context.Response.StatusCode = 401;
            context.Response.Write("{\"error\": \"Non autorizzato: sessione mancante, non valida o scaduta\"}");
            return;
        }

        string dataPath = context.Server.MapPath("~/Data/notifications.json");

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
