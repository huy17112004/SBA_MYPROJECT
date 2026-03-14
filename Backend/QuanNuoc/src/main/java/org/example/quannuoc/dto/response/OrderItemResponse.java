package org.example.quannuoc.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class OrderItemResponse {

    private Long id;
    private Long menuItemId;
    private String menuItemName;
    private Integer quantity;
    private String note;
    private Long priceAtOrder;
    private LocalDateTime orderedAt;
    private String status;
}
