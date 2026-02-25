package org.example.quannuoc.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.quannuoc.dto.request.MenuItemRequest;
import org.example.quannuoc.dto.response.ApiResponse;
import org.example.quannuoc.dto.response.MenuItemResponse;
import org.example.quannuoc.service.MenuItemService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import org.example.quannuoc.util.SearchUtils;

@RestController
@RequestMapping("/api/v1/menu-items")
@RequiredArgsConstructor
public class MenuItemController {

    private final MenuItemService menuItemService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<MenuItemResponse>>> getAll(
            @RequestParam(name = "categoryId", required = false) Long categoryId,
            @RequestParam(name = "available", required = false) Boolean available,
            @RequestParam(name = "keyword", required = false) String keyword) {
        return ResponseEntity.ok(
                ApiResponse.success(menuItemService.getAll(categoryId, available, SearchUtils.getNormalizedKeyword(keyword))));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<MenuItemResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(menuItemService.getById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<MenuItemResponse>> create(
            @Valid @RequestBody MenuItemRequest request) {
        MenuItemResponse created = menuItemService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Tạo món thành công", created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<MenuItemResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody MenuItemRequest request) {
        return ResponseEntity.ok(
                ApiResponse.success("Cập nhật món thành công", menuItemService.update(id, request)));
    }

    @PatchMapping("/{id}/toggle-availability")
    public ResponseEntity<ApiResponse<MenuItemResponse>> toggleAvailability(
            @PathVariable Long id) {
        return ResponseEntity.ok(
                ApiResponse.success("Cập nhật trạng thái thành công",
                        menuItemService.toggleAvailability(id)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        menuItemService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Xóa món thành công", null));
    }
}
