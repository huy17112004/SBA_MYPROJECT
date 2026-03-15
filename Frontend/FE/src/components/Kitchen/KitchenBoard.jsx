import React, { useState, useEffect } from 'react';
import { getPendingOrderItems, markItemAsServed } from '../../api/orderApi';
import { getWaitingTime } from '../../utils/timeUtils';

function KitchenBoard() {
  const [items, setItems] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const pageSize = 9; // Show 9 items (3x3 grid) per page

  useEffect(() => {
    fetchPending(currentPage);
    const interval = setInterval(() => fetchPending(currentPage), 10000); // refresh every 10s
    return () => clearInterval(interval);
  }, [currentPage]);

  const fetchPending = async (page) => {
    try {
      const res = await getPendingOrderItems(page, pageSize);
      // res.data is a Page object
      setItems(res.data.content || []);
      setTotalPages(res.data.totalPages || 0);
    } catch (e) {
      console.error(e);
    }
  };

  const handleServe = async (orderId, itemId) => {
    try {
      await markItemAsServed(orderId, itemId);
      fetchPending(currentPage);
    } catch (e) {
      alert("Lỗi cập nhật");
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <div>
      <h2 style={{ marginBottom: '1rem' }}>Các món cần làm</h2>
      <div className="grid grid-cols-3">
        {items.map(item => (
          <div key={item.id} className="card" style={{ borderLeft: '4px solid #e74c3c' }}>
            <h3 style={{ margin: '0 0 0.5rem 0' }}>Bàn {item.tableName || item.tableId}</h3>
            <p><strong>Món:</strong> {item.menuItemName}</p>
            <p><strong>SL:</strong> {item.quantity}</p>
            {item.note && <p><strong>Ghi chú:</strong> <span style={{color: 'red'}}>{item.note}</span></p>}
            <p><strong>Chờ:</strong> {getWaitingTime(item.orderTime)}</p>
            <button className="btn btn-success" style={{ width: '100%', marginTop: '1rem' }} onClick={() => handleServe(item.orderId, item.id)}>
              Đã Xong
            </button>
          </div>
        ))}
        {items.length === 0 && <p>Chưa có order nào cần làm.</p>}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '2rem' }}>
          <button 
            className="btn btn-primary" 
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 0}
          >
            Trước
          </button>
          <span>Trang {currentPage + 1} / {totalPages}</span>
          <button 
            className="btn btn-primary" 
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages - 1}
          >
            Sau
          </button>
        </div>
      )}
    </div>
  );
}

export default KitchenBoard;