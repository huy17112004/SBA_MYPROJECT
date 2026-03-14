import { useStore } from '@/hooks/useStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { timeAgo } from '@/lib/format';
import { Check } from 'lucide-react';

export function KitchenView() {
  const { state, dispatch } = useStore();

  const activeOrders = state.orders.filter(o => o.status === 'active');
  const pendingItems = activeOrders.flatMap(o =>
    o.items
      .filter(i => i.status === 'pending')
      .map(i => ({ ...i, orderId: o.id, tableName: o.tableName }))
  ).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  // Summary: count of each item
  const summary: Record<string, { name: string; total: number }> = {};
  pendingItems.forEach(i => {
    if (!summary[i.menuItemId]) summary[i.menuItemId] = { name: i.menuItemName, total: 0 };
    summary[i.menuItemId].total += i.quantity;
  });

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Bếp — Món cần làm</h2>

      {Object.keys(summary).length > 0 && (
        <Card className="mb-4">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Tổng hợp</CardTitle></CardHeader>
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

      {pendingItems.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">Không có món chờ</p>
      ) : (
        <div className="space-y-2">
          {pendingItems.map(item => (
            <Card key={item.id}>
              <CardContent className="flex items-center justify-between p-3">
                <div>
                  <div className="font-medium">{item.menuItemName} × {item.quantity}</div>
                  <div className="text-xs text-muted-foreground">
                    {item.tableName} · {timeAgo(item.createdAt)}
                  </div>
                  {item.note && <div className="text-xs italic text-muted-foreground">Ghi chú: {item.note}</div>}
                </div>
                <Button size="sm" onClick={() => dispatch({ type: 'MARK_ITEM_SERVED', payload: { orderId: item.orderId, itemId: item.id } })}>
                  <Check className="h-4 w-4 mr-1" /> Đã ra
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
