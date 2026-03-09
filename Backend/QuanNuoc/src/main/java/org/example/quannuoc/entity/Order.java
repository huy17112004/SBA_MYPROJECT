package org.example.quannuoc.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "orders")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dining_table_id", nullable = false)
    private DiningTable diningTable;

    // Thời điểm bàn bắt đầu (có khách ngồi)
    @Column(nullable = false)
    private LocalDateTime createdAt;

    // null = chưa thanh toán | có giá trị = đã thanh toán (thay thế cho
    // OrderStatus)
    private LocalDateTime paidAt;

    @Column(nullable = false)
    @Builder.Default
    private Long totalAmount = 0L;

    private String note;

    private String paymentMethod;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<OrderItem> items = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
}
