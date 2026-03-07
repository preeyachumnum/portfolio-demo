"use client";

import type { FormEvent } from 'react';
import { useState, useEffect, useMemo } from 'react';
import { 
  Plus, Scan, ClipboardList, Send, Truck, Box, Home, Users
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

type NewPackageForm = {
  trackingNo: string;
  customerId: string;
  weight: string;
  boxes: string;
};

type CustomerSummary = {
  totalWeight: number;
  totalBoxes: number;
  packageCount: number;
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

export default function ShippingAdminPortal() {
  const [mounted, setMounted] = useState(false);
  const [packages, setPackages] = useState<ShippingPackage[]>(INITIAL_PACKAGES);
  const [newPackage, setNewPackage] = useState<NewPackageForm>({ trackingNo: '', customerId: '', weight: '', boxes: '' });
  const [lineMessagePreview, setLineMessagePreview] = useState<string | null>(null);

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

  useEffect(() => {
    if (mounted) {
      localStorage.setItem('shipping_mock_data', JSON.stringify(packages));
    }
  }, [packages, mounted]);

  const handleMockScan = () => {
    const randomTracking = 'US-' + Math.floor(100000000 + Math.random() * 900000000);
    setNewPackage(prev => ({ ...prev, trackingNo: randomTracking }));
  };

  const handleAddPackage = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newPackage.trackingNo || !newPackage.customerId) return;

    const newPkg: ShippingPackage = {
      id: Date.now(),
      trackingNo: newPackage.trackingNo,
      customerId: newPackage.customerId.toUpperCase(),
      weight: parseFloat(newPackage.weight) || 0,
      boxes: parseInt(newPackage.boxes) || 1,
      status: STATUSES[0],
      imageUrl: `https://images.unsplash.com/photo-1580674285054-bed31e145f59?q=80&w=800&auto=format&fit=crop`, 
      timeline: [{ status: STATUSES[0], date: new Date().toLocaleString('th-TH') }]
    };

    setPackages([...packages, newPkg]);
    setNewPackage({ trackingNo: '', customerId: '', weight: '', boxes: '' });
  };

  const handleUpdateStatus = (id: number, newStatusIndex: number) => {
    const status = STATUSES[newStatusIndex];
    if (!status) return;

    setPackages(packages.map(pkg => {
      if (pkg.id === id) {
        const updatedTimeline = [...pkg.timeline];
        if (!updatedTimeline.find(t => t.status === status)) {
           updatedTimeline.push({ status, date: new Date().toLocaleString('th-TH') });
        }
        return { ...pkg, status, timeline: updatedTimeline };
      }
      return pkg;
    }));
  };

  const customerSummaries = useMemo<Record<string, CustomerSummary>>(() => {
    const summaries: Record<string, CustomerSummary> = {};
    packages.forEach(pkg => {
      if (!summaries[pkg.customerId]) {
        summaries[pkg.customerId] = { totalWeight: 0, totalBoxes: 0, packageCount: 0 };
      }
      summaries[pkg.customerId].totalWeight += pkg.weight;
      summaries[pkg.customerId].totalBoxes += pkg.boxes;
      summaries[pkg.customerId].packageCount += 1;
    });
    return summaries;
  }, [packages]);

  const generateLineMessage = (customerId: string) => {
    const summary = customerSummaries[customerId];
    const msg = `📦 สรุปยอดพัสดุชิปปิ้ง\nรหัสลูกค้า: ${customerId}\nจำนวนพัสดุ: ${summary.packageCount} รายการ\nรวมจำนวนกล่อง: ${summary.totalBoxes} กล่อง\nน้ำหนักรวม: ${summary.totalWeight.toFixed(2)} kg\n\n🔍 เช็คสถานะพัสดุของคุณได้ที่:\nhttps://your-custom-domain.com/track/${customerId}`;
    setLineMessagePreview(msg);
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(79,70,229,0.14),transparent_35%),radial-gradient(circle_at_85%_15%,rgba(14,165,233,0.12),transparent_28%),linear-gradient(180deg,#f8fafc_0%,#eef2ff_52%,#f8fafc_100%)]"></div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[linear-gradient(180deg,#f8fafc_0%,#eef2ff_45%,#f8fafc_100%)] font-sans pb-12">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(79,70,229,0.16),transparent_34%),radial-gradient(circle_at_85%_18%,rgba(14,165,233,0.12),transparent_28%),radial-gradient(circle_at_15%_78%,rgba(99,102,241,0.08),transparent_24%)]"></div>
        <div className="absolute inset-0 opacity-60 [background-image:linear-gradient(rgba(148,163,184,0.09)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.09)_1px,transparent_1px)] [background-size:72px_72px] [mask-image:radial-gradient(circle_at_center,black,transparent_82%)]"></div>
        <div className="absolute left-[-8rem] top-24 h-64 w-64 rounded-full bg-indigo-200/30 blur-3xl"></div>
        <div className="absolute right-[-5rem] top-32 h-72 w-72 rounded-full bg-sky-200/40 blur-3xl"></div>
        <div className="absolute bottom-[-8rem] left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-white/50 blur-3xl"></div>
      </div>
      <nav className="sticky top-0 z-40 border-b border-white/60 bg-white/75 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 h-16 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg text-white"><Users size={18} /></div>
            <span className="text-lg font-bold text-gray-900">Admin Portal</span>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => { localStorage.removeItem('shipping_mock_data'); setPackages(INITIAL_PACKAGES); }} className="text-sm font-medium text-gray-500 hover:text-red-600 px-3 py-2 rounded-lg hover:bg-red-50 transition-colors">
              รีเซ็ตข้อมูล
            </button>
            <div className="w-px h-6 bg-gray-200"></div>
            <a href="/usa-thai-shipping" className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">
              <Home size={18} /> กลับ
            </a>
          </div>
        </div>
      </nav>

      <div className="relative max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 xl:grid-cols-12 gap-8">
        <div className="xl:col-span-4">
          <div className="rounded-2xl border border-white/80 bg-white/88 shadow-[0_24px_80px_-32px_rgba(15,23,42,0.2)] backdrop-blur-xl overflow-hidden sticky top-24">
            <div className="p-5 border-b border-gray-100/80 bg-white/60">
              <h2 className="font-bold text-gray-900 flex items-center gap-2"><Plus size={18} className="text-blue-600"/> รับเข้าพัสดุ</h2>
            </div>
            <form onSubmit={handleAddPackage} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Tracking Number</label>
                <div className="flex gap-2">
                  <input required type="text" value={newPackage.trackingNo} onChange={e => setNewPackage({...newPackage, trackingNo: e.target.value})} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm font-medium text-gray-900" />
                  <button type="button" onClick={handleMockScan} className="bg-gray-800 text-white px-3 py-2 rounded-lg hover:bg-gray-700 transition-colors"><Scan size={18} /></button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Customer ID</label>
                <input required type="text" value={newPackage.customerId} onChange={e => setNewPackage({...newPackage, customerId: e.target.value})} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm font-medium text-gray-900 uppercase" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">น้ำหนัก (kg)</label>
                  <input type="number" step="0.1" value={newPackage.weight} onChange={e => setNewPackage({...newPackage, weight: e.target.value})} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm font-medium text-gray-900" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">จำนวนกล่อง</label>
                  <input type="number" min="1" value={newPackage.boxes} onChange={e => setNewPackage({...newPackage, boxes: e.target.value})} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm font-medium text-gray-900" />
                </div>
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-bold text-sm hover:bg-blue-700 transition-all flex items-center justify-center gap-2 mt-2">
                <Plus size={16} /> บันทึก
              </button>
            </form>
          </div>
        </div>

        <div className="xl:col-span-8 space-y-6">
          <div className="rounded-2xl border border-white/80 bg-white/88 shadow-[0_24px_80px_-32px_rgba(15,23,42,0.2)] backdrop-blur-xl overflow-hidden">
            <div className="p-5 border-b border-gray-100/80 bg-white/60 flex justify-between items-center">
              <h2 className="font-bold text-gray-900 flex items-center gap-2"><ClipboardList size={18} className="text-blue-600"/> สรุปยอดเพื่อส่ง LINE</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-white/60 text-gray-500 text-xs uppercase font-bold border-b border-gray-100/80">
                  <tr>
                    <th className="px-5 py-3">รหัสลูกค้า</th>
                    <th className="px-5 py-3">ชิ้น</th>
                    <th className="px-5 py-3">กล่อง</th>
                    <th className="px-5 py-3">น้ำหนัก</th>
                    <th className="px-5 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {Object.entries(customerSummaries).map(([custId, summary]) => (
                    <tr key={custId} className="hover:bg-slate-50/80">
                      <td className="px-5 py-3 font-bold text-gray-900">{custId}</td>
                      <td className="px-5 py-3 text-gray-600">{summary.packageCount}</td>
                      <td className="px-5 py-3 text-gray-600">{summary.totalBoxes}</td>
                      <td className="px-5 py-3 font-semibold text-gray-700">{summary.totalWeight.toFixed(2)} kg</td>
                      <td className="px-5 py-3 text-right">
                        <button onClick={() => generateLineMessage(custId)} className="bg-[#00B900] text-white px-3 py-1.5 rounded-md text-xs font-bold hover:bg-[#009900] transition-all inline-flex items-center gap-1.5">
                          <Send size={14} /> ส่ง LINE
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {lineMessagePreview && (
              <div className="m-4 p-4 bg-slate-50/80 border border-white/80 rounded-xl relative backdrop-blur">
                <button onClick={() => setLineMessagePreview(null)} className="absolute top-3 right-3 text-gray-400 hover:text-gray-700">✕</button>
                <h3 className="text-xs font-bold text-gray-500 uppercase mb-2">พรีวิวข้อความ (คัดลอกได้)</h3>
                <pre className="text-sm font-sans text-gray-800 bg-white/90 p-3 rounded border border-white/80 mb-3 whitespace-pre-wrap backdrop-blur">{lineMessagePreview}</pre>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-white/80 bg-white/88 shadow-[0_24px_80px_-32px_rgba(15,23,42,0.2)] backdrop-blur-xl overflow-hidden">
            <div className="p-5 border-b border-gray-100/80 bg-white/60">
              <h2 className="font-bold text-gray-900 flex items-center gap-2"><Truck size={18} className="text-blue-600"/> อัปเดตสถานะพัสดุ</h2>
            </div>
            <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
              {packages.map(pkg => (
                <div key={pkg.id} className="border border-white/80 rounded-xl p-4 bg-white/85 backdrop-blur flex flex-col gap-3 hover:border-blue-300 transition-colors">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-bold text-gray-900 text-sm">{pkg.trackingNo}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{pkg.customerId} • {pkg.weight}kg • {pkg.boxes}กล่อง</div>
                    </div>
                  </div>
                  <select 
                    className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium outline-none text-gray-700 focus:ring-2 focus:ring-blue-500/20"
                    value={STATUSES.indexOf(pkg.status)}
                    onChange={(e) => handleUpdateStatus(pkg.id, parseInt(e.target.value))}
                  >
                    {STATUSES.map((s, i) => <option key={i} value={i}>{s}</option>)}
                  </select>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
