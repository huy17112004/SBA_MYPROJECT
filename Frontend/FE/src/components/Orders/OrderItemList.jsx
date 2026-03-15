import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getActiveOrderByTable, createOrder, updateOrderItem, deleteOrderItem } from '../../api/orderApi';
import { formatMoney } from '../../utils/formatMoney';
import OrderItemEditor from './OrderItemEditor';

function OrderItemList({ tableId }) {
  const [order, setOrder] = useState(null);
  const [showEditor, setShowEditor] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrder();
  }, [tableId]);

  const fetchOrder = async () => {
    try {
      const res = await getActiveOrderByTable(tableId);
      if (res.data) setOrder(res.data);
      else setOrder(null);
    } catch (e) {
      setOrder(null);
    }
  };

  const handleCreateOrder = async () => {
    try {
      // Backend expects { tableId, items: [] }
      const res = await createOrder({ tableId: Number(tableId), items: [] });
      setOrder(res.data);
    } catch (e) {
      console.error(e);
      alert("Lỗi tạo order");
    }
  };

  const handleQuantityChange = async (itemId, newQty) => {
    if (newQty < 1) return;
    try {
      // Backend expects UpdateOrderItemRequest { quantity, note }
      const currentItem = order.items.find(i => i.id === itemId);
      await updateOrderItem(order.id, itemId, { 
        quantity: newQty,
        note: currentItem.note
      });
      fetchOrder();
    } catch (e) {
      console.error(e);
      alert("Lỗi cập nhật số lượng");
    }
  };

  const handleRemove = async (itemId) => {
    if (!window.confirm("Xóa món này khỏi order?")) return;
    try {
      await deleteOrderItem(order.id, itemId);
      fetchOrder();
    } catch (e) {
      console.error(e);
      alert("Lỗi xóa món");
    }
  };

  const handlePayment = () => {
    navigate(`/payment/${order.id}`);
  };

  if (!order) {
    return (
      <div>
        <p>Bàn này chưa có khách (trống).</p>
        <button className="btn btn-primary" onClick={handleCreateOrder}>Bắt đầu phục vụ (Tạo Order)</button>
      </div>
    );
  }

  const total = order.items ? order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0) : 0;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <h3>Mã Order: #{order.id}</h3>
        <button className="btn btn-success" onClick={() => setShowEditor(true)}>+ Thêm món</button>
      </div>

      {showEditor && <OrderItemEditor orderId={order.id} onClose={() => setShowEditor(false)} onRefresh={fetchOrder} />}

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Món</th>
              <th>SL</th>
              <th>Đơn giá</th>
              <th>Ghi chú</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {(order.items || []).map(item => (
              <tr key={item.id}>
                <td>{item.menuItemName}</td>
                <td>
                  <button onClick={() => handleQuantityChange(item.id, item.quantity - 1)}>-</button>
                  <span style={{ margin: '0 0.5rem' }}>{item.quantity}</span>
                  <button onClick={() => handleQuantityChange(item.id, item.quantity + 1)}>+</button>
                </td>
                <td>{formatMoney(item.price)}</td>
                <td>{item.note}</td>
                <td>{item.status === 'SERVED' ? 'Đã ra' : 'Đang chờ'}</td>
                <td>
                  <button className="btn btn-danger" style={{ padding: '0.2rem 0.5rem' }} onClick={() => handleRemove(item.id)}>Xóa</button>
                </td>
              </tr>
            ))}
            {(!order.items || order.items.length === 0) && (
              <tr><td colSpan="6" style={{textAlign: 'center'}}>Chưa có món nào. Nhấn "+ Thêm món" để gọi đồ.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
        <h2>Tổng: {formatMoney(total)}</h2>
        <button className="btn btn-warning" onClick={handlePayment} disabled={!order.items || order.items.length === 0}>Thanh Toán</button>
      </div>
    </div>
  );
}

export default OrderItemList;