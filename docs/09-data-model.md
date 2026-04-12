# 09 — Data Model (MongoDB / Mongoose)

**ODM:** Mongoose **9.x**  
**Connection:** `mongoose.connect(config.mongoUri)` in `config/db.js`.

---

## 1. Collection: `users` (model `User`)

**File:** `models/user.model.js`

| Field | Type | Constraints | Notes |
|-------|------|-------------|--------|
| `email` | String | required, unique, lowercase | Indexed by unique constraint. |
| `password` | String | required, **select: false** | Hashed on save if modified (bcrypt cost 12). |
| `role` | String | enum `USER` \| `OWNER` \| `ADMIN`, default `USER` | Values from `constants/roles.js`. |
| `isPremium` | Boolean | default `false` | Subscription flag. |
| `createdAt` | Date | auto | `timestamps: true` |
| `updatedAt` | Date | auto | |

**Methods:**

- `comparePassword(candidatePassword, userPassword)` → `bcrypt.compare`.

**Virtual:**

- Mongoose default **`id`** getter (string of `_id`) — used by some controllers as `req.user.id`.

---

## 2. Collection: `pois` (model `Poi`)

**File:** `models/poi.model.js`

| Field | Type | Constraints | Notes |
|-------|------|-------------|--------|
| `code` | String | required, **unique** | Global uniqueness across statuses. |
| `location.type` | String | enum `Point`, default `Point` | |
| `location.coordinates` | [Number] | required, length 2 | **[lng, lat]** GeoJSON order. |
| `content.vi` | String | optional | |
| `content.en` | String | optional | |
| `isPremiumOnly` | Boolean | default `false` | Exposed in public DTO. |
| `status` | String | enum `PENDING` \| `APPROVED` \| `REJECTED`, default `PENDING` | From `constants/poi-status.js`. |
| `submittedBy` | ObjectId ref `User` | default `null` | Owner submissions set to submitter. |
| `rejectionReason` | String | optional, max 2000 | Set when status is `REJECTED` (admin moderation). |
| `createdAt` | Date | auto | |
| `updatedAt` | Date | auto | |

**Indexes:**

- **`location`:** `2dsphere` (explicit in schema).

**Implicit:**

- Unique index on **`code`** from `unique: true`.

---

## 3. Collection: `adminpoiaudits` (model `AdminPoiAudit`)

**File:** `models/admin-poi-audit.model.js`

| Field | Type | Notes |
|-------|------|--------|
| `poiId` | ObjectId ref `Poi` | required, indexed |
| `adminId` | ObjectId ref `User` | required, indexed |
| `action` | String | `APPROVE` \| `REJECT` |
| `previousStatus` | String | optional |
| `newStatus` | String | optional |
| `reason` | String | optional (reject) |
| `createdAt` / `updatedAt` | Date | `timestamps: true` |

Written by **`admin-poi-audit.service.recordModeration`** after each successful **`PENDING` → `APPROVED` / `REJECTED`** transition (not on idempotent no-op responses). **API surface is read-only** (GET list for ADMIN only); no PUT/PATCH/DELETE for audit documents.

---

## 4. Collection: `poirequests` (model `PoiRequest`)

**File:** `models/poi-request.model.js`  
Mongoose default collection name: lowercase plural of model name → **`poirequests`**.

| Field | Type | Constraints |
|-------|------|-------------|
| `poiData.code` | String | required |
| `poiData.location.type` | String | enum `Point`, default `Point` |
| `poiData.location.coordinates` | [Number] | required |
| `poiData.content.vi` | String | optional |
| `poiData.content.en` | String | optional |
| `poiData.isPremiumOnly` | Boolean | default `false` |
| `status` | String | enum **`pending`**, **`approved`**, **`rejected`**, default **`pending`** |
| `createdBy` | ObjectId ref `User` | required |
| `createdAt` | Date | auto |
| `updatedAt` | Date | auto |

**Note:** Status strings are **lowercase** and **not** the same enum as `Poi.status`.

---

## 5. Relationships (logical)

```
User 1 ──* Poi           (Poi.submittedBy → User._id, optional)
User 1 ──* PoiRequest    (PoiRequest.createdBy → User._id, required)
```

No Mongoose `populate()` is used in repositories for these references in current read paths.

---

## 6. Repository operations (query surface)

### 6.1 `user.repository.js`

| Method | Operation |
|--------|-----------|
| `findByEmail(email)` | `findOne({ email }).select('+password')` |
| `findById(id)` | `findById(id)` |
| `updatePremiumStatus(userId, isPremium)` | `findByIdAndUpdate` |
| `createUser(userData)` | `User.create` (seeder) |

### 6.2 `poi.repository.js`

| Method | Operation |
|--------|-----------|
| `findNearby` | `find` with `$and` [visibility, `$near`] |
| `findByCode(code, { publicOnly })` | `findOne` with optional visibility |
| `findById(id)` | `findById` (validates ObjectId shape) |
| `transitionPendingToApproved(id)` | `findOneAndUpdate` filter `status: PENDING` |
| `transitionPendingToRejected(id, reason)` | `findOneAndUpdate` filter `status: PENDING` |
| `create(data)` | `Poi.create` |
| `updateByCode(code, update)` | `findOneAndUpdate`, `runValidators: true` |
| `deleteByCode(code)` | `findOneAndDelete` |

### 6.3 `admin-poi-audit.repository.js`

| Method | Operation |
|--------|-----------|
| `create(entry)` | `AdminPoiAudit.create` |
| `findPaginated({ page, limit })` | `find` + `populate(adminId: email,role; poiId: code,content)` + `sort(createdAt desc)` + skip/limit; `countDocuments` |

### 6.4 `poi-request.repository.js`

| Method | Operation |
|--------|-----------|
| `create(requestData)` | `PoiRequest.create` |
| `updateStatus(id, status)` | `findByIdAndUpdate`, `runValidators: true` |
| `findById(id)` | `findById` |

---

## 7. Seed script data

**File:** `seed.js`

- Deletes **`User`**, **`Poi`**, **`PoiRequest`**, **`AdminPoiAudit`** then inserts:
  - Users: `test@vngo.com` (USER), `admin@vngo.com` (ADMIN), `owner@vngo.com` (OWNER); password **`password123`**.
  - Five POIs with **`status: APPROVED`**, **`submittedBy: null`**.

---

## 8. Constants (non-persistent)

| File | Exports |
|------|---------|
| `constants/roles.js` | `ROLES` |
| `constants/poi-status.js` | `POI_STATUS` |
| `constants/features.js` | `FEATURES`, `featureRequiresPremium`, `isKnownFeature` |
