package org.example.quannuoc.dto.response;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class MenuItemResponse {

    private Long id;
    private String name;
    private Long price;
    private Long categoryId;
    private String categoryName;
    private String description;
    private Boolean available;
}
