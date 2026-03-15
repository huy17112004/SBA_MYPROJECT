import { useState } from 'react';
import { useStore } from '@/hooks/useStore';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatVND } from '@/lib/format';
import { Plus, Minus, Trash2, Search, ArrowLeft, ArrowRightLeft } from 'lucide-react';
import { PaymentDialog } from '@/components/payment/PaymentDialog';
import { MenuItem } from '@/types';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export function OrderPanel() {
  const { state, actions } = useStore();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('all');
  const [showPayment, setShowPayment] = useState(false);
  const [showMoveTable, setShowMoveTable] = useState(false);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [showSplit, setShowSplit] = useState(false);

  const tableId = searchParams.get('tableId');
  const orderId = searchParams.get('orderId');

  // Find order
  let currentOrder = orderId ? state.orders.find(o => String(o.id) === String(orderId)) : null;
  const table = tableId ? state.tables.find(t => String(t.id) === String(tableId)) : (currentOrder ? state.tables.find(t => String(t.id) === String(currentOrder!.tableId)) : null);

  if (!currentOrder && tableId) {
    currentOrder = state.orders.find(o => String(o.tableId) === String(tableId) && !o.paidAt) || null;
  }

  const availableItems = state.menuItems.filter(m => {
    if (!m.available) return false;
    if (search && !m.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (catFilter !== 'all' && String(m.categoryId) !== String(catFilter)) return false;
    return true;
  });

  const addItem = async (menuItem: MenuItem) => {
    let activeOrder = currentOrder;
    if (!activeOrder && tableId) {
      activeOrder = await actions.createOrder(tableId);
    }
    
    if (!activeOrder) return;

    const existing = activeOrder.items.find(i => String(i.menuItemId) === String(menuItem.id) && (i.status === 'pending' || i.status === 'PENDING'));
    if (existing) {
      await actions.updateOrderItem(activeOrder.id, existing.id, existing.quantity + 1, existing.note || '');
    } else {
      await actions.addOrderItems(activeOrder.id, [{ menuItemId: menuItem.id, quantity: 1, note: '' }]);
    }
  };

  const handleMoveTable = async (targetTableId: string | number) => {
    if (!currentOrder || !table) return;
    try {
      await actions.moveOrder(table.id, targetTableId);
      navigate(`/order?tableId=${targetTableId}`);
      setShowMoveTable(false);
    } catch (error) {
      console.error(error);
    }
  };

  const handleMergeTable = async (targetTableId: string | number) => {
    if (!currentOrder || !table) return;
    try {
      await actions.mergeOrders(table.id, targetTableId);
      navigate('/');
      setShowMoveTable(false);
    } catch (error) {
      console.error(error);
    }
  };

  const toggleItemSelection = (itemId: number) => {
    setSelectedItems(prev => 
      prev.includes(itemId) ? prev.filter(id => id !== itemId) : [...prev, itemId]
    );
  };

  const handleSplitOrder = async (targetTableId: string | number) => {
    if (!currentOrder || selectedItems.length === 0) return;
    try {
      await actions.splitOrder(currentOrder.id, targetTableId, selectedItems);
      setSelectedItems([]);
      setShowSplit(false);
      setShowMoveTable(false);
    } catch (error) {
      console.error(error);
    }
  };

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
          <div className="ml-auto flex gap-2">
            <Button variant="outline" size="sm" onClick={() => { setShowSplit(!showSplit); if (!showSplit) setShowMoveTable(true); }}>
              <ArrowRightLeft className="h-4 w-4 mr-1" /> Tách món
            </Button>
            <Button variant="outline" size="sm" onClick={() => { setShowMoveTable(!showMoveTable); setShowSplit(false); }}>
              <ArrowRightLeft className="h-4 w-4 mr-1" /> Chuyển/Gộp
            </Button>
          </div>
        )}
      </div>

      {showMoveTable && (
        <Card className="mb-4">
          <CardContent className="p-4">
            {showSplit && (
              <div className="mb-4 p-3 bg-primary/5 border border-primary/20 rounded-md">
                <p className="text-sm font-bold mb-1">Đang tách {selectedItems.length} món</p>
                <p className="text-xs text-muted-foreground">Chọn bàn đích bên dưới để chuyển các món đã chọn.</p>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm mb-2 font-semibold text-green-600">Bàn trống:</p>
                <div className="flex flex-wrap gap-2">
                  {state.tables.filter(t => (t.status === 'empty' || t.status === 'AVAILABLE') && String(t.id) !== String(table?.id)).length === 0 ? (
                    <span className="text-xs text-muted-foreground italic">Hết bàn trống</span>
                  ) : (
                    state.tables.filter(t => (t.status === 'empty' || t.status === 'AVAILABLE') && String(t.id) !== String(table?.id)).map(t => (
                      <Button key={t.id} variant="outline" size="sm" onClick={() => showSplit ? handleSplitOrder(t.id) : handleMoveTable(t.id)}>
                        {t.name}
                      </Button>
                    ))
                  )}
                </div>
              </div>
              <div>
                <p className="text-sm mb-2 font-semibold text-red-600">Bàn có khách:</p>
                <div className="flex flex-wrap gap-2">
                  {state.tables.filter(t => (t.status === 'occupied' || t.status === 'OCCUPIED') && String(t.id) !== String(table?.id)).length === 0 ? (
                    <span className="text-xs text-muted-foreground italic">Không có bàn khách</span>
                  ) : (
                    state.tables.filter(t => (t.status === 'occupied' || t.status === 'OCCUPIED') && String(t.id) !== String(table?.id)).map(t => (
                      <Button key={t.id} variant="outline" size="sm" onClick={() => showSplit ? handleSplitOrder(t.id) : handleMergeTable(t.id)}>
                        {t.name}
                      </Button>
                    ))
                  )}
                </div>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <Button variant="ghost" size="sm" onClick={() => { setShowMoveTable(false); setShowSplit(false); }}>Hủy</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
                {state.categories.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {availableItems.map(item => (
              <button
                key={item.id}
                onClick={() => addItem(item)}
                className="rounded-lg border p-3 text-left hover:bg-muted/50 transition-colors"
              >
                <div className="text-sm font-medium truncate">{item.name}</div>
                <div className="text-sm text-primary font-semibold">{formatVND(item.price)}</div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex justify-between items-center">
                Đơn hàng hiện tại
                {showSplit && <Badge variant="destructive">Chế độ tách món</Badge>}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {(!currentOrder || currentOrder.items.length === 0) ? (
                <p className="text-sm text-muted-foreground py-4 text-center">Chưa có món nào</p>
              ) : (
                <div className="space-y-2">
                  {currentOrder.items.map(item => (
                    <div 
                      key={item.id} 
                      className={cn(
                        "flex items-center gap-2 py-1 border-b last:border-0",
                        showSplit && "cursor-pointer hover:bg-muted px-2 rounded-md transition-colors",
                        showSplit && selectedItems.includes(item.id) && "bg-primary/10 border-primary"
                      )}
                      onClick={() => showSplit && toggleItemSelection(item.id as number)}
                    >
                      {showSplit && (
                        <div className={cn(
                          "w-4 h-4 rounded border flex items-center justify-center mr-1",
                          selectedItems.includes(item.id as number) ? "bg-primary border-primary" : "border-muted-foreground"
                        )}>
                          {selectedItems.includes(item.id as number) && <div className="w-2 h-2 bg-white rounded-full" />}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{item.menuItemName}</div>
                        <div className="text-xs text-muted-foreground">{formatVND(item.price)}</div>
                        {!showSplit && (
                          <Input
                            defaultValue={item.note || ''}
                            placeholder="Ghi chú..."
                            className="h-6 text-xs mt-1 px-2 w-full max-w-[150px] bg-muted/50"
                            onBlur={(e) => {
                              if (e.target.value !== item.note) {
                                actions.updateOrderItem(currentOrder!.id, item.id, item.quantity, e.target.value);
                              }
                            }}
                          />
                        )}
                      </div>
                      <Badge variant={(item.status === 'served' || item.status === 'SERVED') ? 'default' : 'secondary'} className="text-xs">
                        {(item.status === 'served' || item.status === 'SERVED') ? 'Đã ra' : 'Chờ'}
                      </Badge>
                      <div className="flex items-center gap-1">
                        {!showSplit && (
                          <Button variant="outline" size="icon" className="h-7 w-7"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (item.quantity > 1) {
                                actions.updateOrderItem(currentOrder!.id, item.id, item.quantity - 1, item.note);
                              } else {
                                actions.removeOrderItem(currentOrder!.id, item.id);
                              }
                            }}>
                            <Minus className="h-3 w-3" />
                          </Button>
                        )}
                        <span className="text-sm w-6 text-center">{item.quantity}</span>
                        {!showSplit && (
                          <Button variant="outline" size="icon" className="h-7 w-7"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (item.status === 'served' || item.status === 'SERVED') {
                                actions.addOrderItems(currentOrder!.id, [{ menuItemId: item.menuItemId, quantity: 1, note: item.note }]);
                              } else {
                                actions.updateOrderItem(currentOrder!.id, item.id, item.quantity + 1, item.note);
                              }
                            }}>
                            <Plus className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                      <span className="text-sm font-medium w-20 text-right">{formatVND(item.price * item.quantity)}</span>
                      {!showSplit && (
                        <Button variant="ghost" size="icon" className="h-7 w-7"
                          onClick={(e) => { e.stopPropagation(); actions.removeOrderItem(currentOrder!.id, item.id); }}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <div className="flex justify-between items-center pt-2 font-semibold">
                    <span>Tổng cộng</span>
                    <span>{formatVND(currentOrder.totalAmount)}</span>
                  </div>
                  {!showSplit && (
                    <div className="flex gap-2 pt-2">
                      <Button className="flex-1" onClick={() => setShowPayment(true)}>
                        Thanh toán
                      </Button>
                      <Button variant="outline"
                        onClick={() => toast.error('Dùng nút Xóa món để hủy')}>
                        Hủy đơn
                      </Button>
                    </div>
                  )}
                  {showSplit && (
                    <div className="pt-2">
                      <p className="text-xs text-center text-muted-foreground italic">Nhấp vào món để chọn, sau đó chọn bàn đích ở trên</p>
                    </div>
                  )}
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
