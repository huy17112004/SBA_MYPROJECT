import { useState } from 'react';
import { useStore } from '@/hooks/useStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { DiningTable } from '@/types';

interface Props {
  table?: DiningTable | null;
  open: boolean;
  onClose: () => void;
}

export function TableForm({ table, open, onClose }: Props) {
  const { actions } = useStore();
  const [name, setName] = useState(table?.name || '');
  const [seats, setSeats] = useState(table?.seats?.toString() || '4');

  const handleSave = async () => {
    if (!name.trim()) return;
    if (table) {
      await actions.updateTable(table.id, { name, seats: parseInt(seats) || 4 });
    } else {
      await actions.addTable({ name, seats: parseInt(seats) || 4, status: 'empty', note: '' });
    }
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{table ? 'Sửa bàn' : 'Thêm bàn'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label>Tên bàn</Label>
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="VD: Bàn 11" />
          </div>
          <div>
            <Label>Số chỗ</Label>
            <Input type="number" value={seats} onChange={e => setSeats(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Hủy</Button>
          <Button onClick={handleSave}>Lưu</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
