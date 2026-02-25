import { useApp } from '@/context/AppContext';
import { formatVND, timeAgo, cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ChefHat, Clock, AlertTriangle } from 'lucide-react';

export default function KitchenPage() {
  const { getActiveOrders, markItemServed } = useApp();
  const activeOrders = getActiveOrders();

  const getWaitMinutes = (date: Date) => Math.floor((Date.now() - date.getTime()) / 60000);

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Bếp — Ưu tiên phục vụ</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {activeOrders.length} order đang chờ · Sắp xếp theo thời gian gọi
        </p>
      </div>

      {activeOrders.length === 0 ? (
        <div className="text-center py-16">
          <ChefHat className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4" />
          <p className="text-lg text-muted-foreground">Không có order nào đang chờ</p>
          <p className="text-sm text-muted-foreground/60">Khi có khách gọi món, order sẽ hiện ở đây</p>
        </div>
      ) : (
        <div className="space-y-4">
          {activeOrders.map((order, i) => {
            const waitMin = getWaitMinutes(order.createdAt);
            const isUrgent = waitMin >= 20;
            const allServed = order.items.every(item => item.served);

            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className={cn(
                  'shadow-card border-2 transition-all',
                  isUrgent ? 'border-status-occupied/40 bg-status-occupied/5' : 'border-border/50',
                  allServed && 'border-status-available/40 bg-status-available/5'
                )}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{isUrgent ? '🔥' : '🍽️'}</span>
                        <div>
                          <h3 className="font-bold text-foreground">{order.tableName}</h3>
                          <p className="text-xs text-muted-foreground">Order #{order.id.slice(0, 5)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {isUrgent && (
                          <Badge variant="destructive" className="animate-pulse-soft">
                            <AlertTriangle className="w-3 h-3 mr-1" /> Chờ lâu!
                          </Badge>
                        )}
                        <Badge variant="outline" className={cn(
                          'flex items-center gap-1',
                          isUrgent ? 'text-status-occupied border-status-occupied/30' : 'text-muted-foreground'
                        )}>
                          <Clock className="w-3 h-3" />
                          {waitMin < 1 ? 'Vừa xong' : `${waitMin} phút`}
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {order.items.map(item => (
                        <div
                          key={item.id}
                          className={cn(
                            'flex items-center gap-3 p-2.5 rounded-lg transition-colors',
                            item.served ? 'bg-status-available/10' : 'bg-secondary/50'
                          )}
                        >
                          <Checkbox
                            checked={item.served}
                            onCheckedChange={() => markItemServed(order.id, item.id)}
                          />
                          <div className="flex-1 min-w-0">
                            <p className={cn('text-sm font-medium', item.served && 'line-through text-muted-foreground')}>
                              {item.menuItemName}
                            </p>
                            {item.note && <p className="text-[11px] text-muted-foreground italic">📝 {item.note}</p>}
                          </div>
                          <Badge variant="secondary" className="text-xs">x{item.quantity}</Badge>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-between items-center mt-3 pt-3 border-t border-border/50">
                      <span className="text-sm text-muted-foreground">
                        {order.items.filter(i => i.served).length}/{order.items.length} đã phục vụ
                      </span>
                      <span className="text-sm font-bold text-primary">{formatVND(order.total)}</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
