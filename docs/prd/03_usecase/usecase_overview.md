# Use Case Overview

**Document Version**: 1.0  
**Last Updated**: 2026-05-13

---

## Purpose

This document provides a comprehensive catalog of all use cases in the VN-GO Travel system, organized by actor and subsystem. Each use case represents a distinct user goal or system interaction.

---

## Actors

### Primary Actors

| Actor | Role | Primary Subsystem | Authentication Required |
|-------|------|-------------------|------------------------|
| **Traveler** | End user exploring POIs | MAUI Mobile App | Optional (guest mode supported) |
| **Owner** | Content contributor | MAUI Mobile App + Backend API | Required (OWNER role) |
| **Admin** | Content moderator and system manager | Admin Web Portal + Backend API | Required (ADMIN role) |

### Secondary Actors

| Actor | Role | Interaction Type |
|-------|------|------------------|
| **System** | Automated processes | Background jobs, scheduled tasks |
| **Translation API** | External service | API integration (Langbly, Google Translate) |
| **GPS Service** | Platform service | Native device API |
| **TTS Engine** | Platform service | Native device API |

---

## Use Case Catalog

### MAUI Mobile App Use Cases

#### Navigation & Discovery (Traveler)

| ID | Use Case | Priority | Status | Document |
|----|----------|----------|--------|----------|
| UC-M01 | View POIs on Map | P0 | ✅ Complete | [usecase_mobile_app.md](usecase_mobile_app.md#uc-m01) |
| UC-M02 | Navigate to POI Location | P0 | ✅ Complete | [usecase_mobile_app.md](usecase_mobile_app.md#uc-m02) |
| UC-M03 | Search POIs by Name | P1 | ✅ Complete | [usecase_mobile_app.md](usecase_mobile_app.md#uc-m03) |
| UC-M04 | Filter POIs by Category | P2 | ❌ Not Implemented | [usecase_mobile_app.md](usecase_mobile_app.md#uc-m04) |
| UC-M05 | View Nearby POIs List | P1 | ✅ Complete | [usecase_mobile_app.md](usecase_mobile_app.md#uc-m05) |

#### Geofencing & Audio (Traveler)

| ID | Use Case | Priority | Status | Document |
|----|----------|----------|--------|----------|
| UC-M06 | Receive Automatic Audio Narration on POI Entry | P0 | ✅ Complete | [usecase_mobile_app.md](usecase_mobile_app.md#uc-m06) |
| UC-M07 | Manually Play POI Audio Narration | P0 | ✅ Complete | [usecase_mobile_app.md](usecase_mobile_app.md#uc-m07) |
| UC-M08 | Pause/Resume Audio Playback | P1 | ✅ Complete | [usecase_mobile_app.md](usecase_mobile_app.md#uc-m08) |
| UC-M09 | Adjust Audio Playback Speed | P2 | ❌ Not Implemented | [usecase_mobile_app.md](usecase_mobile_app.md#uc-m09) |

#### QR Code Scanning (Traveler)

| ID | Use Case | Priority | Status | Document |
|----|----------|----------|--------|----------|
| UC-M10 | Scan QR Code to Access POI | P0 | ✅ Complete | [usecase_mobile_app.md](usecase_mobile_app.md#uc-m10) |
| UC-M11 | Handle Invalid QR Code | P1 | ✅ Complete | [usecase_mobile_app.md](usecase_mobile_app.md#uc-m11) |
| UC-M12 | Check Daily QR Scan Limit | P1 | ⚠️ Partial (client-side only) | [usecase_mobile_app.md](usecase_mobile_app.md#uc-m12) |

#### Language & Localization (Traveler)

| ID | Use Case | Priority | Status | Document |
|----|----------|----------|--------|----------|
| UC-M13 | Switch Display Language | P0 | ✅ Complete | [usecase_mobile_app.md](usecase_mobile_app.md#uc-m13) |
| UC-M14 | View Auto-Translated Content | P1 | ✅ Complete | [usecase_mobile_app.md](usecase_mobile_app.md#uc-m14) |
| UC-M15 | Download Language Pack for Offline Use | P2 | ❌ Not Implemented | [usecase_mobile_app.md](usecase_mobile_app.md#uc-m15) |

#### Authentication (Traveler/Owner)

| ID | Use Case | Priority | Status | Document |
|----|----------|----------|--------|----------|
| UC-M16 | Register New Account | P1 | ✅ Complete | [usecase_mobile_app.md](usecase_mobile_app.md#uc-m16) |
| UC-M17 | Login to Account | P1 | ✅ Complete | [usecase_mobile_app.md](usecase_mobile_app.md#uc-m17) |
| UC-M18 | Logout from Account | P1 | ✅ Complete | [usecase_mobile_app.md](usecase_mobile_app.md#uc-m18) |
| UC-M19 | Reset Forgotten Password | P2 | ❌ Not Implemented | [usecase_mobile_app.md](usecase_mobile_app.md#uc-m19) |

#### Owner POI Submission (Owner)

| ID | Use Case | Priority | Status | Document |
|----|----------|----------|--------|----------|
| UC-M20 | Submit New POI for Review | P1 | ⚠️ Partial (backend ready, UI incomplete) | [usecase_mobile_app.md](usecase_mobile_app.md#uc-m20) |
| UC-M21 | View Submission Status | P2 | ❌ Not Implemented | [usecase_mobile_app.md](usecase_mobile_app.md#uc-m21) |
| UC-M22 | Edit Pending Submission | P2 | ❌ Not Implemented | [usecase_mobile_app.md](usecase_mobile_app.md#uc-m22) |

#### Zone & Subscription (Traveler)

| ID | Use Case | Priority | Status | Document |
|----|----------|----------|--------|----------|
| UC-M23 | View Available Zones | P2 | ✅ Complete | [usecase_mobile_app.md](usecase_mobile_app.md#uc-m23) |
| UC-M24 | Purchase Zone Access with Credits | P2 | ⚠️ Partial (backend ready) | [usecase_mobile_app.md](usecase_mobile_app.md#uc-m24) |
| UC-M25 | View Credit Balance | P2 | ⚠️ Partial (backend ready) | [usecase_mobile_app.md](usecase_mobile_app.md#uc-m25) |
| UC-M26 | Upgrade to Premium Subscription | P2 | ❌ Not Implemented | [usecase_mobile_app.md](usecase_mobile_app.md#uc-m26) |

---

### Backend API Use Cases

#### Authentication & Authorization (System)

| ID | Use Case | Priority | Status | Document |
|----|----------|----------|--------|----------|
| UC-B01 | Authenticate User with JWT | P0 | ✅ Complete | [usecase_backend_api.md](usecase_backend_api.md#uc-b01) |
| UC-B02 | Validate User Role (RBAC) | P0 | ✅ Complete | [usecase_backend_api.md](usecase_backend_api.md#uc-b02) |
| UC-B03 | Revoke JWT Token on Logout | P1 | ✅ Complete | [usecase_backend_api.md](usecase_backend_api.md#uc-b03) |
| UC-B04 | Check Premium Subscription Status | P1 | ✅ Complete | [usecase_backend_api.md](usecase_backend_api.md#uc-b04) |

#### POI Management (Owner/Admin)

| ID | Use Case | Priority | Status | Document |
|----|----------|----------|--------|----------|
| UC-B05 | Create POI (Admin Direct) | P1 | ✅ Complete | [usecase_backend_api.md](usecase_backend_api.md#uc-b05) |
| UC-B06 | Submit POI for Moderation (Owner) | P1 | ✅ Complete | [usecase_backend_api.md](usecase_backend_api.md#uc-b06) |
| UC-B07 | Update POI Content | P1 | ✅ Complete | [usecase_backend_api.md](usecase_backend_api.md#uc-b07) |
| UC-B08 | Delete POI (Soft Delete) | P2 | ✅ Complete | [usecase_backend_api.md](usecase_backend_api.md#uc-b08) |
| UC-B09 | Query POIs by Geolocation | P0 | ✅ Complete | [usecase_backend_api.md](usecase_backend_api.md#uc-b09) |
| UC-B10 | Get POI by Code | P0 | ✅ Complete | [usecase_backend_api.md](usecase_backend_api.md#uc-b10) |

#### Content Moderation (Admin)

| ID | Use Case | Priority | Status | Document |
|----|----------|----------|--------|----------|
| UC-B11 | View Pending POI Queue | P1 | ✅ Complete | [usecase_backend_api.md](usecase_backend_api.md#uc-b11) |
| UC-B12 | Approve Pending POI | P1 | ✅ Complete | [usecase_backend_api.md](usecase_backend_api.md#uc-b12) |
| UC-B13 | Reject Pending POI with Reason | P1 | ✅ Complete | [usecase_backend_api.md](usecase_backend_api.md#uc-b13) |
| UC-B14 | View Moderation Audit Log | P1 | ✅ Complete | [usecase_backend_api.md](usecase_backend_api.md#uc-b14) |

#### Analytics & Intelligence (System/Admin)

| ID | Use Case | Priority | Status | Document |
|----|----------|----------|--------|----------|
| UC-B15 | Ingest Analytics Events (Batch) | P1 | ✅ Complete | [usecase_backend_api.md](usecase_backend_api.md#uc-b15) |
| UC-B16 | Aggregate Events to Hourly Rollup | P1 | ✅ Complete | [usecase_backend_api.md](usecase_backend_api.md#uc-b16) |
| UC-B17 | Aggregate Events to Daily Rollup | P1 | ✅ Complete | [usecase_backend_api.md](usecase_backend_api.md#uc-b17) |
| UC-B18 | Query Heatmap Data | P1 | ✅ Complete | [usecase_backend_api.md](usecase_backend_api.md#uc-b18) |
| UC-B19 | Reconstruct User Journey | P2 | ✅ Complete | [usecase_backend_api.md](usecase_backend_api.md#uc-b19) |

#### Zone & Subscription Management (Admin/User)

| ID | Use Case | Priority | Status | Document |
|----|----------|----------|--------|----------|
| UC-B20 | Create Zone Package | P2 | ✅ Complete | [usecase_backend_api.md](usecase_backend_api.md#uc-b20) |
| UC-B21 | Add POI to Zone | P2 | ✅ Complete | [usecase_backend_api.md](usecase_backend_api.md#uc-b21) |
| UC-B22 | Purchase Zone with Credits | P2 | ✅ Complete | [usecase_backend_api.md](usecase_backend_api.md#uc-b22) |
| UC-B23 | Check User Zone Access | P2 | ✅ Complete | [usecase_backend_api.md](usecase_backend_api.md#uc-b23) |

---

### Admin Web Portal Use Cases

#### Dashboard & Overview (Admin)

| ID | Use Case | Priority | Status | Document |
|----|----------|----------|--------|----------|
| UC-A01 | View System Dashboard | P1 | ✅ Complete | [usecase_admin_web.md](usecase_admin_web.md#uc-a01) |
| UC-A02 | View User Statistics | P2 | ✅ Complete | [usecase_admin_web.md](usecase_admin_web.md#uc-a02) |
| UC-A03 | View POI Statistics | P2 | ✅ Complete | [usecase_admin_web.md](usecase_admin_web.md#uc-a03) |

#### Content Moderation (Admin)

| ID | Use Case | Priority | Status | Document |
|----|----------|----------|--------|----------|
| UC-A04 | View Pending POI Queue | P1 | ✅ Complete | [usecase_admin_web.md](usecase_admin_web.md#uc-a04) |
| UC-A05 | Approve POI from Queue | P1 | ✅ Complete | [usecase_admin_web.md](usecase_admin_web.md#uc-a05) |
| UC-A06 | Reject POI with Reason | P1 | ✅ Complete | [usecase_admin_web.md](usecase_admin_web.md#uc-a06) |
| UC-A07 | Bulk Approve/Reject POIs | P2 | ❌ Not Implemented | [usecase_admin_web.md](usecase_admin_web.md#uc-a07) |

#### Analytics & Heatmap (Admin)

| ID | Use Case | Priority | Status | Document |
|----|----------|----------|--------|----------|
| UC-A08 | View Geographic Heatmap | P1 | ✅ Complete | [usecase_admin_web.md](usecase_admin_web.md#uc-a08) |
| UC-A09 | Filter Heatmap by Date Range | P1 | ✅ Complete | [usecase_admin_web.md](usecase_admin_web.md#uc-a09) |
| UC-A10 | View POI Engagement Metrics | P2 | ✅ Complete | [usecase_admin_web.md](usecase_admin_web.md#uc-a10) |
| UC-A11 | Export Analytics Report | P2 | ❌ Not Implemented | [usecase_admin_web.md](usecase_admin_web.md#uc-a11) |

#### User Management (Admin)

| ID | Use Case | Priority | Status | Document |
|----|----------|----------|--------|----------|
| UC-A12 | View User List | P2 | ✅ Complete | [usecase_admin_web.md](usecase_admin_web.md#uc-a12) |
| UC-A13 | Edit User Role | P2 | ✅ Complete | [usecase_admin_web.md](usecase_admin_web.md#uc-a13) |
| UC-A14 | Deactivate User Account | P2 | ✅ Complete | [usecase_admin_web.md](usecase_admin_web.md#uc-a14) |
| UC-A15 | Grant Premium Subscription | P2 | ✅ Complete | [usecase_admin_web.md](usecase_admin_web.md#uc-a15) |

#### Audit & Compliance (Admin)

| ID | Use Case | Priority | Status | Document |
|----|----------|----------|--------|----------|
| UC-A16 | View Moderation Audit Log | P1 | ✅ Complete | [usecase_admin_web.md](usecase_admin_web.md#uc-a16) |
| UC-A17 | Search Audit Log by Criteria | P2 | ⚠️ Partial | [usecase_admin_web.md](usecase_admin_web.md#uc-a17) |
| UC-A18 | Export Audit Log to CSV | P2 | ❌ Not Implemented | [usecase_admin_web.md](usecase_admin_web.md#uc-a18) |

---

## Use Case Statistics

### By Status

| Status | Count | Percentage |
|--------|-------|------------|
| ✅ Complete | 42 | 70% |
| ⚠️ Partial | 6 | 10% |
| ❌ Not Implemented | 12 | 20% |
| **Total** | **60** | **100%** |

### By Priority

| Priority | Count | Percentage |
|----------|-------|------------|
| P0 (Critical) | 10 | 17% |
| P1 (High) | 28 | 47% |
| P2 (Medium) | 22 | 36% |
| **Total** | **60** | **100%** |

### By Subsystem

| Subsystem | Total Use Cases | Complete | Partial | Not Implemented |
|-----------|----------------|----------|---------|-----------------|
| MAUI Mobile App | 26 | 17 | 4 | 5 |
| Backend API | 19 | 19 | 0 | 0 |
| Admin Web Portal | 15 | 12 | 2 | 1 |

---

## Use Case Dependencies

### Critical Path (P0 Use Cases)

```
UC-M01 (View POIs on Map)
  ↓
UC-M06 (Automatic Audio Narration)
  ↓
UC-M10 (QR Code Scanning)
  ↓
UC-M13 (Language Switch)
  ↓
UC-B09 (Geolocation Query)
  ↓
UC-B01 (JWT Authentication)
```

### Moderation Workflow

```
UC-M20 (Owner Submit POI)
  ↓
UC-B06 (Backend Receive Submission)
  ↓
UC-A04 (Admin View Queue)
  ↓
UC-A05/UC-A06 (Approve/Reject)
  ↓
UC-B12/UC-B13 (Backend Process Decision)
  ↓
UC-A16 (Audit Log Created)
```

---

## Actor-Use Case Matrix

| Actor | Primary Use Cases | Secondary Use Cases |
|-------|------------------|---------------------|
| **Traveler** | UC-M01, UC-M02, UC-M06, UC-M07, UC-M10, UC-M13 | UC-M03, UC-M05, UC-M08, UC-M14, UC-M23 |
| **Owner** | UC-M20, UC-M21, UC-M22 | UC-M16, UC-M17, UC-M18 |
| **Admin** | UC-A04, UC-A05, UC-A06, UC-A08, UC-A16 | UC-A01, UC-A02, UC-A03, UC-A12, UC-A13 |
| **System** | UC-B01, UC-B02, UC-B15, UC-B16, UC-B17 | UC-B03, UC-B04, UC-B18, UC-B19 |

---

## Use Case Traceability

### Requirements → Use Cases

| Requirement | Related Use Cases |
|-------------|------------------|
| Offline POI navigation | UC-M01, UC-M02, UC-M05 |
| Geofence audio narration | UC-M06, UC-M07, UC-M08 |
| QR code scanning | UC-M10, UC-M11, UC-M12 |
| Multi-language support | UC-M13, UC-M14, UC-M15 |
| User authentication | UC-M16, UC-M17, UC-M18, UC-B01, UC-B02 |
| Content moderation | UC-B11, UC-B12, UC-B13, UC-A04, UC-A05, UC-A06 |
| Analytics & heatmap | UC-B15, UC-B16, UC-B17, UC-B18, UC-A08, UC-A09 |

### Use Cases → Test Cases

Each use case should have corresponding test cases:
- **Happy Path**: Primary success scenario
- **Alternate Paths**: Valid variations
- **Exception Paths**: Error handling
- **Edge Cases**: Boundary conditions

**Example**: UC-M10 (Scan QR Code)
- Test Case 1: Valid QR code with existing POI
- Test Case 2: Valid QR code with non-existent POI
- Test Case 3: Invalid QR code format
- Test Case 4: QR scan limit reached (free tier)
- Test Case 5: Camera permission denied

---

## Next Steps

Review detailed use case specifications:
1. [MAUI Mobile App Use Cases](usecase_mobile_app.md)
2. [Backend API Use Cases](usecase_backend_api.md)
3. [Admin Web Portal Use Cases](usecase_admin_web.md)

For technical implementation details, see:
- [Activity Diagrams](../04_activity/) - Business logic flows
- [Sequence Diagrams](../05_sequence/) - Technical execution flows
- [Feature Breakdown](../08_feature_vs_task_breakdown.md) - Feature-to-task mapping
