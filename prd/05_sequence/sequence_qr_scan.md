# 5. Sequence - QR Scan

## Participants
- Actor: Tourist/User
- View: `QrScannerPage`
- ViewModel: `QrScannerViewModel`
- Services: `PoiEntryCoordinator`, `QrResolver`, `NavigationService`, `ApiService`
- Data: SQLite (`pois`), in-memory localization, Mongo (qua backend API)
- External API: `POST /api/v1/pois/scan` (secure token path)

## Main Sequence (Manual/Camera)

1. User quét QR hoặc nhập code.
2. `QrScannerPage` chuyển raw text cho `QrScannerViewModel`.
3. VM set processing phase, gọi `PoiEntryCoordinator.HandleEntryAsync`.
4. Coordinator parse bằng `QrResolver`.
5. **Decision** token scan?
   - **No**:
     1. Query local POI theo code từ SQLite.
     2. Build route map/detail.
   - **Yes**:
     1. Gọi backend `POST /pois/scan`.
     2. Backend verify JWT + validate POI status + quota/premium.
     3. Trả POI payload.
     4. Coordinator upsert local core POI + inject localization runtime.
     5. Build route.
6. Coordinator gọi `NavigationService.NavigateToAsync`.
7. `NavigationService` serialize và gọi `Shell.GoToAsync`.
8. User đến page đích.

## Thread Context

- Parse và coordinator logic: background.
- Network/API call: background.
- Shell navigation: MainThread (qua `NavigationService`).
- AppState selection update: MainThread dispatch.

## Race Conditions / Duplicate Triggers

- Scanner-level guard: `_isHandlingScan` + `IsProcessingScan`.
- Coordinator duplicate suppression theo `lastHandledCode + time window`.
- Navigation-level reject nếu `_isNavigating`.
- Tác dụng phụ: có thể suppress quá mức khi user thao tác nhanh liên tiếp.

## Real Error Paths

- QR format sai -> `InvalidFormat`.
- POI local không có -> fail not found.
- Token sai/hết hạn -> backend 401/4xx.
- Hết quota free scan -> backend 403.
