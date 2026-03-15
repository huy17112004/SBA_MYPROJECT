import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatVND } from '@/lib/format';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { DollarSign, ShoppingCart, TrendingUp, Loader2, Download } from 'lucide-react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';

interface StatsData {
  todayRevenue: number;
  todayOrders: number;
  averagePerOrder: number;
}

interface TopItem {
  name: string;
  quantity: number;
  revenue: number;
}

interface RevenueChartData {
  date: string;
  revenue: number;
  orders: number;
}

export function Dashboard() {
  const [period, setPeriod] = useState<'7' | '30'>('7');
  const [stats, setStats] = useState<StatsData | null>(null);
  const [topItems, setTopItems] = useState<TopItem[]>([]);
  const [revenueChart, setRevenueChart] = useState<RevenueChartData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const [statsRes, topRes, chartRes] = await Promise.all([
          api.get<StatsData>('/stats/today'),
          api.get<TopItem[]>(`/stats/top-items?days=${period}`),
          api.get<RevenueChartData[]>(`/stats/revenue-chart?days=${period}`),
        ]);
        setStats(statsRes);
        setTopItems(topRes);
        setRevenueChart(chartRes);
      } catch (error) {
        console.error('Failed to fetch stats', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [period]);

  const chartData = revenueChart.map(d => ({
    label: d.date.slice(5), // MM-DD
    revenue: d.revenue / 1000, // in thousands
    orders: d.orders,
  }));

  const exportReport = () => {
    const csvRows = [
      ['Ten mon', 'So luong', 'Doanh thu'],
      ...topItems.map(item => [item.name, item.quantity, item.revenue])
    ];
    const csvContent = "\uFEFF" + csvRows.map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `bao-cao-doanh-thu-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading && !stats) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Thống kê</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={exportReport}>
            <Download className="h-4 w-4 mr-1" /> Xuất báo cáo
          </Button>
          <Select value={period} onValueChange={v => setPeriod(v as '7' | '30')}>
            <SelectTrigger className="w-[120px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="7">7 ngày qua</SelectItem>
              <SelectItem value="30">30 ngày qua</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <DollarSign className="h-8 w-8 text-primary" />
            <div>
              <div className="text-xs text-muted-foreground">Doanh thu hôm nay</div>
              <div className="text-xl font-bold">{formatVND(stats?.todayRevenue || 0)}</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <ShoppingCart className="h-8 w-8 text-primary" />
            <div>
              <div className="text-xs text-muted-foreground">Đơn hôm nay</div>
              <div className="text-xl font-bold">{stats?.todayOrders || 0}</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <TrendingUp className="h-8 w-8 text-primary" />
            <div>
              <div className="text-xs text-muted-foreground">TB/đơn</div>
              <div className="text-xl font-bold">{formatVND(stats?.averagePerOrder || 0)}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Biểu đồ doanh thu (nghìn đồng)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip 
                  formatter={(v: number) => formatVND(v * 1000)}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Xếp hạng món bán chạy</CardTitle>
        </CardHeader>
        <CardContent>
          {topItems.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">Chưa có dữ liệu</p>
          ) : (
            <div className="space-y-3">
              {topItems.map((item, i) => (
                <div key={item.name} className="flex items-center justify-between text-sm border-b pb-2 last:border-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-muted text-xs font-bold">
                      {i + 1}
                    </span>
                    <span className="font-medium">{item.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">{formatVND(item.revenue)}</div>
                    <div className="text-xs text-muted-foreground">{item.quantity} phần</div>
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
