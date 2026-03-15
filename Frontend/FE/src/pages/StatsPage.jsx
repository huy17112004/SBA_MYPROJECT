import React, { useState, useEffect } from 'react';
import { getDailyRevenue } from '../api/statsApi';
import { formatMoney } from '../utils/formatMoney';
import RevenueChart from '../components/Stats/RevenueChart';
import TopItems from '../components/Stats/TopItems';

function StatsPage() {
  const [stats, setStats] = useState({ todayRevenue: 0, todayOrders: 0, averagePerOrder: 0 });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await getDailyRevenue();
      setStats(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div>
      <h1 className="page-title">Thống Kê Kinh Doanh</h1>
      <div className="grid grid-cols-3">
        <div className="card" style={{ backgroundColor: '#2ecc71', color: 'white' }}>
          <h2 className="card-title">Doanh Thu Hôm Nay</h2>
          <h1>{formatMoney(stats.todayRevenue)}</h1>
        </div>
        <div className="card" style={{ backgroundColor: '#3498db', color: 'white' }}>
          <h2 className="card-title">Số Đơn Hôm Nay</h2>
          <h1>{stats.todayOrders}</h1>
        </div>
        <div className="card" style={{ backgroundColor: '#f1c40f', color: 'black' }}>
          <h2 className="card-title">Trung Bình / Đơn</h2>
          <h1>{formatMoney(stats.averagePerOrder)}</h1>
        </div>
      </div>

      <div className="grid grid-cols-2" style={{ marginTop: '2rem' }}>
        <RevenueChart />
        <TopItems />
      </div>
    </div>
  );
}

export default StatsPage;