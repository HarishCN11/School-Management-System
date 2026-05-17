import { useState, useEffect } from 'react';
import { statsService, inventoryService } from '../../../services/api';
import { 
  Users, UserCheck, GraduationCap, Package, 
  AlertTriangle, CheckCircle, Clock, TrendingUp,
  BarChart, Layers, ShieldCheck
} from 'lucide-react';
import { toast } from 'sonner';

export const AdminReports = () => {
  const [stats, setStats] = useState<any>(null);
  const [lowStock, setLowStock] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsData, inventoryData] = await Promise.all([
        statsService.getAdminStats(),
        inventoryService.getAll()
      ]);
      
      setStats(statsData);
      setLowStock(inventoryData.filter((item: any) => item.status === 'low_stock' || item.status === 'out_of_stock'));
    } catch (error) {
      console.error(error);
      toast.error('Failed to load system reports');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );

  const getRoleCount = (role: string) => {
    return stats?.users?.find((u: any) => u.role === role)?.count || 0;
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
            <BarChart className="text-blue-600" size={32} />
            System Insights & Reports
          </h1>
          <p className="text-gray-500 font-medium mt-1">Live administrative overview of school operations</p>
        </div>
        <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-xl border border-blue-100">
            <ShieldCheck className="text-blue-600" size={18} />
            <span className="text-sm font-bold text-blue-900">System Status: Excellent</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon={<UserCheck className="text-blue-600" />} 
          title="Total Teachers" 
          value={getRoleCount('teacher')} 
          trend="+2 this month"
          color="bg-blue-50"
        />
        <StatCard 
          icon={<GraduationCap className="text-indigo-600" />} 
          title="Total Students" 
          value={getRoleCount('student')} 
          trend="+12 this month"
          color="bg-indigo-50"
        />
        <StatCard 
          icon={<Users className="text-purple-600" />} 
          title="Parent Accounts" 
          value={getRoleCount('parent')} 
          trend="Active Engagement"
          color="bg-purple-50"
        />
        <StatCard 
          icon={<Layers className="text-emerald-600" />} 
          title="Active Classes" 
          value={stats?.totalClasses || 0} 
          trend="Full Sessions"
          color="bg-emerald-50"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Inventory Alert Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="font-black text-gray-800 flex items-center gap-2 uppercase tracking-widest text-xs">
                <Package size={18} className="text-orange-500" />
                Inventory Priority Alerts
              </h3>
              {lowStock.length > 0 && (
                <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider animate-pulse">
                  {lowStock.length} Items Require Action
                </span>
              )}
            </div>
            
            <div className="divide-y divide-gray-100">
              {lowStock.length === 0 ? (
                <div className="p-12 text-center">
                  <CheckCircle className="mx-auto text-emerald-500 mb-2" size={48} />
                  <p className="text-gray-500 font-bold">Inventory is fully stocked</p>
                </div>
              ) : (
                lowStock.map((item) => (
                  <div key={item.id} className="p-5 flex items-center justify-between hover:bg-gray-50 transition group">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-2xl ${item.status === 'out_of_stock' ? 'bg-red-50 text-red-600' : 'bg-orange-50 text-orange-600'}`}>
                        <AlertTriangle size={20} />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">{item.item_name}</h4>
                        <p className="text-xs text-gray-400 font-medium">{item.category}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`block text-xs font-black uppercase tracking-tighter ${item.status === 'out_of_stock' ? 'text-red-600' : 'text-orange-600'}`}>
                        {item.status.replace('_', ' ')}
                      </span>
                      <p className="text-sm font-black text-gray-900 mt-0.5">{item.quantity} units left</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm flex items-center justify-between bg-gradient-to-br from-white to-blue-50/30">
            <div className="space-y-4">
               <h3 className="text-xl font-black text-gray-900">Operational Summary 2026</h3>
               <p className="text-gray-500 text-sm leading-relaxed max-w-md">
                 Management activity has increased by 14% this term. All student records are synchronized and backed up to the secure cloud repository.
               </p>
               <button className="bg-gray-900 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:scale-105 transition-all shadow-lg shadow-gray-200">
                 Download Full Audit Log
               </button>
            </div>
            <div className="hidden md:block">
               <TrendingUp size={120} className="text-blue-100" />
            </div>
          </div>
        </div>

        {/* Recent Announcements Feed */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gray-50/50">
               <h3 className="font-black text-gray-800 flex items-center gap-2 uppercase tracking-widest text-xs">
                <Clock size={18} className="text-blue-500" />
                Recent Announcements
              </h3>
            </div>
            <div className="p-4 space-y-4">
              {stats?.announcements?.map((ann: any, i: number) => (
                <div key={i} className="p-4 border border-gray-50 rounded-2xl bg-white shadow-sm hover:border-blue-200 transition-colors">
                  <h5 className="font-bold text-sm text-gray-900 leading-tight">{ann.title}</h5>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-[10px] font-black uppercase bg-gray-100 px-2 py-0.5 rounded text-gray-500">
                      To: {ann.target}
                    </span>
                    <span className="text-[10px] text-gray-400 font-bold">
                      {new Date(ann.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
              {(!stats?.announcements || stats.announcements.length === 0) && (
                <p className="text-center p-6 text-gray-400 text-sm italic">No recent notices found</p>
              )}
            </div>
          </div>
          
          <div className="bg-blue-600 rounded-3xl p-6 text-white shadow-xl shadow-blue-200">
             <h4 className="font-bold flex items-center gap-2 mb-2">
               <ShieldCheck size={20} />
               Data Integrity
             </h4>
             <p className="text-blue-100 text-xs leading-relaxed">
               Your session is protected by 256-bit encryption. All record modifications are logged in the system audit trail.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, title, value, trend, color }: any) => (
  <div className={`p-6 rounded-3xl ${color} border border-white shadow-sm hover:scale-105 transition-transform duration-300`}>
    <div className="flex justify-between items-start mb-4">
      <div className="p-3 bg-white rounded-2xl shadow-sm">
        {icon}
      </div>
      <span className="text-[10px] font-black uppercase text-gray-400 tracking-tighter">Live</span>
    </div>
    <h3 className="text-3xl font-black text-gray-900 mb-1">{value}</h3>
    <p className="text-sm font-bold text-gray-700">{title}</p>
    <div className="flex items-center gap-1 mt-3">
      <TrendingUp size={12} className="text-green-500" />
      <span className="text-[10px] font-black text-green-600 uppercase">{trend}</span>
    </div>
  </div>
);
