package org.example.quannuoc.repository;

import org.example.quannuoc.entity.MenuItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface MenuItemRepository extends JpaRepository<MenuItem, Long> {

    List<MenuItem> findByCategoryId(Long categoryId);

    List<MenuItem> findByAvailable(Boolean available);

    boolean existsByCategoryId(Long categoryId);

    @Query("SELECT m FROM MenuItem m " +
            "WHERE (:categoryId IS NULL OR m.category.id = :categoryId) " +
            "AND (:available IS NULL OR m.available = :available) " +
            "AND (:keyword IS NULL OR LOWER(m.name) LIKE CONCAT('%', LOWER(:keyword), '%'))")
    List<MenuItem> findByFilters(
            @Param("categoryId") Long categoryId,
            @Param("available") Boolean available,
            @Param("keyword") String keyword);
}
