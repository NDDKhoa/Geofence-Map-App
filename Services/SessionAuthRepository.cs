using MauiApp1.ApplicationContracts.Repositories;

namespace MauiApp1.Services;

/// <summary>Maps current <see cref="AuthService"/> session to <see cref="IAuthRepository"/> for app layers that already depend on it.</summary>
public sealed class SessionAuthRepository : IAuthRepository
{
    private readonly AuthService _auth;

    public SessionAuthRepository(AuthService auth)
    {
        _auth = auth;
    }

    public Task<bool> IsAuthenticatedAsync(CancellationToken cancellationToken = default)
        => Task.FromResult(_auth.IsAuthenticated);

    public Task<string?> GetCurrentUserIdAsync(CancellationToken cancellationToken = default)
        => Task.FromResult(_auth.UserId);
}
