import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { formatVND, formatDateTime, cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Search, History, Receipt } from 'lucide-react';
import type { Order } from '@/types';

export default function HistoryPage() {
  const { getCompletedOrders } = useApp();
  const completedOrders = getCompletedOrders();
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const filtered = completedOrders.filter(o => {
    if (!search) return true;
    const q = search.toLowerCase();
    return o.tableName.toLowerCase().includes(q) ||
      o.items.some(i => i.menuItemName.toLowerCase().includes(q)) ||
      o.id.includes(q);
  });

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Lịch sử Order</h1>
        <p className="text-sm text-muted-foreground mt-1">{completedOrders.length} order đã hoàn thành</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Tìm theo bàn, món, mã order..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <History className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4" />
          <p className="text-lg text-muted-foreground">Chưa có order nào</p>
          <p className="text-sm text-muted-foreground/60">Sau khi thanh toán, order sẽ hiện ở đây</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(order => (
            <Card
              key={order.id}
              className="shadow-card border-border/50 cursor-pointer hover:shadow-elevated transition-all"
              onClick={() => setSelectedOrder(order)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                      <Receipt className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{order.tableName}</h3>
                      <p className="text-xs text-muted-foreground">
                        #{order.id.slice(0, 5)} · {order.completedAt ? formatDateTime(order.completedAt) : ''}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary">{formatVND(order.total)}</p>
                    <Badge variant="secondary" className="text-[10px]">
                      {order.paymentMethod === 'cash' ? '💵 Tiền mặt' : '💳 Chuyển khoản'}
                    </Badge>
                  </div>
                </div>
                <div className="mt-2 flex gap-1 flex-wrap">
                  {order.items.slice(0, 3).map(item => (
                    <Badge key={item.id} variant="outline" className="text-[10px]">
                      {item.menuItemName} x{item.quantity}
                    </Badge>
                  ))}
                  {order.items.length > 3 && (
                    <Badge variant="outline" className="text-[10px]">+{order.items.length - 3} món</Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Order Detail Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hóa đơn — {selectedOrder?.tableName}</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="text-sm space-y-1 text-muted-foreground">
                <p>Mã: #{selectedOrder.id.slice(0, 7)}</p>
                <p>Thời gian: {selectedOrder.completedAt ? formatDateTime(selectedOrder.completedAt) : ''}</p>
                <p>Thanh toán: {selectedOrder.paymentMethod === 'cash' ? 'Tiền mặt' : 'Chuyển khoản'}</p>
              </div>
              <div className="bg-secondary/50 rounded-xl p-4 space-y-2">
                {selectedOrder.items.map(item => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-foreground">{item.menuItemName} x{item.quantity}</span>
                    <span className="font-medium text-foreground">{formatVND(item.priceAtTime * item.quantity)}</span>
                  </div>
                ))}
                <div className="border-t border-border pt-2 mt-2 flex justify-between">
                  <span className="font-bold text-foreground">Tổng cộng</span>
                  <span className="font-bold text-primary text-lg">{formatVND(selectedOrder.total)}</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
