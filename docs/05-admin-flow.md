# 05 — Admin Flow

## 1. What “admin” means in this codebase

- **Role:** `ADMIN` (`constants/roles.js`).
- **Enforcement:** `requireRole(ROLES.ADMIN)` on:
  - **`/api/v1/pois`** mutations (create / update / delete by code), and
  - **`/api/v1/admin/pois`** moderation (approve / reject by Mongo `_id`).

**Routers:** main POI CRUD stays on **`/api/v1/pois`**. **Owner-submitted moderation** (Stage 4) uses **`/api/v1/admin/pois`**.

---

## 2. Admin POI endpoints

**Router:** `routes/poi.routes.js`  
**Base path:** `/api/v1/pois`  
**All routes** use **`protect`** first.

| Method | Path | Middleware after `protect` | Controller | Service |
|--------|------|------------------------------|------------|---------|
| POST | `/` | `requireRole(ADMIN)` | `poi.controller.create` | `poi.service.createPoi` |
| PUT | `/code/:code` | `requireRole(ADMIN)` | `poi.controller.updateByCode` | `poi.service.updatePoiByCode` |
| DELETE | `/code/:code` | `requireRole(ADMIN)` | `poi.controller.deleteByCode` | `poi.service.deletePoiByCode` |

**Reads** (`GET /nearby`, `GET /code/:code`) require JWT but **not** ADMIN.

---

## 3. Admin create behavior (`createPoi`)

**File:** `poi.service.js`

- Validates `code` (non-empty string) and location via `_buildLocationPayload`.
- Writes document with:
  - `status: POI_STATUS.APPROVED`
  - `submittedBy: null`
  - `content: body.content || {}`
  - `isPremiumOnly: Boolean(body.isPremiumOnly)`

**Effect:** Admin-created POIs are **immediately public** (match `publicVisibilityFilter`).

**Response:** Same public DTO as reads: `mapPoiDto` — **does not include** `status`, `submittedBy`, or timestamps in JSON.

```json
{
  "success": true,
  "data": {
    "id": "...",
    "code": "X",
    "location": { "lat": 0, "lng": 0 },
    "content": "...",
    "isPremiumOnly": false
  }
}
```

---

## 4. Admin update behavior (`updatePoiByCode`)

- Loads existing with `findByCode(code)` **without** `publicOnly` (finds any status).
- **Updatable fields from body:**
  - `location` → recomputed GeoJSON if present
  - `content` → shallow merge with existing (`toObject` if subdocument)
  - `isPremiumOnly` if defined
- **`status` is not read from `body`** in this method — admin **cannot** approve a `PENDING` owner POI via this update path in current code.

---

## 5. Admin delete behavior (`deletePoiByCode`)

- `findOneAndDelete({ code })` — removes **any** POI with that code regardless of status.
- Invalidates POI cache.

---

## 6. Owner-submitted POI moderation (Stage 4 — implemented)

**Router:** `routes/admin-poi.routes.js`  
**Base path:** `/api/v1/admin/pois`  
**Middleware:** `protect` → `requireRole(ADMIN)`.

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/pending` | Paginated list of **`Poi`** with `status: PENDING` (moderation queue). Same DTO shape as `/master` items. |
| GET | `/master` | Paginated list of **all** **`Poi`** documents (any status). Used by the admin-web **Manage POIs** CRUD screen. Query: `page`, `limit` (max100). |
| GET | `/audits` | Paginated audit history (`page`, `limit`); populate admin (`email`, `role`) and poi (`code`, `content`). Newest first. |
| POST | `/:id/approve` | `PENDING` → `APPROVED` (public visibility). Idempotent if already `APPROVED` or legacy doc with no `status`. |
| POST | `/:id/reject` | `PENDING` → `REJECTED` with **`reason`** (required). Idempotent if already `REJECTED`. |

**Service:** `poi.service.approvePoiById` / `rejectPoiById` — state rules, cache invalidation; **`admin-poi-audit.service.recordModeration`** after each **real** transition (mandatory; `500` if insert fails). Listing: **`admin-poi-audit.service.listAudits`**.

**Immutability:** no HTTP API to update or delete **`AdminPoiAudit`** rows.

**Rules (summary):**

- Cannot approve **`REJECTED`** POIs (`409`).
- Cannot reject **`APPROVED`** or legacy public (no `status`) POIs (`409`).
- **`status` is never taken from arbitrary client fields** on other routes; only these endpoints perform moderation transitions.

---

## 7. `PoiRequest` “approval” (separate subsystem)

**Not the same model as `Poi`.**

| Item | Detail |
|------|--------|
| Collection | `PoiRequest` |
| Create | `POST /api/v1/poi-requests` (any authenticated user) |
| Status update | `PUT /api/v1/poi-requests/:id/status` |
| Body | `{ "status": "approved" \| "rejected" }` (lowercase strings) |
| Service validation | `poi-request.service.js` — only allows those two values |
| RBAC | **None** — only `protect` |

**Important:** Updating `PoiRequest` status **does not** create or update a **`Poi`** document in the current codebase.

---

## 8. Summary table

| Action | Implemented? | Notes |
|--------|----------------|-------|
| Admin create live POI | Yes | Forces `APPROVED`. |
| Admin update POI fields | Yes | No `status` in update. |
| Admin delete POI | Yes | By `code`. |
| Admin approve owner `Poi` (`PENDING`→`APPROVED`) | **Yes** | `POST /api/v1/admin/pois/:id/approve` |
| Admin reject owner `Poi` | **Yes** | `POST /api/v1/admin/pois/:id/reject` + `reason` |
| Admin list moderation audits | **Yes** | `GET /api/v1/admin/pois/audits` (pagination, populated) |
| Admin list all POIs (master CRUD UI) | **Yes** | `GET /api/v1/admin/pois/master` (pagination; any status) |
| Moderate `PoiRequest` | Partial | Endpoint exists; **not admin-only**. |
