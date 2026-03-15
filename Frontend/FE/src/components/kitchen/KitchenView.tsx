import { useStore } from '@/hooks/useStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { timeAgo } from '@/lib/format';
import { Check, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useRef, useState, useCallback } from 'react';
import { api } from '@/lib/api';

interface KitchenItem {
  id: number;
  orderId: number;
  tableId: number;
  tableName: string;
  menuItemName: string;
  quantity: number;
  note: string;
  orderedAt: string;
  status: string;
}

interface PageResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  number: number;
  size: number;
}

export function KitchenView() {
  const { state, actions } = useStore();
  const [items, setItems] = useState<KitchenItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const prevCountRef = useRef<number>(0);
  const pageSize = 10;

  const fetchItems = useCallback(async () => {
    try {
      const data = await api.get<PageResponse<KitchenItem>>(`/orders/kitchen/pending?page=${page}&size=${pageSize}`);
      setItems(data.content);
      setTotalPages(data.totalPages);
      
      // Sound notification logic
      if (data.totalElements > prevCountRef.current) {
        if (prevCountRef.current !== 0) { // Don't play on first load
          const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3');
          audio.play().catch(e => console.log('Audio play failed', e));
        }
      }
      prevCountRef.current = data.totalElements;
    } catch (error) {
      console.error('Failed to fetch kitchen items', error);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchItems();
    const interval = setInterval(fetchItems, 10000);
    return () => clearInterval(interval);
  }, [fetchItems]);

  // For summary, we might still want to see all pending items. 
  // In a real app, we'd have a separate endpoint for the summary or return it in the page response.
  // Here we'll just summarize the items on the current page for simplicity, 
  // or you can add a dedicated API call for total summary.
  const summary: Record<string, { name: string; total: number }> = {};
  items.forEach(i => {
    if (!summary[i.menuItemName]) summary[i.menuItemName] = { name: i.menuItemName, total: 0 };
    summary[i.menuItemName].total += i.quantity;
  });

  const handleMarkServed = async (orderId: number, itemId: number) => {
    await actions.markItemServed(orderId, itemId);
    fetchItems(); // Refresh immediately
  };

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Bếp — Món cần làm</h2>

      {Object.keys(summary).length > 0 && (
        <Card className="mb-4">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Tổng hợp (Trang hiện tại)</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {Object.values(summary).map(s => (
                <Badge key={s.name} variant="secondary" className="text-sm">
                  {s.name} × {s.total}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {loading && items.length === 0 ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : items.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">Không có món chờ</p>
      ) : (
        <div className="space-y-2">
          {items.map(item => (
            <Card key={item.id}>
              <CardContent className="flex items-center justify-between p-3">
                <div>
                  <div className="font-medium">{item.menuItemName} × {item.quantity}</div>
                  <div className="text-xs text-muted-foreground">
                    {item.tableName} · {timeAgo(item.orderedAt)}
                  </div>
                  {item.note && <div className="text-xs italic text-muted-foreground">Ghi chú: {item.note}</div>}
                </div>
                <Button size="sm" onClick={() => handleMarkServed(item.orderId, item.id)}>
                  <Check className="h-4 w-4 mr-1" /> Đã ra
                </Button>
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
    </div>
  );
}
