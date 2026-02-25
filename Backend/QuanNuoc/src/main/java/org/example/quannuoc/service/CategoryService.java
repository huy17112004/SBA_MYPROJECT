package org.example.quannuoc.service;

import lombok.RequiredArgsConstructor;
import org.example.quannuoc.dto.request.CategoryRequest;
import org.example.quannuoc.dto.response.CategoryResponse;
import org.example.quannuoc.entity.Category;
import org.example.quannuoc.exception.ResourceNotFoundException;
import org.example.quannuoc.mapper.CategoryMapper;
import org.example.quannuoc.repository.CategoryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public List<CategoryResponse> getAll() {
        return categoryRepository.findAllByOrderByDisplayOrderAsc()
                .stream()
                .map(CategoryMapper::toResponse)
                .toList();
    }

    public CategoryResponse getById(Long id) {
        Category category = findByIdOrThrow(id);
        return CategoryMapper.toResponse(category);
    }

    @Transactional
    public CategoryResponse create(CategoryRequest request) {
        validateUniqueName(request.getName().trim(), null);
        Category category = CategoryMapper.toEntity(request);
        return CategoryMapper.toResponse(categoryRepository.save(category));
    }

    @Transactional
    public CategoryResponse update(Long id, CategoryRequest request) {
        Category category = findByIdOrThrow(id);
        validateUniqueName(request.getName().trim(), id);
        category.setName(request.getName().trim());
        category.setDisplayOrder(request.getDisplayOrder() != null ? request.getDisplayOrder() : 0);
        return CategoryMapper.toResponse(categoryRepository.save(category));
    }

    @Transactional
    public void delete(Long id) {
        Category category = findByIdOrThrow(id);
        categoryRepository.delete(category);
    }

    private Category findByIdOrThrow(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", id));
    }

    private void validateUniqueName(String name, Long excludeId) {
        boolean exists = excludeId == null
                ? categoryRepository.existsByName(name)
                : categoryRepository.existsByNameAndIdNot(name, excludeId);
        if (exists) {
            throw new IllegalArgumentException("Loại món '" + name + "' đã tồn tại");
        }
    }
}
