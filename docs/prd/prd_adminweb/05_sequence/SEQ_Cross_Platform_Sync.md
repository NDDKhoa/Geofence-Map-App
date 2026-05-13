# SEQ - Cross-Platform Communication Flow

This diagram visualizes how the Mobile App and Admin Web interact through the Backend API for two core scenarios: **POI Submission/Approval** and **Analytics Loop**.

## 1. POI Content Lifecycle (App to Web)

```mermaid
sequenceDiagram
    participant App as Mobile App (Owner)
    participant API as Backend API
    participant DB as MongoDB
    participant Web as Admin Web (Admin)

    Note over App, Web: Submission Phase
    App->>API: POST /api/v1/owner/pois (POI Data)
    API->>DB: Save POI (status: PENDING)
    DB-->>API: Saved
    API-->>App: 201 Created

    Note over App, Web: Moderation Phase
    Web->>API: GET /api/v1/admin/pois/pending
    API->>DB: Query status=PENDING
    DB-->>API: List of POIs
    API-->>Web: POI List (JSON)
    
    Web->>API: POST /api/v1/admin/pois/:id/approve
    API->>DB: Update status=APPROVED
    DB-->>API: Updated
    API-->>Web: 200 OK

    Note over App, Web: Synchronization Phase
    App->>API: GET /api/v1/pois (Manual or Auto Sync)
    API->>DB: Query status=APPROVED
    DB-->>API: POI List
    API-->>App: Updated POI Data
    App->>App: Update Local SQLite Cache
```

## 2. Behavioral Analytics Loop (App to Web)

```mermaid
sequenceDiagram
    participant App as Mobile App (Traveler)
    participant API as Backend API
    participant DB as MongoDB
    participant Web as Admin Web (Admin)

    Note over App, Web: Data Ingestion
    App->>API: POST /api/v1/intelligence/events/batch (N events)
    API->>DB: Insert Raw Events
    
    Note over API, DB: Background Processing (Hourly)
    API->>DB: Aggregate Raw -> Rollup Summary
    DB-->>API: Aggregated

    Note over App, Web: Visualization
    Web->>API: GET /api/v1/admin/intelligence/heatmap
    API->>DB: Query Rollup Data
    DB-->>API: Summary Results
    API-->>Web: Heatmap Data Points
    Web->>Web: Render Map Overlay
```
