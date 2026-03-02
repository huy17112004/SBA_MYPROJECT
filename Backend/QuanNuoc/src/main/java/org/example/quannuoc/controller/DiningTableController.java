package org.example.quannuoc.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.quannuoc.dto.request.DiningTableRequest;
import org.example.quannuoc.dto.response.ApiResponse;
import org.example.quannuoc.dto.response.DiningTableResponse;
import org.example.quannuoc.entity.TableStatus;
import org.example.quannuoc.service.DiningTableService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/dining-tables")
@RequiredArgsConstructor
public class DiningTableController {

    private final DiningTableService diningTableService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<DiningTableResponse>>> getAll(
            @RequestParam(name = "status", required = false) TableStatus status,
            @RequestParam(name = "keyword", required = false) String keyword) {
        return ResponseEntity.ok(
                ApiResponse.success(diningTableService.getAll(status, keyword)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<DiningTableResponse>> getById(@PathVariable("id") Long id) {
        return ResponseEntity.ok(ApiResponse.success(diningTableService.getById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<DiningTableResponse>> create(
            @Valid @RequestBody DiningTableRequest request) {
        DiningTableResponse created = diningTableService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Tạo bàn thành công", created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<DiningTableResponse>> update(
            @PathVariable("id") Long id,
            @Valid @RequestBody DiningTableRequest request) {
        return ResponseEntity.ok(
                ApiResponse.success("Cập nhật bàn thành công", diningTableService.update(id, request)));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<DiningTableResponse>> updateStatus(
            @PathVariable("id") Long id,
            @RequestParam("status") TableStatus status) {
        return ResponseEntity.ok(
                ApiResponse.success("Cập nhật trạng thái bàn thành công",
                        diningTableService.updateStatus(id, status)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable("id") Long id) {
        diningTableService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Xóa bàn thành công", null));
    }
}
