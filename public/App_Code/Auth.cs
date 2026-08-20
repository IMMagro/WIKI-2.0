using System;
using System.IO;
using System.Web;
using System.Collections.Generic;
using System.Security.Cryptography;
using System.Web.Script.Serialization;

/// <summary>
/// Helper condiviso per l'autenticazione admin.
/// Centralizza l'hashing delle password (PBKDF2-HMAC-SHA256) e la
/// validazione dei token di sessione con scadenza (TTL).
/// Usato da login.ashx e da tutti gli handler protetti.
/// </summary>
public static class Auth
{
    // Durata di validità di un token di sessione admin
    public static readonly TimeSpan TokenTtl = TimeSpan.FromHours(8);

    private const int Pbkdf2Iterations = 100000;
    private const int SaltSize = 16;
    private const int KeySize = 32;

    // ------------------ PASSWORD HASHING ------------------

    /// <summary>Genera un hash PBKDF2-HMAC-SHA256 con salt casuale.</summary>
    public static string HashPassword(string password)
    {
        byte[] salt = new byte[SaltSize];
        using (var rng = RandomNumberGenerator.Create()) { rng.GetBytes(salt); }
        byte[] key;
        using (var pbkdf2 = new Rfc2898DeriveBytes(password, salt, Pbkdf2Iterations, HashAlgorithmName.SHA256))
        {
            key = pbkdf2.GetBytes(KeySize);
        }
        return "pbkdf2$sha256$" + Pbkdf2Iterations + "$"
             + Convert.ToBase64String(salt) + "$"
             + Convert.ToBase64String(key);
    }

    /// <summary>Verifica una password in chiaro contro il valore memorizzato.</summary>
    public static bool VerifyPassword(string password, string stored)
    {
        if (string.IsNullOrEmpty(stored) || password == null) return false;
        string[] parts = stored.Split('$');
        if (parts.Length != 5 || parts[0] != "pbkdf2") return false;

        int iterations;
        if (!int.TryParse(parts[2], out iterations)) return false;

        byte[] salt, expected;
        try
        {
            salt = Convert.FromBase64String(parts[3]);
            expected = Convert.FromBase64String(parts[4]);
        }
        catch { return false; }

        byte[] actual;
        using (var pbkdf2 = new Rfc2898DeriveBytes(password, salt, iterations, HashAlgorithmName.SHA256))
        {
            actual = pbkdf2.GetBytes(expected.Length);
        }
        return FixedTimeEquals(actual, expected);
    }

    // Confronto a tempo costante per non esporre timing attack
    private static bool FixedTimeEquals(byte[] a, byte[] b)
    {
        if (a == null || b == null || a.Length != b.Length) return false;
        int diff = 0;
        for (int i = 0; i < a.Length; i++) diff |= a[i] ^ b[i];
        return diff == 0;
    }

    // ------------------ TOKEN MANAGEMENT ------------------

    private static string TokensPath(HttpContext context)
    {
        return context.Server.MapPath("~/Data/tokens.json");
    }

    /// <summary>
    /// Genera un nuovo token di sessione, rimuove quelli scaduti e persiste lo store.
    /// </summary>
    public static string IssueToken(HttpContext context)
    {
        var js = new JavaScriptSerializer();
        string path = TokensPath(context);

        var map = new Dictionary<string, object>();
        if (File.Exists(path))
        {
            string json = File.ReadAllText(path);
            if (!string.IsNullOrWhiteSpace(json))
            {
                var existing = js.Deserialize<Dictionary<string, object>>(json);
                if (existing != null) map = existing;
            }
        }

        PruneExpired(map);

        string token = Guid.NewGuid().ToString("N");
        map[token] = DateTime.UtcNow.ToString("o");

        string dir = Path.GetDirectoryName(path);
        if (!Directory.Exists(dir)) Directory.CreateDirectory(dir);
        File.WriteAllText(path, js.Serialize(map));
        return token;
    }

    /// <summary>
    /// Legge l'header Authorization ("Bearer ...") e valida il token.
    /// </summary>
    public static bool IsAuthorized(HttpContext context)
    {
        string authHeader = context.Request.Headers["Authorization"];
        if (string.IsNullOrEmpty(authHeader) || !authHeader.StartsWith("Bearer ")) return false;
        return ValidateToken(context, authHeader.Substring(7));
    }

    /// <summary>Valida un token: deve esistere e non essere scaduto.</summary>
    public static bool ValidateToken(HttpContext context, string token)
    {
        if (string.IsNullOrEmpty(token)) return false;
        string path = TokensPath(context);
        if (!File.Exists(path)) return false;

        string json = File.ReadAllText(path);
        if (string.IsNullOrWhiteSpace(json)) return false;

        var js = new JavaScriptSerializer();
        var map = js.Deserialize<Dictionary<string, object>>(json);
        if (map == null || !map.ContainsKey(token)) return false;

        DateTime issued;
        if (!TryParseIssued(map[token], out issued)) return false;

        if (DateTime.UtcNow - issued.ToUniversalTime() > TokenTtl)
        {
            // Token scaduto: rimuovilo dallo store e rifiuta
            map.Remove(token);
            File.WriteAllText(path, js.Serialize(map));
            return false;
        }
        return true;
    }

    private static bool TryParseIssued(object value, out DateTime issued)
    {
        issued = DateTime.MinValue;
        if (value == null) return false;
        if (value is DateTime) { issued = (DateTime)value; return true; }
        return DateTime.TryParse(value.ToString(), null,
            System.Globalization.DateTimeStyles.RoundtripKind, out issued);
    }

    private static void PruneExpired(Dictionary<string, object> map)
    {
        var expired = new List<string>();
        foreach (var kv in map)
        {
            DateTime issued;
            if (!TryParseIssued(kv.Value, out issued) ||
                DateTime.UtcNow - issued.ToUniversalTime() > TokenTtl)
            {
                expired.Add(kv.Key);
            }
        }
        foreach (var k in expired) map.Remove(k);
    }
}
