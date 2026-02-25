import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/context/AppContext';
import { formatVND, cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Plus, Pencil, Trash2, Search, UtensilsCrossed, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { MenuItem, Category } from '@/types';

export default function MenuPage() {
  const {
    categories, menuItems, loading,
    addCategory, updateCategory, deleteCategory,
    addMenuItem, updateMenuItem, deleteMenuItem, toggleMenuItemAvailability,
  } = useApp();

  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [itemDialog, setItemDialog] = useState(false);
  const [catDialog, setCatDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [editingCat, setEditingCat] = useState<Category | null>(null);
  const [form, setForm] = useState({ name: '', price: '', categoryId: '', description: '' });
  const [catForm, setCatForm] = useState({ name: '' });
  const [saving, setSaving] = useState(false);

  const filtered = menuItems.filter(item => {
    if (search && !item.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterCat !== 'all' && String(item.categoryId) !== filterCat) return false;
    if (filterStatus === 'available' && !item.available) return false;
    if (filterStatus === 'unavailable' && item.available) return false;
    return true;
  });

  const openItemDialog = (item?: MenuItem) => {
    if (item) {
      setEditingItem(item);
      setForm({ name: item.name, price: item.price.toString(), categoryId: String(item.categoryId), description: item.description || '' });
    } else {
      setEditingItem(null);
      setForm({ name: '', price: '', categoryId: categories[0] ? String(categories[0].id) : '', description: '' });
    }
    setItemDialog(true);
  };

  const saveItem = async () => {
    if (!form.name || !form.price || !form.categoryId) {
      toast.error('Vui lòng điền đầy đủ thông tin');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        price: parseInt(form.price),
        categoryId: parseInt(form.categoryId),
        description: form.description || undefined,
      };
      if (editingItem) {
        await updateMenuItem(editingItem.id, { ...payload, available: editingItem.available });
        toast.success('Đã cập nhật món');
      } else {
        await addMenuItem({ ...payload, available: true });
        toast.success('Đã thêm món mới');
      }
      setItemDialog(false);
    } catch (err: any) {
      toast.error(err.message || 'Có lỗi xảy ra');
    } finally {
      setSaving(false);
    }
  };

  const openCatDialog = (cat?: Category) => {
    if (cat) {
      setEditingCat(cat);
      setCatForm({ name: cat.name });
    } else {
      setEditingCat(null);
      setCatForm({ name: '' });
    }
    setCatDialog(true);
  };

  const saveCat = async () => {
    if (!catForm.name) { toast.error('Vui lòng nhập tên loại'); return; }
    setSaving(true);
    try {
      if (editingCat) {
        await updateCategory(editingCat.id, { name: catForm.name });
        toast.success('Đã cập nhật loại');
      } else {
        await addCategory({ name: catForm.name });
        toast.success('Đã thêm loại mới');
      }
      setCatDialog(false);
    } catch (err: any) {
      toast.error(err.message || 'Có lỗi xảy ra');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteItem = async (id: number) => {
    try {
      await deleteMenuItem(id);
      toast.success('Đã xóa món');
    } catch (err: any) {
      toast.error(err.message || 'Không thể xóa món');
    }
  };

  const handleDeleteCat = async (id: number) => {
    const hasItems = menuItems.some(m => m.categoryId === id);
    if (hasItems) { toast.error('Không thể xóa loại đang có món'); return; }
    try {
      await deleteCategory(id);
      toast.success('Đã xóa loại');
    } catch (err: any) {
      toast.error(err.message || 'Không thể xóa loại');
    }
  };

  const handleToggle = async (item: MenuItem) => {
    try {
      await toggleMenuItemAvailability(item.id);
      toast.success(item.available ? 'Đã đánh dấu hết hàng' : 'Đã đánh dấu còn hàng');
    } catch (err: any) {
      toast.error(err.message || 'Không thể cập nhật');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-3 text-muted-foreground">Đang tải menu...</span>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Quản lý Menu</h1>
          <p className="text-sm text-muted-foreground mt-1">{menuItems.length} món · {categories.length} loại</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => openCatDialog()}>
            <Plus className="w-4 h-4 mr-1" /> Loại
          </Button>
          <Button size="sm" onClick={() => openItemDialog()}>
            <Plus className="w-4 h-4 mr-1" /> Thêm món
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Tìm món..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
        </div>
        <Select value={filterCat} onValueChange={setFilterCat}>
          <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả loại</SelectItem>
            {categories.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value="available">Còn hàng</SelectItem>
            <SelectItem value="unavailable">Hết hàng</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Categories */}
      <div>
        <h3 className="text-sm font-semibold text-muted-foreground mb-3">LOẠI MÓN</h3>
        <div className="flex flex-wrap gap-2">
          {categories.map(cat => (
            <Badge
              key={cat.id}
              variant="secondary"
              className="px-3 py-2 text-sm cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors group"
              onClick={() => setFilterCat(filterCat === String(cat.id) ? 'all' : String(cat.id))}
            >
              {cat.name}
              <span className="ml-2 text-muted-foreground group-hover:text-primary-foreground/70">
                ({menuItems.filter(m => m.categoryId === cat.id).length})
              </span>
              <button onClick={(e) => { e.stopPropagation(); openCatDialog(cat); }} className="ml-1 opacity-0 group-hover:opacity-100">
                <Pencil className="w-3 h-3" />
              </button>
              <button onClick={(e) => { e.stopPropagation(); handleDeleteCat(cat.id); }} className="ml-1 opacity-0 group-hover:opacity-100">
                <Trash2 className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
      </div>

      {/* Menu Items Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        <AnimatePresence>
          {filtered.map(item => {
            const cat = categories.find(c => c.id === item.categoryId);
            return (
              <motion.div key={item.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }}>
                <Card className={cn('shadow-card border-border/50 transition-all hover:shadow-elevated', !item.available && 'opacity-60')}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground truncate">{item.name}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">{item.categoryName || cat?.name}</p>
                      </div>
                      <div className="flex items-center gap-1 ml-2">
                        <button onClick={() => openItemDialog(item)} className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
                          <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
                        </button>
                        <button onClick={() => handleDeleteItem(item.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors">
                          <Trash2 className="w-3.5 h-3.5 text-destructive" />
                        </button>
                      </div>
                    </div>
                    {item.description && <p className="text-xs text-muted-foreground mb-3">{item.description}</p>}
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-primary">{formatVND(item.price)}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">{item.available ? 'Còn hàng' : 'Hết hàng'}</span>
                        <Switch checked={item.available} onCheckedChange={() => handleToggle(item)} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <UtensilsCrossed className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground">Không tìm thấy món nào</p>
        </div>
      )}

      {/* Add/Edit Item Dialog */}
      <Dialog open={itemDialog} onOpenChange={setItemDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Sửa món' : 'Thêm món mới'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Tên món</Label>
              <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="VD: Trà đá" />
            </div>
            <div>
              <Label>Giá (VNĐ)</Label>
              <Input type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} placeholder="VD: 5000" />
            </div>
            <div>
              <Label>Loại</Label>
              <Select value={form.categoryId} onValueChange={v => setForm({ ...form, categoryId: v })}>
                <SelectTrigger><SelectValue placeholder="Chọn loại" /></SelectTrigger>
                <SelectContent>
                  {categories.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Mô tả</Label>
              <Input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Mô tả ngắn..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setItemDialog(false)}>Hủy</Button>
            <Button onClick={saveItem} disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 mr-1 animate-spin" />}
              {editingItem ? 'Cập nhật' : 'Thêm'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add/Edit Category Dialog */}
      <Dialog open={catDialog} onOpenChange={setCatDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCat ? 'Sửa loại' : 'Thêm loại mới'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Tên loại</Label>
              <Input value={catForm.name} onChange={e => setCatForm({ ...catForm, name: e.target.value })} placeholder="VD: Đồ uống" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCatDialog(false)}>Hủy</Button>
            <Button onClick={saveCat} disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 mr-1 animate-spin" />}
              {editingCat ? 'Cập nhật' : 'Thêm'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
