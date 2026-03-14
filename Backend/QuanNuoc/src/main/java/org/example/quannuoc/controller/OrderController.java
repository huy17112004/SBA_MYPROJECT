package org.example.quannuoc.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.quannuoc.dto.request.AddOrderItemsRequest;
import org.example.quannuoc.dto.request.OrderRequest;
import org.example.quannuoc.dto.request.UpdateOrderItemRequest;
import org.example.quannuoc.dto.response.ApiResponse;
import org.example.quannuoc.dto.response.OrderResponse;
import org.example.quannuoc.service.OrderService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    // Lấy order đang mở của một bàn
    @GetMapping("/table/{tableId}")
    public ResponseEntity<ApiResponse<OrderResponse>> getActiveOrderByTableId(
            @PathVariable("tableId") Long tableId) {
        return ResponseEntity.ok(ApiResponse.success(orderService.getActiveOrderByTableId(tableId)));
    }

    // Lấy chi tiết order theo id
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<OrderResponse>> getById(@PathVariable("id") Long id) {
        return ResponseEntity.ok(ApiResponse.success(orderService.getById(id)));
    }

    // Tạo order mới cho bàn
    @PostMapping
    public ResponseEntity<ApiResponse<OrderResponse>> createOrder(
            @Valid @RequestBody OrderRequest request) {
        OrderResponse created = orderService.createOrder(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Tạo order thành công", created));
    }

    // Thêm món vào order đang mở
    @PostMapping("/{id}/items")
    public ResponseEntity<ApiResponse<OrderResponse>> addItems(
            @PathVariable("id") Long id,
            @Valid @RequestBody AddOrderItemsRequest request) {
        return ResponseEntity.ok(
                ApiResponse.success("Thêm món thành công", orderService.addItemsToOrder(id, request)));
    }

    // Sửa số lượng / ghi chú của 1 order item
    @PutMapping("/{orderId}/items/{itemId}")
    public ResponseEntity<ApiResponse<OrderResponse>> updateItem(
            @PathVariable("orderId") Long orderId,
            @PathVariable("itemId") Long itemId,
            @Valid @RequestBody UpdateOrderItemRequest request) {
        return ResponseEntity.ok(
                ApiResponse.success("Cập nhật món thành công",
                        orderService.updateOrderItem(orderId, itemId, request)));
    }

    // Xóa 1 dòng món khỏi order
    @DeleteMapping("/{orderId}/items/{itemId}")
    public ResponseEntity<ApiResponse<OrderResponse>> removeItem(
            @PathVariable("orderId") Long orderId,
            @PathVariable("itemId") Long itemId) {
        return ResponseEntity.ok(
                ApiResponse.success("Xóa món thành công",
                        orderService.removeOrderItem(orderId, itemId)));
    }
}
