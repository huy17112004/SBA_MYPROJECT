# 📝 Nhật Ký Thay Đổi Tích Hợp API (Giai đoạn 1.1 - 1.4)

Tài liệu này ghi lại các thay đổi đã thực hiện để kết nối Frontend (React) với Backend (Spring Boot), thay thế hoàn toàn dữ liệu mẫu (mock data) bằng dữ liệu thực từ PostgreSQL.

---

## 🚀 1. Hạ Tầng & Cấu Hình

### 📁 `Frontend/FE/src/lib/api.ts` (Mới)
- Tạo lớp wrapper cho `fetch` để giao tiếp với Backend tại `http://localhost:8080/api`.
- Xử lý chuẩn hóa phản hồi theo cấu trúc `ApiResponse<T>` của Backend.
- Hỗ trợ các phương thức: `GET`, `POST`, `PUT`, `PATCH`, `DELETE`.

### 📁 `Frontend/FE/src/types/index.ts`
- Cập nhật kiểu dữ liệu `id` từ `string` thành `string | number` để tương thích với kiểu `Long` của Java.
- Cập nhật các interface `Category`, `MenuItem`, `DiningTable`, `Order`, `OrderItem` để khớp với các trường dữ liệu thực tế từ Backend DTOs.
- Bổ sung trạng thái bàn (`AVAILABLE`, `OCCUPIED`) khớp với Enum ở Backend.

---

## 🧠 2. State Management (useStore)

### 📁 `Frontend/FE/src/hooks/useStore.tsx`
- **Khởi tạo dữ liệu**: Thêm hàm `refreshData` sử dụng `Promise.all` để lấy toàn bộ danh sách Danh mục, Menu, Bàn và Order đang hoạt động ngay khi ứng dụng khởi chạy.
- **Async Actions**: Chuyển đổi logic từ `dispatch` (đồng bộ, chỉ sửa local) sang `actions` (bất đồng bộ, gọi API trước rồi mới cập nhật local).
- **Các hàm hành động mới**:
    - `add/update/deleteCategory`
    - `add/update/deleteMenuItem` + `toggleMenuItemAvailable`
    - `add/update/deleteTable`
    - `createOrder` + `addOrderItems` + `updateOrderItem` + `removeOrderItem`

---

## 🖥️ 3. Cập Nhật Giao Diện (Frontend Components)

### 📁 `OrderPanel.tsx` & `PaymentDialog.tsx`
- Thay thế toàn bộ logic `dispatch` cũ bằng `actions`.
- Xử lý luồng tạo Order mới cho bàn trống: Gọi API tạo Order -> Nhận ID thực từ DB -> Thêm món.
- Tối ưu nút giảm số lượng: Tự động gọi `DELETE /api/orders/{id}/items/{itemId}` khi số lượng giảm về 0.

### 📁 `TableMap.tsx`
- Cập nhật logic hiển thị sơ đồ bàn: Map trạng thái `AVAILABLE` (Backend) thành `Trống` (UI).
- Sửa lỗi so sánh ID (ép kiểu `String(id)`) để hiển thị đúng thông tin order và thời gian chờ của từng bàn.

### 📁 `CategoryManager.tsx`, `MenuList.tsx`, `TableForm.tsx`
- Chuyển đổi sang dùng `actions` bất đồng bộ.
- Hiển thị thông báo (toast) khi thực hiện thành công các thao tác Thêm/Sửa/Xóa.

---

## ⚙️ 4. Cải Thiện Backend

### 📁 `OrderService.java` & `OrderController.java`
- **Bổ sung API**: Thêm endpoint `GET /api/orders/active` để lấy danh sách tất cả các đơn hàng chưa thanh toán. 
    - *Lý do*: Frontend cần dữ liệu này để hiển thị tổng tiền và thời gian khách ngồi ngay trên sơ đồ bàn mà không cần gọi API lặp đi lặp lại cho từng bàn.

---

## ⚠️ Lưu Ý & Hướng Phát Triển Tiếp Theo
1. **Thanh toán (1.6)**: Hiện tại Frontend đã có giao diện thanh toán nhưng Backend cần bổ sung endpoint `PATCH /api/orders/{id}/pay` để cập nhật `paidAt` và giải phóng bàn (`AVAILABLE`).
2. **Quản lý bếp (1.5)**: Cần bổ sung endpoint lấy danh sách các `OrderItem` theo thời gian đặt món.
3. **ID**: Khi Backend đã hoạt động ổn định, có thể refactor hoàn toàn kiểu ID ở Frontend sang `number` để code sạch hơn.
