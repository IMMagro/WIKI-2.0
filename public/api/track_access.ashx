<%@ WebHandler Language="C#" Class="TrackAccess" %>

using System;
using System.Web;
using System.IO;
using System.Net;
using System.Globalization;
using System.Collections.Generic;
using System.Web.Script.Serialization;

// Registra e aggiorna il tracciamento in tempo reale degli accessi e dei manuali consultati:
//  - Gestione sessioni live (con sessionId, ip, region, guideId, guideTitle, category, lastPingUtc)
//  - Pulizia automatica delle sessioni con inattività > 60 secondi (TTL)
//  - Calcolo live concurrent sessions ('active') su ciascuna delle 20 regioni
//  - Raggruppamento 'liveGuides' (manuali attualmente aperti con conteggio lettori)
//  - Buffer circolare 'recentEvents' degli ultimi 15 eventi di consultazione guida
//  - Aggiornamento heatmap oraria e hit regionali ('v') solo su nuovi accessi (guide_view / page_view)
//  - Salvataggio atomico su Data/access_stats.json
public class TrackAccess : IHttpHandler {

    // Serializza le scritture concorrenti sul file (read-modify-write atomico)
    private static readonly object FileLock = new object();

    public void ProcessRequest (HttpContext context) {
        context.Response.ContentType = "application/json";
        context.Response.AddHeader("Access-Control-Allow-Origin", "*");

        if (context.Request.HttpMethod == "OPTIONS") {
            context.Response.AddHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
            context.Response.AddHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
            context.Response.StatusCode = 200;
            return;
        }
        if (context.Request.HttpMethod != "POST") {
            context.Response.StatusCode = 405;
            context.Response.Write("{\"error\": \"Metodo non consentito\"}");
            return;
        }

        try {
            // Lettura del body JSON
            string body = "";
            using (var reader = new StreamReader(context.Request.InputStream)) {
                body = reader.ReadToEnd();
            }

            var js = new JavaScriptSerializer();
            Dictionary<string, object> req = null;
            if (!string.IsNullOrWhiteSpace(body)) {
                try {
                    req = js.Deserialize<Dictionary<string, object>>(body);
                } catch { }
            }

            string type = req != null && req.ContainsKey("type") && req["type"] != null ? Convert.ToString(req["type"]) : "guide_view";
            string sessionId = req != null && req.ContainsKey("sessionId") && req["sessionId"] != null ? Convert.ToString(req["sessionId"]) : "";
            string guideId = req != null && req.ContainsKey("guideId") && req["guideId"] != null ? Convert.ToString(req["guideId"]) : "";
            string guideTitle = req != null && req.ContainsKey("guideTitle") && req["guideTitle"] != null ? Convert.ToString(req["guideTitle"]) : "";
            string category = req != null && req.ContainsKey("category") && req["category"] != null ? Convert.ToString(req["category"]) : "";
            string reqRegion = req != null && req.ContainsKey("region") && req["region"] != null ? Convert.ToString(req["region"]) : "";

            if (string.IsNullOrEmpty(sessionId)) {
                sessionId = Guid.NewGuid().ToString("N");
            }

            // Geo-IP FUORI dal lock (chiamata di rete verso ip-api): ottiene lat/lon o null
            double[] loc = null;
            string ip = GetClientIp(context);
            if (IsPublicIp(ip)) {
                loc = GeoLocate(ip);
            }

            string path = context.Server.MapPath("~/Data/access_stats.json");
            DateTime nowUtc = DateTime.UtcNow;
            DateTime nowLocal = DateTime.Now;

            lock (FileLock) {
                Dictionary<string, object> data;
                if (File.Exists(path)) {
                    string json = File.ReadAllText(path);
                    data = string.IsNullOrWhiteSpace(json) ? NewStats() : js.Deserialize<Dictionary<string, object>>(json);
                } else {
                    data = NewStats();
                }

                // Assicura la presenza della lista nodi mappa
                object[] mapNodesObj = (data.ContainsKey("mapNodes") ? data["mapNodes"] : null) as object[];
                if (mapNodesObj == null || mapNodesObj.Length == 0) {
                    mapNodesObj = GetDefaultMapNodes();
                    data["mapNodes"] = mapNodesObj;
                }

                // --- 1. Determinazione Regione ---
                string matchedRegion = !string.IsNullOrEmpty(reqRegion) ? reqRegion : "";
                int matchedNodeIdx = -1;

                if (loc != null && mapNodesObj != null) {
                    double best = double.MaxValue;
                    for (int i = 0; i < mapNodesObj.Length; i++) {
                        var n = mapNodesObj[i] as Dictionary<string, object>;
                        if (n == null || !n.ContainsKey("lat") || !n.ContainsKey("lng")) continue;
                        double nlat = ToDouble(n["lat"]);
                        double nlng = ToDouble(n["lng"]);
                        double dLat = nlat - loc[0], dLng = nlng - loc[1];
                        double dist = dLat * dLat + dLng * dLng;
                        if (dist < best) {
                            best = dist;
                            matchedNodeIdx = i;
                            matchedRegion = Convert.ToString(n["name"]);
                        }
                    }
                }

                if (string.IsNullOrEmpty(matchedRegion)) {
                    matchedRegion = "Lombardia";
                    for (int i = 0; i < mapNodesObj.Length; i++) {
                        var n = mapNodesObj[i] as Dictionary<string, object>;
                        if (n != null && Convert.ToString(n["name"]) == matchedRegion) {
                            matchedNodeIdx = i;
                            break;
                        }
                    }
                }

                // --- 2. Gestione Sessioni Live & TTL (60 secondi) ---
                List<object> sessionsList = new List<object>();
                if (data.ContainsKey("activeSessions") && data["activeSessions"] is object[]) {
                    sessionsList = new List<object>((object[])data["activeSessions"]);
                }

                List<Dictionary<string, object>> validSessions = new List<Dictionary<string, object>>();
                Dictionary<string, object> currentSession = null;

                foreach (var item in sessionsList) {
                    var sess = item as Dictionary<string, object>;
                    if (sess == null) continue;

                    string sId = sess.ContainsKey("sessionId") ? Convert.ToString(sess["sessionId"]) : "";
                    string lastPingStr = sess.ContainsKey("lastPingUtc") ? Convert.ToString(sess["lastPingUtc"]) : "";

                    DateTime lastPing;
                    if (DateTime.TryParse(lastPingStr, null, DateTimeStyles.AdjustToUniversal, out lastPing)) {
                        if ((nowUtc - lastPing).TotalSeconds <= 60.0) {
                            if (sId == sessionId) {
                                currentSession = sess;
                            } else {
                                validSessions.Add(sess);
                            }
                        }
                    }
                }

                // Aggiorna o crea la sessione corrente
                if (type != "guide_leave") {
                    if (currentSession == null) {
                        currentSession = new Dictionary<string, object>();
                        currentSession["sessionId"] = sessionId;
                    }
                    currentSession["ip"] = ip;
                    currentSession["region"] = matchedRegion;
                    currentSession["lastPingUtc"] = nowUtc.ToString("o");

                    if (type == "guide_view" || type == "guide_heartbeat") {
                        currentSession["guideId"] = guideId;
                        currentSession["guideTitle"] = guideTitle;
                        currentSession["category"] = category;
                    } else if (type == "page_view") {
                        currentSession["guideId"] = null;
                        currentSession["guideTitle"] = null;
                        currentSession["category"] = null;
                    }
                    validSessions.Add(currentSession);
                } else if (currentSession != null) {
                    // In caso di uscita esplicita, azzera i riferimenti alla guida
                    currentSession["guideId"] = null;
                    currentSession["guideTitle"] = null;
                    currentSession["category"] = null;
                    currentSession["lastPingUtc"] = nowUtc.ToString("o");
                    validSessions.Add(currentSession);
                }

                data["activeSessions"] = validSessions.ToArray();

                // --- 3. Calcolo utenti attivi per regione ('active') in mapNodes ---
                var regionCounts = new Dictionary<string, int>(StringComparer.OrdinalIgnoreCase);
                foreach (var sess in validSessions) {
                    if (sess.ContainsKey("region") && sess["region"] != null) {
                        string reg = Convert.ToString(sess["region"]);
                        if (!string.IsNullOrEmpty(reg)) {
                            if (!regionCounts.ContainsKey(reg)) regionCounts[reg] = 0;
                            regionCounts[reg]++;
                        }
                    }
                }

                for (int i = 0; i < mapNodesObj.Length; i++) {
                    var n = mapNodesObj[i] as Dictionary<string, object>;
                    if (n == null || !n.ContainsKey("name")) continue;
                    string regName = Convert.ToString(n["name"]);
                    int count = 0;
                    if (regionCounts.TryGetValue(regName, out count)) {
                        n["active"] = count;
                    } else {
                        n["active"] = 0;
                    }
                }

                // --- 4. Raggruppamento 'liveGuides' (manuali attualmente aperti) ---
                var guideMap = new Dictionary<string, Dictionary<string, object>>();
                foreach (var sess in validSessions) {
                    string gId = sess.ContainsKey("guideId") && sess["guideId"] != null ? Convert.ToString(sess["guideId"]) : "";
                    if (string.IsNullOrEmpty(gId)) continue;

                    string gTitle = sess.ContainsKey("guideTitle") && sess["guideTitle"] != null ? Convert.ToString(sess["guideTitle"]) : gId;
                    string gCat = sess.ContainsKey("category") && sess["category"] != null ? Convert.ToString(sess["category"]) : "";

                    if (!guideMap.ContainsKey(gId)) {
                        var gEntry = new Dictionary<string, object>();
                        gEntry["guideId"] = gId;
                        gEntry["title"] = gTitle;
                        gEntry["category"] = gCat;
                        gEntry["viewersCount"] = 1;
                        guideMap[gId] = gEntry;
                    } else {
                        guideMap[gId]["viewersCount"] = Convert.ToInt32(guideMap[gId]["viewersCount"]) + 1;
                    }
                }

                var liveGuidesList = new List<Dictionary<string, object>>(guideMap.Values);
                liveGuidesList.Sort((a, b) => Convert.ToInt32(b["viewersCount"]).CompareTo(Convert.ToInt32(a["viewersCount"])));
                data["liveGuides"] = liveGuidesList.ToArray();

                // --- 5. Aggiornamento Heatmap e Hit Totali (SOLO su nuovi accessi) ---
                if (type == "guide_view" || type == "page_view") {
                    int dow = ((int)nowLocal.DayOfWeek + 6) % 7; // lun=0 ... dom=6
                    int hour = nowLocal.Hour;

                    object[] heat = (data.ContainsKey("heatmap") ? data["heatmap"] : null) as object[];
                    if (heat == null || heat.Length < 7) { heat = NewHeatmap(); data["heatmap"] = heat; }
                    object[] row = heat[dow] as object[];
                    if (row == null || row.Length < 24) { row = NewRow(); heat[dow] = row; }
                    row[hour] = Convert.ToInt32(row[hour]) + 1;

                    if (matchedNodeIdx >= 0 && matchedNodeIdx < mapNodesObj.Length) {
                        var n = mapNodesObj[matchedNodeIdx] as Dictionary<string, object>;
                        if (n != null && n.ContainsKey("v")) {
                            n["v"] = Convert.ToInt32(n["v"]) + 1;
                        }
                    }
                }

                // --- 6. Buffer circolare 'recentEvents' (ultimi 15 eventi) ---
                if (type == "guide_view" && !string.IsNullOrEmpty(guideTitle)) {
                    List<object> eventsList = null;
                    if (data.ContainsKey("recentEvents") && data["recentEvents"] is object[]) {
                        eventsList = new List<object>((object[])data["recentEvents"]);
                    } else {
                        eventsList = new List<object>();
                    }

                    string sw = GetRegionSoftware(matchedRegion);
                    var ev = new Dictionary<string, object>();
                    ev["id"] = "ev_" + DateTime.UtcNow.Ticks;
                    ev["region"] = matchedRegion;
                    ev["guideTitle"] = guideTitle;
                    ev["category"] = category;
                    ev["time"] = nowLocal.ToString("HH:mm");
                    ev["software"] = sw;
                    ev["clientName"] = "Utente " + matchedRegion;
                    ev["action"] = "Apertura guida: " + guideTitle;
                    ev["color"] = GetSoftwareColor(sw);

                    eventsList.Insert(0, ev);
                    if (eventsList.Count > 15) {
                        eventsList = eventsList.GetRange(0, 15);
                    }
                    data["recentEvents"] = eventsList.ToArray();
                }

                // Salvataggio su file
                string dir = Path.GetDirectoryName(path);
                if (!Directory.Exists(dir)) Directory.CreateDirectory(dir);
                File.WriteAllText(path, js.Serialize(data));
            }

            context.Response.Write("{\"success\": true, \"sessionId\": \"" + sessionId + "\"}");
        } catch (Exception ex) {
            context.Response.StatusCode = 500;
            context.Response.Write("{\"error\": \"" + ex.Message.Replace("\"", "\\\"") + "\"}");
        }
    }

    // ---- Helper Software & Colori per Regione ----
    private string GetRegionSoftware(string region) {
        if (string.IsNullOrEmpty(region)) return "Windent";
        string r = region.ToLowerInvariant();
        if (r.Contains("lazio") || r.Contains("campania") || r.Contains("puglia") || 
            r.Contains("sicilia") || r.Contains("calabria") || r.Contains("basilicata") || 
            r.Contains("abruzzo") || r.Contains("molise")) {
            return "Poliwin";
        }
        if (r.Contains("emilia") || r.Contains("veneto") || r.Contains("trentino")) {
            return "Winodlab";
        }
        return "Windent";
    }

    private string GetSoftwareColor(string software) {
        if (software == "Poliwin") return "#F80086";
        if (software == "Winodlab") return "#F97316";
        return "#377DFF";
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
        } catch { /* geo non disponibile: fallback su default */ }
        return null;
    }

    private double ToDouble(object o) {
        return Convert.ToDouble(o, CultureInfo.InvariantCulture);
    }

    // ---- Strutture vuote ----
    private Dictionary<string, object> NewStats() {
        var d = new Dictionary<string, object>();
        d["heatmap"] = NewHeatmap();
        d["mapNodes"] = GetDefaultMapNodes();
        d["activeSessions"] = new object[0];
        d["liveGuides"] = new object[0];
        d["recentEvents"] = new object[0];
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

    private object[] GetDefaultMapNodes() {
        var nodes = new List<Dictionary<string, object>> {
            CreateNode("lom", "Lombardia", "LOM", "nord", 138.0, 92.0, 45.46, 9.19, 0, 0, "Windent"),
            CreateNode("laz", "Lazio", "LAZ", "centro", 245.0, 260.0, 41.90, 12.50, 0, 0, "Poliwin"),
            CreateNode("cam", "Campania", "CAM", "sud", 312.0, 312.0, 40.85, 14.27, 0, 0, "Poliwin"),
            CreateNode("ven", "Veneto", "VEN", "nord", 215.0, 92.0, 45.44, 12.32, 0, 0, "Winodlab"),
            CreateNode("emr", "Emilia-Romagna", "EMR", "nord", 188.0, 142.0, 44.49, 11.34, 0, 0, "Winodlab"),
            CreateNode("pug", "Puglia", "PUG", "sud", 382.0, 305.0, 41.12, 16.87, 0, 0, "Poliwin"),
            CreateNode("sic", "Sicilia", "SIC", "sud", 285.0, 460.0, 37.50, 14.20, 0, 0, "Poliwin"),
            CreateNode("tos", "Toscana", "TOS", "centro", 188.0, 188.0, 43.77, 11.25, 0, 0, "Windent"),
            CreateNode("pie", "Piemonte", "PIE", "nord", 72.3, 112.2, 45.07, 7.68, 0, 0, "Windent"),
            CreateNode("sar", "Sardegna", "SAR", "sud", 115.0, 345.0, 40.12, 9.01, 0, 0, "Windent"),
            CreateNode("lig", "Liguria", "LIG", "nord", 105.0, 152.0, 44.41, 8.93, 0, 0, "Windent"),
            CreateNode("mar", "Marche", "MAR", "centro", 260.0, 190.0, 43.61, 13.51, 0, 0, "Windent"),
            CreateNode("cal", "Calabria", "CAL", "sud", 370.0, 395.0, 38.91, 16.59, 0, 0, "Poliwin"),
            CreateNode("taa", "Trentino-Alto Adige", "TAA", "nord", 202.0, 54.0, 46.06, 11.12, 0, 0, "Winodlab"),
            CreateNode("fvg", "Friuli-Venezia Giulia", "FVG", "nord", 262.0, 68.0, 45.65, 13.77, 0, 0, "Windent"),
            CreateNode("abr", "Abruzzo", "ABR", "sud", 288.0, 242.0, 42.35, 13.40, 0, 0, "Poliwin"),
            CreateNode("umb", "Umbria", "UMB", "centro", 238.0, 208.0, 43.11, 12.39, 0, 0, "Windent"),
            CreateNode("bas", "Basilicata", "BAS", "sud", 360.0, 330.0, 40.64, 15.80, 0, 0, "Poliwin"),
            CreateNode("mol", "Molise", "MOL", "sud", 310.0, 268.0, 41.56, 14.66, 0, 0, "Poliwin"),
            CreateNode("vda", "Valle d'Aosta", "VDA", "nord", 60.0, 82.0, 45.73, 7.32, 0, 0, "Windent")
        };
        return nodes.ToArray();
    }

    private Dictionary<string, object> CreateNode(string id, string name, string code, string macroArea, double x, double y, double lat, double lng, int v, int active, string software) {
        var n = new Dictionary<string, object>();
        n["id"] = id;
        n["name"] = name;
        n["code"] = code;
        n["macroArea"] = macroArea;
        n["x"] = x;
        n["y"] = y;
        n["lat"] = lat;
        n["lng"] = lng;
        n["v"] = v;
        n["active"] = active;
        n["software"] = software;
        return n;
    }

    public bool IsReusable {
        get { return false; }
    }
}

