import { useStore } from '@/hooks/useStore';
import { DiningTable } from '@/types';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { formatVND, timeAgo } from '@/lib/format';

const statusColor: Record<string, string> = {
  empty: 'border-green-500 bg-green-500/10',
  AVAILABLE: 'border-green-500 bg-green-500/10',
  occupied: 'border-red-500 bg-red-500/10',
  OCCUPIED: 'border-red-500 bg-red-500/10',
  waiting_payment: 'border-yellow-500 bg-yellow-500/10',
};

const statusLabel: Record<string, string> = {
  empty: 'Trống',
  AVAILABLE: 'Trống',
  occupied: 'Có khách',
  OCCUPIED: 'Có khách',
  waiting_payment: 'Chờ thanh toán',
};

export function TableMap() {
  const { state } = useStore();
  const navigate = useNavigate();

  const getActiveOrder = (tableId: string | number) =>
    state.orders.find(o => String(o.tableId) === String(tableId) && !o.paidAt);

  const handleTableClick = (table: DiningTable) => {
    const order = getActiveOrder(table.id);
    if (table.status === 'empty' || table.status === 'AVAILABLE') {
      navigate(`/order?tableId=${table.id}`);
    } else if (order) {
      navigate(`/order?orderId=${order.id}`);
    } else {
      // If occupied but no order found in state, try to navigate by tableId to create one
      navigate(`/order?tableId=${table.id}`);
    }
  };

  const isLongWait = (tableId: string | number) => {
    const order = getActiveOrder(tableId);
    if (!order) return false;
    return (Date.now() - new Date(order.createdAt).getTime()) > 20 * 60 * 1000;
  };

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Sơ đồ bàn</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {state.tables.map((table) => {
          const order = getActiveOrder(table.id);
          const longWait = isLongWait(table.id);
          return (
            <button
              key={table.id}
              onClick={() => handleTableClick(table)}
              className={cn(
                'rounded-lg border-2 p-4 text-left transition-all hover:shadow-md',
                statusColor[table.status],
                longWait && 'animate-pulse border-destructive'
              )}
            >
              <div className="font-semibold">{table.name}</div>
              <div className="text-xs text-muted-foreground">{table.seats} chỗ</div>
              <div className={cn(
                'mt-1 text-xs font-medium',
                table.status === 'empty' && 'text-green-600',
                table.status === 'occupied' && 'text-red-600',
                table.status === 'waiting_payment' && 'text-yellow-600',
              )}>
                {statusLabel[table.status]}
              </div>
              {order && (
                <div className="mt-1 text-xs text-muted-foreground">
                  {formatVND(order.totalAmount)} · {timeAgo(order.createdAt)}
                </div>
              )}
              {table.note && <div className="mt-1 text-xs italic text-muted-foreground">{table.note}</div>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
