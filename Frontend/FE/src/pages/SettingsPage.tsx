import { AppLayout } from '@/components/layout/AppLayout';
import { useStore } from '@/hooks/useStore';
import { TableForm } from '@/components/tables/TableForm';
import { CategoryManager } from '@/components/menu/CategoryManager';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { DiningTable } from '@/types';
import { Pencil, Trash2, Plus } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function SettingsPage() {
  const { state, dispatch } = useStore();
  const [editTable, setEditTable] = useState<DiningTable | null>(null);
  const [showTableForm, setShowTableForm] = useState(false);

  return (
    <AppLayout>
      <h2 className="text-lg font-semibold mb-4">Cài đặt</h2>

      <div className="mb-6">
        <Card>
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <Label className="text-base">Chế độ tối</Label>
              <p className="text-xs text-muted-foreground">Giao diện tối cho ban đêm</p>
            </div>
            <Switch checked={state.darkMode} onCheckedChange={() => dispatch({ type: 'TOGGLE_DARK_MODE' })} />
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="tables">
        <TabsList>
          <TabsTrigger value="tables">Quản lý bàn</TabsTrigger>
          <TabsTrigger value="categories">Danh mục</TabsTrigger>
        </TabsList>
        <TabsContent value="tables">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium">Danh sách bàn</h3>
            <Button size="sm" onClick={() => { setEditTable(null); setShowTableForm(true); }}>
              <Plus className="h-4 w-4 mr-1" /> Thêm bàn
            </Button>
          </div>
          <div className="space-y-2">
            {state.tables.map(t => (
              <Card key={t.id}>
                <CardContent className="flex items-center justify-between p-3">
                  <div>
                    <div className="font-medium">{t.name}</div>
                    <div className="text-xs text-muted-foreground">{t.seats} chỗ</div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => { setEditTable(t); setShowTableForm(true); }}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon"
                      disabled={t.status !== 'empty'}
                      onClick={() => dispatch({ type: 'DELETE_TABLE', payload: t.id })}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          {showTableForm && (
            <TableForm table={editTable} open={showTableForm} onClose={() => setShowTableForm(false)} />
          )}
        </TabsContent>
        <TabsContent value="categories">
          <CategoryManager />
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
}
