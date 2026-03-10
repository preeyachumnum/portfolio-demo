"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronLeft, Home, Info, X } from 'lucide-react';

import { DEMO_PROJECTS } from '../data/demo-projects';

export default function DemosLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const isMiniGameChildPage = pathname.startsWith('/mini-game/') && pathname !== '/mini-game';

  const currentProject = DEMO_PROJECTS.find((project) => pathname.startsWith(project.path)) || {
    title: 'Demo System',
    description: 'System Preview',
  };

  return (
    <div className="flex h-[100dvh] w-full flex-col overflow-hidden bg-[#0A0A0A] font-sans">
      {/* HEADER */}
      <div className="z-50 flex h-14 flex-none items-center justify-between border-b border-white/10 bg-[#131620] px-3 sm:px-6 text-zinc-400">
        
        {/* Left Section: Nav items with horizontal scroll on small screens */}
        <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto pr-2 min-w-0 [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          <Link href="/" className="flex flex-shrink-0 items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-semibold text-white transition-colors hover:text-blue-400">
            <Home className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">กลับหน้า Portal</span>
            <span className="inline sm:hidden">Portal</span>
          </Link>

          {isMiniGameChildPage && (
            <>
              <div className="h-3.5 sm:h-4 w-px bg-white/20 flex-shrink-0" />
              <Link href="/mini-game" className="flex flex-shrink-0 items-center gap-1 sm:gap-1.5 text-xs sm:text-sm font-semibold text-zinc-300 transition-colors hover:text-emerald-300">
                <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">กลับหน้า Mini Games</span>
                <span className="inline sm:hidden">Mini Games</span>
              </Link>
            </>
          )}

          <div className="h-3.5 sm:h-4 w-px bg-white/20 flex-shrink-0" />
          <div className="flex flex-shrink-0 items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-semibold text-zinc-200">
            <span className="h-1.5 w-1.5 sm:h-2 sm:w-2 animate-pulse rounded-full bg-emerald-500" />
            <span className="truncate max-w-[120px] sm:max-w-none">{currentProject.title}</span>
          </div>
        </div>

        {/* Right Section: Info button */}
        <div className="relative flex-shrink-0 ml-2">
          <button
            onClick={() => setIsOpen((prev) => !prev)}
            className={`flex items-center gap-1.5 sm:gap-2 rounded-md px-2 py-1.5 sm:px-3 text-xs sm:text-sm font-medium transition-colors ${
              isOpen ? 'bg-white/10 text-white' : 'hover:bg-white/5 hover:text-white'
            }`}
          >
            <Info className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">ข้อมูลระบบ</span>
          </button>

          {isOpen && (
            <div className="animate-in fade-in slide-in-from-top-2 absolute right-0 top-full z-50 mt-2 sm:mt-3 w-[260px] sm:w-80 rounded-xl border border-zinc-200 bg-white p-4 sm:p-5 text-left text-zinc-800 shadow-2xl">
              <div className="mb-2 sm:mb-3 flex items-center justify-between">
                <h4 className="font-bold text-zinc-900 text-sm sm:text-base">เกี่ยวกับระบบนี้</h4>
                <button onClick={() => setIsOpen(false)} className="text-zinc-400 hover:text-zinc-600 rounded-full hover:bg-zinc-100 p-1 transition-colors">
                  <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              </div>
              <p className="text-xs sm:text-sm leading-relaxed text-zinc-600">{currentProject.description}</p>
            </div>
          )}
        </div>
      </div>

      <div className="relative mt-0 flex-1 overflow-x-hidden overflow-y-auto border border-white/5 bg-white shadow-2xl md:mx-2 md:mt-2 md:rounded-t-xl">
        {children}
      </div>
    </div>
  );
}
