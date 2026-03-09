export type DemoProject = {
  path: string;
  title: string;
  description: string;
  status: string;
};

export const DEMO_PROJECTS: DemoProject[] = [
  {
    path: '/usa-thai-shipping',
    title: 'USA-Thai Shipping Suite',
    description:
      'Parcel operations system for USA-Thai shipping with Admin flows, Customer portal, and tracking system.',
    status: 'พร้อมแสดง',
  },
  {
    path: '/pos-system',
    title: 'OmniPOS Enterprise',
    description:
      'ระบบจัดการหน้าร้าน (POS) ระดับองค์กร พร้อมฟังก์ชันชำระเงินแบบครบวงจรและระบบจัดการหลังบ้าน (Backoffice)',
    status: 'พร้อมแสดง',
  },
  {
    path: '/warehouse-management',
    title: 'Nexus Warehouse Management',
    description:
      'ระบบจัดการคลังสินค้าอัจฉริยะ (WMS) พร้อม Dashboard สรุปผล, การแจ้งเตือนสต๊อกใกล้หมด, และระบบตารางจัดการข้อมูลขนาดใหญ่',
    status: 'พร้อมแสดง',
  },
  {
    path: '/project-management',
    title: 'Process Flow Kanban Board',
    description:
      'ระบบจัดการโครงการและกระดาน Kanban สไตล์ Modern SaaS รองรับการ Drag and Drop (ลากวาง) เปลี่ยนสถานะงานได้จริง',
    status: 'พร้อมแสดง',
  },
  {
    path: '/pos-system-smart',
    title: 'Smart POS System',
    description:
      'POS Mode (หน้าร้าน): สำหรับพนักงานรับออเดอร์ คิดเงิน, KDS Mode (ระบบในครัว), Kiosk Mode (ตู้สั่งอาหาร), Dashboard (หลังบ้าน)',
    status: 'พร้อมแสดง',
  },
  {
    path: '/mini-2d-pool',
    title: 'Mini Pool Game 2D',
    description:
      '2D เกม pool เล่นคนเดียวได้ เล่นกับเพื่อนได้ เล่นกับบอทได้',
    status: 'พร้อมแสดง',
  },
];
