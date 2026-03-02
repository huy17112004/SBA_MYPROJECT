package org.example.quannuoc.repository;

import org.example.quannuoc.entity.DiningTable;
import org.example.quannuoc.entity.TableStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface DiningTableRepository extends JpaRepository<DiningTable, Long> {

    List<DiningTable> findByStatus(TableStatus status);

    boolean existsByNameIgnoreCase(String name);

    @Query("SELECT t FROM DiningTable t " +
            "WHERE (:status IS NULL OR t.status = :status) " +
            "AND (:keyword IS NULL OR LOWER(t.name) LIKE CONCAT('%', LOWER(:keyword), '%'))")
    List<DiningTable> findByFilters(
            @Param("status") TableStatus status,
            @Param("keyword") String keyword);
}
