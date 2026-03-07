import { Home, Search, Truck, Users } from 'lucide-react';
import {
  SHIPPING_PAGE_SHELL_CLASS,
  ShippingBackgroundDecor,
} from './shared';

const PORTAL_OPTIONS = [
  {
    href: '/usa-thai-shipping/admin',
    title: 'Admin Portal',
    description: 'ระบบจัดการพัสดุสำหรับพนักงาน',
    icon: Users,
    accentClassName: 'bg-blue-50 text-blue-600',
    hoverClassName:
      'hover:border-blue-200 hover:shadow-[0_32px_90px_-34px_rgba(37,99,235,0.32)]',
  },
  {
    href: '/usa-thai-shipping/customer',
    title: 'Customer Portal',
    description: 'หน้าระบบค้นหาสถานะสำหรับลูกค้า',
    icon: Search,
    accentClassName: 'bg-emerald-50 text-emerald-600',
    hoverClassName:
      'hover:border-emerald-200 hover:shadow-[0_32px_90px_-34px_rgba(16,185,129,0.26)]',
  },
];

export default function ShippingSelector() {
  return (

      <div className={`${SHIPPING_PAGE_SHELL_CLASS} flex flex-col font-sans`}>
        <ShippingBackgroundDecor />

        <div className="relative flex min-h-screen flex-col">
          <header className="sticky top-0 z-40 flex items-center justify-between border-b border-white/60 bg-white/75 p-4 backdrop-blur-xl">
            <div className="flex items-center gap-2 text-xl font-bold text-gray-900">
              <Truck className="text-blue-600" />
              USA-Thai Shipping
            </div>
            <a
              href="/"
              className="flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-blue-600"
            >
              <Home size={16} />
              กลับ Portfolio
            </a>
          </header>

          <main className="relative flex flex-1 items-center justify-center p-4">
            <div className="grid w-full max-w-3xl grid-cols-1 gap-6 md:grid-cols-2">
              {PORTAL_OPTIONS.map((portal) => {
                const Icon = portal.icon;

                return (
                  <a
                    key={portal.href}
                    href={portal.href}
                    className={`group block cursor-pointer rounded-[2rem] border border-white/80 bg-white/88 p-8 text-center shadow-[0_24px_80px_-32px_rgba(79,70,229,0.28)] backdrop-blur-xl transition-all hover:-translate-y-1 ${portal.hoverClassName}`}
                  >
                    <div
                      className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl transition-transform group-hover:scale-110 ${portal.accentClassName}`}
                    >
                      <Icon size={32} />
                    </div>
                    <h2 className="mb-2 text-2xl font-bold text-gray-900">{portal.title}</h2>
                    <p className="text-sm text-gray-500">{portal.description}</p>
                  </a>
                );
              })}
            </div>
          </main>
        </div>
      </div>
  );
}
