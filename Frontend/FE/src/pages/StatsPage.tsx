import { useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { formatVND } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid } from 'recharts';
import { BarChart3, TrendingUp, Award, DollarSign } from 'lucide-react';

const COLORS = ['hsl(32, 95%, 44%)', 'hsl(158, 64%, 36%)', 'hsl(0, 84%, 60%)', 'hsl(38, 92%, 50%)', 'hsl(199, 89%, 48%)', 'hsl(270, 60%, 50%)'];

export default function StatsPage() {
  const { orders, menuItems } = useApp();
  const completedOrders = orders.filter(o => o.status === 'completed');

  const todayRevenue = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return completedOrders
      .filter(o => o.completedAt && o.completedAt >= today)
      .reduce((sum, o) => sum + o.total, 0);
  }, [completedOrders]);

  const totalRevenue = completedOrders.reduce((sum, o) => sum + o.total, 0);

  // Top selling items
  const topItems = useMemo(() => {
    const itemCount: Record<string, { name: string; quantity: number; revenue: number }> = {};
    completedOrders.forEach(o => {
      o.items.forEach(item => {
        if (!itemCount[item.menuItemId]) {
          itemCount[item.menuItemId] = { name: item.menuItemName, quantity: 0, revenue: 0 };
        }
        itemCount[item.menuItemId].quantity += item.quantity;
        itemCount[item.menuItemId].revenue += item.priceAtTime * item.quantity;
      });
    });
    return Object.values(itemCount).sort((a, b) => b.quantity - a.quantity).slice(0, 6);
  }, [completedOrders]);

  // Revenue by hour
  const hourlyData = useMemo(() => {
    const hours: Record<number, number> = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    completedOrders
      .filter(o => o.completedAt && o.completedAt >= today)
      .forEach(o => {
        const hour = o.completedAt!.getHours();
        hours[hour] = (hours[hour] || 0) + o.total;
      });
    return Array.from({ length: 24 }, (_, i) => ({
      hour: `${i}h`,
      revenue: hours[i] || 0,
    })).filter(d => d.revenue > 0 || (d.hour >= '6h' && d.hour <= '23h'));
  }, [completedOrders]);

  // Payment method distribution
  const paymentData = useMemo(() => {
    const cash = completedOrders.filter(o => o.paymentMethod === 'cash').length;
    const transfer = completedOrders.filter(o => o.paymentMethod === 'transfer').length;
    return [
      { name: 'Tiền mặt', value: cash },
      { name: 'Chuyển khoản', value: transfer },
    ].filter(d => d.value > 0);
  }, [completedOrders]);

  const stats = [
    { label: 'Doanh thu hôm nay', value: formatVND(todayRevenue), icon: DollarSign },
    { label: 'Tổng doanh thu', value: formatVND(totalRevenue), icon: TrendingUp },
    { label: 'Tổng đơn', value: completedOrders.length.toString(), icon: BarChart3 },
    { label: 'TB/đơn', value: completedOrders.length ? formatVND(Math.round(totalRevenue / completedOrders.length)) : '0₫', icon: Award },
  ];

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Thống kê</h1>
        <p className="text-sm text-muted-foreground mt-1">Tổng quan kinh doanh</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card className="shadow-card border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <stat.icon className="w-4 h-4 text-primary" />
                  <span className="text-xs text-muted-foreground">{stat.label}</span>
                </div>
                <p className="text-xl font-bold text-foreground">{stat.value}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {completedOrders.length === 0 ? (
        <div className="text-center py-16">
          <BarChart3 className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4" />
          <p className="text-lg text-muted-foreground">Chưa có dữ liệu</p>
          <p className="text-sm text-muted-foreground/60">Hoàn thành order đầu tiên để xem thống kê</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue by hour */}
          {hourlyData.length > 0 && (
            <Card className="shadow-card border-border/50">
              <CardContent className="p-4">
                <h3 className="font-bold text-foreground mb-4">Doanh thu theo giờ</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={hourlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="hour" fontSize={12} stroke="hsl(var(--muted-foreground))" />
                    <YAxis fontSize={12} stroke="hsl(var(--muted-foreground))" tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                    <Tooltip formatter={(v: number) => formatVND(v)} />
                    <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: 'hsl(var(--primary))' }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Top items */}
          {topItems.length > 0 && (
            <Card className="shadow-card border-border/50">
              <CardContent className="p-4">
                <h3 className="font-bold text-foreground mb-4">Món bán chạy</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={topItems} layout="vertical">
                    <XAxis type="number" fontSize={12} stroke="hsl(var(--muted-foreground))" />
                    <YAxis type="category" dataKey="name" fontSize={12} stroke="hsl(var(--muted-foreground))" width={100} />
                    <Tooltip formatter={(v: number) => `${v} phần`} />
                    <Bar dataKey="quantity" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Payment distribution */}
          {paymentData.length > 0 && (
            <Card className="shadow-card border-border/50">
              <CardContent className="p-4">
                <h3 className="font-bold text-foreground mb-4">Phương thức thanh toán</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={paymentData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value" label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}>
                      {paymentData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
