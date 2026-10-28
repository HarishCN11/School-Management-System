// ... imports (kept partially, need to ensure all imports are present)
import { useEffect, useState } from 'react';
import { Plus, Megaphone, Trash2, Calendar, Clock, X, Paperclip, Download } from 'lucide-react';
import { announcementService, getAssetUrl } from '../../../services/api';
import { toast } from 'sonner';

export const AdminAnnouncements = () => {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [targetRole, setTargetRole] = useState('all');
  const [displayUntil, setDisplayUntil] = useState('');
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const data = await announcementService.getAll();
      setAnnouncements(data);
    } catch (error) {
      toast.error('Failed to load announcements');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Create FormData for file upload
    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    formData.append('target_role', targetRole);
    if (displayUntil) formData.append('display_until', displayUntil);
    if (file) formData.append('file', file);

    try {
      await announcementService.create(formData);
      toast.success('Announcement posted successfully');
      setShowModal(false);

      // Reset Form
      setTitle('');
      setContent('');
      setTargetRole('all');
      setDisplayUntil('');
      setFile(null);

      fetchAnnouncements();
    } catch (error) {
      toast.error('Failed to post announcement');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Remove this announcement?')) {
      try {
        await announcementService.delete(id);
        toast.success('Announcement removed');
        fetchAnnouncements();
      } catch (error) {
        toast.error('Failed to remove announcement');
      }
    }
  };

  const getTargetLabel = (role: string) => {
    switch (role) {
      case 'all': return 'All Users';
      case 'student': return 'Students Only';
      case 'teacher': return 'Teachers Only';
      case 'parent': return 'Parents Only';
      case 'admin': return 'Admins Only';
      default: return role;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'all': return 'bg-purple-100 text-purple-700';
      case 'student': return 'bg-blue-100 text-blue-700';
      case 'teacher': return 'bg-orange-100 text-orange-700';
      case 'parent': return 'bg-pink-100 text-pink-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Bulletins & News</h1>
          <p className="text-gray-500 mt-1">Manage school-wide announcements and notices</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-5 py-2.5 rounded-xl hover:shadow-lg hover:shadow-indigo-500/30 transition-all active:scale-95"
        >
          <Plus size={20} />
          <span>Post Announcement</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <p className="text-gray-500 col-span-full text-center py-10">Loading bulletins...</p>
        ) : announcements.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-16 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
            <Megaphone size={40} className="text-gray-300 mb-4" />
            <p className="text-gray-500 font-medium">No active announcements</p>
          </div>
        ) : (
          announcements.map(item => (
            <div key={item.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col hover:border-violet-200 transition group relative overflow-hidden">
              <div className={`absolute top-0 right-0 px-3 py-1 rounded-bl-xl text-xs font-bold uppercase tracking-wider ${getRoleBadgeColor(item.target_role)}`}>
                {getTargetLabel(item.target_role)}
              </div>

              <div className="mb-4">
                <h3 className="text-lg font-bold text-gray-900 line-clamp-2 leading-tight">{item.title}</h3>
                <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                  <Calendar size={12} />
                  <span>Posted: {new Date(item.created_at).toLocaleDateString()}</span>
                  {item.display_until && (
                    <>
                      <span className="mx-1">•</span>
                      <Clock size={12} />
                      <span>Until: {new Date(item.display_until).toLocaleDateString()}</span>
                    </>
                  )}
                </div>
              </div>

              <p className="text-gray-600 text-sm mb-6 flex-grow whitespace-pre-line line-clamp-4">
                {item.content}
              </p>

              {item.file_path && (
                <div className="mb-4">
                  <a
                    href={getAssetUrl(item.file_path)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 bg-blue-50 p-2 rounded-lg transition"
                  >
                    <Download size={16} />
                    Download Attachment
                  </a>
                </div>
              )}

              <div className="pt-4 border-t border-gray-50 flex justify-between items-center">
                <span className="text-xs text-gray-400">ID: #{item.id}</span>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-lg transition"
                  title="Delete Announcement"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">
                New Announcement
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-violet-100 focus:border-violet-400 outline-none transition"
                  placeholder="e.g. Sports Day Schedule"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                <textarea
                  required
                  rows={4}
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-violet-100 focus:border-violet-400 outline-none transition resize-none"
                  placeholder="Details about the announcement..."
                />
              </div>

              {/* File Upload Attachment */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Attachment (PDF/Image)</label>
                <div className="relative border border-gray-200 rounded-lg p-2 focus-within:ring-2 focus-within:ring-violet-100 transition">
                  <input
                    type="file"
                    onChange={e => setFile(e.target.files ? e.target.files[0] : null)}
                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Target Audience</label>
                  <select
                    value={targetRole}
                    onChange={e => setTargetRole(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-violet-100 focus:border-violet-400 outline-none transition"
                  >
                    <option value="all">Everyone</option>
                    <option value="student">Students</option>
                    <option value="teacher">Teachers</option>
                    <option value="parent">Parents</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Display Until</label>
                  <input
                    type="date"
                    value={displayUntil}
                    onChange={e => setDisplayUntil(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-violet-100 focus:border-violet-400 outline-none transition"
                  />
                </div>
              </div>


              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-50">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-50 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-medium rounded-lg hover:shadow-lg hover:shadow-indigo-500/20 transition-all"
                >
                  Post Now
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
