import React, { useState, useEffect } from 'react';
import { getOrderHistory } from '../api/orderApi';
import { formatMoney } from '../utils/formatMoney';
import { formatDateTime } from '../utils/timeUtils';

function HistoryPage() {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const pageSize = 10;

  useEffect(() => {
    fetchOrders(currentPage);
  }, [currentPage]);

  const fetchOrders = async (page) => {
    try {
      const res = await getOrderHistory(page, pageSize);
      // res.data is the Page object { content, totalPages, totalElements, ... }
      setOrders(res.data.content || []);
      setTotalPages(res.data.totalPages || 0);
    } catch (e) {
      console.error("Lỗi tải lịch sử:", e);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage);
    }
  };

  const filteredOrders = orders.filter(o => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return o.id.toString().includes(searchLower) || 
           (o.tableName && o.tableName.toLowerCase().includes(searchLower));
  });

  return (
    <div>
      <h1 className="page-title">Lịch Sử Order</h1>
      
      <div className="form-group" style={{ maxWidth: '300px' }}>
        <input 
          type="text" 
          className="form-control" 
          placeholder="Tìm kiếm mã đơn hoặc tên bàn..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Mã Order</th>
              <th>Bàn</th>
              <th>Ngày Giờ</th>
              <th>Tổng Tiền</th>
              <th>Thanh Toán</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map(order => (
              <tr key={order.id}>
                <td>#{order.id}</td>
                <td>{order.tableName || `Bàn ${order.tableId}`}</td>
                <td>{formatDateTime(order.paidAt || order.createdAt)}</td>
                <td>{formatMoney(order.totalAmount)}</td>
                <td>
                  <span className="badge badge-available">
                    {order.paymentMethod === 'CASH' ? 'Tiền mặt' : 
                     order.paymentMethod === 'BANK_TRANSFER' ? 'Chuyển khoản' : 'Đã thanh toán'}
                  </span>
                </td>
              </tr>
            ))}
            {filteredOrders.length === 0 && (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center' }}>Không có lịch sử hiển thị</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '1rem' }}>
          <button 
            className="btn btn-primary" 
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 0}
          >
            Trang trước
          </button>
          <span>Trang {currentPage + 1} / {totalPages}</span>
          <button 
            className="btn btn-primary" 
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages - 1}
          >
            Trang sau
          </button>
        </div>
      )}
    </div>
  );
}

export default HistoryPage;