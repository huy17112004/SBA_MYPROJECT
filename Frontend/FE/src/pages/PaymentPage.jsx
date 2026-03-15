import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getOrder, payOrder } from '../api/orderApi';
import { formatMoney } from '../utils/formatMoney';

function PaymentPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [method, setMethod] = useState('CASH');

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      const res = await getOrder(orderId);
      setOrder(res.data);
    } catch (e) {
      console.error(e);
      alert("Lỗi khi tải order");
    }
  };

  const handlePayment = async () => {
    if (!window.confirm("Xác nhận thanh toán?")) return;
    try {
      await payOrder(orderId, { paymentMethod: method });
      alert("Thanh toán thành công");
      navigate('/tables');
    } catch (e) {
      console.error(e);
      alert("Lỗi thanh toán");
    }
  };

  if (!order) return <div>Đang tải...</div>;

  const total = order.items ? order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0) : 0;

  return (
    <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h1 className="page-title">Thanh Toán Order #{order.id}</h1>
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Món</th>
              <th>SL</th>
              <th>Đơn giá</th>
              <th>Thành tiền</th>
            </tr>
          </thead>
          <tbody>
            {(order.items || []).map(item => (
              <tr key={item.id}>
                <td>{item.menuItemName}</td>
                <td>{item.quantity}</td>
                <td>{formatMoney(item.price)}</td>
                <td>{formatMoney(item.price * item.quantity)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <h2 style={{ textAlign: 'right', marginTop: '1rem' }}>Tổng: {formatMoney(total)}</h2>
      
      <div className="form-group" style={{ marginTop: '2rem' }}>
        <label>Phương thức thanh toán:</label>
        <select className="form-control" value={method} onChange={e => setMethod(e.target.value)}>
          <option value="CASH">Tiền mặt</option>
          <option value="BANK_TRANSFER">Chuyển khoản</option>
        </select>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
        <button className="btn btn-primary" onClick={handlePayment} style={{ flex: 1 }}>Xác nhận thanh toán</button>
        <button className="btn btn-danger" onClick={() => navigate(-1)} style={{ flex: 1 }}>Hủy</button>
      </div>
    </div>
  );
}

export default PaymentPage;