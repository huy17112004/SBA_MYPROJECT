package org.example.quannuoc.repository;

import org.example.quannuoc.dto.response.TopItemResponse;
import org.example.quannuoc.entity.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    List<Order> findByPaidAtIsNull();

    // Tìm order đang mở (chưa thanh toán) của 1 bàn
    Optional<Order> findByDiningTableIdAndPaidAtIsNull(Long tableId);

    boolean existsByDiningTableId(Long tableId);

    // Toàn bộ lịch sử order của 1 bàn
    @Query("SELECT o FROM Order o WHERE o.diningTable.id = :tableId ORDER BY o.createdAt DESC")
    List<Order> findByDiningTableId(@Param("tableId") Long tableId);

    // Phân trang lịch sử order đã thanh toán
    Page<Order> findByPaidAtIsNotNullOrderByPaidAtDesc(Pageable pageable);

    // Thống kê doanh thu theo khoảng thời gian
    @Query("SELECT SUM(o.totalAmount) FROM Order o WHERE o.paidAt BETWEEN :start AND :end")
    Long sumRevenueBetween(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    // Đếm số đơn hàng theo khoảng thời gian
    @Query("SELECT COUNT(o) FROM Order o WHERE o.paidAt BETWEEN :start AND :end")
    Long countOrdersBetween(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    // Top món bán chạy
    @Query("SELECT new org.example.quannuoc.dto.response.TopItemResponse(oi.menuItem.name, SUM(oi.quantity), SUM(oi.quantity * oi.priceAtOrder)) " +
           "FROM OrderItem oi " +
           "WHERE oi.order.paidAt BETWEEN :start AND :end " +
           "GROUP BY oi.menuItem.name " +
           "ORDER BY SUM(oi.quantity) DESC")
    List<TopItemResponse> findTopSellingItems(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);
}
