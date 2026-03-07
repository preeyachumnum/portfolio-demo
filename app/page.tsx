import { ArrowRight } from 'lucide-react';

type PortfolioProject = {
  id: string;
  title: string;
  status: string;
  description: string;
  link: string;
};

const PORTFOLIO_PROJECTS: PortfolioProject[] = [
  {
    id: 'usa-thai-shipping',
    title: 'USA-Thai Shipping Suite',
    status: 'พร้อมแสดง',
    description:
      'Parcel operations system for USA-Thai shipping with Admin flows, Customer portal, and tracking system.',
    link: '/usa-thai-shipping',
  },
  {
    id: 'pos-system',
    title: 'OmniPOS Enterprise',
    status: 'พร้อมแสดง',
    description: 'ระบบจัดการหน้าร้าน (POS) ระดับองค์กร พร้อมฟังก์ชันชำระเงินแบบครบวงจรและระบบจัดการหลังบ้าน (Backoffice)',
    link: '/pos-system',
  },
{
    id: 'warehouse-management',
    title: 'Nexus Warehouse Management',
    status: 'พร้อมแสดง',
    description: 'ระบบจัดการคลังสินค้าอัจฉริยะ (WMS) พร้อม Dashboard สรุปผล, การแจ้งเตือนสต๊อกใกล้หมด, และระบบตารางจัดการข้อมูลขนาดใหญ่',
    link: '/warehouse-management',
  },
{
    id: 'project-management',
    title: 'Process Flow Kanban Board',
    status: 'พร้อมแสดง',
    description: 'ระบบจัดการโครงการและกระดาน Kanban สไตล์ Modern SaaS รองรับการ Drag and Drop (ลากวาง) เปลี่ยนสถานะงานได้จริง',
    link: '/project-management',
  }
];

function ProjectCard({ project }: { project: PortfolioProject }) {
  return (
    <a href={project.link} className="block">
      <div className="group relative h-full overflow-hidden rounded-2xl border border-[#222635] bg-[#131620] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-blue-500/50 hover:shadow-[0_8px_30px_rgb(59,130,246,0.12)]">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

        <div className="relative z-10 mb-4 flex items-start justify-between">
          <h3 className="pr-4 text-xl font-bold text-gray-100">{project.title}</h3>
          <span className="shrink-0 rounded-md border border-[#166534] bg-[#052e16] px-2.5 py-1 text-[10px] font-bold tracking-wider text-[#4ade80]">
            {project.status}
          </span>
        </div>

        <p className="relative z-10 mb-8 h-16 text-sm leading-relaxed text-gray-400">
          {project.description}
        </p>

        <div className="relative z-10 flex items-center text-sm font-semibold text-gray-300 transition-colors group-hover:text-blue-400">
          เปิดตัวอย่าง
          <ArrowRight size={16} className="ml-2 transition-transform group-hover:translate-x-1" />
        </div>
      </div>
    </a>
  );
}

export default function PortfolioHome() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0B0D14] font-sans text-white">
      <div
        className="absolute inset-0 z-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />
      <div className="pointer-events-none absolute left-1/2 top-0 z-0 h-[400px] w-[600px] -translate-x-1/2 rounded-full bg-blue-600/20 blur-[120px]" />

      <div className="relative z-10 mx-auto max-w-6xl px-4 py-20">
        <div className="mb-16 flex flex-col items-center text-center">
          <div className="mb-6 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-blue-400 backdrop-blur-sm">
            Portfolio Demo
          </div>
          <h1 className="mb-6 text-5xl font-extrabold tracking-tight md:text-6xl">
            Innovation{' '}
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Showcase
            </span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg font-medium text-gray-400">
            รวมทุกโปรเจ็กต์จากโฟลเดอร์ demo ไว้ในเว็บเดียว ประสบการณ์ทำงานแบบมืออาชีพ
            ดีไซน์และระบบที่ได้มาตรฐาน
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {PORTFOLIO_PROJECTS.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </div>
    </div>
  );
}
