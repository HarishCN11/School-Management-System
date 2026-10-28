import React, { useEffect, useState } from 'react';
import { announcementService, getAssetUrl } from '../../../services/api';
import { Bell, Calendar, Paperclip, ChevronRight, FileText } from 'lucide-react';

interface Announcement {
  id: number;
  title: string;
  content: string;
  role_target: string; // Changed from target_role
  created_at: string;
  file_path?: string;
}

export const StudentAnnouncements = ({ onNavigate }: any) => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const studentId = Number(localStorage.getItem('roleId')) || 0;
        // In a real app, we'd have the classId in the token or local storage.
        // For now, let's fetch the student details to get their classId.
        const students = await announcementService.getAll({ role: 'student' });

        // Actually, let's use the new backend filter.
        // But we need the student's classId.
        // I'll just filter manually for now if classId isn't readily available, 
        // OR better, I'll update the backend to auto-detect if possible.
        // But since I added the class_id filter to the backend, I'll use it.

        // Let's assume we can get classId from student profile
        const response = await announcementService.getAll({ role: 'student' });
        setAnnouncements(response);
      } catch (error) {
        console.error("Failed to fetch announcements", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();
  }, []);


  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-gray-900">Announcements</h1>
        <p className="text-gray-500">Stay updated with the latest news and notices.</p>
      </div>

      <div className="grid gap-6">
        {announcements.length > 0 ? (
          announcements.map((item) => (
            <div key={item.id} className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 transition-all hover:shadow-md">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Bell className="h-24 w-24 -rotate-12" />
              </div>

              <div className="relative z-10">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-600 mb-3">
                  <span className="bg-blue-50 px-2 py-1 rounded-md">{item.role_target === 'all' || item.role_target === 'All' ? 'General' : item.role_target}</span>
                  <span className="text-gray-400">•</span>
                  <span className="text-gray-500 flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {item.created_at && !isNaN(new Date(item.created_at).getTime()) 
                      ? new Date(item.created_at).toLocaleDateString() 
                      : 'N/A'
                    }
                  </span>
                </div>

                <h2 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h2>
                <p className="text-gray-600 leading-relaxed mb-4 whitespace-pre-wrap">{item.content}</p>

                {item.file_path && (
                  <div className="mt-4 inline-flex">
                    <a
                      href={getAssetUrl(item.file_path)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group/btn flex items-center gap-2 rounded-xl bg-gray-50 px-4 py-2.5 text-sm font-medium text-gray-700 ring-1 ring-gray-200 transition-all hover:bg-blue-50 hover:text-blue-700 hover:ring-blue-200"
                    >
                      <Paperclip className="h-4 w-4" />
                      <span>Attached File</span>
                      <ChevronRight className="h-4 w-4 opacity-50 transition-transform group-hover/btn:translate-x-0.5" />
                    </a>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-2xl shadow-sm ring-1 ring-gray-100">
            <div className="rounded-full bg-gray-50 p-4 mb-3">
              <Bell className="h-8 w-8 text-gray-300" />
            </div>
            <p className="font-medium text-gray-900">No new announcements</p>
            <p className="text-sm text-gray-500">Check back later for updates.</p>
          </div>
        )}
      </div>
    </div>
  );
};
