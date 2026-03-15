import { useState } from 'react';
import { useStore } from '@/hooks/useStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { formatVND } from '@/lib/format';
import { MenuItem } from '@/types';
import { Plus, Search, Pencil, Trash2 } from 'lucide-react';

export function MenuList() {
  const { state, actions } = useStore();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [editItem, setEditItem] = useState<MenuItem | null>(null);
  const [showForm, setShowForm] = useState(false);

  const filtered = state.menuItems.filter(m => {
    if (search && !m.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (categoryFilter !== 'all' && String(m.categoryId) !== String(categoryFilter)) return false;
    return true;
  });

  const getCategoryName = (id: string | number) => state.categories.find(c => c.id === id)?.name || '';

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Quản lý Menu</h2>
        <Button size="sm" onClick={() => { setEditItem(null); setShowForm(true); }}>
          <Plus className="h-4 w-4 mr-1" /> Thêm món
        </Button>
      </div>

      <div className="flex gap-2 mb-4 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input className="pl-8" placeholder="Tìm món..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            {state.categories.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map(item => (
          <Card key={item.id} className={!item.available ? 'opacity-60' : ''}>
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <CardTitle className="text-base">{item.name}</CardTitle>
                <Badge variant={item.available ? 'default' : 'secondary'}>
                  {item.available ? 'Còn hàng' : 'Hết hàng'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-1">{item.description}</p>
              <p className="text-xs text-muted-foreground mb-2">{getCategoryName(item.categoryId)}</p>
              <div className="flex items-center justify-between">
                <span className="font-semibold">{formatVND(item.price)}</span>
                <div className="flex gap-1">
                  <Switch
                    checked={item.available}
                    onCheckedChange={() => actions.toggleMenuItemAvailable(item.id)}
                  />
                  <Button variant="ghost" size="icon" onClick={() => { setEditItem(item); setShowForm(true); }}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => {
                    if (confirm(`Bạn chắc chắn muốn xóa món ${item.name}?`)) {
                      actions.deleteMenuItem(item.id);
                    }
                  }}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {showForm && <MenuItemFormDialog item={editItem} onClose={() => setShowForm(false)} />}
    </div>
  );
}

function MenuItemFormDialog({ item, onClose }: { item: MenuItem | null; onClose: () => void }) {
  const { state, actions } = useStore();
  const [name, setName] = useState(item?.name || '');
  const [price, setPrice] = useState(item?.price?.toString() || '');
  const [categoryId, setCategoryId] = useState(item?.categoryId?.toString() || state.categories[0]?.id?.toString() || '');
  const [description, setDescription] = useState(item?.description || '');

  const handleSave = async () => {
    if (!name.trim() || !price) return;
    const data = { name, price: parseInt(price), categoryId: parseInt(categoryId), description, available: item?.available ?? true };
    if (item) {
      await actions.updateMenuItem(item.id, data);
    } else {
      await actions.addMenuItem(data);
    }
    onClose();
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader><DialogTitle>{item ? 'Sửa món' : 'Thêm món mới'}</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div><Label>Tên món</Label><Input value={name} onChange={e => setName(e.target.value)} /></div>
          <div><Label>Giá (VNĐ)</Label><Input type="number" value={price} onChange={e => setPrice(e.target.value)} /></div>
          <div>
            <Label>Danh mục</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {state.categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div><Label>Mô tả</Label><Textarea value={description} onChange={e => setDescription(e.target.value)} /></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Hủy</Button>
          <Button onClick={handleSave}>Lưu</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
