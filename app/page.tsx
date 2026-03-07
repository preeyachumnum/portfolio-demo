import { ArrowRight } from 'lucide-react';

// ==========================================
// 1. MOCK DATA
// ==========================================
const PORTFOLIO_PROJECTS = [
  {
    id: 'usa-thai-shipping',
    title: 'USA-Thai Shipping Suite',
    status: 'พร้อมแสดง',
    description: 'Parcel operations system for USA-Thai shipping with Admin flows, Customer portal, and tracking system.',
    link: '/usa-thai-shipping' // ใส่ Link สำหรับ Next.js
  }
];


export default function PortfolioHome() {
  return (
    <div className="min-h-screen bg-[#0B0D14] text-white relative overflow-hidden font-sans">
      {/* Background Grid Pattern */}
      <div 
        className="absolute inset-0 z-0 opacity-[0.03]" 
        style={{ 
          backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)`,
          backgroundSize: '40px 40px' 
        }} 
      />
      
      {/* Glow Effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-blue-600/20 blur-[120px] rounded-full pointer-events-none z-0" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-20">
        
        {/* Header Section */}
        <div className="text-center mb-16 flex flex-col items-center">
          <div className="px-4 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 text-xs font-semibold tracking-widest uppercase mb-6 backdrop-blur-sm">
            Portfolio Demo
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6 tracking-tight">
            Innovation <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Showcase</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto font-medium">
            รวมทุกโปรเจ็คจากโฟลเดอร์ demo ไว้ในเว็บเดียว ประสบการณ์ทำงานแบบมืออาชีพ ดีไซน์และระบบที่ได้มาตรฐาน
          </p>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {PORTFOLIO_PROJECTS.map((project, idx) => {
            const isClickable = project.link !== '#';

            // โครงสร้างการ์ด
            const CardContent = (
              <div className={`
                bg-[#131620] border border-[#222635] rounded-2xl p-6 relative group overflow-hidden transition-all duration-300 h-full
                ${isClickable ? 'hover:border-blue-500/50 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(59,130,246,0.12)] cursor-pointer' : 'opacity-80 cursor-not-allowed'}
              `}>
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                
                <div className="flex justify-between items-start mb-4 relative z-10">
                  <h3 className="text-xl font-bold text-gray-100 pr-4">{project.title}</h3>
                  <span className="px-2.5 py-1 rounded-md bg-[#052e16] border border-[#166534] text-[#4ade80] text-[10px] font-bold tracking-wider shrink-0">
                    {project.status}
                  </span>
                </div>
                
                <p className="text-gray-400 text-sm mb-8 leading-relaxed h-16 relative z-10">
                  {project.description}
                </p>
                
                <div className="flex items-center text-sm font-semibold text-gray-300 group-hover:text-blue-400 transition-colors relative z-10">
                  เปิดตัวอย่าง <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );

            // ปรับเป็นแท็ก <a> แทน Link เพื่อให้ระบบพรีวิวสามารถแสดงผลได้
            if (isClickable) {
              return (
                <a href={project.link} key={idx} className="block">
                  {CardContent}
                </a>
              );
            }

            return <div key={idx}>{CardContent}</div>;
          })}
        </div>
      </div>
    </div>
  );
}