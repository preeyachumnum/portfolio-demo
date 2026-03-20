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
    path: '/course',
    title: 'Course Skill Online',
    description:
      'ระบบเรียนออนไลน์',
    status: 'พร้อมแสดง',
  },
  {
    path: '/pos-system',
    title: 'OmniPOS Enterprise',
    description:
      'ระบบจัดการหน้าร้านและหลังบ้านระดับองค์กร พร้อมงานขาย ชำระเงิน และ backoffice workflow แบบครบชุด',
    status: 'พร้อมแสดง',
  },
  {
    path: '/warehouse-management',
    title: 'Nexus Warehouse Management',
    description:
      'ระบบคลังสินค้า WMS พร้อม dashboard ภาพรวม การแจ้งเตือนสต็อก และเครื่องมือจัดการข้อมูลขนาดใหญ่',
    status: 'พร้อมแสดง',
  },
  {
    path: '/project-management',
    title: 'Process Flow Kanban Board',
    description:
      'บอร์ดจัดการโปรเจกต์สไตล์ modern SaaS รองรับการลากวาง task และติดตามสถานะงานแบบเป็นขั้นตอน',
    status: 'พร้อมแสดง',
  },
  {
    path: '/pos-system-smart',
    title: 'Smart POS System',
    description:
      'ชุดเดโม POS หลายโหมด ทั้งหน้าร้าน KDS kiosk และ dashboard สำหรับโชว์ flow การทำงานครบวงจร',
    status: 'พร้อมแสดง',
  },
  {
    path: '/mini-game',
    title: 'Mini Game Portal',
    description:
      'หน้า portal รวมมินิเกมทั้งหมดในโปรเจกต์ สำหรับเลือกเข้าเล่นเกมที่มีอยู่ตอนนี้และรองรับการเพิ่มเกมใหม่ในอนาคต',
    status: 'พร้อมแสดง',
  },
  {
    path: '/pos-spa',
    title: 'บริหารจัดการร้านนวดและสปา',
    description:
      'ระบบจองคิว (Booking Time-slot) - ระบบ POS แคชเชียร์ - ระบบ Role-based - Responsive & Sound',
    status: 'พร้อมแสดง',
  },
];
