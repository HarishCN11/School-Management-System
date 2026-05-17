import { useEffect, useState } from 'react';
import {
  Users,
  BookOpen,
  TrendingUp,
  MessageSquare,
  Award,
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import { feedbackService } from '../../../services/api';
import { toast } from 'sonner';

export const ParentDashboard = ({ onNavigate }: any) => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await feedbackService.getChildStats();
        setStats(data);
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Failed to load child statistics');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Parent Dashboard</h1>
          <p className="text-gray-500">Welcome back! Monitoring <span className="font-semibold text-blue-600">{stats.student.name}'s</span> academic journey.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onNavigate('parent-communication')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-medium shadow-md shadow-blue-200"
          >
            <MessageSquare size={18} />
            Contact Teachers
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
              <Users size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Current Class</p>
              <h3 className="text-xl font-bold text-gray-900">{stats.student.class || 'N/A'}</h3>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-50 rounded-xl text-amber-600">
              <Award size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Recent Exam Score</p>
              <h3 className="text-xl font-bold text-gray-900">
                {stats.recentResults[0] ? `${stats.recentResults[0].marks_obtained}/${stats.recentResults[0].total_marks}` : 'N/A'}
              </h3>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-50 rounded-xl text-purple-600">
              <BookOpen size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Class Teachers</p>
              <h3 className="text-xl font-bold text-gray-900">{stats.teachers.length}</h3>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Academic Performance */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-50 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <TrendingUp className="text-blue-600" size={20} />
              Recent Academic Performance
            </h2>
            <button
              onClick={() => onNavigate('parent-reports')}
              className="text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              View Full Report
            </button>
          </div>
          <div className="p-6">
            {stats.recentResults.length > 0 ? (
              <div className="space-y-4">
                {stats.recentResults.map((result: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <div>
                      <h4 className="font-bold text-gray-900">{result.subject_name}</h4>
                      <p className="text-xs text-gray-500 uppercase tracking-wider">{result.exam_name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-blue-600">{result.marks_obtained}/{result.total_marks}</p>
                      <div className="w-24 h-1.5 bg-gray-200 rounded-full mt-1 overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full"
                          style={{ width: `${(result.marks_obtained / result.total_marks) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <div className="p-3 bg-gray-50 rounded-full w-fit mx-auto mb-3">
                  <AlertCircle className="text-gray-400" size={24} />
                </div>
                <p className="text-gray-500">No exam results available yet.</p>
              </div>
            )}
          </div>
        </div>

        {/* Teachers Information */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-50">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Users className="text-emerald-600" size={20} />
              Class Teachers
            </h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 gap-4">
              {stats.teachers.map((teacher: any) => (
                <div key={teacher.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:border-blue-200 hover:bg-blue-50/30 transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                      {teacher.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">{teacher.name}</h4>
                      <p className="text-sm text-gray-500">{teacher.subject}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => onNavigate('parent-communication')}
                    className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
