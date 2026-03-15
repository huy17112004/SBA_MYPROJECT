package org.example.quannuoc.dto.response;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class DiningTableResponse {

    private Long id;
    private String name;
    private String status;
    private Integer seats;
    private String note;
}
