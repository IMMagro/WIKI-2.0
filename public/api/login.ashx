<%@ WebHandler Language="C#" Class="Login" %>

using System;
using System.Web;
using System.IO;
using System.Collections.Generic;
using System.Web.Script.Serialization;

public class Login : IHttpHandler {

    public void ProcessRequest (HttpContext context) {
        context.Response.AppendHeader("Access-Control-Allow-Origin", "*");
        context.Response.AppendHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
        context.Response.AppendHeader("Access-Control-Allow-Headers", "Content-Type");

        if (context.Request.HttpMethod == "OPTIONS") {
            context.Response.StatusCode = 200;
            return;
        }

        context.Response.ContentType = "application/json";

        try {
            if (context.Request.HttpMethod == "POST") {
                using (var reader = new StreamReader(context.Request.InputStream)) {
                    string jsonBody = reader.ReadToEnd();
                    JavaScriptSerializer js = new JavaScriptSerializer();
                    var data = js.Deserialize<Dictionary<string, string>>(jsonBody);

                    string email = data.ContainsKey("email") ? data["email"] : "";
                    string password = data.ContainsKey("password") ? data["password"] : "";

                    string usersPath = context.Server.MapPath("~/Data/users.json");
                    if (File.Exists(usersPath)) {
                        string usersJson = File.ReadAllText(usersPath);
                        var users = js.Deserialize<List<Dictionary<string, string>>>(usersJson);

                        bool isValid = false;
                        foreach(var user in users) {
                            string storedEmail = user.ContainsKey("email") ? user["email"] : "";
                            string storedHash = user.ContainsKey("passwordHash") ? user["passwordHash"] : "";
                            if (storedEmail == email && Auth.VerifyPassword(password, storedHash)) {
                                isValid = true;
                                break;
                            }
                        }

                        if (isValid) {
                            string token = Auth.IssueToken(context);
                            context.Response.Write(js.Serialize(new { success = true, token = token }));
                        } else {
                            context.Response.StatusCode = 401;
                            context.Response.Write("{\"error\": \"Credenziali non valide\"}");
                        }
                    } else {
                        context.Response.StatusCode = 500;
                        context.Response.Write("{\"error\": \"Database utenti mancante\"}");
                    }
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
