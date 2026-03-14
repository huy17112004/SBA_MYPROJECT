package org.example.quannuoc.repository;

import org.example.quannuoc.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    // Tìm order đang mở (chưa thanh toán) của 1 bàn
    Optional<Order> findByDiningTableIdAndPaidAtIsNull(Long tableId);

    // Toàn bộ lịch sử order của 1 bàn
    @Query("SELECT o FROM Order o WHERE o.diningTable.id = :tableId ORDER BY o.createdAt DESC")
    List<Order> findByDiningTableId(@Param("tableId") Long tableId);
}
