package org.example.quannuoc.mapper;

import org.example.quannuoc.dto.request.DiningTableRequest;
import org.example.quannuoc.dto.response.DiningTableResponse;
import org.example.quannuoc.entity.DiningTable;
import org.example.quannuoc.entity.TableStatus;

public class DiningTableMapper {

    private DiningTableMapper() {
    }

    public static DiningTableResponse toResponse(DiningTable table) {
        return DiningTableResponse.builder()
                .id(table.getId())
                .name(table.getName())
                .status(table.getStatus().name())
                .seats(table.getSeats())
                .note(table.getNote())
                .build();
    }

    public static DiningTable toEntity(DiningTableRequest request) {
        return DiningTable.builder()
                .name(request.getName().trim())
                .status(TableStatus.AVAILABLE)
                .seats(request.getSeats())
                .note(request.getNote() != null ? request.getNote() : "")
                .build();
    }
}
