import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useApp } from '@/context/AppContext';
import { formatVND } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DollarSign, ShoppingBag, Armchair, Clock } from 'lucide-react';
import type { TableStatus } from '@/types';

const statusConfig: Record<TableStatus, { label: string; color: string; bgClass: string }> = {
  AVAILABLE: { label: 'Trống', color: 'text-status-available', bgClass: 'bg-status-available/10 border-status-available/30' },
  OCCUPIED: { label: 'Có khách', color: 'text-status-occupied', bgClass: 'bg-status-occupied/10 border-status-occupied/30' },
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { tables, getTodayRevenue, getTodayOrderCount, getActiveOrders } = useApp();
  const activeOrders = getActiveOrders();
  const occupiedTables = tables.filter(t => t.status !== 'AVAILABLE').length;

  const stats = [
    { label: 'Doanh thu hôm nay', value: formatVND(getTodayRevenue()), icon: DollarSign, accent: 'gradient-warm' },
    { label: 'Đơn hoàn thành', value: getTodayOrderCount().toString(), icon: ShoppingBag, accent: 'gradient-success' },
    { label: 'Bàn đang dùng', value: `${occupiedTables}/${tables.length}`, icon: Armchair, accent: 'bg-status-waiting' },
    { label: 'Order đang chờ', value: activeOrders.length.toString(), icon: Clock, accent: 'bg-status-occupied' },
  ];

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Tổng quan</h1>
        <p className="text-muted-foreground text-sm mt-1">Chào mừng đến QuanNuoc! Quản lý quán nước của bạn.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        {stats.map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card className="shadow-card border-border/50 overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground font-medium">{stat.label}</p>
                    <p className="text-xl lg:text-2xl font-bold text-foreground">{stat.value}</p>
                  </div>
                  <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', stat.accent)}>
                    <stat.icon className="w-5 h-5 text-primary-foreground" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Table Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-foreground">Sơ đồ bàn</h2>
          <div className="flex gap-3 text-xs">
            {Object.entries(statusConfig).map(([key, cfg]) => (
              <span key={key} className={cn('flex items-center gap-1.5', cfg.color)}>
                <span className={cn('w-2.5 h-2.5 rounded-full', key === 'AVAILABLE' ? 'bg-status-available' : 'bg-status-occupied')} />
                {cfg.label}
              </span>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 lg:gap-4">
          {tables.map((table, i) => {
            const cfg = statusConfig[table.status];
            return (
              <motion.div
                key={table.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card
                  className={cn(
                    'cursor-pointer transition-all duration-200 hover:shadow-elevated hover:scale-[1.02] border-2',
                    cfg.bgClass,
                    table.status === 'OCCUPIED' && 'animate-pulse-soft'
                  )}
                  onClick={() => navigate(`/order/${table.id}`)}
                >
                  <CardContent className="p-4 text-center space-y-2">
                    <div className={cn('text-3xl lg:text-4xl')}>
                      {table.status === 'AVAILABLE' ? '🪑' : '🍽️'}
                    </div>
                    <h3 className="font-bold text-foreground text-base">{table.name}</h3>
                    <Badge variant="outline" className={cn('text-xs border-0', cfg.color, cfg.bgClass)}>
                      {cfg.label}
                    </Badge>
                    <p className="text-[11px] text-muted-foreground">{table.seats} ghế</p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
