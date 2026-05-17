import { useState, useEffect } from 'react';
import { 
  Users,
  GraduationCap, 
  Package, 
  Megaphone, 
  ArrowRight,
  Loader2,
  TrendingUp,
  MessageSquare,
  Clock
} from 'lucide-react';
import { principalService } from '../../../services/api';

export const PrincipalDashboard = ({ onNavigate }: any) => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const data = await principalService.getStats();
      setStats(data);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { title: 'Total Students', value: stats?.students || 0, icon: GraduationCap, color: 'bg-blue-500', link: 'principal-reports', label: 'Student Data' },
    { title: 'Faculty Members', value: stats?.teachers || 0, icon: Users, color: 'bg-purple-500', link: 'principal-teacher-oversight', label: 'Management' },
    { title: 'Active Classes', value: stats?.classes || 0, icon: TrendingUp, color: 'bg-emerald-500', link: 'principal-school-analytics', label: 'Academic Structure' },
    { title: 'Inventory Items', value: stats?.inventory || 0, icon: Package, color: 'bg-orange-500', link: 'principal-school-analytics', label: 'Resource Tracking' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-blue-600" size={48} />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Principal Oversight Dashboard</h1>
          <p className="text-gray-500 mt-1">Welcome back. Here's a snapshot of the school's current status.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => onNavigate('principal-announcements')}
            className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-200"
          >
            <Megaphone size={18} />
            Post Announcement
          </button>
          <button 
            onClick={() => onNavigate('principal-feedback')}
            className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-5 py-2.5 rounded-xl font-bold hover:bg-gray-50 transition"
          >
            <MessageSquare size={18} />
            Contact Admin
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, idx) => (
          <div key={idx} className="group bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-start justify-between mb-4">
              <div className={`${card.color} p-4 rounded-2xl text-white shadow-lg`}>
                <card.icon size={28} />
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">{card.label}</p>
                <p className="text-3xl font-black text-gray-900 mt-1">{card.value}</p>
              </div>
            </div>
            <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-900">{card.title}</span>
              <button 
                onClick={() => onNavigate(card.link)}
                className="text-blue-600 hover:text-blue-800 p-1.5 hover:bg-blue-50 rounded-lg transition"
              >
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Actions */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Clock className="text-blue-600" size={20} />
            Recent Announcements
          </h2>
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-2 overflow-hidden">
             {/* We can fetch recent announcements here later or just link */}
             <div className="p-8 text-center">
                <Megaphone className="mx-auto text-gray-200 mb-4" size={48} />
                <p className="text-gray-500 font-medium italic">Check official announcements to stay updated with administrative changes.</p>
                <button 
                  onClick={() => onNavigate('principal-announcements')}
                  className="mt-4 text-blue-600 font-bold hover:underline"
                >
                  View All Announcements
                </button>
             </div>
          </div>
        </div>

        {/* Informational Panel */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-gray-900">Administrative Tasks</h2>
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-6 text-white shadow-xl shadow-blue-200">
            <h3 className="font-bold text-lg mb-2">System Support</h3>
            <p className="text-blue-100 text-sm mb-6 leading-relaxed">
              If you encounter any technical issues or need specific data reports not found here, please use the Message Admin feature.
            </p>
            <button 
               onClick={() => onNavigate('principal-feedback')}
               className="w-full bg-white/20 backdrop-blur-md hover:bg-white/30 text-white py-3 rounded-2xl font-bold transition flex items-center justify-center gap-2 border border-white/20"
            >
              <MessageSquare size={18} />
              Message Administrator
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
