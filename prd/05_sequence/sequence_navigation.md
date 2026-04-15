# 5. Sequence - Navigation

## Participants
- Actor: Tourist/User hoặc System flow
- View: `QrScannerPage`, `MapPage`, `PoiDetailPage`
- ViewModel: `QrScannerViewModel`, `MapViewModel`, `PoiDetailViewModel`
- Service: `NavigationService`
- Database: N/A trực tiếp (không query DB trong thao tác navigate)
- External API: N/A trực tiếp (dùng Shell/navigation stack nội bộ app)
- Framework: `Shell` navigation stack

## Main Sequence

1. ViewModel/Coordinator yêu cầu navigate (`NavigateToAsync`, `PushModalAsync`, `GoBackAsync`).
2. `NavigationService.StartNavigationAsync` check `_isNavigating`.
3. Nếu pass:
   - acquire `_navGate`.
   - execute navigation trên MainThread.
4. Cập nhật modal count trong AppState (với modal operations).
5. Release `_navGate`, reset `_isNavigating`.

## Thread Context

- Request gọi service: có thể background/MainThread.
- `Shell.Current.GoToAsync` được bọc để chạy MainThread.
- State flag `_isNavigating` + semaphore bảo vệ cross-thread request.

## Race Conditions / Duplicate Triggers

- Nếu có request mới khi `_isNavigating == true`, request bị reject (không queue).
- Trong các luồng fire-and-forget, người dùng có thể cảm nhận “bấm nhưng không đi”.
- Map/QR/deeplink có thể cùng phát request navigate, phụ thuộc timing lock để thắng.

## Real Limitation

- Thiết kế ưu tiên tránh crash/race ở cost của reliability thao tác người dùng (drop request).
