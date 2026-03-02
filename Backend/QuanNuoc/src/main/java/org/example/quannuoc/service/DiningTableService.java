package org.example.quannuoc.service;

import lombok.RequiredArgsConstructor;
import org.example.quannuoc.dto.request.DiningTableRequest;
import org.example.quannuoc.dto.response.DiningTableResponse;
import org.example.quannuoc.entity.DiningTable;
import org.example.quannuoc.entity.TableStatus;
import org.example.quannuoc.exception.ResourceNotFoundException;
import org.example.quannuoc.mapper.DiningTableMapper;
import org.example.quannuoc.repository.DiningTableRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DiningTableService {

    private final DiningTableRepository diningTableRepository;

    public List<DiningTableResponse> getAll(TableStatus status, String keyword) {
        String normalizedKeyword = normalizeKeyword(keyword);
        return diningTableRepository.findByFilters(status, normalizedKeyword)
                .stream()
                .map(DiningTableMapper::toResponse)
                .toList();
    }

    public DiningTableResponse getById(Long id) {
        DiningTable table = findByIdOrThrow(id);
        return DiningTableMapper.toResponse(table);
    }

    @Transactional
    public DiningTableResponse create(DiningTableRequest request) {
        validateUniqueName(request.getName().trim(), null);
        DiningTable table = DiningTableMapper.toEntity(request);
        return DiningTableMapper.toResponse(diningTableRepository.save(table));
    }

    @Transactional
    public DiningTableResponse update(Long id, DiningTableRequest request) {
        DiningTable table = findByIdOrThrow(id);
        validateUniqueName(request.getName().trim(), id);

        table.setName(request.getName().trim());
        table.setSeats(request.getSeats());

        return DiningTableMapper.toResponse(diningTableRepository.save(table));
    }

    @Transactional
    public DiningTableResponse updateStatus(Long id, TableStatus status) {
        DiningTable table = findByIdOrThrow(id);
        table.setStatus(status);
        return DiningTableMapper.toResponse(diningTableRepository.save(table));
    }

    @Transactional
    public void delete(Long id) {
        DiningTable table = findByIdOrThrow(id);
        diningTableRepository.delete(table);
    }

    private DiningTable findByIdOrThrow(Long id) {
        return diningTableRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("DiningTable", id));
    }

    private void validateUniqueName(String name, Long excludeId) {
        diningTableRepository.findByFilters(null, "").stream()
                .filter(t -> t.getName().equalsIgnoreCase(name))
                .filter(t -> excludeId == null || !t.getId().equals(excludeId))
                .findFirst()
                .ifPresent(t -> {
                    throw new IllegalArgumentException("Tên bàn '" + name + "' đã tồn tại");
                });
    }

    private String normalizeKeyword(String keyword) {
        return (keyword == null || keyword.isBlank()) ? "" : keyword.trim();
    }
}
