import { useState } from 'react';
import { useStore } from '@/hooks/useStore';
import { Order } from '@/types';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { formatVND } from '@/lib/format';
import { Banknote, CreditCard } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  order: Order;
  onClose: () => void;
}

export function PaymentDialog({ order, onClose }: Props) {
  const { actions } = useStore();
  const [method, setMethod] = useState<'cash' | 'transfer'>('cash');

  const handlePay = async () => {
    await actions.payOrder(order.id, method);
    toast.success(`Đã thanh toán ${formatVND(order.totalAmount)} - ${order.tableName}`);
    onClose();
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Thanh toán - {order.tableName}</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1">
            {order.items.map(item => (
              <div key={item.id} className="flex justify-between text-sm">
                <span>{item.menuItemName} × {item.quantity}</span>
                <span>{formatVND(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-between font-semibold text-lg border-t pt-2">
            <span>Tổng cộng</span>
            <span>{formatVND(order.totalAmount)}</span>
          </div>
          <div className="flex gap-2">
            <Button
              variant={method === 'cash' ? 'default' : 'outline'}
              className="flex-1"
              onClick={() => setMethod('cash')}
            >
              <Banknote className="h-4 w-4 mr-1" /> Tiền mặt
            </Button>
            <Button
              variant={method === 'transfer' ? 'default' : 'outline'}
              className="flex-1"
              onClick={() => setMethod('transfer')}
            >
              <CreditCard className="h-4 w-4 mr-1" /> Chuyển khoản
            </Button>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Hủy</Button>
          <Button onClick={handlePay}>Xác nhận thanh toán</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
