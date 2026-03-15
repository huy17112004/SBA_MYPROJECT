package org.example.quannuoc.dto.response;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class RevenueChartResponse {
    private String date;
    private long revenue;
    private long orders;
}
