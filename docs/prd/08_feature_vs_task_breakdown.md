# 08 - Feature vs Task Breakdown

**Document Version**: 1.0  
**Last Updated**: 2026-05-13

---

## Purpose

This document provides a **strict mapping** between user-visible **Features** (business value) and their underlying **Tasks** (technical implementation). This prevents hallucination by clearly distinguishing what users experience from how the system achieves it.

---

## Definitions

### Feature
A **user-visible capability** that delivers **business value**. Features are what users interact with and what product managers prioritize.

**Examples**: "Offline POI Navigation", "QR Code Scanning", "Multi-Language Support"

### Task
A **technical, internal step** required to implement a feature. Tasks are code-level execution units that users never see directly.

**Examples**: "Fetch GPS coordinates", "Validate JWT token", "Parse JSON response"

### Flow
The **sequential interaction** between User, Client (MAUI), Backend, and Database to complete a Feature.

---

## Feature Catalog

### MAUI Mobile App Features

#### Feature 1: Offline POI Map Navigation ✅
**Business Value**: Users can view and navigate POIs without internet connectivity.

**Sub-system**: MAUI Mobile App

**Core Tasks**:
1. Load POI data from SQLite on app startup
2. Render POI pins on map using Microsoft.Maui.Controls.Maps
3. Calculate user location via GPS (LocationService)
4. Update map center to user location
5. Handle pin tap events to show POI details
6. Hydrate POI text from LocalizationService (in-memory JSON)

**Key Files**:
- [Views/MapPage.xaml.cs](../../Views/MapPage.xaml.cs)
- [ViewModels/MapViewModel.cs](../../ViewModels/MapViewModel.cs)
- [Services/PoiDatabase.cs](../../Services/PoiDatabase.cs)
- [Services/LocationService.cs](../../Services/LocationService.cs)

**Dependencies**: SQLite database seeded with POI data, GPS permission granted

**Known Issues**: 
- MapViewModel is a "God Object" (~780 lines)
- Background preloading loop runs indefinitely in ViewModel

---

#### Feature 2: Geofence-Triggered Audio Narration ✅
**Business Value**: Users automatically hear POI narration when entering geofence zones.

**Sub-system**: MAUI Mobile App

**Core Tasks**:
1. Poll GPS location every 5 seconds (LocationService)
2. Calculate distance from user to all POIs (Haversine formula)
3. Filter POIs within radius (GeofenceService)
4. Apply priority sorting for overlapping geofences
5. Check cooldown timer (2 minutes per POI)
6. Suppress trigger if POI already selected in UI
7. Emit telemetry event (GeofenceEvaluated)
8. Call AudioPlayerService.SpeakAsync with narration text
9. Use platform TTS engine (Android/iOS/Windows)

**Key Files**:
- [Services/GeofenceService.cs](../../Services/GeofenceService.cs)
- [Services/AudioPlayerService.cs](../../Services/AudioPlayerService.cs)
- [Services/LocationService.cs](../../Services/LocationService.cs)

**Dependencies**: GPS permission, location services enabled, POI data loaded

**Known Issues**:
- Polling-based (not native geofencing API)
- 5-15 second latency depending on movement speed
- Battery drain from continuous GPS polling

---

#### Feature 3: QR Code Scanning for POI Access ✅
**Business Value**: Users can scan physical QR codes to instantly navigate to POIs.

**Sub-system**: MAUI Mobile App

**Core Tasks**:
1. Open camera via ZXing.Net.Maui barcode scanner
2. Detect QR code and extract raw string
3. Parse QR code format (poi:CODE, poi://CODE, URL, plain code)
4. Validate POI code format (uppercase alphanumeric)
5. Query SQLite for POI by code
6. If found: Navigate to MapPage or PoiDetailPage (based on mode)
7. If not found: Show error toast
8. Track QR scan event in analytics
9. Check daily scan limit (free tier: 5 scans)

**Key Files**:
- [Views/QrScannerPage.xaml.cs](../../Views/QrScannerPage.xaml.cs)
- [ViewModels/QrScannerViewModel.cs](../../ViewModels/QrScannerViewModel.cs)
- [Services/PoiEntryCoordinator.cs](../../Services/PoiEntryCoordinator.cs)
- [Models/QrParseResult.cs](../../Models/QrParseResult.cs)

**Dependencies**: Camera permission, POI data in SQLite

**Known Issues**:
- QR scan limit enforcement is client-side only (can be bypassed)
- No backend validation of scan count in MVP

---

#### Feature 4: Multi-Language Support ✅
**Business Value**: Users can switch between 6 languages (vi, en, ja, ko, fr, zh) for POI content.

**Sub-system**: MAUI Mobile App

**Core Tasks**:
1. User selects language from LanguageSelectorPage
2. Update AppState.CurrentLanguage
3. Trigger PoisChanged event
4. LocalizationService reloads POI text from pois.json
5. Check for exact language match in JSON
6. If missing: Query PoiTranslationService for cached translation
7. If cache miss: Call translation API (Langbly → Google Translate fallback)
8. Cache translation result in SQLite (PoiTranslationCacheEntry)
9. Hydrate POI objects with translated text
10. Refresh all ViewModels (MapViewModel, PoiDetailViewModel)
11. Update UI with new language

**Key Files**:
- [Services/LocalizationService.cs](../../Services/LocalizationService.cs)
- [Services/PoiTranslationService.cs](../../Services/PoiTranslationService.cs)
- [Services/LanguageSwitchService.cs](../../Services/LanguageSwitchService.cs)
- [ViewModels/LanguageSelectorViewModel.cs](../../ViewModels/LanguageSelectorViewModel.cs)

**Dependencies**: Internet connection for translation API (first time), pois.json file

**Known Issues**:
- Translation quality varies by provider
- No manual translation editing in MVP
- Fallback chain can fail if all APIs are down

---

#### Feature 5: POI Detail View with Audio Playback ✅
**Business Value**: Users can view detailed POI information and play long-form audio narration.

**Sub-system**: MAUI Mobile App

**Core Tasks**:
1. User taps POI pin on map or selects from list
2. Navigate to PoiDetailPage with POI code parameter
3. Load POI from SQLite by code
4. Hydrate POI with localized text
5. Display POI name, summary, narration text, image
6. User taps "Play Audio" button
7. AudioPlayerService.SpeakAsync called with narrationLong
8. Platform TTS engine plays audio
9. Show playback controls (pause, stop)
10. Track audio play event in analytics

**Key Files**:
- [Views/PoiDetailPage.xaml.cs](../../Views/PoiDetailPage.xaml.cs)
- [ViewModels/PoiDetailViewModel.cs](../../ViewModels/PoiDetailViewModel.cs)
- [Services/AudioPlayerService.cs](../../Services/AudioPlayerService.cs)

**Dependencies**: POI data loaded, TTS engine available

**Known Issues**:
- No offline audio file downloads (TTS only)
- Audio playback state not persisted across app restarts

---

#### Feature 6: User Authentication (Login/Register) ✅
**Business Value**: Users can create accounts and log in to access premium features.

**Sub-system**: MAUI Mobile App + Backend API

**Core Tasks**:
1. User enters email/password on LoginPage
2. Validate input format (email regex, password length)
3. Call POST /api/v1/auth/login with credentials
4. Backend validates credentials (bcrypt password check)
5. Backend generates JWT token
6. Backend returns { success: true, data: { token, user } }
7. MAUI stores token in SecureStorage
8. MAUI stores user profile in SecureStorage
9. Update AppState with authenticated user
10. Navigate to MapPage
11. Show/hide Shell tabs based on user role

**Key Files**:
- [Views/LoginPage.xaml.cs](../../Views/LoginPage.xaml.cs)
- [ViewModels/LoginViewModel.cs](../../ViewModels/LoginViewModel.cs)
- [Services/AuthService.cs](../../Services/AuthService.cs)
- [Services/ApiService.cs](../../Services/ApiService.cs)
- Backend: [backend/src/controllers/auth.controller.js](../../backend/src/controllers/auth.controller.js)

**Dependencies**: Backend API reachable, internet connection

**Known Issues**:
- No email verification in MVP
- No password reset flow
- Token expiration not handled gracefully (user must re-login)

---

### Backend API Features

#### Feature 7: JWT Authentication & RBAC ✅
**Business Value**: Secure API access with role-based permissions (USER, OWNER, ADMIN).

**Sub-system**: Backend API

**Core Tasks**:
1. Client sends Authorization: Bearer <token> header
2. Middleware extracts token from header
3. Check if token in RevokedToken collection (blacklist)
4. Verify JWT signature using JWT_SECRET
5. Check token expiration
6. Decode payload to get user { id, email, role }
7. Attach req.user to request object
8. Check role against route requirements (requireRole middleware)
9. If authorized: Continue to route handler
10. If unauthorized: Return 401 or 403 error

**Key Files**:
- [backend/src/middlewares/auth.middleware.js](../../backend/src/middlewares/auth.middleware.js)
- [backend/src/middlewares/rbac.middleware.js](../../backend/src/middlewares/rbac.middleware.js)
- [backend/src/models/revoked-token.model.js](../../backend/src/models/revoked-token.model.js)

**Dependencies**: JWT_SECRET environment variable, MongoDB connection

**Known Issues**:
- Token blacklist grows indefinitely (no TTL cleanup in MVP)
- No refresh token mechanism

---

#### Feature 8: Owner POI Submission Workflow ✅
**Business Value**: Content contributors can submit new POIs for admin review.

**Sub-system**: Backend API + MAUI Mobile App

**Core Tasks**:
1. Owner fills POI form in MAUI app (name, location, description)
2. Call POST /api/v1/owner/pois with POI data
3. Backend validates input (required fields, coordinate format)
4. Backend creates Poi document with status=PENDING
5. Backend sets submittedBy=userId
6. Backend returns created POI
7. MAUI shows success message
8. Admin sees POI in moderation queue (GET /api/v1/admin/pois/pending)

**Key Files**:
- Backend: [backend/src/controllers/owner.controller.js](../../backend/src/controllers/owner.controller.js)
- Backend: [backend/src/services/poi.service.js](../../backend/src/services/poi.service.js)
- MAUI: (Owner submission UI not fully implemented in MVP)

**Dependencies**: User has OWNER or ADMIN role, backend API reachable

**Known Issues**:
- MAUI owner submission UI incomplete (backend ready)
- No image upload in MVP (imageUrl is text field)

---

#### Feature 9: Admin POI Moderation ✅
**Business Value**: Admins can approve or reject owner-submitted POIs with audit trail.

**Sub-system**: Backend API + Admin Web Portal

**Core Tasks**:
1. Admin views pending POIs (GET /api/v1/admin/pois/pending)
2. Admin clicks Approve or Reject button
3. Frontend calls POST /api/v1/admin/pois/:id/approve or /reject
4. Backend validates admin role
5. Backend checks current POI status (must be PENDING or APPROVED)
6. Backend updates Poi.status to APPROVED or REJECTED
7. Backend creates AdminPoiAudit record (atomic transaction)
8. If audit creation fails: Rollback status change
9. Backend returns updated POI
10. Frontend refreshes moderation queue

**Key Files**:
- Backend: [backend/src/controllers/admin-poi.controller.js](../../backend/src/controllers/admin-poi.controller.js)
- Backend: [backend/src/services/poi.service.js](../../backend/src/services/poi.service.js)
- Backend: [backend/src/services/admin-poi-audit.service.js](../../backend/src/services/admin-poi-audit.service.js)
- Admin Web: [admin-web/src/pages/AdminHomePage.jsx](../../admin-web/src/pages/AdminHomePage.jsx)

**Dependencies**: User has ADMIN role, MongoDB transactions enabled

**Known Issues**:
- No bulk approve/reject in MVP
- No notification to owner when POI is approved/rejected

---

#### Feature 10: Analytics Event Ingestion ✅
**Business Value**: Track user behavior for heatmap visualization and product insights.

**Sub-system**: Backend API + MAUI Mobile App

**Core Tasks**:
1. MAUI app generates events (poi_view, geofence_enter, qr_scan, etc.)
2. Events queued in memory (max 100 events or 2 seconds)
3. Call POST /api/v1/intelligence/events/batch with event array
4. Backend validates event schema (eventType, timestamp, deviceId)
5. Backend inserts events into IntelligenceEventRaw collection
6. Backend returns { success: true, inserted: N }
7. Background job (hourly) aggregates events into IntelligenceAnalyticsRollupHourly
8. Background job (daily) aggregates into IntelligenceAnalyticsRollupDaily
9. Admin dashboard queries rollup tables for heatmap

**Key Files**:
- MAUI: [Services/Observability/RbelBackgroundDispatcher.cs](../../Services/Observability/RbelBackgroundDispatcher.cs)
- Backend: [backend/src/controllers/intelligence.controller.js](../../backend/src/controllers/intelligence.controller.js)
- Backend: [backend/src/models/intelligence-event-raw.model.js](../../backend/src/models/intelligence-event-raw.model.js)

**Dependencies**: Backend API reachable (events dropped if offline)

**Known Issues**:
- No event retry mechanism if batch fails
- Raw events not auto-deleted after 90 days (manual cleanup required)

---

### Admin Web Portal Features

#### Feature 11: Heatmap Visualization ✅
**Business Value**: Admins can visualize POI engagement via geographic heatmap.

**Sub-system**: Admin Web Portal

**Core Tasks**:
1. Admin navigates to Heatmap page
2. Frontend calls GET /api/v1/admin/intelligence/heatmap?startDate=X&endDate=Y
3. Backend queries IntelligenceAnalyticsRollupHourly for date range
4. Backend aggregates events by poiCode
5. Backend joins with Poi collection to get coordinates
6. Backend returns array of { lat, lng, intensity }
7. Frontend renders heatmap using Leaflet.heat
8. Frontend normalizes intensity by max value
9. Frontend applies color gradient (blue → green → yellow → red)

**Key Files**:
- Admin Web: [admin-web/src/pages/intelligence/Heatmap.jsx](../../admin-web/src/pages/intelligence/Heatmap.jsx)
- Admin Web: [admin-web/src/pages/intelligence/GeoHeatmapMap.jsx](../../admin-web/src/pages/intelligence/GeoHeatmapMap.jsx)
- Backend: [backend/src/controllers/intelligence-heatmap.controller.js](../../backend/src/controllers/intelligence-heatmap.controller.js)

**Dependencies**: Analytics events ingested, rollup jobs completed

**Known Issues**:
- Heatmap performance degrades with >1000 POIs
- No real-time updates (requires page refresh)

---

#### Feature 12: Audit Log Viewer ✅
**Business Value**: Admins can review all POI moderation actions for compliance.

**Sub-system**: Admin Web Portal

**Core Tasks**:
1. Admin navigates to Audit Log page
2. Frontend calls GET /api/v1/admin/pois/audits?page=1&limit=20
3. Backend queries AdminPoiAudit collection (sorted by timestamp desc)
4. Backend populates adminId and poiId references
5. Backend returns paginated audit records
6. Frontend renders table with columns: POI, Admin, Action, Timestamp, Reason
7. Admin can filter by action type (APPROVE/REJECT)
8. Admin can search by POI code or admin email

**Key Files**:
- Admin Web: [admin-web/src/pages/AuditsPage.jsx](../../admin-web/src/pages/AuditsPage.jsx)
- Backend: [backend/src/controllers/admin-poi.controller.js](../../backend/src/controllers/admin-poi.controller.js)

**Dependencies**: AdminPoiAudit records exist

**Known Issues**:
- No export to CSV in MVP
- No date range filtering

---

## Feature Dependencies

### Dependency Graph

```
Authentication (F6, F7)
  ↓
Owner POI Submission (F8)
  ↓
Admin Moderation (F9)
  ↓
Audit Log (F12)

Offline POI Data (F1)
  ↓
Geofencing (F2) + QR Scanning (F3) + POI Detail (F5)
  ↓
Analytics Events (F10)
  ↓
Heatmap (F11)

Multi-Language (F4)
  ↓
All POI Display Features (F1, F2, F3, F5)
```

---

## Non-Features (Explicitly Out of Scope)

These are **NOT features** because they provide no direct user value:

1. **SQLite Schema Migration**: Technical task, not user-visible
2. **JWT Token Refresh**: Infrastructure, not a feature
3. **Background Service Lifecycle**: Implementation detail
4. **API Response Caching**: Performance optimization, not a feature
5. **Error Logging**: Observability, not user-facing

---

## Feature Maturity Matrix

| Feature | Status | Test Coverage | Known Issues | Production Ready |
|---------|--------|---------------|--------------|------------------|
| F1: Offline POI Map | ✅ Complete | ⚠️ Manual only | God Object ViewModel | ⚠️ Needs refactor |
| F2: Geofencing | ✅ Complete | ⚠️ Manual only | Polling latency | ✅ Yes |
| F3: QR Scanning | ✅ Complete | ⚠️ Manual only | Client-side limit | ✅ Yes |
| F4: Multi-Language | ✅ Complete | ⚠️ Manual only | Translation quality | ⚠️ Needs curation |
| F5: POI Detail | ✅ Complete | ⚠️ Manual only | None | ✅ Yes |
| F6: Auth (MAUI) | ✅ Complete | ⚠️ Manual only | No token refresh | ✅ Yes |
| F7: Auth (Backend) | ✅ Complete | ✅ Jest tests | Token blacklist growth | ✅ Yes |
| F8: Owner Submission | ⚠️ Partial | ✅ Jest tests | MAUI UI incomplete | ⚠️ Backend only |
| F9: Admin Moderation | ✅ Complete | ✅ Jest tests | No bulk actions | ✅ Yes |
| F10: Analytics | ✅ Complete | ✅ Jest tests | No retry mechanism | ✅ Yes |
| F11: Heatmap | ✅ Complete | ⚠️ Manual only | Performance at scale | ⚠️ Needs optimization |
| F12: Audit Log | ✅ Complete | ✅ Jest tests | No export | ✅ Yes |

---

## Related Documentation

- [Use Case Specifications](../03_usecase/) - Detailed user interaction flows
- [Activity Diagrams](../04_activity/) - Business logic decision trees
- [Sequence Diagrams](../05_sequence/) - Technical execution flows
