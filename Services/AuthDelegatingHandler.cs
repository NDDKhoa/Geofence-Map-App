using System.Net;
using System.Net.Http.Headers;

namespace MauiApp1.Services;

/// <summary>Attaches Bearer token from <see cref="AuthTokenStore"/>; on 401 (except login) forces logout.</summary>
public sealed class AuthDelegatingHandler : DelegatingHandler
{
    private readonly AuthTokenStore _tokenStore;
    private readonly IServiceProvider _services;

    public AuthDelegatingHandler(AuthTokenStore tokenStore, IServiceProvider services)
    {
        _tokenStore = tokenStore;
        _services = services;
    }

    protected override async Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
    {
        var token = _tokenStore.Token;
        if (!string.IsNullOrEmpty(token))
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);

        var response = await base.SendAsync(request, cancellationToken).ConfigureAwait(false);

        if (response.StatusCode == HttpStatusCode.Unauthorized && !IsAuthLoginRequest(request))
        {
            try
            {
                var auth = _services.GetService<AuthService>();
                if (auth != null)
                    await auth.ForceLogoutFromUnauthorizedAsync().ConfigureAwait(false);
            }
            catch
            {
                // ignore secondary failures
            }
        }

        return response;
    }

    private static bool IsAuthLoginRequest(HttpRequestMessage request)
    {
        var path = request.RequestUri?.AbsolutePath ?? "";
        return path.EndsWith("/auth/login", StringComparison.OrdinalIgnoreCase);
    }
}
