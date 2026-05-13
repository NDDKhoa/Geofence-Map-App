# VN-GO Travel - Product Requirements Documentation (PRD)

**Document Version:** 1.0  
**Last Updated:** 2026-05-13  
**System Version:** MVP (Stage 7.3.1)

---

## Purpose

This PRD suite provides **complete system documentation** for the VN-GO Travel platform, a multi-subsystem travel guide application consisting of:

1. **MAUI Mobile App** (.NET MAUI) - Cross-platform mobile client (Android, iOS, Windows)
2. **Backend API** (Node.js + Express + MongoDB) - RESTful API with JWT authentication, RBAC, and analytics
3. **Admin Web Portal** (Vite + React) - Content moderation and analytics dashboard

This documentation is structured using **Bounded Context** principles to prevent monolithic diagrams and maintain clarity across the large-scale system.

---

## Documentation Structure

### Core Documentation

| Document | Description |
|----------|-------------|
| [01_problem_and_needs.md](01_problem_and_needs.md) | Problem statement, stakeholders, business requirements |
| [02_erd/](02_erd/) | Entity-Relationship Diagrams (bounded by domain) |
| [03_usecase/](03_usecase/) | Use case specifications by actor and subsystem |
| [04_activity/](04_activity/) | Business logic flows and decision trees |
| [05_sequence/](05_sequence/) | End-to-end technical execution flows |
| [06_class_diagram/](06_class_diagram/) | Architecture and design patterns |

### Analytical Documentation

| Document | Description |
|----------|-------------|
| [07_system_flows.md](07_system_flows.md) | Cross-system workflows and integration points |
| [08_feature_vs_task_breakdown.md](08_feature_vs_task_breakdown.md) | Feature-to-task mapping (prevents hallucination) |
| [09_known_issues_and_tech_debt.md](09_known_issues_and_tech_debt.md) | Real issues found in codebase |
| [10_assumptions_and_constraints.md](10_assumptions_and_constraints.md) | Design constraints and trade-offs |

---

## Reading Order

### For System Architects
1. Start with `01_problem_and_needs.md` for business context
2. Review `02_erd/erd_overview.md` for data architecture
3. Study `06_class_diagram/` for architectural patterns
4. Read `07_system_flows.md` for integration understanding

### For Developers
1. Read `08_feature_vs_task_breakdown.md` to understand feature scope
2. Review relevant use cases in `03_usecase/`
3. Study sequence diagrams in `05_sequence/` for implementation flows
4. Check `09_known_issues_and_tech_debt.md` before making changes

### For Product Managers
1. Start with `01_problem_and_needs.md`
2. Review `03_usecase/usecase_overview.md` for feature catalog
3. Study `04_activity/` for business logic understanding
4. Read `10_assumptions_and_constraints.md` for limitations

### For QA/Testers
1. Review `03_usecase/` for test scenarios
2. Study `04_activity/` for edge cases and failure paths
3. Check `09_known_issues_and_tech_debt.md` for known bugs
4. Use `05_sequence/` to understand expected system behavior

---

## Key Principles

### 1. Bounded Context
- **No monolithic diagrams**: Each diagram is scoped to a specific domain or subsystem
- **Maximum 7-10 entities per ERD**: Prevents rendering failures and maintains readability
- **Subsystem separation**: MAUI, Backend, and Admin-Web are documented separately where appropriate

### 2. Feature vs Task Distinction
- **Feature**: User-visible capability delivering business value (e.g., "Offline POI Navigation")
- **Task**: Technical step to achieve a feature (e.g., "Fetch GPS coordinates")
- **Flow**: Sequential interaction between components to complete a feature

### 3. No Hallucination Policy
- All documentation is **traced from actual code**
- If a mechanism is undocumented in code, it is explicitly marked as "Implicit/Undocumented"
- No invented features or flows

### 4. Academic & Professional Tone
- Clear, structured, logical documentation
- No marketing language or vague statements
- Precise technical terminology

---

## System Overview

### Subsystems

#### MAUI Mobile App
- **Technology**: .NET MAUI (C#)
- **Architecture**: MVVM with Service-Oriented design
- **Key Features**: Offline-first POI navigation, geofencing, QR scanning, multi-language support
- **Data**: SQLite local database + in-memory JSON localization

#### Backend API
- **Technology**: Node.js + Express 5 + MongoDB (Mongoose)
- **Architecture**: Layered (Route → Controller → Service → Repository → Model)
- **Key Features**: JWT authentication, RBAC, POI moderation, analytics ingestion, subscription management
- **Deployment**: RESTful API with CORS support

#### Admin Web Portal
- **Technology**: Vite + React
- **Architecture**: SPA with API client
- **Key Features**: POI moderation queue, audit logs, heatmap analytics, user management
- **Access**: Admin-only (RBAC enforced)

---

## Actors

| Actor | Role | Primary Subsystem |
|-------|------|-------------------|
| **Traveler** | End user exploring POIs | MAUI Mobile App |
| **Owner** | Content contributor submitting POIs | MAUI Mobile App + Backend API |
| **Admin** | Content moderator and system manager | Admin Web Portal + Backend API |
| **System** | Automated processes (geofencing, analytics) | All subsystems |

---

## Core Domains

1. **Authentication & Authorization** (Backend)
2. **POI Management** (All subsystems)
3. **Geofencing & Location Services** (MAUI)
4. **Translation & Localization** (MAUI + Backend)
5. **Content Moderation** (Backend + Admin Web)
6. **Analytics & Intelligence** (Backend + Admin Web)
7. **Zone & Subscription Management** (Backend + MAUI)
8. **Audio Narration** (MAUI)

---

## Document Conventions

### Diagram Notation
- **Mermaid syntax** for all UML diagrams
- **Maximum 15 nodes** per diagram to ensure readability
- **Bounded context** labels on all diagrams

### File References
- Code references use format: `[filename.cs:line](path/to/file.cs#Lline)`
- Cross-document references use relative paths

### Status Indicators
- ✅ **Implemented**: Feature exists in current codebase
- ⚠️ **Partial**: Feature partially implemented or has known issues
- ❌ **Not Implemented**: Documented for future reference only
- 🔄 **In Progress**: Currently under development

---

## Maintenance

This documentation should be updated when:
- New features are added to any subsystem
- Architecture changes occur
- Known issues are resolved
- New technical debt is identified

**Responsibility**: Development team + System architect

---

## References

- [System Current State](../SYSTEM_CURRENT_STATE.md) - Runtime status and stage completion
- [Architecture Overview](../architecture.md) - High-level architectural patterns
- [Backend System Overview](../00-system-overview.md) - Backend-specific documentation
- [Known Issues](../known-issues.md) - Current system limitations

---

**Note**: This PRD is generated from actual codebase analysis and represents the **real implementation**, not idealized architecture.
