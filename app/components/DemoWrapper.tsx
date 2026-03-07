// app/components/DemoWrapper.tsx
"use client";

import React, { useState } from 'react';
import { Home, Info, X } from 'lucide-react';
import Link from 'next/link';

interface DemoWrapperProps {
  children: React.ReactNode;
  title: string;
  description: string;
}

export default function DemoWrapper({ children, title, description }: DemoWrapperProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative min-h-screen">
      {/* 🌟 เนื้อหาหลักของเดโม่จะถูก render ตรงนี้ */}
      {children}

      {/* 🌟 Floating Widget (แสดงทุกหน้าที่มีการเรียกใช้ DemoWrapper) */}
      <div className="fixed bottom-6 left-6 z-[9999] flex flex-col items-start gap-3 font-sans">
        {isOpen && (
          <div className="bg-[#131620] border border-[#222635] text-white p-5 rounded-xl shadow-2xl w-80 animate-in slide-in-from-bottom-4 duration-300">
            <div className="flex justify-between items-start mb-3">
              <h3 className="font-bold text-sm bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                {title}
              </h3>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                <X size={16} />
              </button>
            </div>
            <p className="text-sm text-gray-300 leading-relaxed">
              {description}
            </p>
          </div>
        )}
        <div className="flex gap-2">
          <Link 
            href="/" 
            className="flex items-center gap-2 bg-[#131620] hover:bg-[#1c2130] border border-[#222635] text-gray-200 hover:text-white px-5 py-2.5 rounded-full shadow-lg transition-all text-sm font-semibold group no-underline"
          >
            <Home size={18} className="text-blue-400 group-hover:scale-110 transition-transform" /> 
            กลับหน้า Portal
          </Link>
          <button 
            onClick={() => setIsOpen(!isOpen)} 
            className={`flex items-center justify-center w-10 h-10 rounded-full shadow-lg transition-all border ${
              isOpen 
                ? 'bg-blue-500 border-blue-400 text-white' 
                : 'bg-[#131620] hover:bg-[#1c2130] border-[#222635] text-blue-400'
            }`}
          >
            <Info size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}