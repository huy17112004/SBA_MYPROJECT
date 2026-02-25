# 🧊 QuanNuoc — Hệ Thống Quản Lý Quán Nước Vỉa Hè

## 📌 Giới Thiệu

**QuanNuoc** là ứng dụng quản lý dành cho quán nước nhỏ gia đình — kiểu hàng quán vỉa hè bán trà đá, nước sấu, nước chanh, chè,... kèm đồ ăn nhanh như chân gà nướng, xúc xích, nem chua rán,...

### Vấn đề cần giải quyết

Ngày thường ít khách thì quản lý bằng trí nhớ được, nhưng vào **ngày lễ, Tết, giờ cao điểm** thì:

- ❌ Không nhớ **bàn nào gọi món gì**
- ❌ Không biết **bàn nào gọi trước** để ưu tiên phục vụ
- ❌ Phải **ghi ra giấy** — dễ nhầm, dễ mất, khó tính tiền
- ❌ Cuối ngày **không biết doanh thu** chính xác bao nhiêu

### Giải pháp

Một ứng dụng web đơn giản chạy trên **điện thoại / máy tính bảng / laptop**, giúp:

- ✅ Quản lý **danh sách bàn** — biết bàn nào trống, bàn nào đang có khách
- ✅ **Ghi order** cho từng bàn — thêm / sửa / xóa món nhanh chóng
- ✅ **Ưu tiên phục vụ** — bàn nào gọi trước được đánh dấu rõ ràng
- ✅ **Thanh toán** — tính tổng tiền cho từng bàn, in hóa đơn
- ✅ **Thống kê doanh thu** — biết hôm nay/tuần/tháng bán được bao nhiêu

---

## 🏗️ Kiến Trúc Hệ Thống

```
┌─────────────────────────────────────────────────┐
│                   CLIENT                        │
│         React 19 + Vite 7 (SPA)                 │
│     Chạy trên trình duyệt điện thoại/PC        │
└────────────────────┬────────────────────────────┘
                     │ REST API (JSON)
                     ▼
┌─────────────────────────────────────────────────┐
│                   SERVER                        │
│       Spring Boot 4.0.3 (Java 17)               │
│          JPA + Lombok + WebMVC                  │
└────────────────────┬────────────────────────────┘
                     │ JDBC
                     ▼
┌─────────────────────────────────────────────────┐
│                 DATABASE                        │
│              PostgreSQL                         │
└─────────────────────────────────────────────────┘
```

### Cấu trúc thư mục

```
QuanNuoc/
├── Backend/
│   └── QuanNuoc/                  # Spring Boot project
│       ├── src/
│       │   ├── main/
│       │   │   ├── java/          # Source code Java
│       │   │   └── resources/     # application.properties, ...
│       │   └── test/              # Unit tests
│       ├── pom.xml                # Maven dependencies
│       └── mvnw / mvnw.cmd        # Maven wrapper
│
├── Frontend/
│   └── QuanNuocFrontend/          # React + Vite project
│       ├── src/                   # Source code React
│       ├── public/                # Static assets
│       ├── index.html             # Entry point
│       ├── package.json           # NPM dependencies
│       └── vite.config.js         # Vite config
│
├── README.md                      # 📄 File này
└── FEATURES.md                    # 📋 Danh sách chức năng & lộ trình phát triển
```

---

## 🛠️ Tech Stack

| Thành phần | Công nghệ | Phiên bản |
|---|---|---|
| **Frontend** | React + Vite | React 19.2, Vite 7.3 |
| **Backend** | Spring Boot (WebMVC + JPA) | 4.0.3 |
| **Database** | PostgreSQL | Latest |
| **Language** | Java (Backend), JavaScript (Frontend) | Java 17, ES2024 |
| **Build Tool** | Maven (BE), npm (FE) | — |
| **ORM** | Spring Data JPA + Lombok | — |

---

## 🎯 Đối Tượng Sử Dụng

| Vai trò | Mô tả |
|---|---|
| **Chủ quán** | Người quản lý chính — xem thống kê, quản lý menu, cài đặt bàn |
| **Nhân viên phục vụ** | Ghi order, chuyển trạng thái bàn, thanh toán cho khách |

> **Lưu ý:** Đây là ứng dụng dùng nội bộ gia đình, nên ở giai đoạn đầu **không cần hệ thống đăng nhập phức tạp**. Có thể bảo vệ bằng 1 mật khẩu đơn giản hoặc dùng luôn không cần đăng nhập.

---

## 📊 Mô Hình Dữ Liệu (Database Schema)

```
┌──────────────┐       ┌──────────────────┐       ┌──────────────┐
│   ban (Table)│       │  order           │       │  mon_an      │
├──────────────┤       ├──────────────────┤       ├──────────────┤
│ id (PK)      │──┐    │ id (PK)          │    ┌──│ id (PK)      │
│ ten_ban      │  │    │ ban_id (FK)      │──┐ │  │ ten_mon      │
│ trang_thai   │  └───>│ thoi_gian_tao    │  │ │  │ gia          │
│ vi_tri       │       │ trang_thai       │  │ │  │ danh_muc     │
│ so_ghe       │       │ tong_tien        │  │ │  │ mo_ta        │
└──────────────┘       │ ghi_chu          │  │ │  │ con_hang     │
                       └──────────────────┘  │ │  └──────────────┘
                                             │ │
                       ┌──────────────────┐  │ │
                       │ order_item       │  │ │
                       ├──────────────────┤  │ │
                       │ id (PK)          │  │ │
                       │ order_id (FK)    │──┘ │
                       │ mon_an_id (FK)   │────┘
                       │ so_luong         │
                       │ ghi_chu          │
                       │ gia_tai_thoi_diem│
                       └──────────────────┘
```

### Giải thích các bảng:

- **`ban`** — Danh sách các bàn trong quán (vd: Bàn 1, Bàn 2, Bàn VIP,...)
- **`mon_an`** — Menu các món (trà đá, nước sấu, chân gà nướng,...)
- **`order`** — Mỗi lượt khách ngồi vào bàn = 1 order. Ghi nhận thời gian tạo để biết **ai gọi trước**
- **`order_item`** — Chi tiết từng món trong order (số lượng, giá tại thời điểm gọi)

---

## 🚀 Hướng Dẫn Chạy Dự Án

### Yêu cầu hệ thống

- **Java 17+** (cho Backend)
- **Node.js 18+** (cho Frontend)
- **PostgreSQL** (đã cài đặt và chạy)

### 1. Chạy Database

```bash
# Tạo database trong PostgreSQL
psql -U postgres
CREATE DATABASE quan_nuoc;
```

### 2. Chạy Backend

```bash
cd Backend/QuanNuoc

# Cấu hình database trong src/main/resources/application.properties
# spring.datasource.url=jdbc:postgresql://localhost:5432/quan_nuoc
# spring.datasource.username=postgres
# spring.datasource.password=your_password

# Chạy server
./mvnw spring-boot:run
```

Backend sẽ chạy tại: `http://localhost:8080`

### 3. Chạy Frontend

```bash
cd Frontend/QuanNuocFrontend

# Cài dependencies
npm install

# Chạy dev server
npm run dev
```

Frontend sẽ chạy tại: `http://localhost:5173`

---

## 📋 Lộ Trình Phát Triển

Xem chi tiết tại file **[FEATURES.md](./FEATURES.md)** — bao gồm danh sách chức năng đầy đủ được chia thành **4 giai đoạn phát triển** từ cơ bản đến nâng cao.

---

## 📝 Ghi Chú

- Ứng dụng được thiết kế để chạy trên **mạng local (WiFi nhà)** — tất cả thiết bị kết nối cùng mạng đều truy cập được
- Giao diện ưu tiên **mobile-first** vì chủ yếu dùng trên điện thoại
- Dữ liệu được lưu trữ trong PostgreSQL nên **không mất khi tắt app**
