# 09 - Known Issues and Technical Debt

**Document Version**: 1.0  
**Last Updated**: 2026-05-13

---

## Purpose

This document catalogs **real issues found in the codebase** during analysis. All issues are traced to actual code locations and represent genuine technical debt or bugs, not hypothetical problems.

---

## Critical Issues (P0)

### Issue 1: God Object ViewModel - MapViewModel

**Severity**: High  
**Impact**: Maintainability, Testability  
**Location**: [ViewModels/MapViewModel.cs](../../ViewModels/MapViewModel.cs)

**Description**:
MapViewModel is approximately 780 lines and handles too many responsibilities:
- GPS location management
- Geofence coordination
- POI database queries
- Translation service orchestration
- Background preloading tasks
- Audio service coordination
- UI state management

**Evidence**:
```csharp
public class MapViewModel : BaseViewModel
{
    // 15+ injected dependencies
    private readonly IPoiDatabase _poiDatabase;
    private readonly ILocationService _locationService;
    private readonly IGeofenceService _geofenceService;
    private readonly IAudioPlayerService _audioService;
    private readonly IPoiTranslationService _translationService;
    // ... 10 more dependencies
    
    // 780 lines of mixed concerns
}
```

**Consequences**:
- Difficult to unit test (requires mocking 15+ dependencies)
- High coupling between unrelated concerns
- Violates Single Responsibility Principle
- Changes in one area risk breaking others

**Recommended Fix**:
1. Extract domain services: `PoiLoadingOrchestrator`, `GeofenceCoordinator`, `MapStateManager`
2. Move background tasks to dedicated service
3. Reduce ViewModel to pure presentation logic

**Workaround**: None (architectural issue)

**Priority**: P0 (blocks scalability)

---

### Issue 2: Infinite Background Loop in ViewModel

**Severity**: High  
**Impact**: Memory leaks, Battery drain  
**Location**: [ViewModels/MapViewModel.cs:StartBackgroundPreloading](../../ViewModels/MapViewModel.cs)

**Description**:
MapViewModel starts an infinite `while(true)` loop in a background task that runs every 5 seconds for the lifetime of the ViewModel.

**Evidence**:
```csharp
private async Task StartBackgroundPreloading()
{
    while (true)
    {
        await Task.Delay(5000);
        // Preload nearby POIs
    }
}
```

**Consequences**:
- ViewModel never properly disposed (loop never exits)
- Potential memory leak if ViewModel is recreated
- Battery drain from continuous background work
- Violates MAUI page lifecycle expectations

**Recommended Fix**:
1. Move background task to dedicated `BackgroundService`
2. Use `CancellationToken` to stop loop on ViewModel disposal
3. Implement proper lifecycle management (start/stop on page appearing/disappearing)

**Workaround**: None

**Priority**: P0 (production stability risk)

---

### Issue 3: Collection Mutation During Enumeration

**Severity**: Medium  
**Impact**: Runtime crashes  
**Location**: [Services/GeofenceService.cs:98-103](../../Services/GeofenceService.cs)

**Description**:
GeofenceService takes a snapshot of `AppState.Pois` to prevent enumeration crashes if the collection is modified concurrently.

**Evidence**:
```csharp
// THREAD SAFETY: Take a snapshot of Pois on the main thread to prevent
// enumeration crashes if the collection is modified concurrently.
List<Poi> poisSnapshot = new();
await MainThread.InvokeOnMainThreadAsync(() =>
{
    poisSnapshot = _appState.Pois.ToList();
});
```

**Root Cause**:
`AppState.Pois` is an `ObservableCollection` that can be modified by language switch or data refresh while geofence service is iterating.

**Consequences**:
- Potential `InvalidOperationException: Collection was modified`
- Workaround adds overhead (main thread invocation + list copy)

**Recommended Fix**:
1. Use `ConcurrentBag<Poi>` or `ImmutableList<Poi>` for AppState.Pois
2. Implement proper locking strategy
3. Use event-driven architecture instead of polling shared state

**Workaround**: Snapshot pattern (already implemented)

**Priority**: P1 (mitigated but not resolved)

---

## High Priority Issues (P1)

### Issue 4: Polling-Based Geofencing

**Severity**: Medium  
**Impact**: Performance, Battery, Latency  
**Location**: [Services/GeofenceService.cs](../../Services/GeofenceService.cs)

**Description**:
Geofencing uses polling (every 5 seconds) instead of native platform geofencing APIs.

**Evidence**:
```csharp
// Geofence dùng polling 5 giây + cooldown; có thể trễ nhẹ khi di chuyển nhanh.
```

**Consequences**:
- 5-15 second latency for geofence triggers
- Continuous GPS polling drains battery
- Misses fast movements (e.g., driving)
- Not scalable to hundreds of POIs

**Recommended Fix**:
1. Use platform-specific geofencing APIs:
   - Android: `GeofencingClient`
   - iOS: `CLLocationManager` with `startMonitoring(for:)`
2. Fallback to polling only if native API unavailable

**Workaround**: Cooldown mechanism prevents repeated triggers

**Priority**: P1 (acceptable for MVP, needs improvement for production)

---

### Issue 5: No Automatic Sync Between MAUI SQLite and Backend MongoDB

**Severity**: Medium  
**Impact**: Data staleness  
**Location**: [Services/PoiDatabase.cs](../../Services/PoiDatabase.cs), Backend API

**Description**:
MAUI app operates on local SQLite cache with no automatic sync mechanism. Users must manually refresh to get backend updates.

**Evidence from docs**:
```
Offline Sync:
- Issue: No automatic sync mechanism between mobile SQLite and backend MongoDB
- Impact: Mobile app operates on local-first data; backend updates require manual refresh
- Status: Intentional design for offline-first architecture
```

**Consequences**:
- Users see stale POI data
- New POIs approved by admin not visible until manual refresh
- POI content updates not propagated
- Version field exists but unused

**Recommended Fix**:
1. Implement incremental sync using `Poi.version` field
2. Background sync on app startup (if online)
3. Push notifications for critical updates

**Workaround**: Manual refresh button (not implemented in MVP)

**Priority**: P1 (feature gap)

---

### Issue 6: Translation Quality Inconsistency

**Severity**: Medium  
**Impact**: User experience  
**Location**: [Services/PoiTranslationService.cs](../../Services/PoiTranslationService.cs)

**Description**:
Auto-translation quality varies significantly across languages and providers.

**Evidence from docs**:
```
Translation Quality:
- Issue: Auto-translation depends on external API availability and quality
- Impact: Inconsistent translation accuracy across languages
- Mitigation: Fallback chain (Langbly → Google Translate → cached results)
```

**Consequences**:
- Poor user experience for non-Vietnamese languages
- Cultural context lost in machine translation
- Technical terms mistranslated

**Recommended Fix**:
1. Manual curation for popular POIs
2. Community translation contributions
3. Translation quality scoring and flagging

**Workaround**: Fallback to Vietnamese if translation fails

**Priority**: P1 (user experience issue)

---

### Issue 7: Client-Side QR Scan Limit Enforcement

**Severity**: Medium  
**Impact**: Security, Revenue  
**Location**: [ViewModels/QrScannerViewModel.cs](../../ViewModels/QrScannerViewModel.cs)

**Description**:
QR scan daily limit (5 scans for free tier) is enforced client-side only and can be bypassed.

**Evidence**:
```
Known Issues:
- QR scan limit enforcement is client-side only (can be bypassed)
- No backend validation of scan count in MVP
```

**Consequences**:
- Users can bypass limit by clearing app data
- No server-side audit trail of scans
- Revenue loss from free tier abuse

**Recommended Fix**:
1. Move scan limit enforcement to backend
2. Track scans in `QrTokenUsage` collection
3. Validate scan count on each QR API call

**Workaround**: None

**Priority**: P1 (security/revenue issue)

---

## Medium Priority Issues (P2)

### Issue 8: Service Folder Overcrowding

**Severity**: Low  
**Impact**: Code organization  
**Location**: [Services/](../../Services/)

**Description**:
The `Services/` folder contains 50+ files with mixed responsibilities:
- Repositories (PoiDatabase)
- API clients (ApiService, AuthService)
- State holders (AppState, CurrentPoiStore)
- Business logic (GeofenceService, LocalizationService)
- Infrastructure (BackgroundTaskService)

**Consequences**:
- Difficult to navigate codebase
- Unclear separation of concerns
- New developers struggle to find relevant code

**Recommended Fix**:
1. Create subfolders: `Services/Data/`, `Services/Api/`, `Services/State/`, `Services/Domain/`
2. Move files to appropriate folders
3. Update namespace structure

**Workaround**: None (organizational issue)

**Priority**: P2 (maintainability)

---

### Issue 9: Excessive Debug Logging

**Severity**: Low  
**Impact**: Performance, Log noise  
**Location**: Throughout codebase

**Description**:
Heavy use of `Debug.WriteLine` for logging, including in hot paths (geofence evaluation, GPS polling).

**Evidence**:
```csharp
Debug.WriteLine($"[GEOFENCE] Location received lat={location.Latitude:0.000000} lon={location.Longitude:0.000000} at {now:O}");
Debug.WriteLine($"[GEOFENCE] Candidates count={candidates.Count}");
foreach (var c in candidates)
{
    Debug.WriteLine($"[GEOFENCE] Candidate id={c.Poi.Id} code={c.Poi.Code} dist={c.Distance:0.0}m pri={c.Poi.Priority}");
}
```

**Consequences**:
- Performance overhead in production builds
- Log spam makes debugging harder
- No structured logging (difficult to parse)

**Recommended Fix**:
1. Use conditional compilation (`#if DEBUG`)
2. Implement proper logging framework (Serilog, NLog)
3. Use log levels (Trace, Debug, Info, Warning, Error)
4. Remove logging from hot paths

**Workaround**: None

**Priority**: P2 (production readiness)

---

### Issue 10: No Unit Test Coverage for MAUI App

**Severity**: Medium  
**Impact**: Quality assurance  
**Location**: Entire MAUI project

**Description**:
MAUI app has no automated unit tests. All testing is manual.

**Evidence from docs**:
```
Vận hành và kiểm thử:
- Chưa có bộ test tự động toàn diện cho các luồng chính.
```

**Consequences**:
- Regressions not caught early
- Refactoring is risky
- Difficult to verify bug fixes

**Recommended Fix**:
1. Add xUnit test project
2. Write unit tests for ViewModels (mock dependencies)
3. Write integration tests for Services
4. Add UI tests using Appium or similar

**Workaround**: Manual testing

**Priority**: P2 (quality issue)

---

### Issue 11: Token Blacklist Growth

**Severity**: Low  
**Impact**: Database size, Performance  
**Location**: [backend/src/models/revoked-token.model.js](../../backend/src/models/revoked-token.model.js)

**Description**:
RevokedToken collection grows indefinitely. No TTL index to auto-delete expired tokens.

**Evidence**:
```javascript
// Indexes:
// - token: Unique index for fast blacklist checks
// - expiresAt: TTL index for automatic cleanup (NOT IMPLEMENTED)
```

**Consequences**:
- Database bloat over time
- Slower blacklist checks as collection grows
- Wasted storage

**Recommended Fix**:
1. Add MongoDB TTL index on `expiresAt` field
2. Tokens auto-deleted after expiration

**Workaround**: Manual cleanup script

**Priority**: P2 (operational issue)

---

### Issue 12: No Image Upload for POI Submission

**Severity**: Low  
**Impact**: Feature completeness  
**Location**: Owner POI submission flow

**Description**:
POI submission accepts `imageUrl` as text field, not actual image upload.

**Evidence**:
```
Known Issues:
- No image upload in MVP (imageUrl is text field)
```

**Consequences**:
- Owners must host images externally
- No image validation or moderation
- Inconsistent image quality

**Recommended Fix**:
1. Implement file upload endpoint (multipart/form-data)
2. Store images in S3 or similar
3. Generate thumbnails for performance
4. Add image moderation to admin workflow

**Workaround**: Owners provide external image URLs

**Priority**: P2 (feature enhancement)

---

## Low Priority Issues (P3)

### Issue 13: No Email Verification

**Severity**: Low  
**Impact**: Security, Spam  
**Location**: [backend/src/controllers/auth.controller.js](../../backend/src/controllers/auth.controller.js)

**Description**:
User registration does not require email verification.

**Consequences**:
- Fake accounts can be created
- No way to recover account if email is wrong
- Spam registrations possible

**Recommended Fix**:
1. Send verification email on registration
2. Add `emailVerified` field to User model
3. Restrict features until email verified

**Workaround**: None

**Priority**: P3 (security enhancement)

---

### Issue 14: No Password Reset Flow

**Severity**: Low  
**Impact**: User experience  
**Location**: Auth system

**Description**:
Users cannot reset forgotten passwords.

**Consequences**:
- Users locked out of accounts
- Support burden for manual resets

**Recommended Fix**:
1. Add "Forgot Password" flow
2. Send reset token via email
3. Add password reset endpoint

**Workaround**: Manual admin intervention

**Priority**: P3 (feature gap)

---

### Issue 15: Hardcoded API Base URL

**Severity**: Low  
**Impact**: Deployment flexibility  
**Location**: [Configuration/BackendApiConfiguration.cs](../../Configuration/BackendApiConfiguration.cs)

**Description**:
API base URL is hardcoded per platform/build configuration instead of being configurable at runtime.

**Evidence**:
```csharp
#if WINDOWS
    public const string BaseUrl = "http://localhost:3000/api/v1/";
#elif ANDROID
    public const string BaseUrl = "http://10.0.2.2:3000/api/v1/"; // Emulator
#endif
```

**Consequences**:
- Cannot switch environments without rebuild
- Difficult to test against staging/production
- Physical device testing requires code changes

**Recommended Fix**:
1. Load API URL from app settings or environment variable
2. Add UI for switching environments (debug builds only)

**Workaround**: Rebuild app for different environments

**Priority**: P3 (developer experience)

---

## Performance Issues

### Issue 16: Heatmap Performance Degradation

**Severity**: Medium  
**Impact**: Admin dashboard responsiveness  
**Location**: [admin-web/src/pages/intelligence/Heatmap.jsx](../../admin-web/src/pages/intelligence/Heatmap.jsx)

**Description**:
Heatmap rendering slows down significantly with >1000 POIs.

**Evidence from docs**:
```
Known Issues:
- Heatmap performance degrades with >1000 POIs
- No real-time updates (requires page refresh)
```

**Consequences**:
- Admin dashboard becomes unusable at scale
- Browser may freeze during rendering

**Recommended Fix**:
1. Implement data clustering on backend
2. Use WebGL-based heatmap renderer
3. Add pagination or viewport-based loading

**Workaround**: Filter by date range to reduce data points

**Priority**: P2 (scalability issue)

---

### Issue 17: SQLite Blocking UI Thread

**Severity**: Low  
**Impact**: UI responsiveness  
**Location**: [Services/PoiDatabase.cs](../../Services/PoiDatabase.cs)

**Description**:
Some SQLite operations may block UI thread despite async/await usage.

**Evidence from docs**:
```
SQLite Performance:
- Issue: Single-threaded SQLite operations on mobile
- Impact: Potential UI blocking during large data operations
- Mitigation: Async/await patterns with background hydration
```

**Consequences**:
- UI stutters during large data operations
- Poor user experience on low-end devices

**Recommended Fix**:
1. Ensure all SQLite calls use `Task.Run` for CPU-bound work
2. Implement connection pooling
3. Use SQLite WAL mode for better concurrency

**Workaround**: Background hydration service

**Priority**: P3 (performance optimization)

---

## Data Consistency Issues

### Issue 18: Zone ↔ POI Denormalization Drift

**Severity**: Medium  
**Impact**: Data integrity  
**Location**: Zone and POI models

**Description**:
`Zone.poiCodes` array and `Poi.zoneCode` field can become inconsistent due to lack of foreign key constraints.

**Evidence from ERD docs**:
```
Data Consistency:
- Problem: Zone.poiCodes and Poi.zoneCode can become inconsistent
- Cause: No foreign key constraint (denormalized design)
- Mitigation: Admin UI should update both when modifying zone membership
```

**Consequences**:
- POI shows wrong zone
- Zone shows incorrect POI count
- Heatmap data inaccurate

**Recommended Fix**:
1. Add background job to detect inconsistencies
2. Implement transactional updates for zone membership changes
3. Add validation endpoint for admins

**Workaround**: Manual database fixes

**Priority**: P2 (data integrity)

---

## Security Issues

### Issue 19: No Rate Limiting on Translation API

**Severity**: Medium  
**Impact**: Cost, Abuse  
**Location**: [Services/PoiTranslationService.cs](../../Services/PoiTranslationService.cs)

**Description**:
Translation API calls have no rate limiting, allowing potential abuse.

**Consequences**:
- API cost explosion if abused
- Translation provider may block access
- DoS vector

**Recommended Fix**:
1. Implement client-side rate limiting
2. Add backend rate limiting per user
3. Cache aggressively to reduce API calls

**Workaround**: SQLite cache reduces repeat calls

**Priority**: P2 (cost/security)

---

### Issue 20: Sensitive Data in Logs

**Severity**: Low  
**Impact**: Security  
**Location**: Various log statements

**Description**:
Debug logs may contain sensitive data (user IDs, coordinates, device IDs).

**Consequences**:
- Privacy violation if logs leaked
- GDPR compliance risk

**Recommended Fix**:
1. Audit all log statements
2. Redact sensitive data
3. Use structured logging with PII filtering

**Workaround**: None

**Priority**: P3 (compliance)

---

## Summary Statistics

| Priority | Count | Severity Breakdown |
|----------|-------|-------------------|
| P0 (Critical) | 3 | High: 3 |
| P1 (High) | 4 | Medium: 4 |
| P2 (Medium) | 8 | Medium: 5, Low: 3 |
| P3 (Low) | 5 | Low: 5 |
| **Total** | **20** | High: 3, Medium: 9, Low: 8 |

---

## Mitigation Priority

**Immediate (Before Production)**:
1. Issue 1: Refactor MapViewModel
2. Issue 2: Fix infinite background loop
3. Issue 7: Server-side QR scan limit

**Short-term (Next Sprint)**:
4. Issue 4: Native geofencing APIs
5. Issue 5: Implement sync mechanism
6. Issue 10: Add unit tests

**Long-term (Future Releases)**:
7. Issue 6: Manual translation curation
8. Issue 16: Heatmap performance optimization
9. Issue 18: Data consistency validation

---

## Related Documentation

- [Architecture Overview](../../architecture.md) - Context for architectural issues
- [Feature Breakdown](08_feature_vs_task_breakdown.md) - Feature maturity matrix
- [System Constraints](10_assumptions_and_constraints.md) - Accepted trade-offs
