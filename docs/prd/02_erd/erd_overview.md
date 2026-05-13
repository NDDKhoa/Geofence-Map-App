# ERD Overview - VN-GO Travel System

**Document Version:** 1.0  
**Last Updated:** 2026-05-13

---

## Purpose

This document provides a high-level overview of the data architecture across all three subsystems:
1. **Backend (MongoDB)** - Primary data store
2. **MAUI Mobile (SQLite)** - Local offline cache
3. **Admin Web** - Read-only view of backend data

---

## Data Architecture Principles

### 1. Bounded Context Separation
- Each domain (User Management, POI System, Analytics, etc.) has its own ERD document
- Maximum 7-10 entities per diagram to maintain clarity
- Cross-domain relationships are documented explicitly

### 2. Subsystem Data Ownership

| Domain | Primary Owner | Secondary Consumers |
|--------|---------------|---------------------|
| User & Auth | Backend MongoDB | Admin Web (read-only) |
| POI Core Data | Backend MongoDB | MAUI SQLite (cached), Admin Web |
| POI Localization | MAUI SQLite + JSON | Backend (optional sync) |
| Analytics Events | Backend MongoDB | Admin Web (aggregated views) |
| Moderation Audit | Backend MongoDB | Admin Web (read-only) |
| Zone & Subscription | Backend MongoDB | MAUI (cached access state) |

### 3. Data Synchronization Strategy

**Key Points:**
- MAUI operates **offline-first** with local SQLite
- Backend is **source of truth** for approved content
- No automatic real-time sync (intentional design)
- Manual refresh required for MAUI to get backend updates

---

## Domain Breakdown

### Domain 1: User Management & Authentication
**File**: [erd_user_auth.md](erd_user_auth.md)

**Entities**: User, RevokedToken, DeviceSession

**Responsibilities**:
- User registration and authentication
- JWT token lifecycle management
- Role-based access control (USER, OWNER, ADMIN)
- Premium subscription status

---

### Domain 2: POI Core System
**File**: [erd_poi_core.md](erd_poi_core.md)

**Entities**: Poi, PoiRequest, PoiChangeRequest, AdminPoiAudit

**Responsibilities**:
- POI master data (location, radius, priority)
- Owner submission workflow (PENDING → APPROVED/REJECTED)
- Legacy request system (PoiRequest)
- Moderation audit trail

---

### Domain 3: POI Localization & Translation
**File**: [erd_poi_localization.md](erd_poi_localization.md)

**Entities**: PoiContent (Backend), PoiTranslationCacheEntry (MAUI SQLite), LanguagePack

**Responsibilities**:
- Multi-language text storage
- Translation cache management
- Language pack versioning
- Fallback language resolution

---

### Domain 4: Zone & Subscription
**File**: [erd_zone_subscription.md](erd_zone_subscription.md)

**Entities**: Zone, CreditTransaction, Purchase, Subscription

**Responsibilities**:
- Zone-based content packages
- Credit-based unlocking system
- Purchase history tracking
- Premium subscription management

---

### Domain 5: Analytics & Intelligence
**File**: [erd_analytics.md](erd_analytics.md)

**Entities**: IntelligenceEventRaw, IntelligenceUserSession, IntelligenceUserProfile, IntelligenceDeviceProfile, IntelligenceAnalyticsRollupHourly, IntelligenceAnalyticsRollupDaily

**Responsibilities**:
- Event ingestion from MAUI app
- User journey tracking
- Device fingerprinting
- Aggregated analytics for heatmaps

---

### Domain 6: Audio System
**File**: [erd_audio.md](erd_audio.md)

**Entities**: Audio, AudioAsset, AudioQueue, AudioPlayEvent, AudioSession

**Responsibilities**:
- Audio file metadata management
- User audio queue (favorites, playlists)
- Playback event tracking
- Session analytics

---

### Domain 7: QR Token System
**File**: [erd_qr_token.md](erd_qr_token.md)

**Entities**: QrTokenUsage

**Responsibilities**:
- QR code scan tracking
- Daily scan limit enforcement (free tier)
- Usage analytics

---

## Cross-Domain Relationships

### User → POI
- **Relationship**: User submits POI (submittedBy field)
- **Cardinality**: 1 User : N Pois
- **Enforcement**: Backend foreign key (ObjectId reference)

### User → Zone Access
- **Relationship**: User purchases Zone access
- **Cardinality**: M:N (via Purchase table)
- **Enforcement**: Backend transaction records

### POI → Zone
- **Relationship**: POI belongs to Zone
- **Cardinality**: N Pois : 1 Zone
- **Enforcement**: Denormalized poiCodes array in Zone + zoneCode in Poi

### User → Analytics Events
- **Relationship**: User generates events
- **Cardinality**: 1 User : N Events
- **Enforcement**: Correlation via userId or deviceId

---

## Data Consistency Patterns

### 1. Eventual Consistency (MAUI ↔ Backend)
- MAUI SQLite may lag behind Backend MongoDB
- User must manually refresh to get latest POI updates
- Acceptable for offline-first design

### 2. Strong Consistency (Backend Moderation)
- Poi status transitions are transactional
- AdminPoiAudit MUST be created atomically with status change
- Failure in audit creation rolls back entire transaction

### 3. Denormalization (Performance)
- Zone.poiCodes array duplicates Poi.zoneCode for fast lookups
- Poi.name/summary stored in multiple languages (PoiContent)
- Trade-off: Write complexity for read performance

---

## Indexing Strategy

### Backend MongoDB Indexes

**Critical Indexes** (already implemented):
- Poi.code (unique)
- Poi.location (2dsphere for geospatial queries)
- Poi.status (for moderation queue)
- User.email (unique)
- Zone.code (unique)
- IntelligenceEventRaw.timestamp (for time-series queries)

**Composite Indexes**:
- Poi.code + status (for filtered lookups)
- IntelligenceEventRaw.userId + timestamp (for user journey queries)

---

## Next Steps

Review individual domain ERDs for detailed entity specifications:
1. [User Management & Authentication](erd_user_auth.md)
2. [POI Core System](erd_poi_core.md)
3. [POI Localization & Translation](erd_poi_localization.md)
4. [Zone & Subscription](erd_zone_subscription.md)
5. [Analytics & Intelligence](erd_analytics.md)
6. [Audio System](erd_audio.md)
7. [QR Token System](erd_qr_token.md)
