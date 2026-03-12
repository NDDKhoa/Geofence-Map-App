using SQLite;
using System.Text.Json;

namespace MauiApp1.Models;

[Table("pois")]
public class Poi
{
    [PrimaryKey, AutoIncrement]
    public int Id { get; set; }

    [Indexed(Unique = true)]
    public string Code { get; set; } = "";

    public string Name { get; set; } = "";
    public string Description { get; set; } = "";

    public double Latitude { get; set; }
    public double Longitude { get; set; }

    public double Radius { get; set; } = 50;
    public int Priority { get; set; } = 1;

    public string LocalizedNamesJson { get; set; } = "{}";
    public string LocalizedDescriptionsJson { get; set; } = "{}";

    [Ignore]
    public Dictionary<string, string> LocalizedNames
    {
        get => DeserializeDict(LocalizedNamesJson);
        set => LocalizedNamesJson = JsonSerializer.Serialize(value ?? new Dictionary<string, string>());
    }

    [Ignore]
    public Dictionary<string, string> LocalizedDescriptions
    {
        get => DeserializeDict(LocalizedDescriptionsJson);
        set => LocalizedDescriptionsJson = JsonSerializer.Serialize(value ?? new Dictionary<string, string>());
    }

    public string GetName(string lang = "vi")
    {
        var names = LocalizedNames;
        if (names.TryGetValue(lang, out var value) && !string.IsNullOrWhiteSpace(value))
            return value;

        if (names.TryGetValue("vi", out var vi) && !string.IsNullOrWhiteSpace(vi))
            return vi;

        if (names.TryGetValue("en", out var en) && !string.IsNullOrWhiteSpace(en))
            return en;

        return Name;
    }

    public string GetDescription(string lang = "vi")
    {
        var descriptions = LocalizedDescriptions;
        if (descriptions.TryGetValue(lang, out var value) && !string.IsNullOrWhiteSpace(value))
            return value;

        if (descriptions.TryGetValue("vi", out var vi) && !string.IsNullOrWhiteSpace(vi))
            return vi;

        if (descriptions.TryGetValue("en", out var en) && !string.IsNullOrWhiteSpace(en))
            return en;

        return Description;
    }

    private static Dictionary<string, string> DeserializeDict(string? json)
    {
        if (string.IsNullOrWhiteSpace(json))
            return new Dictionary<string, string>();

        try
        {
            return JsonSerializer.Deserialize<Dictionary<string, string>>(json) ?? new Dictionary<string, string>();
        }
        catch
        {
            return new Dictionary<string, string>();
        }
    }
}