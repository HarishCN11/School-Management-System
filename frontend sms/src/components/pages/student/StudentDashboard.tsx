import React, { useEffect, useState } from 'react';
import { BookOpen, FileText, Award, ChevronRight, Megaphone, GraduationCap, ArrowRight } from 'lucide-react';
import { academicService, assignmentService, reportService } from '../../../services/api';

export const StudentDashboard = ({ onNavigate }: any) => {
  const [statsData, setStatsData] = useState({ courses: 0, exams: 0, assignments: 0 });
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const studentId = Number(localStorage.getItem('roleId')) || 0;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [stats, assigns] = await Promise.all([
          academicService.getStudentStats(studentId),
          assignmentService.getStudentAssignments(studentId),
        ]);
        setStatsData({ courses: stats.courses || 0, exams: stats.exams || 0, assignments: assigns.length || 0 });
        // Show only pending assignments (not submitted)
        setAssignments(assigns.filter((a: any) => a.status !== 'submitted').slice(0, 3));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [studentId]);

  const statCards = [
    { label: 'Enrolled Courses', value: statsData.courses, icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-50', nav: 'student-courses' },
    { label: 'My Assignments', value: statsData.assignments, icon: FileText, color: 'text-orange-600', bg: 'bg-orange-50', nav: 'student-courses' },
    { label: 'My Reports', value: 'View →', icon: Award, color: 'text-green-600', bg: 'bg-green-50', nav: 'student-reports' },
  ];

  const quickLinks = [
    { label: 'My Subjects & Portals', desc: 'Access study materials, assignments per subject', nav: 'student-courses', icon: BookOpen, color: 'bg-blue-600' },
    { label: 'My Reports', desc: 'View term marks, averages and class rankings', nav: 'student-reports', icon: Award, color: 'bg-green-600' },
    { label: 'Announcements', desc: 'Stay updated with school notices', nav: 'student-announcements', icon: Megaphone, color: 'bg-indigo-600' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Student Dashboard</h1>
        <p className="text-gray-500 mt-1 font-medium">Welcome back! Here's your academic overview.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((stat, i) => (
          <div
            key={i}
            onClick={() => onNavigate(stat.nav)}
            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 cursor-pointer hover:border-blue-200 transition-all hover:shadow-md active:scale-95 group"
          >
            <div className="flex items-center gap-4">
              <div className={`${stat.bg} p-3 rounded-xl group-hover:scale-110 transition-transform`}>
                <stat.icon className={stat.color} size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                <p className="text-2xl font-black text-gray-900">{loading ? '...' : stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pending Assignments */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
              <FileText size={18} className="text-orange-500" />
              Pending Assignments
            </h2>
            <button
              onClick={() => onNavigate('student-courses')}
              className="text-xs font-black text-blue-600 uppercase tracking-widest hover:underline"
            >
              View All
            </button>
          </div>

          {loading ? (
            <p className="text-gray-400 italic text-sm">Loading...</p>
          ) : assignments.length > 0 ? (
            <div className="space-y-3">
              {assignments.map((a: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-4 bg-orange-50/50 border border-orange-100 rounded-xl">
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{a.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{a.subject_name} · Due: {a.due_date ? new Date(a.due_date).toLocaleDateString() : 'N/A'}</p>
                  </div>
                  <button
                    onClick={() => onNavigate('student-courses')}
                    className="text-xs font-black text-orange-600 hover:underline"
                  >
                    Submit
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText size={36} className="text-gray-200 mx-auto mb-2" />
              <p className="text-gray-400 font-medium text-sm">No pending assignments right now.</p>
            </div>
          )}
        </div>

        {/* Quick Links */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-black text-gray-900 mb-5 flex items-center gap-2">
            <GraduationCap size={18} className="text-blue-500" />
            Portal Sections
          </h2>
          <div className="space-y-3">
            {quickLinks.map((link, i) => (
              <button
                key={i}
                onClick={() => onNavigate(link.nav)}
                className="w-full flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all active:scale-95 text-left group"
              >
                <div className={`${link.color} p-2.5 rounded-xl text-white group-hover:scale-110 transition-transform flex-shrink-0`}>
                  <link.icon size={18} />
                </div>
                <div className="flex-1">
                  <p className="font-black text-gray-800 text-sm">{link.label}</p>
                  <p className="text-xs text-gray-400">{link.desc}</p>
                </div>
                <ArrowRight size={14} className="text-gray-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
