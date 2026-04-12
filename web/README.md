# VN GO Travel — POI landing (Stage 8)

Lightweight **read-only** web app: loads public POI from the backend (`GET /api/v1/pois/code/:code`) and offers **Open in app** / **Download** CTAs.

## Rules

- Does **not** change the Node backend or the MAUI app.
- No mock POI data in code — always uses the real API.

## Develop

If the repo path contains `#` (e.g. `DoAnC#`), Vite may warn; use relative paths (already set in `index.html`). Prefer moving the repo to a path without `#` if `npm run dev` misbehaves.

1. Start the backend locally (default `http://localhost:3000`).
2. From this folder:

```bash
npm install
npm run dev
```

3. Open e.g. `http://localhost:5173/poi/HO_GUOM`  
   (use a code that exists in your DB as **APPROVED**).

Dev server proxies `/api` → `http://localhost:3000` (see `vite.config.js`) to reduce CORS friction.

## Production build

Set the public API origin when building (backend must allow CORS for your web origin):

```bash
set VITE_API_BASE_URL=https://your-api.example.com
npm run build
```

Output: `dist/`. Serve with SPA fallback so `/poi/*` serves `index.html`.

## Deep links

- Custom scheme (same as in-app QR): `poi://CODE`
- Android **Open in app** uses an `intent://` URL with package `com.companyname.mauiapp1` (from MAUI `ApplicationId`).
- **Download** points to Google Play for that package (update when the store listing is live).

## Environment

Copy `.env.example` to `.env` if you need non-default values.
