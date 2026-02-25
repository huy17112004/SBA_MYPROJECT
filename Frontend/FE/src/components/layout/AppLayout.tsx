import { ReactNode } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, UtensilsCrossed, Armchair, ClipboardList, ChefHat, History, BarChart3, Coffee } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useApp } from '@/context/AppContext';
import { Badge } from '@/components/ui/badge';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Tổng quan' },
  { to: '/menu', icon: UtensilsCrossed, label: 'Menu' },
  { to: '/tables', icon: Armchair, label: 'Bàn' },
  { to: '/kitchen', icon: ChefHat, label: 'Bếp' },
  { to: '/history', icon: History, label: 'Lịch sử' },
  { to: '/stats', icon: BarChart3, label: 'Thống kê' },
];

function SidebarContent() {
  const { getActiveOrders } = useApp();
  const activeCount = getActiveOrders().length;

  return (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className="p-5 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-warm flex items-center justify-center">
            <Coffee className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-sidebar-primary">QuanNuoc</h1>
            <p className="text-xs text-sidebar-foreground/60">Quản lý quán nước</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) => cn(
              'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200',
              isActive
                ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-soft'
                : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
            )}
          >
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
            {item.to === '/kitchen' && activeCount > 0 && (
              <Badge className="ml-auto bg-status-occupied text-primary-foreground text-xs px-2 py-0 border-0">
                {activeCount}
              </Badge>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border">
        <p className="text-xs text-sidebar-foreground/40 text-center">QuanNuoc v1.0</p>
      </div>
    </div>
  );
}

export default function AppLayout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const { getActiveOrders } = useApp();
  const activeCount = getActiveOrders().length;

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col bg-sidebar border-r border-sidebar-border flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto pb-20 lg:pb-0">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50 shadow-elevated">
        <div className="flex items-center justify-around h-16 px-2">
          {navItems.map((item) => {
            const isActive = item.to === '/' ? location.pathname === '/' : location.pathname.startsWith(item.to);
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={cn(
                  'flex flex-col items-center justify-center gap-1 px-3 py-1.5 rounded-xl transition-all min-w-[52px] relative',
                  isActive ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                <item.icon className={cn('w-5 h-5', isActive && 'drop-shadow-sm')} />
                <span className="text-[10px] font-medium">{item.label}</span>
                {item.to === '/kitchen' && activeCount > 0 && (
                  <span className="absolute -top-0.5 right-1 w-4 h-4 rounded-full bg-status-occupied text-primary-foreground text-[9px] flex items-center justify-center font-bold">
                    {activeCount}
                  </span>
                )}
              </NavLink>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
