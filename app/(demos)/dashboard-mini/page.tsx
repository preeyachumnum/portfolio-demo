'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  LayoutDashboard, Users, ShoppingBag, BarChart3, Settings, Bell, Search, Menu, X, 
  Moon, Sun, TrendingUp, TrendingDown, DollarSign, CreditCard, Activity, MoreVertical, 
  Plus, Edit, Trash2, CheckCircle2, AlertCircle, Filter, ChevronDown, Save
} from 'lucide-react';

// --- Types ---
type Transaction = {
  id: string;
  name: string;
  email: string;
  amount: number;
  status: 'สำเร็จ' | 'รอดำเนินการ' | 'ยกเลิก';
  date: string;
};

type ToastMessage = { id: number; message: string; type: 'success' | 'error' };

// --- Initial Mock Data ---
const initialTransactions: Transaction[] = [
  { id: 'TRX-001', name: 'สมชาย ใจดี', email: 'somchai@example.com', amount: 12500, status: 'สำเร็จ', date: '2026-03-30' },
  { id: 'TRX-002', name: 'สมหญิง รักสวย', email: 'somying@example.com', amount: 8400, status: 'สำเร็จ', date: '2026-03-29' },
  { id: 'TRX-003', name: 'บริษัท เอบีซี จำกัด', email: 'contact@abc.co.th', amount: 45000, status: 'รอดำเนินการ', date: '2026-03-29' },
  { id: 'TRX-004', name: 'จอห์น โด', email: 'john@example.com', amount: 1200, status: 'ยกเลิก', date: '2026-03-28' },
  { id: 'TRX-005', name: 'มานี มีนา', email: 'manee@example.com', amount: 5600, status: 'สำเร็จ', date: '2026-03-27' },
];

export default function Dashboard() {
  // --- Global State ---
  const [isMounted, setIsMounted] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview'); // overview, transactions, settings
  
  // --- Data State ---
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // --- UI State ---
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [chartPeriod, setChartPeriod] = useState('week');
  const [showNotifs, setShowNotifs] = useState(false);

  // --- Initialize & LocalStorage ---
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setIsMounted(true);
    // Theme setup
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
    // Data setup
    const savedData = localStorage.getItem('nexus_transactions');
    if (savedData) {
      setTransactions(JSON.parse(savedData));
    } else {
      setTransactions(initialTransactions);
      localStorage.setItem('nexus_transactions', JSON.stringify(initialTransactions));
    }
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Save to LocalStorage whenever transactions change
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('nexus_transactions', JSON.stringify(transactions));
    }
  }, [transactions, isMounted]);

  // --- Handlers ---
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    if (!isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  };

  const handleSaveTransaction = (tx: Transaction) => {
    if (editingTx) {
      setTransactions(prev => prev.map(t => t.id === tx.id ? tx : t));
      showToast('อัปเดตข้อมูลสำเร็จ');
    } else {
      setTransactions(prev => [tx, ...prev]);
      showToast('เพิ่มรายการใหม่สำเร็จ');
    }
    setIsModalOpen(false);
    setEditingTx(null);
  };

  const handleDeleteTransaction = (id: string) => {
    if(confirm('คุณแน่ใจหรือไม่ว่าต้องการลบรายการนี้?')) {
      setTransactions(prev => prev.filter(t => t.id !== id));
      showToast('ลบรายการสำเร็จ');
    }
  };

  const openAddModal = () => {
    setEditingTx(null);
    setIsModalOpen(true);
  };

  const openEditModal = (tx: Transaction) => {
    setEditingTx(tx);
    setIsModalOpen(true);
  };

  // --- Computed Data ---
  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => 
      tx.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      tx.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.id.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [transactions, searchQuery]);

  const stats = useMemo(() => {
    const totalRevenue = transactions.filter(t => t.status === 'สำเร็จ').reduce((sum, t) => sum + t.amount, 0);
    const totalOrders = transactions.length;
    const pendingOrders = transactions.filter(t => t.status === 'รอดำเนินการ').length;
    const successRate = totalOrders > 0 ? ((transactions.filter(t => t.status === 'สำเร็จ').length / totalOrders) * 100).toFixed(1) : '0';
    return { totalRevenue, totalOrders, pendingOrders, successRate };
  }, [transactions]);

  const revenueTrend = useMemo(() => {
    if (stats.totalOrders === 0) return '0.0';
    return Math.min((stats.totalRevenue / stats.totalOrders) / 100, 9.9).toFixed(1);
  }, [stats.totalOrders, stats.totalRevenue]);

  // Mock Chart Data based on period
  const chartData = useMemo(() => {
    if (chartPeriod === 'week') return [ { l: 'จ.', v: 40 }, { l: 'อ.', v: 30 }, { l: 'พ.', v: 55 }, { l: 'พฤ.', v: 45 }, { l: 'ศ.', v: 70 }, { l: 'ส.', v: 85 }, { l: 'อา.', v: 60 } ];
    if (chartPeriod === 'month') return [ { l: 'สัปดาห์ 1', v: 120 }, { l: 'สัปดาห์ 2', v: 150 }, { l: 'สัปดาห์ 3', v: 90 }, { l: 'สัปดาห์ 4', v: 210 } ];
    return [ { l: 'Q1', v: 400 }, { l: 'Q2', v: 350 }, { l: 'Q3', v: 500 }, { l: 'Q4', v: 650 } ];
  }, [chartPeriod]);

  const svgLinePoints = useMemo(() => {
    const max = Math.max(...chartData.map(d => d.v), 1);
    return chartData.map((d, i) => `${(i / (chartData.length - 1)) * 100},${100 - (d.v / max) * 100}`).join(' ');
  }, [chartData]);

  if (!isMounted) return <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-300">
      
      {/* --- Sidebar Overlay --- */}
      {isSidebarOpen && <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)} />}

      {/* --- Sidebar --- */}
      <aside className={`fixed top-0 left-0 z-50 h-screen w-64 bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl border-r border-slate-200 dark:border-slate-800 transition-all duration-300 ease-in-out transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 shadow-2xl lg:shadow-none`}>
        <div className="h-full flex flex-col">
          <div className="h-16 flex items-center px-6 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
              <div className="bg-indigo-600 text-white p-1.5 rounded-lg"><Activity className="w-5 h-5" /></div>
              <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Nexus<span className="text-indigo-600 dark:text-indigo-500">Dash</span></span>
            </div>
            <button className="ml-auto lg:hidden text-slate-500" onClick={() => setIsSidebarOpen(false)}><X className="w-5 h-5" /></button>
          </div>

          <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
            <NavItem icon={<LayoutDashboard />} label="ภาพรวม" active={activeTab === 'overview'} onClick={() => {setActiveTab('overview'); setIsSidebarOpen(false);}} />
            <NavItem icon={<ShoppingBag />} label="รายการธุรกรรม" active={activeTab === 'transactions'} onClick={() => {setActiveTab('transactions'); setIsSidebarOpen(false);}} badge={transactions.length} />
            <NavItem icon={<BarChart3 />} label="วิเคราะห์ข้อมูล (Coming Soon)" disabled />
            <NavItem icon={<Users />} label="ลูกค้า (Coming Soon)" disabled />
            <div className="pt-6 mt-6 border-t border-slate-200 dark:border-slate-800">
              <NavItem icon={<Settings />} label="การตั้งค่า" active={activeTab === 'settings'} onClick={() => {setActiveTab('settings'); setIsSidebarOpen(false);}} />
            </div>
          </nav>

          <div className="p-4 m-4 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl text-white shadow-lg shadow-indigo-500/30">
            <h4 className="font-semibold text-sm mb-1 text-white">ผู้ใช้งานระดับ Pro</h4>
            <p className="text-xs text-indigo-100 mb-3 opacity-90">คุณกำลังใช้งานฟีเจอร์ทั้งหมดแบบไม่จำกัด</p>
            <button className="w-full py-2 text-sm font-medium text-indigo-600 bg-white hover:bg-slate-50 rounded-lg transition-colors shadow-sm">
              จัดการแพ็กเกจ
            </button>
          </div>
        </div>
      </aside>

      {/* --- Main Content --- */}
      <main className="lg:pl-64 flex flex-col min-h-screen">
        
        {/* --- Header --- */}
        <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8 bg-white/70 dark:bg-slate-900/70 backdrop-blur-lg border-b border-slate-200 dark:border-slate-800 transition-colors">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="p-2 -ml-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg lg:hidden transition-colors">
              <Menu className="w-6 h-6" />
            </button>
            <div className="relative hidden sm:block group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
              <input 
                type="text" placeholder="ค้นหาธุรกรรม, ชื่อ, อีเมล..." 
                value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                className="w-72 pl-10 pr-4 py-2 text-sm bg-slate-100 dark:bg-slate-800 border-transparent focus:bg-white dark:focus:bg-slate-950 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-full transition-all outline-none text-slate-900 dark:text-white shadow-inner"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <button onClick={toggleTheme} className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all active:scale-95">
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            
            <div className="relative">
              <button onClick={() => setShowNotifs(!showNotifs)} className="relative p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all active:scale-95">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-slate-900 animate-pulse"></span>
              </button>
              
              {/* Notifications Dropdown */}
              {showNotifs && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden z-50 animate-in fade-in slide-in-from-top-5">
                  <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950/50">
                    <h4 className="font-semibold text-sm">การแจ้งเตือน</h4>
                    <span className="text-xs text-indigo-600 dark:text-indigo-400 cursor-pointer hover:underline">อ่านทั้งหมด</span>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {[1,2,3].map(i => (
                      <div key={i} className="p-4 border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center shrink-0">
                          <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-900 dark:text-white">ระบบอัปเดตข้อมูลสำเร็จ</p>
                          <p className="text-xs text-slate-500 mt-0.5">เมื่อ {i * 15} นาทีที่แล้ว</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-semibold shadow-md cursor-pointer border-2 border-white dark:border-slate-800 hover:ring-2 ring-indigo-500/50 transition-all">
              A
            </div>
          </div>
        </header>

        {/* --- Dynamic Content Area --- */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden">
          
          {/* View: Overview */}
          {activeTab === 'overview' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white">ภาพรวมระบบ</h1>
                  <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">ข้อมูลสถานะแบบเรียลไทม์จากระบบของคุณ</p>
                </div>
                <button onClick={openAddModal} className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl shadow-lg shadow-indigo-500/30 transition-all hover:-translate-y-0.5 active:scale-95">
                  <Plus className="w-4 h-4" /> สร้างรายการใหม่
                </button>
              </div>

              {/* --- Stat Cards (Dynamic) --- */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
                <StatCard title="รายได้สำเร็จแล้ว" value={`฿${stats.totalRevenue.toLocaleString()}`} trend="+12.5%" isPositive={true} icon={<DollarSign className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />} bgColor="bg-emerald-100 dark:bg-emerald-500/20" />
                <StatCard title="จำนวนบิลทั้งหมด" value={stats.totalOrders.toString()} trend="+5.2%" isPositive={true} icon={<ShoppingBag className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />} bgColor="bg-indigo-100 dark:bg-indigo-500/20" />
                <StatCard title="รอดำเนินการ" value={stats.pendingOrders.toString()} trend="-2.4%" isPositive={false} icon={<AlertCircle className="w-6 h-6 text-amber-600 dark:text-amber-400" />} bgColor="bg-amber-100 dark:bg-amber-500/20" />
                <StatCard title="อัตราความสำเร็จ" value={`${stats.successRate}%`} trend="+1.2%" isPositive={true} icon={<Activity className="w-6 h-6 text-blue-600 dark:text-blue-400" />} bgColor="bg-blue-100 dark:bg-blue-500/20" />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* --- Interactive Chart Area --- */}
                <div className="col-span-1 lg:col-span-2 bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">แนวโน้มรายได้</h3>
                      <p className="text-xs text-slate-500 mt-1">วิเคราะห์ข้อมูลการเติบโต</p>
                    </div>
                    <div className="relative">
                      <select 
                        value={chartPeriod} onChange={(e) => setChartPeriod(e.target.value)}
                        className="appearance-none bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm pl-4 pr-10 py-2 outline-none focus:ring-2 focus:ring-indigo-500/50 cursor-pointer font-medium text-slate-700 dark:text-slate-300 transition-shadow"
                      >
                        <option value="week">สัปดาห์นี้</option>
                        <option value="month">เดือนนี้</option>
                        <option value="year">ปีนี้</option>
                      </select>
                      <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                    </div>
                  </div>
                  
                  <div className="relative h-64 w-full flex items-end group">
                    {/* Y-Axis lines */}
                    <div className="absolute inset-0 flex flex-col justify-between">
                      {[4,3,2,1,0].map(i => (
                        <div key={i} className="w-full h-[1px] bg-slate-100 dark:bg-slate-800 flex items-center">
                          <span className="text-xs text-slate-400 -translate-y-1/2 bg-white dark:bg-slate-950 pr-3 font-mono">{i * 25}%</span>
                        </div>
                      ))}
                    </div>
                    
                    {/* SVG Line Chart */}
                    <div className="absolute inset-0 ml-10 mt-2 mb-6">
                      <svg viewBox="0 -10 100 120" preserveAspectRatio="none" className="w-full h-full overflow-visible">
                        <defs>
                          <linearGradient id="chart-gradient" x1="0" x2="0" y1="0" y2="1">
                            <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.4" />
                            <stop offset="100%" stopColor="#4f46e5" stopOpacity="0" />
                          </linearGradient>
                        </defs>
                        <polyline points={`0,100 ${svgLinePoints} 100,100`} fill="url(#chart-gradient)" className="transition-all duration-500 ease-in-out" />
                        <polyline points={svgLinePoints} fill="none" stroke="#4f46e5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-md transition-all duration-500 ease-in-out" />
                        
                        {/* Interactive Data Points */}
                        {chartData.map((d, i) => {
                          const x = (i / (chartData.length - 1)) * 100;
                          const max = Math.max(...chartData.map(d => d.v), 1);
                          const y = 100 - (d.v / max) * 100;
                          return (
                            <g key={i} className="group/point cursor-pointer">
                              <circle cx={x} cy={y} r="2" className="fill-white dark:fill-slate-900 stroke-indigo-600 stroke-[1] transition-all duration-300 group-hover/point:r-3 group-hover/point:stroke-[1.5]" />
                              {/* Tooltip */}
                              <g className="opacity-0 group-hover/point:opacity-100 transition-opacity duration-200">
                                <rect x={x - 15} y={y - 25} width="30" height="15" rx="4" fill="#1e293b" />
                                <text x={x} y={y - 15} textAnchor="middle" fill="white" fontSize="8" fontWeight="bold">{d.v}</text>
                              </g>
                            </g>
                          )
                        })}
                      </svg>
                    </div>
                    
                    {/* X-Axis */}
                    <div className="absolute bottom-0 left-10 right-0 flex justify-between text-xs text-slate-500 font-medium">
                      {chartData.map((d, i) => (<span key={i} className="-translate-x-1/2">{d.l}</span>))}
                    </div>
                  </div>
                </div>

                {/* --- Mini Widget (Premium Card) --- */}
                <div className="col-span-1 bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-800 rounded-2xl p-6 text-white shadow-xl shadow-indigo-500/20 relative overflow-hidden flex flex-col justify-between group">
                  {/* Decorative backgrounds */}
                  <div className="absolute top-0 right-0 -mt-8 -mr-8 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all duration-700"></div>
                  <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-32 h-32 bg-black/20 rounded-full blur-2xl"></div>
                  
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="font-medium text-indigo-100/80 uppercase tracking-wider text-xs">ยอดเงินคงเหลือสุทธิ</h3>
                      <CreditCard className="w-6 h-6 text-white/80" />
                    </div>
                    <div className="text-4xl font-extrabold tracking-tight mb-2 flex items-center">
                      <span className="text-2xl opacity-70 mr-1">฿</span>
                      {stats.totalRevenue.toLocaleString()}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-indigo-100/90 bg-white/10 inline-flex px-2 py-1 rounded-md backdrop-blur-sm border border-white/10">
                      <TrendingUp className="w-4 h-4 text-emerald-300" />
                      <span className="text-emerald-300 font-medium">+{revenueTrend}%</span>
                    </div>
                  </div>

                  <div className="relative z-10 mt-10 pt-6 border-t border-white/20 flex justify-between items-end">
                    <div>
                      <div className="text-[10px] text-indigo-200 uppercase tracking-widest mb-1 opacity-80">ผู้ถือบัตร</div>
                      <div className="font-medium text-sm tracking-wide">Nexus Admin</div>
                    </div>
                    <div className="flex gap-1.5 opacity-80">
                       <div className="w-6 h-6 rounded-full bg-red-500/80 mix-blend-multiply"></div>
                       <div className="w-6 h-6 rounded-full bg-yellow-500/80 mix-blend-multiply -ml-3"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Preview Table */}
              <div className="mb-4 flex justify-between items-end">
                 <h3 className="text-lg font-bold text-slate-900 dark:text-white">ธุรกรรมล่าสุด 5 รายการ</h3>
                 <button onClick={() => setActiveTab('transactions')} className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline">ดูทั้งหมด</button>
              </div>
              <TransactionTable 
                data={filteredTransactions.slice(0, 5)} 
                onEdit={openEditModal} 
                onDelete={handleDeleteTransaction} 
              />
            </div>
          )}

          {/* View: Transactions (Full List) */}
          {activeTab === 'transactions' && (
            <div className="animate-in fade-in slide-in-from-right-8 duration-500">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white">จัดการรายการธุรกรรม</h1>
                  <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">รายการทั้งหมด {filteredTransactions.length} รายการ</p>
                </div>
                <button onClick={openAddModal} className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl shadow-lg shadow-indigo-500/30 transition-all hover:-translate-y-0.5 active:scale-95">
                  <Plus className="w-4 h-4" /> สร้างรายการ
                </button>
              </div>

              <div className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm mb-6 p-4 flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="text" placeholder="ค้นหา รหัส, ชื่อลูกค้า, อีเมล..." 
                    value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-xl outline-none text-sm transition-colors"
                  />
                </div>
                <button className="px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                  <Filter className="w-4 h-4 text-slate-500" /> กรองข้อมูล
                </button>
              </div>

              <TransactionTable 
                data={filteredTransactions} 
                onEdit={openEditModal} 
                onDelete={handleDeleteTransaction} 
              />
            </div>
          )}

          {/* View: Settings (Mock) */}
          {activeTab === 'settings' && (
             <div className="animate-in fade-in duration-500 max-w-2xl">
               <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">การตั้งค่าระบบ</h1>
               <div className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-6">
                 <div>
                   <h3 className="text-lg font-medium mb-4">ลักษณะที่ปรากฏ</h3>
                   <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                     <div>
                       <p className="font-medium text-sm">โหมดกลางคืน (Dark Mode)</p>
                       <p className="text-xs text-slate-500 mt-1">ปรับเปลี่ยนโทนสีของแดชบอร์ดให้สบายตาในที่มืด</p>
                     </div>
                     <button onClick={toggleTheme} className={`w-12 h-6 rounded-full relative transition-colors ${isDarkMode ? 'bg-indigo-600' : 'bg-slate-300'}`}>
                       <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${isDarkMode ? 'translate-x-6' : 'translate-x-0'}`}></span>
                     </button>
                   </div>
                 </div>
                 <hr className="border-slate-200 dark:border-slate-800" />
                 <div>
                   <h3 className="text-lg font-medium mb-4">ล้างข้อมูล (Danger Zone)</h3>
                   <button 
                     onClick={() => {
                       if(confirm('ลบข้อมูลธุรกรรมทั้งหมดกลับไปค่าเริ่มต้น?')) {
                         setTransactions(initialTransactions);
                         showToast('รีเซ็ตข้อมูลสำเร็จ', 'success');
                       }
                     }}
                     className="px-4 py-2 bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 rounded-lg text-sm font-medium hover:bg-rose-200 dark:hover:bg-rose-500/20 transition-colors"
                   >
                     รีเซ็ตข้อมูลเป็นค่าเริ่มต้น
                   </button>
                 </div>
               </div>
             </div>
          )}
          
        </div>
      </main>

      {/* --- Modal Form (Add/Edit) --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-10 duration-300">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-950/50">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {editingTx ? 'แก้ไขธุรกรรม' : 'เพิ่มธุรกรรมใหม่'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-full"><X className="w-5 h-5" /></button>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              const tx: Transaction = {
                id: editingTx ? editingTx.id : `TRX-${Math.floor(Math.random() * 9000 + 1000)}`,
                name: fd.get('name') as string,
                email: fd.get('email') as string,
                amount: Number(fd.get('amount')),
                status: fd.get('status') as Transaction['status'],
                date: editingTx ? editingTx.date : new Date().toISOString().split('T')[0],
              };
              handleSaveTransaction(tx);
            }} className="p-6 space-y-4">
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">ชื่อลูกค้า</label>
                <input required name="name" defaultValue={editingTx?.name} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm" placeholder="ระบุชื่อลูกค้า" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">อีเมล</label>
                <input required type="email" name="email" defaultValue={editingTx?.email} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm" placeholder="email@example.com" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">จำนวนเงิน (฿)</label>
                  <input required type="number" name="amount" defaultValue={editingTx?.amount} min="0" className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm" placeholder="0.00" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">สถานะ</label>
                  <select name="status" defaultValue={editingTx?.status || 'สำเร็จ'} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm">
                    <option value="สำเร็จ">สำเร็จ</option>
                    <option value="รอดำเนินการ">รอดำเนินการ</option>
                    <option value="ยกเลิก">ยกเลิก</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                  ยกเลิก
                </button>
                <button type="submit" className="px-6 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-lg shadow-indigo-500/30 flex items-center gap-2 transition-all hover:-translate-y-0.5 active:scale-95">
                  <Save className="w-4 h-4" /> บันทึกข้อมูล
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- Toasts Container --- */}
      <div className="fixed bottom-4 right-4 z-[110] flex flex-col gap-2 pointer-events-none">
        {toasts.map(toast => (
          <div key={toast.id} className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 pointer-events-auto animate-in slide-in-from-right-8 fade-in duration-300">
            {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-400 dark:text-emerald-500" /> : <AlertCircle className="w-5 h-5 text-rose-400 dark:text-rose-500" />}
            <span className="text-sm font-medium">{toast.message}</span>
          </div>
        ))}
      </div>

    </div>
  );
}

// --- Sub Components ---

// Data Table Component with internal Action Dropdown state
function TransactionTable({ data, onEdit, onDelete }: { data: Transaction[], onEdit: (tx:Transaction)=>void, onDelete: (id:string)=>void }) {
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const tableRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (tableRef.current && !tableRef.current.contains(event.target as Node)) {
        setOpenDropdownId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (data.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center">
        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400"><Search className="w-8 h-8"/></div>
        <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-1">ไม่พบข้อมูล</h3>
        <p className="text-slate-500 text-sm">ลองค้นหาด้วยคำอื่น หรือเพิ่มรายการใหม่</p>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-visible" ref={tableRef}>
      <div className="overflow-x-auto min-h-[300px]">
        <table className="w-full text-sm text-left relative">
          <thead className="text-xs text-slate-500 dark:text-slate-400 bg-slate-50/80 dark:bg-slate-900/50 uppercase font-semibold border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="px-6 py-4 rounded-tl-2xl">รหัสอ้างอิง</th>
              <th className="px-6 py-4">ข้อมูลลูกค้า</th>
              <th className="px-6 py-4">วันที่ทำรายการ</th>
              <th className="px-6 py-4">จำนวนเงิน</th>
              <th className="px-6 py-4">สถานะ</th>
              <th className="px-6 py-4 text-right rounded-tr-2xl">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {data.map((tx) => (
              <tr key={tx.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-900/30 transition-colors group">
                <td className="px-6 py-4 font-mono text-xs font-medium text-indigo-600 dark:text-indigo-400">{tx.id}</td>
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="font-semibold text-slate-900 dark:text-slate-200">{tx.name}</span>
                    <span className="text-xs text-slate-500 mt-0.5">{tx.email}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-500 text-xs">{tx.date}</td>
                <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">
                  ฿{tx.amount.toLocaleString()}
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold border
                    ${tx.status === 'สำเร็จ' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' : 
                      tx.status === 'รอดำเนินการ' ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20' : 
                      'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20'
                    }
                  `}>
                    {tx.status === 'สำเร็จ' && <CheckCircle2 className="w-3 h-3 mr-1" />}
                    {tx.status === 'รอดำเนินการ' && <Activity className="w-3 h-3 mr-1" />}
                    {tx.status === 'ยกเลิก' && <X className="w-3 h-3 mr-1" />}
                    {tx.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right relative">
                  <button 
                    onClick={() => setOpenDropdownId(openDropdownId === tx.id ? null : tx.id)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:text-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                  
                  {/* Action Dropdown Menu */}
                  {openDropdownId === tx.id && (
                    <div className="absolute right-8 top-10 w-36 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden z-[60] animate-in fade-in zoom-in-95 duration-150">
                      <button 
                        onClick={() => { onEdit(tx); setOpenDropdownId(null); }}
                        className="w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2 text-slate-700 dark:text-slate-200"
                      >
                        <Edit className="w-4 h-4" /> แก้ไขข้อมูล
                      </button>
                      <button 
                        onClick={() => { onDelete(tx.id); setOpenDropdownId(null); }}
                        className="w-full text-left px-4 py-2.5 text-sm hover:bg-rose-50 dark:hover:bg-rose-500/10 flex items-center gap-2 text-rose-600 dark:text-rose-400 border-t border-slate-100 dark:border-slate-700"
                      >
                        <Trash2 className="w-4 h-4" /> ลบรายการ
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function NavItem({ icon, label, active = false, badge, onClick, disabled }: { icon: React.ReactElement<{ className?: string }>, label: string, active?: boolean, badge?: number, onClick?: ()=>void, disabled?: boolean }) {
  return (
    <button 
      onClick={disabled ? undefined : onClick}
      className={`
        w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium transition-all duration-200 text-sm
        ${disabled ? 'opacity-50 cursor-not-allowed text-slate-400' : 
          active 
            ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400 shadow-sm' 
            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/50 hover:text-slate-900 dark:hover:text-slate-200'
        }
      `}
    >
      <div className="flex items-center gap-3">
        <div className={`${active ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'} transition-colors`}>
          {React.cloneElement(icon, { className: "w-5 h-5" })}
        </div>
        {label}
      </div>
      {badge !== undefined && badge > 0 && (
        <span className="bg-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
          {badge}
        </span>
      )}
    </button>
  );
}

function StatCard({ title, value, trend, isPositive, icon, bgColor }: { title: string, value: string, trend: string, isPositive: boolean, icon: React.ReactNode, bgColor: string }) {
  return (
    <div className="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg transition-all duration-300 group">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-1.5">{title}</p>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{value}</h3>
        </div>
        <div className={`p-3 rounded-xl ${bgColor} transition-transform group-hover:scale-110 duration-300`}>
          {icon}
        </div>
      </div>
      <div className="mt-4 flex items-center gap-2">
        <span className={`inline-flex items-center px-1.5 py-0.5 rounded-md text-xs font-bold ${isPositive ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400'}`}>
          {isPositive ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
          {trend}
        </span>
        <span className="text-xs text-slate-400 font-medium">เทียบกับเดือนที่แล้ว</span>
      </div>
    </div>
  );
}
