<%@ WebHandler Language="C#" Class="RegisterOperator" %>

using System;
using System.Web;
using System.IO;
using System.Collections;
using System.Collections.Generic;
using System.Web.Script.Serialization;

public class RegisterOperator : IHttpHandler {

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
            context.Response.AddHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
            context.Response.StatusCode = 200;
            return;
        }

        try {
            if (context.Request.HttpMethod == "POST") {
                string jsonBody = "";
                using (StreamReader reader = new StreamReader(context.Request.InputStream)) {
                    jsonBody = reader.ReadToEnd();
                }

                if (string.IsNullOrEmpty(jsonBody)) {
                    context.Response.StatusCode = 400;
                    context.Response.Write("{\"error\": \"Dati mancanti\"}");
                    return;
                }

                JavaScriptSerializer js = new JavaScriptSerializer();
                js.MaxJsonLength = int.MaxValue;
                Dictionary<string, object> reqData = null;
                try {
                    reqData = js.Deserialize<Dictionary<string, object>>(jsonBody);
                } catch {
                    context.Response.StatusCode = 400;
                    context.Response.Write("{\"error\": \"Formato JSON non valido\"}");
                    return;
                }

                if (reqData == null) {
                    context.Response.StatusCode = 400;
                    context.Response.Write("{\"error\": \"Dati mancanti\"}");
                    return;
                }

                string name = reqData.ContainsKey("name") && reqData["name"] != null ? reqData["name"].ToString().Trim() : "";
                string emoji = reqData.ContainsKey("emoji") && reqData["emoji"] != null ? reqData["emoji"].ToString().Trim() : "🧑‍💻";
                string password = reqData.ContainsKey("password") && reqData["password"] != null ? reqData["password"].ToString() : "";
                string avatar = reqData.ContainsKey("avatar") && reqData["avatar"] != null ? reqData["avatar"].ToString() : "";

                if (string.IsNullOrEmpty(name)) {
                    context.Response.StatusCode = 400;
                    context.Response.Write("{\"error\": \"Il nome utente è obbligatorio\"}");
                    return;
                }

                if (string.Equals(name, "admin", StringComparison.OrdinalIgnoreCase)) {
                    context.Response.StatusCode = 400;
                    context.Response.Write("{\"error\": \"Il nome admin è riservato\"}");
                    return;
                }

                string smartflowPath = context.Server.MapPath("~/Data/smartflow.json");
                Dictionary<string, object> smartflowRoot = null;
                if (File.Exists(smartflowPath)) {
                    try {
                        string content = File.ReadAllText(smartflowPath);
                        if (!string.IsNullOrEmpty(content.Trim())) {
                            smartflowRoot = js.Deserialize<Dictionary<string, object>>(content);
                        }
                    } catch {
                        smartflowRoot = null;
                    }
                }

                if (smartflowRoot == null) {
                    smartflowRoot = new Dictionary<string, object>();
                    smartflowRoot["operators"] = new ArrayList();
                    smartflowRoot["drafts"] = new ArrayList();

                    ArrayList defaultLevels = new ArrayList();
                    Dictionary<string, object> l1 = new Dictionary<string, object>();
                    l1["level"] = 1; l1["name"] = "Barba"; l1["emoji"] = "🧔"; l1["minScore"] = 0; l1["color"] = "#A9B4BF";
                    defaultLevels.Add(l1);
                    Dictionary<string, object> l2 = new Dictionary<string, object>();
                    l2["level"] = 2; l2["name"] = "Minion"; l2["emoji"] = "👾"; l2["minScore"] = 50; l2["color"] = "#FFD700";
                    defaultLevels.Add(l2);
                    Dictionary<string, object> l3 = new Dictionary<string, object>();
                    l3["level"] = 3; l3["name"] = "Author"; l3["emoji"] = "✍️"; l3["minScore"] = 150; l3["color"] = "#10B981";
                    defaultLevels.Add(l3);
                    Dictionary<string, object> l4 = new Dictionary<string, object>();
                    l4["level"] = 4; l4["name"] = "Expert"; l4["emoji"] = "🎯"; l4["minScore"] = 350; l4["color"] = "#377DFF";
                    defaultLevels.Add(l4);
                    Dictionary<string, object> l5 = new Dictionary<string, object>();
                    l5["level"] = 5; l5["name"] = "Senior"; l5["emoji"] = "🔷"; l5["minScore"] = 600; l5["color"] = "#6366F1";
                    defaultLevels.Add(l5);
                    Dictionary<string, object> l6 = new Dictionary<string, object>();
                    l6["level"] = 6; l6["name"] = "Master"; l6["emoji"] = "👑"; l6["minScore"] = 1000; l6["color"] = "#F80086";
                    defaultLevels.Add(l6);
                    Dictionary<string, object> l7 = new Dictionary<string, object>();
                    l7["level"] = 7; l7["name"] = "Legend"; l7["emoji"] = "🌟"; l7["minScore"] = 2000; l7["color"] = "#FFD700";
                    defaultLevels.Add(l7);

                    smartflowRoot["levels"] = defaultLevels;
                }

                ArrayList operatorsList = null;
                if (smartflowRoot.ContainsKey("operators")) {
                    operatorsList = smartflowRoot["operators"] as ArrayList;
                }
                if (operatorsList == null) {
                    operatorsList = new ArrayList();
                    smartflowRoot["operators"] = operatorsList;
                }

                foreach (object item in operatorsList) {
                    Dictionary<string, object> existingOp = item as Dictionary<string, object>;
                    if (existingOp != null && existingOp.ContainsKey("name") && existingOp["name"] != null) {
                        string exName = existingOp["name"].ToString().Trim();
                        if (string.Equals(exName, name, StringComparison.OrdinalIgnoreCase)) {
                            context.Response.StatusCode = 400;
                            context.Response.Write("{\"error\": \"Nome utente già registrato\"}");
                            return;
                        }
                    }
                }

                string opId = "op-" + DateTime.UtcNow.Ticks.ToString();
                string nowStr = DateTime.Now.ToString("dd/MM/yyyy");

                Dictionary<string, object> newOp = new Dictionary<string, object>();
                newOp["id"] = opId;
                newOp["name"] = name;
                newOp["emoji"] = string.IsNullOrEmpty(emoji) ? "🧑‍💻" : emoji;
                newOp["avatar"] = avatar;
                newOp["password"] = password;
                newOp["score"] = 0;
                newOp["level"] = 1;
                newOp["levelName"] = "Barba";
                newOp["guidesCreated"] = 0;
                newOp["guidesApproved"] = 0;
                newOp["lastActivity"] = nowStr;
                newOp["registeredAt"] = nowStr;
                newOp["status"] = "pending";
                newOp["hasOnboarded"] = false;

                operatorsList.Add(newOp);

                string smartflowDir = Path.GetDirectoryName(smartflowPath);
                if (!Directory.Exists(smartflowDir)) {
                    Directory.CreateDirectory(smartflowDir);
                }
                File.WriteAllText(smartflowPath, js.Serialize(smartflowRoot));

                string notifPath = context.Server.MapPath("~/Data/notifications.json");
                ArrayList notifList = null;
                if (File.Exists(notifPath)) {
                    try {
                        string notifContent = File.ReadAllText(notifPath);
                        if (!string.IsNullOrEmpty(notifContent.Trim())) {
                            notifList = js.Deserialize<ArrayList>(notifContent);
                        }
                    } catch {
                        notifList = null;
                    }
                }
                if (notifList == null) {
                    notifList = new ArrayList();
                }

                Dictionary<string, object> newNotif = new Dictionary<string, object>();
                newNotif["id"] = "notif-" + DateTime.UtcNow.Ticks.ToString();
                newNotif["title"] = "Nuova registrazione operatore";
                newNotif["message"] = "L'operatore " + name + " (" + (string.IsNullOrEmpty(emoji) ? "🧑‍💻" : emoji) + ") richiede l'approvazione per accedere.";
                newNotif["time"] = "Adesso";
                newNotif["read"] = false;
                newNotif["unread"] = true;
                newNotif["type"] = "user_pending";
                newNotif["operatorId"] = opId;

                notifList.Insert(0, newNotif);

                string notifDir = Path.GetDirectoryName(notifPath);
                if (!Directory.Exists(notifDir)) {
                    Directory.CreateDirectory(notifDir);
                }
                File.WriteAllText(notifPath, js.Serialize(notifList));

                Dictionary<string, object> res = new Dictionary<string, object>();
                res["success"] = true;
                res["message"] = "Registrazione completata!";
                res["operator"] = newOp;

                context.Response.Write(js.Serialize(res));
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
