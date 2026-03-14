package org.example.quannuoc.mapper;

import org.example.quannuoc.dto.response.OrderResponse;
import org.example.quannuoc.entity.Order;

import java.util.List;

public class OrderMapper {

    private OrderMapper() {
    }

    public static OrderResponse toResponse(Order order) {
        List<org.example.quannuoc.dto.response.OrderItemResponse> itemResponses = order.getItems()
                .stream()
                .map(OrderItemMapper::toResponse)
                .toList();

        return OrderResponse.builder()
                .id(order.getId())
                .tableId(order.getDiningTable().getId())
                .tableName(order.getDiningTable().getName())
                .createdAt(order.getCreatedAt())
                .paidAt(order.getPaidAt())
                .totalAmount(order.getTotalAmount())
                .note(order.getNote())
                .paymentMethod(order.getPaymentMethod())
                .items(itemResponses)
                .build();
    }
}
