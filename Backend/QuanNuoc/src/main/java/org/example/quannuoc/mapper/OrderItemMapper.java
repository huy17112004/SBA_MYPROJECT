package org.example.quannuoc.mapper;

import org.example.quannuoc.dto.response.OrderItemResponse;
import org.example.quannuoc.entity.OrderItem;

public class OrderItemMapper {

    private OrderItemMapper() {
    }

    public static OrderItemResponse toResponse(OrderItem item) {
        return OrderItemResponse.builder()
                .id(item.getId())
                .menuItemId(item.getMenuItem().getId())
                .menuItemName(item.getMenuItem().getName())
                .quantity(item.getQuantity())
                .note(item.getNote())
                .price(item.getPriceAtOrder())
                .orderedAt(item.getOrderedAt())
                .status(item.getStatus().name())
                .build();
    }
}
