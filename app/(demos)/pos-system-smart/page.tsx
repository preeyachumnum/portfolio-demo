"use client";

import React, { useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { 
  ShoppingBag, 
  ChefHat, 
  MonitorSmartphone, 
  LayoutDashboard, 
  Plus,
  Minus,
  Banknote,
  QrCode,
  Users,
  Search,
  CheckCircle2,
  Clock,
  ChevronRight,
  X,
  ShoppingCart,
  TrendingUp,
  Package,
  ArrowLeft
} from 'lucide-react';

// --- TYPES ---
export type Category = 'All' | 'Coffee' | 'Tea' | 'Bakery' | 'Food';

export interface Product {
  id: number;
  name: string;
  price: number;
  category: Category;
  image: string;
}

export interface CartItem extends Product {
  qty: number;
}

export type OrderStatus = 'pending' | 'cooking' | 'ready' | 'completed';

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  method: string;
  status: OrderStatus;
  time: string;
  timestamp: number;
  type: 'Dine-in' | 'Takeaway';
}

// --- MOCK DATA ---
const MOCK_CATEGORIES: Category[] = ['All', 'Coffee', 'Tea', 'Bakery', 'Food'];
const MOCK_PRODUCTS: Product[] = [
  { id: 1, name: 'Espresso', price: 60, category: 'Coffee', image: '☕' },
  { id: 2, name: 'Americano', price: 70, category: 'Coffee', image: '☕' },
  { id: 3, name: 'Latte', price: 80, category: 'Coffee', image: '☕' },
  { id: 4, name: 'Matcha Green Tea', price: 90, category: 'Tea', image: '🍵' },
  { id: 5, name: 'Thai Milk Tea', price: 75, category: 'Tea', image: '🧋' },
  { id: 6, name: 'Croissant', price: 85, category: 'Bakery', image: '🥐' },
  { id: 7, name: 'Cheesecake', price: 120, category: 'Bakery', image: '🍰' },
  { id: 8, name: 'Club Sandwich', price: 150, category: 'Food', image: '🥪' },
  { id: 9, name: 'Spaghetti Carbonara', price: 180, category: 'Food', image: '🍝' },
  { id: 10, name: 'French Fries', price: 69, category: 'Food', image: '🍟' },
];

// --- CUSTOM HOOK FOR LOCAL STORAGE (Next.js Safe) ---
const emptySubscribe = () => () => {};

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
  badge?: number;
}

interface StatCardProps {
  title: string;
  value: string;
  trend: string;
  icon: React.ReactNode;
  color: string;
}

interface BestSellerItemProps {
  name: string;
  sales: string;
  revenue: string;
  rank: number;
}

function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch (error) {
      console.warn('Error reading localStorage', error);
      return initialValue;
    }
  });

  // ดึงข้อมูลเมื่อ Component ถูกเมานท์ใน Client เท่านั้น

  // บันทึกข้อมูลเมื่อมีการเปลี่ยนแปลง
  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      console.warn('Error setting localStorage', error);
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue] as const;
}

// ==========================================
// MAIN PAGE COMPONENT (Next.js)
// ==========================================
export default function App() {
  const isMounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const [currentView, setCurrentView] = useState<'pos' | 'kds' | 'dashboard' | 'kiosk'>('pos');
  const [orders, setOrders] = useLocalStorage<Order[]>('smartpos_orders', []);

  // ป้องกัน Hydration Error ของ Next.js

  const pendingCount = orders.filter(o => o.status === 'pending' || o.status === 'cooking').length;

  if (!isMounted) {
    // โชว์หน้าโหลดชั่วคราวก่อนเพื่อให้ Next.js เรนเดอร์ฝั่ง Server ได้อย่างปลอดภัย
    return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div></div>;
  }

  return (
    <div className="flex h-full min-h-0 w-full bg-slate-50 text-slate-800 font-sans overflow-hidden selection:bg-blue-200">
      
      {/* Desktop Sidebar */}
      {currentView !== 'kiosk' && (
        <aside className="hidden md:flex w-20 lg:w-64 bg-white border-r border-slate-200 flex-col justify-between transition-all duration-300 z-20">
          <div>
            <div className="h-16 flex items-center justify-center lg:justify-start lg:px-6 border-b border-slate-100">
              <div className="bg-blue-600 p-2 rounded-xl text-white">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <span className="hidden lg:block ml-3 font-bold text-xl text-slate-800 tracking-tight">SmartPOS</span>
            </div>
            <div className="py-4 flex flex-col gap-2 px-3">
              <NavItem icon={<MonitorSmartphone />} label="จุดขาย (POS)" active={currentView === 'pos'} onClick={() => setCurrentView('pos')} />
              <NavItem icon={<ChefHat />} label="จอครัว (KDS)" active={currentView === 'kds'} onClick={() => setCurrentView('kds')} badge={pendingCount} />
              <NavItem icon={<LayoutDashboard />} label="สรุปยอดขาย" active={currentView === 'dashboard'} onClick={() => setCurrentView('dashboard')} />
              <div className="my-2 border-t border-slate-100"></div>
              <NavItem icon={<QrCode />} label="โหมดตู้ Kiosk" active={false} onClick={() => setCurrentView('kiosk')} />
            </div>
          </div>
        </aside>
      )}

      {/* Main Content Area */}
      <main className={`relative flex-1 min-h-0 overflow-hidden ${currentView !== 'kiosk' ? 'pb-16 md:pb-0' : ''}`}>
        {currentView === 'pos' && <POSView products={MOCK_PRODUCTS} setOrders={setOrders} />}
        {currentView === 'kds' && <KDSView orders={orders} setOrders={setOrders} />}
        {currentView === 'dashboard' && <DashboardView orders={orders} setOrders={setOrders} />}
        {currentView === 'kiosk' && <KioskView products={MOCK_PRODUCTS} setOrders={setOrders} exitKiosk={() => setCurrentView('pos')} />}
      </main>

      {/* Mobile Bottom Navigation */}
      {currentView !== 'kiosk' && (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around items-center h-16 px-2 pb-safe z-40">
          <MobileNavItem icon={<MonitorSmartphone />} label="POS" active={currentView === 'pos'} onClick={() => setCurrentView('pos')} />
          <MobileNavItem icon={<ChefHat />} label="KDS" active={currentView === 'kds'} onClick={() => setCurrentView('kds')} badge={pendingCount} />
          <MobileNavItem icon={<LayoutDashboard />} label="Dashboard" active={currentView === 'dashboard'} onClick={() => setCurrentView('dashboard')} />
          <MobileNavItem icon={<QrCode />} label="Kiosk" active={false} onClick={() => setCurrentView('kiosk')} />
        </nav>
      )}
    </div>
  );
}

// ==========================================
// 1. POS VIEW (Mobile-First)
// ==========================================
function POSView({ products, setOrders }: { products: Product[], setOrders: React.Dispatch<React.SetStateAction<Order[]>> }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [category, setCategory] = useState<Category>('All');
  const [search, setSearch] = useState('');
  const [isCartOpen, setIsCartOpen] = useState(false); // For mobile drawer

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchCat = category === 'All' || p.category === category;
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [products, category, search]);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item);
      }
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const updateQty = (id: number, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = item.qty + delta;
        return newQty > 0 ? { ...item, qty: newQty } : item;
      }
      return item;
    }));
  };

  const clearCart = () => {
    if(window.confirm('ต้องการล้างตะกร้าทั้งหมดหรือไม่?')) setCart([]);
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const tax = subtotal * 0.07;
  const total = subtotal + tax;
  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);

  const handleCheckout = (method: string) => {
    if (cart.length === 0) return;
    
    const newOrder: Order = {
      id: `ORD-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
      items: [...cart],
      total: total,
      method: method,
      status: 'pending',
      time: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
      timestamp: Date.now(),
      type: 'Dine-in'
    };

    setOrders(prev => [newOrder, ...prev]); 
    setCart([]);
    setIsCartOpen(false);
    
    setTimeout(() => alert(`✅ ชำระเงิน ${total.toFixed(2)} ฿ สำเร็จ (${method})\nส่งออเดอร์ ${newOrder.id} เข้าครัวแล้ว!`), 300);
  };

  return (
    <div className="flex h-full relative">
      {/* --- Left/Main: Products --- */}
      <div className="flex-1 flex flex-col h-full bg-slate-50/50">
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-4 md:px-6 sticky top-0 z-10">
          <h1 className="text-xl font-bold hidden md:block">แคชเชียร์</h1>
          <div className="relative w-full md:w-72">
            <Search className="w-5 h-5 absolute left-3 top-2 text-slate-400" />
            <input 
              type="text" 
              placeholder="ค้นหาเมนู..." 
              className="w-full pl-10 pr-4 py-2 rounded-full border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-slate-100/50 transition-all text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && <button onClick={() => setSearch('')} className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"><X className="w-4 h-4"/></button>}
          </div>
        </header>

        <div className="flex gap-2 p-3 md:p-4 overflow-x-auto hide-scrollbar border-b border-slate-100 bg-white">
          {MOCK_CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-5 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-all duration-200 ${
                category === cat 
                  ? 'bg-slate-800 text-white shadow-md transform scale-105' 
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {cat === 'All' ? 'เมนูทั้งหมด' : cat}
            </button>
          ))}
        </div>

        <div className="flex-1 p-3 md:p-6 overflow-y-auto pb-24 md:pb-6">
          {filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400">
              <Package className="w-16 h-16 mb-4 opacity-20" />
              <p>ไม่พบเมนูที่ค้นหา</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
              {filteredProducts.map(product => (
                <div 
                  key={product.id}
                  onClick={() => addToCart(product)}
                  className="bg-white p-3 md:p-4 rounded-2xl shadow-sm border border-slate-100 cursor-pointer hover:shadow-md hover:border-blue-200 transition-all active:scale-95 flex flex-col items-center text-center group"
                >
                  <div className="text-4xl md:text-5xl mb-2 md:mb-3 group-hover:scale-110 transition-transform">{product.image}</div>
                  <h3 className="font-semibold text-slate-700 text-sm md:text-base line-clamp-2 leading-tight flex-1">{product.name}</h3>
                  <p className="text-blue-600 font-bold mt-2 text-sm md:text-base">฿{product.price}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* --- Mobile Floating Cart Button --- */}
      <div className="md:hidden absolute bottom-4 left-4 right-4 z-20">
        <button 
          onClick={() => setIsCartOpen(true)}
          className="w-full bg-slate-900 text-white p-4 rounded-2xl shadow-2xl flex items-center justify-between active:scale-95 transition-transform"
        >
          <div className="flex items-center gap-3">
            <div className="relative">
              <ShoppingCart className="w-6 h-6" />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-slate-900">
                  {totalItems}
                </span>
              )}
            </div>
            <span className="font-medium">ดูตะกร้าสินค้า</span>
          </div>
          <span className="font-bold text-lg">฿{total.toFixed(2)}</span>
        </button>
      </div>

      {/* --- Right/Drawer: Cart & Checkout --- */}
      {isCartOpen && (
        <div className="md:hidden fixed inset-0 bg-black/50 z-30 backdrop-blur-sm" onClick={() => setIsCartOpen(false)} />
      )}
      
      <div className={`
        fixed inset-y-0 right-0 z-40 w-full max-w-sm bg-white border-l border-slate-200 flex flex-col shadow-2xl transition-transform duration-300 transform
        md:relative md:translate-x-0 md:w-96 md:shadow-none
        ${isCartOpen ? 'translate-x-0' : 'translate-x-full'}
      `}>
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-slate-500" />
            <span className="font-semibold text-slate-700">ลูกค้า Walk-in</span>
          </div>
          <button className="md:hidden p-2 text-slate-400 hover:text-slate-600" onClick={() => setIsCartOpen(false)}>
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400">
              <ShoppingCart className="w-16 h-16 mb-4 opacity-20" />
              <p>ยังไม่มีรายการสินค้า</p>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold text-slate-800">รายการ ({totalItems})</h3>
                <button onClick={clearCart} className="text-xs text-red-500 hover:underline">ล้างทั้งหมด</button>
              </div>
              {cart.map(item => (
                <div key={item.id} className="flex items-start justify-between bg-white p-3 rounded-2xl border border-slate-100 shadow-sm animate-fade-in">
                  <div className="flex-1 pr-2">
                    <h4 className="font-semibold text-slate-800 text-sm">{item.name}</h4>
                    <p className="text-sm text-blue-600 font-medium">฿{item.price}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center bg-slate-100 rounded-lg">
                      <button onClick={() => updateQty(item.id, -1)} className="p-1.5 text-slate-600 hover:bg-slate-200 rounded-l-lg transition-colors"><Minus className="w-4 h-4" /></button>
                      <span className="w-8 text-center font-bold text-sm">{item.qty}</span>
                      <button onClick={() => updateQty(item.id, 1)} className="p-1.5 text-slate-600 hover:bg-slate-200 rounded-r-lg transition-colors"><Plus className="w-4 h-4" /></button>
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>

        <div className="p-5 bg-white border-t border-slate-200 z-10">
          <div className="space-y-1.5 mb-5 text-sm">
            <div className="flex justify-between text-slate-500">
              <span>ยอดรวม (Subtotal)</span>
              <span>฿{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>ภาษี (VAT 7%)</span>
              <span>฿{tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xl font-black text-slate-800 pt-3 border-t border-slate-100 mt-2">
              <span>ยอดสุทธิ</span>
              <span className="text-blue-600">฿{total.toFixed(2)}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pb-safe">
            <button 
              onClick={() => handleCheckout('Cash')}
              disabled={cart.length === 0}
              className="flex flex-col items-center justify-center py-3 px-2 rounded-xl bg-slate-800 text-white hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors active:scale-95"
            >
              <Banknote className="w-6 h-6 mb-1" />
              <span className="font-semibold text-sm">เงินสด</span>
            </button>
            <button 
              onClick={() => handleCheckout('QR/Card')}
              disabled={cart.length === 0}
              className="flex flex-col items-center justify-center py-3 px-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors active:scale-95"
            >
              <QrCode className="w-6 h-6 mb-1" />
              <span className="font-semibold text-sm">สแกนจ่าย</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 2. KDS VIEW (Kitchen Display System)
// ==========================================
function KDSView({ orders, setOrders }: { orders: Order[], setOrders: React.Dispatch<React.SetStateAction<Order[]>> }) {
  const activeOrders = orders.filter(o => o.status !== 'completed').sort((a, b) => a.timestamp - b.timestamp);
  
  const updateOrderStatus = (id: string, newStatus: OrderStatus) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));
  };

  const getStatusColor = (status: OrderStatus) => {
    switch(status) {
      case 'pending': return 'bg-red-500';
      case 'cooking': return 'bg-amber-500';
      case 'ready': return 'bg-emerald-500';
      default: return 'bg-slate-500';
    }
  };

  const getStatusText = (status: OrderStatus) => {
    switch(status) {
      case 'pending': return 'รอดำเนินการ';
      case 'cooking': return 'กำลังทำ...';
      case 'ready': return 'พร้อมเสิร์ฟ';
      default: return '';
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-900 text-slate-100">
      <header className="h-16 bg-slate-950 flex items-center justify-between px-4 md:px-6 border-b border-slate-800 shadow-md">
        <div className="flex items-center gap-3">
          <ChefHat className="w-6 h-6 text-orange-400" />
          <h1 className="text-lg md:text-xl font-bold">Kitchen Display (KDS)</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm bg-slate-800 px-3 py-1.5 rounded-full">
             <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></div>
             <span className="font-medium">รอคิว: {activeOrders.length}</span>
          </div>
        </div>
      </header>

      <div className="flex-1 p-4 md:p-6 overflow-x-auto overflow-y-auto">
        {activeOrders.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-600">
            <CheckCircle2 className="w-20 h-20 mb-4 opacity-50 text-emerald-600" />
            <p className="text-xl md:text-2xl font-light">เคลียร์ออเดอร์หมดแล้ว!</p>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row gap-4 h-full md:items-start items-center">
            {activeOrders.map(order => (
              <div key={order.id} className="w-full md:min-w-[320px] md:w-[320px] bg-white text-slate-800 rounded-2xl shadow-xl flex flex-col overflow-hidden animate-fade-in border border-slate-200">
                <div className={`${getStatusColor(order.status)} text-white p-3 md:p-4 transition-colors`}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-black text-xl md:text-2xl tracking-tight">#{order.id.slice(-4)}</span>
                    <span className="font-bold bg-white/20 px-3 py-1 rounded-full text-sm">
                      {getStatusText(order.status)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-sm font-medium opacity-90 mt-2">
                    <Clock className="w-4 h-4" />
                    <span>รับออเดอร์: {order.time} ({order.type})</span>
                  </div>
                </div>
                
                <div className="flex-1 p-4 overflow-y-auto space-y-3 md:min-h-[250px] max-h-[40vh] md:max-h-[50vh] bg-slate-50">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-3 border-b border-slate-200 pb-3 last:border-0 last:pb-0">
                      <div className="bg-slate-800 text-white font-black text-lg w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-sm">
                        {item.qty}
                      </div>
                      <div className="flex-1 pt-0.5">
                        <p className="font-bold text-lg leading-tight text-slate-800">{item.name}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-3 bg-white border-t border-slate-200 flex gap-2">
                  {order.status === 'pending' && (
                     <button 
                       onClick={() => updateOrderStatus(order.id, 'cooking')}
                       className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold text-lg shadow-sm transition-all active:scale-95"
                     >
                       เริ่มทำอาหาร
                     </button>
                  )}
                  {order.status === 'cooking' && (
                     <button 
                       onClick={() => updateOrderStatus(order.id, 'ready')}
                       className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-lg shadow-sm transition-all active:scale-95"
                     >
                       ทำเสร็จแล้ว (พร้อมเสิร์ฟ)
                     </button>
                  )}
                  {order.status === 'ready' && (
                     <button 
                       onClick={() => updateOrderStatus(order.id, 'completed')}
                       className="w-full py-3 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold text-lg shadow-sm transition-all active:scale-95 flex items-center justify-center gap-2"
                     >
                       <CheckCircle2 className="w-5 h-5"/> เสิร์ฟลูกค้าแล้ว
                     </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ==========================================
// 3. DASHBOARD VIEW (HQ / Analytics)
// ==========================================
function DashboardView({ orders, setOrders }: { orders: Order[], setOrders: React.Dispatch<React.SetStateAction<Order[]>> }) {
  const [branch, setBranch] = useState('All Branches');
  const branches = ['Branch 1 (Silom)', 'Branch 2 (Sukhumvit)', 'Branch 3 (Chiang Mai)'];
  
  const totalSales = orders.reduce((sum, o) => sum + o.total, 0);
  const totalOrders = orders.length;

  const itemSales: Record<string, { qty: number, rev: number }> = {};
  orders.forEach(order => {
    order.items.forEach(item => {
      if(!itemSales[item.name]) itemSales[item.name] = { qty: 0, rev: 0 };
      itemSales[item.name].qty += item.qty;
      itemSales[item.name].rev += (item.price * item.qty);
    });
  });

  const bestSellers = Object.entries(itemSales)
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5);

  const handleClearData = () => {
    if(window.confirm('คำเตือน: ยืนยันการลบข้อมูลออเดอร์ทั้งหมดเพื่อเริ่มใหม่?')) {
      setOrders([]);
    }
  };

  return (
    <div className="h-full bg-slate-50 p-4 md:p-8 overflow-y-auto">
      <div className="max-w-6xl mx-auto space-y-6">
        
        <header className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-800 flex items-center gap-3">
              <TrendingUp className="text-blue-600 w-8 h-8" />
              HQ Dashboard
            </h1>
            <p className="text-slate-500 mt-2 font-medium">ภาพรวมยอดขายแบบเรียลไทม์</p>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <select 
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              className="flex-1 md:w-auto bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
            >
              <option value="All Branches">🏢 ทุกสาขารวมกัน</option>
              {branches.map(b => <option key={b} value={b}>📍 {b}</option>)}
            </select>
            <button onClick={handleClearData} className="px-4 py-3 bg-red-50 text-red-600 rounded-xl font-bold border border-red-200 hover:bg-red-100">
              ล้างข้อมูล
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          <StatCard title="ยอดขายรวม (บาท)" value={`฿${totalSales.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`} trend="วันนี้" icon={<Banknote />} color="bg-blue-600" />
          <StatCard title="จำนวนบิล (ออเดอร์)" value={totalOrders.toString()} trend="วันนี้" icon={<ShoppingBag />} color="bg-emerald-500" />
          <StatCard title="ลูกค้าเฉลี่ยต่อบิล" value={totalOrders > 0 ? `฿${(totalSales/totalOrders).toFixed(2)}` : '฿0.00'} trend="ยอดใช้จ่ายเฉลี่ย" icon={<Users />} color="bg-purple-500" />
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <h3 className="font-bold text-xl mb-6 text-slate-800 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-orange-500"/> เมนูขายดี (Top 5 Best Sellers)
          </h3>
          {bestSellers.length === 0 ? (
            <p className="text-slate-500 text-center py-8">ยังไม่มีข้อมูลยอดขาย</p>
          ) : (
            <div className="space-y-3">
              {bestSellers.map((item, idx) => (
                <BestSellerItem key={item.name} name={item.name} sales={`${item.qty} รายการ`} revenue={`฿${item.rev.toFixed(2)}`} rank={idx + 1} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 4. KIOSK VIEW (ตู้สั่งอาหารอัตโนมัติ)
// ==========================================
function KioskView({ products, setOrders, exitKiosk }: { products: Product[], setOrders: React.Dispatch<React.SetStateAction<Order[]>>, exitKiosk: () => void }) {
  const [step, setStep] = useState<'welcome' | 'menu' | 'payment' | 'done'>('welcome');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [newOrderId, setNewOrderId] = useState('');

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) return prev.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item);
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const updateQty = (id: number, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = item.qty + delta;
        return newQty > 0 ? { ...item, qty: newQty } : item;
      }
      return item;
    }));
  };

  const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);

  const processPayment = () => {
    if(cart.length === 0) return;
    setStep('payment');
    setTimeout(() => {
       const orderId = `Q-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
       setNewOrderId(orderId);
       const newOrder: Order = {
        id: orderId,
        items: [...cart],
        total: total,
        method: 'Kiosk-QR',
        status: 'pending',
        time: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
        timestamp: Date.now(),
        type: 'Takeaway'
      };
      setOrders(prev => [newOrder, ...prev]);
      setStep('done');
    }, 2000);
  };

  const resetKiosk = () => {
    setCart([]);
    setStep('welcome');
  };

  return (
    <div className="relative flex h-full min-h-0 w-full flex-col overflow-y-auto bg-slate-50 font-sans md:overflow-hidden">
      <button onClick={exitKiosk} className="absolute top-4 left-4 z-50 bg-black/30 backdrop-blur-md text-white px-4 py-2 rounded-full text-xs hover:bg-black/50 font-medium border border-white/20">
        <ArrowLeft className="w-4 h-4 inline mr-1"/> ออกจาก Kiosk
      </button>

      {step === 'welcome' && (
        <div className="relative flex min-h-full flex-1 cursor-pointer flex-col items-center justify-center bg-gradient-to-br from-blue-700 via-indigo-800 to-slate-900 text-white" onClick={() => setStep('menu')}>
           <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80')] mix-blend-overlay opacity-20 bg-cover bg-center"></div>
           <div className="z-10 text-center flex flex-col items-center animate-fade-in-up">
              <ShoppingBag className="w-32 h-32 md:w-48 md:h-48 mb-8 text-white drop-shadow-2xl" />
              <h1 className="text-5xl md:text-7xl font-black mb-4 tracking-tight drop-shadow-lg">SMART CAFE</h1>
              <p className="text-xl md:text-3xl font-light mb-16 text-blue-100">สั่งอาหารง่ายๆ ด้วยตัวคุณเอง</p>
              <div className="px-10 py-5 bg-white text-blue-800 rounded-full text-2xl font-black shadow-[0_0_40px_rgba(255,255,255,0.3)] animate-pulse flex items-center gap-3">
                แตะหน้าจอเพื่อเริ่ม <ChevronRight className="w-8 h-8"/>
              </div>
           </div>
        </div>
      )}

      {step === 'menu' && (
        <div className="flex min-h-full flex-col bg-slate-100 md:h-full md:min-h-0 md:flex-1 md:flex-row">
          <div className="flex flex-col md:min-h-0 md:flex-1">
            <header className="sticky top-0 z-10 flex h-20 shrink-0 items-center justify-center bg-white px-6 shadow-sm">
               <h1 className="text-2xl md:text-3xl font-black text-slate-800">เลือกเมนูอาหาร</h1>
            </header>
            
            <div className="grid grid-cols-2 gap-4 p-4 pb-6 sm:grid-cols-3 md:min-h-0 md:flex-1 md:grid-cols-2 md:gap-6 md:overflow-y-auto md:p-8 md:pb-8 lg:grid-cols-3 xl:grid-cols-4">
              {products.map(product => (
                <div key={product.id} onClick={() => addToCart(product)} className="bg-white rounded-3xl p-4 md:p-6 shadow-sm border-2 border-transparent hover:border-blue-500 transition-all flex flex-col items-center text-center cursor-pointer active:scale-95 group">
                   <div className="text-6xl md:text-7xl mb-4 bg-slate-50 w-24 h-24 md:w-32 md:h-32 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner">{product.image}</div>
                   <h3 className="text-lg md:text-xl font-bold text-slate-800 mb-1 leading-tight h-10 flex items-center">{product.name}</h3>
                   <p className="text-xl md:text-2xl text-blue-600 font-black">฿{product.price}</p>
                   <button className="mt-4 bg-slate-100 text-slate-800 px-6 py-2.5 rounded-full font-bold w-full group-hover:bg-blue-600 group-hover:text-white transition-colors">เลือก</button>
                </div>
              ))}
            </div>
          </div>

          <div className="z-20 mt-auto flex w-full shrink-0 flex-col border-t border-slate-200 bg-white shadow-2xl md:mt-0 md:h-full md:min-h-0 md:w-[400px] md:border-t-0 md:border-l">
            <div className="flex shrink-0 items-center justify-between bg-slate-900 p-4 text-white md:p-6">
               <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2"><ShoppingCart /> ตะกร้าของฉัน</h2>
               <span className="bg-blue-600 px-3 py-1 rounded-full font-bold">{totalItems} รายการ</span>
            </div>
            <div className="max-h-[38svh] overflow-y-auto bg-slate-50 p-4 space-y-3 md:max-h-none md:min-h-0 md:flex-1">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400">
                  <p className="text-lg font-medium">ยังไม่ได้เลือกเมนู</p>
                </div>
              ) : (
                cart.map(item => (
                  <div key={item.id} className="flex justify-between items-center p-3 md:p-4 bg-white rounded-2xl shadow-sm border border-slate-100">
                    <div className="flex-1">
                      <h4 className="font-bold text-slate-800 text-lg leading-tight">{item.name}</h4>
                      <p className="text-blue-600 font-bold">฿{item.price}</p>
                    </div>
                    <div className="flex items-center gap-3 bg-slate-100 rounded-xl p-1">
                      <button onClick={(e) => { e.stopPropagation(); updateQty(item.id, -1); }} className="w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-white rounded-lg font-bold text-xl">-</button>
                      <span className="font-black w-4 text-center">{item.qty}</span>
                      <button onClick={(e) => { e.stopPropagation(); updateQty(item.id, 1); }} className="w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-white rounded-lg font-bold text-xl">+</button>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="shrink-0 border-t border-slate-100 bg-white p-4 pb-safe md:p-6">
               <div className="flex justify-between items-end mb-4">
                 <span className="text-lg text-slate-500 font-medium">ยอดชำระสุทธิ</span>
                 <span className="text-3xl md:text-4xl font-black text-blue-600 tracking-tight">฿{total.toFixed(2)}</span>
               </div>
               <div className="grid grid-cols-2 gap-3">
                 <button onClick={resetKiosk} className="py-4 rounded-2xl text-lg font-bold bg-slate-100 text-slate-600 hover:bg-slate-200">ยกเลิก</button>
                 <button 
                   disabled={cart.length === 0}
                   onClick={processPayment}
                   className="py-4 rounded-2xl text-lg font-bold shadow-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition-all active:scale-95"
                 >
                   ชำระเงิน
                 </button>
               </div>
            </div>
          </div>
        </div>
      )}

      {step === 'payment' && (
        <div className="flex min-h-full flex-1 flex-col items-center justify-center bg-white p-6 text-center">
           <div className="w-64 h-64 md:w-80 md:h-80 bg-slate-50 rounded-3xl flex items-center justify-center mb-8 border-4 border-dashed border-blue-200 relative overflow-hidden group shadow-inner">
              <QrCode className="w-32 h-32 md:w-40 md:h-40 text-blue-600 group-hover:scale-110 transition-transform" />
              <div className="absolute top-0 w-full h-1 bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.8)] animate-[scan_2s_ease-in-out_infinite]"></div>
           </div>
           <h2 className="text-3xl md:text-5xl font-black mb-4 text-slate-800">สแกนเพื่อชำระเงิน</h2>
           <p className="text-2xl md:text-3xl text-slate-500 font-medium mb-8">ยอดชำระ: <span className="text-blue-600 font-bold">฿{total.toFixed(2)}</span></p>
           <div className="flex items-center gap-3 text-blue-600 font-bold text-lg bg-blue-50 px-6 py-3 rounded-full">
             <div className="w-5 h-5 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
             <span>กำลังรอรับยอดเงิน...</span>
           </div>
        </div>
      )}

      {step === 'done' && (
        <div className="flex min-h-full flex-1 flex-col items-center justify-center bg-emerald-500 p-6 text-center text-white">
           <CheckCircle2 className="w-32 h-32 md:w-48 md:h-48 mb-8 animate-bounce drop-shadow-lg" />
           <h2 className="text-4xl md:text-6xl font-black mb-4 drop-shadow-md">ชำระเงินสำเร็จ!</h2>
           <p className="text-xl md:text-2xl mb-12 font-medium opacity-90">ออเดอร์ถูกส่งไปยังห้องครัวแล้ว</p>
           
           <div className="bg-white text-slate-800 px-12 py-8 rounded-3xl shadow-2xl mb-12 transform scale-100 hover:scale-105 transition-transform">
             <p className="text-lg md:text-xl font-bold mb-2 text-slate-500">หมายเลขคิวของคุณ</p>
             <p className="text-7xl md:text-9xl font-black text-blue-600 tracking-tighter">{newOrderId}</p>
           </div>
           
           <button onClick={resetKiosk} className="bg-slate-900 text-white px-10 py-4 md:py-5 rounded-full text-xl font-bold hover:bg-slate-800 transition-colors shadow-xl w-full max-w-sm">
             กลับสู่หน้าแรก
           </button>
        </div>
      )}
    </div>
  );
}

// --- Sub-Components ---
function NavItem({ icon, label, active, onClick, badge = 0 }: NavItemProps) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center justify-center lg:justify-start px-3 py-3 rounded-xl transition-all relative group ${
        active ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
      }`}
    >
      <div className={`${active ? 'text-white' : 'text-slate-400 group-hover:text-blue-600 transition-colors'}`}>
        {icon}
      </div>
      <span className={`hidden lg:block ml-3 font-semibold ${active ? 'text-white' : ''}`}>{label}</span>
      {badge > 0 && (
        <span className="absolute right-2 top-2 lg:relative lg:top-auto lg:ml-auto bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
          {badge}
        </span>
      )}
    </button>
  );
}

function MobileNavItem({ icon, label, active, onClick, badge = 0 }: NavItemProps) {
  return (
    <button onClick={onClick} className={`flex flex-col items-center justify-center w-full h-full relative ${active ? 'text-blue-600' : 'text-slate-400'}`}>
      <div className={`mb-1 transition-transform ${active ? 'scale-110' : ''}`}>
        {icon}
      </div>
      <span className={`text-[10px] font-bold ${active ? 'text-blue-600' : 'text-slate-500'}`}>{label}</span>
      {badge > 0 && (
        <span className="absolute top-1 right-4 bg-red-500 text-white text-[9px] font-bold px-1.5 rounded-full border border-white">
          {badge}
        </span>
      )}
    </button>
  );
}

function StatCard({ title, value, trend, icon, color }: StatCardProps) {
  return (
    <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex items-start justify-between group hover:shadow-md transition-shadow">
      <div>
        <p className="text-slate-500 text-sm font-semibold mb-1">{title}</p>
        <h3 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">{value}</h3>
        <p className="text-emerald-500 text-xs font-bold mt-2 bg-emerald-50 inline-block px-2 py-1 rounded-md">{trend}</p>
      </div>
      <div className={`${color} text-white p-3 md:p-4 rounded-2xl shadow-lg transform group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
    </div>
  );
}

function BestSellerItem({ name, sales, revenue, rank }: BestSellerItemProps) {
  const rankColors = ['bg-yellow-400 text-yellow-900', 'bg-slate-300 text-slate-800', 'bg-orange-300 text-orange-900'];
  const badgeClass = rank <= 3 ? rankColors[rank-1] : 'bg-slate-100 text-slate-500';

  return (
    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-blue-50 hover:border-blue-100 transition-colors">
      <div className="flex items-center gap-4">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm shadow-sm ${badgeClass}`}>
          {rank}
        </div>
        <div>
          <h4 className="font-bold text-slate-800 leading-tight">{name}</h4>
          <p className="text-sm text-slate-500 font-medium">{sales}</p>
        </div>
      </div>
      <div className="font-black text-blue-600 text-lg">{revenue}</div>
    </div>
  );
}
