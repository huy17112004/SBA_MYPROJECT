package org.example.quannuoc.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
public class OrderRequest {

    @NotNull(message = "tableId không được để trống")
    private Long tableId;

    private String note;

    @Valid
    private List<OrderItemRequest> items = new ArrayList<>();
}
