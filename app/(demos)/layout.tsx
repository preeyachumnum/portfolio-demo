"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Info, X } from 'lucide-react';

import { DEMO_PROJECTS } from '../data/demo-projects';

export default function DemosLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const currentProject = DEMO_PROJECTS.find((project) => pathname.startsWith(project.path)) || {
    title: 'Demo System',
    description: 'System Preview',
  };

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-[#0A0A0A] font-sans">
      <div className="z-50 flex h-14 flex-none items-center justify-between border-b border-white/10 bg-[#131620] px-6 text-zinc-400">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 text-sm font-semibold text-white transition-colors hover:text-blue-400">
            <Home size={16} />
            <span>กลับหน้า Portal</span>
          </Link>
          <div className="h-4 w-px bg-white/20" />
          <div className="flex items-center gap-2 text-sm font-semibold text-zinc-200">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
            {currentProject.title}
          </div>
        </div>

        <div className="relative">
          <button
            onClick={() => setIsOpen((prev) => !prev)}
            className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              isOpen ? 'bg-white/10 text-white' : 'hover:bg-white/5 hover:text-white'
            }`}
          >
            <Info size={16} />
            <span>ข้อมูลระบบ</span>
          </button>

          {isOpen && (
            <div className="animate-in fade-in slide-in-from-top-2 absolute right-0 top-full z-50 mt-3 w-80 rounded-xl border border-zinc-200 bg-white p-5 text-left text-zinc-800 shadow-2xl">
              <div className="mb-3 flex items-center justify-between">
                <h4 className="font-bold text-zinc-900">เกี่ยวกับระบบนี้</h4>
                <button onClick={() => setIsOpen(false)} className="text-zinc-400 hover:text-zinc-600">
                  <X size={16} />
                </button>
              </div>
              <p className="text-sm leading-relaxed text-zinc-600">{currentProject.description}</p>
            </div>
          )}
        </div>
      </div>

      <div className="relative mt-0 flex-1 overflow-hidden border border-white/5 bg-white shadow-2xl md:mx-2 md:mt-2 md:rounded-t-xl">
        {children}
      </div>
    </div>
  );
}
