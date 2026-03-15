package org.example.quannuoc.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PayOrderRequest {
    @NotBlank(message = "Phương thức thanh toán không được để trống")
    private String paymentMethod;
}
