# 📋 Danh Sách Chức Năng & Lộ Trình Phát Triển — QuanNuoc

Tài liệu này liệt kê **tất cả chức năng** cần phát triển, được chia thành **4 giai đoạn** từ cốt lõi đến nâng cao. Mỗi giai đoạn có thể hoạt động độc lập — hoàn thành Giai đoạn 1 là đã có thể sử dụng được ngay.

---

## 🏷️ Ký Hiệu

| Ký hiệu | Ý nghĩa |
|---|---|
| `[ ]` | Chưa làm |
| `[/]` | Đang làm |
| `[x]` | Hoàn thành |
| 🔴 | Bắt buộc (core) |
| 🟡 | Nên có |
| 🟢 | Tốt để có (nice-to-have) |

---

## 🔵 Giai Đoạn 1 — Nền Tảng Cốt Lõi

> **Mục tiêu:** Có thể mở quán và dùng app ghi order, thanh toán cơ bản.
> **Ước lượng:** 2–3 tuần

### 1.1 Thiết lập dự án

- [x] 🔴 Cấu hình Backend Spring Boot kết nối PostgreSQL
- [x] 🔴 Tạo các Entity JPA (DiningTable, MenuItem, Order, OrderItem)
- [x] 🔴 Cấu hình CORS cho phép Frontend gọi API
- [x] 🔴 Thiết lập cấu trúc thư mục Frontend (React Router, layout chung)
- [x] 🔴 Cấu hình API base URL cho Frontend (axios / fetch)

### 1.2 Quản lý Menu (Món ăn & Đồ uống)

- [x] 🔴 **API CRUD món ăn** — Thêm / Sửa / Xóa / Liệt kê món
- [x] 🔴 **Trang quản lý menu** — Giao diện thêm/sửa/xóa món
- [x] 🔴 **Phân loại món** — Chia theo danh mục: Đồ uống, Đồ ăn nhanh, Khác
- [x] 🔴 **API CRUD loại món** — Thêm / Sửa / Xóa / Liệt kê loại món
- [x] 🔴 **Giá tiền** — Mỗi món có giá, hiển thị định dạng VNĐ
- [x] 🟡 **Trạng thái còn hàng / hết hàng** — Đánh dấu món nào đang hết
- [x] 🟡 **Lọc món ăn** — Tìm kiếm món theo tên, Lọc món theo loại, Lọc theo trạng thái (còn hàng / hết hàng)

### 1.3 Quản lý Bàn

- [x] 🔴 **API CRUD bàn** — Thêm / Sửa / Xóa / Liệt kê bàn
- [x] 🔴 **Trang quản lý bàn** — Giao diện cài đặt danh sách bàn
- [x] 🔴 **Trạng thái bàn** — Trống 🟢 / Đang có khách 🔴 / Chờ thanh toán 🟡
- [x] 🔴 **Sơ đồ bàn** — Xem tổng quan tất cả bàn trên 1 màn hình (dạng lưới/grid)

### 1.4 Ghi Order (Chức năng chính)

- [x] 🔴 **Tạo order cho bàn** — Chọn bàn → chọn món → xác nhận
- [x] 🔴 **Ghi nhận thời gian gọi** — Tự động lưu timestamp khi tạo order cho các orderItem
- [x] 🔴 **Thêm món vào order đang mở** — Khách gọi thêm món
- [x] 🔴 **Sửa số lượng món** — Tăng / giảm số lượng
- [x] 🔴 **Xóa món khỏi order** — Khách hủy món
- [x] 🔴 **Ghi chú cho món** — Ví dụ: "ít đá", "không đường", "cay nhiều"
- [x] 🔴 **Xem chi tiết order của bàn** — Danh sách món + số lượng + giá + ghi chú + món nào đã ra món nào chưa ra

### 1.5 Quản lý bếp

- [x] 🔴 **Hiển thị danh sách món ăn, sắp xếp theo thời gian** — Hiển thị danh sách món ăn cần thực hiện cho bếp, sắp xếp theo thời gian đặt món
- [x] 🔴 **Hiển thị thời gian chờ** — "Món chân gà bàn 3: Đã gọi 15p trước"
- [x] 🔴 **Hiển thị tổng các món cần làm** — Hiển thị tổng các món cần làm cho tất cả các bàn hiện tại
- [x] 🔴 **Đánh dấu đã phục vụ** — Cập nhật trạng thái từng món ăn đã mang ra cho khách

### 1.6 Thanh Toán Cơ Bản

- [x] 🔴 **Tính tổng tiền order** — Tự động cộng tất cả các món
- [x] 🔴 **Xác nhận thanh toán** — Đóng order, chuyển bàn về trạng thái "Trống"
- [x] 🔴 **Xem hóa đơn** — Hiển thị danh sách món + giá + tổng tiền
- [x] 🟡 **Chọn phương thức thanh toán** — Tiền mặt / Chuyển khoản

---

## 🟢 Giai Đoạn 2 — Nâng Cao Trải Nghiệm

> **Mục tiêu:** App dễ dùng hơn, nhanh hơn, ít sai sót hơn.
> **Ước lượng:** 2–3 tuần

### 2.2 Quản Lý Order Nâng Cao

- [x] 🟡 **Gộp bàn** — Nhóm khách ngồi nhiều bàn, tính chung 1 hóa đơn
- [x] 🟡 **Chuyển bàn** — Khách muốn đổi bàn → chuyển order sang bàn mới
- [x] 🟡 **Tách hóa đơn** — Chia order thành nhiều hóa đơn riêng
- [x] 🟢 **Ghi chú cho bàn** — Ví dụ: "Khách quen cô Lan", "Đang chờ thêm người"

### 2.3 Thông Báo & Cảnh Báo

- [x] 🟡 **Thông báo âm thanh** — Khi có order mới
- [x] 🟡 **Cảnh báo bàn chờ lâu** — Highlight bàn chờ quá 20 phút
- [x] 🟢 **Thông báo hết hàng** — Khi món cuối cùng được bán hết (Tích hợp trong Menu toggle)

### 2.4 Lịch Sử Order

- [x] 🟡 **Xem lịch sử order trong ngày** — Danh sách tất cả order đã thanh toán
- [x] 🟡 **Xem lại chi tiết order cũ** — Kiểm tra nếu có tranh cãi
- [x] 🟢 **Tìm kiếm order** — Theo bàn, theo thời gian, theo món

---

## 🟡 Giai Đoạn 3 — Thống Kê & Báo Cáo

> **Mục tiêu:** Chủ quán nắm được tình hình kinh doanh.
> **Ước lượng:** 2 tuần

### 3.1 Thống Kê Doanh Thu

- [x] 🔴 **Doanh thu hôm nay** — Tổng tiền thu được trong ngày
- [x] 🟡 **Doanh thu theo tuần / tháng** — Biểu đồ cột/line chart
- [x] 🟡 **So sánh doanh thu** — So sánh giữa các ngày (Xem qua biểu đồ)
- [ ] 🟢 **Doanh thu theo giờ** — Biết giờ nào bán chạy nhất

### 3.2 Thống Kê Món Bán Chạy

- [x] 🟡 **Top món bán chạy** — Xếp hạng theo số lượng bán
- [x] 🟡 **Món ít bán** — Xem xét loại bỏ khỏi menu (Thông qua xếp hạng thấp nhất)
- [ ] 🟢 **Xu hướng** — Món nào đang tăng / giảm theo thời gian

### 3.3 Báo Cáo

- [x] 🟡 **Báo cáo cuối ngày** — Tóm tắt: số order, tổng tiền, món bán chạy
- [x] 🟢 **Xuất báo cáo** — Export ra file Excel / CSV

---
## 📍 Gợi Ý Thứ Tự Phát Triển (Từng Bước Cụ Thể)

Với mỗi giai đoạn, nên phát triển theo thứ tự **Backend → Frontend** cho từng chức năng:

```
1. Tạo Entity / Model (JPA)
2. Tạo Repository (Spring Data JPA)
3. Tạo Service (Business Logic)
4. Tạo Controller (REST API)
5. Test API bằng Postman / curl
6. Tạo trang Frontend tương ứng
7. Kết nối Frontend ↔ Backend
8. Test toàn bộ luồng
```

### Thứ tự đề xuất cho Giai đoạn 1:

| Bước | Việc cần làm | Backend | Frontend |
|---|---|---|---|
| 1 | Thiết lập kết nối DB + Entity | ✅ | — |
| 2 | CRUD Món ăn | ✅ | ✅ |
| 3 | CRUD Bàn | ✅ | ✅ |
| 4 | Tạo & quản lý Order | ✅ | ✅ |
| 5 | Ưu tiên phục vụ (sắp xếp) | ✅ | ✅ |
| 6 | Thanh toán + Hóa đơn | ✅ | ✅ |

---

## 💡 Lưu Ý Khi Phát Triển

1. **Luôn test trên điện thoại** — Quán nước thì dùng điện thoại là chính
2. **Đơn giản trước, phức tạp sau** — Hoàn thành Giai đoạn 1 rồi mới nghĩ đến cái khác
3. **Backup database thường xuyên** — Dữ liệu bán hàng thì không được mất
4. **Đặt giá = số nguyên** — VNĐ không có lẻ đồng, dùng `Integer` hoặc `Long` thay vì `Double`
5. **Timezone Việt Nam** — Đảm bảo server dùng múi giờ `Asia/Ho_Chi_Minh`
