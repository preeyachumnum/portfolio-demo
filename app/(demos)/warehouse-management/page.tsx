"use client";

import React, { useState, useMemo } from 'react';
import { 
  Package, LayoutDashboard, ArrowDownToLine, ArrowUpFromLine, 
  AlertTriangle, Search, Bell, MoreVertical, Filter, 
  Settings, Users, BarChart3, Truck, Box, CheckCircle2, XCircle, Plus,
  Printer, Download, Edit, Trash2, Mail, Phone, Shield
} from 'lucide-react';

// --- MOCK DATA ---
const MOCK_INVENTORY = [
  { id: 'ITM-001', sku: 'ELEC-MAC-16', name: 'MacBook Pro 16" M3 Max', category: 'Electronics', stock: 45, minStock: 10, location: 'A-01-01', price: 125000, status: 'In Stock' },
  { id: 'ITM-002', sku: 'ELEC-DEL-27', name: 'Dell UltraSharp 27" 4K', category: 'Electronics', stock: 8, minStock: 15, location: 'A-01-02', price: 18500, status: 'Low Stock' },
  { id: 'ITM-003', sku: 'FURN-ERC-01', name: 'Ergonomic Office Chair', category: 'Furniture', stock: 0, minStock: 5, location: 'B-02-04', price: 8900, status: 'Out of Stock' },
  { id: 'ITM-004', sku: 'ELEC-IPD-11', name: 'iPad Pro 11" 256GB', category: 'Electronics', stock: 120, minStock: 20, location: 'A-02-01', price: 32900, status: 'In Stock' },
  { id: 'ITM-005', sku: 'STAT-A4-500', name: 'A4 Paper 500 Sheets (Box)', category: 'Stationery', stock: 450, minStock: 100, location: 'C-01-01', price: 550, status: 'In Stock' },
  { id: 'ITM-006', sku: 'FURN-DSK-02', name: 'Standing Desk Motorized', category: 'Furniture', stock: 4, minStock: 10, location: 'B-03-01', price: 14500, status: 'Low Stock' },
  { id: 'ITM-007', sku: 'NET-CIS-RTR', name: 'Cisco Enterprise Router', category: 'Networking', stock: 12, minStock: 5, location: 'A-04-02', price: 45000, status: 'In Stock' },
  { id: 'ITM-008', sku: 'NET-CAT6-1K', name: 'CAT6 Cable 1000ft', category: 'Networking', stock: 2, minStock: 5, location: 'A-04-03', price: 3500, status: 'Low Stock' },
];

const RECENT_ACTIVITIES = [
  { id: 1, action: 'Inbound', item: 'iPad Pro 11" 256GB', qty: 50, user: 'Somchai P.', time: '10 mins ago', type: 'in' },
  { id: 2, action: 'Outbound', item: 'Ergonomic Office Chair', qty: 12, user: 'Wichai T.', time: '1 hour ago', type: 'out' },
  { id: 3, action: 'Alert', item: 'Standing Desk Motorized', qty: 4, user: 'System', time: '2 hours ago', type: 'alert' },
  { id: 4, action: 'Inbound', item: 'Cisco Enterprise Router', qty: 10, user: 'Somchai P.', time: '5 hours ago', type: 'in' },
];

const MOCK_SUPPLIERS = [
  { id: 'SUP-001', name: 'TechSource Global', contact: 'คุณวิชัย แสงทอง', phone: '02-123-4567', email: 'contact@techsource.com', rating: 4.8, status: 'Active' },
  { id: 'SUP-002', name: 'Ergo Furnitures', contact: 'คุณสมศรี ใจดี', phone: '02-987-6543', email: 'sales@ergofurn.co.th', rating: 4.5, status: 'Active' },
  { id: 'SUP-003', name: 'OfficeMate Plus', contact: 'คุณจอห์น สมิธ', phone: '081-222-3333', email: 'john@officemate.com', rating: 4.9, status: 'Active' },
  { id: 'SUP-004', name: 'Cisco TH Distributor', contact: 'คุณนฤมล คงคา', phone: '02-555-7777', email: 'thailand@ciscodist.com', rating: 4.2, status: 'Inactive' },
];

const MOCK_STAFF = [
  { id: 'EMP-101', name: 'Preeya C.', role: 'Warehouse Manager', shift: 'Morning (08:00-17:00)', status: 'Active' },
  { id: 'EMP-102', name: 'Somchai P.', role: 'Inventory Clerk', shift: 'Morning (08:00-17:00)', status: 'Active' },
  { id: 'EMP-103', name: 'Wichai T.', role: 'Forklift Operator', shift: 'Night (17:00-02:00)', status: 'Offline' },
  { id: 'EMP-104', name: 'Amnat K.', role: 'Picker / Packer', shift: 'Morning (08:00-17:00)', status: 'Active' },
  { id: 'EMP-105', name: 'Somsri M.', role: 'QA Inspector', shift: 'Night (17:00-02:00)', status: 'Offline' },
];

export default function WarehouseSystem() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');

  // --- Calculations ---
  const totalItems = MOCK_INVENTORY.length;
  const totalValue = MOCK_INVENTORY.reduce((sum, item) => sum + (item.price * item.stock), 0);
  const lowStockCount = MOCK_INVENTORY.filter(item => item.status === 'Low Stock').length;
  const outOfStockCount = MOCK_INVENTORY.filter(item => item.status === 'Out of Stock').length;

  const filteredInventory = useMemo(() => {
    if (!searchQuery) return MOCK_INVENTORY;
    return MOCK_INVENTORY.filter(item => 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      item.sku.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  return (
    // เปลี่ยนจาก h-full เป็น h-screen เพื่อให้ความสูงยืดเต็มหน้าจอเสมอ
    <div className="flex h-screen w-full bg-[#F3F4F6] font-sans text-slate-800 selection:bg-indigo-100">
      
      {/* ==================== SIDEBAR ==================== */}
      <aside className="w-64 bg-[#0F172A] text-slate-300 flex flex-col hidden md:flex h-full shrink-0">
        <div className="h-16 flex items-center px-6 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3 text-white">
            <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Box size={18} className="text-white" />
            </div>
            <span className="font-bold text-lg tracking-wide">NexusWMS</span>
          </div>
        </div>

        <div className="p-4 flex-1 overflow-y-auto">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 mt-2 px-3">Main Menu</div>
          <nav className="space-y-1">
            <button 
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium ${activeTab === 'dashboard' ? 'bg-indigo-500/10 text-indigo-400' : 'hover:bg-slate-800 hover:text-white'}`}
            >
              <LayoutDashboard size={18} /> Dashboard
            </button>
            <button 
              onClick={() => setActiveTab('inventory')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium ${activeTab === 'inventory' ? 'bg-indigo-500/10 text-indigo-400' : 'hover:bg-slate-800 hover:text-white'}`}
            >
              <Package size={18} /> Inventory
            </button>
            <button 
              onClick={() => setActiveTab('inbound')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium ${activeTab === 'inbound' ? 'bg-indigo-500/10 text-indigo-400' : 'hover:bg-slate-800 hover:text-white'}`}
            >
              <ArrowDownToLine size={18} /> Inbound (รับเข้า)
            </button>
            <button 
              onClick={() => setActiveTab('outbound')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium ${activeTab === 'outbound' ? 'bg-indigo-500/10 text-indigo-400' : 'hover:bg-slate-800 hover:text-white'}`}
            >
              <ArrowUpFromLine size={18} /> Outbound (จ่ายออก)
            </button>
          </nav>

          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 mt-8 px-3">Management</div>
          <nav className="space-y-1">
            <button 
              onClick={() => setActiveTab('suppliers')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium ${activeTab === 'suppliers' ? 'bg-indigo-500/10 text-indigo-400' : 'hover:bg-slate-800 hover:text-white'}`}
            >
              <Truck size={18} /> Suppliers
            </button>
            <button 
              onClick={() => setActiveTab('reports')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium ${activeTab === 'reports' ? 'bg-indigo-500/10 text-indigo-400' : 'hover:bg-slate-800 hover:text-white'}`}
            >
              <BarChart3 size={18} /> Reports
            </button>
            <button 
              onClick={() => setActiveTab('staff')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium ${activeTab === 'staff' ? 'bg-indigo-500/10 text-indigo-400' : 'hover:bg-slate-800 hover:text-white'}`}
            >
              <Users size={18} /> Staff
            </button>
            <button 
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium ${activeTab === 'settings' ? 'bg-indigo-500/10 text-indigo-400' : 'hover:bg-slate-800 hover:text-white'}`}
            >
              <Settings size={18} /> Settings
            </button>
          </nav>
        </div>

        <div className="p-4 border-t border-slate-800 shrink-0">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-sm font-bold text-white">
              PC
            </div>
            <div>
              <p className="text-sm font-medium text-white">Preeya C.</p>
              <p className="text-xs text-slate-400">Warehouse Manager</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ==================== MAIN CONTENT ==================== */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-[#F3F4F6]">
        
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-2 text-slate-500">
            {activeTab === 'dashboard' && <h1 className="text-xl font-bold text-slate-800">Dashboard</h1>}
            {activeTab === 'inventory' && <h1 className="text-xl font-bold text-slate-800">Inventory Management</h1>}
            {['inbound', 'outbound', 'suppliers', 'reports', 'staff', 'settings'].includes(activeTab) && (
              <h1 className="text-xl font-bold text-slate-800 capitalize">{activeTab}</h1>
            )}
          </div>
          
          <div className="flex items-center gap-5">
            <div className="relative group hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={16} />
              <input 
                type="text" 
                placeholder="Search SKU, Name..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 pl-9 pr-4 py-2 bg-slate-100 border-transparent rounded-lg text-sm focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none"
              />
            </div>
            <button className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          
          {/* --- TAB: DASHBOARD --- */}
          {activeTab === 'dashboard' && (
            <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
              
              {/* KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                      <Package size={24} />
                    </div>
                    <span className="text-xs font-semibold text-slate-500 uppercase">Total SKUs</span>
                  </div>
                  <span className="text-3xl font-bold text-slate-800">{totalItems}</span>
                  <span className="text-sm text-slate-500 mt-1">Unique items in warehouse</span>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
                      <AlertTriangle size={24} />
                    </div>
                    <span className="text-xs font-semibold text-slate-500 uppercase">Low Stock</span>
                  </div>
                  <span className="text-3xl font-bold text-slate-800">{lowStockCount}</span>
                  <span className="text-sm text-slate-500 mt-1">Items below minimum level</span>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-red-600">
                      <XCircle size={24} />
                    </div>
                    <span className="text-xs font-semibold text-slate-500 uppercase">Out of Stock</span>
                  </div>
                  <span className="text-3xl font-bold text-slate-800">{outOfStockCount}</span>
                  <span className="text-sm text-slate-500 mt-1">Items currently depleted</span>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                      <BarChart3 size={24} />
                    </div>
                    <span className="text-xs font-semibold text-slate-500 uppercase">Est. Value</span>
                  </div>
                  <span className="text-3xl font-bold text-slate-800">฿{(totalValue / 1000000).toFixed(2)}M</span>
                  <span className="text-sm text-slate-500 mt-1">Total inventory valuation</span>
                </div>
              </div>

              {/* Second Row: Charts & Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Mock Chart Area */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-bold text-slate-800">Inventory Status by Category</h2>
                    <button className="text-sm font-medium text-indigo-600 hover:text-indigo-700">View Report</button>
                  </div>
                  <div className="h-64 flex items-end justify-around gap-4 px-4 pb-4 border-b border-slate-100">
                    {/* Mock Bars */}
                    <div className="w-full max-w-[60px] flex flex-col items-center gap-2">
                      <div className="w-full bg-indigo-500 rounded-t-md h-[80%] transition-all hover:bg-indigo-600"></div>
                      <span className="text-xs text-slate-500 font-medium">Electronics</span>
                    </div>
                    <div className="w-full max-w-[60px] flex flex-col items-center gap-2">
                      <div className="w-full bg-indigo-300 rounded-t-md h-[30%] transition-all hover:bg-indigo-400"></div>
                      <span className="text-xs text-slate-500 font-medium">Furniture</span>
                    </div>
                    <div className="w-full max-w-[60px] flex flex-col items-center gap-2">
                      <div className="w-full bg-indigo-400 rounded-t-md h-[60%] transition-all hover:bg-indigo-500"></div>
                      <span className="text-xs text-slate-500 font-medium">Stationery</span>
                    </div>
                    <div className="w-full max-w-[60px] flex flex-col items-center gap-2">
                      <div className="w-full bg-indigo-200 rounded-t-md h-[45%] transition-all hover:bg-indigo-300"></div>
                      <span className="text-xs text-slate-500 font-medium">Networking</span>
                    </div>
                  </div>
                </div>

                {/* Recent Activities */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col">
                  <h2 className="text-lg font-bold text-slate-800 mb-6">Recent Activities</h2>
                  <div className="flex-1 space-y-5">
                    {RECENT_ACTIVITIES.map(activity => (
                      <div key={activity.id} className="flex gap-4 items-start">
                        <div className={`mt-0.5 w-8 h-8 rounded-full flex items-center justify-center shrink-0
                          ${activity.type === 'in' ? 'bg-emerald-100 text-emerald-600' : 
                            activity.type === 'out' ? 'bg-blue-100 text-blue-600' : 'bg-amber-100 text-amber-600'}`}
                        >
                          {activity.type === 'in' ? <ArrowDownToLine size={14} /> : 
                           activity.type === 'out' ? <ArrowUpFromLine size={14} /> : <AlertTriangle size={14} />}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-800">
                            {activity.action} <span className="font-normal text-slate-500">({activity.qty}x)</span>
                          </p>
                          <p className="text-sm text-slate-600 truncate max-w-[180px]">{activity.item}</p>
                          <p className="text-xs text-slate-400 mt-1">{activity.time} • {activity.user}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button className="w-full mt-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
                    View All Logs
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* --- TAB: INVENTORY --- */}
          {activeTab === 'inventory' && (
            <div className="max-w-7xl mx-auto flex flex-col h-full animate-in fade-in duration-300">
              <div className="flex justify-between items-center mb-6">
                <div className="flex gap-2">
                  <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2 shadow-sm">
                    <Filter size={16} /> Filter
                  </button>
                  <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2 shadow-sm hidden sm:flex">
                    Category: All
                  </button>
                </div>
                <div className="flex gap-2">
                  <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium shadow-sm transition-colors flex items-center gap-2">
                    <Plus size={16} /> Add Product
                  </button>
                </div>
              </div>

              {/* Data Table */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex-1 flex flex-col">
                <div className="overflow-x-auto flex-1">
                  <table className="w-full text-left border-collapse whitespace-nowrap">
                    <thead>
                      <tr className="bg-slate-50/80 border-b border-slate-200 text-xs uppercase tracking-wider font-semibold text-slate-500 sticky top-0 z-10">
                        <th className="px-6 py-4 w-12"><input type="checkbox" className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" /></th>
                        <th className="px-6 py-4">SKU / Product Name</th>
                        <th className="px-6 py-4">Category</th>
                        <th className="px-6 py-4">Location</th>
                        <th className="px-6 py-4 text-right">Stock Level</th>
                        <th className="px-6 py-4 text-center">Status</th>
                        <th className="px-6 py-4 text-right">Unit Price</th>
                        <th className="px-6 py-4 w-12"></th>
                      </tr>
                    </thead>
                    <tbody className="text-sm divide-y divide-slate-100">
                      {filteredInventory.length === 0 ? (
                        <tr>
                          <td colSpan="8" className="px-6 py-12 text-center text-slate-500">
                            <Package size={40} className="mx-auto mb-3 text-slate-300" />
                            No products found matching "{searchQuery}"
                          </td>
                        </tr>
                      ) : (
                        filteredInventory.map(item => (
                          <tr key={item.id} className="hover:bg-slate-50 transition-colors group">
                            <td className="px-6 py-4"><input type="checkbox" className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" /></td>
                            <td className="px-6 py-4">
                              <p className="font-semibold text-slate-900">{item.name}</p>
                              <p className="text-xs text-slate-500 mt-0.5 font-mono">{item.sku}</p>
                            </td>
                            <td className="px-6 py-4 text-slate-600">{item.category}</td>
                            <td className="px-6 py-4">
                              <span className="inline-flex items-center px-2 py-1 rounded bg-slate-100 text-slate-700 text-xs font-mono font-medium">
                                {item.location}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <span className="font-bold text-slate-800">{item.stock}</span>
                              <span className="text-xs text-slate-400 ml-1">/ {item.minStock}</span>
                            </td>
                            <td className="px-6 py-4 text-center">
                              {item.status === 'In Stock' && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200"><CheckCircle2 size={12}/> In Stock</span>}
                              {item.status === 'Low Stock' && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200"><AlertTriangle size={12}/> Low Stock</span>}
                              {item.status === 'Out of Stock' && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200"><XCircle size={12}/> Out of Stock</span>}
                            </td>
                            <td className="px-6 py-4 text-right font-medium text-slate-700">
                              ฿{item.price.toLocaleString()}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button className="text-slate-400 hover:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                <MoreVertical size={18} />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
                
                {/* Pagination Footer */}
                <div className="px-6 py-4 border-t border-slate-200 flex justify-between items-center bg-slate-50">
                  <span className="text-sm text-slate-500">Showing <span className="font-medium text-slate-800">{filteredInventory.length}</span> results</span>
                  <div className="flex gap-1">
                    <button className="px-3 py-1 border border-slate-200 rounded text-sm font-medium bg-white text-slate-400 cursor-not-allowed">Prev</button>
                    <button className="px-3 py-1 border border-indigo-500 rounded text-sm font-medium bg-indigo-50 text-indigo-700">1</button>
                    <button className="px-3 py-1 border border-slate-200 rounded text-sm font-medium bg-white text-slate-600 hover:bg-slate-50">Next</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* --- TAB: INBOUND (รับเข้า) --- */}
          {activeTab === 'inbound' && (
            <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-slate-800">Inbound (รับสินค้าเข้าคลัง)</h2>
                <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium flex items-center gap-2 shadow-sm transition-colors">
                  <ArrowDownToLine size={16} /> บันทึกรับเข้า (Save)
                </button>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* สแกนรับสินค้า */}
                <div className="lg:col-span-1 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                  <h3 className="font-bold text-slate-800 mb-5 pb-2 border-b border-slate-100">ฟอร์มสแกนสินค้า</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">SKU / Barcode <span className="text-red-500">*</span></label>
                      <input type="text" className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" autoFocus placeholder="ยิงบาร์โค้ดที่นี่..." />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">ผู้ผลิต (Supplier)</label>
                      <select className="w-full p-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:border-indigo-500">
                        <option value="">-- เลือกซัพพลายเออร์ --</option>
                        {MOCK_SUPPLIERS.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">จำนวน (Qty)</label>
                        <input type="number" className="w-full p-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:border-indigo-500" defaultValue="1" min="1" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">ตำแหน่ง (Location)</label>
                        <input type="text" className="w-full p-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:border-indigo-500 uppercase" placeholder="A-00-00" />
                      </div>
                    </div>
                    <button className="w-full py-2.5 mt-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-sm font-medium transition-colors">
                      + เพิ่มลงคิวรับเข้า
                    </button>
                  </div>
                </div>

                {/* คิวรับเข้า */}
                <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
                  <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h3 className="font-bold text-slate-800">รายการรอเก็บเข้าชั้น (Putaway Queue)</h3>
                    <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-1 rounded-full">2 รายการ</span>
                  </div>
                  <div className="flex-1 overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                      <thead>
                        <tr className="bg-white border-b border-slate-200 text-slate-500">
                          <th className="py-3 px-6 font-semibold">SKU / Item</th>
                          <th className="py-3 px-6 font-semibold">Supplier</th>
                          <th className="py-3 px-6 font-semibold text-right">Location</th>
                          <th className="py-3 px-6 font-semibold text-right">Qty</th>
                          <th className="py-3 px-6 w-10"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        <tr className="hover:bg-slate-50">
                          <td className="py-3 px-6">
                            <p className="font-mono font-medium text-slate-700">ELEC-MAC-16</p>
                            <p className="text-xs text-slate-500">MacBook Pro 16" M3 Max</p>
                          </td>
                          <td className="py-3 px-6 text-slate-600">TechSource Global</td>
                          <td className="py-3 px-6 text-right"><span className="bg-slate-100 border border-slate-200 px-2 py-0.5 rounded font-mono text-xs text-slate-700">A-01-01</span></td>
                          <td className="py-3 px-6 text-right font-bold text-emerald-600">+15</td>
                          <td className="py-3 px-6 text-right"><button className="text-red-400 hover:text-red-600"><Trash2 size={16} /></button></td>
                        </tr>
                        <tr className="hover:bg-slate-50">
                          <td className="py-3 px-6">
                            <p className="font-mono font-medium text-slate-700">STAT-A4-500</p>
                            <p className="text-xs text-slate-500">A4 Paper 500 Sheets</p>
                          </td>
                          <td className="py-3 px-6 text-slate-600">OfficeMate Plus</td>
                          <td className="py-3 px-6 text-right"><span className="bg-slate-100 border border-slate-200 px-2 py-0.5 rounded font-mono text-xs text-slate-700">C-01-01</span></td>
                          <td className="py-3 px-6 text-right font-bold text-emerald-600">+100</td>
                          <td className="py-3 px-6 text-right"><button className="text-red-400 hover:text-red-600"><Trash2 size={16} /></button></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* --- TAB: OUTBOUND (เบิกออก) --- */}
          {activeTab === 'outbound' && (
            <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-slate-800">Outbound (เบิกจ่ายสินค้า)</h2>
                <div className="flex gap-3">
                  <button className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-sm font-medium flex items-center gap-2 shadow-sm transition-colors">
                    <Printer size={16} /> พิมพ์ใบเบิก (Pick List)
                  </button>
                  <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium flex items-center gap-2 shadow-sm transition-colors">
                    <ArrowUpFromLine size={16} /> ยืนยันการเบิกจ่าย
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col">
                <div className="p-6 border-b border-slate-100 bg-slate-50/30">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">ค้นหาออเดอร์ (Order ID)</label>
                      <div className="flex gap-2">
                        <input type="text" className="flex-1 p-2.5 bg-white border border-slate-300 rounded-lg text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20" placeholder="ระบุหมายเลข Order เช่น ORD-2026..." />
                        <button className="px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-sm font-medium transition-colors">ค้นหา</button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                         <label className="block text-sm font-semibold text-slate-700 mb-1.5">ผู้เบิก (Requestor)</label>
                         <input type="text" className="w-full p-2.5 bg-slate-100 border border-transparent rounded-lg text-sm text-slate-500 cursor-not-allowed" defaultValue="พนักงานสาขา สุขุมวิท" readOnly />
                      </div>
                      <div>
                         <label className="block text-sm font-semibold text-slate-700 mb-1.5">วันที่ทำรายการ</label>
                         <input type="text" className="w-full p-2.5 bg-slate-100 border border-transparent rounded-lg text-sm text-slate-500 cursor-not-allowed" defaultValue={new Date().toLocaleDateString('th-TH')} readOnly />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 overflow-x-auto">
                  <h3 className="font-bold text-slate-800 mb-4">รายการเบิก (Picking List)</h3>
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead>
                      <tr className="bg-slate-100 text-slate-600 rounded-lg">
                        <th className="py-3 px-4 rounded-tl-lg font-semibold">SKU / Item</th>
                        <th className="py-3 px-4 font-semibold text-center">Location</th>
                        <th className="py-3 px-4 font-semibold text-center">Stock On Hand</th>
                        <th className="py-3 px-4 font-semibold text-center text-indigo-700">Requested</th>
                        <th className="py-3 px-4 font-semibold text-center">Picked Qty</th>
                        <th className="py-3 px-4 rounded-tr-lg font-semibold text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      <tr className="hover:bg-slate-50">
                        <td className="py-3 px-4">
                          <p className="font-mono font-medium text-slate-700">ELEC-DEL-27</p>
                          <p className="text-xs text-slate-500">Dell UltraSharp 27" 4K</p>
                        </td>
                        <td className="py-3 px-4 text-center"><span className="bg-slate-100 border border-slate-200 px-2 py-0.5 rounded font-mono text-xs text-slate-700">A-01-02</span></td>
                        <td className="py-3 px-4 text-center font-medium text-slate-600">8</td>
                        <td className="py-3 px-4 text-center font-bold text-indigo-600">2</td>
                        <td className="py-3 px-4 text-center">
                          <input type="number" className="w-20 p-1.5 border border-slate-300 rounded-md text-center text-sm focus:border-indigo-500 outline-none" defaultValue="2" min="0" max="8" />
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full text-xs font-semibold border border-emerald-200"><CheckCircle2 size={12}/> Ready</span>
                        </td>
                      </tr>
                      <tr className="hover:bg-slate-50">
                        <td className="py-3 px-4">
                          <p className="font-mono font-medium text-slate-700">FURN-ERC-01</p>
                          <p className="text-xs text-slate-500">Ergonomic Office Chair</p>
                        </td>
                        <td className="py-3 px-4 text-center"><span className="bg-slate-100 border border-slate-200 px-2 py-0.5 rounded font-mono text-xs text-slate-700">B-02-04</span></td>
                        <td className="py-3 px-4 text-center font-medium text-red-500">0</td>
                        <td className="py-3 px-4 text-center font-bold text-indigo-600">5</td>
                        <td className="py-3 px-4 text-center">
                          <input type="number" className="w-20 p-1.5 border border-red-300 bg-red-50 rounded-md text-center text-sm text-red-600 outline-none" defaultValue="0" readOnly />
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="inline-flex items-center gap-1.5 bg-red-50 text-red-700 px-2.5 py-1 rounded-full text-xs font-semibold border border-red-200"><XCircle size={12}/> Backorder</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* --- TAB: SUPPLIERS --- */}
          {activeTab === 'suppliers' && (
            <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-800">Suppliers Management</h2>
                  <p className="text-sm text-slate-500 mt-1">จัดการรายชื่อผู้ผลิตและผู้จัดจำหน่าย</p>
                </div>
                <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium flex items-center gap-2 shadow-sm transition-colors">
                  <Plus size={16} /> Add Supplier
                </button>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-500">
                        <th className="py-4 px-6 font-semibold uppercase text-xs tracking-wider">Supplier ID / Name</th>
                        <th className="py-4 px-6 font-semibold uppercase text-xs tracking-wider">Contact Person</th>
                        <th className="py-4 px-6 font-semibold uppercase text-xs tracking-wider">Contact Info</th>
                        <th className="py-4 px-6 font-semibold uppercase text-xs tracking-wider text-center">Rating</th>
                        <th className="py-4 px-6 font-semibold uppercase text-xs tracking-wider text-center">Status</th>
                        <th className="py-4 px-6 w-10"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {MOCK_SUPPLIERS.map(sup => (
                        <tr key={sup.id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-4 px-6">
                            <p className="font-bold text-slate-800">{sup.name}</p>
                            <p className="text-xs font-mono text-slate-500 mt-0.5">{sup.id}</p>
                          </td>
                          <td className="py-4 px-6 text-slate-700 font-medium">{sup.contact}</td>
                          <td className="py-4 px-6">
                            <div className="flex flex-col gap-1 text-xs text-slate-600">
                              <span className="flex items-center gap-1.5"><Phone size={12} className="text-slate-400" /> {sup.phone}</span>
                              <span className="flex items-center gap-1.5"><Mail size={12} className="text-slate-400" /> {sup.email}</span>
                            </div>
                          </td>
                          <td className="py-4 px-6 text-center">
                            <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 font-bold px-2 py-1 rounded text-xs">
                              ★ {sup.rating}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-center">
                            <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold border ${sup.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                              {sup.status}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-right">
                            <button className="text-slate-400 hover:text-indigo-600 transition-colors"><Edit size={16} /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* --- TAB: REPORTS --- */}
          {activeTab === 'reports' && (
            <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-800">Analytics & Reports</h2>
                  <p className="text-sm text-slate-500 mt-1">รายงานและสถิติภาพรวมคลังสินค้า</p>
                </div>
                <div className="flex gap-2">
                  <button className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-sm font-medium flex items-center gap-2 shadow-sm transition-colors">
                    <Download size={16} /> Export CSV
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-indigo-600 p-6 rounded-2xl shadow-sm text-white flex flex-col justify-between relative overflow-hidden">
                  <div className="relative z-10">
                    <span className="text-indigo-200 font-medium text-sm">Inventory Turnover Rate</span>
                    <h3 className="text-4xl font-bold mt-2 mb-1">4.2x</h3>
                    <p className="text-sm text-indigo-200">+0.5% from last month</p>
                  </div>
                  <BarChart3 className="absolute -bottom-4 -right-4 w-32 h-32 text-indigo-500 opacity-50" />
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
                  <span className="text-slate-500 font-medium text-sm">Order Fulfillment Accuracy</span>
                  <h3 className="text-3xl font-bold text-slate-800 mt-2 mb-1">99.8%</h3>
                  <p className="text-sm text-emerald-600 font-medium">Excellent (Target 98%)</p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
                  <span className="text-slate-500 font-medium text-sm">Space Utilization</span>
                  <h3 className="text-3xl font-bold text-slate-800 mt-2 mb-1">76%</h3>
                  <div className="w-full bg-slate-100 h-2 mt-3 rounded-full overflow-hidden">
                    <div className="bg-amber-500 w-[76%] h-full rounded-full"></div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm h-80 flex flex-col items-center justify-center">
                <BarChart3 size={48} className="text-slate-200 mb-4" />
                <p className="text-slate-500 font-medium">Interactive Chart Module Placeholder</p>
                <p className="text-xs text-slate-400 mt-1">(กราฟสรุปยอด Inbound/Outbound รายเดือน)</p>
              </div>
            </div>
          )}

          {/* --- TAB: STAFF --- */}
          {activeTab === 'staff' && (
            <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-800">Staff Directory</h2>
                  <p className="text-sm text-slate-500 mt-1">จัดการรายชื่อพนักงานและสิทธิ์การเข้าถึง</p>
                </div>
                <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium flex items-center gap-2 shadow-sm transition-colors">
                  <Plus size={16} /> Add Staff
                </button>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500">
                      <th className="py-4 px-6 font-semibold uppercase text-xs tracking-wider">Employee</th>
                      <th className="py-4 px-6 font-semibold uppercase text-xs tracking-wider">Role</th>
                      <th className="py-4 px-6 font-semibold uppercase text-xs tracking-wider">Shift Schedule</th>
                      <th className="py-4 px-6 font-semibold uppercase text-xs tracking-wider text-center">System Status</th>
                      <th className="py-4 px-6 w-10"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {MOCK_STAFF.map(staff => (
                      <tr key={staff.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-4 px-6 flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-xs">
                            {staff.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-slate-800">{staff.name}</p>
                            <p className="text-xs font-mono text-slate-500 mt-0.5">{staff.id}</p>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-slate-700 font-medium">{staff.role}</td>
                        <td className="py-4 px-6 text-slate-600">{staff.shift}</td>
                        <td className="py-4 px-6 text-center">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${staff.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${staff.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                            {staff.status}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <button className="text-slate-400 hover:text-indigo-600 transition-colors"><MoreVertical size={16} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* --- TAB: SETTINGS --- */}
          {activeTab === 'settings' && (
            <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300 pb-20">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-slate-800">System Settings</h2>
                <p className="text-sm text-slate-500 mt-1">ตั้งค่าระบบจัดการคลังสินค้า</p>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-8">
                {/* Section 1 */}
                <div className="border-b border-slate-100 pb-8">
                  <h3 className="text-base font-bold text-slate-800 flex items-center gap-2 mb-4"><Box size={18} className="text-indigo-500"/> Warehouse Profile</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Warehouse Name</label>
                      <input type="text" className="w-full p-2 border border-slate-300 rounded-lg text-sm" defaultValue="Nexus Main Hub" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Contact Email</label>
                      <input type="email" className="w-full p-2 border border-slate-300 rounded-lg text-sm" defaultValue="admin@nexuswms.com" />
                    </div>
                  </div>
                </div>

                {/* Section 2 */}
                <div className="border-b border-slate-100 pb-8">
                  <h3 className="text-base font-bold text-slate-800 flex items-center gap-2 mb-4"><Bell size={18} className="text-indigo-500"/> Notifications</h3>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" defaultChecked className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500" />
                      <span className="text-sm text-slate-700 font-medium">แจ้งเตือนเมื่อสต๊อกต่ำกว่าเกณฑ์ (Low Stock Alerts)</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" defaultChecked className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500" />
                      <span className="text-sm text-slate-700 font-medium">ส่งสรุปรายงานประจำวันทางอีเมล</span>
                    </label>
                  </div>
                </div>

                {/* Section 3 */}
                <div>
                  <h3 className="text-base font-bold text-red-600 flex items-center gap-2 mb-4"><Shield size={18}/> Danger Zone</h3>
                  <p className="text-sm text-slate-500 mb-4">ระมัดระวังการตั้งค่าในส่วนนี้ เนื่องจากอาจกระทบต่อระบบโดยรวม</p>
                  <button className="px-4 py-2 border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg text-sm font-bold transition-colors">
                    ล้างข้อมูลระบบทั้งหมด (Factory Reset)
                  </button>
                </div>
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <button className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-bold transition-colors">ยกเลิก</button>
                <button className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-bold shadow-sm shadow-indigo-600/30 transition-colors">บันทึกการตั้งค่า</button>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}