import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/context/AppContext';
import { formatVND, cn, timeAgo } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ArrowLeft, Plus, Minus, Trash2, Search, CreditCard, Banknote, ClipboardList, ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';
import type { PaymentMethod } from '@/types';

export default function OrderPage() {
  const { tableId } = useParams<{ tableId: string }>();
  const navigate = useNavigate();
  const { tables, categories, menuItems, getActiveOrderForTable, createOrder, addItemToOrder, removeItemFromOrder, updateOrderItemQuantity, updateOrderItemNote, completePayment, cancelOrder } = useApp();

  const table = tables.find(t => t.id === tableId);
  const [search, setSearch] = useState('');
  const [activeCat, setActiveCat] = useState('all');
  const [payDialog, setPayDialog] = useState(false);
  const [noteDialog, setNoteDialog] = useState<{ orderId: string; itemId: string; note: string } | null>(null);

  const order = useMemo(() => {
    if (!tableId) return undefined;
    return getActiveOrderForTable(tableId);
  }, [tableId, getActiveOrderForTable]);

  if (!table) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">Không tìm thấy bàn</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/')}>Quay lại</Button>
      </div>
    );
  }

  const handleCreateOrder = () => {
    if (!tableId) return;
    createOrder(tableId);
    toast.success(`Đã tạo order cho ${table.name}`);
  };

  const currentOrder = order;

  const handleAddItem = (menuItem: typeof menuItems[0]) => {
    if (!menuItem.available) { toast.error('Món này đã hết hàng'); return; }
    if (!currentOrder) {
      const newOrder = createOrder(tableId!);
      addItemToOrder(newOrder.id, menuItem);
    } else {
      addItemToOrder(currentOrder.id, menuItem);
    }
    toast.success(`Đã thêm ${menuItem.name}`);
  };

  const filteredMenu = menuItems.filter(item => {
    if (search && !item.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (activeCat !== 'all' && String(item.categoryId) !== activeCat) return false;
    return true;
  });

  const handlePay = (method: PaymentMethod) => {
    if (!currentOrder) return;
    completePayment(currentOrder.id, method);
    toast.success('Thanh toán thành công! 🎉');
    setPayDialog(false);
    navigate('/');
  };

  const handleCancel = () => {
    if (!currentOrder) return;
    cancelOrder(currentOrder.id);
    toast.success('Đã hủy order');
    navigate('/');
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border bg-card flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-lg font-bold text-foreground">{table.name}</h1>
          <p className="text-xs text-muted-foreground">
            {currentOrder ? `Order #${currentOrder.id.slice(0, 5)} · ${timeAgo(currentOrder.createdAt)}` : 'Chưa có order'}
          </p>
        </div>
        {currentOrder && currentOrder.items.length > 0 && (
          <Button size="sm" onClick={() => setPayDialog(true)} className="gradient-warm border-0 text-primary-foreground">
            <CreditCard className="w-4 h-4 mr-1" /> Thanh toán
          </Button>
        )}
      </div>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Menu browser */}
        <div className="flex-1 flex flex-col overflow-hidden border-r border-border">
          <div className="p-3 space-y-3 border-b border-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Tìm món..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
              <Badge
                variant={activeCat === 'all' ? 'default' : 'secondary'}
                className="cursor-pointer whitespace-nowrap flex-shrink-0"
                onClick={() => setActiveCat('all')}
              >Tất cả</Badge>
              {categories.map(c => (
                <Badge
                  key={c.id}
                  variant={activeCat === String(c.id) ? 'default' : 'secondary'}
                  className="cursor-pointer whitespace-nowrap flex-shrink-0"
                  onClick={() => setActiveCat(String(c.id))}
                >{c.name}</Badge>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {filteredMenu.map(item => (
                <motion.button
                  key={item.id}
                  whileTap={{ scale: 0.95 }}
                  className={cn(
                    'p-3 rounded-xl text-left transition-all border border-border hover:shadow-card',
                    item.available ? 'bg-card hover:border-primary/30' : 'bg-muted opacity-50 cursor-not-allowed'
                  )}
                  onClick={() => handleAddItem(item)}
                  disabled={!item.available}
                >
                  <p className="font-medium text-sm text-foreground truncate">{item.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{categories.find(c => c.id === item.categoryId)?.name}</p>
                  <p className="text-sm font-bold text-primary mt-1">{formatVND(item.price)}</p>
                  {!item.available && <Badge variant="destructive" className="text-[10px] mt-1">Hết hàng</Badge>}
                </motion.button>
              ))}
            </div>
          </div>
        </div>

        {/* Order summary */}
        <div className="lg:w-96 flex flex-col bg-card border-t lg:border-t-0">
          <div className="p-3 border-b border-border">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-foreground flex items-center gap-2">
                <ClipboardList className="w-4 h-4" /> Order
              </h3>
              {currentOrder && (
                <Button variant="ghost" size="sm" className="text-destructive text-xs" onClick={handleCancel}>Hủy order</Button>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {!currentOrder || currentOrder.items.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingBag className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Chọn món từ menu để bắt đầu</p>
                {!currentOrder && (
                  <Button variant="outline" size="sm" className="mt-3" onClick={handleCreateOrder}>Tạo order mới</Button>
                )}
              </div>
            ) : (
              <AnimatePresence>
                {currentOrder.items.map(item => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50 border border-border/50"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-foreground truncate">{item.menuItemName}</p>
                      <p className="text-xs text-primary font-semibold">{formatVND(item.priceAtTime)}</p>
                      {item.note && <p className="text-[11px] text-muted-foreground italic mt-0.5">📝 {item.note}</p>}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Button
                        variant="outline" size="icon"
                        className="w-7 h-7"
                        onClick={() => updateOrderItemQuantity(currentOrder.id, item.id, item.quantity - 1)}
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                      <span className="w-8 text-center font-bold text-sm text-foreground">{item.quantity}</span>
                      <Button
                        variant="outline" size="icon"
                        className="w-7 h-7"
                        onClick={() => updateOrderItemQuantity(currentOrder.id, item.id, item.quantity + 1)}
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                    <div className="flex flex-col gap-1">
                      <button
                        onClick={() => setNoteDialog({ orderId: currentOrder.id, itemId: item.id, note: item.note || '' })}
                        className="text-xs text-muted-foreground hover:text-foreground"
                      >📝</button>
                      <button
                        onClick={() => removeItemFromOrder(currentOrder.id, item.id)}
                        className="text-xs text-destructive hover:text-destructive/80"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>

          {currentOrder && currentOrder.items.length > 0 && (
            <div className="p-4 border-t border-border space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Tổng ({currentOrder.items.reduce((s, i) => s + i.quantity, 0)} món)</span>
                <span className="text-xl font-bold text-primary">{formatVND(currentOrder.total)}</span>
              </div>
              <Button className="w-full gradient-warm border-0 text-primary-foreground h-12 text-base font-semibold" onClick={() => setPayDialog(true)}>
                <CreditCard className="w-5 h-5 mr-2" /> Thanh toán {formatVND(currentOrder.total)}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Payment Dialog */}
      <Dialog open={payDialog} onOpenChange={setPayDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Thanh toán — {table.name}</DialogTitle>
          </DialogHeader>
          {currentOrder && (
            <div className="space-y-4">
              <div className="bg-secondary/50 rounded-xl p-4 space-y-2">
                {currentOrder.items.map(item => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-foreground">{item.menuItemName} x{item.quantity}</span>
                    <span className="font-medium text-foreground">{formatVND(item.priceAtTime * item.quantity)}</span>
                  </div>
                ))}
                <div className="border-t border-border pt-2 mt-2 flex justify-between">
                  <span className="font-bold text-foreground">Tổng cộng</span>
                  <span className="font-bold text-primary text-lg">{formatVND(currentOrder.total)}</span>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">Phương thức thanh toán</p>
                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" className="h-16 flex-col gap-1" onClick={() => handlePay('cash')}>
                    <Banknote className="w-6 h-6 text-status-available" />
                    <span>Tiền mặt</span>
                  </Button>
                  <Button variant="outline" className="h-16 flex-col gap-1" onClick={() => handlePay('transfer')}>
                    <CreditCard className="w-6 h-6 text-primary" />
                    <span>Chuyển khoản</span>
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Note Dialog */}
      <Dialog open={!!noteDialog} onOpenChange={() => setNoteDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ghi chú cho món</DialogTitle>
          </DialogHeader>
          {noteDialog && (
            <Textarea
              value={noteDialog.note}
              onChange={e => setNoteDialog({ ...noteDialog, note: e.target.value })}
              placeholder="VD: ít đá, không đường, cay nhiều..."
              rows={3}
            />
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setNoteDialog(null)}>Hủy</Button>
            <Button onClick={() => {
              if (noteDialog) {
                updateOrderItemNote(noteDialog.orderId, noteDialog.itemId, noteDialog.note);
                toast.success('Đã cập nhật ghi chú');
                setNoteDialog(null);
              }
            }}>Lưu</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
