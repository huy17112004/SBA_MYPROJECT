package org.example.quannuoc.service;

import lombok.RequiredArgsConstructor;
import org.example.quannuoc.dto.request.AddOrderItemsRequest;
import org.example.quannuoc.dto.request.OrderItemRequest;
import org.example.quannuoc.dto.request.OrderRequest;
import org.example.quannuoc.dto.request.UpdateOrderItemRequest;
import org.example.quannuoc.dto.request.PayOrderRequest;
import org.example.quannuoc.dto.response.OrderResponse;
import org.example.quannuoc.dto.response.KitchenItemResponse;
import org.example.quannuoc.entity.*;
import org.example.quannuoc.exception.ResourceNotFoundException;
import org.example.quannuoc.mapper.OrderMapper;
import org.example.quannuoc.repository.DiningTableRepository;
import org.example.quannuoc.repository.MenuItemRepository;
import org.example.quannuoc.repository.OrderItemRepository;
import org.example.quannuoc.repository.OrderRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final DiningTableRepository diningTableRepository;
    private final MenuItemRepository menuItemRepository;

    // Lấy tất cả order đang mở
    public List<OrderResponse> getAllActive() {
        return orderRepository.findByPaidAtIsNull().stream()
                .map(OrderMapper::toResponse)
                .toList();
    }

    // Lấy order đang mở (chưa thanh toán) của bàn
    public OrderResponse getActiveOrderByTableId(Long tableId) {
        findTableOrThrow(tableId);
        Order order = orderRepository.findByDiningTableIdAndPaidAtIsNull(tableId)
                .orElseThrow(() -> new ResourceNotFoundException("Order đang mở cho bàn", tableId));
        return OrderMapper.toResponse(order);
    }

    // Lấy chi tiết order theo id
    public OrderResponse getById(Long id) {
        return OrderMapper.toResponse(findOrderOrThrow(id));
    }

    // Tạo order mới cho bàn
    @Transactional
    public OrderResponse createOrder(OrderRequest request) {
        DiningTable table = findTableOrThrow(request.getTableId());

        // Kiểm tra bàn chưa có order đang mở
        orderRepository.findByDiningTableIdAndPaidAtIsNull(request.getTableId())
                .ifPresent(o -> {
                    throw new IllegalStateException(
                            "Bàn '" + table.getName() + "' đang có order chưa thanh toán (id: " + o.getId() + ")");
                });

        Order order = Order.builder()
                .diningTable(table)
                .createdAt(LocalDateTime.now())
                .note(request.getNote() != null ? request.getNote() : "")
                .totalAmount(0L)
                .build();

        // Lưu order trước để có ID
        Order savedOrder = orderRepository.save(order);

        // Thêm các món ban đầu (nếu có)
        if (request.getItems() != null && !request.getItems().isEmpty()) {
            for (OrderItemRequest itemReq : request.getItems()) {
                MenuItem menuItem = findMenuItemOrThrow(itemReq.getMenuItemId());
                OrderItem orderItem = buildOrderItem(savedOrder, menuItem, itemReq);
                orderItemRepository.save(orderItem);
                savedOrder.getItems().add(orderItem);
            }
            savedOrder.setTotalAmount(calculateTotalAmount(savedOrder.getItems()));
            savedOrder = orderRepository.save(savedOrder);
        }

        // Cập nhật trạng thái bàn → OCCUPIED
        table.setStatus(TableStatus.OCCUPIED);
        diningTableRepository.save(table);

        return OrderMapper.toResponse(savedOrder);
    }

    // Thêm món vào order đang mở
    @Transactional
    public OrderResponse addItemsToOrder(Long orderId, AddOrderItemsRequest request) {
        Order order = findOpenOrderOrThrow(orderId);

        for (OrderItemRequest itemReq : request.getItems()) {
            MenuItem menuItem = findMenuItemOrThrow(itemReq.getMenuItemId());
            OrderItem orderItem = buildOrderItem(order, menuItem, itemReq);
            // Lưu orderItem trước để tránh lỗi TransientObjectException
            orderItemRepository.save(orderItem);
            order.getItems().add(orderItem);
        }

        order.setTotalAmount(calculateTotalAmount(order.getItems()));
        return OrderMapper.toResponse(orderRepository.save(order));
    }

    // Sửa số lượng / ghi chú của 1 order item
    @Transactional
    public OrderResponse updateOrderItem(Long orderId, Long itemId, UpdateOrderItemRequest request) {
        Order order = findOpenOrderOrThrow(orderId);
        OrderItem item = findItemInOrder(order, itemId);

        item.setQuantity(request.getQuantity());
        item.setNote(request.getNote() != null ? request.getNote() : "");

        order.setTotalAmount(calculateTotalAmount(order.getItems()));
        return OrderMapper.toResponse(orderRepository.save(order));
    }

    // Xóa 1 dòng món khỏi order
    @Transactional
    public OrderResponse removeOrderItem(Long orderId, Long itemId) {
        Order order = findOpenOrderOrThrow(orderId);
        OrderItem item = findItemInOrder(order, itemId);

        order.getItems().remove(item);
        order.setTotalAmount(calculateTotalAmount(order.getItems()));
        return OrderMapper.toResponse(orderRepository.save(order));
    }

    // Thanh toán order
    @Transactional
    public OrderResponse payOrder(Long id, PayOrderRequest request) {
        Order order = findOpenOrderOrThrow(id);
        order.setPaidAt(LocalDateTime.now());
        order.setPaymentMethod(request.getPaymentMethod());
        Order saved = orderRepository.save(order);
        
        DiningTable table = order.getDiningTable();
        table.setStatus(TableStatus.AVAILABLE);
        diningTableRepository.save(table);
        
        return OrderMapper.toResponse(saved);
    }

    // Quản lý bếp: Lấy danh sách món đang chờ
    public List<KitchenItemResponse> getPendingKitchenItems() {
        return orderItemRepository.findPendingItems(OrderItemStatus.PENDING).stream()
            .map(item -> KitchenItemResponse.builder()
                .id(item.getId())
                .orderId(item.getOrder().getId())
                .tableId(item.getOrder().getDiningTable().getId())
                .tableName(item.getOrder().getDiningTable().getName())
                .menuItemName(item.getMenuItem().getName())
                .quantity(item.getQuantity())
                .note(item.getNote())
                .orderedAt(item.getOrderedAt())
                .status(item.getStatus().name())
                .build())
            .toList();
    }

    // Đánh dấu món đã phục vụ
    @Transactional
    public OrderResponse markItemServed(Long orderId, Long itemId) {
        Order order = findOpenOrderOrThrow(orderId);
        OrderItem item = findItemInOrder(order, itemId);
        item.setStatus(OrderItemStatus.SERVED);
        return OrderMapper.toResponse(orderRepository.save(order));
    }

    // ─── Private helpers ─────────────────────────────────────────────────────

    private Order findOrderOrThrow(Long id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order", id));
    }

    private Order findOpenOrderOrThrow(Long orderId) {
        Order order = findOrderOrThrow(orderId);
        if (order.getPaidAt() != null) {
            throw new IllegalStateException("Order id " + orderId + " đã được thanh toán, không thể chỉnh sửa.");
        }
        return order;
    }

    private DiningTable findTableOrThrow(Long tableId) {
        return diningTableRepository.findById(tableId)
                .orElseThrow(() -> new ResourceNotFoundException("DiningTable", tableId));
    }

    private MenuItem findMenuItemOrThrow(Long menuItemId) {
        return menuItemRepository.findById(menuItemId)
                .orElseThrow(() -> new ResourceNotFoundException("MenuItem", menuItemId));
    }

    private OrderItem findItemInOrder(Order order, Long itemId) {
        return order.getItems().stream()
                .filter(i -> i.getId().equals(itemId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("OrderItem", itemId));
    }

    private OrderItem buildOrderItem(Order order, MenuItem menuItem, OrderItemRequest req) {
        return OrderItem.builder()
                .order(order)
                .menuItem(menuItem)
                .quantity(req.getQuantity() != null ? req.getQuantity() : 1)
                .note(req.getNote() != null ? req.getNote() : "")
                .priceAtOrder(menuItem.getPrice())
                .orderedAt(LocalDateTime.now())
                .status(OrderItemStatus.PENDING)
                .build();
    }

    private long calculateTotalAmount(List<OrderItem> items) {
        return items.stream()
                .filter(i -> i.getStatus() != OrderItemStatus.CANCELLED)
                .mapToLong(i -> i.getPriceAtOrder() * i.getQuantity())
                .sum();
    }
}
