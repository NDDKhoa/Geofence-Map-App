# 5.6 Sequence - Top Zones Bestsellers & Purchase Flow

Sơ đồ này mô tả quy trình từ khi người dùng thực hiện giao dịch mua một Zone (Tour) cho đến khi dữ liệu đó được tổng hợp và hiển thị trên biểu đồ "Top Zones bán chạy nhất" tại trang Dashboard của Admin.

## Các thành phần tham gia (Participants)
- **Tourist/User**: Người dùng thực hiện mua gói du lịch trên ứng dụng di động.
- **Mobile App**: Giao diện người dùng trên điện thoại (.NET MAUI).
- **Backend API**: Xử lý logic thanh toán và ghi nhận sự kiện (Node.js).
- **MongoDB**: Lưu trữ giao dịch và thực hiện các câu lệnh tập hợp (Aggregation).
- **Admin Web**: Giao diện quản trị hiển thị biểu đồ doanh thu (React).

## Quy trình chi tiết (Main Sequence)

### Giai đoạn 1: Giao dịch và Ghi nhận (Transaction & Logging)
1. **Mua Zone**: Người dùng nhấn nút "Mua" một Zone trên điện thoại.
2. **Yêu cầu thanh toán**: Mobile App gửi `POST /api/v1/purchase/zone {zoneCode}` kèm mã JWT của người dùng.
3. **Xử lý nghiệp vụ**: Backend thực hiện:
   - Kiểm tra số dư ví (`user_wallets`).
   - Khấu trừ tiền và tạo bản ghi sở hữu (`user_unlock_zones`).
   - **Ghi nhận giao dịch**: Tạo bản ghi trong `credit_transactions` kèm metadata là `zoneName`.
4. **Phản hồi**: Trả về thông báo thành công cho Mobile App.

### Giai đoạn 2: Tổng hợp dữ liệu (Data Aggregation)
5. **Yêu cầu dữ liệu**: Admin truy cập trang "Doanh thu" trên Web.
6. **Truy vấn Analytics**: Admin Web gửi `GET /api/v1/admin/intelligence/metrics/revenue`.
7. **Xử lý tại Database**: Backend thực hiện lệnh `aggregate` trên bộ sưu tập `credit_transactions`:
   - Lọc các giao dịch có loại là `purchase_zone`.
   - Nhóm (`$group`) theo `zoneCode`.
   - Tính tổng (`$sum`) số tiền và số lượt mua.
   - Sắp xếp (`$sort`) giảm dần theo số lượng hoặc doanh thu.
8. **Trả về kết quả**: Backend gửi mảng dữ liệu Top Zones đã xử lý về cho Admin Web.

### Giai đoạn 3: Hiển thị (Visualization)
9. **Vẽ biểu đồ**: Admin Web sử dụng thư viện Recharts để vẽ biểu đồ thanh (Bar Chart) như trong hình ảnh thực tế:
   - Trục tung (Y-axis): Danh sách tên các Zone.
   - Trục hoành (X-axis): Số lượng hoặc Doanh thu.

## Đặc điểm kỹ thuật
- **Real-time vs Rollup**: Dữ liệu trên biểu đồ Top Zones được tính toán real-time từ bảng giao dịch để đảm bảo tính chính xác tuyệt đối về tiền tệ.
- **Data Integrity**: Chỉ những giao dịch thành công mới được đưa vào tính toán.
