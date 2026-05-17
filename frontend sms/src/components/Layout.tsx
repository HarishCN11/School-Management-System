import { 
  UserCircle, LogOut, Bell, LayoutDashboard, 
  Users, GraduationCap, School, Package, 
  Heart, Home, BookOpen, Library, BarChart3, 
  Briefcase, Box, MessageSquare, LineChart, Mail, History 
} from 'lucide-react';

export const Layout = ({ children, currentPage, navigationItems, userRole, userName, userPhoto, onNavigate, onLogout, notificationCount }: any) => {
  return (
    <div className="flex h-screen bg-[#f8fafc]">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-slate-200 flex flex-col shadow-[1px_0_10px_rgba(0,0,0,0.02)] z-20">
        <div className="p-6 border-b border-slate-50 flex items-center gap-4">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/20">SM</div>
          <div>
            <h1 className="text-lg font-extrabold text-slate-900 leading-tight tracking-tight">School Portal</h1>
            <p className="text-[10px] text-blue-600 font-black uppercase tracking-widest">{userRole}</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar">
          {navigationItems.map((item: any, i: number) => {
            const Icon = item.icon || LayoutDashboard;
            const isActive = currentPage === item.id;
            return (
              <button
                key={i}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${isActive
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-200/50 translate-x-1'
                  : 'text-slate-500 hover:bg-blue-50 hover:text-blue-700 hover:translate-x-1'
                  }`}
              >
                <Icon size={18} className={`${isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-600'} transition-colors`} />
                <span className={`font-semibold text-sm ${isActive ? 'text-white' : 'text-slate-600 group-hover:text-blue-700'}`}>{item.label}</span>
                {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white animate-pulse"></div>}
              </button>
            );
          })}
        </div>

        {/* Global Sidebar Footer */}
        <div className="p-4 border-t border-slate-100 space-y-2 bg-slate-50/50">
          <button
            onClick={() => onNavigate('profile')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all ${currentPage === 'profile' ? 'bg-white shadow-md text-blue-600' : 'text-slate-500 hover:bg-white hover:shadow-sm hover:text-slate-700'}`}
          >
            <UserCircle size={20} className={currentPage === 'profile' ? 'text-blue-600' : 'text-slate-400'} />
            <span className="text-sm font-bold">My Settings</span>
          </button>
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-red-500 hover:bg-red-50 hover:text-red-600 transition-all active:scale-95"
          >
            <LogOut size={20} />
            <span className="text-sm font-bold">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-20 z-0 pointer-events-none"></div>

        {/* Header */}
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-8 py-4 flex justify-between items-center z-10 sticky top-0">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-slate-100 rounded-lg">
              <LayoutDashboard className="text-slate-500" size={18} />
            </div>
            <span className="text-slate-300 font-medium">/</span>
            <span className="text-slate-800 font-bold capitalize tracking-tight">{currentPage.replace(/-/g, ' ')}</span>
            
            <div className="ml-4 hidden lg:flex items-center gap-2 px-3 py-1 bg-green-50 rounded-full border border-green-100 shadow-sm">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-[9px] font-black text-green-700 uppercase tracking-widest leading-none">Database Online</span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <button
              onClick={() => onNavigate(userRole.toLowerCase() + '-announcements')}
              className="relative text-slate-400 hover:text-blue-600 transition p-2.5 hover:bg-slate-100 rounded-xl"
            >
              <Bell size={20} />
              {notificationCount > 0 && (
                <span className="absolute top-2 right-2 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center border-2 border-white shadow-sm font-bold">
                  {notificationCount}
                </span>
              )}
            </button>

            <div className="h-8 w-[1px] bg-slate-200"></div>

            <button
              onClick={() => onNavigate('profile')}
              className="flex items-center gap-3 hover:bg-slate-50 p-1.5 pr-4 rounded-xl transition border border-transparent hover:border-slate-200 group"
            >
              <div className="w-10 h-10 overflow-hidden rounded-xl shadow-lg shadow-blue-200/20 border-2 border-white group-hover:scale-105 transition-transform">
                {userPhoto ? (
                  <img src={`http://localhost:3000${userPhoto}`} alt="U" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-tr from-blue-600 to-indigo-700 text-white flex items-center justify-center font-bold text-sm">
                    {userName.charAt(0)}
                  </div>
                )}
              </div>
              <div className="text-left hidden md:block">
                <p className="text-sm font-bold text-slate-800 leading-none mb-1">{userName}</p>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{userRole}</p>
              </div>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-8 relative z-0 scrollbar-thin scrollbar-thumb-slate-200">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export const getNavigationForRole = (role: string) => {
  const navigationMap: any = {
    Admin: [
      { id: 'admin-dashboard', label: 'Overview', icon: LayoutDashboard },
      { id: 'admin-students', label: 'Student Directory', icon: GraduationCap },
      { id: 'admin-teachers', label: 'Teacher Detail', icon: Users },
      { id: 'admin-principals', label: 'Principals', icon: Briefcase },
      { id: 'admin-parents', label: 'Parent Portal', icon: Heart },
      { id: 'admin-classes', label: 'Academic Classes', icon: School },
      { id: 'admin-inventory', label: 'Resource Inventory', icon: Package },
      { id: 'admin-announcements', label: 'Bulletins', icon: Bell },
      { id: 'admin-audit', label: 'System Trace', icon: History },
    ],
    Teacher: [
      { id: 'teacher-dashboard', label: 'Overview', icon: LayoutDashboard },
      { id: 'teacher-classes', label: 'My Classes', icon: School },
      { id: 'teacher-materials', label: 'Study Materials', icon: Library },
      { id: 'teacher-instructions', label: 'Assignments', icon: Mail },
      { id: 'teacher-submissions', label: 'Grading', icon: BarChart3 },
      { id: 'teacher-reports', label: 'Term Reports', icon: FileTextIcon },
      { id: 'teacher-feedback', label: 'Parent Feedback', icon: MessageSquare },
      { id: 'teacher-announcements', label: 'Announcements', icon: Bell },
    ],
    Student: [
      { id: 'student-dashboard', label: 'Learning Center', icon: BookOpen },
      { id: 'student-courses', label: 'My Courses', icon: Library },
      { id: 'student-reports', label: 'Progress Report', icon: BarChart3 },
      { id: 'student-announcements', label: 'Announcements', icon: Bell },
      { id: 'student-feedback', label: 'Teacher Feedback', icon: MessageSquare },
    ],
    Principal: [
      { id: 'principal-dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'principal-teacher-oversight', label: 'Faculty Details', icon: Users },
      { id: 'principal-reports', label: 'Student Directory', icon: GraduationCap },
      { id: 'principal-school-analytics', label: 'Inventory & Resource', icon: Box },
      { id: 'principal-announcements', label: 'Announcements', icon: Bell },
      { id: 'principal-feedback', label: 'Message Admin', icon: MessageSquare },
    ],
    Parent: [
      { id: 'parent-dashboard', label: 'Family Portal', icon: Home },
      { id: 'parent-child-progress', label: 'Child Performance', icon: LineChart },
      { id: 'parent-communication', label: 'Contact School', icon: Mail },
    ],
  };

  return navigationMap[role] || [];
};

// Internal icon proxy for missing ones
const FileTextIcon = (props: any) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
);
