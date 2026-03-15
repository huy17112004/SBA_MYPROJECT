import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layout/MainLayout';
import TablesPage from './pages/TablesPage';
import MenuPage from './pages/MenuPage';
import OrderPage from './pages/OrderPage';
import KitchenPage from './pages/KitchenPage';
import PaymentPage from './pages/PaymentPage';
import HistoryPage from './pages/HistoryPage';
import StatsPage from './pages/StatsPage';

function App() {
  return (
    <Router>
      <MainLayout>
        <Routes>
          <Route path="/" element={<Navigate to="/tables" replace />} />
          <Route path="/tables" element={<TablesPage />} />
          <Route path="/menu" element={<MenuPage />} />
          <Route path="/order/:tableId" element={<OrderPage />} />
          <Route path="/kitchen" element={<KitchenPage />} />
          <Route path="/payment/:orderId" element={<PaymentPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/stats" element={<StatsPage />} />
        </Routes>
      </MainLayout>
    </Router>
  );
}

export default App;