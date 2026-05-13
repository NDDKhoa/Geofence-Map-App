# 10 - Assumptions and Constraints

**Document Version**: 1.0  
**Last Updated**: 2026-05-13

---

## Purpose

This document explicitly states the **assumptions** made during system design and the **constraints** that limit implementation choices. Understanding these helps explain why certain architectural decisions were made and what trade-offs were accepted.

---

## Technical Assumptions

### 1. Platform and Device Assumptions

#### Mobile Devices
- **Assumption**: Users have GPS-enabled smartphones running Android 7.0+, iOS 13.0+, or Windows 10+
- **Rationale**: .NET MAUI minimum platform requirements
- **Risk**: Excludes older devices (estimated <5% of market)
- **Mitigation**: Clear minimum requirements in app store listings

#### GPS Accuracy
- **Assumption**: GPS accuracy is within 10-50 meters in typical conditions
- **Rationale**: Standard consumer GPS performance
- **Risk**: Poor accuracy in urban canyons, indoors, or bad weather
- **Mitigation**: Geofence radius set to 50-100 meters to account for inaccuracy

#### Network Connectivity
- **Assumption**: Users have intermittent internet connectivity (not always online)
- **Rationale**: Travel scenarios often involve poor network coverage
- **Design Decision**: Offline-first architecture with local SQLite cache
- **Trade-off**: Data staleness accepted for offline capability

#### Storage Capacity
- **Assumption**: Devices have at least 100MB free storage
- **Rationale**: Base app (~30MB) + POI data (~20MB) + cache (~50MB)
- **Risk**: Low-end devices may struggle
- **Mitigation**: Cache cleanup mechanisms (not implemented in MVP)

---

### 2. Backend Infrastructure Assumptions

#### API Availability
- **Assumption**: Backend API has >99% uptime
- **Rationale**: Standard for production APIs
- **Risk**: MAUI app degrades gracefully if backend unavailable
- **Mitigation**: Offline-first design, local data cache

#### Database Performance
- **Assumption**: MongoDB can handle 100 concurrent users with <100ms query latency
- **Rationale**: MVP scale estimate
- **Risk**: Performance degrades beyond 1000 concurrent users
- **Mitigation**: Indexing strategy, caching layer

#### Translation API Availability
- **Assumption**: Langbly and Google Translate APIs are accessible and affordable
- **Rationale**: Required for multi-language support
- **Risk**: API downtime or cost explosion
- **Mitigation**: Fallback chain, aggressive SQLite caching

#### Geospatial Queries
- **Assumption**: MongoDB 2dsphere index performs well for nearby POI queries
- **Rationale**: Standard geospatial indexing
- **Risk**: Performance degrades with >10,000 POIs
- **Mitigation**: Limit query radius, use spatial clustering

---

### 3. Data Assumptions

#### POI Data Quality
- **Assumption**: Primary POI content is curated in Vietnamese
- **Rationale**: Target market is Vietnam tourism
- **Trade-off**: Other languages rely on auto-translation (variable quality)
- **Mitigation**: Manual curation for popular POIs (future)

#### Content Freshness
- **Assumption**: POI content changes infrequently (weekly/monthly)
- **Rationale**: Historical/cultural sites are relatively static
- **Design Decision**: No real-time sync required
- **Trade-off**: Users may see stale data until manual refresh

#### User-Generated Content
- **Assumption**: Owner-submitted POIs require moderation (not auto-approved)
- **Rationale**: Quality control and spam prevention
- **Trade-off**: Submission-to-publish latency (hours to days)
- **Mitigation**: Clear expectations in submission UI

#### Translation Cache Hit Rate
- **Assumption**: 80%+ of translation requests hit SQLite cache
- **Rationale**: Users revisit same POIs, limited language switching
- **Risk**: Cache misses cause API cost and latency
- **Mitigation**: Preload popular POI translations

---

## Business Assumptions

### 1. User Behavior Assumptions

#### Language Preferences
- **Assumption**: Users select one primary language and rarely switch
- **Rationale**: Observed behavior in similar apps
- **Design Decision**: Language switch triggers full data reload
- **Trade-off**: Language switching is slow (5-10 seconds)

#### Offline Usage Patterns
- **Assumption**: Users download app before traveling (while online)
- **Rationale**: App store download requires connectivity
- **Design Decision**: Initial data seed happens on first launch
- **Risk**: Users who install offline cannot use app
- **Mitigation**: Clear onboarding instructions

#### QR Code Availability
- **Assumption**: Physical QR codes will be deployed at POI locations
- **Rationale**: Partnership with tourism boards or venue owners
- **Risk**: QR codes may not exist at all locations
- **Mitigation**: QR scanning is optional (map navigation is primary)

#### Session Duration
- **Assumption**: Average user session is 15-30 minutes
- **Rationale**: Typical tourist site visit duration
- **Design Decision**: Session timeout set to 30 minutes
- **Impact**: Analytics session aggregation logic

---

### 2. Market Assumptions

#### Target Audience
- **Assumption**: Primary users are international travelers visiting Vietnam
- **Secondary**: Domestic travelers exploring new regions
- **Rationale**: Language support prioritization (en, ja, ko, fr, zh)
- **Risk**: Limited appeal outside Vietnam
- **Mitigation**: Architecture supports expansion to other countries

#### Monetization Viability
- **Assumption**: Users will pay for premium features (unlimited QR scans, premium POIs)
- **Rationale**: Freemium model success in travel apps
- **Risk**: Low conversion rate if free tier is too generous
- **Mitigation**: A/B testing of free tier limits (not implemented)

#### Content Contribution
- **Assumption**: Owners will submit POIs for credit rewards
- **Rationale**: Crowdsourcing reduces content creation cost
- **Risk**: Low submission volume or poor quality
- **Mitigation**: Credit incentives, moderation workflow

---

## Technical Constraints

### 1. Platform Constraints

#### .NET MAUI Limitations
- **Constraint**: MAUI is relatively new (2022), fewer libraries than Xamarin
- **Impact**: Some features require platform-specific code
- **Example**: Native geofencing APIs not abstracted by MAUI
- **Workaround**: Polling-based geofencing (Issue #4)

#### SQLite Limitations
- **Constraint**: Single-threaded, no concurrent writes
- **Impact**: Potential UI blocking during large operations
- **Mitigation**: Async/await, background hydration
- **Trade-off**: Complexity vs. performance

#### Platform TTS Engines
- **Constraint**: TTS voice quality varies by platform and language
- **Impact**: Inconsistent audio narration experience
- **Example**: Android TTS may not support high-quality Vietnamese voices
- **Mitigation**: None (platform limitation)

---

### 2. Backend Constraints

#### MongoDB Transactions
- **Constraint**: Transactions require replica set (not standalone)
- **Impact**: Admin moderation uses transactions for atomicity
- **Requirement**: Production MongoDB must be replica set
- **Risk**: Development setup complexity

#### Node.js Single-Threaded
- **Constraint**: Node.js event loop is single-threaded
- **Impact**: CPU-intensive operations block event loop
- **Example**: Large analytics aggregations
- **Mitigation**: Offload to background jobs, use worker threads

#### JWT Statelessness
- **Constraint**: JWT tokens cannot be invalidated without blacklist
- **Impact**: RevokedToken collection grows indefinitely (Issue #11)
- **Trade-off**: Stateless auth vs. token management complexity

---

### 3. Resource Constraints

#### Development Team Size
- **Constraint**: Small team (inferred from codebase)
- **Impact**: Limited bandwidth for feature development and testing
- **Trade-off**: MVP scope vs. production readiness
- **Evidence**: Manual testing only, no CI/CD pipeline

#### Budget Constraints
- **Constraint**: Limited budget for third-party services
- **Impact**: Translation API usage must be minimized
- **Mitigation**: Aggressive caching, fallback to free tier APIs

#### Time Constraints
- **Constraint**: Rapid MVP development timeline
- **Impact**: Technical debt accepted (God Object ViewModel, no unit tests)
- **Trade-off**: Speed to market vs. code quality

---

## Design Constraints

### 1. Offline-First Architecture

**Constraint**: App must function fully offline after initial data load

**Implications**:
- SQLite local cache required
- No real-time data sync
- Eventual consistency model
- Manual refresh for updates

**Trade-offs**:
- **Pro**: Reliable user experience in poor network conditions
- **Con**: Data staleness, sync complexity

**Accepted Limitations**:
- Users see outdated POI data until manual refresh
- Owner POI submissions require online connectivity
- Analytics events queued until online

---

### 2. Polling-Based Geofencing

**Constraint**: No native geofencing API abstraction in MAUI

**Implications**:
- GPS polled every 5 seconds
- Haversine distance calculation in-memory
- Cooldown mechanism to prevent spam

**Trade-offs**:
- **Pro**: Cross-platform consistency, simple implementation
- **Con**: Battery drain, 5-15 second latency, not scalable

**Accepted Limitations**:
- Geofence triggers may be delayed
- Battery impact on long sessions
- Misses fast movements (driving)

---

### 3. Denormalized Data Model

**Constraint**: MongoDB NoSQL design encourages denormalization

**Implications**:
- `Zone.poiCodes` array duplicates `Poi.zoneCode`
- POI content duplicated across languages (PoiContent)
- No foreign key constraints

**Trade-offs**:
- **Pro**: Fast reads, no joins required
- **Con**: Data consistency risk, write complexity

**Accepted Limitations**:
- Zone ↔ POI sync can drift (Issue #18)
- Manual consistency checks required

---

### 4. Client-Side Translation Caching

**Constraint**: Translation APIs are expensive and rate-limited

**Implications**:
- SQLite cache for all translations
- Cache never expires (manual cleanup only)
- Cache hit rate must be >80%

**Trade-offs**:
- **Pro**: Reduced API cost, faster response
- **Con**: Stale translations, storage growth

**Accepted Limitations**:
- Translation improvements not propagated to cache
- No cache invalidation mechanism in MVP

---

### 5. Analytics Event Persistence & Buffering

**Constraint**: Unreliable network requires local buffering of telemetry.

**Implications**:
- Memory buffer capped at 200 events.
- Persistence to `event-buffer.json` on every change.
- Batching (10 events) to minimize HTTP overhead.

**Trade-offs**:
- **Pro**: High reliability for data collection.
- **Con**: Periodic I/O overhead on main thread.

**Accepted Limitations**:
- Buffer overflow results in loss of oldest events.
- Flush interval (2s) means up to 2 seconds of data loss on crash (if persistence fails).

---

## Security Constraints

### 1. JWT-Based Authentication

**Constraint**: Stateless authentication required for scalability

**Implications**:
- Token blacklist required for logout
- No session management on server
- Token expiration is fixed (7 days)

**Trade-offs**:
- **Pro**: Scalable, no server-side session storage
- **Con**: Token revocation complexity, blacklist growth

**Accepted Limitations**:
- Tokens cannot be refreshed (must re-login)
- Blacklist grows indefinitely (Issue #11)

---

### 2. Client-Side Feature Gating

**Constraint**: MAUI app cannot securely enforce premium features

**Implications**:
- QR scan limit enforced client-side (Issue #7)
- Premium POI access checked client-side
- Backend validation required for critical operations

**Trade-offs**:
- **Pro**: Offline functionality, fast UX
- **Con**: Bypassable by determined users

**Accepted Limitations**:
- Free tier limits can be bypassed
- Backend must re-validate for purchases

---

## Performance Constraints

### 1. Mobile Device Performance

**Constraint**: Low-end devices have limited CPU/RAM

**Implications**:
- SQLite queries must be optimized
- Large collections (1000+ POIs) cause UI lag
- Background tasks must be throttled

**Trade-offs**:
- **Pro**: Broad device compatibility
- **Con**: Performance limitations on low-end devices

**Accepted Limitations**:
- UI may stutter during language switch
- Geofence evaluation limited to nearby POIs only

---

### 2. Backend Query Performance

**Constraint**: MongoDB queries must complete in <100ms (p95)

**Implications**:
- Indexes required on all query fields
- Aggregation pipelines must be optimized
- Rollup tables for analytics (pre-aggregated)

**Trade-offs**:
- **Pro**: Fast API responses
- **Con**: Index maintenance overhead, storage cost

**Accepted Limitations**:
- Heatmap queries slow with >1000 POIs (Issue #16)
- Real-time analytics not feasible

---

## Compliance and Privacy Constraints

### 1. GDPR Considerations

**Constraint**: User data must be deletable (Right to Erasure)

**Implications**:
- User deletion should cascade to analytics events
- Audit logs must be anonymized or excluded from deletion

**Trade-offs**:
- **Pro**: GDPR compliance
- **Con**: Implementation complexity

**Accepted Limitations**:
- User deletion not fully implemented in MVP
- Analytics events not anonymized

---

### 2. Location Data Privacy

**Constraint**: GPS coordinates are sensitive personal data

**Implications**:
- Location data must be encrypted in transit (HTTPS)
- Analytics events should aggregate location (not store raw GPS)
- Users must consent to location tracking

**Trade-offs**:
- **Pro**: Privacy protection
- **Con**: Reduced analytics granularity

**Accepted Limitations**:
- Raw GPS coordinates stored in analytics events (Issue #20)
- No explicit consent flow in MVP

---

## Operational Constraints

### 1. Deployment Environment

**Constraint**: Backend deployed on single server (no load balancer)

**Implications**:
- No horizontal scaling in MVP
- Single point of failure
- Limited to ~100 concurrent users

**Trade-offs**:
- **Pro**: Simple deployment, low cost
- **Con**: Not production-ready at scale

**Accepted Limitations**:
- Downtime during deployments
- No auto-scaling

---

### 2. Monitoring and Observability

**Constraint**: No centralized logging or monitoring in MVP

**Implications**:
- Debug.WriteLine used for logging
- No error tracking (Sentry, Rollbar)
- No performance monitoring (APM)

**Trade-offs**:
- **Pro**: Simple development workflow
- **Con**: Difficult to diagnose production issues

**Accepted Limitations**:
- Production issues require manual log inspection
- No alerting for errors or downtime

---

## Future Constraint Relaxations

### Short-Term (Next 6 Months)

1. **Native Geofencing**: Implement platform-specific geofencing APIs
2. **Incremental Sync**: Use `Poi.version` field for delta sync
3. **Unit Tests**: Add test coverage for critical paths
4. **Server-Side Limits**: Move QR scan limit to backend

### Long-Term (12+ Months)

1. **Real-Time Sync**: WebSocket-based live updates
2. **Horizontal Scaling**: Load balancer + multiple backend instances
3. **CDN for Assets**: Offload images and audio to CDN
4. **Advanced Analytics**: Real-time heatmap, ML-based recommendations

---

## Constraint Impact Matrix

| Constraint | Impact on Features | Impact on Performance | Impact on Scalability |
|------------|-------------------|----------------------|----------------------|
| Offline-First | High (enables core value) | Medium (SQLite overhead) | Low (client-side) |
| Polling Geofencing | Medium (latency) | High (battery drain) | High (not scalable) |
| Denormalized Data | Low (read performance) | Low (write complexity) | Medium (consistency risk) |
| Client-Side Caching | High (offline support) | High (reduced API calls) | Low (storage growth) |
| JWT Stateless Auth | Low (standard pattern) | Low (no session storage) | High (blacklist growth) |
| Single Server | Low (MVP only) | Medium (no load balancing) | High (single point of failure) |

---

## Related Documentation

- [Known Issues](09_known_issues_and_tech_debt.md) - Issues caused by constraints
- [Feature Breakdown](08_feature_vs_task_breakdown.md) - Feature limitations
- [Architecture Overview](../../architecture.md) - Architectural decisions
- [Problem Statement](01_problem_and_needs.md) - Business context
