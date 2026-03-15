package org.example.quannuoc.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class TopItemResponse {
    private String name;
    private long quantity;
    private long revenue;
}
