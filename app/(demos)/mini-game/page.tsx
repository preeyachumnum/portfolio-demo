import Link from 'next/link';
import { ArrowRight, Target } from 'lucide-react';

const MINI_GAMES = [
  {
    href: '/mini-game/mini-2d-pool',
    title: 'Mini 2D Pool',
    type: 'Arcade Sports',
    description: 'เกมพูล 2D เล่นได้ทั้งโหมดคนเดียว, เล่น 2 คน และแข่งกับ bot',
    tags: ['Solo', 'Pass & Play', 'Bot Match'],
  },
  {
    href: '/mini-game/slot-ramayana',
    title: 'รามเกียรติ์สล็อต',
    type: 'Arcade Sports',
    description: 'เกมพูล 2D เล่นได้ทั้งโหมดคนเดียว, เล่น 2 คน และแข่งกับ bot',
    tags: ['Solo', 'Pass & Play', 'Bot Match'],
  },
];

export default function MiniGamePage() {
  return (
    <div className="min-h-full bg-[#07131B] text-white">
      <div className="mx-auto max-w-5xl px-4 py-10 md:px-6 md:py-12">
        <div className="mb-8">
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300/80">Mini Games</p>
          <h1 className="text-3xl font-black tracking-tight text-white md:text-4xl">เลือกเกมที่ต้องการเล่น</h1>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {MINI_GAMES.map((game) => (
            <Link
              key={game.href}
              href={game.href}
              className="group block overflow-hidden rounded-3xl border border-white/10 bg-[#0B1B25] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-emerald-300/40 hover:shadow-[0_20px_50px_rgba(0,0,0,0.25)]"
            >
              <div className="mb-5 flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <Target className="h-6 w-6 text-emerald-300" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{game.type}</p>
                    <h2 className="mt-1 text-2xl font-black text-white">{game.title}</h2>
                  </div>
                </div>
              </div>

              <p className="text-sm leading-7 text-slate-300">{game.description}</p>

              <div className="mt-5 flex flex-wrap gap-2">
                {game.tags.map((tag) => (
                  <span key={tag} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-slate-200">
                    {tag}
                  </span>
                ))}
              </div>

              <div className="mt-6 flex items-center gap-2 text-sm font-semibold text-emerald-300 transition-transform group-hover:translate-x-1">
                เข้าเล่นเกม
                <ArrowRight className="h-4 w-4" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
