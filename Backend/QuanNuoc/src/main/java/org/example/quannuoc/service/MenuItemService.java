package org.example.quannuoc.service;

import lombok.RequiredArgsConstructor;
import org.example.quannuoc.dto.request.MenuItemRequest;
import org.example.quannuoc.dto.response.MenuItemResponse;
import org.example.quannuoc.entity.Category;
import org.example.quannuoc.entity.MenuItem;
import org.example.quannuoc.exception.ResourceNotFoundException;
import org.example.quannuoc.mapper.MenuItemMapper;
import org.example.quannuoc.repository.CategoryRepository;
import org.example.quannuoc.repository.MenuItemRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MenuItemService {

    private final MenuItemRepository menuItemRepository;
    private final CategoryRepository categoryRepository;

    public List<MenuItemResponse> getAll(Long categoryId, Boolean available, String keyword) {
        return menuItemRepository.findByFilters(categoryId, available, (keyword == null || keyword.isBlank()) ? "" : keyword)
                .stream()
                .map(MenuItemMapper::toResponse)
                .toList();
    }

    public MenuItemResponse getById(Long id) {
        MenuItem item = findByIdOrThrow(id);
        return MenuItemMapper.toResponse(item);
    }

    @Transactional
    public MenuItemResponse create(MenuItemRequest request) {
        Category category = findCategoryOrThrow(request.getCategoryId());
        MenuItem item = MenuItemMapper.toEntity(request, category);
        return MenuItemMapper.toResponse(menuItemRepository.save(item));
    }

    @Transactional
    public MenuItemResponse update(Long id, MenuItemRequest request) {
        MenuItem item = findByIdOrThrow(id);
        Category category = findCategoryOrThrow(request.getCategoryId());

        item.setName(request.getName().trim());
        item.setPrice(request.getPrice());
        item.setCategory(category);
        item.setDescription(request.getDescription());
        if (request.getAvailable() != null) {
            item.setAvailable(request.getAvailable());
        }
        return MenuItemMapper.toResponse(menuItemRepository.save(item));
    }

    @Transactional
    public MenuItemResponse toggleAvailability(Long id) {
        MenuItem item = findByIdOrThrow(id);
        item.setAvailable(!item.getAvailable());
        return MenuItemMapper.toResponse(menuItemRepository.save(item));
    }

    @Transactional
    public void delete(Long id) {
        MenuItem item = findByIdOrThrow(id);
        menuItemRepository.delete(item);
    }

    private MenuItem findByIdOrThrow(Long id) {
        return menuItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("MenuItem", id));
    }

    private Category findCategoryOrThrow(Long categoryId) {
        return categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category", categoryId));
    }

    private String normalizeKeyword(String keyword) {
        return (keyword == null || keyword.isBlank()) ? "" : keyword.trim();
    }
}
