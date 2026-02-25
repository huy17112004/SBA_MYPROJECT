package org.example.quannuoc.mapper;

import org.example.quannuoc.dto.request.CategoryRequest;
import org.example.quannuoc.dto.response.CategoryResponse;
import org.example.quannuoc.entity.Category;

public class CategoryMapper {

    private CategoryMapper() {
    }

    public static CategoryResponse toResponse(Category category) {
        return CategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .displayOrder(category.getDisplayOrder())
                .build();
    }

    public static Category toEntity(CategoryRequest request) {
        return Category.builder()
                .name(request.getName().trim())
                .displayOrder(request.getDisplayOrder() != null ? request.getDisplayOrder() : 0)
                .build();
    }
}
