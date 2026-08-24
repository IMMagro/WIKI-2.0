<%@ WebHandler Language="C#" Class="TrackAccess" %>

using System;
using System.Web;
using System.IO;
using System.Net;
using System.Globalization;
using System.Collections.Generic;
using System.Web.Script.Serialization;

// Registra una visita:
//  - incrementa heatmap[giorno][ora] (ora del server)
//  - risolve l'IP del visitatore (geo-IP) e incrementa la citta' piu' vicina in mapNodes
// POST pubblico, chiamato dal frontend a ogni caricamento pagina. Fail-safe: se la geo
// fallisce, la heatmap temporale viene comunque aggiornata.
public class TrackAccess : IHttpHandler {

    // Serializza le scritture concorrenti sul file (read-modify-write atomico)
    private static readonly object FileLock = new object();

    public void ProcessRequest (HttpContext context) {
        context.Response.ContentType = "application/json";
        context.Response.AddHeader("Access-Control-Allow-Origin", "*");

        if (context.Request.HttpMethod == "OPTIONS") {
            context.Response.AddHeader("Access-Control-Allow-Headers", "Content-Type");
            context.Response.StatusCode = 200;
            return;
        }
        if (context.Request.HttpMethod != "POST") {
            context.Response.StatusCode = 405;
            context.Response.Write("{\"error\": \"Metodo non consentito\"}");
            return;
        }

        try {
            int dow = ((int)DateTime.Now.DayOfWeek + 6) % 7; // lun=0 ... dom=6
            int hour = DateTime.Now.Hour;

            // Geo-IP FUORI dal lock (chiamata di rete lenta): ottiene lat/lon o null
            double[] loc = null;
            string ip = GetClientIp(context);
            if (IsPublicIp(ip)) loc = GeoLocate(ip);

            string path = context.Server.MapPath("~/Data/access_stats.json");
            var js = new JavaScriptSerializer();

            lock (FileLock) {
                Dictionary<string, object> data;
                if (File.Exists(path)) {
                    string json = File.ReadAllText(path);
                    data = string.IsNullOrWhiteSpace(json) ? NewStats() : js.Deserialize<Dictionary<string, object>>(json);
                } else {
                    data = NewStats();
                }

                // --- heatmap temporale ---
                object[] heat = (data.ContainsKey("heatmap") ? data["heatmap"] : null) as object[];
                if (heat == null || heat.Length < 7) { heat = NewHeatmap(); data["heatmap"] = heat; }
                object[] row = heat[dow] as object[];
                if (row == null || row.Length < 24) { row = NewRow(); heat[dow] = row; }
                row[hour] = Convert.ToInt32(row[hour]) + 1;

                // --- mappa geografica (nodo citta' piu' vicino) ---
                if (loc != null && data.ContainsKey("mapNodes")) {
                    object[] nodes = data["mapNodes"] as object[];
                    if (nodes != null) {
                        int bestIdx = -1; double best = double.MaxValue;
                        for (int i = 0; i < nodes.Length; i++) {
                            var n = nodes[i] as Dictionary<string, object>;
                            if (n == null || !n.ContainsKey("lat") || !n.ContainsKey("lng")) continue;
                            double nlat = ToDouble(n["lat"]);
                            double nlng = ToDouble(n["lng"]);
                            double dLat = nlat - loc[0], dLng = nlng - loc[1];
                            double dist = dLat * dLat + dLng * dLng;
                            if (dist < best) { best = dist; bestIdx = i; }
                        }
                        if (bestIdx >= 0) {
                            var n = nodes[bestIdx] as Dictionary<string, object>;
                            n["v"] = Convert.ToInt32(n["v"]) + 1;
                        }
                    }
                }

                string dir = Path.GetDirectoryName(path);
                if (!Directory.Exists(dir)) Directory.CreateDirectory(dir);
                File.WriteAllText(path, js.Serialize(data));
            }

            context.Response.Write("{\"success\": true}");
        } catch (Exception ex) {
            context.Response.StatusCode = 500;
            context.Response.Write("{\"error\": \"" + ex.Message.Replace("\"", "\\\"") + "\"}");
        }
    }

    // ---- Geo-IP ----
    private string GetClientIp(HttpContext context) {
        string fwd = context.Request.Headers["X-Forwarded-For"];
        if (!string.IsNullOrEmpty(fwd)) {
            string first = fwd.Split(',')[0].Trim();
            if (!string.IsNullOrEmpty(first)) return first;
        }
        return context.Request.UserHostAddress;
    }

    private bool IsPublicIp(string ip) {
        if (string.IsNullOrEmpty(ip)) return false;
        if (ip == "127.0.0.1" || ip == "::1" || ip == "localhost") return false;
        if (ip.StartsWith("10.") || ip.StartsWith("192.168.") || ip.StartsWith("169.254.")) return false;
        if (ip.StartsWith("172.")) {
            string[] p = ip.Split('.');
            int second;
            if (p.Length > 1 && int.TryParse(p[1], out second) && second >= 16 && second <= 31) return false;
        }
        return true;
    }

    private double[] GeoLocate(string ip) {
        try {
            var req = (HttpWebRequest)WebRequest.Create("http://ip-api.com/json/" + ip + "?fields=status,lat,lon");
            req.Timeout = 2000;
            req.ReadWriteTimeout = 2000;
            req.UserAgent = "QeWiki-AccessTracker";
            using (var resp = (HttpWebResponse)req.GetResponse())
            using (var sr = new StreamReader(resp.GetResponseStream())) {
                string body = sr.ReadToEnd();
                var js = new JavaScriptSerializer();
                var m = js.Deserialize<Dictionary<string, object>>(body);
                if (m != null && m.ContainsKey("status") && Convert.ToString(m["status"]) == "success"
                    && m.ContainsKey("lat") && m.ContainsKey("lon")) {
                    return new double[] { ToDouble(m["lat"]), ToDouble(m["lon"]) };
                }
            }
        } catch { /* geo non disponibile: si aggiorna solo la heatmap temporale */ }
        return null;
    }

    private double ToDouble(object o) {
        return Convert.ToDouble(o, CultureInfo.InvariantCulture);
    }

    // ---- Strutture vuote ----
    private Dictionary<string, object> NewStats() {
        var d = new Dictionary<string, object>();
        d["heatmap"] = NewHeatmap();
        d["mapNodes"] = new object[0];
        return d;
    }
    private object[] NewHeatmap() {
        var rows = new object[7];
        for (int i = 0; i < 7; i++) rows[i] = NewRow();
        return rows;
    }
    private object[] NewRow() {
        var r = new object[24];
        for (int h = 0; h < 24; h++) r[h] = 0;
        return r;
    }

    public bool IsReusable {
        get { return false; }
    }
}
