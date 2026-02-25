import { useState } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '@/context/AppContext';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Pencil, Trash2, Armchair } from 'lucide-react';
import { toast } from 'sonner';
import type { DiningTable, TableStatus } from '@/types';

const statusConfig: Record<TableStatus, { label: string; emoji: string; colorClass: string }> = {
  available: { label: 'Trống', emoji: '🟢', colorClass: 'bg-status-available/10 border-status-available/30 text-status-available' },
  occupied: { label: 'Có khách', emoji: '🔴', colorClass: 'bg-status-occupied/10 border-status-occupied/30 text-status-occupied' },
  waiting: { label: 'Chờ thanh toán', emoji: '🟡', colorClass: 'bg-status-waiting/10 border-status-waiting/30 text-status-waiting' },
};

export default function TablesPage() {
  const { tables, addTable, updateTable, deleteTable, getActiveOrderForTable } = useApp();
  const [dialog, setDialog] = useState(false);
  const [editing, setEditing] = useState<DiningTable | null>(null);
  const [form, setForm] = useState({ name: '', seats: '4', status: 'available' as TableStatus });

  const openDialog = (table?: DiningTable) => {
    if (table) {
      setEditing(table);
      setForm({ name: table.name, seats: table.seats.toString(), status: table.status });
    } else {
      setEditing(null);
      setForm({ name: `Bàn ${tables.length + 1}`, seats: '4', status: 'available' });
    }
    setDialog(true);
  };

  const save = () => {
    if (!form.name) { toast.error('Vui lòng nhập tên bàn'); return; }
    if (editing) {
      updateTable(editing.id, { name: form.name, seats: parseInt(form.seats), status: form.status });
      toast.success('Đã cập nhật bàn');
    } else {
      addTable({ name: form.name, seats: parseInt(form.seats), status: form.status });
      toast.success('Đã thêm bàn mới');
    }
    setDialog(false);
  };

  const handleDelete = (table: DiningTable) => {
    if (table.status !== 'available') { toast.error('Không thể xóa bàn đang có khách'); return; }
    deleteTable(table.id);
    toast.success('Đã xóa bàn');
  };

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Quản lý Bàn</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {tables.length} bàn · {tables.filter(t => t.status === 'available').length} trống
          </p>
        </div>
        <Button size="sm" onClick={() => openDialog()}>
          <Plus className="w-4 h-4 mr-1" /> Thêm bàn
        </Button>
      </div>

      {/* Legend */}
      <div className="flex gap-4 text-sm">
        {Object.entries(statusConfig).map(([key, cfg]) => (
          <span key={key} className="flex items-center gap-1.5">
            <span>{cfg.emoji}</span>
            <span className="text-muted-foreground">{cfg.label}</span>
          </span>
        ))}
      </div>

      {/* Table Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {tables.map((table, i) => {
          const cfg = statusConfig[table.status];
          const order = getActiveOrderForTable(table.id);
          return (
            <motion.div key={table.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className={cn('shadow-card border-2 transition-all hover:shadow-elevated', cfg.colorClass.split(' ').slice(0, 2).join(' '))}>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-foreground">{table.name}</h3>
                    <div className="flex gap-1">
                      <button onClick={() => openDialog(table)} className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
                        <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
                      </button>
                      <button onClick={() => handleDelete(table)} className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors">
                        <Trash2 className="w-3.5 h-3.5 text-destructive" />
                      </button>
                    </div>
                  </div>

                  <div className="text-center py-2">
                    <Armchair className={cn('w-10 h-10 mx-auto', table.status === 'available' ? 'text-status-available' : table.status === 'occupied' ? 'text-status-occupied' : 'text-status-waiting')} />
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <Badge variant="outline" className={cn('text-xs', cfg.colorClass)}>
                      {cfg.emoji} {cfg.label}
                    </Badge>
                    <span className="text-muted-foreground text-xs">{table.seats} ghế</span>
                  </div>

                  {order && (
                    <p className="text-xs text-muted-foreground">{order.items.length} món · {order.items.reduce((s, i) => s + i.quantity, 0)} phần</p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {tables.length === 0 && (
        <div className="text-center py-12">
          <Armchair className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground">Chưa có bàn nào. Thêm bàn để bắt đầu!</p>
        </div>
      )}

      {/* Dialog */}
      <Dialog open={dialog} onOpenChange={setDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'Sửa bàn' : 'Thêm bàn mới'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Tên bàn</Label>
              <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <Label>Số ghế</Label>
              <Input type="number" value={form.seats} onChange={e => setForm({ ...form, seats: e.target.value })} />
            </div>
            {editing && (
              <div>
                <Label>Trạng thái</Label>
                <Select value={form.status} onValueChange={v => setForm({ ...form, status: v as TableStatus })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(statusConfig).map(([key, cfg]) => (
                      <SelectItem key={key} value={key}>{cfg.emoji} {cfg.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialog(false)}>Hủy</Button>
            <Button onClick={save}>{editing ? 'Cập nhật' : 'Thêm'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
