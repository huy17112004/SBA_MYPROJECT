import { useState } from 'react';
import { useStore } from '@/hooks/useStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatVND } from '@/lib/format';
import { dailyRevenue } from '@/data/mockData';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';
import { DollarSign, ShoppingCart, TrendingUp } from 'lucide-react';

export function Dashboard() {
  const { state } = useStore();
  const [period, setPeriod] = useState<'7' | '30'>('7');

  const todayStr = new Date().toISOString().split('T')[0];
  const todayData = dailyRevenue.find(d => d.date === todayStr) || { revenue: 0, orders: 0 };

  // Also add real paid orders from today
  const todayPaid = state.orders.filter(o => o.status === 'paid' && o.paidAt && new Date(o.paidAt).toISOString().split('T')[0] === todayStr);
  const todayRevenue = todayData.revenue + todayPaid.reduce((s, o) => s + o.totalAmount, 0);
  const todayOrderCount = todayData.orders + todayPaid.length;

  const chartData = dailyRevenue.slice(period === '7' ? -7 : -30).map(d => ({
    ...d,
    label: d.date.slice(5), // MM-DD
    revenue: d.revenue / 1000, // show in thousands
  }));

  // Top items from paid orders
  const itemCount: Record<string, { name: string; qty: number; revenue: number }> = {};
  state.orders.filter(o => o.status === 'paid').forEach(o => {
    o.items.forEach(i => {
      if (!itemCount[i.menuItemId]) itemCount[i.menuItemId] = { name: i.menuItemName, qty: 0, revenue: 0 };
      itemCount[i.menuItemId].qty += i.quantity;
      itemCount[i.menuItemId].revenue += i.price * i.quantity;
    });
  });
  const topItems = Object.values(itemCount).sort((a, b) => b.qty - a.qty).slice(0, 10);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Thống kê</h2>
        <Select value={period} onValueChange={v => setPeriod(v as '7' | '30')}>
          <SelectTrigger className="w-[120px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="7">7 ngày</SelectItem>
            <SelectItem value="30">30 ngày</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <DollarSign className="h-8 w-8 text-primary" />
            <div>
              <div className="text-xs text-muted-foreground">Doanh thu hôm nay</div>
              <div className="text-xl font-bold">{formatVND(todayRevenue)}</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <ShoppingCart className="h-8 w-8 text-primary" />
            <div>
              <div className="text-xs text-muted-foreground">Đơn hôm nay</div>
              <div className="text-xl font-bold">{todayOrderCount}</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <TrendingUp className="h-8 w-8 text-primary" />
            <div>
              <div className="text-xs text-muted-foreground">TB/đơn</div>
              <div className="text-xl font-bold">{todayOrderCount > 0 ? formatVND(Math.round(todayRevenue / todayOrderCount)) : '0đ'}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardHeader className="pb-2"><CardTitle className="text-sm">Doanh thu (nghìn đồng)</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(v: number) => formatVND(v * 1000)} />
              <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Top món bán chạy</CardTitle></CardHeader>
        <CardContent>
          {topItems.length === 0 ? (
            <p className="text-sm text-muted-foreground">Chưa có dữ liệu</p>
          ) : (
            <div className="space-y-2">
              {topItems.map((item, i) => (
                <div key={item.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-medium w-5">{i + 1}.</span>
                    <span>{item.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-muted-foreground mr-3">{item.qty} phần</span>
                    <span className="font-medium">{formatVND(item.revenue)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
