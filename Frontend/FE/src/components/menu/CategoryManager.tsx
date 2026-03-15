import { useState } from 'react';
import { useStore } from '@/hooks/useStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Pencil, Trash2, Plus } from 'lucide-react';
import { Category } from '@/types';

export function CategoryManager() {
  const { state, actions } = useStore();
  const [editCat, setEditCat] = useState<Category | null>(null);
  const [showForm, setShowForm] = useState(false);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Danh mục</h2>
        <Button size="sm" onClick={() => { setEditCat(null); setShowForm(true); }}>
          <Plus className="h-4 w-4 mr-1" /> Thêm
        </Button>
      </div>
      <div className="space-y-2">
        {state.categories.map(c => (
          <Card key={c.id}>
            <CardContent className="flex items-center justify-between p-3">
              <div>
                <div className="font-medium">{c.name}</div>
                <div className="text-xs text-muted-foreground">{c.description}</div>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" onClick={() => { setEditCat(c); setShowForm(true); }}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => {
                  if (confirm(`Bạn chắc chắn muốn xóa danh mục ${c.name}?`)) {
                    actions.deleteCategory(c.id);
                  }
                }}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {showForm && <CategoryFormDialog category={editCat} onClose={() => setShowForm(false)} />}
    </div>
  );
}

function CategoryFormDialog({ category, onClose }: { category: Category | null; onClose: () => void }) {
  const { actions } = useStore();
  const [name, setName] = useState(category?.name || '');
  const [description, setDescription] = useState(category?.description || '');

  const handleSave = async () => {
    if (!name.trim()) return;
    if (category) {
      await actions.updateCategory(category.id, { name, description });
    } else {
      await actions.addCategory({ name, description });
    }
    onClose();
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader><DialogTitle>{category ? 'Sửa danh mục' : 'Thêm danh mục'}</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div><Label>Tên</Label><Input value={name} onChange={e => setName(e.target.value)} /></div>
          <div><Label>Mô tả</Label><Input value={description} onChange={e => setDescription(e.target.value)} /></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Hủy</Button>
          <Button onClick={handleSave}>Lưu</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
