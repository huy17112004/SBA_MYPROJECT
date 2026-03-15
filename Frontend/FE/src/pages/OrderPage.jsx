import React from 'react';
import { useParams } from 'react-router-dom';
import OrderItemList from '../components/Orders/OrderItemList';

function OrderPage() {
  const { tableId } = useParams();

  return (
    <div>
      <h1 className="page-title">Chi Tiết Order - Bàn {tableId}</h1>
      <OrderItemList tableId={tableId} />
    </div>
  );
}

export default OrderPage;