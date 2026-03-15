import React, { useState, useEffect } from 'react';
import { getTopItems } from '../../api/statsApi';
import { formatMoney } from '../../utils/formatMoney';

function TopItems() {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await getTopItems();
      setData(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="card">
      <h3 className="card-title">Top Món Bán Chạy (7 ngày)</h3>
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Món</th>
              <th>Số lượng</th>
              <th>Doanh thu</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => (
              <tr key={idx}>
                <td>{row.name}</td>
                <td>{row.quantity}</td>
                <td>{formatMoney(row.revenue)}</td>
              </tr>
            ))}
            {data.length === 0 && <tr><td colSpan="3">Chưa có dữ liệu</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default TopItems;