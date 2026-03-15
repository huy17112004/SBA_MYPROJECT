import React, { useState, useEffect } from 'react';
import { getRevenueStats } from '../../api/statsApi';
import { formatMoney } from '../../utils/formatMoney';

function RevenueChart() {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Pass a number (7 days) instead of a string 'weekly'
      const res = await getRevenueStats(7);
      // Sort data by date ascending for a better timeline view
      const sortedData = (res.data || []).sort((a, b) => new Date(a.date) - new Date(b.date));
      setData(sortedData);
    } catch (e) {
      console.error("Lỗi tải biểu đồ doanh thu:", e);
    }
  };

  return (
    <div className="card">
      <h3 className="card-title">Doanh Thu 7 Ngày Gần Đây</h3>
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Ngày</th>
              <th>Số đơn</th>
              <th>Doanh thu</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => (
              <tr key={idx}>
                <td>{row.date}</td>
                <td>{row.orders} đơn</td>
                <td>{formatMoney(row.revenue)}</td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr>
                <td colSpan="3" style={{ textAlign: 'center' }}>Chưa có dữ liệu thống kê ngày</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default RevenueChart;