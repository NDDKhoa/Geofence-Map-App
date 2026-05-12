using MauiApp1.ApplicationContracts.Services;

namespace MauiApp1.Services;

/// <summary>
/// Mock implementation of IDeviceCapabilityService that simulates random device performance.
/// </summary>
public class DeviceCapabilityService : IDeviceCapabilityService
{
    private static readonly Random _random = new();

    /// <summary>
    /// Randomly returns true or false to simulate high or low performance configuration.
    /// </summary>
    public bool IsHighPerformance()
    {
        // Simulate 0/1 (50/50 chance)
        return _random.Next(2) == 1;
    }
}
