using System.Net.Http.Json;
using System.Text.Json;

namespace MauiApp1.Services;

/// <summary>HTTP API client for protected backend routes (JWT injected by <see cref="AuthDelegatingHandler"/>).</summary>
public sealed class ApiService
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true
    };

    private readonly HttpClient _httpClient;

    public ApiService(HttpClient httpClient)
    {
        _httpClient = httpClient;
    }

    public Task<HttpResponseMessage> GetAsync(string relativeUri, CancellationToken cancellationToken = default)
        => _httpClient.GetAsync(relativeUri, cancellationToken);

    public Task<HttpResponseMessage> PostAsJsonAsync<T>(string relativeUri, T value, CancellationToken cancellationToken = default)
        => _httpClient.PostAsJsonAsync(relativeUri, value, JsonOptions, cancellationToken);

    public Task<HttpResponseMessage> PostAsJsonAsync<T>(string relativeUri, T value, JsonSerializerOptions jsonOptions, CancellationToken cancellationToken = default)
        => _httpClient.PostAsJsonAsync(relativeUri, value, jsonOptions, cancellationToken);

    public async Task<T?> ReadFromJsonAsync<T>(HttpResponseMessage response, CancellationToken cancellationToken = default)
        => await response.Content.ReadFromJsonAsync<T>(JsonOptions, cancellationToken).ConfigureAwait(false);
}
