# 01 - Problem Statement and Business Needs

**Document Version:** 1.0  
**Last Updated:** 2026-05-13

---

## 1. Problem Statement

### 1.1 Core Problem

Traditional travel experiences at Points of Interest (POIs) suffer from several critical limitations:

1. **Language Barriers**: International travelers struggle to understand local historical and cultural context due to language limitations
2. **Information Accessibility**: Physical signage is often limited, poorly maintained, or only available in local languages
3. **Engagement Gap**: Static information delivery (signs, brochures) fails to engage modern travelers who expect interactive, on-demand content
4. **Offline Dependency**: Travelers in areas with poor network connectivity cannot access digital travel guides
5. **Content Fragmentation**: POI information is scattered across multiple platforms with inconsistent quality and accuracy

### 1.2 Business Opportunity

The VN-GO Travel platform addresses these problems by providing:

- **Automated Audio Narration**: Context-aware, location-triggered audio guides in multiple languages
- **Offline-First Architecture**: Full functionality without network dependency
- **QR Code Integration**: Instant POI access via physical QR codes at locations
- **Multi-Language Support**: Real-time translation with fallback mechanisms (vi, en, ja, ko, fr, zh)
- **Crowdsourced Content**: Owner-submitted POIs with admin moderation workflow

---

## 2. Stakeholders

### 2.1 Primary Stakeholders

#### Traveler (End User)
- **Role**: Consumes POI content while exploring locations
- **Needs**:
  - Automatic audio narration when entering POI geofence zones
  - Offline access to POI information
  - Multi-language support with quality translations
  - QR code scanning for instant POI access
  - Map-based POI discovery
- **Pain Points**:
  - Language barriers at tourist sites
  - Unreliable network connectivity
  - Difficulty finding comprehensive POI information
  - Manual effort required to research locations

#### Owner (Content Contributor)
- **Role**: Submits new POI content for inclusion in the platform
- **Needs**:
  - Simple POI submission workflow via mobile app
  - Ability to contribute local knowledge
  - Feedback on submission status (pending/approved/rejected)
  - Credit system for premium content access
- **Pain Points**:
  - No direct channel to share local expertise
  - Lack of incentives for content contribution
  - Unclear submission guidelines

#### Admin (Content Moderator)
- **Role**: Reviews, approves, or rejects owner-submitted POIs
- **Needs**:
  - Centralized moderation queue
  - Audit trail for all moderation actions
  - Analytics dashboard for system health monitoring
  - User management capabilities
  - Heatmap visualization of POI engagement
- **Pain Points**:
  - Manual content quality control is time-consuming
  - Lack of visibility into user engagement patterns
  - Difficulty tracking moderation history

### 2.2 Secondary Stakeholders

#### System Administrators
- **Role**: Maintain backend infrastructure and monitor system health
- **Needs**: Monitoring endpoints, error logs, performance metrics

#### Business Stakeholders
- **Role**: Define product strategy and monetization
- **Needs**: Analytics on user engagement, premium subscription metrics, POI popularity data

---

## 3. Current System Limitations

### 3.1 Performance Constraints

1. **Geofencing Latency**
   - **Issue**: Polling-based geofence evaluation every 5 seconds
   - **Impact**: Potential delay in audio narration trigger when moving quickly
   - **Mitigation**: Cooldown mechanism (2 minutes) prevents repeated triggers

2. **Translation Quality**
   - **Issue**: Auto-translation depends on external API availability and quality
   - **Impact**: Inconsistent translation accuracy across languages
   - **Mitigation**: Fallback chain (Langbly → Google Translate → cached results)

3. **SQLite Performance**
   - **Issue**: Single-threaded SQLite operations on mobile
   - **Impact**: Potential UI blocking during large data operations
   - **Mitigation**: Async/await patterns with background hydration

### 3.2 Data Constraints

1. **Content Coverage**
   - **Issue**: Primary content is Vietnamese; other languages rely on auto-translation
   - **Impact**: Variable content quality across languages
   - **Status**: Accepted trade-off for MVP

2. **Offline Sync**
   - **Issue**: No automatic sync mechanism between mobile SQLite and backend MongoDB
   - **Impact**: Mobile app operates on local-first data; backend updates require manual refresh
   - **Status**: Intentional design for offline-first architecture

3. **POI Density**
   - **Issue**: Limited POI coverage outside major tourist areas
   - **Impact**: Reduced value proposition in less-traveled regions
   - **Mitigation**: Owner submission workflow to crowdsource content

### 3.3 Technical Debt

1. **God Object ViewModel**
   - **Issue**: MapViewModel (~780 lines) handles too many responsibilities
   - **Impact**: Difficult to maintain and test
   - **Location**: ViewModels/MapViewModel.cs

2. **Background Loop in ViewModel**
   - **Issue**: MapViewModel runs infinite while(true) background task
   - **Impact**: Potential memory leaks and lifecycle management issues

3. **Service Folder Overcrowding**
   - **Issue**: Repository, API clients, state holders all in Services/ folder
   - **Impact**: Poor code organization and modularity

---

## 4. Success Criteria

### 4.1 Functional Requirements

| Requirement | Status | Priority |
|-------------|--------|----------|
| Offline POI navigation with map display | ✅ Implemented | P0 |
| Geofence-triggered audio narration | ✅ Implemented | P0 |
| QR code scanning for POI access | ✅ Implemented | P0 |
| Multi-language support (6 languages) | ✅ Implemented | P0 |
| JWT authentication with RBAC | ✅ Implemented | P0 |
| Owner POI submission workflow | ✅ Implemented | P1 |
| Admin moderation queue | ✅ Implemented | P1 |
| Audit logging for moderation actions | ✅ Implemented | P1 |
| Analytics ingestion and heatmap | ✅ Implemented | P1 |
| Premium subscription gating | ✅ Implemented | P2 |

---

## 5. Business Model

### 5.1 Monetization Strategy

1. **Freemium Model**
   - Free Tier: Basic POI access, limited QR scans per day
   - Premium Tier: Unlimited access, premium POIs, offline audio downloads

2. **Zone Packages**
   - Bundled POI collections for specific tourist areas
   - Credit-based system (e.g., 10 credits per zone)

---

## 6. Risks and Mitigation

### 6.1 Technical Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| GPS accuracy issues | High | Medium | Radius-based geofencing with priority system |
| Translation API downtime | Medium | Low | Multi-provider fallback + SQLite cache |
| SQLite corruption | High | Low | Regular backups, transaction safety |
| Battery drain from GPS polling | Medium | Medium | Configurable polling interval, movement threshold |

---

## 7. Conclusion

VN-GO Travel addresses a real market need for accessible, multilingual, offline-capable travel guides. The MVP successfully implements core features while accepting reasonable trade-offs for rapid development.

**Next Steps**: Review use case documentation (03_usecase/) to understand detailed feature specifications.
