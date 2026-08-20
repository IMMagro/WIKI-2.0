<%@ WebHandler Language="C#" Class="SaveManual" %>

using System;
using System.Web;
using System.IO;
using System.Collections.Generic;
using System.Web.Script.Serialization;

public class SaveManual : IHttpHandler {

    public void ProcessRequest (HttpContext context) {
        context.Response.ContentType = "application/json";
        context.Response.AddHeader("Access-Control-Allow-Origin", "*");

        if (context.Request.HttpMethod == "OPTIONS") {
            context.Response.AddHeader("Access-Control-Allow-Headers", "Authorization, Content-Type");
            context.Response.StatusCode = 200;
            return;
        }

        // --- AUTH VALIDATION ---
        if (!Auth.IsAuthorized(context)) {
            context.Response.StatusCode = 401;
            context.Response.Write("{\"error\": \"Non autorizzato: sessione mancante, non valida o scaduta\"}");
            return;
        }
        // -----------------------

        try {
            if (context.Request.HttpMethod == "POST") {
                using (var reader = new StreamReader(context.Request.InputStream)) {
                    string jsonBody = reader.ReadToEnd();
                    var js = new JavaScriptSerializer();
                    // increase MaxJsonLength if sending very large mdx files
                    js.MaxJsonLength = int.MaxValue;

                    var data = js.Deserialize<Dictionary<string, string>>(jsonBody);

                    if (data == null || !data.ContainsKey("category") || !data.ContainsKey("id") || !data.ContainsKey("content")) {
                        context.Response.StatusCode = 400;
                        context.Response.Write("{\"error\": \"Parametri mancanti. Richiesti: category, id, content\"}");
                        return;
                    }

                    // Sanitizza input per evitare path traversal
                    string category = data["category"].Replace(".", "").Replace("/", "").Replace("\\", "");
                    string id = data["id"].Replace(".", "").Replace("/", "").Replace("\\", "");
                    string content = data["content"];

                    if (string.IsNullOrEmpty(category) || string.IsNullOrEmpty(id)) {
                        context.Response.StatusCode = 400;
                        context.Response.Write("{\"error\": \"Category o ID non validi\"}");
                        return;
                    }

                    string folderPath = context.Server.MapPath($"~/Data/docs/{category}/{id}");
                    if (!Directory.Exists(folderPath)) {
                        Directory.CreateDirectory(folderPath);
                    }

                    string filePath = Path.Combine(folderPath, "index.mdx");
                    File.WriteAllText(filePath, content);

                    context.Response.Write("{\"success\": true, \"message\": \"Manuale salvato correttamente.\"}");
                }
            } else {
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
