import { AppLayout } from '@/components/layout/AppLayout';
import { OrderHistory } from '@/components/history/OrderHistory';

export default function HistoryPage() {
  return (
    <AppLayout>
      <OrderHistory />
    </AppLayout>
  );
}
