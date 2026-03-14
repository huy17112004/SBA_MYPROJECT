package org.example.quannuoc.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Builder
public class OrderResponse {

    private Long id;
    private Long tableId;
    private String tableName;
    private LocalDateTime createdAt;
    private LocalDateTime paidAt;
    private Long totalAmount;
    private String note;
    private String paymentMethod;
    private List<OrderItemResponse> items;
}
