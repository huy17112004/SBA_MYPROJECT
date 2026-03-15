package org.example.quannuoc.repository;

import org.example.quannuoc.entity.OrderItem;
import org.example.quannuoc.entity.OrderItemStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {

    List<OrderItem> findByOrderId(Long orderId);

    boolean existsByMenuItemId(Long menuItemId);

    @Query("SELECT oi FROM OrderItem oi WHERE oi.status = :status AND oi.order.paidAt IS NULL ORDER BY oi.orderedAt ASC")
    List<OrderItem> findPendingItems(@Param("status") OrderItemStatus status);
}
