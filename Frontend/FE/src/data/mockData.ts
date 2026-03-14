import { Category, MenuItem, DiningTable, Order, OrderItem } from '@/types';

export const initialCategories: Category[] = [
  { id: 'cat1', name: 'Đồ uống', description: 'Nước giải khát, trà, cà phê' },
  { id: 'cat2', name: 'Đồ ăn nhanh', description: 'Món ăn vặt, đồ nhậu' },
  { id: 'cat3', name: 'Chè', description: 'Các loại chè' },
  { id: 'cat4', name: 'Kem', description: 'Kem các loại' },
  { id: 'cat5', name: 'Khác', description: 'Món khác' },
];

export const initialMenuItems: MenuItem[] = [
  { id: 'm1', name: 'Trà đá', price: 5000, categoryId: 'cat1', description: 'Trà đá truyền thống', available: true },
  { id: 'm2', name: 'Trà chanh', price: 15000, categoryId: 'cat1', description: 'Trà chanh tươi mát', available: true },
  { id: 'm3', name: 'Nước sấu', price: 10000, categoryId: 'cat1', description: 'Nước sấu đá', available: true },
  { id: 'm4', name: 'Cà phê đen', price: 15000, categoryId: 'cat1', description: 'Cà phê đen đá', available: true },
  { id: 'm5', name: 'Cà phê sữa', price: 20000, categoryId: 'cat1', description: 'Cà phê sữa đá', available: true },
  { id: 'm6', name: 'Nước cam', price: 20000, categoryId: 'cat1', description: 'Nước cam tươi', available: true },
  { id: 'm7', name: 'Sinh tố bơ', price: 25000, categoryId: 'cat1', description: 'Sinh tố bơ', available: true },
  { id: 'm8', name: 'Nước mía', price: 10000, categoryId: 'cat1', description: 'Nước mía siêu ngọt', available: false },
  { id: 'm9', name: 'Chân gà nướng', price: 35000, categoryId: 'cat2', description: 'Chân gà nướng sả ớt', available: true },
  { id: 'm10', name: 'Nem chua rán', price: 30000, categoryId: 'cat2', description: 'Nem chua rán giòn', available: true },
  { id: 'm11', name: 'Khoai tây chiên', price: 25000, categoryId: 'cat2', description: 'Khoai tây chiên giòn', available: true },
  { id: 'm12', name: 'Ngô chiên bơ', price: 20000, categoryId: 'cat2', description: 'Ngô chiên bơ thơm', available: true },
  { id: 'm13', name: 'Xúc xích nướng', price: 15000, categoryId: 'cat2', description: 'Xúc xích nướng', available: true },
  { id: 'm14', name: 'Chè thập cẩm', price: 15000, categoryId: 'cat3', description: 'Chè thập cẩm đầy đủ', available: true },
  { id: 'm15', name: 'Chè đậu đỏ', price: 12000, categoryId: 'cat3', description: 'Chè đậu đỏ nước cốt dừa', available: true },
  { id: 'm16', name: 'Chè khúc bạch', price: 18000, categoryId: 'cat3', description: 'Chè khúc bạch mát lạnh', available: true },
  { id: 'm17', name: 'Kem vani', price: 10000, categoryId: 'cat4', description: 'Kem vani mát lạnh', available: true },
  { id: 'm18', name: 'Kem socola', price: 12000, categoryId: 'cat4', description: 'Kem socola đậm vị', available: true },
  { id: 'm19', name: 'Hướng dương', price: 10000, categoryId: 'cat5', description: 'Hạt hướng dương', available: true },
  { id: 'm20', name: 'Lạc luộc', price: 10000, categoryId: 'cat5', description: 'Lạc luộc nóng', available: true },
];

const now = new Date();
const h = (hoursAgo: number) => new Date(now.getTime() - hoursAgo * 3600000);
const m = (minsAgo: number) => new Date(now.getTime() - minsAgo * 60000);

export const initialTables: DiningTable[] = [
  { id: 't1', name: 'Bàn 1', status: 'occupied', seats: 4, note: '' },
  { id: 't2', name: 'Bàn 2', status: 'empty', seats: 4, note: '' },
  { id: 't3', name: 'Bàn 3', status: 'waiting_payment', seats: 2, note: '' },
  { id: 't4', name: 'Bàn 4', status: 'empty', seats: 6, note: '' },
  { id: 't5', name: 'Bàn 5', status: 'occupied', seats: 4, note: 'Khách quen' },
  { id: 't6', name: 'Bàn 6', status: 'empty', seats: 2, note: '' },
  { id: 't7', name: 'Bàn 7', status: 'empty', seats: 4, note: '' },
  { id: 't8', name: 'Bàn 8', status: 'occupied', seats: 4, note: '' },
  { id: 't9', name: 'Bàn 9', status: 'empty', seats: 6, note: '' },
  { id: 't10', name: 'Bàn 10', status: 'empty', seats: 2, note: '' },
];

export const initialOrders: Order[] = [
  {
    id: 'o1', tableId: 't1', tableName: 'Bàn 1', status: 'active', createdAt: m(30), paidAt: null, paymentMethod: null, totalAmount: 75000,
    items: [
      { id: 'oi1', menuItemId: 'm5', menuItemName: 'Cà phê sữa', quantity: 2, note: '', price: 20000, status: 'served', createdAt: m(30) },
      { id: 'oi2', menuItemId: 'm9', menuItemName: 'Chân gà nướng', quantity: 1, note: 'Ít cay', price: 35000, status: 'pending', createdAt: m(10) },
    ],
  },
  {
    id: 'o2', tableId: 't3', tableName: 'Bàn 3', status: 'active', createdAt: m(45), paidAt: null, paymentMethod: null, totalAmount: 40000,
    items: [
      { id: 'oi3', menuItemId: 'm2', menuItemName: 'Trà chanh', quantity: 2, note: '', price: 15000, status: 'served', createdAt: m(45) },
      { id: 'oi4', menuItemId: 'm19', menuItemName: 'Hướng dương', quantity: 1, note: '', price: 10000, status: 'served', createdAt: m(45) },
    ],
  },
  {
    id: 'o3', tableId: 't5', tableName: 'Bàn 5', status: 'active', createdAt: m(15), paidAt: null, paymentMethod: null, totalAmount: 60000,
    items: [
      { id: 'oi5', menuItemId: 'm4', menuItemName: 'Cà phê đen', quantity: 1, note: 'Đậm', price: 15000, status: 'served', createdAt: m(15) },
      { id: 'oi6', menuItemId: 'm10', menuItemName: 'Nem chua rán', quantity: 1, note: '', price: 30000, status: 'pending', createdAt: m(5) },
      { id: 'oi7', menuItemId: 'm1', menuItemName: 'Trà đá', quantity: 3, note: '', price: 5000, status: 'pending', createdAt: m(5) },
    ],
  },
  {
    id: 'o4', tableId: 't8', tableName: 'Bàn 8', status: 'active', createdAt: m(8), paidAt: null, paymentMethod: null, totalAmount: 45000,
    items: [
      { id: 'oi8', menuItemId: 'm7', menuItemName: 'Sinh tố bơ', quantity: 1, note: '', price: 25000, status: 'pending', createdAt: m(8) },
      { id: 'oi9', menuItemId: 'm12', menuItemName: 'Ngô chiên bơ', quantity: 1, note: '', price: 20000, status: 'pending', createdAt: m(8) },
    ],
  },
  // Paid orders for history
  {
    id: 'o5', tableId: 't2', tableName: 'Bàn 2', status: 'paid', createdAt: h(3), paidAt: h(2), paymentMethod: 'cash', totalAmount: 55000,
    items: [
      { id: 'oi10', menuItemId: 'm5', menuItemName: 'Cà phê sữa', quantity: 1, note: '', price: 20000, status: 'served', createdAt: h(3) },
      { id: 'oi11', menuItemId: 'm9', menuItemName: 'Chân gà nướng', quantity: 1, note: '', price: 35000, status: 'served', createdAt: h(3) },
    ],
  },
  {
    id: 'o6', tableId: 't4', tableName: 'Bàn 4', status: 'paid', createdAt: h(5), paidAt: h(4), paymentMethod: 'transfer', totalAmount: 85000,
    items: [
      { id: 'oi12', menuItemId: 'm2', menuItemName: 'Trà chanh', quantity: 3, note: '', price: 15000, status: 'served', createdAt: h(5) },
      { id: 'oi13', menuItemId: 'm11', menuItemName: 'Khoai tây chiên', quantity: 1, note: '', price: 25000, status: 'served', createdAt: h(5) },
      { id: 'oi14', menuItemId: 'm14', menuItemName: 'Chè thập cẩm', quantity: 1, note: '', price: 15000, status: 'served', createdAt: h(5) },
    ],
  },
];

// Revenue data for stats (last 30 days)
export const dailyRevenue: { date: string; revenue: number; orders: number }[] = Array.from({ length: 30 }, (_, i) => {
  const d = new Date();
  d.setDate(d.getDate() - (29 - i));
  const base = 300000 + Math.floor(Math.random() * 500000);
  const weekend = [0, 6].includes(d.getDay()) ? 1.5 : 1;
  return {
    date: d.toISOString().split('T')[0],
    revenue: Math.floor(base * weekend),
    orders: Math.floor(10 + Math.random() * 20 * weekend),
  };
});
