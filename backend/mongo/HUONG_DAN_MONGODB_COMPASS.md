# MongoDB local and Compass — VN-GO Travel backend

## 1. Stage 4 review (this repo)

**Implemented per Stage 4 spec:**

| Requirement | Status |
|-------------|--------|
| `POST /api/v1/admin/pois/:id/approve` | Yes — `routes/admin-poi.routes.js` |
| `POST /api/v1/admin/pois/:id/reject` with reason | Yes — JSON body `{"reason":"..."}` required |
| ADMIN only | Yes — `protect` + `requireRole(ADMIN)` |
| Idempotent + status checks | Yes — `poi.service.js` |
| Business logic in service | Yes |
| Optional audit | Yes — `adminpoiaudits` after real `PENDING` → `APPROVED` / `REJECTED` |

**Out of scope for Stage 4:**

- Full automated backend tests (Stage 6)
- Mobile / web consuming API (Stages 7–8)
- Full “audit product” (dashboard, APIs) — Stage 5 can extend

**Conclusion:** Stage 4 is **complete in source**. Whether it “runs perfectly” depends on your `.env`, MongoDB running, `npm run seed`, and calling the API with an admin JWT (section 4).

---

## 2. Connect with MongoDB Compass

1. Run MongoDB locally (default port **27017**).
2. In Compass: **New connection**   Example URI (same as `backend/.env.example`):  
   `mongodb://127.0.0.1:27017/vngo_travel`
3. Database name must match the path in your `MONGO_URI`.

---

## 3. Why not import `users` as plain JSON in Compass?

`users` stores **bcrypt hashes**. Pasting plain-text passwords breaks login.

**Use the backend seed** (hashes passwords via the User model):

```bash
cd backend
npm run seed
```

Seed **deletes** `users`, `pois`, `poirequests`, `adminpoiaudits` then recreates sample data (`src/seed.js`).

Sample accounts (password **`password123`**):

- `admin@vngo.com` — ADMIN  
- `owner@vngo.com` — OWNER  
- `test@vngo.com` — USER  

---

## 4. Run API and test moderation

```bash
cd backend
npm start
```

Login as admin:

```http
POST http://localhost:3000/api/v1/auth/login
Content-Type: application/json

{"email":"admin@vngo.com","password":"password123"}
```

Approve / reject (replace `:id` with the Mongo `_id` of a **PENDING** `Poi`):

```http
POST http://localhost:3000/api/v1/admin/pois/:id/approve
Authorization: Bearer <token>
```

```http
POST http://localhost:3000/api/v1/admin/pois/:id/reject
Authorization: Bearer <token>
Content-Type: application/json

{"reason":"Khong du thong tin minh chung."}
```

---

## 5. Move data to MongoDB Atlas (cloud)

Use the Atlas connection string (`mongodb+srv://...`) in `MONGO_URI`, then from a machine with Node:

```bash
npm run seed
```

Or copy an existing local database:

```bash
mongodump --uri="mongodb://127.0.0.1:27017/vngo_travel" --out=./dump-vngo
mongorestore --uri="<YOUR_ATLAS_URI>" ./dump-vngo
```

(Adjust DB name and tools to your environment.)

---

## 6. Files in `backend/mongo/`

| File | Purpose |
|------|---------|
| `generate-atlas-imports.js` | Builds **`import_users.json`** + **`import_pois.json`** from **`Resources/Raw/pois.json`** (bcrypt passwords for login). Run: `cd backend` then `node mongo/generate-atlas-imports.js`. |
| `import_users.json` | 3 users: `user@vngo.com`, **`admin@vngo.com`**, `owner@vngo.com` — password **`password123`** (bcrypt hash). |
| `import_pois.json` | All POIs from the MAUI `pois.json`: GeoJSON `location`, `content.vi` / `content.en`, **`status: APPROVED`**. |
| `mau_insert_poi_pending.json` | One sample **PENDING** `Poi` (Extended JSON). Set `submittedBy.$oid` to the `_id` of `owner@vngo.com` in `users` after seed. `code` must be unique. |

### 6b. MongoDB Atlas — import order

1. Open database **`vngo_travel`** in Atlas Data Explorer.
2. **`users`**: insert the 3 objects from **`import_users.json`** (one **Insert document** each, or import the JSON array if supported).
3. **`pois`**: import **`import_pois.json`**. If duplicate `code`, clear `pois` first or fix conflicts.
4. **`adminpoiaudits`**: leave empty until moderation creates rows.
5. **`poirequests`**: leave empty unless you use that flow.

**admin-web:** `admin@vngo.com` / `password123` after `users` import.

**CORS:** `backend/.env` → `CORS_ORIGIN` includes `http://localhost:5174` and `http://localhost:5173` for `web/`.

---

## 7. Collections you should see

- `users`
- `pois`
- `poirequests` (separate from `Poi` moderation)
- `adminpoiaudits` (after a successful moderation from `PENDING`)

## 8. List audit history (API)

```http
GET http://localhost:3000/api/v1/admin/pois/audits?page=1&limit=20
Authorization: Bearer <admin_token>
```
