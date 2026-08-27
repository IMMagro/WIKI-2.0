<%@ WebHandler Language="C#" Class="SaveSmartflowHandler" %>

using System;
using System.Web;
using System.IO;

public class SaveSmartflowHandler : IHttpHandler {
    
    public void ProcessRequest (HttpContext context) {
        context.Response.ContentType = "application/json";
        context.Response.AddHeader("Access-Control-Allow-Origin", "*");
        
        string dataPath = context.Server.MapPath("~/Data/smartflow.json");
        
        try {
            if (context.Request.HttpMethod == "POST") {
                using (var reader = new StreamReader(context.Request.InputStream)) {
                    string jsonBody = reader.ReadToEnd();
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
