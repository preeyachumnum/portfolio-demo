"use client";

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Home, Info, X } from 'lucide-react';

// ตั้งค่าข้อมูลระบบทั้งหมดที่นี่ที่เดียว!
const DEMO_PROJECTS = [
  {
    path: '/usa-thai-shipping',
    title: 'USA-Thai Shipping Suite',
    description: 'Parcel operations system for USA-Thai shipping with Admin flows, Customer portal, and tracking system.'
  },
  {
    path: '/pos-system',
    title: 'OmniPOS Enterprise',
    description: 'ระบบจัดการหน้าร้าน (POS) ระดับองค์กร พร้อมระบบจำลองการชำระเงินเต็มรูปแบบ คำนวณเงินทอนอัตโนมัติ และซิงค์ข้อมูลหลังบ้าน'
  }
];

export default function DemosLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  // ค้นหาข้อมูลโปรเจกต์ปัจจุบันจาก URL
  const currentProject = DEMO_PROJECTS.find(p => pathname.startsWith(p.path)) || {
    title: 'Demo System',
    description: 'System Preview'
  };

  return (
    <div className="flex flex-col h-screen w-full font-sans overflow-hidden bg-[#0A0A0A]">
      {/* 🌟 Top Navigation Bar กลางของระบบ */}
      <div className="flex-none h-14 px-6 flex items-center justify-between border-b border-white/10 bg-[#131620] text-zinc-400 z-50">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 text-sm font-semibold text-white hover:text-blue-400 transition-colors">
            <Home size={16} />
            <span>กลับหน้า Portal</span>
          </Link>
          <div className="h-4 w-px bg-white/20"></div>
          <div className="flex items-center gap-2 text-sm text-zinc-200 font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            {currentProject.title}
          </div>
        </div>

        <div className="relative">
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className={`flex items-center gap-2 text-sm font-medium px-3 py-1.5 rounded-md transition-colors ${isOpen ? 'bg-white/10 text-white' : 'hover:bg-white/5 hover:text-white'}`}
          >
            <Info size={16} />
            <span>ข้อมูลระบบ</span>
          </button>

          {isOpen && (
            <div className="absolute top-full right-0 mt-3 w-80 bg-white text-zinc-800 p-5 rounded-xl shadow-2xl border border-zinc-200 z-50 animate-in fade-in slide-in-from-top-2 text-left">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-bold text-zinc-900">เกี่ยวกับระบบนี้</h4>
                <button onClick={() => setIsOpen(false)} className="text-zinc-400 hover:text-zinc-600">
                  <X size={16} />
                </button>
              </div>
              <p className="text-sm text-zinc-600 leading-relaxed">
                {currentProject.description}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 🌟 ดึงเนื้อหาของหน้าต่างๆ มาแสดงตรงนี้ (usa-thai หรือ pos-system) */}
      <div className="flex-1 relative overflow-hidden bg-white mt-0 md:mt-2 md:mx-2 md:rounded-t-xl shadow-2xl border border-white/5">
        {children}
      </div>
    </div>
  );
}