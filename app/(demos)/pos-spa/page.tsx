"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { 
  CalendarDays, ShoppingBag, Users, PackageSearch, LayoutDashboard, LogOut,
  Plus, Minus, Trash2, Banknote, QrCode, Search, CheckCircle2, Clock, 
  UserCircle, Stethoscope, Sparkles, X, BellRing, TrendingUp, Edit, Save, History
} from 'lucide-react';

// ==========================================
// 1. TYPES & INTERFACES
// ==========================================
type Role = 'Admin' | 'Cashier' | 'Therapist';
type BookingStatus = 'Pending' | 'In-Progress' | 'Completed' | 'Cancelled';

interface User { id: string; name: string; role: Role; commissionRate: number; }
interface Service { id: string; name: string; price: number; duration: number; category: 'Massage' | 'Spa' | 'Treatment'; }
interface Product { id: string; name: string; price: number; stock: number; category: 'Retail' | 'Internal'; }
interface Customer { id: string; name: string; phone: string; points: number; healthNotes: string; activePackages: any[]; }
interface Booking { id: string; customerId: string; therapistId: string; serviceId: string; startTime: string; endTime: string; status: BookingStatus; date: string; }
interface CartItem { id: string; name: string; price: number; qty: number; type: 'Service' | 'Product'; }
interface Transaction { id: string; total: number; timestamp: number; }

// ==========================================
// 2. INITIAL MOCK DATA
// ==========================================
const MOCK_USERS: User[] = [
  { id: 'U1', name: 'คุณนภัส (Admin)', role: 'Admin', commissionRate: 0 },
  { id: 'U2', name: 'น้องมายด์ (Cashier)', role: 'Cashier', commissionRate: 0 },
  { id: 'T1', name: 'หมอแอน', role: 'Therapist', commissionRate: 10 },
  { id: 'T2', name: 'หมอจอย', role: 'Therapist', commissionRate: 10 },
  { id: 'T3', name: 'หมอนก', role: 'Therapist', commissionRate: 15 },
];

const MOCK_SERVICES: Service[] = [
  { id: 'S1', name: 'นวดแผนไทย (Thai)', price: 500, duration: 60, category: 'Massage' },
  { id: 'S2', name: 'นวดน้ำมันอโรม่า', price: 800, duration: 60, category: 'Massage' },
  { id: 'S3', name: 'สครับผิว (Scrub)', price: 1200, duration: 90, category: 'Spa' },
  { id: 'S4', name: 'นวดศีรษะ บ่า ไหล่', price: 400, duration: 30, category: 'Treatment' },
  { id: 'S5', name: 'นวดฝ่าเท้า (Foot)', price: 350, duration: 45, category: 'Massage' },
  { id: 'S6', name: 'ประคบสมุนไพร', price: 600, duration: 45, category: 'Treatment' },
];

const INITIAL_PRODUCTS: Product[] = [
  { id: 'P1', name: 'Aroma Oil (Lavender)', price: 350, stock: 24, category: 'Retail' },
  { id: 'P2', name: 'Herbal Balm (Green)', price: 150, stock: 50, category: 'Retail' },
  { id: 'P3', name: 'Herbal Balm (Yellow)', price: 150, stock: 35, category: 'Retail' },
  { id: 'P4', name: 'Massage Oil (Gallon)', price: 1200, stock: 5, category: 'Internal' },
  { id: 'P5', name: 'Aroma Diffuser', price: 850, stock: 10, category: 'Retail' },
  { id: 'P6', name: 'Spa Scrub Cream', price: 290, stock: 15, category: 'Retail' },
];

const INITIAL_CUSTOMERS: Customer[] = [
  { id: 'C1', name: 'คุณสมชาย ใจดี', phone: '081-111-1111', points: 150, healthNotes: 'ปวดหลังช่วงล่าง', activePackages: [] },
  { id: 'C2', name: 'คุณวิภาวรรณ', phone: '089-222-2222', points: 420, healthNotes: 'แพ้น้ำมันกุหลาบ', activePackages: [] },
];

const INITIAL_BOOKINGS: Booking[] = [
  { id: 'B1', customerId: 'C1', therapistId: 'T1', serviceId: 'S1', startTime: '10:00', endTime: '11:00', status: 'Completed', date: new Date().toISOString().split('T')[0] },
  { id: 'B2', customerId: 'C2', therapistId: 'T2', serviceId: 'S2', startTime: '13:00', endTime: '14:00', status: 'In-Progress', date: new Date().toISOString().split('T')[0] },
];

// ==========================================
// 3. SOUND ENGINE
// ==========================================
const playSound = (type: 'success' | 'click' | 'error' | 'pop') => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    const now = ctx.currentTime;

    if (type === 'success') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.setValueAtTime(1760, now + 0.1);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
      osc.start(now); osc.stop(now + 0.4);
    } else if(type === 'error') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, now);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
      osc.start(now); osc.stop(now + 0.3);
    } else if (type === 'pop') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(400, now + 0.1);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
      osc.start(now); osc.stop(now + 0.1);
    } else {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, now);
      gain.gain.setValueAtTime(0.02, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
      osc.start(now); osc.stop(now + 0.1);
    }
  } catch (e) {}
};

// ==========================================
// 4. MAIN APP COMPONENT
// ==========================================
export default function SpaManagementApp() {
  const [currentUser, setCurrentUser] = useState<User>(MOCK_USERS[0]); 
  const [currentView, setCurrentView] = useState<'dashboard' | 'calendar' | 'pos' | 'crm' | 'inventory'>('pos');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [bookings, setBookings] = useState<Booking[]>(INITIAL_BOOKINGS);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [customers, setCustomers] = useState<Customer[]>(INITIAL_CUSTOMERS);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const [showNotification, setShowNotification] = useState<{msg: string, type: 'success'|'error'} | null>(null);

  const notify = (msg: string, type: 'success'|'error' = 'success') => {
    playSound(type);
    setShowNotification({msg, type});
    setTimeout(() => setShowNotification(null), 3000);
  };

  const navItems = useMemo(() => [
    { id: 'dashboard', label: 'ภาพรวมระบบ', icon: <LayoutDashboard className="w-5 h-5" />, roles: ['Admin'] },
    { id: 'calendar', label: 'ตารางคิว', icon: <CalendarDays className="w-5 h-5" />, roles: ['Admin', 'Cashier', 'Therapist'] },
    { id: 'pos', label: 'คิดเงิน (POS)', icon: <Banknote className="w-5 h-5" />, roles: ['Admin', 'Cashier'] },
    { id: 'crm', label: 'ลูกค้าสมาชิก', icon: <Users className="w-5 h-5" />, roles: ['Admin', 'Cashier'] },
    { id: 'inventory', label: 'จัดการสต๊อก', icon: <PackageSearch className="w-5 h-5" />, roles: ['Admin'] },
  ].filter((item: { roles: string[] }) => item.roles.includes(currentUser.role)), [currentUser]);

  useEffect(() => {
    if (currentUser.role === 'Therapist') setCurrentView('calendar');
    else if (!navItems.find((i: { id: string }) => i.id === currentView)) setCurrentView('calendar');
  }, [currentUser, navItems, currentView]);

  return (
    // โครงสร้างหลัก: ล็อคความสูง 100dvh ไม่ให้เลื่อนทะลุจอ
    <div className="flex h-full min-h-0 w-full bg-[#f4f7f6] text-slate-800 font-sans overflow-hidden selection:bg-[#4d7c73]/30">
      
      {showNotification && (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-[100] px-5 py-2.5 md:px-6 md:py-3 rounded-full shadow-2xl flex items-center gap-2 md:gap-3 animate-in fade-in slide-in-from-top-4 duration-300 w-[90%] md:w-auto justify-center ${showNotification.type === 'error' ? 'bg-red-600 text-white' : 'bg-[#2d4a43] text-white'}`}>
          <CheckCircle2 className={`w-5 h-5 shrink-0 ${showNotification.type === 'error' ? 'text-red-200' : 'text-[#a8d5ba]'}`} />
          <span className="font-medium text-sm md:text-base tracking-wide truncate">{showNotification.msg}</span>
        </div>
      )}

      {/* --- Sidebar (Desktop) --- */}
      <aside className="hidden lg:flex w-64 min-h-0 shrink-0 bg-[#2d4a43] text-white flex-col justify-between z-20 shadow-xl">
        <div className="flex min-h-0 flex-col h-full overflow-hidden">
          <div className="h-20 shrink-0 flex items-center px-6 border-b border-white/10 bg-[#243b35]">
            <div className="bg-gradient-to-br from-[#d4af37] to-[#aa8c2c] p-2 rounded-xl text-white shadow-inner">
              <Sparkles className="w-6 h-6" />
            </div>
            <div className="ml-3">
              <span className="block font-bold text-xl tracking-wider text-[#fceeb5]" style={{fontFamily: 'serif'}}>Nirvana</span>
              <span className="block text-[10px] text-[#a8d5ba] uppercase tracking-widest mt-0.5">Spa & Massage</span>
            </div>
          </div>
          <div className="flex-1 min-h-0 overflow-y-auto py-6 px-4 space-y-2 hide-scrollbar">
            {navItems.map((item: any) => (
              <button
                key={item.id}
                onClick={() => { playSound('click'); setCurrentView(item.id as any); }}
                className={`w-full flex items-center px-4 py-3 rounded-xl transition-all duration-200 group ${
                  currentView === item.id 
                    ? 'bg-[#3b6057] text-white shadow-md border-l-4 border-[#d4af37]' 
                    : 'text-[#a8d5ba] hover:bg-[#3b6057]/50 hover:text-white'
                }`}
              >
                <div className={`${currentView === item.id ? 'text-[#d4af37]' : 'text-[#82b49b] group-hover:text-[#d4af37]'} transition-colors`}>{item.icon}</div>
                <span className="ml-3 font-medium text-sm tracking-wide">{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="shrink-0 p-4 border-t border-white/10 bg-[#243b35]">
          <div className="mb-3 px-2">
            <p className="text-[10px] text-[#82b49b] uppercase tracking-wider mb-2">Simulate Role</p>
            <select 
              className="w-full bg-[#1d302b] text-[#d4af37] border border-white/10 rounded-lg px-2 py-2 text-xs focus:outline-none font-bold"
              value={currentUser.id}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                const user = MOCK_USERS.find((u: User) => u.id === e.target.value);
                if (user) { setCurrentUser(user); playSound('click'); }
              }}
            >
              {MOCK_USERS.map((u: User) => <option key={u.id} value={u.id}>[{u.role}] {u.name}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="w-10 h-10 shrink-0 rounded-full bg-gradient-to-tr from-[#d4af37] to-[#8c701c] flex items-center justify-center text-white font-bold shadow-md">
              {currentUser.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate">{currentUser.name}</p>
              <p className="text-[10px] text-[#a8d5ba] uppercase tracking-wider truncate">{currentUser.role}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* --- Main Content Area --- */}
      <div className="flex-1 flex min-h-0 flex-col h-full w-full overflow-hidden bg-[#f4f7f6]">
        
        {/* Mobile Header */}
        <header className="lg:hidden shrink-0 h-16 bg-[#2d4a43] text-white flex items-center justify-between px-4 shadow-md z-30">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#d4af37]" />
            <span className="font-bold text-lg text-[#fceeb5]" style={{fontFamily: 'serif'}}>Nirvana Spa</span>
          </div>
          <button className="p-2" onClick={() => setIsMobileMenuOpen(true)}>
             <UserCircle className="w-6 h-6 text-[#a8d5ba]" />
          </button>
        </header>

        {/* Views Container: Flex-1 และ Overflow Hidden ให้แต่ละ View ควบคุม Scroll ของตัวเอง */}
        <main className="relative z-10 flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden">
          {currentView === 'dashboard' && <DashboardView bookings={bookings} products={products} transactions={transactions} />}
          {currentView === 'calendar' && <CalendarView bookings={bookings} setBookings={setBookings} currentUser={currentUser} notify={notify} customers={customers} services={MOCK_SERVICES} therapists={MOCK_USERS.filter((u: User)=>u.role==='Therapist')} />}
          {currentView === 'pos' && <POSView products={products} setProducts={setProducts} customers={customers} setCustomers={setCustomers} notify={notify} transactions={transactions} setTransactions={setTransactions} services={MOCK_SERVICES} />}
          {currentView === 'crm' && <CRMView customers={customers} setCustomers={setCustomers} notify={notify} />}
          {currentView === 'inventory' && <InventoryView products={products} setProducts={setProducts} notify={notify} />}
        </main>

        {/* Mobile Bottom Nav */}
        <nav className="lg:hidden shrink-0 bg-white border-t border-slate-200 flex justify-around items-center h-[65px] z-40 shadow-[0_-5px_20px_rgba(0,0,0,0.05)] pb-safe">
          {navItems.slice(0, 4).map((item: any) => (
            <button 
              key={item.id}
              onClick={() => { playSound('click'); setCurrentView(item.id as any); }} 
              className={`flex flex-col items-center justify-center w-full h-full relative transition-colors ${currentView === item.id ? 'text-[#2d4a43]' : 'text-slate-400'}`}
            >
              <div className={`mb-1 transition-transform ${currentView === item.id ? 'scale-110 text-[#d4af37]' : ''}`}>{item.icon}</div>
              <span className={`text-[10px] font-bold whitespace-nowrap ${currentView === item.id ? 'text-[#2d4a43]' : 'text-slate-500'}`}>{item.label.split(' ')[0]}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Mobile Menu Modal */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-[100] flex items-end bg-black/50 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="w-full bg-white rounded-t-3xl p-6 animate-in slide-in-from-bottom-full duration-300 pb-10" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-lg text-slate-800">สลับผู้ใช้งาน (Demo)</h3>
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 bg-slate-100 rounded-full"><X className="w-5 h-5"/></button>
            </div>
            <div className="space-y-3 pb-safe">
              {MOCK_USERS.map((u: User) => (
                <button 
                  key={u.id}
                  onClick={() => { setCurrentUser(u); playSound('click'); setIsMobileMenuOpen(false); }}
                  className={`w-full flex items-center p-4 rounded-2xl border transition-all ${currentUser.id === u.id ? 'bg-[#2d4a43] text-white border-[#2d4a43]' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'}`}
                >
                  <UserCircle className={`w-6 h-6 mr-3 shrink-0 ${currentUser.id === u.id ? 'text-[#d4af37]' : 'text-slate-400'}`} />
                  <div className="text-left min-w-0">
                    <p className="font-bold truncate">{u.name}</p>
                    <p className={`text-xs truncate ${currentUser.id === u.id ? 'text-[#a8d5ba]' : 'text-slate-500'}`}>Role: {u.role}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// VIEWS IMPLEMENTATION
// ==========================================

// --- 1. Dashboard View ---
interface DashboardViewProps { bookings: Booking[], products: Product[], transactions: Transaction[] }

function DashboardView({ bookings, products, transactions }: DashboardViewProps) {
  const completedBookings = bookings.filter((b: Booking) => b.status === 'Completed').length;
  const actualRevenue = transactions.reduce((sum: number, tx: Transaction) => sum + tx.total, 0); 
  const displayRevenue = actualRevenue + (completedBookings * 800); 
  const lowStock = products.filter((p: Product) => p.stock <= 10).length;

  return (
    <div className="h-full w-full overflow-y-auto p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300 pb-8">
        <header className="mb-6 shrink-0">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight">ภาพรวมธุรกิจ (Dashboard)</h1>
          <p className="text-slate-500 mt-1 font-medium text-sm md:text-base">ข้อมูลอัปเดตแบบเรียลไทม์ตามการใช้งานจริง</p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <StatCard title="ยอดขายรวม (บาท)" value={`฿${displayRevenue.toLocaleString()}`} icon={<TrendingUp />} color="from-[#2d4a43] to-[#3b6057]" iconColor="text-[#d4af37]" />
          <StatCard title="ลูกค้าใช้บริการ (คิว)" value={completedBookings.toString()} icon={<CheckCircle2 />} color="from-[#d4af37] to-[#bf9b2e]" iconColor="text-white" />
          <StatCard title="คิวจองล่วงหน้า" value={bookings.filter((b: Booking) => b.status === 'Pending').length.toString()} icon={<CalendarDays />} color="from-[#475569] to-[#334155]" iconColor="text-[#cbd5e1]" />
          <StatCard title="สินค้าใกล้หมด (<10)" value={lowStock.toString()} icon={<BellRing />} color={lowStock > 0 ? "from-[#ef4444] to-[#b91c1c]" : "from-[#10b981] to-[#047857]"} iconColor="text-white" />
        </div>

        {transactions.length > 0 && (
           <div className="bg-white p-5 md:p-6 rounded-3xl shadow-sm border border-slate-200 mt-6">
              <h3 className="font-bold text-lg text-slate-800 mb-4 border-b border-slate-100 pb-3 flex items-center gap-2"><History className="w-5 h-5 text-slate-400"/> ประวัติการขายล่าสุด</h3>
              <div className="space-y-3">
                 {transactions.slice().reverse().slice(0, 5).map((tx: Transaction) => (
                   <div key={tx.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                     <div className="min-w-0 pr-4">
                       <p className="font-bold text-slate-700 text-sm truncate">ใบเสร็จ #{tx.id.slice(-6)}</p>
                       <p className="text-xs text-slate-400">{new Date(tx.timestamp).toLocaleTimeString()}</p>
                     </div>
                     <span className="font-bold text-[#2d4a43] shrink-0 whitespace-nowrap">฿{tx.total.toLocaleString()}</span>
                   </div>
                 ))}
              </div>
           </div>
        )}
      </div>
    </div>
  );
}

// --- 2. Calendar / Booking View ---
function CalendarView({ bookings, setBookings, currentUser, notify, customers, services, therapists }: any) {
  const hours = Array.from({ length: 11 }, (_, i) => i + 10); 
  const displayTherapists = currentUser.role === 'Therapist' ? therapists.filter((t: User) => t.id === currentUser.id) : therapists;

  const [modalOpen, setModalOpen] = useState(false);
  const [editBookingId, setEditBookingId] = useState<string|null>(null);
  const [formData, setFormData] = useState({
    customerId: customers[0]?.id || '',
    therapistId: therapists[0]?.id || '',
    serviceId: services[0]?.id || '',
    time: '10:00',
    status: 'Pending' as BookingStatus
  });

  const getStatusColor = (status: BookingStatus) => {
    switch(status) {
      case 'Pending': return 'bg-amber-100 border-amber-300 text-amber-800 hover:bg-amber-200';
      case 'In-Progress': return 'bg-blue-100 border-blue-300 text-blue-800 hover:bg-blue-200';
      case 'Completed': return 'bg-[#e6f4ea] border-[#a8d5ba] text-[#2d4a43] hover:bg-[#d5ecd8]';
      case 'Cancelled': return 'bg-red-100 border-red-300 text-red-800 line-through opacity-60 hover:opacity-100';
    }
  };

  const openNewBooking = (thId: string, timeStr: string) => {
    if(currentUser.role === 'Therapist') return; 
    setEditBookingId(null);
    setFormData({ ...formData, therapistId: thId, time: timeStr, status: 'Pending' });
    setModalOpen(true);
    playSound('click');
  };

  const openEditBooking = (b: Booking) => {
    setEditBookingId(b.id);
    setFormData({ customerId: b.customerId, therapistId: b.therapistId, serviceId: b.serviceId, time: b.startTime, status: b.status });
    setModalOpen(true);
    playSound('click');
  };

  const handleSaveBooking = () => {
    const isOverlap = bookings.some((b: Booking) => b.therapistId === formData.therapistId && b.startTime === formData.time && b.id !== editBookingId && b.status !== 'Cancelled');
    if (isOverlap && formData.status !== 'Cancelled') {
      return notify('หมอนวดคิวไม่ว่างในเวลานี้!', 'error');
    }

    if (editBookingId) {
      setBookings((prev: Booking[]) => prev.map((b: Booking) => b.id === editBookingId ? { 
        ...b, customerId: formData.customerId, therapistId: formData.therapistId, serviceId: formData.serviceId, startTime: formData.time, status: formData.status 
      } : b));
      notify('อัปเดตคิวสำเร็จ');
    } else {
      const newBooking: Booking = {
        id: 'B' + Date.now(),
        customerId: formData.customerId,
        therapistId: formData.therapistId,
        serviceId: formData.serviceId,
        startTime: formData.time,
        endTime: `${parseInt(formData.time.split(':')[0]) + 1}:00`, 
        status: 'Pending',
        date: new Date().toISOString().split('T')[0]
      };
      setBookings((prev:Booking[]) => [...prev, newBooking]);
      notify('เพิ่มคิวใหม่สำเร็จ');
    }
    setModalOpen(false);
  };

  return (
    <div className="h-full w-full flex flex-col bg-white relative overflow-hidden">
      <header className="shrink-0 p-4 md:p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-800 flex items-center gap-2">
            <CalendarDays className="text-[#2d4a43]"/> ตารางคิวนวด
          </h1>
          <p className="text-slate-500 text-[11px] md:text-sm mt-1">แตะช่องว่างเพื่อเพิ่มคิว / แตะที่คิวเพื่อเปลี่ยนสถานะ</p>
        </div>
      </header>

      {/* Area นี้คือส่วนที่เลื่อนได้อิสระ ไม่เกี่ยวกับความสูงหลัก */}
      <div className="flex-1 overflow-auto bg-slate-50 p-2 md:p-4">
        <div className="min-w-[700px] bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col mb-4">
          <div className="flex border-b border-slate-200 bg-[#f8faf9] sticky top-0 z-10 rounded-t-2xl">
            <div className="w-16 md:w-20 shrink-0 border-r border-slate-200 p-2 text-center text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center justify-center">เวลา</div>
            {displayTherapists.map((t: User) => (
              <div key={t.id} className="flex-1 border-r border-slate-200 p-2 md:p-3 text-center flex items-center justify-center gap-2">
                <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-[#2d4a43] text-white flex items-center justify-center font-bold text-xs shrink-0">{t.name.charAt(0)}</div>
                <span className="font-bold text-slate-700 text-xs md:text-sm truncate">{t.name}</span>
              </div>
            ))}
          </div>

          <div className="flex-1 relative">
            {hours.map((hour: number) => (
              <div key={hour} className="flex border-b border-slate-100 h-20 md:h-24 group">
                <div className="w-16 md:w-20 shrink-0 border-r border-slate-200 p-2 text-right text-xs font-bold text-slate-500 flex flex-col justify-start">
                  {hour}:00
                </div>
                {displayTherapists.map((t: User) => {
                  const slotBooking = bookings.find((b: Booking) => b.therapistId === t.id && b.startTime.startsWith(`${hour}:`));
                  return (
                    <div 
                      key={`${t.id}-${hour}`} 
                      className="flex-1 border-r border-slate-100 p-1 relative hover:bg-slate-50 transition-colors cursor-pointer"
                      onClick={() => !slotBooking ? openNewBooking(t.id, `${hour}:00`) : openEditBooking(slotBooking)}
                    >
                      {slotBooking ? (
                        <div className={`w-full h-full rounded-xl border p-1.5 md:p-2 flex flex-col justify-between shadow-sm transition-transform active:scale-95 overflow-hidden ${getStatusColor(slotBooking.status)}`}>
                          <div className="min-w-0">
                            <p className="text-[11px] md:text-xs font-bold truncate">{customers.find((c: Customer) => c.id === slotBooking.customerId)?.name || 'Walk-in'}</p>
                            <p className="text-[9px] md:text-[10px] font-medium opacity-80 truncate">{services.find((s: Service) => s.id === slotBooking.serviceId)?.name}</p>
                          </div>
                          <div className="text-[9px] md:text-[10px] font-bold flex justify-between items-center mt-1">
                            <span className="truncate pr-1"><Clock className="inline w-3 h-3 mb-0.5"/> {slotBooking.startTime}</span>
                            <span className="uppercase tracking-wider opacity-70 truncate max-w-[50%] text-right">{slotBooking.status}</span>
                          </div>
                        </div>
                      ) : (
                        currentUser.role !== 'Therapist' && (
                          <div className="hidden group-hover:flex w-full h-full items-center justify-center opacity-20">
                            <Plus className="w-6 h-6 md:w-8 md:h-8 text-[#2d4a43]" />
                          </div>
                        )
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-5 md:p-6 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
            <h2 className="text-xl font-bold text-slate-800 mb-4">{editBookingId ? 'จัดการคิวจอง' : 'สร้างคิวใหม่'}</h2>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-500 mb-1 block">ลูกค้า</label>
                <select value={formData.customerId} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData({...formData, customerId: e.target.value})} className="w-full border border-slate-300 rounded-xl p-2.5 md:p-3 focus:border-[#2d4a43] outline-none bg-white text-sm">
                  {customers.map((c: Customer) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 mb-1 block">บริการ</label>
                <select value={formData.serviceId} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData({...formData, serviceId: e.target.value})} className="w-full border border-slate-300 rounded-xl p-2.5 md:p-3 focus:border-[#2d4a43] outline-none bg-white text-sm">
                  {services.map((s: Service) => <option key={s.id} value={s.id}>{s.name} (฿{s.price})</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-500 mb-1 block">หมอนวด</label>
                  <select value={formData.therapistId} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData({...formData, therapistId: e.target.value})} className="w-full border border-slate-300 rounded-xl p-2.5 md:p-3 focus:border-[#2d4a43] outline-none bg-white text-sm" disabled={currentUser.role === 'Therapist'}>
                    {therapists.map((t: User) => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 mb-1 block">เวลา</label>
                  <select value={formData.time} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData({...formData, time: e.target.value})} className="w-full border border-slate-300 rounded-xl p-2.5 md:p-3 focus:border-[#2d4a43] outline-none bg-white text-sm">
                    {hours.map((h: number) => <option key={h} value={`${h}:00`}>{h}:00</option>)}
                  </select>
                </div>
              </div>
              
              {editBookingId && (
                <div>
                  <label className="text-xs font-bold text-slate-500 mb-1 block">สถานะคิว</label>
                  <select value={formData.status} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData({...formData, status: e.target.value as BookingStatus})} className="w-full border border-slate-300 rounded-xl p-2.5 md:p-3 focus:border-[#2d4a43] outline-none font-bold text-[#2d4a43] bg-white text-sm">
                    <option value="Pending">รอรับบริการ (Pending)</option>
                    <option value="In-Progress">กำลังนวด (In-Progress)</option>
                    <option value="Completed">เสร็จสิ้น (Completed)</option>
                    <option value="Cancelled">ยกเลิก (Cancelled)</option>
                  </select>
                </div>
              )}
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setModalOpen(false)} className="flex-1 py-3 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors text-sm">ยกเลิก</button>
              <button onClick={handleSaveBooking} className="flex-1 py-3 rounded-xl font-bold text-white bg-[#2d4a43] hover:bg-[#1d302b] shadow-lg shadow-[#2d4a43]/30 transition-all active:scale-95 flex items-center justify-center gap-2 text-sm">
                <Save className="w-4 h-4"/> บันทึก
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- 3. POS View (Fixed Panel Layout - No Scroll Overflow) ---
interface POSViewProps { products: Product[], setProducts: any, customers: Customer[], setCustomers: any, notify: any, transactions: Transaction[], setTransactions: any, services: Service[] }

function POSView({ products, setProducts, customers, setCustomers, notify, transactions, setTransactions, services }: POSViewProps) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [activeTab, setActiveTab] = useState<'Services' | 'Products'>('Services');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');

  const addToCart = (item: any, type: 'Service' | 'Product') => {
    playSound('pop');
    setCart((prev: CartItem[]) => {
      const existing = prev.find((c: CartItem) => c.id === item.id);
      if (existing) return prev.map((c: CartItem) => c.id === item.id ? { ...c, qty: c.qty + 1 } : c);
      return [...prev, { ...item, qty: 1, type }];
    });
  };

  const updateQty = (id: string, delta: number) => {
    playSound('click');
    setCart((prev: CartItem[]) => prev.map((c: CartItem) => c.id === id ? { ...c, qty: Math.max(1, c.qty + delta) } : c));
  };
  const removeItem = (id: string) => setCart((prev: CartItem[]) => prev.filter((i: CartItem) => i.id !== id));

  const subtotal = cart.reduce((sum: number, item: CartItem) => sum + (item.price * item.qty), 0);
  const selectedCustomer = customers.find((c: Customer) => c.id === selectedCustomerId);
  
  const usePoints = selectedCustomer && selectedCustomer.points >= 100;
  const discount = usePoints ? 100 : 0; 
  const total = subtotal - discount;

  const handleCheckout = (method: string) => {
    if (cart.length === 0) return;
    
    // Deduct Inventory
    const productItems = cart.filter((c: CartItem) => c.type === 'Product');
    if (productItems.length > 0) {
      setProducts((prev: Product[]) => prev.map((p: Product) => {
        const inCart = productItems.find((c: CartItem) => c.id === p.id);
        return inCart ? { ...p, stock: Math.max(0, p.stock - inCart.qty) } : p;
      }));
    }

    // Update Points
    if (selectedCustomerId) {
      setCustomers((prev: Customer[]) => prev.map((c: Customer) => {
        if (c.id === selectedCustomerId) {
           let newPoints = c.points;
           if (usePoints) newPoints -= 100; 
           newPoints += Math.floor(total / 100); 
           return { ...c, points: newPoints };
        }
        return c;
      }));
    }

    // Record Transaction
    setTransactions((prev: Transaction[]) => [...prev, { id: 'TX-'+Date.now(), total: total, timestamp: Date.now() }]);

    setCart([]);
    setSelectedCustomerId('');
    notify(`รับชำระเงิน ฿${total.toLocaleString()} สำเร็จ!`, 'success');
  };

  return (
    // โครงสร้างบังคับความสูง 100% ของคอนเทนเนอร์แม่
    <div className="flex h-full min-h-0 w-full flex-col overflow-hidden bg-[#f4f7f6] lg:flex-row">
      
      {/* --- Left Panel (รายการนวด/สินค้า) --- */}
      <div className="grid h-[55%] min-h-0 shrink-0 grid-rows-[auto_minmax(0,1fr)] overflow-hidden border-b border-slate-200 bg-slate-50 lg:h-full lg:flex-1 lg:shrink lg:border-b-0 lg:border-r">
        <header className="bg-white p-2 md:p-4 flex gap-2 border-b border-slate-200 shadow-sm shrink-0">
          <button onClick={() => setActiveTab('Services')} className={`flex-1 py-2 md:py-3 rounded-lg md:rounded-xl font-bold text-[11px] md:text-sm transition-all whitespace-nowrap ${activeTab === 'Services' ? 'bg-[#2d4a43] text-white shadow-md' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>บริการนวด/สปา</button>
          <button onClick={() => setActiveTab('Products')} className={`flex-1 py-2 md:py-3 rounded-lg md:rounded-xl font-bold text-[11px] md:text-sm transition-all whitespace-nowrap ${activeTab === 'Products' ? 'bg-[#2d4a43] text-white shadow-md' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>สินค้าหน้าร้าน</button>
        </header>
        
        {/* ตรงนี้เท่านั้นที่เลื่อนขึ้นลงได้ */}
        <div className="min-h-0 overflow-y-auto overscroll-y-contain p-2 md:p-4">
          {activeTab === 'Services' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 md:gap-3">
              {services.map((s: Service) => (
                <div key={s.id} onClick={() => addToCart(s, 'Service')} className="bg-white p-3 md:p-4 rounded-xl md:rounded-2xl border border-slate-200 shadow-sm hover:border-[#d4af37] hover:shadow-md cursor-pointer transition-all active:scale-95 text-center group flex flex-col justify-between">
                  <div>
                    <div className="w-8 h-8 md:w-12 md:h-12 mx-auto bg-[#f4f7f6] rounded-full flex items-center justify-center mb-2 group-hover:bg-[#fceeb5] transition-colors">
                      <Stethoscope className="w-4 h-4 md:w-6 md:h-6 text-[#2d4a43]" />
                    </div>
                    <p className="font-bold text-slate-800 text-[11px] md:text-sm leading-tight line-clamp-2">{s.name}</p>
                  </div>
                  <div>
                    <p className="text-[10px] md:text-xs text-slate-500 my-1"><Clock className="inline w-3 h-3 mb-0.5"/> {s.duration} นาที</p>
                    <p className="text-[#d4af37] font-black text-sm md:text-base">฿{s.price}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 md:gap-3">
              {products.filter((p: Product) => p.category === 'Retail').map((p: Product) => (
                <div key={p.id} onClick={() => p.stock > 0 && addToCart(p, 'Product')} className={`bg-white p-3 md:p-4 rounded-xl md:rounded-2xl border border-slate-200 shadow-sm transition-all text-center group flex flex-col justify-between relative ${p.stock > 0 ? 'hover:border-[#d4af37] hover:shadow-md cursor-pointer active:scale-95' : 'opacity-50 grayscale'}`}>
                  <div>
                    <div className="w-8 h-8 md:w-12 md:h-12 mx-auto bg-blue-50 rounded-full flex items-center justify-center mb-2">
                      <ShoppingBag className="w-4 h-4 md:w-6 md:h-6 text-blue-600" />
                    </div>
                    <p className="font-bold text-slate-800 text-[11px] md:text-sm leading-tight line-clamp-2">{p.name}</p>
                  </div>
                  <div>
                    <p className="text-[10px] md:text-xs text-slate-500 my-1">คงเหลือ: {p.stock}</p>
                    <p className="text-[#d4af37] font-black text-sm md:text-base">฿{p.price}</p>
                  </div>
                  {p.stock === 0 && <span className="text-[9px] font-bold text-white bg-red-500 px-1.5 py-0.5 rounded absolute top-2 right-2">หมด</span>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* --- Right Panel (ตะกร้าและคิดเงิน) --- */}
      <div className="z-20 grid h-[45%] min-h-0 w-full shrink-0 grid-rows-[auto_minmax(0,1fr)_auto] overflow-hidden bg-white shadow-2xl lg:h-full lg:w-[400px] lg:shadow-none">
        
        {/* ส่วนเลือกลูกค้า (ล็อคติดขอบบนของ Right Panel) */}
        <div className="p-2 md:p-4 border-b border-slate-100 bg-[#f8faf9] shrink-0">
            <select 
              className="w-full bg-white border border-slate-300 text-slate-700 rounded-lg md:rounded-xl px-3 py-2 md:py-3 focus:outline-none focus:border-[#2d4a43] focus:ring-1 focus:ring-[#2d4a43] text-xs md:text-sm font-medium shadow-sm truncate"
              value={selectedCustomerId}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedCustomerId(e.target.value)}
            >
              <option value="">+ เลือกลูกค้า (Walk-in)</option>
              {customers.map((c: Customer) => <option key={c.id} value={c.id}>{c.name} ({c.points} Pts)</option>)}
            </select>
            {selectedCustomer && (
               <div className="mt-2 md:mt-3 p-2 md:p-3 bg-emerald-50 border border-emerald-100 rounded-lg md:rounded-xl text-[10px] md:text-sm">
                  <div className="flex justify-between">
                    <p className="font-bold text-emerald-800 truncate pr-2">{selectedCustomer.name}</p>
                    <p className="text-emerald-600 font-bold whitespace-nowrap">{selectedCustomer.points} Pts</p>
                  </div>
                  {usePoints && <p className="text-[9px] md:text-xs text-emerald-500 mt-0.5">*หัก 100 Pts เป็นส่วนลด 100฿</p>}
               </div>
            )}
        </div>

        {/* ส่วนรายการสินค้า (ตรงนี้เท่านั้นที่เลื่อนขึ้นลงได้) */}
        <div className="min-h-0 overflow-y-auto overscroll-y-contain p-2 md:p-4 space-y-2 bg-white md:space-y-3">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-300">
              <ShoppingBag className="w-12 h-12 md:w-16 md:h-16 mb-3 opacity-30" />
              <p className="text-sm font-medium">ยังไม่มีรายการในบิล</p>
            </div>
          ) : (
            cart.map((item: CartItem) => (
              <div key={item.id} className="bg-slate-50 border border-slate-100 p-2 md:p-3 rounded-xl flex items-center justify-between animate-in fade-in zoom-in-95 duration-200">
                <div className="flex-1 min-w-0 pr-2">
                  <div className="flex items-center gap-1.5 md:gap-2 mb-0.5 md:mb-1">
                    <span className={`text-[8px] md:text-[10px] font-bold px-1 py-0.5 rounded shrink-0 ${item.type === 'Service' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>{item.type === 'Service' ? 'นวด' : 'สินค้า'}</span>
                    <h4 className="font-bold text-slate-800 text-xs md:text-sm truncate leading-tight">{item.name}</h4>
                  </div>
                  <p className="text-[11px] md:text-sm font-black text-[#2d4a43]">฿{item.price}</p>
                </div>
                <div className="flex flex-col items-end gap-1.5 md:gap-2 shrink-0">
                  <button onClick={() => removeItem(item.id)} className="text-slate-400 hover:text-red-500"><Trash2 className="w-3 h-3 md:w-4 md:h-4"/></button>
                  <div className="flex items-center bg-white rounded-lg border border-slate-200 shadow-sm">
                    <button onClick={() => updateQty(item.id, -1)} className="px-1.5 md:px-2 py-0.5 md:py-1 text-slate-600 hover:bg-slate-100 rounded-l-lg">-</button>
                    <span className="w-4 md:w-6 text-center font-bold text-[11px] md:text-sm">{item.qty}</span>
                    <button onClick={() => updateQty(item.id, 1)} className="px-1.5 md:px-2 py-0.5 md:py-1 text-slate-600 hover:bg-slate-100 rounded-r-lg">+</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* ส่วนปุ่มคิดเงิน (ล็อคติดขอบล่างเสมอ ไม่โดนหน้าจอบังแน่นอน) */}
        <div className="p-3 md:p-5 bg-white border-t border-slate-200 shadow-[0_-10px_20px_rgba(0,0,0,0.04)] shrink-0">
          <div className="space-y-1 md:space-y-2 mb-3 md:mb-4 text-[11px] md:text-sm font-medium">
            <div className="flex justify-between text-slate-500">
              <span>ยอดรวม (Subtotal)</span>
              <span>฿{subtotal.toLocaleString()}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>ส่วนลด (Discount)</span>
                <span>-฿{discount.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between items-center pt-2 md:pt-3 border-t border-slate-100 mt-1 md:mt-2">
              <span className="text-sm md:text-xl font-black text-slate-800 whitespace-nowrap">ยอดสุทธิ (Total)</span>
              <span className="text-lg md:text-2xl font-black text-[#d4af37] whitespace-nowrap">฿{total.toLocaleString()}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 md:gap-3">
            <button disabled={cart.length === 0} onClick={() => handleCheckout('Cash')} className="flex flex-col items-center justify-center py-2 md:py-3 bg-[#f8faf9] text-[#2d4a43] border border-[#a8d5ba] rounded-lg md:rounded-xl hover:bg-[#e6f4ea] disabled:opacity-50 transition-colors font-bold active:scale-95 group">
              <Banknote className="w-4 h-4 md:w-6 md:h-6 mb-0.5 md:mb-1 group-disabled:grayscale"/> 
              <span className="text-[10px] md:text-sm whitespace-nowrap">เงินสด</span>
            </button>
            <button disabled={cart.length === 0} onClick={() => handleCheckout('QR')} className="flex flex-col items-center justify-center py-2 md:py-3 bg-[#2d4a43] text-white rounded-lg md:rounded-xl hover:bg-[#1d302b] shadow-lg disabled:opacity-50 transition-all active:scale-95 font-bold border border-[#2d4a43] group">
              <QrCode className="w-4 h-4 md:w-6 md:h-6 mb-0.5 md:mb-1 group-disabled:opacity-50"/> 
              <span className="text-[10px] md:text-sm whitespace-nowrap">โอน/สแกน</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- 4. CRM View (Fixed Header Layout) ---
interface CRMViewProps { customers: Customer[], setCustomers: any, notify: any }

function CRMView({ customers, setCustomers, notify }: CRMViewProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '', notes: '' });

  const handleAdd = () => {
    if(!formData.name || !formData.phone) return notify('กรุณากรอกชื่อและเบอร์โทร', 'error');
    const newCust: Customer = {
      id: 'C'+Date.now(),
      name: formData.name,
      phone: formData.phone,
      points: 0,
      healthNotes: formData.notes,
      activePackages: []
    };
    setCustomers((prev: Customer[]) => [newCust, ...prev]);
    setModalOpen(false);
    setFormData({name:'', phone:'', notes:''});
    notify('เพิ่มสมาชิกใหม่สำเร็จ!');
  };

  return (
    <div className="h-full w-full flex flex-col p-4 md:p-8 max-w-6xl mx-auto gap-4 md:gap-6 animate-in fade-in">
      {/* Header ล็อคความสูงไว้ */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 shrink-0">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-800">ระบบสมาชิก (CRM)</h2>
          <p className="text-slate-500 text-xs md:text-sm mt-1">จัดการข้อมูลลูกค้าและการสะสมแต้ม</p>
        </div>
        <button onClick={()=>setModalOpen(true)} className="w-full sm:w-auto bg-[#2d4a43] text-white px-4 py-2 md:py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 text-sm shadow-md hover:bg-[#1d302b] transition-colors"><Plus className="w-4 h-4"/> เพิ่มลูกค้า</button>
      </div>

      {/* ตารางลูกค้า เลื่อนขึ้นลงได้แค่ในกรอบนี้ */}
      <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left border-collapse min-w-[500px] relative">
            <thead className="sticky top-0 z-10 bg-slate-50 border-b border-slate-200 text-slate-500 text-xs md:text-sm">
              <tr>
                <th className="p-3 md:p-4 font-bold whitespace-nowrap">ชื่อลูกค้า / เบอร์โทร</th>
                <th className="p-3 md:p-4 font-bold text-center whitespace-nowrap">แต้มสะสม</th>
                <th className="p-3 md:p-4 font-bold hidden sm:table-cell">แพ็กเกจคงเหลือ</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c: Customer) => (
                <tr key={c.id} className="border-b border-slate-100 hover:bg-[#f8faf9] transition-colors">
                  <td className="p-3 md:p-4">
                    <p className="font-bold text-slate-800 text-sm">{c.name}</p>
                    <p className="text-[10px] md:text-xs text-slate-500 mt-0.5">{c.phone}</p>
                    {c.healthNotes && <span className="inline-block mt-1.5 bg-red-100 text-red-700 text-[9px] md:text-[10px] px-2 py-0.5 rounded font-bold border border-red-200">โรคประจำตัว: {c.healthNotes}</span>}
                  </td>
                  <td className="p-3 md:p-4 text-center">
                    <span className="bg-[#fceeb5] text-[#8c701c] font-black px-3 py-1 rounded-full text-xs md:text-sm shadow-sm whitespace-nowrap">{c.points} Pts</span>
                  </td>
                  <td className="p-3 md:p-4 hidden sm:table-cell text-xs md:text-sm text-slate-500 font-medium">
                    {c.activePackages.length === 0 ? '-' : c.activePackages.map((p: any) => `${p.name} (${p.remaining})`).join(', ')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-5 md:p-6 w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200">
            <h2 className="text-xl font-bold text-slate-800 mb-4">ลงทะเบียนสมาชิก</h2>
            <div className="space-y-3">
              <input type="text" placeholder="ชื่อ-นามสกุล" value={formData.name} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, name:e.target.value})} className="w-full border border-slate-300 rounded-xl p-3 focus:border-[#2d4a43] outline-none text-sm" />
              <input type="tel" placeholder="เบอร์โทรศัพท์" value={formData.phone} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, phone:e.target.value})} className="w-full border border-slate-300 rounded-xl p-3 focus:border-[#2d4a43] outline-none text-sm" />
              <textarea placeholder="ประวัติสุขภาพ (ถ้ามี)" value={formData.notes} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({...formData, notes:e.target.value})} className="w-full border border-slate-300 rounded-xl p-3 focus:border-[#2d4a43] outline-none h-20 resize-none text-sm" />
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setModalOpen(false)} className="flex-1 py-2.5 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 text-sm transition-colors">ยกเลิก</button>
              <button onClick={handleAdd} className="flex-1 py-2.5 rounded-xl font-bold text-white bg-[#2d4a43] hover:bg-[#1d302b] shadow-lg text-sm transition-all active:scale-95">บันทึก</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- 5. Inventory View (Fixed Header Layout) ---
interface InventoryViewProps { products: Product[], setProducts: any, notify: any }

function InventoryView({ products, setProducts, notify }: InventoryViewProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProd, setSelectedProd] = useState<Product | null>(null);
  const [adjustAmount, setAdjustAmount] = useState<number>(0);

  const handleOpen = (p: Product) => {
    setSelectedProd(p);
    setAdjustAmount(p.stock);
    setModalOpen(true);
    playSound('click');
  };

  const handleSave = () => {
    if(!selectedProd) return;
    setProducts((prev: Product[]) => prev.map((p: Product) => p.id === selectedProd.id ? { ...p, stock: adjustAmount } : p));
    setModalOpen(false);
    notify(`อัปเดตสต๊อกสำเร็จ`);
  };

  return (
    <div className="h-full w-full flex flex-col p-4 md:p-8 max-w-6xl mx-auto gap-4 md:gap-6 animate-in fade-in">
      <div className="shrink-0">
        <h2 className="text-xl md:text-2xl font-bold text-slate-800">ระบบจัดการสต๊อก (Inventory)</h2>
        <p className="text-slate-500 text-xs md:text-sm mt-1">ตัดสต๊อกอัตโนมัติเมื่อขายผ่าน POS</p>
      </div>

      <div className="flex-1 overflow-y-auto pb-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          {products.map((p: Product) => (
            <div key={p.id} className={`bg-white p-4 md:p-5 rounded-2xl border-l-4 shadow-sm flex flex-col justify-between transition-all ${p.stock <= 10 ? 'border-red-500 bg-red-50/30' : 'border-[#2d4a43]'}`}>
              <div className="flex justify-between items-start mb-3">
                <div className="pr-2">
                  <span className={`text-[9px] md:text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider mb-2 inline-block whitespace-nowrap ${p.category === 'Retail' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>{p.category}</span>
                  <h3 className="font-bold text-slate-800 text-sm md:text-lg leading-tight line-clamp-2">{p.name}</h3>
                </div>
                <div className={`text-2xl md:text-3xl font-black shrink-0 ${p.stock <= 10 ? 'text-red-500' : 'text-[#2d4a43]'}`}>{p.stock}</div>
              </div>
              <div className="flex justify-between items-center border-t border-slate-100 pt-3 mt-1">
                <span className="text-xs md:text-sm font-bold text-slate-500">฿{p.price}</span>
                <button onClick={() => handleOpen(p)} className="text-[11px] md:text-sm font-bold text-[#2d4a43] bg-slate-100 px-3 md:px-4 py-1.5 rounded-lg hover:bg-[#e6f4ea] flex items-center gap-1 active:scale-95 whitespace-nowrap transition-colors"><Edit className="w-3 h-3"/> ปรับสต๊อก</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {modalOpen && selectedProd && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-5 md:p-6 w-full max-w-xs shadow-2xl animate-in zoom-in-95 duration-200">
            <h2 className="text-lg font-bold text-slate-800 mb-1">ปรับปรุงสต๊อกสินค้า</h2>
            <p className="text-xs text-slate-500 mb-6 truncate">{selectedProd.name}</p>
            
            <div className="flex items-center justify-center gap-4 mb-6 bg-slate-50 p-4 rounded-2xl border border-slate-200">
               <button onClick={() => setAdjustAmount(Math.max(0, adjustAmount-1))} className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center bg-white border border-slate-300 rounded-xl hover:bg-slate-100 text-xl font-bold text-slate-600 transition-colors">-</button>
               <span className="text-3xl md:text-4xl font-black text-[#2d4a43] w-16 md:w-20 text-center">{adjustAmount}</span>
               <button onClick={() => setAdjustAmount(adjustAmount+1)} className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center bg-white border border-slate-300 rounded-xl hover:bg-slate-100 text-xl font-bold text-slate-600 transition-colors">+</button>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setModalOpen(false)} className="flex-1 py-2.5 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 text-sm transition-colors">ยกเลิก</button>
              <button onClick={handleSave} className="flex-1 py-2.5 rounded-xl font-bold text-white bg-[#2d4a43] hover:bg-[#1d302b] shadow-lg text-sm transition-all active:scale-95">บันทึก</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ title, value, icon, color, iconColor }: { title: string, value: string, icon: React.ReactNode, color: string, iconColor: string }) {
  return (
    <div className={`bg-gradient-to-br ${color} p-4 md:p-5 rounded-2xl md:rounded-3xl shadow-lg relative overflow-hidden group transition-all`}>
      <div className={`absolute -right-2 -top-2 opacity-20 w-20 h-20 md:w-24 md:h-24 transform group-hover:scale-110 transition-transform ${iconColor}`}>{icon}</div>
      <p className="text-white/80 text-xs md:text-sm font-medium mb-1 relative z-10 whitespace-nowrap">{title}</p>
      <h3 className="text-2xl md:text-4xl font-black text-white tracking-tight relative z-10 truncate">{value}</h3>
    </div>
  );
}
