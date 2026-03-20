"use client";

import { useEffect, useState } from 'react';
import {
  ShoppingCart,
  User,
  CheckCircle,
  Clock,
  LogOut,
  Trash2,
  ShieldCheck,
  Eye,
  Menu,
  X,
  ArrowLeft,
  Search,
  ExternalLink,
  Zap,
  Play,
} from 'lucide-react';

// --- CONFIG & STORAGE KEYS ---
const APP_ID = "eduflow_ultimate_v17";
const STORAGE_KEYS = {
  COURSES: `${APP_ID}_courses`,
  USERS: `${APP_ID}_users`,
  ORDERS: `${APP_ID}_orders`,
  PROGRESS: `${APP_ID}_progress`,
  CURRENT_USER: `${APP_ID}_current_user`
};

type AppView = 'home' | 'login' | 'detail' | 'learning' | 'admin' | 'profile' | 'cart';

interface Lesson {
  id: number;
  title: string;
  videoUrl: string;
}

interface Course {
  id: number;
  title: string;
  description: string;
  price: number;
  rating: number;
  category: string;
  image: string;
  lessons: Lesson[];
}

type UserRole = 'user' | 'admin';

interface AppUser {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  ownedCourses: number[];
  status: string;
}

type OrderStatus = 'pending' | 'approved';

interface Order {
  id: string;
  userId: string;
  userName: string;
  items: Course[];
  total: number;
  status: OrderStatus;
  date: string;
  slip: string;
}

type UserProgress = Record<string, number[]>;

interface LearningState {
  course: Course | null;
  activeLesson: Lesson | null;
}

// Simplified YouTube Embed - Most stable for Sandboxed Iframes
const getYouTubeEmbedUrl = (url: string) => {
  if (!url) return '';
  let videoId = '';
  if (url.includes('embed/')) {
    videoId = url.split('embed/')[1].split('?')[0];
  } else {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    videoId = (match && match[2].length === 11) ? match[2] : '';
  }
  return videoId ? `https://www.youtube-nocookie.com/embed/${videoId}?rel=0` : url;
};

// --- INITIAL DATA ---
const INITIAL_COURSES: Course[] = [
  {
    id: 1,
    title: "รามเกียรติ์ ตอน ศึกทรพี (The Battle of Monkey King)",
    description: "ศึกสายเลือดระหว่างพ่อและลูกที่กลายเป็นตำนานเล่าขาน เรียนรู้วรรณคดีไทยผ่านวิดีโอคุณภาพสูง",
    price: 990,
    rating: 4.9,
    category: "Literature",
    image: "https://img.youtube.com/vi/eyoIidiahyo/maxresdefault.jpg",
    lessons: [
      { id: 101, title: "01. ปฐมบท: กำเนิดทรพี", videoUrl: "https://youtu.be/eyoIidiahyo" },
      { id: 102, title: "02. ศึกสายเลือด: ทรพีปะทะทรภา", videoUrl: "https://youtu.be/eyoIidiahyo" },
      { id: 103, title: "03. พาลีผู้ไร้คู่ต่อกร", videoUrl: "https://youtu.be/eyoIidiahyo" }
    ]
  },
  {
    id: 3,
    title: "รามเกียรติ์ ตอน ศึกรามสูร (The Battle of Thunder)",
    description: "ตำนานรามสูรขว้างขวาน และจุดกำเนิดของปรากฏการณ์ธรรมชาติในวรรณคดีไทย",
    price: 850,
    rating: 4.8,
    category: "Literature",
    image: "https://img.youtube.com/vi/-iwoWmormk8/maxresdefault.jpg",
    lessons: [
      { id: 301, title: "01. รามสูรและขวานเพชร", videoUrl: "https://youtu.be/-iwoWmormk8" },
      { id: 302, title: "02. การต่อสู้กับพระราม", videoUrl: "https://youtu.be/-iwoWmormk8" }
    ]
  },
  {
    id: 2,
    title: "Full-stack Web Development with React 18",
    description: "สร้างเว็บไซต์ระดับมืออาชีพด้วย React, Tailwind CSS และการจัดการ State ที่เข้มข้น",
    price: 4500,
    rating: 5.0,
    category: "Technology",
    image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800",
    lessons: [
      { id: 201, title: "01. Introduction to React", videoUrl: "https://player.vimeo.com/video/76979871" },
      { id: 202, title: "02. State Management Deep Dive", videoUrl: "https://player.vimeo.com/video/76979871" }
    ]
  }
];

const INITIAL_USERS: AppUser[] = [
  { id: 'u1', name: 'Demo Student', email: 'student@test.com', password: '123', role: 'user', ownedCourses: [], status: 'active' },
  { id: 'a1', name: 'Master Admin', email: 'admin@test.com', password: '123', role: 'admin', ownedCourses: [1, 2, 3], status: 'active' }
];

export default function App() {
  const [view, setView] = useState<AppView>('home'); 
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [users, setUsers] = useState<AppUser[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [cart, setCart] = useState<Course[]>([]);
  const [userProgress, setUserProgress] = useState<UserProgress>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [learningState, setLearningState] = useState<LearningState>({ course: null, activeLesson: null });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // --- INITIALIZATION ---
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const load = <T,>(key: string, def: T): T => {
      const saved = typeof window !== 'undefined' ? localStorage.getItem(key) : null;
      try { return saved ? JSON.parse(saved) as T : def; } catch { return def; }
    };
    setCourses(load(STORAGE_KEYS.COURSES, INITIAL_COURSES));
    setUsers(load(STORAGE_KEYS.USERS, INITIAL_USERS));
    setOrders(load(STORAGE_KEYS.ORDERS, []));
    setUserProgress(load(STORAGE_KEYS.PROGRESS, {}));
    const savedUser = load(STORAGE_KEYS.CURRENT_USER, null);
    if (savedUser) setCurrentUser(savedUser);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  // --- SYNC TO LOCAL STORAGE ---
  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(courses));
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(userProgress));
    if (currentUser) localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(currentUser));
    else localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  }, [courses, users, orders, userProgress, currentUser]);

  // --- CORE ACTIONS ---
  const handleLogin = (email: string) => {
    const user = users.find(u => u.email === email);
    if (!user) return alert('Login failed: User not found');
    setCurrentUser(user);
    setView('home');
    setIsMobileMenuOpen(false);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setView('home');
    setIsMobileMenuOpen(false);
  };

  const startLearning = (course: Course) => {
    if (!course?.lessons?.length) return;
    setLearningState({ course, activeLesson: course.lessons[0] });
    setView('learning');
    window.scrollTo(0, 0);
  };

  const addToCart = (course: Course) => {
    if (!currentUser) return setView('login');
    if (currentUser.role === 'admin' || currentUser.ownedCourses?.includes(course.id)) {
      return startLearning(course);
    }
    if (!cart.find(c => c.id === course.id)) setCart([...cart, course]);
    setView('cart');
  };

  const processOrder = () => {
    if (cart.length === 0 || !currentUser) return;
    const newOrder: Order = {
      id: `ORD-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      items: [...cart],
      total: cart.reduce((s, i) => s + i.price, 0),
      status: 'pending',
      date: new Date().toLocaleDateString('th-TH'),
      slip: 'https://images.unsplash.com/photo-1620714223084-8fcacc6dfd8d?w=400'
    };
    setOrders([newOrder, ...orders]);
    setCart([]);
    setView('profile');
    alert('ส่งหลักฐานเรียบร้อย กรุณารอแอดมินอนุมัติครับ');
  };

  const approveOrder = (orderId: string) => {
    const updatedOrders: Order[] = orders.map(o => {
      if (o.id === orderId) {
        setUsers(prevUsers => prevUsers.map(u => {
          if (u.id === o.userId) {
            const newOwned = [...new Set([...(u.ownedCourses || []), ...o.items.map(i => i.id)])];
            const updatedUser = { ...u, ownedCourses: newOwned };
            if (currentUser?.id === u.id) setCurrentUser(updatedUser);
            return updatedUser;
          }
          return u;
        }));
        return { ...o, status: 'approved' as const };
      }
      return o;
    });
    setOrders(updatedOrders);
  };

  const toggleLessonStatus = (courseId: number, lessonId: number) => {
    if (!currentUser) return;
    const key = `${currentUser.id}_${courseId}`;
    const completed = userProgress[key] || [];
    const newList = completed.includes(lessonId) ? completed.filter(id => id !== lessonId) : [...completed, lessonId];
    setUserProgress({ ...userProgress, [key]: newList });
  };

  // --- SUB-COMPONENTS AS FUNCTIONS FOR SCOPE ---

  const renderNav = () => (
    <nav className="bg-[#0f172a] text-white border-b border-white/10 sticky top-0 z-[100] h-20 shadow-2xl backdrop-blur-xl bg-opacity-95">
      <div className="max-w-7xl mx-auto px-4 h-full flex justify-between items-center">
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setView('home')}>
          <div className="bg-blue-600 p-2 rounded-xl group-hover:rotate-12 transition duration-300 shadow-lg shadow-blue-500/20">
            <Zap className="fill-white w-6 h-6" />
          </div>
          <span className="text-2xl font-black italic tracking-tighter uppercase">EduFlow</span>
        </div>

        <div className="hidden md:flex items-center gap-8">
          <button onClick={() => setView('home')} className={`text-sm font-bold transition ${view === 'home' ? 'text-blue-400' : 'text-gray-400 hover:text-white'}`}>Library</button>
          {currentUser?.role === 'admin' ? (
            <button onClick={() => setView('admin')} className="flex items-center gap-2 bg-blue-600/10 border border-blue-500/20 px-4 py-2 rounded-full text-xs font-black text-blue-400 uppercase tracking-widest hover:bg-blue-600/20 transition"><ShieldCheck size={16} /> Admin Console</button>
          ) : currentUser && (
            <button onClick={() => setView('profile')} className="text-gray-400 hover:text-white font-bold text-sm transition">My Courses</button>
          )}
          {currentUser && currentUser.role !== 'admin' && (
            <button onClick={() => setView('cart')} className="p-2 text-gray-400 hover:text-white relative transition">
              <ShoppingCart size={24} />
              {cart.length > 0 && <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-black animate-pulse">{cart.length}</span>}
            </button>
          )}
          <div className="h-6 w-px bg-white/10" />
          {currentUser ? (
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-black leading-none text-white">{currentUser.name}</p>
                <p className="text-[10px] text-blue-500 uppercase font-black mt-1">{currentUser.role}</p>
              </div>
              <button onClick={handleLogout} className="p-2 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition"><LogOut size={18} /></button>
            </div>
          ) : (
            <button onClick={() => setView('login')} className="bg-blue-600 text-white px-8 py-3 rounded-full font-black text-sm hover:bg-blue-500 transition shadow-xl shadow-blue-500/20 active:scale-95">Sign In</button>
          )}
        </div>

        <button className="md:hidden p-2 text-gray-400" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>
      
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-20 bg-[#0f172a] z-[90] p-8 space-y-8 animate-in slide-in-from-top duration-300">
          <button onClick={() => { setView('home'); setIsMobileMenuOpen(false); }} className="block w-full text-left font-black text-4xl py-2">Browsing</button>
          {currentUser && <button onClick={() => { setView('profile'); setIsMobileMenuOpen(false); }} className="block w-full text-left font-black text-4xl py-2">My Courses</button>}
          {currentUser?.role === 'admin' && <button onClick={() => { setView('admin'); setIsMobileMenuOpen(false); }} className="block w-full text-left font-black text-4xl text-blue-500 py-2">Admin Panel</button>}
          <button onClick={handleLogout} className="text-red-500 font-black text-2xl block w-full text-left py-8 border-t border-white/10">Sign Out</button>
        </div>
      )}
    </nav>
  );

  const renderHome = () => (
    <div className="bg-[#0f172a] min-h-screen text-white animate-in fade-in duration-500">
      <section className="max-w-7xl mx-auto px-4 py-20 relative overflow-hidden">
        <div className="relative z-10 max-w-4xl">
          <h1 className="text-6xl md:text-8xl font-black leading-[0.95] mb-10 tracking-tighter">
            Elevate Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400 italic">Potential.</span>
          </h1>
          <p className="text-gray-400 text-lg md:text-2xl leading-relaxed mb-12 font-medium opacity-70">
            ระบบเรียนออนไลน์ที่ใช้งานง่าย แอดมินตรวจสอบสลิปและปลดล็อกได้ทันที ลองซื้อคอร์สแล้วสลับไปหน้าแอดมินเพื่ออนุมัติได้เลยครับ
          </p>
          <div className="flex bg-white/5 border border-white/10 backdrop-blur-3xl rounded-[32px] p-2 max-w-xl shadow-2xl">
            <Search className="text-gray-500 m-4" />
            <input className="bg-transparent border-none focus:ring-0 flex-1 text-white placeholder-gray-600 font-bold" placeholder="Search for courses..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
        </div>
        <div className="absolute right-[-10%] top-[20%] opacity-20 blur-[120px] bg-blue-600 w-[600px] h-[600px] rounded-full animate-pulse"></div>
      </section>

      <section className="max-w-7xl mx-auto px-4 pb-40">
        <h2 className="text-4xl font-black mb-16 tracking-tighter uppercase italic">Premium Courses</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {courses.filter(c => c.title.toLowerCase().includes(searchTerm.toLowerCase())).map(course => {
            const isAdmin = currentUser?.role === 'admin';
            const isOwned = currentUser?.ownedCourses?.includes(course.id);
            return (
              <div key={course.id} className="group bg-[#1e293b] rounded-[48px] overflow-hidden border border-white/5 hover:border-blue-500/30 transition-all duration-700 flex flex-col hover:-translate-y-4 shadow-2xl">
                <div className="h-64 overflow-hidden relative">
                  <img src={course.image} alt={course.title} className="w-full h-full object-cover transition duration-1000 group-hover:scale-110 opacity-80" />
                  <div className="absolute top-6 left-6 bg-black/60 backdrop-blur-md px-5 py-2 rounded-2xl text-[10px] font-black text-white tracking-widest uppercase border border-white/10">{course.category}</div>
                </div>
                <div className="p-10 flex-1 flex flex-col">
                  <h3 className="text-2xl font-black mb-4 leading-tight group-hover:text-blue-400 transition">{course.title}</h3>
                  <div className="mt-auto flex items-center justify-between pt-10 border-t border-white/5">
                    <div className="text-3xl font-black text-white">฿{course.price.toLocaleString()}</div>
                    {isAdmin || isOwned ? (
                      <button onClick={() => startLearning(course)} className="bg-green-500 text-black px-10 py-4 rounded-[20px] font-black hover:bg-green-400 transition transform active:scale-95 shadow-xl">Start</button>
                    ) : (
                      <button onClick={() => { setSelectedCourse(course); setView('detail'); }} className="bg-white text-black px-10 py-4 rounded-[20px] font-black hover:bg-blue-500 hover:text-white transition transform active:scale-95 shadow-xl">Details</button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );

  const renderCourseDetail = () => {
    if (!selectedCourse) return <div className="p-40 text-center text-white bg-[#0f172a] min-h-screen">Loading course content...</div>;
    return (
      <div className="bg-[#0f172a] min-h-screen text-white pb-40 animate-in fade-in duration-500">
        <div className="max-w-7xl mx-auto px-4 py-20">
          <button onClick={() => setView('home')} className="flex items-center gap-3 text-gray-500 hover:text-white mb-20 font-black uppercase tracking-widest transition group">
            <ArrowLeft size={24} className="group-hover:-translate-x-2 transition" /> Marketplace
          </button>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-24">
            <div className="lg:col-span-2">
              <h1 className="text-5xl md:text-8xl font-black leading-[0.9] tracking-tighter mb-12 italic">{selectedCourse.title}</h1>
              <div className="aspect-video bg-[#1e293b] rounded-[64px] overflow-hidden shadow-2xl relative group cursor-pointer mb-20 border border-white/5" onClick={() => addToCart(selectedCourse)}>
                <img src={selectedCourse.image} alt={selectedCourse.title} className="w-full h-full object-cover opacity-50 group-hover:scale-105 transition duration-1000" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-blue-600 p-12 rounded-full shadow-2xl group-hover:scale-110 transition duration-500 animate-pulse">
                    <Play size={64} className="text-white fill-white/20" />
                  </div>
                </div>
              </div>
              <h2 className="text-4xl font-black mb-12 tracking-tighter border-l-8 border-blue-600 pl-10 uppercase italic">Syllabus</h2>
              <div className="space-y-4">
                {selectedCourse.lessons?.map((lesson, idx) => (
                  <div key={lesson.id} className="bg-[#1e293b] p-10 rounded-[40px] flex items-center gap-10 hover:bg-blue-600 transition duration-500 group border border-white/5">
                    <span className="text-5xl font-black text-gray-800 group-hover:text-blue-100 transition">{String(idx+1).padStart(2, '0')}</span>
                    <div className="flex-1 font-black text-2xl leading-tight">{lesson.title}</div>
                    <Play size={24} className="text-gray-700 group-hover:text-white transition" />
                  </div>
                ))}
              </div>
            </div>
            <div className="lg:col-span-1">
               <div className="bg-white text-black p-16 rounded-[64px] shadow-2xl sticky top-32">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] mb-8">One-time payment</p>
                  <div className="flex items-baseline gap-4 mb-16"><span className="text-7xl font-black tracking-tighter">฿{selectedCourse.price.toLocaleString()}</span></div>
                  <button onClick={() => addToCart(selectedCourse)} className="w-full bg-[#0f172a] text-white py-8 rounded-[32px] font-black text-2xl hover:bg-blue-600 transition shadow-2xl active:scale-95 uppercase tracking-tighter italic">Get Started</button>
                  <div className="mt-16 space-y-8">
                     <div className="flex items-center gap-6 text-sm font-black italic"><div className="bg-green-500/10 p-3 rounded-2xl text-green-600 shadow-sm"><CheckCircle size={24} /></div> Full Lifetime Access</div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderLearningPortal = () => {
    const { course, activeLesson } = learningState;
    if (!course || !activeLesson || !currentUser) return <div className="bg-[#0f172a] h-screen flex items-center justify-center font-black text-white">Connecting to server...</div>;

    const key = `${currentUser.id}_${course.id}`;
    const completed = userProgress[key] || [];
    const embedUrl = getYouTubeEmbedUrl(activeLesson.videoUrl);

    return (
      <div className="bg-[#0f172a] min-h-screen text-white flex flex-col lg:flex-row overflow-hidden animate-in fade-in duration-700">
        <div className="w-full lg:w-[450px] bg-[#1e293b] border-r border-white/5 flex flex-col h-1/2 lg:h-screen z-50 overflow-y-auto scrollbar-hide">
          <div className="p-12 border-b border-white/5 bg-[#0f172a]/50 backdrop-blur-2xl">
            <button onClick={() => setView('home')} className="flex items-center gap-3 text-gray-500 hover:text-white mb-10 text-[10px] font-black uppercase tracking-widest transition group">
              <ArrowLeft size={16} className="group-hover:-translate-x-2 transition" /> Marketplace
            </button>
            <h2 className="text-3xl font-black leading-tight mb-8 line-clamp-2">{course.title}</h2>
            <div className="h-2.5 bg-white/5 rounded-full overflow-hidden shadow-inner p-[1px]">
              <div className="h-full bg-blue-500 transition-all duration-1000 shadow-lg shadow-blue-500/50 rounded-full" style={{ width: `${(completed.length / course.lessons.length) * 100}%` }} />
            </div>
          </div>
          <div className="p-8 space-y-4">
            {course.lessons?.map((lesson, idx) => (
              <button key={lesson.id} onClick={() => setLearningState({...learningState, activeLesson: lesson})} className={`w-full flex items-center gap-6 p-8 text-left rounded-[40px] transition duration-500 ${activeLesson.id === lesson.id ? 'bg-blue-600 text-white shadow-xl' : 'bg-white/5 hover:bg-white/10'}`}>
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-black border-2 transition duration-500 ${completed.includes(lesson.id) ? 'bg-green-500 border-green-500 text-white' : (activeLesson.id === lesson.id ? 'bg-white text-blue-600' : 'border-white/10 text-gray-600')}`}>
                  {completed.includes(lesson.id) ? <CheckCircle size={20} /> : idx+1}
                </div>
                <div className="flex-1 font-black text-xl leading-tight">{lesson.title}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 flex flex-col h-screen overflow-y-auto scrollbar-hide bg-[#0f172a]">
          <div className="aspect-video bg-black relative shadow-2xl z-10 border-b border-white/5 group">
            <iframe key={activeLesson.id} src={embedUrl} className="w-full h-full" frameBorder="0" allowFullScreen />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-500">
               <button onClick={() => window.open(activeLesson.videoUrl, '_blank')} className="bg-red-600 hover:bg-red-700 text-white px-10 py-5 rounded-full font-black flex items-center gap-4 shadow-2xl pointer-events-auto backdrop-blur-2xl transform translate-y-20 group-hover:translate-y-0 transition-transform uppercase text-sm tracking-widest italic">
                 <ExternalLink size={24} /> Force YouTube Access (Admin Only)
               </button>
            </div>
            <div className="absolute top-10 left-10 text-[10px] text-white/10 select-none pointer-events-none font-mono uppercase tracking-[0.5em] z-50 bg-black/20 p-2 rounded">AUTH: {currentUser.email}</div>
          </div>
          <div className="p-12 md:p-24 max-w-6xl mx-auto w-full">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-12 mb-20 pb-20 border-b border-white/5">
              <h1 className="text-4xl md:text-7xl font-black tracking-tighter leading-tight italic">{activeLesson.title}</h1>
              <button onClick={() => toggleLessonStatus(course.id, activeLesson.id)} className={`px-12 py-6 rounded-[32px] font-black transition-all transform hover:-translate-y-2 shadow-2xl flex items-center gap-4 text-xl ${completed.includes(activeLesson.id) ? 'bg-green-500 text-black shadow-green-500/20' : 'bg-white text-black shadow-white/10'}`}><CheckCircle size={32} /> {completed.includes(activeLesson.id) ? 'Completed' : 'Finish Lesson'}</button>
            </div>
            <p className="text-gray-400 text-2xl leading-relaxed font-medium opacity-80 border-l-8 border-blue-600 pl-10 italic">ยินดีต้อนรับเข้าสู่บทเรียน {activeLesson.title} ข้อมูลการเรียนของคุณจะถูกซิงค์ลงในระบบอัตโนมัติ แอดมินสามารถสลับบทเรียนเพื่อทดสอบวิดีโอได้เลยครับ</p>
          </div>
        </div>
      </div>
    );
  };

  const renderAdminPanel = () => {
    const pendingOrders = orders.filter(o => o.status === 'pending');
    return (
      <div className="bg-[#0f172a] min-h-screen text-white py-32 animate-in fade-in duration-700">
        <div className="max-w-7xl mx-auto px-4 space-y-32">
          <div>
            <h1 className="text-6xl md:text-9xl font-black tracking-tighter italic uppercase">Admin Hub</h1>
            <p className="text-blue-500 font-black uppercase tracking-[0.6em] text-xs mt-6">Secure System Management</p>
          </div>
          <section>
            <h2 className="text-4xl font-black tracking-tighter mb-16 border-b-8 border-yellow-500 w-fit pb-4 italic uppercase">Pending Orders ({pendingOrders.length})</h2>
            <div className="bg-[#1e293b] rounded-[64px] border border-white/5 shadow-2xl overflow-hidden overflow-x-auto">
              <table className="w-full text-left min-w-[800px]">
                <thead className="bg-[#0f172a]/50 border-b border-white/5 text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">
                  <tr><th className="px-12 py-10">Subscriber</th><th className="px-12 py-10">Amount</th><th className="px-12 py-10">Proof</th><th className="px-12 py-10">Action</th></tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {pendingOrders.length === 0 && <tr><td colSpan={4} className="px-12 py-32 text-center text-gray-700 font-black text-3xl opacity-20 uppercase tracking-widest italic italic">No records found</td></tr>}
                  {pendingOrders.map(order => (
                    <tr key={order.id} className="hover:bg-white/5 transition duration-300">
                      <td className="px-12 py-10 font-black text-2xl">{order.userName}<p className="text-[10px] text-gray-600 uppercase tracking-widest mt-2">{order.date}</p></td>
                      <td className="px-12 py-10 font-black text-4xl text-blue-400">฿{order.total.toLocaleString()}</td>
                      <td className="px-12 py-10"><div className="w-20 h-28 bg-[#0f172a] rounded-[20px] border border-white/10 group relative overflow-hidden cursor-zoom-in" onClick={() => window.open(order.slip)}><img src={order.slip} alt={`Payment slip for ${order.userName}`} className="w-full h-full object-cover opacity-40 group-hover:opacity-100 transition duration-500" /><Eye size={32} className="absolute inset-0 m-auto text-white opacity-0 group-hover:opacity-100 transition" /></div></td>
                      <td className="px-12 py-10"><button onClick={() => approveOrder(order.id)} className="bg-green-500 text-black px-12 py-5 rounded-[24px] font-black hover:bg-green-400 transition shadow-2xl uppercase tracking-tighter italic text-sm">Approve Access</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    );
  };

  const renderProfile = () => {
    if (!currentUser) return null;
    const myOwned = currentUser.role === 'admin' ? courses : courses.filter(c => currentUser.ownedCourses?.includes(c.id));
    const pendingOrders = orders.filter(o => o.userId === currentUser.id && o.status === 'pending');

    return (
      <div className="bg-[#0f172a] min-h-screen text-white py-32 animate-in slide-in-from-bottom duration-700">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-24 items-start mb-32">
             <div className="bg-[#1e293b] p-20 rounded-[64px] border border-white/5 shadow-2xl text-center w-full md:w-96 relative overflow-hidden group">
               <div className="absolute top-0 left-0 w-full h-4 bg-blue-600"></div>
               <img src={`https://i.pravatar.cc/300?u=${currentUser.id}`} alt={`${currentUser.name} avatar`} className="w-48 h-48 rounded-full border-8 border-[#0f172a] shadow-2xl mx-auto mb-10 transition duration-500 group-hover:scale-110" />
               <h2 className="text-3xl font-black tracking-tighter mb-4 italic">{currentUser.name}</h2>
               <p className="text-gray-500 font-black uppercase tracking-widest text-[10px] opacity-60">{currentUser.email}</p>
             </div>
             <div className="flex-1 w-full space-y-20">
               <h2 className="text-6xl md:text-8xl font-black tracking-tighter border-b-8 border-blue-600 w-fit pb-10 uppercase italic">My Classroom</h2>
               
               {pendingOrders.length > 0 && (
                 <div className="p-10 bg-yellow-500/10 border border-yellow-500/30 rounded-[40px] flex items-center gap-6 shadow-2xl shadow-yellow-500/5">
                    <Clock size={32} className="text-yellow-500 animate-pulse" />
                    <div>
                      <p className="font-black text-2xl text-yellow-500">รอแอดมินตรวจสอบสลิป ({pendingOrders.length} รายการ)</p>
                      <p className="text-gray-500 font-bold uppercase text-xs tracking-widest mt-1 italic">คอร์สจะปรากฏด้านล่างทันทีเมื่อได้รับการอนุมัติ</p>
                    </div>
                 </div>
               )}

               {myOwned.length === 0 && pendingOrders.length === 0 ? (
                 <div className="p-24 bg-[#1e293b] rounded-[64px] border border-white/5 text-center shadow-inner">
                    <p className="text-gray-600 font-black text-3xl mb-12 uppercase tracking-widest italic opacity-50 italic">Empty Library</p>
                    <button onClick={() => setView('home')} className="bg-blue-600 text-white px-16 py-6 rounded-full font-black shadow-2xl uppercase tracking-widest hover:scale-105 transition">Discover Courses</button>
                 </div>
               ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  {myOwned.map(course => (
                      <div key={course.id} className="bg-[#1e293b] p-10 rounded-[56px] flex flex-col hover:shadow-2xl transition-all duration-700 border border-white/5 group">
                        <div className="flex gap-8 mb-12">
                          <img src={course.image} alt={course.title} className="w-24 h-24 rounded-3xl object-cover shadow-2xl border border-white/5" />
                          <div className="font-black text-2xl leading-tight flex-1 group-hover:text-blue-400 transition italic">{course.title}</div>
                        </div>
                        <button onClick={() => startLearning(course)} className="w-full bg-blue-600 text-white py-6 rounded-[32px] font-black text-xl hover:bg-blue-500 transition shadow-2xl active:scale-95 uppercase tracking-widest italic tracking-tighter">Enter Room</button>
                      </div>
                  ))}
                </div>
               )}
             </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white font-sans selection:bg-blue-600 overflow-x-hidden">
      {view !== 'learning' && renderNav()}
      
      <main className="transition-all duration-300">
        {view === 'login' && (
          <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-4 bg-[#0f172a] animate-in zoom-in-95">
            <div className="bg-[#1e293b] rounded-[64px] p-24 shadow-[0_0_120px_-20px_rgba(0,0,0,1)] max-w-xl w-full text-center border border-white/5">
              <div className="bg-blue-600 inline-block p-10 rounded-[40px] mb-12 text-white shadow-2xl shadow-blue-500/40 animate-bounce"><User size={72} /></div>
              <h2 className="text-5xl font-black mb-16 tracking-tighter uppercase italic italic">Access</h2>
              <div className="space-y-6">
                <button onClick={() => handleLogin('student@test.com')} className="w-full bg-white/5 text-white py-6 rounded-full font-black hover:bg-blue-600 transition tracking-[0.4em] text-xs uppercase border border-white/10 shadow-xl">Standard Student</button>
                <button onClick={() => handleLogin('admin@test.com')} className="w-full bg-blue-600 text-white py-6 rounded-full font-black hover:bg-blue-500 transition tracking-[0.4em] text-xs uppercase shadow-2xl shadow-blue-500/30">System Administrator</button>
              </div>
            </div>
          </div>
        )}
        {view === 'home' && renderHome()}
        {view === 'detail' && renderCourseDetail()}
        {view === 'learning' && renderLearningPortal()}
        {view === 'admin' && renderAdminPanel()}
        {view === 'profile' && renderProfile()}
        {view === 'cart' && (
           <div className="bg-[#0f172a] min-h-screen py-40 animate-in fade-in duration-500 text-center px-4">
             <h1 className="text-8xl font-black tracking-tighter mb-20 uppercase italic italic">Checkout</h1>
             {cart.length === 0 ? (
               <div className="p-32 bg-[#1e293b] rounded-[64px] border border-white/5 max-w-2xl mx-auto shadow-2xl"><p className="text-gray-600 font-black text-3xl mb-16 uppercase tracking-widest italic opacity-50">Empty Cart</p><button onClick={() => setView('home')} className="bg-blue-600 text-white px-16 py-6 rounded-full font-black shadow-2xl uppercase tracking-widest hover:scale-105 transition">Return Home</button></div>
             ) : (
               <div className="max-w-4xl mx-auto space-y-8">
                 {cart.map(i => <div key={i.id} className="bg-[#1e293b] p-12 rounded-[48px] flex items-center justify-between border border-white/5 shadow-2xl transform transition hover:scale-[1.02] duration-500"><div className="flex items-center gap-10"><img src={i.image} alt={i.title} className="w-24 h-24 rounded-[32px] object-cover shadow-2xl" /><span className="text-3xl font-black italic italic">{i.title}</span></div><button onClick={() => setCart(cart.filter(c => c.id !== i.id))} className="text-red-500 hover:scale-110 transition"><Trash2 size={40} /></button></div>)}
                 <div className="pt-20"><button onClick={processOrder} className="w-full bg-green-500 text-black py-10 rounded-[48px] font-black text-4xl shadow-[0_0_80px_rgba(34,197,94,0.3)] active:scale-95 uppercase tracking-tighter italic transition-all hover:bg-green-400">Process Transaction</button></div>
               </div>
             )}
           </div>
        )}
      </main>

      {/* Role Switcher */}
      <div className="fixed bottom-12 right-12 flex items-center gap-4 bg-[#1e293b]/95 backdrop-blur-3xl p-5 rounded-[48px] z-[200] shadow-[0_40px_100px_-20px_rgba(0,0,0,1)] border border-white/10 group hover:scale-105 transition-all duration-500">
        <button onClick={() => handleLogin('student@test.com')} className={`px-10 py-4 rounded-full text-xs font-black transition-all ${currentUser?.role === 'user' ? 'bg-blue-600 text-white shadow-2xl shadow-blue-600/30 scale-110' : 'text-gray-500 hover:text-white'}`}>STUDENT</button>
        <button onClick={() => handleLogin('admin@test.com')} className={`px-10 py-4 rounded-full text-xs font-black transition-all ${currentUser?.role === 'admin' ? 'bg-indigo-600 text-white shadow-2xl shadow-indigo-600/30 scale-110' : 'text-gray-500 hover:text-white'}`}>ADMIN</button>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Anuphan:wght@400;600;700;800;900&display=swap');
        * { font-family: 'Anuphan', sans-serif; -webkit-tap-highlight-color: transparent; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes fade-in { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
        .animate-in { animation: fade-in 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>
    </div>
  );
}
