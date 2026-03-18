using Microsoft.Maui.Media;

namespace MauiApp1.Services;

public class AudioService
{
    private readonly SemaphoreSlim _speakGate = new(1, 1);
    private CancellationTokenSource? _currentCts;

    public async Task SpeakAsync(string text, string languageCode)
    {
        if (string.IsNullOrWhiteSpace(text))
            return;

        if (!await _speakGate.WaitAsync(0))
        {
            Stop(); // dừng cái cũ
            await _speakGate.WaitAsync();
        }

        try
        {
            _currentCts?.Cancel();
            _currentCts?.Dispose();
            _currentCts = new CancellationTokenSource();

            var locales = await TextToSpeech.Default.GetLocalesAsync();

            var selectedLocale = locales.FirstOrDefault(l =>
                string.Equals(l.Language, languageCode, StringComparison.OrdinalIgnoreCase))
                ?? locales.FirstOrDefault(l =>
                    l.Language.StartsWith(languageCode, StringComparison.OrdinalIgnoreCase));

            var options = new SpeechOptions
            {
                Pitch = 1.0f,
                Volume = 1.0f
            };

            if (selectedLocale != null)
                options.Locale = selectedLocale;

            await TextToSpeech.Default.SpeakAsync(text, options, _currentCts.Token);
        }
        catch (OperationCanceledException)
        {
            // bình thường khi bị stop hoặc thay audio mới
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"TTS error: {ex.Message}");
        }
        finally
        {
            _speakGate.Release();
        }
    }

    public void Stop()
    {
        try
        {
            _currentCts?.Cancel();
        }
        catch
        {
        }
    }
}