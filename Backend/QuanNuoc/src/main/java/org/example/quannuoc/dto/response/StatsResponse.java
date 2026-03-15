package org.example.quannuoc.dto.response;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class StatsResponse {
    private long todayRevenue;
    private long todayOrders;
    private long averagePerOrder;
}
