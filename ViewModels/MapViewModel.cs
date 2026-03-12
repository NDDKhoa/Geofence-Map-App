using System.ComponentModel;
using System.Runtime.CompilerServices;
using System.Text.Json;
using Microsoft.Maui.Devices.Sensors;
using MauiApp1.Models;
using MauiApp1.Services;

namespace MauiApp1.ViewModels;

public class MapViewModel : INotifyPropertyChanged
{
    private readonly LocationService _locationService;
    private readonly GeofenceService _geofenceService;
    private readonly PoiDatabase _db;
    private readonly AudioService _audioService;
    public string CurrentLanguage { get; set; } = "vi";

    public MapViewModel(
    LocationService locationService,
    GeofenceService geofenceService,
    PoiDatabase db,
    AudioService audioService)
    {
        _locationService = locationService;
        _geofenceService = geofenceService;
        _db = db;
        _audioService = audioService;

        CurrentLanguage = "vi";
        _geofenceService.CurrentLanguage = CurrentLanguage;
    }

    private Location? _currentLocation;
    public Location? CurrentLocation
    {
        get => _currentLocation;
        private set
        {
            _currentLocation = value;
            OnPropertyChanged();
        }
    }

    private List<Poi> _pois = new();
    public IReadOnlyList<Poi> Pois => _pois.AsReadOnly();

    public async Task UpdateLocationAsync()
    {
        var loc = await _locationService.GetCurrentLocationAsync();
        if (loc == null) return;

        CurrentLocation = loc;
        await _geofenceService.CheckLocationAsync(loc);
    }

    public void SetPois(IEnumerable<Poi> pois)
    {
        _pois = pois.ToList();
        _geofenceService.UpdatePois(_pois);
        OnPropertyChanged(nameof(Pois));
    }

    public void SetLanguage(string language)
    {
        CurrentLanguage = string.IsNullOrWhiteSpace(language) ? "vi" : language;
        _geofenceService.CurrentLanguage = CurrentLanguage;

        OnPropertyChanged(nameof(CurrentLanguage));
        OnPropertyChanged(nameof(Pois));
    }

    public async Task PlayPoiAsync(Poi poi, string? lang = null)
    {
        var language = string.IsNullOrWhiteSpace(lang) ? CurrentLanguage : lang;

        var text = poi.GetDescription(language!);
        if (string.IsNullOrWhiteSpace(text))
            text = poi.GetName(language!);

        if (!string.IsNullOrWhiteSpace(text))
            await _audioService.SpeakAsync(text, language!);
    }

    private async Task<List<Poi>> LoadPoisFromJsonAsync()
    {
        using var stream = await FileSystem.OpenAppPackageFileAsync("pois.json");
        using var reader = new StreamReader(stream);

        var json = await reader.ReadToEndAsync();

        var seeds = JsonSerializer.Deserialize<List<PoiSeed>>(json,
            new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            }) ?? new List<PoiSeed>();

        return seeds
            .Where(s => !string.IsNullOrWhiteSpace(s.code))
            .Select(s =>
            {
                var poi = new Poi
                {
                    Code = s.code.Trim(),
                    Latitude = s.latitude,
                    Longitude = s.longitude,
                    Radius = s.radius <= 0 ? 50 : s.radius,
                    Priority = s.priority
                };

                poi.LocalizedNames = s.name ?? new Dictionary<string, string>();
                poi.LocalizedDescriptions = s.description ?? new Dictionary<string, string>();

                poi.Name = poi.GetName("vi");
                poi.Description = poi.GetDescription("vi");

                return poi;
            })
            .ToList();
    }

    public async Task LoadPoisAsync()
    {
        await _db.InitAsync();

        var seedPois = await LoadPoisFromJsonAsync();
        await _db.UpsertManyAsync(seedPois);

        var pois = await _db.GetAllAsync();

        _pois = pois;
        _geofenceService.UpdatePois(_pois);
        OnPropertyChanged(nameof(Pois));
    }

    public event PropertyChangedEventHandler? PropertyChanged;

    private void OnPropertyChanged([CallerMemberName] string name = "")
        => PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(name));
}