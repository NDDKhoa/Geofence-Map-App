using System.ComponentModel;
using System.Runtime.CompilerServices;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Windows.Input;
using MauiApp1.Services;

namespace MauiApp1.ViewModels;

/// <summary>Form gửi POI qua <c>POST /api/v1/owner/pois</c> (OWNER → PENDING).</summary>
public sealed class OwnerSubmitViewModel : INotifyPropertyChanged
{
    private static readonly JsonSerializerOptions JsonWrite = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
    };

    private readonly ApiService _api;
    private readonly AuthService _auth;

    private string _code = "";
    private string _nameEn = "";
    private string _nameVi = "";
    private string _lat = "";
    private string _lng = "";
    private string _radius = "50";
    private bool _isBusy;
    private string _statusMessage = "";

    public OwnerSubmitViewModel(ApiService api, AuthService auth)
    {
        _api = api;
        _auth = auth;
        SubmitCommand = new Command(() => _ = SubmitAsync(), () => !_isBusy && _auth.IsAuthenticated && _auth.IsOwner);
        _auth.PropertyChanged += (_, e) =>
        {
            if (e.PropertyName is nameof(AuthService.IsAuthenticated) or nameof(AuthService.IsOwner))
                MainThread.BeginInvokeOnMainThread(() => SubmitCommand.ChangeCanExecute());
        };
    }

    public event PropertyChangedEventHandler? PropertyChanged;

    public string Code
    {
        get => _code;
        set => SetField(ref _code, value);
    }

    public string NameEn
    {
        get => _nameEn;
        set => SetField(ref _nameEn, value);
    }

    public string NameVi
    {
        get => _nameVi;
        set => SetField(ref _nameVi, value);
    }

    public string Lat
    {
        get => _lat;
        set => SetField(ref _lat, value);
    }

    public string Lng
    {
        get => _lng;
        set => SetField(ref _lng, value);
    }

    public string Radius
    {
        get => _radius;
        set => SetField(ref _radius, value);
    }

    public bool IsBusy
    {
        get => _isBusy;
        private set
        {
            if (_isBusy == value) return;
            _isBusy = value;
            OnPropertyChanged();
            SubmitCommand.ChangeCanExecute();
        }
    }

    public string StatusMessage
    {
        get => _statusMessage;
        private set => SetField(ref _statusMessage, value);
    }

    public Command SubmitCommand { get; }

    private async Task SubmitAsync()
    {
        StatusMessage = "";
        if (!_auth.IsAuthenticated || !_auth.IsOwner)
        {
            await MainThread.InvokeOnMainThreadAsync(async () =>
                await Microsoft.Maui.Controls.Application.Current!.Windows[0].Page!.DisplayAlert("Loi", "Can dang nhap vai tro OWNER.", "OK"));
            return;
        }

        var code = Code.Trim();
        var nameEn = NameEn.Trim();
        if (string.IsNullOrEmpty(code) || string.IsNullOrEmpty(nameEn))
        {
            StatusMessage = "Ma (code) va ten tieng Anh la bat buoc.";
            return;
        }

        if (!double.TryParse(Lat.Trim(), System.Globalization.NumberStyles.Float,
                System.Globalization.CultureInfo.InvariantCulture, out var lat) ||
            !double.TryParse(Lng.Trim(), System.Globalization.NumberStyles.Float,
                System.Globalization.CultureInfo.InvariantCulture, out var lng))
        {
            StatusMessage = "Vi do va kinh do phai la so hop le.";
            return;
        }

        if (!double.TryParse(Radius.Trim(), System.Globalization.NumberStyles.Float,
                System.Globalization.CultureInfo.InvariantCulture, out var radius) ||
            radius < 1 || radius > 100_000)
        {
            StatusMessage = "Ban kinh (m) phai tu 1 den 100000.";
            return;
        }

        // Backend validatePoiInput expects: code, name, radius, location.lat/lng, optional content.vi — NOT raw GeoJSON from client.
        var body = new OwnerPoiSubmitRequest
        {
            Code = code,
            Name = nameEn,
            Radius = radius,
            Location = new OwnerPoiLocationDto { Lat = lat, Lng = lng },
            Content = string.IsNullOrWhiteSpace(NameVi)
                ? null
                : new OwnerPoiContentDto { Vi = NameVi.Trim() }
        };

        IsBusy = true;
        try
        {
            using var response = await _api.PostAsJsonAsync("owner/pois", body, JsonWrite, CancellationToken.None);
            var text = await response.Content.ReadAsStringAsync().ConfigureAwait(false);
            if (!response.IsSuccessStatusCode)
            {
                string msg = $"HTTP {(int)response.StatusCode}";
                try
                {
                    using var doc = JsonDocument.Parse(text);
                    if (doc.RootElement.TryGetProperty("error", out var err) &&
                        err.TryGetProperty("message", out var m))
                        msg = m.GetString() ?? msg;
                    else if (doc.RootElement.TryGetProperty("message", out var m2))
                        msg = m2.GetString() ?? msg;
                }
                catch
                {
                    if (!string.IsNullOrWhiteSpace(text)) msg = text.Length > 200 ? text[..200] : text;
                }

                StatusMessage = msg;
                await MainThread.InvokeOnMainThreadAsync(async () =>
                    await Microsoft.Maui.Controls.Application.Current!.Windows[0].Page!.DisplayAlert("Khong gui duoc", msg, "OK"));
                return;
            }

            Code = "";
            NameEn = "";
            NameVi = "";
            Lat = "";
            Lng = "";
            Radius = "50";
            StatusMessage = "";

            await MainThread.InvokeOnMainThreadAsync(async () =>
                await Microsoft.Maui.Controls.Application.Current!.Windows[0].Page!.DisplayAlert("Thanh cong",
                    "Da gui thanh cong, vui long cho Admin duyet.", "OK"));
        }
        catch (Exception ex)
        {
            StatusMessage = ex.Message;
            await MainThread.InvokeOnMainThreadAsync(async () =>
                await Microsoft.Maui.Controls.Application.Current!.Windows[0].Page!.DisplayAlert("Loi mang", ex.Message, "OK"));
        }
        finally
        {
            IsBusy = false;
        }
    }

    private void OnPropertyChanged([CallerMemberName] string? name = null)
        => PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(name));

    private void SetField<T>(ref T field, T value, [CallerMemberName] string? name = null)
    {
        if (Equals(field, value)) return;
        field = value;
        OnPropertyChanged(name);
    }
}
