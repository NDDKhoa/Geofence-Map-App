using System.Text;
using System.Text.Json;

namespace MauiApp1.Services;

internal static class JwtPayloadHelper
{
    /// <summary>Returns true if JWT is missing, malformed, or past exp (with small clock skew).</summary>
    public static bool IsExpiredOrInvalid(string? jwt)
    {
        if (string.IsNullOrWhiteSpace(jwt))
            return true;

        var parts = jwt.Split('.');
        if (parts.Length < 2)
            return true;

        try
        {
            var json = Encoding.UTF8.GetString(Base64UrlDecode(parts[1]));
            using var doc = JsonDocument.Parse(json);
            if (!doc.RootElement.TryGetProperty("exp", out var expEl))
                return false;

            long expSec = expEl.ValueKind == JsonValueKind.Number
                ? expEl.GetInt64()
                : long.Parse(expEl.GetString() ?? "0", System.Globalization.CultureInfo.InvariantCulture);

            return DateTimeOffset.UtcNow.ToUnixTimeSeconds() >= expSec - 30;
        }
        catch
        {
            return true;
        }
    }

    private static byte[] Base64UrlDecode(string segment)
    {
        var s = segment.Replace('-', '+').Replace('_', '/');
        switch (s.Length % 4)
        {
            case 2: s += "=="; break;
            case 3: s += "="; break;
        }

        return Convert.FromBase64String(s);
    }
}
