# 🏗️ ARCHITECTURE — Backend QuanNuoc

> Tài liệu quy tắc kiến trúc Backend. Mọi code mới phải tuân theo các quy tắc trong file này.

---

## 1. Tổng Quan Kiến Trúc

```
┌──────────────────┐     HTTP/JSON     ┌──────────────────┐      JDBC       ┌────────────┐
│   ReactJS SPA    │ ◄──────────────► │  Spring Boot 3   │ ◄────────────► │ PostgreSQL │
│  (localhost:5173) │    REST API      │ (localhost:8080)  │   JPA/HIB      │            │
└──────────────────┘                   └──────────────────┘                  └────────────┘
```

| Layer | Công nghệ | Vai trò |
|---|---|---|
| **Frontend** | ReactJS + Vite | Giao diện người dùng (SPA) |
| **Backend** | Java 17 + Spring Boot 3 | Business logic, REST API |
| **Database** | PostgreSQL | Lưu trữ dữ liệu |
| **ORM** | JPA / Hibernate | Ánh xạ Object ↔ Table |

**Nguyên tắc chung:** Không over-engineer — Convention over configuration — Fail fast.

---

## 2. Kiến Trúc Backend — Controller → Service → Repository

```
Request → Controller → Service → Repository → Database
                ↓            ↓
              DTO ←→      Entity
```

| Layer | Trách nhiệm | Không được làm |
|---|---|---|
| **Controller** | Nhận request, validate input, trả response | ❌ Chứa business logic |
| **Service** | Business logic, transaction management | ❌ Truy cập HttpServletRequest |
| **Repository** | Truy vấn database | ❌ Chứa logic nghiệp vụ |

---

## 3. Cấu Trúc Thư Mục

```
src/main/java/org/example/quannuoc/
├── QuanNuocApplication.java
├── config/                    # CORS, Security, etc.
├── controller/                # REST Controllers
├── service/                   # Business logic
├── repository/                # JPA Repositories
├── entity/                    # JPA Entities + Enums
├── dto/
│   ├── request/               # Input DTOs (có validation)
│   └── response/              # Output DTOs
├── mapper/                    # Entity ↔ DTO (static methods)
└── exception/                 # GlobalExceptionHandler + custom exceptions
```

> Tổ chức theo **layer** (không theo feature) — phù hợp project nhỏ, ít entity.

---

## 4. Quy Tắc Đặt Tên

### Classes

| Loại | Pattern | Ví dụ |
|---|---|---|
| Entity | `PascalCase` | `MenuItem`, `DiningTable` |
| Controller | `{Entity}Controller` | `MenuItemController` |
| Service | `{Entity}Service` | `MenuItemService` |
| Repository | `{Entity}Repository` | `MenuItemRepository` |
| Request DTO | `{Entity}Request` | `MenuItemRequest` |
| Response DTO | `{Entity}Response` | `MenuItemResponse` |
| Mapper | `{Entity}Mapper` | `MenuItemMapper` |

### Methods (CRUD)

`getAll()` · `getById(id)` · `create(request)` · `update(id, request)` · `delete(id)`

### API Endpoints

`GET /api/v1/menu-items` · `GET /{id}` · `POST /` · `PUT /{id}` · `DELETE /{id}`

> URL: **kebab-case**, danh từ số nhiều, không dùng động từ.

### Database

| Loại | Convention | Ví dụ |
|---|---|---|
| Table | snake_case, số nhiều | `menu_items`, `dining_tables` |
| Column | snake_case | `created_at`, `total_amount` |
| FK | `{table}_id` | `dining_table_id` |

---

## 5. Exception Handling

- Dùng `@RestControllerAdvice` → `GlobalExceptionHandler`
- Custom exception: `ResourceNotFoundException`
- Handle: **400** (validation), **404** (not found), **500** (lỗi hệ thống)

**Nguyên tắc:**
- ❌ Không bắt exception rồi im lặng
- ❌ Không trả stacktrace ra client
- ✅ Log server-side, trả message thân thiện cho client
- ✅ Dùng HTTP status code đúng ngữ cảnh

---

## 6. Chuẩn API Response

Mọi response dùng wrapper `ApiResponse<T>`:

```json
{
  "code": 200,
  "message": "Thành công",
  "data": { ... }
}
```

| Trường hợp | code | message |
|---|---|---|
| Thành công | `200` | `"Thành công"` |
| Validation lỗi | `400` | `"Dữ liệu không hợp lệ"` (data chứa chi tiết lỗi) |
| Không tìm thấy | `404` | `"MenuItem không tìm thấy với id: 99"` |
| Lỗi server | `500` | `"Lỗi hệ thống"` |

---

## 7. DTO và Mapper

| Quy tắc | Chi tiết |
|---|---|
| **Request DTO** | Chứa `@Valid` annotations (`@NotBlank`, `@Min`, `@NotNull`) |
| **Response DTO** | Dùng `@Builder`, chỉ expose field cần thiết |
| **Mapper** | Static methods, private constructor, không dùng thư viện bên ngoài |
| **Lý do** | Project nhỏ → viết tay rõ ràng hơn, dễ debug, không thêm dependency |

Mỗi entity cần 3 file: `{Entity}Request.java`, `{Entity}Response.java`, `{Entity}Mapper.java`

---

## 8. Quy Tắc Business Logic

| ✅ Nên | ❌ Không nên |
|---|---|
| Logic nằm trong **Service** | Logic trong Controller hoặc Repository |
| 1 method = 1 việc, ≤ 30 dòng | Method làm quá nhiều thứ |
| `@Transactional` cho write operations | Quên transaction |
| Throw exception rõ ràng | Return null rồi check ở controller |
| Dùng `@RequiredArgsConstructor` | Dùng `@Autowired` trên field |

---

## 9. API Versioning

- Format: **`/api/v1/{resource}`**
- Controller: `@RequestMapping("/api/v1/menu-items")`
- Breaking change → tạo `/api/v2/`, giữ v1 song song
- Project nhỏ: chỉ cần `v1`

---

## 10. Clean Code

| # | Quy tắc |
|---|---|
| 1 | **1 class = 1 trách nhiệm** (SRP) |
| 2 | **Đặt tên rõ nghĩa** — không `list1`, `obj`, `temp` |
| 3 | **Không magic numbers** — dùng constants |
| 4 | **Constructor injection** — `@RequiredArgsConstructor`, không `@Autowired` field |
| 5 | **Không code thừa** — xóa comment-out code, import không dùng |
| 6 | **Method ≤ 30 dòng** |
| 7 | **`@Valid` cho mọi input** ở Controller |
| 8 | **Dùng Logger** — không `System.out.println()` |
