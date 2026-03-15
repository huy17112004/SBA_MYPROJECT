package org.example.quannuoc.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class DiningTableRequest {

    @NotBlank(message = "Tên bàn không được để trống")
    @Size(max = 50, message = "Tên bàn không được quá 50 ký tự")
    private String name;

    @Min(value = 1, message = "Số ghế phải >= 1")
    private Integer seats;

    @Size(max = 200, message = "Ghi chú không quá 200 ký tự")
    private String note;
}
