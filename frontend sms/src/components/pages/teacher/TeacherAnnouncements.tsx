import React, { useState, useEffect } from 'react';
import { announcementService, academicService, teacherPortalService } from '../../../services/api';
import { toast } from 'sonner';
import { Bell, Plus, X, Send } from 'lucide-react';

export const TeacherAnnouncements = ({ onNavigate }: any) => {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [targetRole, setTargetRole] = useState('Student');
  const [targetClass, setTargetClass] = useState('');
  const [classes, setClasses] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await announcementService.getAll();
        setAnnouncements(data);

        // Get only classes taught by this teacher
        const subjectsData = await teacherPortalService.getMySubjects();
        if (subjectsData && subjectsData.length > 0) {
          const uniqueClasses = Array.from(new Set(subjectsData.map((item: any) => item.class_id)))
            .map(id => {
              const match = subjectsData.find((item: any) => item.class_id === id);
              return { id, name: match.class_name };
            });
          setClasses(uniqueClasses);
        } else {
          // Fallback to all classes
          const allCls = await academicService.getAllClasses();
          setClasses(allCls);
        }
      } catch (error) {
        console.error(error);
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      const teacherId = localStorage.getItem('roleId');

      await announcementService.create({
        title,
        content,
        target_role: targetRole,
        class_id: targetClass || null,
        posted_by: teacherId || 0
      });

      toast.success('Announcement Posted Successfully');
      setShowForm(false);
      setTitle('');
      setContent('');
      // Reload data
      const data = await announcementService.getAll();
      setAnnouncements(data);
    } catch (error) {
      console.error(error);
      toast.error('Failed to post announcement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Announcements</h1>
          <p className="text-gray-500">Post updates for your students.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-600/20"
        >
          {showForm ? <X size={20} /> : <Plus size={20} />}
          {showForm ? 'Cancel' : 'Create Announcement'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 animate-in slide-in-from-top-4">
          <h3 className="text-lg font-bold text-gray-900 mb-4">New Announcement</h3>
          <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Exam Schedule Update"
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Target Audience</label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-400 font-bold uppercase block mb-1">Role</label>
                  <select
                    value={targetRole}
                    onChange={e => setTargetRole(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="All">All Roles</option>
                    <option value="Student">Student</option>
                    <option value="Parent">Parent</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-400 font-bold uppercase block mb-1">Grade/Class (Optional)</label>
                  <select
                    value={targetClass}
                    onChange={e => setTargetClass(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="">Specific Grade Only</option>
                    {classes.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
              <textarea
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder="Write your message here..."
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none h-32"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Send size={18} />
              {loading ? 'Posting...' : 'Post Announcement'}
            </button>
          </form>
        </div>
      )}

      {/* List Recent */}
      <div className="space-y-4">
        {announcements.map((ann) => (
          <div key={ann.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-bold text-gray-900">{ann.title}</h3>
              <span className="text-xs bg-gray-100 px-2 py-1 rounded-full text-gray-600">
                {new Date(ann.created_at).toLocaleDateString()}
              </span>
            </div>
            <p className="text-gray-600 text-sm mb-3">{ann.content}</p>
            <div className="flex items-center gap-2 text-xs text-blue-600 font-medium">
              <span className="bg-blue-50 px-2 py-1 rounded-md">Target: {ann.role_target || ann.target_role}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
