package org.example.quannuoc.entity;

public enum OrderItemStatus {
    PENDING, // Vừa gọi, chưa làm — đang chờ trong queue
    SERVING, // Bếp đang làm / đang mang ra cho khách
    SERVED, // Đã mang ra — hoàn thành
    CANCELLED // Khách hủy món
}
