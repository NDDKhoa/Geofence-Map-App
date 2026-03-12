namespace MauiApp1.Models;

public class PoiSeed
{
    public string code { get; set; } = "";

    public Dictionary<string, string> name { get; set; } = new();
    public Dictionary<string, string> description { get; set; } = new();

    public double latitude { get; set; }
    public double longitude { get; set; }
    public double radius { get; set; }
    public int priority { get; set; }
}