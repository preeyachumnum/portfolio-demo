"use client";

import Image from 'next/image';
import React, { useState, useEffect, useRef } from 'react';
import { Coins, RotateCw, Minus, Plus, Trophy, AlertCircle, Wallet, ArrowDownToLine, ArrowUpFromLine, X } from 'lucide-react';
import BackgroundImage from './images/bg.png';
import paliImage from './images/pali.png';
import sugrivaImage from './images/sugriva.png';
import hanumanImage from './images/hanuman.png';
import indrajitImage from './images/indrajit.png';
import ramaImage from './images/rama.png';
import lakImage from './images/lak.png';
import ravanaImage from './images/ravana.png';
import sitaImage from './images/sita.png';
import pipekImage from './images/pipek.png';

// --- TYPES & INTERFACES ---
export type SlotSymbol = 
  | 'พระราม' | 'พระลักษณ์' | 'หนุมาน' | 'ทศกัณฐ์' | 'สีดา' | 'พิเภก' | 'สุครีพ'
  | 'อินทรชิต' | 'พาลี';

export interface Payline {
  id: number;
  name: string;
  positions: [number, number][]; 
}

export interface WinResult {
  paylineId: number;
  symbol: SlotSymbol;
  amount: number;
}

// --- CONSTANTS ---
const SYMBOLS: SlotSymbol[] = ['พระราม', 'พระลักษณ์', 'หนุมาน', 'ทศกัณฐ์', 'สีดา', 'พิเภก', 'สุครีพ', 'อินทรชิต', 'พาลี'];

const PAYOUTS: Record<SlotSymbol, number> = {
  'พิเภก': 5,
  'สีดา': 10,
  'พระลักษณ์': 20,
  'สุครีพ' : 20,
  'หนุมาน': 30,
  'ทศกัณฐ์': 50,
  'พระราม': 100,
  'พาลี': 250,
  'อินทรชิต': 500,
};

const CHARACTER_IMAGES: Record<SlotSymbol, string> = {
  'พิเภก': pipekImage.src,
  'สุครีพ': sugrivaImage.src,
  'สีดา': sitaImage.src,
  'พระลักษณ์': lakImage.src,
  'หนุมาน': hanumanImage.src,
  'ทศกัณฐ์': ravanaImage.src,
  'พระราม': ramaImage.src,
  'พาลี': paliImage.src,
  'อินทรชิต': indrajitImage.src,
};

const PAYLINES: Payline[] = [
  { id: 1, name: 'แถวกลาง', positions: [[1, 0], [1, 1], [1, 2]] },
  { id: 2, name: 'แถวบน', positions: [[0, 0], [0, 1], [0, 2]] },
  { id: 3, name: 'แถวล่าง', positions: [[2, 0], [2, 1], [2, 2]] },
  { id: 4, name: 'ทแยงลง', positions: [[0, 0], [1, 1], [2, 2]] },
  { id: 5, name: 'ทแยงขึ้น', positions: [[2, 0], [1, 1], [0, 2]] },
];

const INITIAL_GRID: SlotSymbol[][] = [
  ['อินทรชิต', 'ทศกัณฐ์', 'พระราม'],
  ['หนุมาน', 'พาลี', 'สีดา'],
  ['พระลักษณ์', 'พิเภก', 'สุครีพ'],
];

// --- SOUND ENGINE (Web Audio API) ---
let audioCtx: AudioContext | null = null;
const getAudioContext = () => {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const WindowAudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (WindowAudioContext) {
      audioCtx = new WindowAudioContext();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
};

const playSound = (type: 'spin' | 'stop' | 'win' | 'click' | 'error' | 'coin') => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;

    switch (type) {
      case 'click':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, now);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
        break;
      case 'spin':
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(300 + Math.random() * 200, now); // สุ่มเสียงติ๊กๆ
        gain.gain.setValueAtTime(0.02, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        osc.start(now);
        osc.stop(now + 0.05);
        break;
      case 'stop':
        osc.type = 'square';
        osc.frequency.setValueAtTime(100, now);
        osc.frequency.exponentialRampToValueAtTime(40, now + 0.15);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
        osc.start(now);
        osc.stop(now + 0.15);
        break;
      case 'win':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.setValueAtTime(659.25, now + 0.1); // E5
        osc.frequency.setValueAtTime(783.99, now + 0.2); // G5
        osc.frequency.setValueAtTime(1046.50, now + 0.3); // C6
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.6);
        osc.start(now);
        osc.stop(now + 0.6);
        break;
      case 'coin':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1200, now);
        osc.frequency.exponentialRampToValueAtTime(1800, now + 0.1);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
        break;
      case 'error':
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.setValueAtTime(100, now + 0.2);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
        break;
    }
  } catch (e) {
    console.error("Audio error", e);
  }
};

export default function SlotGame() {
  const [balance, setBalance] = useState<number>(5000);
  const [bet, setBet] = useState<number>(50);
  const [grid, setGrid] = useState<SlotSymbol[][]>(INITIAL_GRID);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [spinPhase, setSpinPhase] = useState<number>(0); 
  const [lastWins, setLastWins] = useState<WinResult[]>([]);
  const [totalWin, setTotalWin] = useState<number>(0);

  const [isWalletOpen, setIsWalletOpen] = useState<boolean>(false);
  const [txAmount, setTxAmount] = useState<number>(500);

  const spinIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // --- HELPERS ---
  const getRandomSymbol = (): SlotSymbol => {
    const pool: SlotSymbol[] = [
      'พิเภก', 'พิเภก', 'พิเภก', 'พิเภก', 'พิเภก', 'พิเภก',
      'สีดา', 'สีดา', 'สีดา', 'สีดา', 'สีดา',
      'พระลักษณ์', 'พระลักษณ์', 'พระลักษณ์', 'พระลักษณ์',
      'สุครีพ', 'สุครีพ', 'สุครีพ', 'สุครีพ',
      'หนุมาน', 'หนุมาน', 'หนุมาน',
      'ทศกัณฐ์', 'ทศกัณฐ์',
      'พระราม',
      'พาลี',
    ];
    if (Math.random() < 0.02) return 'อินทรชิต';
    return pool[Math.floor(Math.random() * pool.length)];
  };

  const generateRandomGrid = (): SlotSymbol[][] => {
    return [
      [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()],
      [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()],
      [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()],
    ];
  };

  // --- BUTTON ACTIONS ---
  const changeBet = (amount: number) => {
    playSound('click');
    setBet(prev => Math.min(5000, Math.max(10, prev + amount)));
  };

  const handleDeposit = () => {
    if (txAmount <= 0) { playSound('error'); return alert("กรุณาใส่จำนวนเงินให้ถูกต้อง"); }
    playSound('coin');
    setBalance(prev => prev + txAmount);
    setTxAmount(100);
    setIsWalletOpen(false);
  };

  const handleWithdraw = () => {
    if (txAmount <= 0) { playSound('error'); return alert("กรุณาใส่จำนวนเงินให้ถูกต้อง"); }
    if (balance < txAmount) { playSound('error'); return alert("ยอดเงินไม่เพียงพอสำหรับการถอน!"); }
    playSound('coin');
    setBalance(prev => prev - txAmount);
    setTxAmount(100);
    setIsWalletOpen(false);
  };

  // --- GAME LOGIC ---
  const handleSpin = () => {
    if (isSpinning) return;
    if (balance < bet) {
      playSound('error');
      return;
    }

    playSound('click');
    setBalance(prev => prev - bet);
    setIsSpinning(true);
    setSpinPhase(1);
    setLastWins([]);
    setTotalWin(0);

    const finalGrid = generateRandomGrid();
    let ticks = 0;

    spinIntervalRef.current = setInterval(() => {
      ticks++;

      // เล่นเสียงหมุนทุกๆ 2 ticks เพื่อไม่ให้หนวกหูเกินไป
      if (ticks % 2 === 0 && ticks < 36) playSound('spin');

      setGrid(prevGrid => {
        const newGrid = generateRandomGrid();
        
        if (ticks > 12) { 
          if (spinPhase < 2) { setSpinPhase(2); playSound('stop'); }
          newGrid[0][0] = finalGrid[0][0]; newGrid[1][0] = finalGrid[1][0]; newGrid[2][0] = finalGrid[2][0];
        }
        if (ticks > 24) { 
          if (spinPhase < 3) { setSpinPhase(3); playSound('stop'); }
          newGrid[0][1] = finalGrid[0][1]; newGrid[1][1] = finalGrid[1][1]; newGrid[2][1] = finalGrid[2][1];
        }
        if (ticks > 36) { 
          if (spinIntervalRef.current) clearInterval(spinIntervalRef.current);
          playSound('stop');
          evaluateWin(finalGrid);
          setIsSpinning(false);
          setSpinPhase(0);
          return finalGrid; 
        }
        return newGrid;
      });

    }, 40); 
  };

  const evaluateWin = (finalGrid: SlotSymbol[][]) => {
    const wins: WinResult[] = [];
    let currentTotalWin = 0;

    PAYLINES.forEach(line => {
      const [p1, p2, p3] = line.positions;
      const s1 = finalGrid[p1[0]][p1[1]];
      const s2 = finalGrid[p2[0]][p2[1]];
      const s3 = finalGrid[p3[0]][p3[1]];

      if (s1 === s2 && s2 === s3) {
        const winAmount = bet * PAYOUTS[s1];
        wins.push({ paylineId: line.id, symbol: s1, amount: winAmount });
        currentTotalWin += winAmount;
      }
    });

    if (wins.length > 0) {
      setTimeout(() => playSound('win'), 200); // ดีเลย์เสียงชนะนิดนึงให้สมจริง
      setLastWins(wins);
      setTotalWin(currentTotalWin);
      setBalance(prev => prev + currentTotalWin);
    }
  };

  useEffect(() => {
    return () => {
      if (spinIntervalRef.current) clearInterval(spinIntervalRef.current);
    };
  }, []);

  const isWinningCell = (rowIdx: number, colIdx: number): boolean => {
    return lastWins.some(win => {
      const line = PAYLINES.find(p => p.id === win.paylineId);
      return line?.positions.some(pos => pos[0] === rowIdx && pos[1] === colIdx);
    });
  };

  return (
    // เปลี่ยนจาก min-h-screen เป็น min-h-[100dvh] เพื่อแก้ปัญหาแถบ URL มือถือบัง
    <div className="min-h-[100dvh] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-900 via-[#1a0505] to-black flex flex-col items-center justify-center font-sans text-amber-100 p-2 sm:p-4 selection:bg-amber-500/30 overflow-hidden relative">
      
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <Image
          src={BackgroundImage}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center opacity-45 brightness-[0.38] saturate-[0.85] contrast-125"
        />
      </div>
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_top,_rgba(120,20,20,0.22),_transparent_35%),linear-gradient(180deg,rgba(0,0,0,0.82)_0%,rgba(10,2,2,0.62)_38%,rgba(0,0,0,0.9)_100%)]"></div>
      <div className="fixed inset-0 pointer-events-none bg-black/35"></div>

      {/* HEADER / TITLE */}
      <div className="text-center mb-3 sm:mb-6 z-10 relative pt-4 sm:pt-0">
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-b from-[#e5b857] via-[#bf8b2e] to-[#8c5e14] drop-shadow-[0_3px_3px_rgba(0,0,0,0.8)] filter" style={{fontFamily: 'serif'}}>
          รามเกียรติ์
        </h1>
        <div className="flex items-center justify-center gap-2 mt-1 sm:mt-2">
          <div className="h-[2px] w-6 sm:w-12 bg-gradient-to-r from-transparent via-amber-500 to-transparent"></div>
          <p className="text-amber-500/80 text-[10px] sm:text-sm tracking-[0.2em] sm:tracking-[0.3em] font-bold uppercase whitespace-nowrap">The Epic Slots</p>
          <div className="h-[2px] w-6 sm:w-12 bg-gradient-to-r from-transparent via-amber-500 to-transparent"></div>
        </div>
      </div>

      {/* HEADER / BALANCE & WALLET BTN (Responsive Layout) */}
      <div className="w-full max-w-md flex justify-between items-center mb-4 sm:mb-8 bg-black/60 p-3 sm:p-4 rounded-xl sm:rounded-2xl border-y-2 border-x border-amber-600/30 shadow-[0_0_25px_rgba(180,100,0,0.3)] backdrop-blur-md z-10 relative">
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="bg-gradient-to-br from-[#e5b857] to-[#8c5e14] p-1.5 sm:p-2.5 rounded-full shadow-inner border-2 border-[#fceba7] shrink-0">
            <Coins className="w-5 h-5 sm:w-7 sm:h-7 text-[#2c0b0b] drop-shadow-sm" />
          </div>
          <div className="min-w-0">
            <p className="text-[9px] sm:text-[10px] text-amber-400/80 font-bold uppercase tracking-wider mb-0.5 truncate">พระคลังมหาสมบัติ</p>
            <p className="text-lg sm:text-2xl font-black font-mono text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-[#e5b857] drop-shadow-sm truncate">
              {balance.toLocaleString()} <span className="text-xs sm:text-sm text-amber-500">฿</span>
            </p>
          </div>
        </div>
        <button 
          onClick={() => { playSound('click'); setIsWalletOpen(true); }}
          className="shrink-0 flex flex-col items-center justify-center gap-0.5 sm:gap-1 bg-gradient-to-b from-[#4a1c1c] to-[#2c0b0b] hover:from-[#5a2c2c] hover:to-[#3c1b1b] border border-[#e5b857]/50 px-3 sm:px-5 py-1.5 sm:py-2 rounded-lg sm:rounded-xl transition-all active:scale-95 text-[#e5b857] text-[10px] sm:text-xs font-bold shadow-lg group"
        >
          <Wallet className="w-4 h-4 sm:w-5 sm:h-5 group-hover:text-yellow-300 transition-colors" />
          <span>กระเป๋าเงิน</span>
        </button>
      </div>

      {/* WIN MESSAGE DISPLAY */}
      <div className="h-12 sm:h-16 mb-4 flex items-center justify-center w-full max-w-md z-10 relative">
        {totalWin > 0 && !isSpinning ? (
          <div className="bg-gradient-to-r from-[#8c5e14] via-[#e5b857] to-[#8c5e14] text-[#2c0b0b] px-6 sm:px-10 py-2 sm:py-3 rounded-full font-black text-lg sm:text-2xl shadow-[0_0_40px_rgba(229,184,87,0.7)] animate-bounce flex items-center gap-2 sm:gap-3 border-2 border-[#fceba7] relative overflow-hidden whitespace-nowrap">
            <div className="absolute inset-0 bg-white/20 animate-pulse mix-blend-overlay"></div>
            <Trophy className="w-5 h-5 sm:w-7 sm:h-7 fill-current drop-shadow-sm shrink-0" />
            <span className="drop-shadow-sm truncate">ชนะรางวัล: +{totalWin.toLocaleString()} ฿</span>
          </div>
        ) : (
           <p className="text-transparent bg-clip-text bg-gradient-to-r from-[#fceba7] via-[#e5b857] to-[#fceba7] font-bold text-sm sm:text-lg tracking-[0.15em] sm:tracking-[0.2em] animate-pulse drop-shadow-[0_2px_5px_rgba(229,184,87,0.5)]" style={{fontFamily: 'serif'}}>หมุนวงล้อเสี่ยงทาย ท้าทายโชคชะตา...</p>
        )}
      </div>

      {/* SLOT MACHINE FRAME */}
      <div className="relative z-10 p-1 sm:p-1.5 rounded-t-[1.5rem] sm:rounded-t-[2rem] rounded-b-xl sm:rounded-b-2xl bg-gradient-to-b from-[#e5b857] via-[#8c5e14] to-[#4a1c1c] shadow-[0_15px_40px_rgba(0,0,0,0.9)] w-full max-w-[95%] sm:max-w-md">
        <div className="bg-gradient-to-b from-[#2c0b0b] to-black p-2 sm:p-4 rounded-t-[1.3rem] sm:rounded-t-[1.8rem] rounded-b-lg sm:rounded-b-xl border border-[#e5b857]/40 shadow-[inset_0_0_30px_rgba(0,0,0,1)] overflow-hidden relative">
          
          <div className="absolute top-0 left-0 w-10 sm:w-16 h-10 sm:h-16 border-t-2 sm:border-t-4 border-l-2 sm:border-l-4 border-[#e5b857] rounded-tl-xl sm:rounded-tl-2xl opacity-80"></div>
          <div className="absolute top-0 right-0 w-10 sm:w-16 h-10 sm:h-16 border-t-2 sm:border-t-4 border-r-2 sm:border-r-4 border-[#e5b857] rounded-tr-xl sm:rounded-tr-2xl opacity-80"></div>

          {/* GRID CONTAINER (Responsive width/height using vw) */}
          <div className="grid grid-cols-3 gap-1 sm:gap-3 bg-[#1a0505]/80 p-1.5 sm:p-3 rounded-lg border border-[#e5b857]/20 relative z-10 mx-auto w-fit">
            {grid.map((row, rowIdx) => (
              <React.Fragment key={`row-${rowIdx}`}>
                {row.map((symbol, colIdx) => {
                  const isWinning = isWinningCell(rowIdx, colIdx) && !isSpinning;
                  const imagePath = CHARACTER_IMAGES[symbol];
                  
                  // ใช้ขนาดแบบยืดหยุ่น (vw) สำหรับมือถือ และขนาดตายตัวบนจอใหญ่
                  let cellClasses = "relative flex items-center justify-center w-[25vw] h-[25vw] max-w-[5.5rem] max-h-[5.5rem] sm:w-24 sm:h-24 md:w-28 md:h-28 bg-gradient-to-b from-[#2c0b0b] to-black rounded-lg border border-[#4a1c1c] shadow-[inset_0_5px_15px_rgba(0,0,0,0.8)] transition-all overflow-hidden p-1 ";
                  
                  if (isWinning) {
                    cellClasses += "border-2 border-[#fceba7] bg-gradient-to-br from-[#8c5e14]/60 to-[#e5b857]/30 shadow-[0_0_20px_rgba(229,184,87,0.7)] scale-105 z-20 ";
                  }

                  const isColSpinning = isSpinning && 
                                        (spinPhase === 1 || 
                                        (spinPhase === 2 && colIdx > 0) || 
                                        (spinPhase === 3 && colIdx > 1));

                  return (
                    <div key={`cell-${rowIdx}-${colIdx}`} className={cellClasses}>
                      {isWinning && <div className="absolute inset-0 bg-[#e5b857]/20 animate-pulse mix-blend-plus-lighter"></div>}
                      <img 
                        src={imagePath} 
                        alt={symbol}
                        className={`w-full h-full object-contain drop-shadow-[0_5px_5px_rgba(0,0,0,0.5)] transform transition-transform duration-100 ${isColSpinning ? 'scale-y-110 opacity-70 blur-[2px]' : 'scale-100 opacity-100'}`}
                      />
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* CONTROLS (Responsive stacking) */}
      <div className="w-full max-w-md bg-black/70 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border-y border-[#e5b857]/30 shadow-2xl flex flex-row items-center gap-3 sm:gap-5 mt-4 sm:mt-8 z-10 backdrop-blur-lg relative">
        
        {/* Bet Selector */}
        <div className="flex-1 bg-[#2c0b0b]/60 p-1.5 sm:p-2 rounded-xl sm:rounded-2xl flex justify-between items-center border border-[#4a1c1c]/50 shadow-inner">
          <button 
            disabled={isSpinning || bet <= 10}
            onClick={() => changeBet(-10)}
            className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-gradient-to-b from-[#4a1c1c] to-[#2c0b0b] hover:from-[#5a2c2c] hover:to-[#3c1b1b] rounded-lg sm:rounded-xl disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition-all text-[#e5b857] border border-[#e5b857]/30 shadow-md shrink-0"
          >
            <Minus className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
          
          <div className="text-center px-1 sm:px-4 min-w-0">
            <p className="text-[8px] sm:text-[10px] text-amber-500/70 font-bold uppercase tracking-wider mb-0.5 sm:mb-1 whitespace-nowrap">เดิมพัน (Bet)</p>
            <p className="text-lg sm:text-2xl font-black font-mono text-transparent bg-clip-text bg-gradient-to-r from-[#fceba7] to-[#e5b857] drop-shadow-sm truncate">{bet}</p>
          </div>

          <button 
            disabled={isSpinning || bet >= balance || bet >= 5000}
            onClick={() => changeBet(10)}
            className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-gradient-to-b from-[#4a1c1c] to-[#2c0b0b] hover:from-[#5a2c2c] hover:to-[#3c1b1b] rounded-lg sm:rounded-xl disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition-all text-[#e5b857] border border-[#e5b857]/30 shadow-md shrink-0"
          >
            <Plus className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* Spin Button */}
        <button 
          onClick={handleSpin}
          disabled={isSpinning || balance < bet}
          className={`
            w-24 h-16 sm:w-36 sm:h-20 rounded-xl sm:rounded-2xl font-black text-lg sm:text-2xl uppercase tracking-widest sm:tracking-[0.2em] transition-all duration-150 flex flex-col items-center justify-center gap-0.5 sm:gap-1 shadow-[0_10px_25px_rgba(0,0,0,0.5)] relative overflow-hidden shrink-0
            ${isSpinning || balance < bet 
              ? 'bg-[#2c0b0b] text-[#8c5e14]/50 border-2 border-[#4a1c1c] cursor-not-allowed grayscale' 
              : 'bg-gradient-to-b from-[#fceba7] via-[#e5b857] to-[#bf8b2e] hover:from-white hover:via-[#fceba7] hover:to-[#e5b857] text-[#2c0b0b] border-b-4 border-[#8c5e14] active:translate-y-1 active:border-b-0 shadow-[#e5b857]/40 cursor-pointer group'}
          `}
          style={{textShadow: '0 1px 1px rgba(255,255,255,0.5)'}}
        >
          {!isSpinning && balance >= bet && <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-[120%] group-hover:animate-[shimmer_1s_infinite]"></div>}
          <RotateCw className={`w-5 h-5 sm:w-7 sm:h-7 ${isSpinning ? 'animate-spin opacity-80' : 'drop-shadow-sm'}`} />
          SPIN
        </button>
      </div>

      {/* ERROR MESSAGE */}
      {balance < bet && !isSpinning && (
        <div className="mt-3 sm:mt-4 flex items-center gap-2 text-red-300 bg-[#4a1c1c]/90 px-4 sm:px-6 py-2 sm:py-3 rounded-full border-2 border-red-900/50 z-10 shadow-lg backdrop-blur-sm animate-bounce w-full max-w-sm justify-center">
          <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
          <span className="font-bold tracking-wide text-xs sm:text-sm truncate">เงินไม่พอ! เติมเงินหรือลดเดิมพัน</span>
        </div>
      )}

      {/* PAYTABLE INFO (Fixed Wrap Issue) */}
      <div className="mt-6 sm:mt-8 w-full max-w-lg z-10 bg-black/80 p-3 sm:p-5 rounded-2xl sm:rounded-3xl border border-[#e5b857]/20 backdrop-blur-md shadow-xl relative pb-8 sm:pb-5">
        
        {/* แก้ปัญหา Header ตกบรรทัดด้วยการควบคุม Layout และใส่ whitespace-nowrap */}
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#2c0b0b] px-3 sm:px-5 py-1 rounded-full border border-[#e5b857]/50 shadow-md flex justify-center items-center max-w-[90%] w-max">
          <p className="font-bold text-[#e5b857] text-[10px] sm:text-sm uppercase tracking-wider whitespace-nowrap">ตารางการจ่ายรางวัล (เรียง 3 ภาพ)</p>
        </div>
        
        {/* Responsive Grid สำหรับมือถือให้เป็น 4 คอลัมน์เล็กๆ */}
        <div className="grid grid-cols-4 sm:grid-cols-4 gap-1.5 sm:gap-3 mt-4 sm:mt-3">
          {Object.entries(PAYOUTS).sort(([,a], [,b]) => a - b).map(([symbol, multiplier]) => (
            <div key={symbol} className={`flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-1 sm:gap-2 p-1.5 sm:p-2 rounded-lg sm:rounded-xl border ${['พาลี', 'อินทรชิต'].includes(symbol) ? 'bg-gradient-to-br from-[#4a1c1c] to-[#2c0b0b] border-[#e5b857]/60 shadow-[#e5b857]/20' : 'bg-[#2c0b0b]/60 border-[#4a1c1c]/40'}`}>
              <img src={CHARACTER_IMAGES[symbol as SlotSymbol]} alt={symbol} className="w-6 h-6 sm:w-8 sm:h-8 object-contain drop-shadow-sm" />
              <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
                <span className={`text-[8px] sm:text-xs font-bold leading-tight ${['พาลี', 'อินทรชิต'].includes(symbol) ? 'text-[#fceba7]' : 'text-amber-300/80'} whitespace-nowrap`}>{symbol}</span>
                <span className={`text-xs sm:text-lg font-black leading-none ${['พาลี', 'อินทรชิต'].includes(symbol) ? 'text-[#fceba7]' : 'text-white'}`}>x{multiplier}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* WALLET MODAL */}
      {isWalletOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-200">
           <div className="bg-gradient-to-b from-[#2c0b0b] via-[#1a0505] to-black w-full max-w-sm rounded-[2rem] border-2 border-[#e5b857]/60 shadow-[0_0_50px_rgba(229,184,87,0.3)] overflow-hidden relative">
              <div className="bg-gradient-to-r from-[#4a1c1c] to-[#2c0b0b] p-4 sm:p-5 flex justify-between items-center border-b border-[#e5b857]/30">
                 <h2 className="text-xl sm:text-2xl font-bold text-[#e5b857] flex items-center gap-2 sm:gap-3" style={{fontFamily: 'serif'}}>
                   <Wallet className="w-5 h-5 sm:w-6 sm:h-6 drop-shadow-sm"/> พระคลัง
                 </h2>
                 <button onClick={() => { playSound('click'); setIsWalletOpen(false); }} className="text-[#e5b857]/60 hover:text-[#fceba7] p-1.5 sm:p-2 bg-[#1a0505] hover:bg-[#4a1c1c] rounded-full transition-all active:scale-90 border border-[#e5b857]/20">
                   <X className="w-4 h-4 sm:w-5 sm:h-5"/>
                 </button>
              </div>
              
              <div className="p-5 sm:p-6 relative">
                 <div className="text-center mb-6 sm:mb-8 relative">
                    <div className="absolute inset-0 bg-[#e5b857]/5 blur-xl rounded-full"></div>
                    <p className="text-[#e5b857]/70 text-xs sm:text-sm mb-1 sm:mb-2 font-bold tracking-wider uppercase relative z-10">เงินในถุงทองปัจจุบัน</p>
                    <p className="text-3xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#fceba7] via-[#e5b857] to-[#bf8b2e] font-mono relative z-10 drop-shadow-sm truncate">{balance.toLocaleString()} ฿</p>
                 </div>

                 <div className="mb-6 sm:mb-8">
                    <label className="block text-[#e5b857]/80 text-xs sm:text-sm mb-2 sm:mb-3 font-bold tracking-wide">ระบุจำนวนเงิน (บาท)</label>
                    <div className="relative group">
                       <input 
                         type="number" 
                         value={txAmount}
                         onChange={(e) => setTxAmount(Number(e.target.value))}
                         className="w-full bg-[#0a0a0a] border-2 border-[#4a1c1c] rounded-xl sm:rounded-2xl py-3 sm:py-4 px-4 text-[#fceba7] text-xl sm:text-2xl font-bold focus:outline-none focus:border-[#e5b857] focus:ring-1 focus:ring-[#e5b857] transition-all text-center shadow-inner group-hover:border-[#e5b857]/50"
                       />
                       <span className="absolute right-4 sm:right-5 top-1/2 -translate-y-1/2 text-[#e5b857]/50 font-bold text-sm sm:text-lg">THB</span>
                    </div>
                    
                    <div className="flex gap-2 mt-3 sm:mt-4">
                       {[100, 500, 1000, 5000].map(amt => (
                         <button key={amt} onClick={() => { playSound('click'); setTxAmount(amt); }} className="flex-1 py-1.5 sm:py-2 bg-[#2c0b0b] hover:bg-[#4a1c1c] rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-bold text-[#e5b857] border border-[#e5b857]/30 transition-all active:scale-95 shadow-md">
                           +{amt.toLocaleString()}
                         </button>
                       ))}
                    </div>
                 </div>

                 <div className="flex gap-3 sm:gap-4">
                    <button onClick={handleDeposit} className="flex-1 py-3 sm:py-4 bg-gradient-to-b from-emerald-600 to-emerald-800 hover:from-emerald-500 hover:to-emerald-700 text-white rounded-xl sm:rounded-2xl font-bold flex items-center justify-center gap-1 sm:gap-2 transition-all active:scale-95 shadow-lg shadow-emerald-900/50 border-b-4 border-emerald-900 active:border-b-0 active:translate-y-1 text-sm sm:text-lg whitespace-nowrap">
                       <ArrowDownToLine className="w-4 h-4 sm:w-6 sm:h-6" /> เติมเงิน
                    </button>
                    <button onClick={handleWithdraw} className="flex-1 py-3 sm:py-4 bg-gradient-to-b from-red-700 to-red-900 hover:from-red-600 hover:to-red-800 text-white rounded-xl sm:rounded-2xl font-bold flex items-center justify-center gap-1 sm:gap-2 transition-all active:scale-95 shadow-lg shadow-red-950/50 border-b-4 border-red-950 active:border-b-0 active:translate-y-1 text-sm sm:text-lg whitespace-nowrap">
                       <ArrowUpFromLine className="w-4 h-4 sm:w-6 sm:h-6" /> เบิกเงิน
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}

    </div>
  );
}
