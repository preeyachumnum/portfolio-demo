import { Truck, Home, Users, Search } from 'lucide-react';

export default function ShippingSelector() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[linear-gradient(180deg,#f8fafc_0%,#eef2ff_45%,#f8fafc_100%)] flex flex-col font-sans">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(79,70,229,0.16),transparent_34%),radial-gradient(circle_at_85%_18%,rgba(14,165,233,0.12),transparent_28%),radial-gradient(circle_at_15%_78%,rgba(99,102,241,0.08),transparent_24%)]"></div>
        <div className="absolute inset-0 opacity-60 [background-image:linear-gradient(rgba(148,163,184,0.09)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.09)_1px,transparent_1px)] [background-size:72px_72px] [mask-image:radial-gradient(circle_at_center,black,transparent_82%)]"></div>
        <div className="absolute left-[-8rem] top-24 h-64 w-64 rounded-full bg-indigo-200/30 blur-3xl"></div>
        <div className="absolute right-[-5rem] top-32 h-72 w-72 rounded-full bg-sky-200/40 blur-3xl"></div>
        <div className="absolute bottom-[-8rem] left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-white/50 blur-3xl"></div>
      </div>
      <header className="sticky top-0 z-40 border-b border-white/60 bg-white/75 p-4 backdrop-blur-xl flex justify-between items-center">
        <div className="font-bold text-gray-900 text-xl flex items-center gap-2">
          <Truck className="text-blue-600"/> USA-Thai Shipping
        </div>
        <a href="/" className="text-sm font-medium text-gray-500 hover:text-blue-600 flex items-center gap-1">
          <Home size={16}/> กลับ Portfolio
        </a>
      </header>
      
      <div className="relative flex-1 flex items-center justify-center p-4">
        <div className="max-w-3xl w-full grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* ปุ่มไปหน้า Admin (ตอนนี้จะยัง 404 อยู่จนกว่าเราจะสร้างไฟล์ให้มัน) */}
          <a href="/usa-thai-shipping/admin" className="rounded-[2rem] border border-white/80 bg-white/88 p-8 shadow-[0_24px_80px_-32px_rgba(79,70,229,0.28)] backdrop-blur-xl cursor-pointer hover:-translate-y-1 hover:shadow-[0_32px_90px_-34px_rgba(37,99,235,0.32)] hover:border-blue-200 transition-all text-center group block">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <Users size={32}/>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Admin Portal</h2>
            <p className="text-gray-500 text-sm">ระบบจัดการพัสดุสำหรับพนักงาน</p>
          </a>

          {/* ปุ่มไปหน้า Customer (ตอนนี้จะยัง 404 อยู่จนกว่าเราจะสร้างไฟล์ให้มัน) */}
          <a href="/usa-thai-shipping/customer" className="rounded-[2rem] border border-white/80 bg-white/88 p-8 shadow-[0_24px_80px_-32px_rgba(79,70,229,0.28)] backdrop-blur-xl cursor-pointer hover:-translate-y-1 hover:shadow-[0_32px_90px_-34px_rgba(16,185,129,0.26)] hover:border-emerald-200 transition-all text-center group block">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <Search size={32}/>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Customer Portal</h2>
            <p className="text-gray-500 text-sm">หน้าระบบค้นหาสถานะสำหรับลูกค้า</p>
          </a>

        </div>
      </div>
    </div>
  );
}
