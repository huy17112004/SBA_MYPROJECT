package org.example.quannuoc.service;

import lombok.RequiredArgsConstructor;
import org.example.quannuoc.dto.response.RevenueChartResponse;
import org.example.quannuoc.dto.response.StatsResponse;
import org.example.quannuoc.dto.response.TopItemResponse;
import org.example.quannuoc.repository.OrderRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class StatsService {

    private final OrderRepository orderRepository;

    public StatsResponse getTodayStats() {
        LocalDateTime start = LocalDateTime.now().with(LocalTime.MIN);
        LocalDateTime end = LocalDateTime.now().with(LocalTime.MAX);

        Long revenue = orderRepository.sumRevenueBetween(start, end);
        Long orders = orderRepository.countOrdersBetween(start, end);

        long rev = revenue != null ? revenue : 0;
        long ord = orders != null ? orders : 0;
        long avg = ord > 0 ? rev / ord : 0;

        return StatsResponse.builder()
                .todayRevenue(rev)
                .todayOrders(ord)
                .averagePerOrder(avg)
                .build();
    }

    public List<TopItemResponse> getTopItems(int days) {
        LocalDateTime start = LocalDateTime.now().minusDays(days).with(LocalTime.MIN);
        LocalDateTime end = LocalDateTime.now().with(LocalTime.MAX);
        return orderRepository.findTopSellingItems(start, end);
    }

    public List<RevenueChartResponse> getRevenueChart(int days) {
        List<RevenueChartResponse> chart = new ArrayList<>();
        LocalDate today = LocalDate.now();
        for (int i = days - 1; i >= 0; i--) {
            LocalDate date = today.minusDays(i);
            LocalDateTime start = date.atStartOfDay();
            LocalDateTime end = date.atTime(LocalTime.MAX);
            
            Long rev = orderRepository.sumRevenueBetween(start, end);
            Long ord = orderRepository.countOrdersBetween(start, end);
            
            chart.add(RevenueChartResponse.builder()
                    .date(date.toString())
                    .revenue(rev != null ? rev : 0)
                    .orders(ord != null ? ord : 0)
                    .build());
        }
        return chart;
    }
}
