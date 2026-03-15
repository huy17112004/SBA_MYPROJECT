import React from 'react';
import { useNavigate } from 'react-router-dom';
import { deleteTable } from '../../api/tableApi';

function TableCard({ table, onRefresh }) {
  const navigate = useNavigate();

  const handleOrder = () => {
    navigate(`/order/${table.id}`);
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (!window.confirm("Xóa bàn này?")) return;
    try {
      await deleteTable(table.id);
      onRefresh();
    } catch (e) {
      alert("Không thể xóa bàn");
    }
  };

  let badgeClass = "badge-available";
  let statusText = "Trống";
  if (table.status === 'OCCUPIED') {
    badgeClass = "badge-occupied";
    statusText = "Có khách";
  } else if (table.status === 'WAITING_PAYMENT') {
    badgeClass = "badge-waiting";
    statusText = "Chờ thanh toán";
  }

  return (
    <div className="card" style={{ cursor: 'pointer', position: 'relative' }} onClick={handleOrder}>
      <button 
        style={{ position: 'absolute', top: 5, right: 5, background: 'none', border: 'none', color: 'red', cursor: 'pointer' }}
        onClick={handleDelete}
      >X</button>
      <h3 className="card-title">{table.name}</h3>
      <span className={`badge ${badgeClass}`}>{statusText}</span>
    </div>
  );
}

export default TableCard;