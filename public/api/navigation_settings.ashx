<%@ WebHandler Language="C#" Class="NavigationSettingsHandler" %>

using System;
using System.IO;
using System.Web;
using System.Text;

public class NavigationSettingsHandler : IHttpHandler
{
    private static readonly object _fileLock = new object();
    private const string DefaultJson = @"[
  { ""id"": ""home"", ""label"": ""QeHome"", ""visible"": true },
  { ""id"": ""guide"", ""label"": ""Guide"", ""visible"": true },
  { ""id"": ""faq"", ""label"": ""FAQ"", ""visible"": true },
  { ""id"": ""servizi"", ""label"": ""Servizi"", ""visible"": true },
  { ""id"": ""news"", ""label"": ""News"", ""visible"": true }
]";

    public void ProcessRequest(HttpContext context)
    {
        context.Response.ContentType = "application/json";
        context.Response.AddHeader("Access-Control-Allow-Origin", "*");
        
        string dataFilePath = context.Server.MapPath("~/Data/navigation_settings.json");

        try
        {
            if (context.Request.HttpMethod == "GET")
            {
                lock (_fileLock)
                {
                    if (File.Exists(dataFilePath))
                    {
                        string json = File.ReadAllText(dataFilePath, Encoding.UTF8);
                        context.Response.Write(json);
                    }
                    else
                    {
                        // Create default file if it doesn't exist
                        Directory.CreateDirectory(Path.GetDirectoryName(dataFilePath));
                        File.WriteAllText(dataFilePath, DefaultJson, Encoding.UTF8);
                        context.Response.Write(DefaultJson);
                    }
                }
            }
            else if (context.Request.HttpMethod == "POST")
            {
                // Scrittura riservata all'area admin
                if (!Auth.IsAuthorized(context))
                {
                    context.Response.StatusCode = 401;
                    context.Response.Write("{\"error\": \"Non autorizzato: sessione mancante, non valida o scaduta\"}");
                    return;
                }
                using (var reader = new StreamReader(context.Request.InputStream, Encoding.UTF8))
                {
                    string newJson = reader.ReadToEnd();
                    if (!string.IsNullOrWhiteSpace(newJson))
                    {
                        lock (_fileLock)
                        {
                            Directory.CreateDirectory(Path.GetDirectoryName(dataFilePath));
                            File.WriteAllText(dataFilePath, newJson, Encoding.UTF8);
                        }
                        context.Response.Write("{\"success\": true}");
                    }
                    else
                    {
                        context.Response.StatusCode = 400;
                        context.Response.Write("{\"error\": \"Empty payload\"}");
                    }
                }
            }
            else if (context.Request.HttpMethod == "OPTIONS")
            {
                context.Response.AddHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
                context.Response.AddHeader("Access-Control-Allow-Headers", "Content-Type");
                context.Response.End();
            }
            else
            {
                context.Response.StatusCode = 405;
                context.Response.Write("{\"error\": \"Method not allowed\"}");
            }
        }
        catch (Exception ex)
        {
            context.Response.StatusCode = 500;
            string errorJson = string.Format("{{\"error\": \"{0}\"}}", ex.Message.Replace("\"", "\\\""));
            context.Response.Write(errorJson);
        }
    }

    public bool IsReusable
    {
        get { return false; }
    }
}
