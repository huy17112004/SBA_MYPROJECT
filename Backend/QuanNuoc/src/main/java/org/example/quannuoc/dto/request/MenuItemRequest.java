package org.example.quannuoc.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class MenuItemRequest {

    @NotBlank(message = "Tên món không được để trống")
    @Size(max = 100, message = "Tên món không được quá 100 ký tự")
    private String name;

    @NotNull(message = "Giá món không được để trống")
    @Min(value = 0, message = "Giá món phải >= 0")
    private Long price;

    @NotNull(message = "Loại món không được để trống")
    private Long categoryId;

    @Size(max = 255, message = "Mô tả không được quá 255 ký tự")
    private String description;

    private Boolean available;
}
