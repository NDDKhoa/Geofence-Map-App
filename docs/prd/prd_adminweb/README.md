# Admin Web Portal PRD

This directory contains the Product Requirement Documentation (PRD) specifically for the **Admin Web Portal**.

## Functional Hierarchy

### 1. Core Management (Main Functions)
- **[UC_Master_POI_Management.md](03_usecase/UC_Master_POI_Management.md)**: Management of the global POI database and localization.
- **[UC_User_Account_Management.md](03_usecase/UC_User_Account_Management.md)**: User roles (USER, OWNER, ADMIN), account locking, and premium grants.
- **[UC_Zones_and_Subscriptions.md](03_usecase/UC_Zones_and_Subscriptions.md)**: Geo-fenced zone bundles and credit-based pricing models.

### 2. Moderation & Workflow
- **[UC_Admin_Moderation.md](03_usecase/UC_Admin_Moderation.md)**: Approval/Rejection queue for Owner-submitted content.
- **[ACT_Translation_Workflow.md](04_activity/ACT_Translation_Workflow.md)**: Multi-language content review logic.

### 3. Intelligence & Analytics
- **[UC_Advanced_Analytics.md](03_usecase/UC_Advanced_Analytics.md)**: Audio engagement, user journeys, and revenue tracking.
- **[03_usecase/UC_Admin_Analytics.md](03_usecase/UC_Admin_Analytics.md)**: Geographic activity heatmaps.

### 4. Compliance & Support
- **[UC_Audit_and_Compliance.md](03_usecase/UC_Audit_and_Compliance.md)**: System audit logs and activity history.
- **[UC_Admin_Dashboard.md](03_usecase/UC_Admin_Dashboard.md)**: System health and key performance indicators.

## Architecture & Integration
- **[01_system_architecture.md](01_system_architecture.md)**: Visual mapping of App-Backend-Web communication.
- **[05_sequence/SEQ_Cross_Platform_Sync.md](05_sequence/SEQ_Cross_Platform_Sync.md)**: End-to-end data synchronization flows.
