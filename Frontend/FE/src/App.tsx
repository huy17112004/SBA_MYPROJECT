import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "@/context/AppContext";
import AppLayout from "@/components/layout/AppLayout";
import Index from "./pages/Index";
import MenuPage from "./pages/MenuPage";
import TablesPage from "./pages/TablesPage";
import OrderPage from "./pages/OrderPage";
import KitchenPage from "./pages/KitchenPage";
import HistoryPage from "./pages/HistoryPage";
import StatsPage from "./pages/StatsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppProvider>
          <AppLayout>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/menu" element={<MenuPage />} />
              <Route path="/tables" element={<TablesPage />} />
              <Route path="/order/:tableId" element={<OrderPage />} />
              <Route path="/kitchen" element={<KitchenPage />} />
              <Route path="/history" element={<HistoryPage />} />
              <Route path="/stats" element={<StatsPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AppLayout>
        </AppProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
