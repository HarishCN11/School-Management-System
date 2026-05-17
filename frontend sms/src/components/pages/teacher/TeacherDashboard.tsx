import React, { useEffect, useState } from 'react';
import {
  BookOpen, Users, Clock, ArrowRight, GraduationCap, Mail,
  FileText, MessageSquare, Megaphone, Package, ChevronRight
} from 'lucide-react';
import { academicService, teacherPortalService, reportService } from '../../../services/api';
import { toast } from 'sonner';

export const TeacherDashboard = ({ onNavigate }: any) => {
  const [managedClass, setManagedClass] = useState<any>(null);
  const [teacherStats, setTeacherStats] = useState({ classes: 0, students: 0, pendingMarks: 0 });
  const [loading, setLoading] = useState(true);
  const teacherId = Number(localStorage.getItem('roleId')) || 0;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, managedClassData] = await Promise.all([
          academicService.getTeacherStats(teacherId),
          teacherPortalService.getManagedClassDetails(),
        ]);
        setTeacherStats({
          classes: statsData.classes || 0,
          students: statsData.students || 0,
          pendingMarks: statsData.pendingMarks || 0,
        });
        if (managedClassData.isClassTeacher) {
          setManagedClass(managedClassData);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast.error('Failed to load teacher statistics');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [teacherId]);

  const stats = [
    { label: 'My Managed Class', value: managedClass?.classInfo?.name || '-', icon: GraduationCap, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Total Students', value: teacherStats.students, icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Pending Marks', value: teacherStats.pendingMarks, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  const quickLinks = [
    { label: 'Study Materials', id: 'teacher-materials', icon: BookOpen, desc: 'Upload & manage learning resources', color: 'bg-blue-600' },
    { label: 'Assignments', id: 'teacher-instructions', icon: FileText, desc: 'Create & track assignments', color: 'bg-emerald-600' },
    { label: 'Grading', id: 'teacher-submissions', icon: GraduationCap, desc: 'Review student submissions', color: 'bg-purple-600' },
    { label: 'Term Reports', id: 'teacher-reports', icon: FileText, desc: 'Enter marks & view rankings', color: 'bg-amber-600' },
    { label: 'Parent Feedback', id: 'teacher-feedback', icon: MessageSquare, desc: 'View messages from parents', color: 'bg-rose-600' },
    { label: 'Announcements', id: 'teacher-announcements', icon: Megaphone, desc: 'Post class announcements', color: 'bg-indigo-600' },
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div>
        <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none mb-2">Teacher Portal</h1>
        <p className="text-slate-500 font-bold tracking-tight">
          {managedClass ? `Class Teacher — ${managedClass.classInfo.name}` : 'Academic oversight & student progress tracking'}
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-7 rounded-[2rem] shadow-sm border border-slate-100 group hover:shadow-lg transition-all duration-300">
            <div className="flex items-center gap-5">
              <div className={`${stat.bg} p-4 rounded-2xl group-hover:scale-110 transition-transform`}>
                <stat.icon className={stat.color} size={28} />
              </div>
              <div>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                <p className="text-3xl font-black text-slate-900">{loading ? '...' : stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Navigation Tools (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-3">
            <div className="w-2 h-8 bg-blue-600 rounded-full"></div>
            Portal Sections
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {quickLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => onNavigate(link.id)}
                className="flex items-center gap-5 p-5 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-lg hover:border-blue-100 transition-all duration-200 active:scale-95 text-left group"
              >
                <div className={`${link.color} p-3 rounded-2xl text-white group-hover:scale-110 transition-transform flex-shrink-0`}>
                  <link.icon size={22} />
                </div>
                <div className="flex-1">
                  <p className="font-black text-slate-800 text-sm">{link.label}</p>
                  <p className="text-xs text-slate-400 font-medium">{link.desc}</p>
                </div>
                <ChevronRight size={16} className="text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
              </button>
            ))}
          </div>
        </div>

        {/* Managed Class Summary (1/3 width) */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 h-fit">
          <h2 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-3">
            <div className="w-2 h-8 bg-indigo-500 rounded-full"></div>
            My Class
          </h2>

          {loading ? (
            <p className="text-slate-400 font-bold italic">Loading...</p>
          ) : managedClass ? (
            <div className="space-y-5">
              <div className="p-5 bg-blue-50 rounded-3xl border border-blue-100">
                <p className="text-xs font-black text-blue-400 uppercase tracking-widest mb-1">Assigned Class</p>
                <p className="text-2xl font-black text-blue-900">{managedClass.classInfo.name}</p>
                {managedClass.classInfo.room_number && managedClass.classInfo.room_number !== 'TBA' && (
                  <p className="text-sm text-blue-500 font-bold mt-1">Room {managedClass.classInfo.room_number}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Students</p>
                  <p className="text-3xl font-black text-slate-900">{managedClass.studentCount}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Resources</p>
                  <p className="text-3xl font-black text-slate-900">{managedClass.inventory?.length || 0}</p>
                </div>
              </div>

              <button
                onClick={() => onNavigate('teacher-classes')}
                className="w-full py-3 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
              >
                View Full Class Details
                <ArrowRight size={14} />
              </button>
            </div>
          ) : (
            <div className="text-center py-8">
              <GraduationCap size={40} className="text-slate-200 mx-auto mb-3" />
              <p className="text-sm text-slate-400 font-bold">No class assigned yet</p>
              <p className="text-xs text-slate-300 mt-1">Contact the admin to be assigned as a class teacher</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
