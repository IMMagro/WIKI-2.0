<%@ WebHandler Language="C#" Class="UploadAsset" %>

using System;
using System.Web;
using System.IO;
using System.Collections.Generic;
using System.Web.Script.Serialization;

public class UploadAsset : IHttpHandler {

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
                if (context.Request.Files.Count == 0) {
                    context.Response.StatusCode = 400;
                    context.Response.Write("{\"error\": \"Nessun file ricevuto.\"}");
                    return;
                }

                HttpPostedFile file = context.Request.Files[0];
                string category = context.Request.Form["category"];
                string id = context.Request.Form["id"];

                if (string.IsNullOrEmpty(category) || string.IsNullOrEmpty(id)) {
                    context.Response.StatusCode = 400;
                    context.Response.Write("{\"error\": \"Category o ID non validi\"}");
                    return;
                }

                // Sanitizza parametri
                category = category.Replace(".", "").Replace("/", "").Replace("\\", "");
                id = id.Replace(".", "").Replace("/", "").Replace("\\", "");

                string fileName = Path.GetFileName(file.FileName);
                if (string.IsNullOrEmpty(fileName)) {
                    context.Response.StatusCode = 400;
                    context.Response.Write("{\"error\": \"Nome file non valido.\"}");
                    return;
                }

                string folderPath = context.Server.MapPath(string.Format("~/Data/docs/{0}/{1}/images", category, id));
                if (!Directory.Exists(folderPath)) {
                    Directory.CreateDirectory(folderPath);
                }

                string filePath = Path.Combine(folderPath, fileName);

                // Evita sovrascritture accidentali
                if (File.Exists(filePath)) {
                    string fileNameWithoutExt = Path.GetFileNameWithoutExtension(fileName);
                    string ext = Path.GetExtension(fileName);
                    fileName = string.Format("{0}_{1}{2}", fileNameWithoutExt, DateTime.Now.Ticks, ext);
                    filePath = Path.Combine(folderPath, fileName);
                }

                file.SaveAs(filePath);

                string fileUrl = string.Format("/Data/docs/{0}/{1}/images/{2}", category, id, fileName);

                var js = new JavaScriptSerializer();
                context.Response.Write(js.Serialize(new {
                    success = true,
                    url = fileUrl,
                    message = "File caricato con successo."
                }));

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
