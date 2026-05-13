# ERD - Analytics & Intelligence

**Domain**: Analytics & Intelligence  
**Subsystem**: Backend (MongoDB)  
**Document Version**: 1.0  
**Last Updated**: 2026-05-13

---

## Entity Relationship Diagram

```mermaid
erDiagram
    User ||--o{ IntelligenceEventRaw : "generates"
    IntelligenceEventRaw ||--o{ IntelligenceUserSession : "aggregates to"
    User ||--o{ IntelligenceUserProfile : "has"
    IntelligenceDeviceProfile ||--o{ IntelligenceEventRaw : "generates"
    IntelligenceEventRaw ||--o{ IntelligenceAnalyticsRollupHourly : "rolls up to"
    IntelligenceAnalyticsRollupHourly ||--o{ IntelligenceAnalyticsRollupDaily : "rolls up to"
    
    IntelligenceEventRaw {
        ObjectId _id PK
        string eventType "required"
        string userId "nullable"
        string deviceId "required"
        string sessionId "required"
        string correlationId "required"
        date timestamp "required, indexed"
        object payload "event-specific data"
        object location "lat/lng, nullable"
        string poiCode "nullable"
        date createdAt
    }
    
    IntelligenceUserSession {
        ObjectId _id PK
        string userId FK "ref: User"
        string sessionId UK "unique session identifier"
        string deviceId
        date startTime "indexed"
        date endTime "nullable"
        number durationMs
        number eventCount
        array visitedPois "POI codes"
        date createdAt
        date updatedAt
    }
    
    IntelligenceUserProfile {
        ObjectId _id PK
        string userId FK UK "ref: User, unique"
        number totalSessions
        number totalEvents
        array favoritePois "POI codes"
        array preferredLanguages
        object behaviorMetrics "JSON"
        date firstSeenAt
        date lastSeenAt
        date updatedAt
    }
    
    IntelligenceDeviceProfile {
        ObjectId _id PK
        string deviceId UK "unique"
        string platform "Android|iOS|Windows"
        string appVersion
        number totalSessions
        number totalEvents
        date firstSeenAt
        date lastSeenAt
        date updatedAt
    }
    
    IntelligenceAnalyticsRollupHourly {
        ObjectId _id PK
        date hourBucket "indexed"
        string poiCode "nullable, indexed"
        number eventCount
        number uniqueUsers
        number uniqueDevices
        object metrics "aggregated stats"
        date createdAt
    }
    
    IntelligenceAnalyticsRollupDaily {
        ObjectId _id PK
        date dayBucket "indexed"
        string poiCode "nullable, indexed"
        number eventCount
        number uniqueUsers
        number uniqueDevices
        object metrics "aggregated stats"
        date createdAt
    }
```

---

## Entity Specifications

### IntelligenceEventRaw

**Purpose**: Raw event stream from MAUI app for analytics and heatmap generation.

**Schema Location**: `backend/src/models/intelligence-event-raw.model.js`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| _id | ObjectId | PK, Auto | MongoDB primary key |
| eventType | String | Required | Event category (e.g., "poi_view", "geofence_enter") |
| userId | String | Nullable | User ID if authenticated |
| deviceId | String | Required | Unique device identifier |
| sessionId | String | Required | Session identifier for grouping |
| correlationId | String | Required | Cross-system correlation ID |
| timestamp | Date | Required, Indexed | Event occurrence time |
| payload | Object | Optional | Event-specific data (flexible schema) |
| location.lat | Number | Nullable | Latitude if location event |
| location.lng | Number | Nullable | Longitude if location event |
| poiCode | String | Nullable, Indexed | Associated POI code |
| createdAt | Date | Auto | Ingestion timestamp |

**Indexes**:
- `timestamp`: For time-series queries
- `userId + timestamp`: For user journey queries
- `poiCode + timestamp`: For POI analytics
- `sessionId`: For session reconstruction

**Business Rules**:
1. **High Volume**: Expect 10K-100K events per month
2. **Retention**: Raw events retained for 90 days, then archived
3. **Authentication**: Accepts both authenticated (Bearer token) and guest (X-Api-Key) events
4. **Batch Ingestion**: Preferred via `POST /api/v1/intelligence/events/batch` (up to 100 events)

**Event Types** (from codebase):
- `poi_view`: User viewed POI details
- `geofence_enter`: User entered POI geofence
- `qr_scan`: User scanned QR code
- `audio_play`: User played audio narration
- `language_switch`: User changed language
- `map_interaction`: User interacted with map

---

### IntelligenceUserSession

**Purpose**: Aggregated user session data for journey analysis.

**Schema Location**: `backend/src/models/intelligence-user-session.model.js`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| _id | ObjectId | PK, Auto | MongoDB primary key |
| userId | String | Required, FK | Reference to User (string ID) |
| sessionId | String | Required, Unique | Unique session identifier |
| deviceId | String | Required | Device that generated session |
| startTime | Date | Required, Indexed | Session start timestamp |
| endTime | Date | Nullable | Session end timestamp (null if active) |
| durationMs | Number | Calculated | Session duration in milliseconds |
| eventCount | Number | Default: 0 | Number of events in session |
| visitedPois | [String] | Array | List of POI codes visited |
| createdAt | Date | Auto | Record creation timestamp |
| updatedAt | Date | Auto | Last update timestamp |

**Indexes**:
- `userId + startTime`: For user session history
- `sessionId`: Unique index for session lookup

**Business Rules**:
1. **Session Timeout**: Session ends after 30 minutes of inactivity
2. **Active Sessions**: endTime is null for ongoing sessions
3. **Aggregation**: Built from IntelligenceEventRaw via background job

---

### IntelligenceUserProfile

**Purpose**: Long-term user behavior profile for personalization.

**Schema Location**: `backend/src/models/intelligence-user-profile.model.js`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| _id | ObjectId | PK, Auto | MongoDB primary key |
| userId | String | Required, Unique, FK | Reference to User |
| totalSessions | Number | Default: 0 | Lifetime session count |
| totalEvents | Number | Default: 0 | Lifetime event count |
| favoritePois | [String] | Array | Most visited POI codes |
| preferredLanguages | [String] | Array | Language usage frequency |
| behaviorMetrics | Object | JSON | Custom metrics (e.g., avg session duration) |
| firstSeenAt | Date | Required | First event timestamp |
| lastSeenAt | Date | Required | Most recent event timestamp |
| updatedAt | Date | Auto | Profile update timestamp |

**Indexes**:
- `userId`: Unique index

**Business Rules**:
1. **Incremental Updates**: Updated on each session close
2. **Privacy**: Aggregated data only (no raw event storage)
3. **Retention**: Profiles retained indefinitely (user lifetime value)

---

### IntelligenceDeviceProfile

**Purpose**: Device-level analytics for platform insights.

**Schema Location**: `backend/src/models/intelligence-device-profile.model.js`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| _id | ObjectId | PK, Auto | MongoDB primary key |
| deviceId | String | Required, Unique | Unique device identifier |
| platform | String | Required | Android, iOS, Windows |
| appVersion | String | Optional | MAUI app version |
| totalSessions | Number | Default: 0 | Lifetime session count |
| totalEvents | Number | Default: 0 | Lifetime event count |
| firstSeenAt | Date | Required | First event timestamp |
| lastSeenAt | Date | Required | Most recent event timestamp |
| updatedAt | Date | Auto | Profile update timestamp |

**Indexes**:
- `deviceId`: Unique index
- `platform`: For platform analytics

---

### IntelligenceAnalyticsRollupHourly

**Purpose**: Hourly aggregated metrics for dashboard performance.

**Schema Location**: `backend/src/models/intelligence-analytics-rollup-hourly.model.js`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| _id | ObjectId | PK, Auto | MongoDB primary key |
| hourBucket | Date | Required, Indexed | Hour timestamp (rounded down) |
| poiCode | String | Nullable, Indexed | POI code (null for global metrics) |
| eventCount | Number | Default: 0 | Total events in hour |
| uniqueUsers | Number | Default: 0 | Distinct user count |
| uniqueDevices | Number | Default: 0 | Distinct device count |
| metrics | Object | JSON | Custom aggregated metrics |
| createdAt | Date | Auto | Rollup creation timestamp |

**Indexes**:
- `hourBucket + poiCode`: Composite index for queries
- `hourBucket`: For time-series queries

**Business Rules**:
1. **Aggregation Job**: Runs hourly via background job
2. **Retention**: Hourly rollups retained for 30 days
3. **Heatmap Source**: Used for admin dashboard heatmap visualization

---

### IntelligenceAnalyticsRollupDaily

**Purpose**: Daily aggregated metrics for long-term trends.

**Schema Location**: `backend/src/models/intelligence-analytics-rollup-daily.model.js`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| _id | ObjectId | PK, Auto | MongoDB primary key |
| dayBucket | Date | Required, Indexed | Day timestamp (midnight UTC) |
| poiCode | String | Nullable, Indexed | POI code (null for global metrics) |
| eventCount | Number | Default: 0 | Total events in day |
| uniqueUsers | Number | Default: 0 | Distinct user count |
| uniqueDevices | Number | Default: 0 | Distinct device count |
| metrics | Object | JSON | Custom aggregated metrics |
| createdAt | Date | Auto | Rollup creation timestamp |

**Indexes**:
- `dayBucket + poiCode`: Composite index
- `dayBucket`: For time-series queries

**Business Rules**:
1. **Aggregation Job**: Runs daily at midnight UTC
2. **Retention**: Daily rollups retained indefinitely
3. **Reporting**: Used for admin analytics reports

---

## Data Flow

### Event Ingestion Pipeline

```
MAUI App → Batch Events (100 max) → POST /api/v1/intelligence/events/batch
  ↓
Backend validates & inserts into IntelligenceEventRaw
  ↓
Background Job (hourly) aggregates to IntelligenceAnalyticsRollupHourly
  ↓
Background Job (daily) aggregates to IntelligenceAnalyticsRollupDaily
  ↓
Admin Dashboard queries rollup tables for heatmap
```

### Session Reconstruction

```
IntelligenceEventRaw (sessionId) → Group by sessionId
  ↓
Calculate: startTime (min), endTime (max), eventCount, visitedPois
  ↓
Insert/Update IntelligenceUserSession
  ↓
Update IntelligenceUserProfile (totalSessions++, lastSeenAt)
```

---

## API Endpoints

### Event Ingestion

**POST /api/v1/intelligence/events/batch**
- **Auth**: Bearer token OR X-Api-Key header
- **Body**: Array of events (max 100)
- **Response**: `{ success: true, inserted: N }`

**POST /api/v1/intelligence/events/single**
- **Auth**: Bearer token OR X-Api-Key header
- **Body**: Single event object
- **Response**: `{ success: true, eventId }`

### Admin Analytics

**GET /api/v1/admin/intelligence/summary**
- **Auth**: Admin only
- **Response**: Global metrics (total users, events, sessions)

**GET /api/v1/admin/intelligence/journeys/:correlationId**
- **Auth**: Admin only
- **Response**: Full event sequence for correlation ID

**GET /api/v1/admin/intelligence/heatmap**
- **Auth**: Admin only
- **Query**: `?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD`
- **Response**: POI-level aggregated metrics for heatmap

---

## Heatmap Generation

### Data Source
- **Primary**: IntelligenceAnalyticsRollupHourly (for recent data)
- **Secondary**: IntelligenceAnalyticsRollupDaily (for historical trends)

### Calculation
```javascript
// Pseudo-code
const heatmapData = await IntelligenceAnalyticsRollupHourly.aggregate([
  { $match: { hourBucket: { $gte: startDate, $lte: endDate }, poiCode: { $ne: null } } },
  { $group: { _id: "$poiCode", totalEvents: { $sum: "$eventCount" }, uniqueUsers: { $sum: "$uniqueUsers" } } },
  { $lookup: { from: "pois", localField: "_id", foreignField: "code", as: "poi" } },
  { $project: { poiCode: "$_id", lat: "$poi.location.coordinates[1]", lng: "$poi.location.coordinates[0]", intensity: "$totalEvents" } }
]);
```

### Visualization
- **Frontend**: Admin Web uses Leaflet.heat for heatmap rendering
- **Intensity**: Normalized by max event count in dataset
- **Color Scale**: Blue (low) → Green → Yellow → Red (high)

---

## Privacy & Compliance

### Data Anonymization
- **Guest Events**: No userId, only deviceId
- **Aggregation**: Raw events deleted after 90 days
- **Profiles**: Aggregated metrics only (no PII)

### GDPR Considerations
- **Right to Erasure**: User deletion should cascade delete IntelligenceEventRaw (not implemented in MVP)
- **Data Export**: User can request event export (not implemented)
- **Consent**: Event collection requires user consent (not enforced in MVP)

---

## Performance Optimization

### Indexing Strategy
- **Time-Series**: Compound indexes on timestamp + poiCode
- **TTL Index**: Auto-delete raw events after 90 days (not implemented)

### Query Optimization
- **Rollup Tables**: Pre-aggregated data reduces query load
- **Caching**: Admin dashboard caches heatmap data (5 min TTL)

### Scalability
- **Sharding**: IntelligenceEventRaw can be sharded by timestamp
- **Archival**: Old raw events moved to cold storage (S3/Glacier)

---

## Related Documentation

- [User Management ERD](erd_user_auth.md) - User → Events relationship
- [POI Core ERD](erd_poi_core.md) - POI → Analytics relationship
- [Backend Intelligence API](../../docs/intelligence/) - Detailed API specs
