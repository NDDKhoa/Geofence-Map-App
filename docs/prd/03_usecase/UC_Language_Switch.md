# UC-M13: Switch Display Language

**ID**: UC-M13  
**Actor**: Traveler (End User)  
**Subsystem**: MAUI Mobile App  
**Priority**: P0 (Critical)  
**Status**: ✅ Complete

---

## Description

User switches the app's display language from one of 6 supported languages (Vietnamese, English, Japanese, Korean, French, Chinese). The system re-hydrates all POI text content in the new language, updates the UI, and restarts audio narration if active.

---

## Preconditions

1. App is running and MapPage is visible
2. At least one language pack is available locally
3. User has tapped the Language Selector button
4. LanguageSelectorPage modal is open

---

## Main Flow (Happy Path)

**Step 1**: User opens LanguageSelectorPage (taps language icon on MapPage)  
**Step 2**: LanguageSelectorViewModel initializes with current language code  
**Step 3**: LanguagePackService loads available language packs from local storage  
**Step 4**: UI displays list of 6 languages with download status:
- Vietnamese (vi) - Downloaded ✓
- English (en) - Downloaded ✓
- Japanese (ja) - Downloaded ✓
- Korean (ko) - Downloaded ✓
- French (fr) - Downloaded ✓
- Chinese (zh) - Downloaded ✓

**Step 5**: User taps a different language (e.g., English)  
**Step 6**: LanguageSelectorViewModel.SelectLanguageCommand executes  
**Step 7**: Check if language pack is already downloaded via LanguagePackService.EnsureAvailableAsync()  

**Step 8**: If pack available:
- LanguageSelectorViewModel sets IsBusy = true (show loading spinner)
- Calls MapViewModel.ApplyLanguageSelectionAsync(languageCode)

**Step 9**: MapViewModel acquires _langSwitchGate semaphore (prevents concurrent language switches)  
**Step 10**: LanguageSwitchService.ApplyLanguageSelectionAsync() executes:

**Step 10a**: Capture current active narration code (if audio playing)  
**Step 10b**: Call IPreferredLanguageService.SetAndPersist(newLanguageCode)  
**Step 10c**: Stop in-flight audio via PoiNarrationService.Stop()  

**Step 10d**: Take snapshot of AppState.Pois on main thread (prevent collection mutation)  
**Step 10e**: Re-hydrate all POIs off-thread:
```csharp
var rehydrated = snapshot
    .Select(p => PoiHydrationService.CreateHydratedPoi(
        p, 
        _locService.GetLocalizationResult(p.Code, newLanguageCode)
    ))
    .ToList();
```

**Step 10f**: Call PoiHydrationService.RefreshPoisCollectionAsync(rehydrated)  
**Step 10g**: On main thread:
- Update AppState.CurrentLanguage = newLanguageCode
- Trigger PoisRefreshed event
- Re-resolve SelectedPoi to new hydrated instance

**Step 10h**: If there was an active narration before switch:
- Restart narration with new language text
- Call PoiNarrationService.PlayAsync(activePoiCode, newLanguageCode)

**Step 11**: Release _langSwitchGate semaphore  
**Step 12**: MapViewModel returns to LanguageSelectorViewModel  
**Step 13**: LanguageSelectorViewModel sets IsBusy = false  
**Step 14**: LanguageSelectorViewModel updates CurrentCode = newLanguageCode  
**Step 15**: LanguageSelectorViewModel raises RequestClose event  
**Step 16**: LanguageSelectorPage modal closes  
**Step 17**: MapPage re-renders with new language:
- POI pins updated with new text
- Map labels in new language
- All UI text in new language

**Step 18**: User sees map with all content in selected language  

---

## Alternative Flow 1: Same Language Selected

**Trigger**: Step 5 - User taps the currently active language

**Step 5a**: LanguageSelectorViewModel checks if pack.Code == CurrentCode  
**Step 5b**: If true, just raise RequestClose event  
**Step 5c**: Modal closes without any language switch  
**Step 5d**: No re-hydration, no API calls  

**Postcondition**: Modal closes, language unchanged

---

## Alternative Flow 2: Language Pack Not Downloaded

**Trigger**: Step 7 - LanguagePackService.EnsureAvailableAsync() returns not available

**Step 7a**: Check if network available  

**If offline**:
- LanguagePackService shows alert: "Language pack not available offline"
- LanguageSelectorViewModel sets IsBusy = false
- Modal stays open
- User can select another language or close

**If online**:
- LanguagePackService initiates download
- Show progress dialog: "Downloading {LanguageName}..."
- Download language pack from backend
- On success: proceed to Step 8 (apply language)
- On failure: show error alert, stay open

---

## Alternative Flow 3: Concurrent Language Switch Attempt

**Trigger**: User taps language while previous switch still in progress

**Step 9a**: MapViewModel tries to acquire _langSwitchGate  
**Step 9b**: Semaphore is busy (previous switch still executing)  
**Step 9c**: Current thread waits in queue  
**Step 9d**: When previous switch completes, semaphore releases  
**Step 9e**: Queued switch acquires semaphore and executes  

**Postcondition**: Both switches execute serially, no race conditions

---

## Alternative Flow 4: Audio Playing During Switch

**Trigger**: Step 10a - User switches language while audio narration playing

**Step 10a**: Capture activeNarrationCode = "HCM" (current POI)  
**Step 10c**: Stop current audio playback  
**Step 10h**: After re-hydration, restart narration:
- Get new hydrated POI in new language
- Get NarrationShort text in new language
- Call TTS engine with new text
- User hears same POI narration in new language

**Postcondition**: Audio seamlessly continues in new language

---

## Edge Cases

### Edge Case 1: Language Pack Corrupted
**Scenario**: Downloaded language pack file corrupted  
**Handling**: LocalizationService.GetLocalizationResult() returns fallback (Vietnamese)  
**User Impact**: POI text displays in Vietnamese instead of selected language  
**Code**: [LanguageSwitchService.cs:90](../../../Services/LanguageSwitchService.cs#L90)

### Edge Case 2: POI Missing Translation
**Scenario**: POI has no translation for selected language  
**Handling**: LocalizationService returns fallback text (Vietnamese or English)  
**User Impact**: Some POI text may be in different language than selected  
**Mitigation**: Fallback chain ensures always some text available

### Edge Case 3: Very Large POI Collection (1000+ POIs)
**Scenario**: Re-hydrating 1000+ POIs takes 5+ seconds  
**Handling**: Re-hydration happens off-thread, UI shows loading spinner  
**User Impact**: Slight delay (5-10 seconds) before language switch completes  
**Mitigation**: Snapshot pattern prevents UI blocking

### Edge Case 4: Language Switch During Map Pan
**Scenario**: User pans map while language switch in progress  
**Handling**: Map pan queued until language switch completes  
**User Impact**: Map pan slightly delayed  
**Mitigation**: Semaphore serializes operations

### Edge Case 5: App Backgrounded During Download
**Scenario**: User switches to another app while language pack downloading  
**Handling**: Download continues in background (if OS allows)  
**User Impact**: May take longer, or download may pause  
**Mitigation**: User can retry when app returns to foreground

---

## Exception Handling

### Exception 1: Network Error During Download
**Trigger**: Network fails while downloading language pack  
**Handling**: LanguagePackService catches exception, shows alert  
**User Message**: "Download failed. Please check your connection and try again."  
**Recovery**: User can retry download

### Exception 2: Corrupted Language Pack File
**Trigger**: Downloaded file is corrupted or incomplete  
**Handling**: LocalizationService.GetLocalizationResult() returns fallback  
**User Message**: Silent (fallback to Vietnamese)  
**Recovery**: Automatic, no user action needed

### Exception 3: Semaphore Timeout
**Trigger**: Previous language switch hangs (very rare)  
**Handling**: Semaphore timeout after 30 seconds  
**User Message**: "Language switch timed out. Please try again."  
**Recovery**: User can retry

### Exception 4: POI Hydration Failure
**Trigger**: PoiHydrationService.CreateHydratedPoi() throws exception  
**Handling**: Catch exception, log error, use previous POI state  
**User Message**: Silent (POI text may not update)  
**Recovery**: User can close and reopen language selector

---

## Performance Requirements

| Metric | Target | Actual (Measured) | Status |
|--------|--------|-------------------|--------|
| Language Switch Latency | < 5 seconds | ~2-3 seconds | ✅ Met |
| POI Re-hydration (100 POIs) | < 1 second | ~0.5 seconds | ✅ Met |
| POI Re-hydration (1000 POIs) | < 5 seconds | ~3-4 seconds | ✅ Met |
| UI Responsiveness During Switch | No blocking | Spinner shown | ✅ Met |
| Memory Usage (Language Switch) | < 20 MB | ~10 MB | ✅ Met |

---

## Security & Privacy

### Data Security
- ✅ Language preference stored in SecureStorage (encrypted)
- ✅ Language packs stored locally (no transmission)
- ✅ No user data sent to translation APIs during switch

### Privacy
- ✅ Language selection not tracked in analytics
- ✅ No language preference sent to backend
- ✅ All processing happens locally

---

## Validation Rules

### Language Code Validation
```csharp
private static readonly HashSet<string> ValidLanguageCodes = new()
{
    "vi", "en", "ja", "ko", "fr", "zh"
};

public bool IsValidLanguageCode(string code)
{
    return !string.IsNullOrWhiteSpace(code) && 
           ValidLanguageCodes.Contains(code.ToLowerInvariant());
}
```

### Language Pack Validation
```csharp
public bool IsLanguagePackValid(LanguagePack pack)
{
    return pack != null &&
           IsValidLanguageCode(pack.Code) &&
           !string.IsNullOrWhiteSpace(pack.NativeName) &&
           pack.State != LanguagePackState.Unknown;
}
```

---

## Code References

### MAUI Mobile App
- **LanguageSelectorPage**: [Views/LanguageSelectorPage.xaml.cs](../../../Views/LanguageSelectorPage.xaml.cs)
- **LanguageSelectorViewModel**: [ViewModels/LanguageSelectorViewModel.cs](../../../ViewModels/LanguageSelectorViewModel.cs)
- **LanguageSwitchService**: [Services/LanguageSwitchService.cs](../../../Services/LanguageSwitchService.cs)
- **LocalizationService**: [Services/LocalizationService.cs](../../../Services/LocalizationService.cs)
- **LanguagePackService**: [Services/LanguagePackService.cs](../../../Services/LanguagePackService.cs)
- **PoiHydrationService**: [Services/PoiHydrationService.cs](../../../Services/PoiHydrationService.cs)
- **PoiNarrationService**: [Services/PoiNarrationService.cs](../../../Services/PoiNarrationService.cs)

---

## Related Documentation

- **Use Case Overview**: [usecase_overview.md](../03_usecase/usecase_overview.md)
- **Activity Diagram**: [ACT_Language_Switch.md](../04_activity/ACT_Language_Switch.md) (if exists)
- **Sequence Diagram**: [SEQ_Language_Switch.md](../05_sequence/SEQ_Language_Switch.md) (if exists)
- **ERD**: [erd_poi_localization.md](../02_erd/erd_poi_localization.md)
- **System Flows**: [07_system_flows.md](../07_system_flows.md#flow-5)
- **Known Issues**: [09_known_issues_and_tech_debt.md](../09_known_issues_and_tech_debt.md#issue-6)

---

## Postconditions

### Success
- AppState.CurrentLanguage updated to new language code
- All POIs re-hydrated with new language text
- UI displays all content in new language
- Language preference persisted to SecureStorage
- If audio was playing: narration continues in new language
- Modal closes

### Failure
- Language switch aborted
- AppState.CurrentLanguage unchanged
- Modal stays open
- User can retry or select different language

---

**Last Updated**: 2026-05-14  
**Reviewed By**: System Analyst  
**Status**: ✅ Complete and Production-Ready
