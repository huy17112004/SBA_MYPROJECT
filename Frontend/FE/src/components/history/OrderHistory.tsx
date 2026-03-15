import { useState, useEffect, useCallback } from 'react';
import { useStore } from '@/hooks/useStore';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { formatVND, formatDateTime } from '@/lib/format';
import { Search, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Order } from '@/types';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';

interface PageResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  number: number;
  size: number;
}

export function OrderHistory() {
  const { state } = useStore();
  const [search, setSearch] = useState('');
  const [tableFilter, setTableFilter] = useState('all');
  const [viewOrder, setViewOrder] = useState<Order | null>(null);
  const [history, setHistory] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const pageSize = 10;

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get<PageResponse<Order>>(`/orders/history?page=${page}&size=${pageSize}`);
      setHistory(data.content);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error('Failed to fetch history', error);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const filteredOrders = history.filter(o => {
    if (tableFilter !== 'all' && o.tableId.toString() !== tableFilter.toString()) return false;
    if (search) {
      const s = search.toLowerCase();
      return (
        o.tableName.toLowerCase().includes(s) || 
        o.items.some(i => i.menuItemName.toLowerCase().includes(s))
      );
    }
    return true;
  });

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Lịch sử Order</h2>
      <div className="flex gap-2 mb-4 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input className="pl-8" placeholder="Tìm theo bàn, món..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={tableFilter} onValueChange={setTableFilter}>
          <SelectTrigger className="w-[140px]"><SelectValue placeholder="Tất cả bàn" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả bàn</SelectItem>
            {state.tables.map(t => <SelectItem key={t.id} value={t.id.toString()}>{t.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : filteredOrders.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">Chưa có order nào</p>
      ) : (
        <div className="space-y-2">
          {filteredOrders.map(order => (
            <Card key={order.id} className="cursor-pointer hover:bg-muted/30" onClick={() => setViewOrder(order)}>
              <CardContent className="flex items-center justify-between p-3">
                <div>
                  <div className="font-medium">{order.tableName}</div>
                  <div className="text-xs text-muted-foreground">{formatDateTime(order.paidAt!)}</div>
                  <div className="text-xs text-muted-foreground">{order.items.length} món</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{formatVND(order.totalAmount)}</div>
                  <Badge variant="secondary" className="text-xs">
                    {order.paymentMethod === 'cash' ? 'Tiền mặt' : 'Chuyển khoản'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
          
          <div className="flex items-center justify-center gap-4 mt-6">
            <Button 
              variant="outline" 
              size="sm" 
              disabled={page === 0}
              onClick={() => setPage(p => p - 1)}
            >
              <ChevronLeft className="h-4 w-4 mr-1" /> Trước
            </Button>
            <span className="text-sm font-medium">Trang {page + 1} / {totalPages || 1}</span>
            <Button 
              variant="outline" 
              size="sm" 
              disabled={page >= totalPages - 1}
              onClick={() => setPage(p => p + 1)}
            >
              Sau <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {viewOrder && (
        <Dialog open onOpenChange={() => setViewOrder(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Chi tiết - {viewOrder.tableName}</DialogTitle>
            </DialogHeader>
            <div className="text-sm text-muted-foreground mb-2">{formatDateTime(viewOrder.paidAt!)}</div>
            <div className="space-y-1">
              {viewOrder.items.map(item => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span>{item.menuItemName} × {item.quantity}</span>
                  <span>{formatVND(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between font-semibold border-t pt-2 mt-2">
              <span>Tổng</span>
              <span>{formatVND(viewOrder.totalAmount)}</span>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
