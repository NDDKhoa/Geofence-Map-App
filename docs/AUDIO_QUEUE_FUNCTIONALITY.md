# 🎵 Hệ Thống Hàng Đợi Audio (Audio Queue System) - Tài Liệu Kỹ Thuật

Tài liệu này mô tả chi tiết chức năng hàng đợi audio (Audio Queue) trong hệ thống VN-GO Travel, giải quyết bài toán điều phối phát âm thanh khi có nhiều người dùng cùng lúc tại một điểm tham quan (POI).

---

## 📋 1. Tổng Quan Mục Tiêu
Hệ thống hàng đợi được thiết kế để:
1.  **Tránh xung đột âm thanh:** Đảm bảo tại một thời điểm, chỉ có một số lượng người dùng nhất định (hoặc duy nhất 1 người tùy cấu hình) phát âm thanh tại một vị trí vật lý để không gây nhiễu loạn.
2.  **Điều phối thời gian thực:** Sử dụng Socket.IO để thông báo trạng thái và ra lệnh phát audio ngay lập tức khi đến lượt.
3.  **Công bằng (FIFO):** Người đến trước nghe trước, người đến sau xếp hàng chờ.

---

## 🏗️ 2. Kiến Trúc Hệ Thống (End-to-End)

Hệ thống hoạt động dựa trên sự phối hợp giữa Mobile App và Backend thông qua kết nối Socket.IO liên tục.

### Các thành phần chính:
*   **Mobile App (C# - .NET MAUI):**
    *   `IAudioQueueService`: Interface định nghĩa các hành động gửi yêu cầu, hủy, và nhận sự kiện.
    *   `AudioQueueService`: Implementation sử dụng thư viện SocketIOClient để kết nối server.
    *   `PoiNarrationService`: Lớp điều phối (Orchestrator) quyết định khi nào cần dùng hàng đợi (Online) và khi nào phát trực tiếp (Offline).
*   **Backend (Node.js):**
    *   `audio-queue.socket.js`: Xử lý các kết nối socket, quản lý phòng (room) theo `poiCode`.
    *   `audio-queue.service.js`: Chứa logic nghiệp vụ xử lý hàng đợi, tính toán thời gian chờ và lưu trữ vào MongoDB.
    *   `AudioQueueEntry Model`: Lưu trữ trạng thái của từng yêu cầu nghe trong database.

---

## 🔄 3. Quy Trình Hoạt Động (Sequence Flow)

1.  **Tham gia phòng (Join Room):** Khi người dùng tiến gần hoặc chọn một POI, máy sẽ gửi sự kiện `join-poi` kèm theo `poiCode`. Server đưa người dùng vào một "Socket Room" riêng cho POI đó.
2.  **Yêu cầu nghe (Request):** Người dùng nhấn nút nghe, Mobile gửi sự kiện `request-audio`.
3.  **Xử lý tại Server:**
    *   Server kiểm tra danh sách hiện tại của POI đó.
    *   Nếu chưa có ai nghe: Đặt trạng thái là `PLAYING` và gửi lệnh `audio-start` ngay lập tức.
    *   Nếu đã có người nghe: Đặt trạng thái là `QUEUED`, tính toán `queuePosition` và gửi lại cho người dùng.
4.  **Cập nhật trạng thái:** Server broadcast sự kiện `queue-status` tới tất cả mọi người trong phòng POI đó để cập nhật UI (Vị trí chờ, số người đang đợi).
5.  **Kích hoạt phát (Start):** Khi người đang nghe hoàn tất, server tìm người tiếp theo trong hàng đợi, đổi trạng thái thành `PLAYING` và gửi lệnh `audio-start` tới máy người đó.
6.  **Hoàn tất (Complete):** Mobile phát xong âm thanh (qua TTS), gửi sự kiện `audio-completed` để server giải phóng chỗ cho người tiếp theo.

---

## 👥 4. Xử Lý Kịch Bản $n$ Máy Nghe Cùng Lúc

Đây là cách hệ thống xử lý khi có rất nhiều máy cùng yêu cầu nghe tại một điểm:

| Kịch bản | Cách xử lý |
| :--- | :--- |
| **Máy 1 yêu cầu** | Trạng thái: `PLAYING`. Máy 1 phát âm thanh ngay lập tức. |
| **Máy 2, 3... n yêu cầu** | Trạng thái: `QUEUED`. Các máy nhận được vị trí hàng đợi (Vd: Máy 2 vị trí 1, Máy 3 vị trí 2). |
| **Máy 1 hoàn tất** | Server gửi lệnh `audio-start` cho Máy 2. Máy 2 bắt đầu phát. |
| **Máy 2 đang nghe mà thoát** | Server nhận sự kiện `disconnect` hoặc `leave-poi`, tự động hủy yêu cầu của Máy 2 và đẩy Máy 3 lên nghe. |
| **Tính thời gian chờ** | Hệ thống ước tính: `Thời gian còn lại của người đang nghe` + `(Số người phía trước * 30s)`. |

---

## 💻 5. Tham Chiếu Mã Nguồn (Code Reference)

### Mobile (Frontend)
| File | Chức năng chính |
| :--- | :--- |
| [AudioQueueService.cs](file:///c:/Users/KHOA/source/repos/VN-GO-Travel7/Services/AudioQueueService.cs) | Giao tiếp Socket.IO (Join, Leave, Request, Complete). |
| [PoiNarrationService.cs](file:///c:/Users/KHOA/source/repos/VN-GO-Travel7/Services/PoiNarrationService.cs) | Đăng ký sự kiện `AudioStartRequested` để thực hiện phát TTS. |

### Backend
| File | Chức năng chính |
| :--- | :--- |
| [audio-queue.socket.js](file:///c:/Users/KHOA/source/repos/VN-GO-Travel7/backend/src/socket/audio-queue.socket.js) | Lắng nghe sự kiện từ Client và broadcast trạng thái phòng. |
| [audio-queue.service.js](file:///c:/Users/KHOA/source/repos/VN-GO-Travel7/backend/src/services/audio-queue.service.js) | Logic FIFO, lưu DB [AudioQueueEntry](file:///c:/Users/KHOA/source/repos/VN-GO-Travel7/backend/src/models/audio-queue.model.js). |

---

## ⚠️ 6. Lưu Ý Quan Trọng
*   **Chế độ Offline:** Nếu mất kết nối Socket, hệ thống sẽ tự động chuyển sang chế độ phát trực tiếp (Direct Mode) để đảm bảo trải nghiệm người dùng không bị gián đoạn, nhưng lúc này sẽ không có sự điều phối giữa các máy.
*   **Dọn dẹp hàng đợi:** Server có một tiến trình chạy ngầm mỗi 10 phút để dọn dẹp các yêu cầu cũ (COMPLETED/CANCELLED) nhằm tối ưu hóa database.
