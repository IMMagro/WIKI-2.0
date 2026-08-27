<%@ WebHandler Language="C#" Class="SaveSmartflowHandler" %>

using System;
using System.Web;
using System.IO;

public class SaveSmartflowHandler : IHttpHandler {
    
    public void ProcessRequest (HttpContext context) {
        context.Response.ContentType = "application/json";
        context.Response.AddHeader("Access-Control-Allow-Origin", "*");

        if (context.Request.HttpMethod == "OPTIONS") {
            context.Response.AddHeader("Access-Control-Allow-Headers", "Authorization, Content-Type");
            context.Response.AddHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
            context.Response.StatusCode = 200;
            return;
        }
        
        string dataPath = context.Server.MapPath("~/Data/smartflow.json");
        
        try {
            if (context.Request.HttpMethod == "GET") {
                if (File.Exists(dataPath)) {
                    context.Response.Write(File.ReadAllText(dataPath));
                } else {
                    context.Response.Write("{\"operators\": [], \"drafts\": [], \"levels\": []}");
                }
            }
            else if (context.Request.HttpMethod == "POST") {
                using (var reader = new StreamReader(context.Request.InputStream)) {
                    string jsonBody = reader.ReadToEnd();
                    string dir = Path.GetDirectoryName(dataPath);
                    if (!Directory.Exists(dir)) Directory.CreateDirectory(dir);
                    File.WriteAllText(dataPath, jsonBody);
                    context.Response.Write("{\"success\": true}");
                }
            } else {
                context.Response.StatusCode = 405;
                context.Response.Write("{\"error\": \"Method not allowed\"}");
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
