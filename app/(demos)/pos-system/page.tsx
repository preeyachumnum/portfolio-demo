"use client";

import { useMemo, useState, type ReactNode, type SyntheticEvent } from 'react';
import { 
  UtensilsCrossed, Coffee, LayoutGrid, CakeSlice, ShoppingCart, 
  Plus, Minus, CreditCard,
  LayoutDashboard, Receipt, Settings, LineChart, Users,
  Search, Bell, MoreVertical, LogOut,
  Banknote, QrCode, Printer, CheckCircle
} from 'lucide-react';

type Route = 'cashier' | 'admin';
type CategoryId = 'all' | 'mains' | 'drinks' | 'desserts';
type ProductCategory = Exclude<CategoryId, 'all'>;
type PaymentMethod = 'cash' | 'credit' | 'qr';
type CheckoutStep = 'hidden' | 'payment' | 'success';
type AdminTab = 'overview' | 'transactions' | 'catalog' | 'staff' | 'settings';

interface Category {
  id: CategoryId;
  name: string;
  icon: ReactNode;
}

interface Product {
  id: string;
  name: string;
  price: number;
  category: ProductCategory;
  code: string;
  image: string;
  thaiName: string;
}

interface CartItem extends Product {
  qty: number;
}

interface PaymentData {
  method: PaymentMethod;
  received: number;
  change: number;
}

interface Order {
  id: string;
  date: string;
  items: CartItem[];
  total: number;
  method: PaymentMethod;
  status: 'Completed';
}

interface CashierViewProps {
  cart: CartItem[];
  addToCart: (product: Product) => void;
  updateQty: (id: string, delta: number) => void;
  clearCart: () => void;
  subtotal: number;
  tax: number;
  total: number;
  onConfirmOrder: (paymentData: PaymentData) => void;
  onNavigateAdmin: () => void;
}

interface AdminDashboardProps {
  ordersHistory: Order[];
  onNavigate: () => void;
}

interface AdminNavItem {
  id: AdminTab;
  label: string;
  icon: typeof LineChart;
}

const handleImageFallback = (
  event: SyntheticEvent<HTMLImageElement>,
  fallbackSrc: string,
) => {
  event.currentTarget.src = fallbackSrc;
};

// --- ENTERPRISE MOCK DATA ---
const CATEGORIES: Category[] = [
  { id: 'all', name: 'All Items', icon: <LayoutGrid size={18} /> },
  { id: 'mains', name: 'Signature Mains', icon: <UtensilsCrossed size={18} /> },
  { id: 'drinks', name: 'Beverages', icon: <Coffee size={18} /> },
  { id: 'desserts', name: 'Desserts', icon: <CakeSlice size={18} /> },
];

const MOCK_PRODUCTS: Product[] = [
  { id: 'p1', name: 'Wagyu Ribeye Steak A5', price: 2500, category: 'mains', code: 'MN-001', image: 'https://images.pexels.com/photos/361184/asparagus-steak-veal-steak-veal-361184.jpeg?auto=compress&cs=tinysrgb&w=400', thaiName: 'สเต็กเนื้อวากิว' },
  { id: 'p2', name: 'Truffle Mushroom Risotto', price: 850, category: 'mains', code: 'MN-002', image: 'https://images.pexels.com/photos/1251208/pexels-photo-1251208.jpeg?auto=compress&cs=tinysrgb&w=400', thaiName: 'ริซอตโต้เห็ดทรัฟเฟิล' },
  { id: 'p3', name: 'Lobster Thermidor', price: 1800, category: 'mains', code: 'MN-003', image: 'https://images.pexels.com/photos/2085023/pexels-photo-2085023.jpeg?auto=compress&cs=tinysrgb&w=400', thaiName: 'ล็อบสเตอร์เทอร์มิดอร์' },
  { id: 'p4', name: 'Pan-seared Salmon', price: 650, category: 'mains', code: 'MN-004', image: 'https://images.pexels.com/photos/262959/pexels-photo-262959.jpeg?auto=compress&cs=tinysrgb&w=400', thaiName: 'แซลมอนย่าง' },
  { id: 'p5', name: 'Artisan Espresso', price: 120, category: 'drinks', code: 'BV-001', image: 'https://images.pexels.com/photos/312418/pexels-photo-312418.jpeg?auto=compress&cs=tinysrgb&w=400', thaiName: 'เอสเพรสโซ่' },
  { id: 'p6', name: 'Matcha Yuzu Sparkling', price: 160, category: 'drinks', code: 'BV-002', image: 'https://images.pexels.com/photos/8946252/pexels-photo-8946252.jpeg?auto=compress&cs=tinysrgb&w=400', thaiName: 'มัทฉะยูซุโซดา' },
  { id: 'p7', name: 'Acqua Panna (Mineral)', price: 150, category: 'drinks', code: 'BV-003', image: 'https://images.pexels.com/photos/4321088/pexels-photo-4321088.jpeg?auto=compress&cs=tinysrgb&w=400', thaiName: 'น้ำแร่' },
  { id: 'p8', name: '70% Dark Chocolate Tart', price: 280, category: 'desserts', code: 'DS-001', image: 'https://images.pexels.com/photos/315707/pexels-photo-315707.jpeg?auto=compress&cs=tinysrgb&w=400', thaiName: 'ทาร์ตช็อกโกแลต' },
  { id: 'p9', name: 'Madagascar Vanilla Millefeuille', price: 320, category: 'desserts', code: 'DS-002', image: 'https://images.pexels.com/photos/1126359/pexels-photo-1126359.jpeg?auto=compress&cs=tinysrgb&w=400', thaiName: 'มิลเฟยเค้ก' },
];

export default function App() {
  const [currentRoute, setCurrentRoute] = useState<Route>('cashier'); 
  const [cart, setCart] = useState<CartItem[]>([]);
  const [ordersHistory, setOrdersHistory] = useState<Order[]>([]);

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item);
      }
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const updateQty = (id: string, delta: number) => {
    setCart((prev) =>
      prev.flatMap((item) => {
        if (item.id !== id) {
          return [item];
        }

        const newQty = item.qty + delta;
        return newQty > 0 ? [{ ...item, qty: newQty }] : [];
      }),
    );
  };

  const clearCart = () => setCart([]);

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const tax = subtotal * 0.07; 
  const total = subtotal + tax;

  const handleConfirmOrder = (paymentData: PaymentData) => {
    const newOrder: Order = {
      id: `TRX-${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`,
      date: new Date().toLocaleString('en-US', { hour12: false }),
      items: [...cart],
      total,
      method: paymentData.method,
      status: 'Completed'
    };
    setOrdersHistory((prev) => [newOrder, ...prev]);
  };

  return (
    // ถอด Wrapper ออกหมด คืนค่าเฉพาะตัวระบบ ให้ไปซ้อนใน Layout อย่างเดียว
    currentRoute === 'admin' ? (
      <AdminDashboard ordersHistory={ordersHistory} onNavigate={() => setCurrentRoute('cashier')} />
    ) : (
      <CashierView 
        cart={cart}
        addToCart={addToCart}
        updateQty={updateQty}
        clearCart={clearCart}
        subtotal={subtotal}
        tax={tax}
        total={total}
        onConfirmOrder={handleConfirmOrder}
        onNavigateAdmin={() => setCurrentRoute('admin')}
      />
    )
  );
}

// ==========================================
// 1. CASHIER VIEW (ENTERPRISE GRADE)
// ==========================================
function CashierView({ 
  cart, addToCart, updateQty, clearCart, 
  subtotal, tax, total, onConfirmOrder, onNavigateAdmin 
}: CashierViewProps) {
  const [activeCategory, setActiveCategory] = useState<CategoryId>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // --- CHECKOUT STATES ---
  const [checkoutStep, setCheckoutStep] = useState<CheckoutStep>('hidden'); 
  const [payMethod, setPayMethod] = useState<PaymentMethod>('cash'); 
  const [receivedAmount, setReceivedAmount] = useState(0);

  const filteredProducts = useMemo(() => {
    let filtered = MOCK_PRODUCTS;
    if (activeCategory !== 'all') {
      filtered = filtered.filter(p => p.category === activeCategory);
    }
    if (searchQuery) {
      filtered = filtered.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.code.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    return filtered;
  }, [activeCategory, searchQuery]);

  return (
    <div className="flex h-full bg-zinc-50 font-sans text-zinc-900 selection:bg-zinc-200">
      
      {/* LEFT PANEL */}
      <div className="flex-1 flex flex-col h-full overflow-hidden border-r border-zinc-200 bg-white">
        
        {/* Header */}
        <header className="px-6 py-4 border-b border-zinc-200 flex justify-between items-center bg-white">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-orange-600 text-white flex items-center justify-center rounded-md shadow-sm">
              <LayoutDashboard size={20} />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-zinc-900">OmniPOS™</h1>
              <p className="text-xs text-zinc-500 font-medium">Terminal 01 • Staff: P. Chumnum</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
              <input 
                type="text" 
                placeholder="Search SKU or Name..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 bg-zinc-100 border-transparent rounded-md text-sm focus:bg-white focus:border-zinc-300 focus:ring-2 focus:ring-zinc-900/10 transition-all w-64 outline-none"
              />
            </div>
            <button className="p-2 text-zinc-400 hover:text-orange-500 transition-colors">
              <Bell size={20} />
            </button>
            <div className="h-6 w-px bg-zinc-200 mx-1"></div>
            <button 
              onClick={onNavigateAdmin}
              className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-md text-sm font-medium transition-colors shadow-sm"
            >
              Backoffice
            </button>
          </div>
        </header>

        {/* Categories */}
        <div className="px-6 py-3 border-b border-zinc-100 flex gap-2 overflow-x-auto bg-zinc-50/50">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all border whitespace-nowrap
                ${activeCategory === cat.id 
                  ? 'bg-orange-50 border-orange-200 text-orange-700 shadow-sm' 
                  : 'bg-transparent border-transparent text-zinc-500 hover:text-orange-600 hover:bg-orange-50/50'}`}
            >
              {cat.icon}
              {cat.name}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        <main className="flex-1 overflow-y-auto p-6 pb-24">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredProducts.map(product => (
              <button
                key={product.id}
                onClick={() => addToCart(product)}
                className="group relative flex flex-col p-4 bg-white rounded-xl border border-zinc-200 hover:border-orange-300 shadow-sm hover:shadow-md transition-all text-left"
              >
                <div className="w-full aspect-[4/3] bg-zinc-100 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                  <img 
                    src={product.image} 
                    alt={product.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(event) => handleImageFallback(event, 'https://placehold.co/400x300?text=No+Image')}
                  />
                </div>
                <span className="text-[10px] uppercase tracking-wider font-semibold text-orange-500 mb-1">{product.code}</span>
                <h3 className="font-semibold text-sm text-zinc-800 line-clamp-2 leading-snug mb-2 group-hover:text-orange-600 transition-colors">{product.name}</h3>
                <div className="mt-auto flex items-center justify-between w-full">
                  <p className="text-sm font-bold text-zinc-900">฿{product.price.toLocaleString()}</p>
                  <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 group-hover:bg-orange-500 group-hover:text-white transition-colors">
                    <Plus size={14} />
                  </div>
                </div>
              </button>
            ))}
          </div>
        </main>
      </div>

      {/* RIGHT PANEL: CART */}
      <div className="w-[400px] bg-white h-full flex flex-col shadow-[-10px_0_30px_rgba(0,0,0,0.03)] z-20">
        
        {/* Cart Header */}
        <div className="p-6 border-b border-zinc-200 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-zinc-900">Current Order</h2>
            <p className="text-xs text-zinc-500 mt-0.5">Order #TRX-Pending</p>
          </div>
          <button onClick={clearCart} className="text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded transition-colors">
            Clear all
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-zinc-400 gap-3">
              <ShoppingCart size={40} strokeWidth={1} />
              <p className="text-sm">No items in the cart</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="flex gap-3 items-start group">
                <div className="flex-1">
                  <h4 className="font-medium text-sm text-zinc-900 leading-tight mb-1">{item.name}</h4>
                  <p className="text-xs text-zinc-500">฿{item.price.toLocaleString()}</p>
                </div>
                
                <div className="flex flex-col items-end gap-2">
                  <p className="font-semibold text-sm text-zinc-900">฿{(item.price * item.qty).toLocaleString()}</p>
                  <div className="flex items-center bg-zinc-100 rounded-md border border-zinc-200">
                    <button onClick={() => updateQty(item.id, -1)} className="w-7 h-7 flex items-center justify-center text-zinc-600 hover:bg-zinc-200 rounded-l-md transition-colors">
                      <Minus size={14} />
                    </button>
                    <span className="w-8 text-center text-xs font-semibold text-zinc-900">{item.qty}</span>
                    <button onClick={() => updateQty(item.id, 1)} className="w-7 h-7 flex items-center justify-center text-zinc-600 hover:bg-zinc-200 rounded-r-md transition-colors">
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Checkout Section */}
        <div className="p-6 bg-zinc-50 border-t border-zinc-200 pb-20">
          <div className="space-y-3 mb-6">
            <div className="flex justify-between text-sm text-zinc-500">
              <span>Subtotal</span>
              <span className="font-medium text-zinc-900">฿{subtotal.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
            </div>
            <div className="flex justify-between text-sm text-zinc-500">
              <span>Tax (VAT 7%)</span>
              <span className="font-medium text-zinc-900">฿{tax.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
            </div>
            <div className="pt-3 border-t border-zinc-200 flex justify-between items-end">
              <span className="text-sm font-semibold text-zinc-900">Total</span>
              <span className="text-3xl font-bold tracking-tight text-zinc-900">฿{total.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
            </div>
          </div>
          
          <button 
            onClick={() => {
              setPayMethod('cash');
              setReceivedAmount(total); 
              setCheckoutStep('payment');
            }}
            disabled={cart.length === 0}
            className="w-full py-4 rounded-lg font-semibold text-white bg-orange-600 hover:bg-orange-700 disabled:bg-zinc-300 disabled:text-zinc-500 transition-all flex items-center justify-center gap-2 shadow-sm shadow-orange-600/20"
          >
            <CreditCard size={18} />
            Charge ฿{total.toLocaleString(undefined, {minimumFractionDigits: 2})}
          </button>
        </div>
      </div>

      {/* --- CHECKOUT MODAL SYSTEM --- */}
      {checkoutStep !== 'hidden' && (
        <div className="fixed inset-0 bg-zinc-900/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
            
            {checkoutStep === 'payment' && (
              <>
                <div className="px-6 py-4 border-b border-zinc-200 flex justify-between items-center bg-zinc-50">
                  <h2 className="text-xl font-bold text-zinc-900">Payment (การชำระเงิน)</h2>
                  <button onClick={() => setCheckoutStep('hidden')} className="text-sm font-medium text-zinc-400 hover:text-zinc-600 transition-colors">Close</button>
                </div>
                
                <div className="flex flex-col md:flex-row h-[500px]">
                  {/* Methods Sidebar */}
                  <div className="w-full md:w-1/3 bg-zinc-50 p-6 border-b md:border-b-0 md:border-r border-zinc-200 space-y-3 flex flex-col">
                    <button 
                      onClick={() => { setPayMethod('cash'); setReceivedAmount(total); }}
                      className={`w-full flex items-center gap-4 p-5 rounded-xl border-2 transition-all ${payMethod === 'cash' ? 'border-orange-500 bg-orange-50/50 text-orange-700 shadow-sm' : 'border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300'}`}
                    >
                      <Banknote size={28} className={payMethod === 'cash' ? 'text-orange-500' : 'text-zinc-400'} />
                      <div className="text-left">
                        <span className="block font-bold text-base">Cash</span>
                        <span className="block text-xs opacity-70">เงินสด</span>
                      </div>
                    </button>
                    <button 
                      onClick={() => setPayMethod('credit')}
                      className={`w-full flex items-center gap-4 p-5 rounded-xl border-2 transition-all ${payMethod === 'credit' ? 'border-orange-500 bg-orange-50/50 text-orange-700 shadow-sm' : 'border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300'}`}
                    >
                      <CreditCard size={28} className={payMethod === 'credit' ? 'text-orange-500' : 'text-zinc-400'} />
                      <div className="text-left">
                        <span className="block font-bold text-base">Credit Card</span>
                        <span className="block text-xs opacity-70">บัตรเครดิต/เดบิต</span>
                      </div>
                    </button>
                    <button 
                      onClick={() => setPayMethod('qr')}
                      className={`w-full flex items-center gap-4 p-5 rounded-xl border-2 transition-all ${payMethod === 'qr' ? 'border-orange-500 bg-orange-50/50 text-orange-700 shadow-sm' : 'border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300'}`}
                    >
                      <QrCode size={28} className={payMethod === 'qr' ? 'text-orange-500' : 'text-zinc-400'} />
                      <div className="text-left">
                        <span className="block font-bold text-base">QR PromptPay</span>
                        <span className="block text-xs opacity-70">สแกนจ่ายคิวอาร์โค้ด</span>
                      </div>
                    </button>
                  </div>

                  {/* Payment Details Area */}
                  <div className="w-full md:w-2/3 p-8 flex flex-col">
                    <div className="flex justify-between items-end mb-8 border-b border-zinc-100 pb-6">
                      <span className="text-zinc-500 font-medium uppercase tracking-wider text-sm">Total Amount Due</span>
                      <span className="text-5xl font-extrabold tracking-tight text-zinc-900">฿{total.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                    </div>

                    <div className="flex-1">
                      {payMethod === 'cash' && (
                        <div className="space-y-6 animate-in fade-in">
                          <div>
                            <label className="block text-sm font-semibold text-zinc-700 mb-3">Received Amount (รับเงินมา)</label>
                            <div className="relative">
                              <span className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-400 font-bold text-2xl">฿</span>
                              <input 
                                type="number" 
                                value={receivedAmount || ''}
                                onChange={(e) => setReceivedAmount(Number(e.target.value))}
                                className="w-full pl-12 pr-6 py-5 bg-zinc-50 border-2 border-zinc-200 rounded-2xl text-3xl font-bold text-right focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all shadow-inner"
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-4 gap-3">
                            <button onClick={() => setReceivedAmount(total)} className="py-3 bg-white border border-zinc-200 hover:border-orange-400 hover:bg-orange-50 hover:text-orange-700 text-zinc-700 font-bold rounded-xl text-sm transition-all shadow-sm">พอดี</button>
                            <button onClick={() => setReceivedAmount(prev => prev + 100)} className="py-3 bg-white border border-zinc-200 hover:border-orange-400 hover:bg-orange-50 hover:text-orange-700 text-zinc-700 font-bold rounded-xl text-sm transition-all shadow-sm">+100</button>
                            <button onClick={() => setReceivedAmount(prev => prev + 500)} className="py-3 bg-white border border-zinc-200 hover:border-orange-400 hover:bg-orange-50 hover:text-orange-700 text-zinc-700 font-bold rounded-xl text-sm transition-all shadow-sm">+500</button>
                            <button onClick={() => setReceivedAmount(prev => prev + 1000)} className="py-3 bg-white border border-zinc-200 hover:border-orange-400 hover:bg-orange-50 hover:text-orange-700 text-zinc-700 font-bold rounded-xl text-sm transition-all shadow-sm">+1,000</button>
                          </div>
                          <div className={`flex justify-between items-center p-6 rounded-2xl border-2 transition-colors ${receivedAmount >= total ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'}`}>
                            <span className={`font-bold text-lg ${receivedAmount >= total ? 'text-emerald-800' : 'text-red-800'}`}>Change (เงินทอน)</span>
                            <span className={`text-3xl font-extrabold ${receivedAmount >= total ? 'text-emerald-600' : 'text-red-500'}`}>
                              {receivedAmount >= total ? `฿${(receivedAmount - total).toLocaleString(undefined, {minimumFractionDigits: 2})}` : 'ยอดเงินไม่พอ'}
                            </span>
                          </div>
                        </div>
                      )}

                      {payMethod === 'credit' && (
                        <div className="h-full flex flex-col items-center justify-center bg-zinc-50 rounded-2xl border-2 border-zinc-200 border-dashed animate-in fade-in p-8 text-center">
                          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm border border-zinc-100 mb-6">
                            <CreditCard size={40} className="text-zinc-400" />
                          </div>
                          <h3 className="text-lg font-bold text-zinc-900 mb-2">Waiting for Card...</h3>
                          <p className="text-zinc-500">Please instruct the customer to swipe, insert, or tap their card on the payment terminal.</p>
                        </div>
                      )}

                      {payMethod === 'qr' && (
                        <div className="h-full flex flex-col items-center justify-center bg-zinc-50 rounded-2xl border-2 border-zinc-200 border-dashed animate-in fade-in p-8 text-center">
                          <div className="w-40 h-40 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-zinc-100 mb-6">
                            <QrCode size={100} className="text-zinc-800" />
                          </div>
                          <h3 className="text-lg font-bold text-zinc-900 mb-2">Scan to Pay</h3>
                          <p className="text-zinc-500">Waiting for customer to scan QR code from their banking application.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-white border-t border-zinc-200 flex justify-end gap-3 rounded-b-2xl">
                  <button 
                    onClick={() => setCheckoutStep('hidden')}
                    className="px-8 py-4 rounded-xl font-bold text-zinc-600 bg-zinc-100 hover:bg-zinc-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() => {
                      if (payMethod === 'cash' && receivedAmount < total) return;
                      onConfirmOrder({ method: payMethod, received: receivedAmount, change: receivedAmount - total });
                      setCheckoutStep('success');
                    }}
                    disabled={payMethod === 'cash' && receivedAmount < total}
                    className="px-10 py-4 rounded-xl font-bold text-white bg-orange-600 hover:bg-orange-700 disabled:bg-zinc-300 disabled:cursor-not-allowed transition-colors shadow-lg shadow-orange-600/30 text-lg"
                  >
                    Confirm Payment
                  </button>
                </div>
              </>
            )}

            {/* --- SUCCESS STATE & RECEIPT --- */}
            {checkoutStep === 'success' && (
              <div className="p-12 text-center flex flex-col items-center bg-white rounded-2xl animate-in zoom-in-95 duration-300">
                <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mb-6">
                  <CheckCircle size={56} className="text-emerald-500" />
                </div>
                <h2 className="text-4xl font-extrabold text-zinc-900 mb-2">Payment Complete!</h2>
                <p className="text-zinc-500 mb-8 font-medium">Transaction has been successfully recorded to the system.</p>
                
                {payMethod === 'cash' && (
                  <div className="bg-zinc-50 p-6 rounded-2xl w-full max-w-sm mb-10 border border-zinc-200 text-left shadow-sm">
                    <div className="flex justify-between mb-3 text-sm">
                      <span className="text-zinc-500 font-medium">Total Due</span>
                      <span className="font-semibold text-zinc-900">฿{total.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                    </div>
                    <div className="flex justify-between mb-4 text-sm">
                      <span className="text-zinc-500 font-medium">Cash Received</span>
                      <span className="font-semibold text-zinc-900">฿{receivedAmount.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                    </div>
                    <div className="flex justify-between pt-4 border-t border-zinc-200 items-center">
                      <span className="font-bold text-zinc-900 text-lg">Change (เงินทอน)</span>
                      <span className="font-extrabold text-emerald-600 text-3xl">฿{(receivedAmount - total).toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                    </div>
                  </div>
                )}

                <div className="flex gap-4 w-full max-w-md">
                  <button 
                    onClick={() => alert('🖨️ ระบบกำลังส่งคำสั่งพิมพ์ไปยังเครื่องพิมพ์ใบเสร็จความร้อน (Thermal Printer)...')} 
                    className="flex-1 py-4 rounded-xl font-bold border-2 border-zinc-200 text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50 transition-all flex justify-center items-center gap-2"
                  >
                    <Printer size={20} /> พิมพ์ใบเสร็จ
                  </button>
                  <button 
                    onClick={() => {
                      clearCart();
                      setCheckoutStep('hidden');
                    }} 
                    className="flex-1 py-4 rounded-xl font-bold bg-zinc-900 text-white hover:bg-zinc-800 transition-all shadow-lg shadow-zinc-900/20"
                  >
                    เริ่มออเดอร์ใหม่
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// 4. ADMIN DASHBOARD (BACKOFFICE)
// ==========================================
function AdminDashboard({ ordersHistory, onNavigate }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview'); 

  const totalSales = ordersHistory.reduce((sum, order) => sum + order.total, 0);
  const totalOrders = ordersHistory.length;

  const NAV_ITEMS: AdminNavItem[] = [
    { id: 'overview', label: 'Overview', icon: LineChart },
    { id: 'transactions', label: 'Transactions', icon: Receipt },
    { id: 'catalog', label: 'Catalog', icon: LayoutGrid },
    { id: 'staff', label: 'Staff', icon: Users },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="flex h-full bg-[#FDFDFD] font-sans text-zinc-900 selection:bg-zinc-200">
      
      {/* Sidebar */}
      <aside className="w-64 bg-zinc-50 border-r border-zinc-200 flex flex-col z-10">
        <div className="px-6 py-5 border-b border-zinc-200 flex items-center gap-3">
          <div className="w-8 h-8 bg-orange-600 text-white rounded flex items-center justify-center">
            <LayoutDashboard size={18} />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight">OmniPOS™</h2>
            <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold mt-0.5">Management</p>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-semibold transition-colors ${
                  isActive 
                    ? 'bg-orange-50 shadow-sm border border-orange-100 text-orange-700' 
                    : 'text-zinc-600 hover:bg-orange-50 hover:text-orange-700 border border-transparent'
                }`}
              >
                <Icon size={16} className={isActive ? 'text-orange-500' : 'text-zinc-400'} /> 
                {item.label}
              </button>
            );
          })}
        </nav>
        <div className="p-4 border-t border-zinc-200">
          <button 
            onClick={onNavigate}
            className="w-full flex items-center gap-2 px-3 py-2 text-zinc-600 hover:bg-zinc-200/50 hover:text-zinc-900 rounded-md text-sm font-medium transition-colors"
          >
            <LogOut size={16} className="text-zinc-400" />
            Exit to Terminal
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-24">
        <div className="max-w-6xl mx-auto p-8 lg:p-12">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="animate-in fade-in duration-300">
              <header className="mb-10 flex justify-between items-end">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Today&apos;s Performance</h1>
                  <p className="text-sm text-zinc-500 mt-2">Real-time metrics from all active terminals.</p>
                </div>
                <div className="flex gap-2">
                  <button className="px-4 py-2 border border-zinc-200 bg-white hover:bg-zinc-50 rounded-md text-sm font-medium transition-colors">Export Report</button>
                </div>
              </header>

              {/* Stats KPIs */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm flex flex-col">
                  <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Gross Volume</span>
                  <span className="text-3xl font-bold tracking-tight">฿{totalSales.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  <div className="mt-4 flex items-center gap-2 text-sm">
                    <span className="text-emerald-600 font-medium bg-emerald-50 px-2 py-0.5 rounded">+12.5%</span>
                    <span className="text-zinc-400">vs last week</span>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm flex flex-col">
                  <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Total Transactions</span>
                  <span className="text-3xl font-bold tracking-tight">{totalOrders}</span>
                  <div className="mt-4 flex items-center gap-2 text-sm">
                    <span className="text-emerald-600 font-medium bg-emerald-50 px-2 py-0.5 rounded">+4.2%</span>
                    <span className="text-zinc-400">vs last week</span>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm flex flex-col">
                  <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Average Ticket Size</span>
                  <span className="text-3xl font-bold tracking-tight">
                    ฿{totalOrders > 0 ? (totalSales / totalOrders).toLocaleString(undefined, { minimumFractionDigits: 2 }) : '0.00'}
                  </span>
                  <div className="mt-4 flex items-center gap-2 text-sm">
                    <span className="text-red-600 font-medium bg-red-50 px-2 py-0.5 rounded">-1.1%</span>
                    <span className="text-zinc-400">vs last week</span>
                  </div>
                </div>
              </div>

              {/* Data Table */}
              <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-zinc-200 flex justify-between items-center">
                  <h2 className="font-semibold text-zinc-900">Recent Transactions</h2>
                  <button className="text-zinc-400 hover:text-zinc-600"><MoreVertical size={18} /></button>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-zinc-50/50 text-xs uppercase tracking-wider font-semibold text-zinc-500 border-b border-zinc-200">
                        <th className="px-6 py-4">Transaction ID</th>
                        <th className="px-6 py-4">Timestamp</th>
                        <th className="px-6 py-4">Items Summary</th>
                        <th className="px-6 py-4 text-right">Amount</th>
                        <th className="px-6 py-4 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      {ordersHistory.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-6 py-12 text-center text-zinc-400">
                            No transactions recorded today.
                          </td>
                        </tr>
                      ) : (
                        ordersHistory.map(order => (
                          <tr key={order.id} className="border-b border-zinc-100 hover:bg-zinc-50 transition-colors">
                            <td className="px-6 py-4 font-medium text-zinc-900">{order.id}</td>
                            <td className="px-6 py-4 text-zinc-500">{order.date}</td>
                            <td className="px-6 py-4 text-zinc-600 truncate max-w-xs">
                              {order.items.map(item => `${item.qty}x ${item.name}`).join(', ')}
                            </td>
                            <td className="px-6 py-4 text-right font-medium text-zinc-900">
                              ฿{order.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                                {order.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TRANSACTIONS */}
          {activeTab === 'transactions' && (
            <div className="animate-in fade-in duration-300">
              <header className="mb-10">
                <h1 className="text-3xl font-bold tracking-tight text-zinc-900">All Transactions</h1>
                <p className="text-sm text-zinc-500 mt-2">View and manage all historical orders.</p>
              </header>
              <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-12 text-center">
                <Receipt className="mx-auto h-12 w-12 text-zinc-300 mb-4" />
                <h3 className="text-lg font-medium text-zinc-900">Transaction History</h3>
                <p className="text-zinc-500 mt-1">Full transaction details will appear here.</p>
              </div>
            </div>
          )}

          {/* TAB 3: CATALOG */}
          {activeTab === 'catalog' && (
            <div className="animate-in fade-in duration-300">
              <header className="mb-10 flex justify-between items-end">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Product Catalog</h1>
                  <p className="text-sm text-zinc-500 mt-2">Manage menus, categories, and inventory.</p>
                </div>
                <button className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-md text-sm font-medium transition-colors shadow-sm">
                  + Add Product
                </button>
              </header>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {MOCK_PRODUCTS.map(p => (
                  <div key={p.id} className="bg-white p-4 rounded-xl border border-zinc-200 flex items-center gap-4 hover:border-orange-300 transition-colors cursor-pointer shadow-sm">
                    <img 
                      src={p.image} 
                      className="w-16 h-16 rounded-lg object-cover bg-zinc-100" 
                      alt={p.name}
                      referrerPolicy="no-referrer"
                      onError={(event) => handleImageFallback(event, 'https://placehold.co/100x100?text=No+Img')}
                    />
                    <div>
                      <p className="text-[10px] text-orange-600 font-bold uppercase tracking-wider">{p.code}</p>
                      <p className="text-sm font-semibold text-zinc-900 line-clamp-1">{p.name}</p>
                      <p className="text-sm text-zinc-500 font-medium mt-0.5">฿{p.price.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: STAFF */}
          {activeTab === 'staff' && (
            <div className="animate-in fade-in duration-300">
              <header className="mb-10">
                <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Staff Management</h1>
                <p className="text-sm text-zinc-500 mt-2">Manage employee roles and access.</p>
              </header>
              <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-12 text-center">
                <Users className="mx-auto h-12 w-12 text-zinc-300 mb-4" />
                <h3 className="text-lg font-medium text-zinc-900">Staff Directory</h3>
                <p className="text-zinc-500 mt-1">Staff configuration module is under development.</p>
              </div>
            </div>
          )}

          {/* TAB 5: SETTINGS */}
          {activeTab === 'settings' && (
            <div className="animate-in fade-in duration-300">
              <header className="mb-10">
                <h1 className="text-3xl font-bold tracking-tight text-zinc-900">System Settings</h1>
                <p className="text-sm text-zinc-500 mt-2">Configure store details, tax rates, and hardware.</p>
              </header>
              <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-12 text-center">
                <Settings className="mx-auto h-12 w-12 text-zinc-300 mb-4" />
                <h3 className="text-lg font-medium text-zinc-900">Preferences</h3>
                <p className="text-zinc-500 mt-1">System settings configuration module is under development.</p>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
