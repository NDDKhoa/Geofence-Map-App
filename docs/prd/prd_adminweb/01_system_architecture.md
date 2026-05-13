# 01 - System Communication Architecture

This document describes the high-level communication architecture between the MAUI Mobile App, the Backend API, and the Admin Web Portal.

## Overview

The system follows a hub-and-spoke model where the **Backend API** acts as the central coordinator. The **Mobile App** (for Travelers/Owners) and the **Web Portal** (for Admins) communicate exclusively through the Backend.

```mermaid
graph TD
    subgraph "MAUI Mobile App (Traveler/Owner)"
        App[Mobile App]
        SQLite[(Local Cache SQLite)]
        App -- reads/writes --> SQLite
    end

    subgraph "Backend API (Node.js/Express)"
        API[RESTful API]
        Auth[Auth Middleware]
        RBAC[RBAC Middleware]
        Analytics[Analytics Engine]
        API -- uses --> Auth
        API -- uses --> RBAC
        API -- uses --> Analytics
    end

    subgraph "Admin Web Portal (React)"
        Web[Admin Web]
        Leaflet[Leaflet Heatmap]
        Web -- uses --> Leaflet
    end

    subgraph "Database Tier"
        MongoDB[(MongoDB Atlas)]
    end

    %% Communication Flows
    App -- "REST /api/v1/ (JWT)" --> API
    Web -- "REST /api/v1/admin/ (JWT)" --> API
    API -- "Mongoose" --> MongoDB

    %% Cross-Platform Logic
    App -- "1. Submit POI" --> API
    API -- "2. Store PENDING" --> MongoDB
    MongoDB -- "3. Notify (Poll)" --> API
    API -- "4. View Queue" --> Web
    Web -- "5. Approve POI" --> API
    API -- "6. Set APPROVED" --> MongoDB
    MongoDB -- "7. Sync (Poll/Manual)" --> API
    API -- "8. Refresh Map" --> App

    App -- "A. Send Events" --> API
    API -- "B. Aggregate" --> MongoDB
    Web -- "C. Fetch Heatmap" --> API
```

## Communication Components

### 1. The Gateway (Backend API)
- All requests are stateless and secured via **JWT (JSON Web Tokens)**.
- **RBAC (Role-Based Access Control)** ensures that only users with the `ADMIN` role can access the `/api/v1/admin/*` endpoints.

### 2. Mobile-to-Web Interaction (Async)
There is no direct connection between the Mobile App and the Admin Web. Interaction is asynchronous and mediated by the database:
- **Content Creation**: A user submits content via the App. It enters a "Pending" state in the database. The Admin Web later retrieves this state for review.
- **Status Updates**: Once an Admin approves content, the state in the database changes. The App will reflect this change during its next synchronization or manual refresh.

### 3. Analytics Pipeline
- The **Mobile App** is the primary source of behavioral data (events).
- The **Backend** processes and aggregates this data.
- The **Admin Web** provides the interface to visualize this data (heatmaps, metrics).
