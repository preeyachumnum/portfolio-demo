"use client";

import React, { useState } from 'react';
import { 
  Layout, CheckSquare, Users, Settings, Plus, Search, 
  ChevronRight, X, Calendar, MessageSquare, MoreHorizontal
} from 'lucide-react';

// --- TYPES & INTERFACES ---
// กำหนดโครงสร้างข้อมูลให้ชัดเจนเพื่อแก้ปัญหา TS Error

interface Tag {
  name: string;
  color: string;
}

interface Task {
  id: string;
  columnId: string;
  title: string;
  tags: Tag[];
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  assignee: string;
  dueDate: string;
}

interface Project {
  name: string;
  tasks: Task[];
}

interface Projects {
  [key: string]: Project;
}

// --- INITIAL DATA ---
const INITIAL_COLUMNS = [
  { id: 'col-todo', title: 'To Do', color: 'bg-slate-200 text-slate-700' },
  { id: 'col-progress', title: 'In Progress', color: 'bg-blue-100 text-blue-700' },
  { id: 'col-review', title: 'In Review', color: 'bg-amber-100 text-amber-700' },
  { id: 'col-done', title: 'Done', color: 'bg-emerald-100 text-emerald-700' },
];

const INITIAL_DATA: Projects = {
  projectA: {
    name: 'Website Redesign',
    tasks: [
      { id: 't-1', columnId: 'col-todo', title: 'ออกแบบหน้า Login และ Register', tags: [{ name: 'Design', color: 'bg-purple-100 text-purple-700' }], priority: 'High', assignee: 'PC', dueDate: '15 Mar' },
      { id: 't-2', columnId: 'col-todo', title: 'Setup ฐานข้อมูล PostgreSQL', tags: [{ name: 'Backend', color: 'bg-blue-100 text-blue-700' }], priority: 'Medium', assignee: 'SP', dueDate: '18 Mar' },
      { id: 't-3', columnId: 'col-progress', title: 'พัฒนา API สำหรับดึงข้อมูล User', tags: [{ name: 'Backend', color: 'bg-blue-100 text-blue-700' }], priority: 'High', assignee: 'WT', dueDate: '12 Mar' },
      { id: 't-4', columnId: 'col-review', title: 'ปรับ UI หน้า Dashboard', tags: [{ name: 'Frontend', color: 'bg-pink-100 text-pink-700' }], priority: 'Medium', assignee: 'PC', dueDate: '10 Mar' },
    ]
  },
  projectB: {
    name: 'Mobile App MVP',
    tasks: [
      { id: 't-b1', columnId: 'col-todo', title: 'วิเคราะห์คู่แข่ง Mobile App', tags: [{ name: 'Research', color: 'bg-yellow-100 text-yellow-700' }], priority: 'Low', assignee: 'AK', dueDate: '20 Apr' },
      { id: 't-b2', columnId: 'col-progress', title: 'ออกแบบ Wireframe หน้าหลัก', tags: [{ name: 'Design', color: 'bg-purple-100 text-purple-700' }], priority: 'High', assignee: 'PC', dueDate: '05 Apr' },
    ]
  }
};

const TEAM_MEMBERS = [
  { id: 'm-1', initials: 'PC', name: 'Preeya C.', role: 'Product Manager' },
  { id: 'm-2', initials: 'WT', name: 'Wichai T.', role: 'Frontend Developer' },
  { id: 'm-3', initials: 'SP', name: 'Somchai P.', role: 'Backend Developer' },
  { id: 'm-4', initials: 'AK', name: 'Amnat K.', role: 'UX/UI Designer' },
];

export default function App() {
  const [activeProject, setActiveProject] = useState<string>('projectA');
  const [projects, setProjects] = useState<Projects>(INITIAL_DATA);
  const [activeTab, setActiveTab] = useState<string>('board');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [modalColumnId, setModalColumnId] = useState<string>('col-todo');

  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [hoveredTaskId, setHoveredTaskId] = useState<string | null>(null);

  const currentProject = projects[activeProject];

  // --- DRAG AND DROP HANDLERS ---
  
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggedId(taskId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, taskId: string | null = null) => {
    e.preventDefault();
    if (taskId) setHoveredTaskId(taskId);
  };

  const handleDrop = (e: React.DragEvent, columnId: string, targetTaskId: string | null = null) => {
    e.preventDefault();
    if (!draggedId) return;
    
    setProjects(prev => {
      const projectData = prev[activeProject];
      const updatedTasks = [...projectData.tasks];
      
      const taskIdx = updatedTasks.findIndex(t => t.id === draggedId);
      if (taskIdx === -1) return prev;

      // ลบงานออกจากตำแหน่งเดิม
      const [movedTask] = updatedTasks.splice(taskIdx, 1);
      // เปลี่ยน Column
      movedTask.columnId = columnId;

      if (targetTaskId && targetTaskId !== draggedId) {
        // วางแทรกหน้างานที่ Hover อยู่
        const targetIdx = updatedTasks.findIndex(t => t.id === targetTaskId);
        updatedTasks.splice(targetIdx, 0, movedTask);
      } else {
        // วางต่อท้าย Column
        updatedTasks.push(movedTask);
      }

      return {
        ...prev,
        [activeProject]: { ...projectData, tasks: updatedTasks }
      };
    });

    setDraggedId(null);
    setHoveredTaskId(null);
  };

  // --- TASK ACTIONS ---
  
  const handleAddTask = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const title = formData.get('title') as string;
    
    if (!title) return;

    const newTask: Task = {
      id: `task-${Date.now()}`,
      columnId: modalColumnId,
      title: title,
      priority: (formData.get('priority') as any) || 'Medium',
      assignee: (formData.get('assignee') as string) || 'PC',
      tags: [{ name: (formData.get('tag') as string) || 'General', color: 'bg-slate-100 text-slate-600' }],
      dueDate: 'Today'
    };

    setProjects(prev => ({
      ...prev,
      [activeProject]: {
        ...prev[activeProject],
        tasks: [...prev[activeProject].tasks, newTask]
      }
    }));
    setIsAddModalOpen(false);
  };

  const filteredTasks = currentProject.tasks.filter(t => 
    t.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-screen w-full bg-[#F4F5F7] font-sans text-slate-800 overflow-hidden">
      
      {/* 1. SIDEBAR */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0 z-20">
        <div className="h-16 flex items-center px-6 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-100">
              <Layout size={18} className="text-white" />
            </div>
            <span className="font-bold text-slate-900 text-lg">NexusFlow</span>
          </div>
        </div>

        <div className="p-4 flex-1 overflow-y-auto space-y-6">
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 px-2">Projects</div>
            <nav className="space-y-1">
              {Object.keys(projects).map(key => (
                <button 
                  key={key}
                  onClick={() => setActiveProject(key)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all ${activeProject === key ? 'bg-indigo-50 text-indigo-700 shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                  <span>{projects[key].name}</span>
                  {activeProject === key && <div className="w-1.5 h-1.5 rounded-full bg-indigo-600"></div>}
                </button>
              ))}
            </nav>
          </div>

          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 px-2">Views</div>
            <nav className="space-y-1">
              <button onClick={() => setActiveTab('board')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'board' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:bg-slate-50'}`}>
                <Layout size={16} /> Kanban Board
              </button>
              <button onClick={() => setActiveTab('list')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'list' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:bg-slate-50'}`}>
                <CheckSquare size={16} /> List View
              </button>
              <button onClick={() => setActiveTab('team')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'team' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:bg-slate-50'}`}>
                <Users size={16} /> Team Members
              </button>
            </nav>
          </div>
        </div>

        <div className="p-4 border-t border-slate-100">
           <button onClick={() => setActiveTab('settings')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'settings' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:bg-slate-50'}`}>
              <Settings size={16} /> Settings
            </button>
        </div>
      </aside>

      {/* 2. MAIN CONTENT */}
      <main className="flex-1 flex flex-col min-w-0 bg-white">
        
        {/* Header */}
        <header className="px-8 py-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <span>Project</span> <ChevronRight size={14} /> <span className="font-semibold text-slate-600">{currentProject.name}</span>
            </div>
            <div className="flex -space-x-2">
              {TEAM_MEMBERS.map(m => (
                <div key={m.id} className="w-8 h-8 rounded-full border-2 border-white bg-indigo-100 flex items-center justify-center text-[10px] font-bold text-indigo-600 cursor-pointer hover:z-10 transition-all">
                  {m.initials}
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">{currentProject.name}</h1>
            <div className="flex items-center gap-3">
              <div className="relative hidden sm:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
                <input 
                  type="text" 
                  placeholder="Search tasks..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-indigo-100 outline-none w-64 transition-all"
                />
              </div>
              <button onClick={() => { setModalColumnId('col-todo'); setIsAddModalOpen(true); }} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg shadow-indigo-100 transition-all flex items-center gap-2">
                <Plus size={16} /> New Task
              </button>
            </div>
          </div>
        </header>

        {/* Dynamic Views */}
        <div className="flex-1 relative overflow-hidden bg-[#F4F5F7]">
          
          {/* BOARD VIEW */}
          {activeTab === 'board' && (
            <div className="absolute inset-0 flex gap-6 p-8 overflow-x-auto items-start">
              {INITIAL_COLUMNS.map(col => {
                const columnTasks = filteredTasks.filter(t => t.columnId === col.id);
                return (
                  <div 
                    key={col.id}
                    onDragOver={(e) => handleDragOver(e)}
                    onDrop={(e) => handleDrop(e, col.id)}
                    className="w-80 flex flex-col bg-[#EBECF0] rounded-xl shrink-0 h-full max-h-full shadow-sm"
                  >
                    <div className="p-4 flex items-center justify-between shrink-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-700 text-xs uppercase tracking-wider">{col.title}</h3>
                        <span className="bg-slate-300/50 text-slate-600 px-2 py-0.5 rounded text-[10px] font-bold">{columnTasks.length}</span>
                      </div>
                      <button onClick={() => { setModalColumnId(col.id); setIsAddModalOpen(true); }} className="text-slate-500 hover:text-indigo-600 p-1 rounded hover:bg-white transition-all">
                        <Plus size={16} />
                      </button>
                    </div>

                    <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-3 custom-scrollbar">
                      {columnTasks.map((task) => (
                        <React.Fragment key={task.id}>
                          {/* Drop Indicator */}
                          {hoveredTaskId === task.id && draggedId !== task.id && (
                            <div className="h-1.5 bg-indigo-500 rounded-full my-1 shadow-[0_0_8px_rgba(79,70,229,0.5)] animate-pulse" />
                          )}
                          
                          <div
                            draggable
                            onDragStart={(e) => handleDragStart(e, task.id)}
                            onDragOver={(e) => handleDragOver(e, task.id)}
                            onDragEnd={() => setHoveredTaskId(null)}
                            onDrop={(e) => { e.stopPropagation(); handleDrop(e, col.id, task.id); }}
                            className={`bg-white p-4 rounded-lg shadow-sm border border-transparent cursor-grab active:cursor-grabbing hover:border-indigo-300 transition-all group ${draggedId === task.id ? 'opacity-20 border-indigo-500 ring-2 ring-indigo-100' : ''}`}
                          >
                            <div className="flex items-center justify-between mb-3">
                              <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${task.priority === 'High' ? 'bg-red-50 text-red-600' : task.priority === 'Medium' ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600'}`}>
                                {task.priority}
                              </span>
                              <div className="flex gap-1">
                                {task.tags.map((tag, i) => (
                                  <span key={i} className={`text-[8px] font-bold px-1 rounded ${tag.color}`}>{tag.name}</span>
                                ))}
                              </div>
                            </div>
                            <h4 className="text-sm font-bold text-slate-800 leading-snug mb-4 group-hover:text-indigo-600 transition-colors">{task.title}</h4>
                            <div className="flex items-center justify-between mt-auto">
                              <div className="flex items-center gap-2 text-slate-400 text-[10px] font-medium">
                                <Calendar size={12}/> {task.dueDate}
                              </div>
                              <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500 border border-slate-200">
                                {task.assignee}
                              </div>
                            </div>
                          </div>
                        </React.Fragment>
                      ))}
                      {columnTasks.length === 0 && (
                        <div className="h-24 border-2 border-dashed border-slate-300 rounded-xl flex items-center justify-center text-slate-400 text-xs italic bg-white/30">
                          Drop tasks here
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              <button className="w-80 shrink-0 h-14 border-2 border-dashed border-slate-300 rounded-xl flex items-center justify-center gap-2 text-slate-400 font-bold hover:border-indigo-400 hover:text-indigo-600 hover:bg-white transition-all">
                <Plus size={18} /> Add Section
              </button>
            </div>
          )}

          {/* LIST VIEW */}
          {activeTab === 'list' && (
            <div className="p-8 h-full overflow-auto animate-in fade-in duration-300">
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      <th className="p-4">Status</th>
                      <th className="p-4">Task Name</th>
                      <th className="p-4">Priority</th>
                      <th className="p-4 text-right">Assignee</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredTasks.map(t => (
                      <tr key={t.id} className="hover:bg-slate-50 transition-all group cursor-pointer">
                        <td className="p-4">
                           <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${INITIAL_COLUMNS.find(c => c.id === t.columnId)?.color}`}>
                             {INITIAL_COLUMNS.find(c => c.id === t.columnId)?.title}
                           </span>
                        </td>
                        <td className="p-4 text-sm font-bold text-slate-700">{t.title}</td>
                        <td className="p-4">
                           <span className={`text-[10px] font-bold ${t.priority === 'High' ? 'text-red-600' : 'text-slate-600'}`}>{t.priority}</span>
                        </td>
                        <td className="p-4 text-right">
                           <div className="w-7 h-7 rounded-full bg-indigo-50 border border-indigo-200 flex items-center justify-center text-[10px] font-bold text-indigo-600 ml-auto">{t.assignee}</div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TEAM VIEW */}
          {activeTab === 'team' && (
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
              {TEAM_MEMBERS.map(m => (
                <div key={m.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 hover:border-indigo-400 transition-all group">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-100">
                    {m.initials}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-lg leading-tight">{m.name}</h4>
                    <p className="text-xs text-slate-500 font-medium">{m.role}</p>
                  </div>
                  <button className="ml-auto text-slate-300 hover:text-slate-600"><MoreHorizontal size={18}/></button>
                </div>
              ))}
            </div>
          )}

          {/* SETTINGS VIEW */}
          {activeTab === 'settings' && (
            <div className="p-8 max-w-xl animate-in slide-in-from-bottom-4 duration-300">
              <div className="bg-white border border-slate-200 rounded-2xl p-8 space-y-6 shadow-sm">
                <h3 className="font-black text-xl tracking-tight">Project Settings</h3>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Project Name</label>
                  <input type="text" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none focus:ring-2 focus:ring-indigo-100 focus:bg-white transition-all" defaultValue={currentProject.name} />
                </div>
                <div className="space-y-1.5">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Team Access</label>
                   <div className="flex gap-2">
                      {TEAM_MEMBERS.map(m => <div key={m.id} className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-[10px] font-bold text-indigo-600">{m.initials}</div>)}
                      <button className="w-8 h-8 rounded-full border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400 hover:border-indigo-400 hover:text-indigo-600 transition-all"><Plus size={14}/></button>
                   </div>
                </div>
                <div className="pt-4 flex gap-3">
                   <button className="flex-1 bg-slate-100 text-slate-600 py-3 rounded-xl font-bold hover:bg-slate-200 transition-all">Cancel</button>
                   <button className="flex-1 bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200">Save Changes</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* 3. ADD TASK MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md animate-in zoom-in-95 duration-200 overflow-hidden">
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-indigo-50/30">
              <h3 className="font-black text-slate-900 text-xl">Create New Task</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="bg-white p-2 rounded-full shadow-sm text-slate-400 hover:text-slate-600 transition-all">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleAddTask} className="p-8 space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Task Title</label>
                <input name="title" type="text" required autoFocus className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-100 focus:bg-white transition-all font-semibold" placeholder="What needs to be done?" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Priority</label>
                  {/* Fixed Warning: moved defaultValue to select instead of selected on option */}
                  <select name="priority" defaultValue="Medium" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white cursor-pointer font-semibold">
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Assignee</label>
                  <select name="assignee" defaultValue="PC" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white cursor-pointer font-semibold">
                    {TEAM_MEMBERS.map(m => <option key={m.id} value={m.initials}>{m.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tag / Category</label>
                <input name="tag" type="text" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-100 focus:bg-white transition-all" placeholder="e.g. Bug, UI, Feature" />
              </div>
              
              <div className="pt-6 flex gap-3">
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="flex-1 py-3 border border-slate-200 text-slate-600 rounded-2xl font-bold hover:bg-slate-50 transition-all">Cancel</button>
                <button type="submit" className="flex-1 py-3 bg-indigo-600 text-white rounded-2xl font-bold shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all">Create Task</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Global Style for Scrollbar */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94A3B8; }
      `}} />
    </div>
  );
}