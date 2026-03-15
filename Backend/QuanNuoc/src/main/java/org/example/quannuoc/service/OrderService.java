package org.example.quannuoc.service;

import lombok.RequiredArgsConstructor;
import org.example.quannuoc.dto.request.*;
import org.example.quannuoc.dto.response.OrderResponse;
import org.example.quannuoc.dto.response.KitchenItemResponse;
import org.example.quannuoc.entity.*;
import org.example.quannuoc.exception.ResourceNotFoundException;
import org.example.quannuoc.mapper.OrderMapper;
import org.example.quannuoc.repository.DiningTableRepository;
import org.example.quannuoc.repository.MenuItemRepository;
import org.example.quannuoc.repository.OrderItemRepository;
import org.example.quannuoc.repository.OrderRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
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

    // Lấy lịch sử order có phân trang
    public Page<OrderResponse> getHistory(Pageable pageable) {
        return orderRepository.findByPaidAtIsNotNullOrderByPaidAtDesc(pageable)
                .map(OrderMapper::toResponse);
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

    // Chuyển bàn
    @Transactional
    public OrderResponse moveOrder(MoveTableRequest request) {
        Order sourceOrder = orderRepository.findByDiningTableIdAndPaidAtIsNull(request.getSourceTableId())
                .orElseThrow(() -> new ResourceNotFoundException("Order đang mở cho bàn nguồn", request.getSourceTableId()));
        
        DiningTable targetTable = findTableOrThrow(request.getTargetTableId());
        
        if (orderRepository.findByDiningTableIdAndPaidAtIsNull(request.getTargetTableId()).isPresent()) {
            throw new IllegalStateException("Bàn đích đang có order, vui lòng dùng chức năng Gộp bàn.");
        }

        DiningTable sourceTable = sourceOrder.getDiningTable();
        
        // Cập nhật order
        sourceOrder.setDiningTable(targetTable);
        Order saved = orderRepository.save(sourceOrder);

        // Cập nhật trạng thái bàn
        sourceTable.setStatus(TableStatus.AVAILABLE);
        targetTable.setStatus(TableStatus.OCCUPIED);
        diningTableRepository.save(sourceTable);
        diningTableRepository.save(targetTable);

        return OrderMapper.toResponse(saved);
    }

    // Gộp bàn
    @Transactional
    public OrderResponse mergeOrders(MergeTableRequest request) {
        Order sourceOrder = orderRepository.findByDiningTableIdAndPaidAtIsNull(request.getSourceTableId())
                .orElseThrow(() -> new ResourceNotFoundException("Order đang mở cho bàn nguồn", request.getSourceTableId()));
        
        Order targetOrder = orderRepository.findByDiningTableIdAndPaidAtIsNull(request.getTargetTableId())
                .orElseThrow(() -> new ResourceNotFoundException("Order đang mở cho bàn đích", request.getTargetTableId()));

        // Di chuyển tất cả các món từ source sang target
        List<OrderItem> items = new ArrayList<>(sourceOrder.getItems());
        for (OrderItem item : items) {
            item.setOrder(targetOrder);
            orderItemRepository.save(item);
        }
        
        targetOrder.getItems().addAll(items);
        targetOrder.setTotalAmount(calculateTotalAmount(targetOrder.getItems()));
        Order saved = orderRepository.save(targetOrder);

        // Xóa order nguồn cũ (đã hết món)
        DiningTable sourceTable = sourceOrder.getDiningTable();
        sourceOrder.setItems(new ArrayList<>()); // Tránh xóa lan truyền nếu có CascadeType.ALL
        orderRepository.delete(sourceOrder);

        // Cập nhật trạng thái bàn nguồn
        sourceTable.setStatus(TableStatus.AVAILABLE);
        diningTableRepository.save(sourceTable);

        return OrderMapper.toResponse(saved);
    }

    // Tách hóa đơn (Tách món sang bàn khác)
    @Transactional
    public OrderResponse splitOrder(Long sourceOrderId, SplitOrderRequest request) {
        Order sourceOrder = findOpenOrderOrThrow(sourceOrderId);
        DiningTable targetTable = findTableOrThrow(request.getTargetTableId());

        // Tìm hoặc tạo order cho bàn đích
        Order targetOrder = orderRepository.findByDiningTableIdAndPaidAtIsNull(request.getTargetTableId())
                .orElseGet(() -> {
                    Order newOrder = Order.builder()
                            .diningTable(targetTable)
                            .createdAt(LocalDateTime.now())
                            .note("Tách từ " + sourceOrder.getDiningTable().getName())
                            .totalAmount(0L)
                            .build();
                    targetTable.setStatus(TableStatus.OCCUPIED);
                    diningTableRepository.save(targetTable);
                    return orderRepository.save(newOrder);
                });

        // Di chuyển các item được chỉ định
        List<OrderItem> itemsToMove = new ArrayList<>(sourceOrder.getItems().stream()
                .filter(i -> request.getOrderItemIds().contains(i.getId()))
                .toList());

        if (itemsToMove.isEmpty()) {
            throw new IllegalArgumentException("Không tìm thấy món cần tách trong order nguồn");
        }

        for (OrderItem item : itemsToMove) {
            item.setOrder(targetOrder);
            orderItemRepository.save(item);
            sourceOrder.getItems().remove(item);
            targetOrder.getItems().add(item);
        }

        // Cập nhật lại tổng tiền cả 2 order
        sourceOrder.setTotalAmount(calculateTotalAmount(sourceOrder.getItems()));
        targetOrder.setTotalAmount(calculateTotalAmount(targetOrder.getItems()));

        orderRepository.save(sourceOrder);
        return OrderMapper.toResponse(orderRepository.save(targetOrder));
    }

    // Quản lý bếp: Lấy danh sách món đang chờ có phân trang
    public Page<KitchenItemResponse> getPendingKitchenItems(Pageable pageable) {
        return orderItemRepository.findPendingItemsPage(OrderItemStatus.PENDING, pageable).map(item -> KitchenItemResponse.builder()
                .id(item.getId())
                .orderId(item.getOrder().getId())
                .tableId(item.getOrder().getDiningTable().getId())
                .tableName(item.getOrder().getDiningTable().getName())
                .menuItemName(item.getMenuItem().getName())
                .quantity(item.getQuantity())
                .note(item.getNote())
                .orderedAt(item.getOrderedAt())
                .status(item.getStatus().name())
                .build());
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
