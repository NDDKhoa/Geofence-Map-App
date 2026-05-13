# 07 - System Flows

**Document Version**: 1.0  
**Last Updated**: 2026-05-13

---

## Purpose

This document describes **cross-system workflows** that span multiple subsystems (MAUI, Backend, Admin Web). These flows show how components interact to deliver end-to-end features.

---

## Flow 1: End-to-End POI Discovery and Audio Playback

### Overview
User discovers a POI via geofencing, hears automatic narration, then views details and plays full audio.

### Participating Systems
- MAUI Mobile App (LocationService, GeofenceService, AudioPlayerService, MapViewModel, PoiDetailViewModel)
- Backend API (optional, for analytics)
- Platform Services (GPS, TTS)

### Flow Diagram

```mermaid
sequenceDiagram
    participant User
    participant GPS
    participant LocationService
    participant GeofenceService
    participant PoiDatabase
    participant AudioPlayerService
    participant TTS
    participant MapViewModel
    participant Analytics

    User->>GPS: Enable location services
    GPS-->>LocationService: Location updates (every 5s)
    LocationService->>GeofenceService: CheckLocationAsync(location)
    GeofenceService->>PoiDatabase: Get all POIs
    PoiDatabase-->>GeofenceService: List<Poi>
    GeofenceService->>GeofenceService: Calculate distances (Haversine)
    GeofenceService->>GeofenceService: Filter by radius + priority
    
    alt POI within geofence
        GeofenceService->>GeofenceService: Check cooldown (2 min)
        GeofenceService->>AudioPlayerService: SpeakAsync(narrationShort)
        AudioPlayerService->>TTS: Play audio
        TTS-->>User: Audio narration
        GeofenceService->>Analytics: Emit GeofenceEvaluated event
        
        User->>MapViewModel: Tap POI pin
        MapViewModel->>PoiDatabase: Get POI by code
        PoiDatabase-->>MapViewModel: Poi with localization
        MapViewModel->>User: Navigate to PoiDetailPage
        
        User->>AudioPlayerService: Tap "Play Full Audio"
        AudioPlayerService->>TTS: Play narrationLong
        TTS-->>User: Full audio narration
    end
```

### Key Decision Points
1. **Geofence Trigger**: Distance <= radius AND priority highest AND cooldown expired
2. **Audio Suppression**: Skip if POI already selected in UI
3. **Language Selection**: Use AppState.CurrentLanguage for TTS

### Error Handling
- GPS unavailable: Show error toast, disable geofencing
- TTS engine unavailable: Silent failure, log error
- POI not found: Show "POI not available" message

---

## Flow 2: QR Code to POI Navigation

### Overview
User scans physical QR code at POI location, app parses code and navigates to POI on map or detail page.

### Participating Systems
- MAUI Mobile App (QrScannerViewModel, PoiEntryCoordinator, NavigationService, PoiDatabase)
- Backend API (optional, for scan tracking)

### Flow Diagram

```mermaid
sequenceDiagram
    participant User
    participant Camera
    participant QrScanner
    participant QrResolver
    participant PoiEntryCoordinator
    participant PoiDatabase
    participant NavigationService
    participant Backend

    User->>QrScanner: Open QR Scanner page
    QrScanner->>Camera: Request camera permission
    Camera-->>QrScanner: Permission granted
    QrScanner->>Camera: Start camera preview
    
    User->>Camera: Point at QR code
    Camera-->>QrScanner: QR code detected (raw string)
    QrScanner->>QrResolver: ParseQrCode(rawString)
    
    alt Valid format (poi:CODE, poi://CODE, URL, plain)
        QrResolver-->>QrScanner: QrParseResult { Code, IsValid }
        QrScanner->>PoiDatabase: GetPoiByCode(code)
        
        alt POI exists in local DB
            PoiDatabase-->>QrScanner: Poi object
            QrScanner->>PoiEntryCoordinator: HandlePoiEntry(poi, source=QR)
            PoiEntryCoordinator->>NavigationService: Navigate to MapPage or PoiDetailPage
            NavigationService-->>User: Show POI
            QrScanner->>Backend: Track QR scan event (analytics)
        else POI not found
            PoiDatabase-->>QrScanner: null
            QrScanner-->>User: Show error toast "POI not found"
        end
    else Invalid format
        QrResolver-->>QrScanner: QrParseResult { IsValid = false }
        QrScanner-->>User: Show error toast "Invalid QR code"
    end
```

### QR Code Format Support
1. **URI Scheme**: `poi:HCM`, `poi://HN_OLD_QUARTER`
2. **Web URL**: `https://vngo.travel/poi/HCM`, `https://vngo.travel/p/HCM`
3. **Plain Code**: `HCM` (uppercase alphanumeric)

### Key Decision Points
1. **Navigation Mode**: Map-first (show on map) vs Detail-first (show detail page)
2. **Scan Limit Check**: Free tier limited to 5 scans/day (client-side enforcement)
3. **Offline Behavior**: Works fully offline if POI in local DB

### Error Handling
- Camera permission denied: Show permission request dialog
- Invalid QR format: Show user-friendly error message
- POI not in local DB: Suggest manual search or refresh data

---

## Flow 3: Owner POI Submission to Admin Approval

### Overview
Owner submits new POI via MAUI app, admin reviews in web portal, approval/rejection syncs back to backend.

### Participating Systems
- MAUI Mobile App (Owner submission UI - partial)
- Backend API (Owner controller, POI service, Audit service)
- Admin Web Portal (Moderation queue, Approval UI)
- MongoDB (Poi collection, AdminPoiAudit collection)

### Flow Diagram

```mermaid
sequenceDiagram
    participant Owner
    participant MAUI
    participant Backend
    participant MongoDB
    participant Admin
    participant AdminWeb

    Owner->>MAUI: Fill POI submission form
    MAUI->>MAUI: Validate input (name, location, description)
    MAUI->>Backend: POST /api/v1/owner/pois
    Backend->>Backend: Validate JWT (OWNER role)
    Backend->>Backend: Validate POI data
    Backend->>MongoDB: Insert Poi (status=PENDING, submittedBy=userId)
    MongoDB-->>Backend: Poi created
    Backend-->>MAUI: Success response
    MAUI-->>Owner: Show success message
    
    Admin->>AdminWeb: Navigate to moderation queue
    AdminWeb->>Backend: GET /api/v1/admin/pois/pending?page=1&limit=20
    Backend->>MongoDB: Query Poi where status=PENDING
    MongoDB-->>Backend: List of pending POIs
    Backend-->>AdminWeb: Paginated POI list
    AdminWeb-->>Admin: Display pending queue
    
    alt Admin approves
        Admin->>AdminWeb: Click "Approve" button
        AdminWeb->>Backend: POST /api/v1/admin/pois/:id/approve
        Backend->>Backend: Validate JWT (ADMIN role)
        Backend->>MongoDB: Start transaction
        Backend->>MongoDB: Update Poi.status = APPROVED
        Backend->>MongoDB: Insert AdminPoiAudit (action=APPROVE)
        MongoDB-->>Backend: Transaction committed
        Backend-->>AdminWeb: Success response
        AdminWeb-->>Admin: Show success toast
    else Admin rejects
        Admin->>AdminWeb: Enter rejection reason + Click "Reject"
        AdminWeb->>Backend: POST /api/v1/admin/pois/:id/reject { reason }
        Backend->>Backend: Validate JWT (ADMIN role)
        Backend->>MongoDB: Start transaction
        Backend->>MongoDB: Update Poi.status = REJECTED, rejectionReason = reason
        Backend->>MongoDB: Insert AdminPoiAudit (action=REJECT)
        MongoDB-->>Backend: Transaction committed
        Backend-->>AdminWeb: Success response
        AdminWeb-->>Admin: Show success toast
    end
```

### Key Decision Points
1. **Auto-Approval**: Admin-created POIs are APPROVED immediately (bypass moderation)
2. **Audit Atomicity**: Status change and audit log creation must be atomic (transaction)
3. **Notification**: Owner not notified of approval/rejection in MVP (future enhancement)

### Error Handling
- Invalid POI data: Return 400 with validation errors
- Duplicate POI code: Return 409 conflict
- Audit creation fails: Rollback status change, return 500
- Transaction timeout: Retry once, then fail

---

## Flow 4: Analytics Event Pipeline to Heatmap

### Overview
MAUI app generates events, batches them to backend, background jobs aggregate to rollup tables, admin views heatmap.

### Participating Systems
- MAUI Mobile App (RbelBackgroundDispatcher, RuntimeTelemetry)
- Backend API (Intelligence controller, Event models, Rollup jobs)
- Admin Web Portal (Heatmap page, Leaflet.heat)
- MongoDB (IntelligenceEventRaw, Rollup collections)

### Flow Diagram

```mermaid
sequenceDiagram
    participant MAUI
    participant EventQueue
    participant Backend
    participant MongoDB
    participant RollupJob
    participant AdminWeb
    participant Admin

    MAUI->>EventQueue: Emit event (poi_view, geofence_enter, etc.)
    EventQueue->>EventQueue: Buffer events (max 100 or 2s)
    
    alt Batch ready
        EventQueue->>Backend: POST /api/v1/intelligence/events/batch
        Backend->>Backend: Validate schema (eventType, timestamp, deviceId)
        Backend->>MongoDB: Bulk insert into IntelligenceEventRaw
        MongoDB-->>Backend: Inserted count
        Backend-->>EventQueue: Success { inserted: N }
    end
    
    Note over RollupJob: Hourly background job
    RollupJob->>MongoDB: Query IntelligenceEventRaw (last hour)
    RollupJob->>RollupJob: Aggregate by poiCode + hourBucket
    RollupJob->>RollupJob: Calculate uniqueUsers, uniqueDevices, eventCount
    RollupJob->>MongoDB: Upsert IntelligenceAnalyticsRollupHourly
    MongoDB-->>RollupJob: Rollup created
    
    Note over RollupJob: Daily background job
    RollupJob->>MongoDB: Query IntelligenceAnalyticsRollupHourly (last day)
    RollupJob->>RollupJob: Aggregate by poiCode + dayBucket
    RollupJob->>MongoDB: Upsert IntelligenceAnalyticsRollupDaily
    
    Admin->>AdminWeb: Navigate to Heatmap page
    AdminWeb->>Backend: GET /api/v1/admin/intelligence/heatmap?startDate=X&endDate=Y
    Backend->>MongoDB: Query IntelligenceAnalyticsRollupHourly (date range)
    Backend->>MongoDB: Join with Poi collection (get coordinates)
    MongoDB-->>Backend: Array of { lat, lng, intensity }
    Backend-->>AdminWeb: Heatmap data
    AdminWeb->>AdminWeb: Normalize intensity (0-1 scale)
    AdminWeb->>AdminWeb: Render Leaflet.heat layer
    AdminWeb-->>Admin: Display heatmap
```

### Key Decision Points
1. **Batch Size**: Max 100 events or 2 seconds (whichever comes first)
2. **Rollup Frequency**: Hourly for recent data, daily for historical trends
3. **Data Retention**: Raw events 90 days, hourly rollups 30 days, daily rollups indefinite
4. **Heatmap Intensity**: Normalized by max event count in dataset

### Error Handling
- Batch ingestion fails: Events dropped (no retry in MVP)
- Rollup job fails: Retry on next scheduled run
- Heatmap query timeout: Return cached data or error

---

## Flow 5: Multi-Language Content Resolution

### Overview
User switches language, app checks local cache, falls back to translation API, caches result, updates UI.

### Participating Systems
- MAUI Mobile App (LanguageSwitchService, LocalizationService, PoiTranslationService, PoiDatabase)
- Translation APIs (Langbly, Google Translate)

### Flow Diagram

```mermaid
sequenceDiagram
    participant User
    participant LanguageSelector
    participant LanguageSwitchService
    participant LocalizationService
    participant PoiDatabase
    participant TranslationService
    participant LangblyAPI
    participant GoogleAPI
    participant MapViewModel

    User->>LanguageSelector: Select language (e.g., "ja")
    LanguageSelector->>LanguageSwitchService: SwitchLanguageAsync("ja")
    LanguageSwitchService->>LanguageSwitchService: Acquire semaphore (prevent race)
    LanguageSwitchService->>LocalizationService: LoadLanguageAsync("ja")
    
    LocalizationService->>LocalizationService: Load pois.json from Resources/Raw
    LocalizationService->>LocalizationService: Parse JSON, filter by language="ja"
    
    loop For each POI
        LocalizationService->>PoiDatabase: Check if translation exists (code + "ja")
        
        alt Translation in SQLite cache
            PoiDatabase-->>LocalizationService: Cached translation
        else Cache miss
            LocalizationService->>TranslationService: TranslateAsync(text, "vi" -> "ja")
            TranslationService->>LangblyAPI: POST /translate
            
            alt Langbly success
                LangblyAPI-->>TranslationService: Translated text
            else Langbly fails
                TranslationService->>GoogleAPI: POST /translate
                GoogleAPI-->>TranslationService: Translated text
            end
            
            TranslationService->>PoiDatabase: Cache translation (code + "ja" + text)
            PoiDatabase-->>LocalizationService: Translation cached
        end
    end
    
    LocalizationService->>LanguageSwitchService: Language loaded
    LanguageSwitchService->>AppState: Update CurrentLanguage = "ja"
    AppState->>AppState: Trigger PoisChanged event
    AppState-->>MapViewModel: Event notification
    MapViewModel->>MapViewModel: Reload POI list with new language
    MapViewModel-->>User: UI updated with Japanese text
```

### Key Decision Points
1. **Fallback Chain**: pois.json → SQLite cache → Langbly API → Google Translate API → Vietnamese fallback
2. **Cache Strategy**: Permanent cache (no expiration in MVP)
3. **Concurrency Control**: Semaphore prevents multiple simultaneous language switches
4. **UI Blocking**: Language switch takes 5-10 seconds (acceptable for MVP)

### Error Handling
- All translation APIs fail: Fall back to Vietnamese (primary language)
- JSON parse error: Log error, use empty localization
- SQLite error: Continue without cache, log error

---

## Flow 6: User Authentication and Role-Based Access

### Overview
User logs in via MAUI app, backend validates credentials, issues JWT, MAUI stores token and uses for subsequent API calls.

### Participating Systems
- MAUI Mobile App (LoginViewModel, AuthService, ApiService, SecureStorage)
- Backend API (Auth controller, User model, JWT service)
- MongoDB (User collection, RevokedToken collection)

### Flow Diagram

```mermaid
sequenceDiagram
    participant User
    participant LoginPage
    participant AuthService
    participant Backend
    participant MongoDB
    participant SecureStorage
    participant AppShell

    User->>LoginPage: Enter email + password
    LoginPage->>AuthService: LoginAsync(email, password)
    AuthService->>Backend: POST /api/v1/auth/login { email, password }
    Backend->>MongoDB: Find User by email (include password field)
    MongoDB-->>Backend: User document
    Backend->>Backend: Compare password (bcrypt)
    
    alt Password valid
        Backend->>Backend: Check User.isActive = true
        Backend->>Backend: Generate JWT (payload: { id, email, role })
        Backend->>MongoDB: Create/Update DeviceSession
        Backend-->>AuthService: { success: true, data: { token, user } }
        AuthService->>SecureStorage: Store token
        AuthService->>SecureStorage: Store user profile
        AuthService->>AppState: Set authenticated user
        AuthService-->>LoginPage: Success
        LoginPage->>AppShell: Navigate to MapPage
        AppShell->>AppShell: Show/hide tabs based on role
        AppShell-->>User: Show main app
        
        Note over User,Backend: Subsequent API calls
        User->>ApiService: Call protected endpoint
        ApiService->>SecureStorage: Retrieve token
        SecureStorage-->>ApiService: JWT token
        ApiService->>Backend: Request with Authorization: Bearer <token>
        Backend->>Backend: Validate JWT signature + expiration
        Backend->>MongoDB: Check if token in RevokedToken
        
        alt Token valid
            Backend->>Backend: Attach req.user = decoded payload
            Backend->>Backend: Check role requirements (RBAC)
            Backend-->>ApiService: API response
        else Token revoked or expired
            Backend-->>ApiService: 401 Unauthorized
            ApiService->>AuthService: Logout (clear token)
            AuthService-->>User: Navigate to LoginPage
        end
    else Password invalid
        Backend-->>AuthService: { success: false, error: "Invalid credentials" }
        AuthService-->>LoginPage: Error
        LoginPage-->>User: Show error message
    end
```

### Key Decision Points
1. **Token Storage**: SecureStorage (encrypted on device)
2. **Token Expiration**: 7 days (configurable)
3. **Auto-Logout**: On 401 response, clear token and redirect to login
4. **Role-Based UI**: Shell tabs visibility controlled by user role

### Error Handling
- Network error: Show "Cannot connect to server" message
- Invalid credentials: Show "Email or password incorrect"
- Token expired: Auto-logout and redirect to login
- SecureStorage error: Fall back to in-memory storage (session only)

---

## Cross-System Integration Points

### MAUI ↔ Backend API

| Integration Point | Protocol | Authentication | Error Handling |
|-------------------|----------|----------------|----------------|
| POI Sync | REST (GET /api/v1/pois) | Optional (public POIs) | Offline fallback to local DB |
| User Auth | REST (POST /api/v1/auth/login) | None (login endpoint) | Show error message |
| Analytics Events | REST (POST /api/v1/intelligence/events/batch) | Bearer token or X-Api-Key | Drop events on failure |
| Owner Submission | REST (POST /api/v1/owner/pois) | Bearer token (OWNER role) | Show validation errors |

### Backend API ↔ MongoDB

| Integration Point | Pattern | Consistency | Error Handling |
|-------------------|---------|-------------|----------------|
| POI CRUD | Repository pattern | Strong (transactions for moderation) | Rollback on error |
| Analytics Ingestion | Bulk insert | Eventual (no transactions) | Log error, continue |
| User Management | Repository pattern | Strong | Return error to client |

### Admin Web ↔ Backend API

| Integration Point | Protocol | Authentication | Error Handling |
|-------------------|----------|----------------|----------------|
| Moderation Queue | REST (GET /api/v1/admin/pois/pending) | Bearer token (ADMIN role) | Show error toast |
| Approve/Reject | REST (POST /api/v1/admin/pois/:id/approve) | Bearer token (ADMIN role) | Show error, refresh queue |
| Heatmap Data | REST (GET /api/v1/admin/intelligence/heatmap) | Bearer token (ADMIN role) | Show cached data or error |

---

## Performance Considerations

### Flow 1 (Geofencing)
- **Bottleneck**: GPS polling every 5 seconds
- **Optimization**: Increase interval to 10s, reduce battery drain
- **Trade-off**: Increased latency for geofence triggers

### Flow 4 (Analytics Pipeline)
- **Bottleneck**: Heatmap query with >1000 POIs
- **Optimization**: Pre-aggregate data, use spatial clustering
- **Trade-off**: Reduced granularity

### Flow 5 (Translation)
- **Bottleneck**: Translation API latency (500-2000ms)
- **Optimization**: Aggressive caching, preload popular POIs
- **Trade-off**: Stale translations

---

---

## Flow 7: Offline Content Download & Management

### Overview
User purchases a zone, downloads the full content (metadata + audio) for offline use, and manages local storage.

### Participating Systems
- MAUI Mobile App (AudioDownloadService, ZoneDownloadService, PoiDatabase, AppState)
- Backend API (Zones controller, Audio assets)
- File System (AppDataDirectory/audio-packages)

### Flow Diagram

```mermaid
sequenceDiagram
    participant User
    participant App as MAUI Mobile App
    participant API as Backend API
    participant FS as Local File System
    participant SQLite as Local Database

    User->>App: Click "Download Zone"
    App->>API: GET /api/v1/zones/:id/content (Metadata)
    API-->>App: List of POIs in Zone
    
    App->>App: Start Background Download Task
    loop For each POI in Zone
        App->>API: GET /api/v1/audio/:lang/:poiCode (Audio File)
        alt Audio exists on server
            API-->>App: Audio Stream (MP3)
            App->>FS: Write file to /audio-packages/:zone/:lang/
        else No audio
            App->>App: Mark as "Cloud-only" (TTS fallback)
        end
        App->>User: Update Download Progress (X%)
    end
    
    App->>SQLite: Mark Zone as "IsDownloaded = True"
    App->>App: Update Downloaded Statistics (MB)
    App-->>User: Show "Download Complete" notification
```

### Storage Organization
- **Base Path**: `AppData/audio-packages/`
- **Structure**: `[ZONE_CODE]/[LANG_CODE]/[POI_CODE]/[short|long].mp3`
- **Fallback**: If local file missing, app attempts real-time streaming or TTS.

---

## Related Documentation

- [Sequence Diagrams](../05_sequence/) - Detailed technical flows
- [Activity Diagrams](../04_activity/) - Business logic decision trees
- [Feature Breakdown](../08_feature_vs_task_breakdown.md) - Feature-to-task mapping
- [Known Issues](../09_known_issues_and_tech_debt.md) - Flow-related issues
