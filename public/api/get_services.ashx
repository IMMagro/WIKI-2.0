<%@ WebHandler Language="C#" Class="GetServices" %>

using System;
using System.Web;
using System.IO;

public class GetServices : IHttpHandler {

    public void ProcessRequest (HttpContext context) {
        context.Response.ContentType = "application/json";
        context.Response.AddHeader("Access-Control-Allow-Origin", "*");

        if (context.Request.HttpMethod == "OPTIONS") {
            context.Response.AddHeader("Access-Control-Allow-Headers", "Content-Type");
            context.Response.StatusCode = 200;
            return;
        }

        string dataPath = context.Server.MapPath("~/Data/services.json");

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
                    string directory = Path.GetDirectoryName(dataPath);
                    if (!Directory.Exists(directory)) {
                        Directory.CreateDirectory(directory);
                    }
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
