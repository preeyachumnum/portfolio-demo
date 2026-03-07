"use client";

import type { FormEvent } from 'react';
import { useState, useEffect } from 'react';
import { 
  Search, Truck, Check, Camera, 
  MapPin, AlertCircle, Home, Calendar, Package
} from 'lucide-react';

const STATUSES = ['รับของที่โกดัง US', 'กำลังเดินทางมาไทย', 'ถึงโกดังไทย', 'จัดส่งให้ลูกค้าแล้ว'];

type PackageTimelineEntry = {
  status: string;
  date: string;
};

type ShippingPackage = {
  id: number;
  trackingNo: string;
  customerId: string;
  weight: number;
  boxes: number;
  status: string;
  imageUrl: string;
  timeline: PackageTimelineEntry[];
};

const INITIAL_PACKAGES: ShippingPackage[] = [
  { 
    id: 1, trackingNo: 'US-123456789', customerId: 'CUST-01', weight: 1.5, boxes: 1, status: 'รับของที่โกดัง US', 
    imageUrl: 'https://images.unsplash.com/photo-1607227063002-677dc5fdf96f?q=80&w=800&auto=format&fit=crop',
    timeline: [{ status: 'รับของที่โกดัง US', date: '2026-03-01 10:00' }] 
  },
  { 
    id: 2, trackingNo: 'US-987654321', customerId: 'CUST-01', weight: 5.2, boxes: 2, status: 'กำลังเดินทางมาไทย', 
    imageUrl: 'https://images.unsplash.com/photo-1580674285054-bed31e145f59?q=80&w=800&auto=format&fit=crop',
    timeline: [
      { status: 'รับของที่โกดัง US', date: '2026-03-01 10:00' }, 
      { status: 'กำลังเดินทางมาไทย', date: '2026-03-05 14:30' }
    ] 
  },
  // เพิ่ม CUST-02 ให้หน้าลูกค้ารู้จักตั้งแต่เริ่มต้น
  { 
    id: 3, trackingNo: 'US-555555555', customerId: 'CUST-02', weight: 10.0, boxes: 3, status: 'ถึงโกดังไทย', 
    imageUrl: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?q=80&w=800&auto=format&fit=crop',
    timeline: [
      { status: 'รับของที่โกดัง US', date: '2026-02-20 11:00' }, 
      { status: 'กำลังเดินทางมาไทย', date: '2026-02-25 08:00' }, 
      { status: 'ถึงโกดังไทย', date: '2026-03-05 16:45' }
    ] 
  }
];

const mergePackagesWithSeed = (savedPackages: ShippingPackage[]): ShippingPackage[] => {
  const packageMap = new Map(INITIAL_PACKAGES.map((pkg) => [pkg.trackingNo, pkg]));

  savedPackages.forEach((pkg) => {
    packageMap.set(pkg.trackingNo, pkg);
  });

  return Array.from(packageMap.values());
};

export default function ShippingCustomerPortal() {
  const [mounted, setMounted] = useState(false);
  const [packages, setPackages] = useState<ShippingPackage[]>(INITIAL_PACKAGES);
  const [searchCustomerId, setSearchCustomerId] = useState('');
  const [currentCustomer, setCurrentCustomer] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('shipping_mock_data');
    if (saved) {
      try {
        setPackages(mergePackagesWithSeed(JSON.parse(saved) as ShippingPackage[]));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const handleCustomerSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchCustomerId.trim()) {
      setCurrentCustomer(searchCustomerId.trim().toUpperCase());
    }
  };

  const customerPackages = packages.filter(pkg => pkg.customerId === currentCustomer);
  const customerTotalWeight = customerPackages.reduce((sum, pkg) => sum + pkg.weight, 0);
  const customerTotalBoxes = customerPackages.reduce((sum, pkg) => sum + pkg.boxes, 0);

  const availableMockIds = [...new Set(packages.map(p => p.customerId))];

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(79,70,229,0.14),transparent_35%),radial-gradient(circle_at_85%_15%,rgba(14,165,233,0.12),transparent_28%),linear-gradient(180deg,#f8fafc_0%,#eef2ff_52%,#f8fafc_100%)]"></div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[linear-gradient(180deg,#f8fafc_0%,#eef2ff_45%,#f8fafc_100%)] font-sans flex flex-col selection:bg-indigo-100">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(79,70,229,0.16),transparent_34%),radial-gradient(circle_at_85%_18%,rgba(14,165,233,0.12),transparent_28%),radial-gradient(circle_at_15%_78%,rgba(99,102,241,0.08),transparent_24%)]"></div>
        <div className="absolute inset-0 opacity-60 [background-image:linear-gradient(rgba(148,163,184,0.09)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.09)_1px,transparent_1px)] [background-size:72px_72px] [mask-image:radial-gradient(circle_at_center,black,transparent_82%)]"></div>
        <div className="absolute left-[-8rem] top-24 h-64 w-64 rounded-full bg-indigo-200/30 blur-3xl"></div>
        <div className="absolute right-[-5rem] top-32 h-72 w-72 rounded-full bg-sky-200/40 blur-3xl"></div>
        <div className="absolute bottom-[-8rem] left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-white/50 blur-3xl"></div>
      </div>

      <header className="sticky top-0 z-50 border-b border-white/60 bg-white/75 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex justify-between items-center">
          <div className="text-xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
            <div className="bg-indigo-600 p-1.5 rounded-lg text-white"><Truck size={20} /></div>
            MyShop<span className="text-indigo-600">Shipping</span>
          </div>
          <a href="/usa-thai-shipping" className="text-sm font-medium text-gray-500 hover:text-indigo-600 transition-colors flex items-center gap-1.5">
            <Home size={16} /> กลับหน้าหลัก
          </a>
        </div>
      </header>

      <main className="relative flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {!currentCustomer ? (
          <div className="max-w-md mx-auto mt-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="rounded-[2rem] border border-white/80 bg-white/88 p-8 text-center shadow-[0_24px_80px_-32px_rgba(79,70,229,0.35)] backdrop-blur-xl">
              <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Search className="w-8 h-8 text-indigo-600" />
              </div>
              <h1 className="text-2xl font-extrabold text-gray-900 mb-2">เช็คสถานะพัสดุ</h1>
              <p className="text-sm text-gray-500 mb-8">กรอกรหัสลูกค้า (Customer ID) ด้านล่าง</p>
              
              <form onSubmit={handleCustomerSearch} className="space-y-4">
                <input 
                  type="text" value={searchCustomerId} onChange={e => setSearchCustomerId(e.target.value)}
                  placeholder="เช่น CUST-01" required
                  className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 text-center text-lg font-bold text-gray-900 uppercase transition-all"
                />
                <button type="submit" className="w-full bg-indigo-600 text-white py-3.5 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-sm">
                  ค้นหาข้อมูล
                </button>
              </form>

              {availableMockIds.length > 0 && (
                <div className="mt-8 pt-6 border-t border-gray-100 text-left">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3 text-center">รหัสสำหรับทดสอบ</p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {availableMockIds.map(id => (
                      <button key={id} type="button" onClick={() => setSearchCustomerId(id)} className="px-3 py-1.5 rounded-lg text-sm font-semibold bg-gray-50 text-gray-600 border border-gray-200 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 transition-all">
                        {id}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-2">
              <div>
                <h1 className="text-2xl font-extrabold text-gray-900">รายการพัสดุของคุณ</h1>
                <p className="text-sm text-gray-500 mt-1">
                  ค้นหาด้วยรหัส: <span className="font-bold text-indigo-600">{currentCustomer}</span>
                </p>
              </div>
              <button onClick={() => setCurrentCustomer(null)} className="text-sm font-semibold text-gray-500 hover:text-indigo-600 bg-white/85 px-4 py-2 rounded-lg border border-white/80 shadow-sm backdrop-blur transition-colors">
                ค้นหารหัสอื่น
              </button>
            </div>

            {customerPackages.length === 0 ? (
              <div className="mt-6 rounded-3xl border border-white/80 bg-white/88 p-10 md:p-16 text-center shadow-[0_24px_80px_-32px_rgba(15,23,42,0.2)] backdrop-blur-xl">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-5">
                  <AlertCircle className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">ไม่พบข้อมูลพัสดุ</h3>
                <p className="text-gray-500 text-sm max-w-sm mx-auto mb-6">
                  ไม่พบรายการพัสดุสำหรับรหัส <span className="font-semibold">"{currentCustomer}"</span>
                </p>
              </div>
            ) : (
              <>
                {/* Summary Dashboard */}
                <div className="rounded-2xl border border-white/80 bg-white/88 p-5 shadow-[0_24px_80px_-32px_rgba(15,23,42,0.2)] backdrop-blur-xl flex flex-wrap gap-6 md:gap-12 justify-between md:justify-start items-center">
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">จำนวนรวม</p>
                    <p className="text-2xl font-black text-gray-900">{customerPackages.length} <span className="text-sm font-medium text-gray-500">ชิ้น</span></p>
                  </div>
                  <div className="w-px h-10 bg-gray-200 hidden md:block"></div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">กล่องรวม</p>
                    <p className="text-2xl font-black text-gray-900">{customerTotalBoxes} <span className="text-sm font-medium text-gray-500">กล่อง</span></p>
                  </div>
                  <div className="w-px h-10 bg-gray-200 hidden md:block"></div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">น้ำหนักรวม</p>
                    <p className="text-2xl font-black text-indigo-600">{customerTotalWeight.toFixed(2)} <span className="text-sm font-medium text-indigo-400">kg</span></p>
                  </div>
                </div>

                {/* Package List */}
                <div className="space-y-6">
                  {customerPackages.map((pkg) => (
                    <div key={pkg.id} className="rounded-2xl border border-white/80 bg-white/88 shadow-[0_24px_80px_-32px_rgba(15,23,42,0.2)] backdrop-blur-xl overflow-hidden">
                      <div className="p-5 md:px-6 border-b border-gray-100/80 bg-white/60 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                        <div className="flex items-center gap-3">
                           <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center shrink-0">
                              <Package className="text-gray-400" size={20}/>
                           </div>
                           <div>
                              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Tracking No.</p>
                              <p className="text-lg font-black text-gray-900 tracking-tight">{pkg.trackingNo}</p>
                           </div>
                        </div>
                        <span className={`px-2.5 py-1 text-[11px] font-bold rounded-full border tracking-wide uppercase flex items-center gap-1 w-fit
                          ${STATUSES.indexOf(pkg.status) === STATUSES.length - 1 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-indigo-50 text-indigo-700 border-indigo-200'}
                        `}>
                          {STATUSES.indexOf(pkg.status) === STATUSES.length - 1 ? <Check size={12}/> : <Truck size={12}/>}
                          {pkg.status}
                        </span>
                      </div>
                      
                      <div className="p-5 md:p-6 flex flex-col md:flex-row gap-8">
                        <div className="w-full md:w-1/2 lg:w-2/5 flex flex-col gap-4">
                          <div className="rounded-xl overflow-hidden border border-gray-200 bg-gray-100 relative">
                            <div className="absolute top-2 left-2 bg-white/90 backdrop-blur text-xs font-bold px-2 py-1 rounded-md text-gray-700 flex items-center gap-1 shadow-sm">
                              <Camera size={12}/> รูปถ่าย
                            </div>
                            <img src={pkg.imageUrl} alt={pkg.trackingNo} className="w-full h-40 md:h-48 object-cover" />
                          </div>
                          <div className="flex gap-3">
                             <div className="flex-1 bg-gray-50 border border-gray-100 rounded-xl p-3 flex flex-col items-center justify-center">
                                <p className="text-xs text-gray-500 font-medium mb-1">น้ำหนัก</p>
                                <p className="font-bold text-gray-900">{pkg.weight} <span className="text-xs text-gray-500 font-normal">kg</span></p>
                             </div>
                             <div className="flex-1 bg-gray-50 border border-gray-100 rounded-xl p-3 flex flex-col items-center justify-center">
                                <p className="text-xs text-gray-500 font-medium mb-1">จำนวน</p>
                                <p className="font-bold text-gray-900">{pkg.boxes} <span className="text-xs text-gray-500 font-normal">กล่อง</span></p>
                             </div>
                          </div>
                        </div>
                        
                        <div className="w-full md:w-1/2 lg:w-3/5 md:pl-4 md:border-l border-gray-100">
                          <h4 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <MapPin size={16} className="text-gray-400"/> ลำดับสถานะการจัดส่ง
                          </h4>
                          <div className="pt-2">
                            {STATUSES.map((status, index) => {
                              const log = pkg.timeline.find(t => t.status === status);
                              const currentIndex = STATUSES.indexOf(pkg.status);
                              const isCompleted = index <= currentIndex;
                              const isCurrent = index === currentIndex;
                              const isLast = index === STATUSES.length - 1;

                              return (
                                <div key={status} className="flex gap-4 relative pb-6 last:pb-0">
                                  {!isLast && <div className={`absolute left-3.5 top-7 bottom-0 w-0.5 -ml-px rounded-full ${index < currentIndex ? 'bg-indigo-600' : 'bg-gray-100'}`}></div>}
                                  
                                  <div className="relative z-10 shrink-0">
                                    <div className={`w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all duration-300
                                      ${isCurrent ? 'border-indigo-600 bg-white ring-4 ring-indigo-50 shadow-sm' : 
                                        isCompleted ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-gray-200'}
                                    `}>
                                      {isCompleted && !isCurrent ? <Check size={14} className="text-white"/> : 
                                       isCurrent ? <div className="w-2.5 h-2.5 bg-indigo-600 rounded-full" /> : null}
                                    </div>
                                  </div>

                                  <div className="-mt-1 w-full">
                                    <p className={`text-sm font-bold ${isCurrent ? 'text-indigo-700' : isCompleted ? 'text-gray-900' : 'text-gray-400'}`}>{status}</p>
                                    {log ? (
                                      <p className="text-xs text-gray-500 mt-1 flex items-center gap-1.5"><Calendar size={12} className="text-gray-400"/> {log.date}</p>
                                    ) : (
                                      <p className="text-xs text-gray-300 mt-1">-</p>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
