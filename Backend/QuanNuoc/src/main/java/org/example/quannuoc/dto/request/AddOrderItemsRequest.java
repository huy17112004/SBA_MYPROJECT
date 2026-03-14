package org.example.quannuoc.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class AddOrderItemsRequest {

    @NotEmpty(message = "Danh sách món không được rỗng")
    @Valid
    private List<OrderItemRequest> items;
}
