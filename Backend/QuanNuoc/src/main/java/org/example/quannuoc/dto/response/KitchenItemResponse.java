package org.example.quannuoc.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class KitchenItemResponse {
    private Long id;
    private Long orderId;
    private Long tableId;
    private String tableName;
    private String menuItemName;
    private Integer quantity;
    private String note;
    private LocalDateTime orderedAt;
    private String status;
}
