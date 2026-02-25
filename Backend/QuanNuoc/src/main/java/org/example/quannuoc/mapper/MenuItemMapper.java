package org.example.quannuoc.mapper;

import org.example.quannuoc.dto.request.MenuItemRequest;
import org.example.quannuoc.dto.response.MenuItemResponse;
import org.example.quannuoc.entity.Category;
import org.example.quannuoc.entity.MenuItem;

public class MenuItemMapper {

    private MenuItemMapper() {
    }

    public static MenuItemResponse toResponse(MenuItem item) {
        return MenuItemResponse.builder()
                .id(item.getId())
                .name(item.getName())
                .price(item.getPrice())
                .categoryId(item.getCategory() != null ? item.getCategory().getId() : null)
                .categoryName(item.getCategory() != null ? item.getCategory().getName() : null)
                .description(item.getDescription())
                .available(item.getAvailable())
                .build();
    }

    public static MenuItem toEntity(MenuItemRequest request, Category category) {
        return MenuItem.builder()
                .name(request.getName().trim())
                .price(request.getPrice())
                .category(category)
                .description(request.getDescription())
                .available(request.getAvailable() != null ? request.getAvailable() : true)
                .build();
    }
}
