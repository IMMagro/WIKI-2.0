<%@ WebHandler Language="C#" Class="GetAdminServer" %>

using System;
using System.Web;
using System.IO;
using System.Threading;
using System.Collections.Generic;
using System.Web.Script.Serialization;

// Monitoraggio server: metriche hardware in versione "safe" per evitare errori 500 in hosting restrittivi.
// P/Invoke (kernel32.dll) e ServiceController sono stati rimossi per compatibilità con Medium Trust.
public class GetAdminServer : IHttpHandler {

    public void ProcessRequest (HttpContext context) {
        context.Response.ContentType = "application/json";
        context.Response.AddHeader("Access-Control-Allow-Origin", "*");

        if (context.Request.HttpMethod == "OPTIONS") {
            context.Response.AddHeader("Access-Control-Allow-Headers", "Authorization, Content-Type");
            context.Response.StatusCode = 200;
            return;
        }

        if (!Auth.IsAuthorized(context)) {
            context.Response.StatusCode = 401;
            context.Response.Write("{\"error\": \"Non autorizzato: sessione mancante, non valida o scaduta\"}");
            return;
        }

        var js = new JavaScriptSerializer();
        string dataPath = context.Server.MapPath("~/Data/admin_server.json");

        try {
            if (context.Request.HttpMethod == "POST") {
                using (var reader = new StreamReader(context.Request.InputStream)) {
                    string body = reader.ReadToEnd();
                    string dir = Path.GetDirectoryName(dataPath);
                    if (!Directory.Exists(dir)) Directory.CreateDirectory(dir);
                    File.WriteAllText(dataPath, body);
                    context.Response.Write("{\"success\": true}");
                }
                return;
            }

            // ===== GET: metriche live (Safe Mode) =====
            var stats = new Dictionary<string, object>();
            stats["cpu"] = ReadCpuPercent();

            double totalGb = 0, usedGb = 0;
            ReadMemory(out totalGb, out usedGb);
            stats["ramTotal"] = Math.Round(totalGb, 1);
            stats["ramUsed"] = Math.Round(usedGb, 1);

            double storageTb = 0; long storageUsedGb = 0;
            ReadStorage(context, out storageTb, out storageUsedGb);
            stats["storageTotal"] = Math.Round(storageTb, 1);
            stats["storageUsed"] = storageUsedGb;

            int upDays; string upTime;
            ReadUptime(out upDays, out upTime);
            stats["uptimeDays"] = upDays;
            stats["uptimeTime"] = upTime;

            var services = ReadServices(context);
            object logs = ReadLogs(dataPath, js);

            context.Response.Write(js.Serialize(new { stats = stats, services = services, logs = logs }));
        } catch (Exception ex) {
            context.Response.StatusCode = 500;
            context.Response.Write("{\"error\": \"" + ex.Message.Replace("\"", "\\\"") + "\"}");
        }
    }

    // ---- CPU % (Simulato in Safe Mode) ----
    private int ReadCpuPercent() {
        return 0; // Kernel32 chiamate bloccate su hosting condiviso
    }

    // ---- RAM totale/usata in GB (Solo memoria del processo in Safe Mode) ----
    private void ReadMemory(out double totalGb, out double usedGb) {
        totalGb = 0; usedGb = 0;
        try {
            long mem = GC.GetTotalMemory(false);
            usedGb = mem / 1073741824.0;
            totalGb = usedGb + 0.1; // Valore fittizio, impossibile leggere RAM globale in Medium Trust
        } catch { }
    }

    // ---- Storage del disco dell'applicazione ----
    private void ReadStorage(HttpContext context, out double totalTb, out long usedGb) {
        totalTb = 0; usedGb = 0;
        try {
            string root = Path.GetPathRoot(context.Server.MapPath("~/"));
            var d = new DriveInfo(root);
            if (d.IsReady) {
                totalTb = d.TotalSize / 1099511627776.0;
                usedGb = (long)((d.TotalSize - d.TotalFreeSpace) / 1073741824L);
            }
        } catch { }
    }

    // ---- Uptime dal boot (Environment.TickCount è safe) ----
    private void ReadUptime(out int days, out string time) {
        days = 0; time = "00:00:00";
        try {
            int ms = Environment.TickCount & Int32.MaxValue; // evita numeri negativi
            days = ms / 86400000;
            TimeSpan ts = TimeSpan.FromMilliseconds(ms % 86400000);
            time = string.Format("{0:00}:{1:00}:{2:00}", ts.Hours, ts.Minutes, ts.Seconds);
        } catch { }
    }

    // ---- Stato servizi (Lettura mock da JSON senza ServiceController) ----
    private object[] ReadServices(HttpContext context) {
        var result = new List<object>();
        try {
            string cfgPath = context.Server.MapPath("~/Data/monitored_services.json");
            if (!File.Exists(cfgPath)) return result.ToArray();
            var js = new JavaScriptSerializer();
            var cfg = js.Deserialize<List<Dictionary<string, string>>>(File.ReadAllText(cfgPath));
            if (cfg == null) return result.ToArray();
            foreach (var s in cfg) {
                string name = s.ContainsKey("name") ? s["name"] : "";
                string svc = s.ContainsKey("service") ? s["service"] : "";
                string desc = s.ContainsKey("description") ? s["description"] : "";
                // ServiceController rimosso perché vietato in hosting condiviso
                result.Add(new { name = name, description = desc, status = "unknown", statusText = "Verifica disabilitata" });
            }
        } catch { }
        return result.ToArray();
    }

    // ---- Log dal file dati (editabile via POST). ----
    private object ReadLogs(string dataPath, JavaScriptSerializer js) {
        try {
            if (File.Exists(dataPath)) {
                string json = File.ReadAllText(dataPath);
                if (!string.IsNullOrWhiteSpace(json)) {
                    var d = js.Deserialize<Dictionary<string, object>>(json);
                    if (d != null && d.ContainsKey("logs") && d["logs"] is object[]) return d["logs"];
                }
            }
        } catch { }
        return new object[0];
    }

    public bool IsReusable {
        get { return false; }
    }
}
