# VN GO Travel (MVP hiện tại)

Monorepo: **MAUI app** (bản đồ + POI + QR), **Node.js backend** (MongoDB, JWT, RBAC, moderation, audit), **`admin-web`** (quản trị duyệt POI), **`web`** (trang public theo mã POI).

Tài liệu này mô tả **đúng hiện trạng code đang chạy**, không mô tả kiến trúc lý tưởng.

## 0) Bố cục thư mục (handoff nhanh)

| Thư mục | Mô tả |
|---------|--------|
| **`backend/`** | API Express + MongoDB: `npm install` / `npm run dev` / `npm test`. Biến môi trường: `MONGO_URI`, `JWT_SECRET`, `CORS_ORIGIN`. |
| **`admin-web/`** | Dashboard ADMIN (Vite): `npm run dev` (thường port 5174), proxy sang backend. |
| **`web/`** | Landing POI public (Vite), chỉ đọc API. |
| **`MauiApp1.csproj`**, `Configuration/`, `Services/`, `Views/` | Ứng dụng mobile; đăng nhập gọi `POST /api/v1/auth/login` (JSON bọc `success` + `data`). |
| **`docs/`** | Tài liệu kỹ thuật; **`docs/SYSTEM_CURRENT_STATE.md`** là bản tóm tắt trạng thái các stage. |
| **`backend/mongo/`** | JSON mẫu / hướng dẫn Compass để seed hoặc test. |

## 1) Ứng dụng đang làm được gì

- Hiển thị danh sách POI trên bản đồ.
- Lấy vị trí hiện tại (GPS), kiểm tra geofence và tự phát thuyết minh ngắn khi vào vùng POI.
- Cho phép chạm pin để nghe thuyết minh, xem chi tiết POI, nghe bản thuyết minh dài.
- Hỗ trợ quét QR để mở POI (map-first hoặc detail tùy luồng).
- Lưu dữ liệu lõi POI cục bộ bằng SQLite để chạy offline.
- Hỗ trợ ngôn ngữ: `vi`, `en`, `ja`, `ko`, `fr`, `zh` (mức độ hoàn thiện không đồng đều).

## 2) Kiến trúc thực tế (MVP)

- UI: `Views/*` (Map, QR Scanner, POI Detail, Explore, About, Language Selector).
- Logic hiển thị: `ViewModels/*` (đặc biệt `MapViewModel`, `QrScannerViewModel`, `PoiDetailViewModel`).
- Dịch vụ chính:
  - `PoiDatabase`: SQLite local (`pois.db`).
  - `LocalizationService`: nạp text POI từ `Resources/Raw/pois.json` vào bộ nhớ.
  - `LocationService` + `GeofenceService` + `AudioService`: định vị, geofence, TTS.
  - `PoiTranslationService`: dịch động khi thiếu ngôn ngữ và có cache DB.
  - `PoiEntryCoordinator` + `QrResolver`: chuẩn hóa dữ liệu QR/deep link và điều hướng.

## 3) Dòng dữ liệu hiện tại

1. Lần đầu mở app, `LocalizationService` đọc `pois.json`.
2. Nếu SQLite trống, app seed dữ liệu POI lõi (tọa độ/radius/priority, 1 dòng cho mỗi code).
3. Khi hiển thị UI, `MapViewModel` gắn phần text bản địa hóa theo ngôn ngữ đang chọn từ `LocalizationService`.
4. Geofence dùng tập POI đang active để xác định vùng và gọi TTS.
5. QR/deep link đi qua `QrResolver` + `PoiEntryCoordinator`, sau đó điều hướng đến map/detail.

## 4) Quyết định kỹ thuật và trade-off

- Chọn SQLite local để app hoạt động ổn định khi offline.
- Tách dữ liệu lõi POI (DB) và text bản địa hóa (memory lookup từ JSON) để giảm query phức tạp trong MVP.
- Dịch động chỉ là lớp bổ sung: ưu tiên `vi`, fallback khi thiếu dữ liệu.
- Dùng nhiều log `Debug.WriteLine` để theo dõi nhanh trong giai đoạn hoàn thiện MVP.

## 5) Giới hạn / việc còn lại (quan trọng)

- Dữ liệu gốc hiện có trong `pois.json` chủ yếu là tiếng Việt; các ngôn ngữ khác phụ thuộc fallback/dịch động.
- Mobile vẫn **SQLite local-first** cho bản đồ; đồng bộ đầy đủ với API là **tùy chọn** (xem `docs/SYSTEM_CURRENT_STATE.md`).
- **Owner gửi POI từ MAUI** có thể chưa nối hết API sản phẩm (auth đã dùng backend).
- **Backend** có integration tests (`backend/tests/`); MAUI chưa có bộ test tự động đầy đủ.
- Tài liệu trong `docs/` được cập nhật theo runtime — ưu tiên **`SYSTEM_CURRENT_STATE.md`** và file **Runtime Contract** trong `docs/README.md`.

## 6) Chạy dự án

- Công cụ: Visual Studio 2022+ với workload .NET MAUI.
- Target frameworks trong `MauiApp1.csproj`: Android, iOS, MacCatalyst, Windows.
- Chạy trên emulator hoặc thiết bị thật (ưu tiên Android để test GPS/QR nhanh).

## 7) Tài liệu kỹ thuật liên quan

- [Trạng thái hệ thống & các stage](docs/SYSTEM_CURRENT_STATE.md)
- [Chỉ mục tài liệu (`docs/`)](docs/README.md)
- [Tổng quan backend (`docs/00-system-overview.md`)](docs/00-system-overview.md)
- [Luồng admin & moderation](docs/05-admin-flow.md)
- [Tham chiếu API](docs/07-api-reference.md)
- Các diagram/class (nếu có trong repo): `ClassDiagram.md`, `ERD.md`, `SequenceDiagram.md`; QR: `docs/QR_INTEGRATED_DOCUMENT.md`; kiến trúc MVP: `docs/architecture.md`; issue: `docs/known-issues.md`.
