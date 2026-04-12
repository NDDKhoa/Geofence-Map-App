namespace MauiApp1.Models;

public class QrParseResult
{
    public bool Success { get; set; }
    public string? Code { get; set; }
    public string? Error { get; set; }

    /// <summary>True when payload is a signed scan URL with <c>?t=</c> JWT (not a plain POI code).</summary>
    public bool IsSecureScanToken { get; set; }

    /// <summary>JWT from <c>?t=</c> for <see cref="IsSecureScanToken"/>.</summary>
    public string? ScanToken { get; set; }
}
