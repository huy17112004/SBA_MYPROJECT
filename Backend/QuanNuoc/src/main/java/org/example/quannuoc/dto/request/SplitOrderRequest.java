package org.example.quannuoc.dto.request;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter @Setter @NoArgsConstructor
public class SplitOrderRequest {
    @NotNull(message = "Bàn đích không được để trống")
    private Long targetTableId;
    @NotEmpty(message = "Danh sách món cần tách không được để trống")
    private List<Long> orderItemIds;
}
