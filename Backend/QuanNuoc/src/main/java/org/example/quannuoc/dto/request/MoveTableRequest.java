package org.example.quannuoc.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter @Setter @NoArgsConstructor
public class MoveTableRequest {
    @NotNull(message = "Bàn nguồn không được để trống")
    private Long sourceTableId;
    @NotNull(message = "Bàn đích không được để trống")
    private Long targetTableId;
}
