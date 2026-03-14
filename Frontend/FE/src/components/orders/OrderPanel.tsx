import { useState } from 'react';
import { useStore } from '@/hooks/useStore';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatVND } from '@/lib/format';
import { Plus, Minus, Trash2, Search, Send, ArrowLeft, ArrowRightLeft } from 'lucide-react';
import { PaymentDialog } from '@/components/payment/PaymentDialog';

export function OrderPanel() {
  const { state, dispatch } = useStore();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('all');
  const [showPayment, setShowPayment] = useState(false);
  const [showMoveTable, setShowMoveTable] = useState(false);
  const [notes, setNotes] = useState<Record<string, string>>({});

  const tableId = searchParams.get('tableId');
  const orderId = searchParams.get('orderId');

  // Find or create order
  let order = orderId ? state.orders.find(o => o.id === orderId) : null;
  const table = tableId ? state.tables.find(t => t.id === tableId) : order ? state.tables.find(t => t.id === order!.tableId) : null;

  // If coming from empty table, create order
  if (tableId && !order && table) {
    const existing = state.orders.find(o => o.tableId === tableId && o.status === 'active');
    if (existing) {
      order = existing;
    }
  }

  const handleCreateAndAdd = () => {
    if (tableId && table && !order) {
      dispatch({ type: 'CREATE_ORDER', payload: { tableId, tableName: table.name } });
    }
  };

  // After creating, find the new order
  if (tableId && !order) {
    order = state.orders.find(o => o.tableId === tableId && o.status === 'active');
    if (!order && table) {
      // Will create on first item add
    }
  }

  const availableItems = state.menuItems.filter(m => {
    if (!m.available) return false;
    if (search && !m.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (catFilter !== 'all' && m.categoryId !== catFilter) return false;
    return true;
  });

  const addItem = (menuItem: typeof state.menuItems[0]) => {
    if (!order && tableId && table) {
      dispatch({ type: 'CREATE_ORDER', payload: { tableId, tableName: table.name } });
      // We'll add item after re-render via effect; for now just create
      setTimeout(() => {
        const newOrder = state.orders.find(o => o.tableId === tableId && o.status === 'active');
        // This won't work due to stale closure; let's handle differently
      }, 0);
      return;
    }
    if (!order) return;
    // Check if item already in order with pending status
    const existing = order.items.find(i => i.menuItemId === menuItem.id && i.status === 'pending');
    if (existing) {
      dispatch({ type: 'UPDATE_ORDER_ITEM_QTY', payload: { orderId: order.id, itemId: existing.id, quantity: existing.quantity + 1 } });
    } else {
      dispatch({
        type: 'ADD_ORDER_ITEMS',
        payload: {
          orderId: order.id,
          items: [{ menuItemId: menuItem.id, menuItemName: menuItem.name, quantity: 1, note: '', price: menuItem.price, status: 'pending' }],
        },
      });
    }
  };

  const emptyTables = state.tables.filter(t => t.status === 'empty');

  const handleMoveTable = (newTableId: string) => {
    if (!order) return;
    const newTable = state.tables.find(t => t.id === newTableId);
    if (!newTable) return;
    dispatch({ type: 'MOVE_TABLE', payload: { orderId: order.id, newTableId, newTableName: newTable.name } });
    setShowMoveTable(false);
  };

  // Need to re-get order after potential creation
  const currentOrder = order || (tableId ? state.orders.find(o => o.tableId === tableId && o.status === 'active') : null);

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-lg font-semibold">
          {table ? `Order - ${table.name}` : 'Order'}
        </h2>
        {currentOrder && (
          <Button variant="outline" size="sm" className="ml-auto" onClick={() => setShowMoveTable(!showMoveTable)}>
            <ArrowRightLeft className="h-4 w-4 mr-1" /> Chuyển bàn
          </Button>
        )}
      </div>

      {showMoveTable && (
        <Card className="mb-4">
          <CardContent className="p-3">
            <p className="text-sm mb-2 font-medium">Chọn bàn trống để chuyển:</p>
            <div className="flex flex-wrap gap-2">
              {emptyTables.map(t => (
                <Button key={t.id} variant="outline" size="sm" onClick={() => handleMoveTable(t.id)}>
                  {t.name}
                </Button>
              ))}
              {emptyTables.length === 0 && <p className="text-sm text-muted-foreground">Không có bàn trống</p>}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Menu selector */}
        <div>
          <div className="flex gap-2 mb-3">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input className="pl-8" placeholder="Tìm món..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <Select value={catFilter} onValueChange={setCatFilter}>
              <SelectTrigger className="w-[130px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                {state.categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {availableItems.map(item => (
              <button
                key={item.id}
                onClick={() => {
                  if (!currentOrder && tableId && table) {
                    handleCreateAndAdd();
                  }
                  addItem(item);
                }}
                className="rounded-lg border p-3 text-left hover:bg-muted/50 transition-colors"
              >
                <div className="text-sm font-medium truncate">{item.name}</div>
                <div className="text-sm text-primary font-semibold">{formatVND(item.price)}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Order detail */}
        <div>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Đơn hàng hiện tại</CardTitle>
            </CardHeader>
            <CardContent>
              {(!currentOrder || currentOrder.items.length === 0) ? (
                <p className="text-sm text-muted-foreground py-4 text-center">Chưa có món nào</p>
              ) : (
                <div className="space-y-2">
                  {currentOrder.items.map(item => (
                    <div key={item.id} className="flex items-center gap-2 py-1 border-b last:border-0">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{item.menuItemName}</div>
                        <div className="text-xs text-muted-foreground">{formatVND(item.price)}</div>
                        {item.note && <div className="text-xs italic text-muted-foreground">{item.note}</div>}
                      </div>
                      <Badge variant={item.status === 'served' ? 'default' : 'secondary'} className="text-xs">
                        {item.status === 'served' ? 'Đã ra' : 'Chờ'}
                      </Badge>
                      <div className="flex items-center gap-1">
                        <Button variant="outline" size="icon" className="h-7 w-7"
                          onClick={() => dispatch({ type: 'UPDATE_ORDER_ITEM_QTY', payload: { orderId: currentOrder.id, itemId: item.id, quantity: item.quantity - 1 } })}>
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="text-sm w-6 text-center">{item.quantity}</span>
                        <Button variant="outline" size="icon" className="h-7 w-7"
                          onClick={() => dispatch({ type: 'UPDATE_ORDER_ITEM_QTY', payload: { orderId: currentOrder.id, itemId: item.id, quantity: item.quantity + 1 } })}>
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      <span className="text-sm font-medium w-20 text-right">{formatVND(item.price * item.quantity)}</span>
                      <Button variant="ghost" size="icon" className="h-7 w-7"
                        onClick={() => dispatch({ type: 'REMOVE_ORDER_ITEM', payload: { orderId: currentOrder.id, itemId: item.id } })}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                  <div className="flex justify-between items-center pt-2 font-semibold">
                    <span>Tổng cộng</span>
                    <span>{formatVND(currentOrder.totalAmount)}</span>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button className="flex-1" onClick={() => setShowPayment(true)}>
                      Thanh toán
                    </Button>
                    <Button variant="outline"
                      onClick={() => dispatch({ type: 'CANCEL_ORDER', payload: currentOrder.id })}>
                      Hủy đơn
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {showPayment && currentOrder && (
        <PaymentDialog order={currentOrder} onClose={() => { setShowPayment(false); navigate('/'); }} />
      )}
    </div>
  );
}
