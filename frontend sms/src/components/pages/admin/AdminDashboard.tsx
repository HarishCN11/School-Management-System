import { useEffect, useState } from 'react';
import { Users, GraduationCap, School, Activity, ArrowRight, TrendingUp } from 'lucide-react';
import { academicService } from '../../../services/api';
import { toast } from 'sonner';

export const AdminDashboard = ({ onNavigate }: any) => {
  const [stats, setStats] = useState({
    students: 0,
    teachers: 0,
    classes: 0,
    users: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await academicService.getStats();
        setStats(data);
      } catch (error) {
        console.error('Error fetching stats:', error);
        toast.error('Failed to load dashboard statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    { title: 'Total Students', value: stats.students, icon: GraduationCap, color: 'bg-blue-500', textColor: 'text-blue-600', trend: '+12% this month' },
    { title: 'Total Teachers', value: stats.teachers, icon: Users, color: 'bg-emerald-500', textColor: 'text-emerald-600', trend: 'Stable' },
    { title: 'Total Classes', value: stats.classes, icon: School, color: 'bg-indigo-500', textColor: 'text-indigo-600', trend: '4 New added' },
    { title: 'Active Users', value: stats.users, icon: Activity, color: 'bg-orange-500', textColor: 'text-orange-600', trend: 'Live now' },
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Admin Console</h1>
          <p className="text-slate-500 mt-2 font-medium">Global management & system oversight</p>
        </div>
        <div className="flex gap-3">
            <button onClick={() => window.print()} className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition shadow-sm">
                Generate Report
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {statCards.map((card, index) => (
          <div key={index} className="group bg-white p-7 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col gap-6 hover:shadow-xl hover:shadow-blue-500/5 hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center justify-between">
                <div className={`${card.color} bg-opacity-15 p-4 rounded-2xl group-hover:scale-110 transition-transform`}>
                    <card.icon className={card.textColor} size={28} />
                </div>
                <div className="flex items-center gap-1 text-[10px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2 py-1 rounded-full">
                    <TrendingUp size={12} />
                    {card.trend}
                </div>
            </div>
            <div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">{card.title}</p>
              <p className="text-4xl font-black text-slate-900 tabular-nums">
                {loading ? '...' : card.value.toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <div className="relative z-10">
                    <h2 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-3">
                        <div className="w-2 h-8 bg-blue-600 rounded-full"></div>
                        Capacity Analysis
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <div className="flex justify-between items-end">
                                    <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Student Enrollment</p>
                                    <p className="text-sm font-black text-blue-600">{(stats.students / 1000 * 100).toFixed(1)}%</p>
                                </div>
                                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden p-0.5 border border-slate-200/50">
                                    <div className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full rounded-full transition-all duration-1000 shadow-sm" style={{ width: `${Math.max(5, stats.students / 1000 * 100)}%` }}></div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between items-end">
                                    <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Teacher Ratio</p>
                                    <p className="text-sm font-black text-emerald-600">{(stats.teachers / stats.students * 100 || 0).toFixed(1)}%</p>
                                </div>
                                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden p-0.5 border border-slate-200/50">
                                    <div className="bg-gradient-to-r from-emerald-500 to-teal-600 h-full rounded-full transition-all duration-1000 shadow-sm" style={{ width: `${Math.max(5, stats.teachers / stats.students * 100 || 0)}%` }}></div>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100/50 flex flex-col justify-center">
                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">System Recommendation</p>
                            <p className="text-sm text-slate-600 font-bold leading-relaxed italic">
                                "The current teacher-to-student ratio is optimal. Consider expanding class capacity for the upcoming term."
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-xl font-black text-slate-900 flex items-center gap-3">
                        <div className="w-2 h-8 bg-indigo-600 rounded-full"></div>
                        Direct Resource Control
                    </h2>
                    <button className="text-xs font-black text-blue-600 uppercase tracking-widest hover:underline px-4 py-2 bg-blue-50 rounded-xl">View All</button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                    {[
                        { label: 'Students', id: 'admin-students', icon: GraduationCap },
                        { label: 'Teachers', id: 'admin-teachers', icon: Users },
                        { label: 'Classes', id: 'admin-classes', icon: School },
                        { label: 'Inventory', id: 'admin-inventory', icon: Package }
                    ].map((btn) => (
                        <button key={btn.id} onClick={() => onNavigate(btn.id)} className="flex flex-col items-center gap-4 p-6 rounded-3xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/50 transition-all group active:scale-95 shadow-sm">
                            <div className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-blue-600 group-hover:shadow-md transition-all">
                                <btn.icon size={24} />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 group-hover:text-slate-900">{btn.label}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>

        <div className="bg-slate-900 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-full h-full bg-blue-600 opacity-10 group-hover:opacity-20 transition-opacity"></div>
            <div className="relative z-10 text-white">
                <h2 className="text-xl font-black mb-8 flex items-center gap-3">
                    <div className="w-2 h-8 bg-blue-500 rounded-full"></div>
                    Quick Actions
                </h2>
                <div className="space-y-4">
                    <button
                        onClick={() => onNavigate('admin-student-form')}
                        className="w-full p-5 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-2xl transition-all text-left flex items-center justify-between group/btn border border-white/5"
                    >
                        <div>
                            <p className="font-black text-white text-sm">Register Student</p>
                            <p className="text-[10px] text-blue-200/50 font-bold uppercase tracking-widest mt-1">New enrollment</p>
                        </div>
                        <ArrowRight size={18} className="translate-x-0 group-hover/btn:translate-x-2 transition-transform" />
                    </button>
                    <button
                        onClick={() => onNavigate('admin-teacher-form')}
                        className="w-full p-5 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-2xl transition-all text-left flex items-center justify-between group/btn border border-white/5"
                    >
                        <div>
                            <p className="font-black text-white text-sm">Onboard Faculty</p>
                            <p className="text-[10px] text-blue-200/50 font-bold uppercase tracking-widest mt-1">Staff directory</p>
                        </div>
                        <ArrowRight size={18} className="translate-x-0 group-hover/btn:translate-x-2 transition-transform" />
                    </button>
                    <button
                        onClick={() => onNavigate('admin-announcements')}
                        className="w-full p-5 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-2xl transition-all text-left flex items-center justify-between group/btn border border-white/5"
                    >
                        <div>
                            <p className="font-black text-white text-sm">Publish Bulletin</p>
                            <p className="text-[10px] text-blue-200/50 font-bold uppercase tracking-widest mt-1">Broad notice</p>
                        </div>
                        <ArrowRight size={18} className="translate-x-0 group-hover/btn:translate-x-2 transition-transform" />
                    </button>
                </div>
                
                <div className="mt-12 p-6 bg-blue-600 rounded-3xl shadow-lg ring-4 ring-blue-500/20">
                    <p className="text-xs font-black uppercase tracking-widest mb-2">Admin Reports</p>
                    <p className="text-sm font-bold leading-relaxed mb-4">
                        View academic reports, student rankings, and term performance across all classes.
                    </p>
                    <button
                        onClick={() => onNavigate('admin-reports')}
                        className="w-full py-2 bg-white/20 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-white/30 transition"
                    >
                        Open Reports →
                    </button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

const Package = (props: any) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.27 6.96 8.73 5.05 8.73-5.05"/><path d="M12 22.08V12"/></svg>
);
