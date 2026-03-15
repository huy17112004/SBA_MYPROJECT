package org.example.quannuoc.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.quannuoc.dto.request.*;
import org.example.quannuoc.dto.response.ApiResponse;
import org.example.quannuoc.dto.response.OrderResponse;
import org.example.quannuoc.dto.response.KitchenItemResponse;
import org.example.quannuoc.service.OrderService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    // Lấy tất cả order đang mở
    @GetMapping("/active")
    public ResponseEntity<ApiResponse<List<OrderResponse>>> getAllActive() {
        return ResponseEntity.ok(ApiResponse.success(orderService.getAllActive()));
    }

    // Lấy lịch sử order có phân trang
    @GetMapping("/history")
    public ResponseEntity<ApiResponse<Page<OrderResponse>>> getHistory(
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(ApiResponse.success(orderService.getHistory(pageable)));
    }

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

    // Thanh toán order
    @PatchMapping("/{id}/pay")
    public ResponseEntity<ApiResponse<OrderResponse>> payOrder(
            @PathVariable("id") Long id,
            @Valid @RequestBody PayOrderRequest request) {
        return ResponseEntity.ok(
                ApiResponse.success("Thanh toán thành công", orderService.payOrder(id, request)));
    }

    // Chuyển bàn
    @PostMapping("/move")
    public ResponseEntity<ApiResponse<OrderResponse>> moveOrder(
            @Valid @RequestBody MoveTableRequest request) {
        return ResponseEntity.ok(
                ApiResponse.success("Chuyển bàn thành công", orderService.moveOrder(request)));
    }

    // Gộp bàn
    @PostMapping("/merge")
    public ResponseEntity<ApiResponse<OrderResponse>> mergeOrders(
            @Valid @RequestBody MergeTableRequest request) {
        return ResponseEntity.ok(
                ApiResponse.success("Gộp bàn thành công", orderService.mergeOrders(request)));
    }

    // Tách hóa đơn (món)
    @PostMapping("/{id}/split")
    public ResponseEntity<ApiResponse<OrderResponse>> splitOrder(
            @PathVariable("id") Long id,
            @Valid @RequestBody SplitOrderRequest request) {
        return ResponseEntity.ok(
                ApiResponse.success("Tách món thành công", orderService.splitOrder(id, request)));
    }

    // Quản lý bếp: Lấy danh sách món đang chờ có phân trang
    @GetMapping("/kitchen/pending")
    public ResponseEntity<ApiResponse<Page<KitchenItemResponse>>> getPendingKitchenItems(
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(ApiResponse.success(orderService.getPendingKitchenItems(pageable)));
    }

    // Đánh dấu món đã phục vụ
    @PatchMapping("/{orderId}/items/{itemId}/serve")
    public ResponseEntity<ApiResponse<OrderResponse>> markItemServed(
            @PathVariable("orderId") Long orderId,
            @PathVariable("itemId") Long itemId) {
        return ResponseEntity.ok(
                ApiResponse.success("Đã phục vụ món", orderService.markItemServed(orderId, itemId)));
    }
}
