import { LayoutGrid, UtensilsCrossed, ChefHat, History, BarChart3, Settings } from 'lucide-react';
import { NavLink } from '@/components/NavLink';

const items = [
  { title: 'Bàn', url: '/', icon: LayoutGrid },
  { title: 'Menu', url: '/menu', icon: UtensilsCrossed },
  { title: 'Bếp', url: '/kitchen', icon: ChefHat },
  { title: 'Lịch sử', url: '/history', icon: History },
  { title: 'Thống kê', url: '/stats', icon: BarChart3 },
  { title: 'Cài đặt', url: '/settings', icon: Settings },
];

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex border-t bg-background md:hidden">
      {items.map((item) => (
        <NavLink
          key={item.title}
          to={item.url}
          end={item.url === '/'}
          className="flex flex-1 flex-col items-center gap-0.5 py-2 text-xs text-muted-foreground"
          activeClassName="text-primary font-medium"
        >
          <item.icon className="h-5 w-5" />
          <span>{item.title}</span>
        </NavLink>
      ))}
    </nav>
  );
}
