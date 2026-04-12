using System.Text.Json.Serialization;

namespace MauiApp1.ViewModels;

/// <summary>JSON body for <c>POST /api/v1/owner/pois</c>. Backend builds GeoJSON from <see cref="Location"/> lat/lng (see poi.service.js _buildLocationPayload).</summary>
public sealed class OwnerPoiSubmitRequest
{
    [JsonPropertyName("code")]
    public required string Code { get; init; }

    /// <summary>English display name; server maps to <c>content.en</c>.</summary>
    [JsonPropertyName("name")]
    public required string Name { get; init; }

    [JsonPropertyName("radius")]
    public double Radius { get; init; }

    [JsonPropertyName("location")]
    public required OwnerPoiLocationDto Location { get; init; }

    [JsonPropertyName("content")]
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public OwnerPoiContentDto? Content { get; init; }
}

public sealed class OwnerPoiLocationDto
{
    [JsonPropertyName("lat")]
    public double Lat { get; init; }

    [JsonPropertyName("lng")]
    public double Lng { get; init; }
}

public sealed class OwnerPoiContentDto
{
    [JsonPropertyName("vi")]
    public string? Vi { get; init; }
}
