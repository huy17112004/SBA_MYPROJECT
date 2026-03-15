package org.example.quannuoc.controller;

import lombok.RequiredArgsConstructor;
import org.example.quannuoc.dto.response.ApiResponse;
import org.example.quannuoc.dto.response.RevenueChartResponse;
import org.example.quannuoc.dto.response.StatsResponse;
import org.example.quannuoc.dto.response.TopItemResponse;
import org.example.quannuoc.service.StatsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/stats")
@RequiredArgsConstructor
public class StatsController {

    private final StatsService statsService;

    @GetMapping("/today")
    public ResponseEntity<ApiResponse<StatsResponse>> getTodayStats() {
        return ResponseEntity.ok(ApiResponse.success(statsService.getTodayStats()));
    }

    @GetMapping("/top-items")
    public ResponseEntity<ApiResponse<List<TopItemResponse>>> getTopItems(
            @RequestParam(value = "days", defaultValue = "7") int days) {
        return ResponseEntity.ok(ApiResponse.success(statsService.getTopItems(days)));
    }

    @GetMapping("/revenue-chart")
    public ResponseEntity<ApiResponse<List<RevenueChartResponse>>> getRevenueChart(
            @RequestParam(value = "days", defaultValue = "7") int days) {
        return ResponseEntity.ok(ApiResponse.success(statsService.getRevenueChart(days)));
    }
}
