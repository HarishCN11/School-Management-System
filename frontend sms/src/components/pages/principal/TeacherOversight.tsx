import { useState, useEffect } from 'react';
import { teacherService } from '../../../services/api';
import { 
  Users, 
  ArrowLeft, 
  Loader2, 
  GraduationCap, 
  Mail, 
  Phone, 
  BookOpen,
  UserCheck
} from 'lucide-react';

export const TeacherOversight = ({ onNavigate }: any) => {
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      const data = await teacherService.getAll();
      setTeachers(data);
    } catch (error) {
      console.error('Error fetching teachers:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-blue-600" size={48} />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => onNavigate('principal-dashboard')} className="p-2 hover:bg-gray-100 rounded-full transition">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Faculty Oversight</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {teachers.map((teacher, idx) => (
          <div key={idx} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition">
            <div className="flex items-start gap-6">
              <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-purple-100">
                <Users size={40} />
              </div>
              <div className="flex-1 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{teacher.name}</h3>
                    <p className="text-sm font-semibold text-purple-600">{teacher.specialization}</p>
                  </div>
                  <div className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                    <UserCheck size={12} />
                    Active
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4 pt-2">
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <Mail size={16} className="text-gray-400" />
                    {teacher.email}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <Phone size={16} className="text-gray-400" />
                    {teacher.phone_number}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <GraduationCap size={16} className="text-gray-400" />
                    {teacher.qualification}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <BookOpen size={16} className="text-gray-400" />
                    ID: {teacher.id}
                  </div>
                </div>

                {teacher.managed_class_id && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-500 uppercase">Class Responsibility</span>
                    <span className="text-sm font-bold text-gray-900">Class ID: {teacher.managed_class_id}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
