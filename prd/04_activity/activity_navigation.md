# 4. Activity - Navigation

## Scope
- Điều phối điều hướng giữa map/detail/qr và modal pages.

## Step-by-step Activity

1. Luồng nghiệp vụ gọi `NavigationService`.
2. Service check `_isNavigating`:
   - nếu true -> reject request.
3. Nếu được phép:
   - acquire semaphore `_navGate`.
   - chạy `Shell.Current.GoToAsync(...)` hoặc Push/Pop modal.
4. Cập nhật `AppState.ModalCount` khi modal stack đổi.
5. Release semaphore, clear `_isNavigating`.

## Key Decisions/Conditions

- Điều hướng được serialize để tránh race crash ở layer platform.
- GoToAsync chạy trên MainThread.
- Modal count là tín hiệu cho geofence/loop biết khi nào nên tạm dừng trigger.

## Known Imperfections

- Chính sách reject khi `_isNavigating = true` có thể làm mất thao tác hợp lệ của user (không queue lại).
- Nhiều nơi gọi navigate từ callback async/fire-and-forget, làm thứ tự điều hướng khó kiểm chứng hơn.
