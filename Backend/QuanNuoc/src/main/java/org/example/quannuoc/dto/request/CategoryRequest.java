package org.example.quannuoc.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CategoryRequest {

    @NotBlank(message = "Tên loại món không được để trống")
    @Size(max = 50, message = "Tên loại món không được quá 50 ký tự")
    private String name;

    private Integer displayOrder;
}
