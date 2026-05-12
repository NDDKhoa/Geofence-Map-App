namespace MauiApp1.ApplicationContracts.Services;

/// <summary>
/// Service to check device hardware/performance capabilities.
/// </summary>
public interface IDeviceCapabilityService
{
    /// <summary>
    /// Returns true if the device is simulated as high-performance.
    /// </summary>
    bool IsHighPerformance();
}
