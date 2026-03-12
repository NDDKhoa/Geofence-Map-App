using Microsoft.Maui.Media;

namespace MauiApp1.Services;

public class AudioService
{
    private readonly SemaphoreSlim _audioGate = new(1, 1);

    public async Task SpeakAsync(string text, string languageCode = "vi")
    {
        if (!await _audioGate.WaitAsync(0)) return;

        try
        {
            var locales = await TextToSpeech.GetLocalesAsync();
            var locale = locales.FirstOrDefault(l =>
                string.Equals(l.Language, languageCode, StringComparison.OrdinalIgnoreCase));

            var options = new SpeechOptions
            {
                Locale = locale
            };

            await TextToSpeech.SpeakAsync(text, options);
        }
        finally
        {
            _audioGate.Release();
        }
    }
}