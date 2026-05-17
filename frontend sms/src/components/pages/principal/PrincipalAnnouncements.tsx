import { useState, useEffect } from 'react';
import { 
  Megaphone, 
  Trash2, 
  Loader2, 
  ArrowLeft,
  Calendar,
  FileText,
  Send,
  X,
  PlusCircle
} from 'lucide-react';
import { announcementService } from '../../../services/api';
import { toast } from 'sonner';

export const PrincipalAnnouncements = ({ onNavigate }: any) => {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    target_role: 'All',
    file: null as File | null
  });

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const data = await announcementService.getAll();
      setAnnouncements(data);
    } catch (error) {
      console.error('Error fetching announcements:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const postData = new FormData();
      postData.append('title', formData.title);
      postData.append('content', formData.content);
      postData.append('target_role', formData.target_role);
      if (formData.file) {
        postData.append('file', formData.file);
      }

      await announcementService.create(postData);
      toast.success('Announcement posted successfully!');
      setShowForm(false);
      setFormData({ title: '', content: '', target_role: 'All', file: null });
      fetchAnnouncements();
    } catch (error: any) {
      toast.error('Failed to post announcement');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this announcement?')) return;
    try {
      await announcementService.delete(id);
      toast.success('Deleted');
      fetchAnnouncements();
    } catch (error) {
      toast.error('Error deleting');
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
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => onNavigate('principal-dashboard')} className="p-2 hover:bg-gray-100 rounded-full transition">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-2xl font-black text-gray-900">Communication Hub</h1>
        </div>
        {!showForm && (
          <button 
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-blue-700 transition shadow-xl shadow-blue-100"
          >
            <PlusCircle size={20} />
            Post New Alert
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-white rounded-3xl shadow-2xl border border-blue-100 p-8 animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Publish Announcement</h2>
            <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-red-500">
              <X size={24} />
            </button>
          </div>
          <form onSubmit={handlePost} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 uppercase">Headline Title</label>
                <input 
                  required
                  className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                  placeholder="e.g., Annual Sports Day 2026"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 uppercase">Target Audience</label>
                <select 
                  className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-gray-700"
                  value={formData.target_role}
                  onChange={(e) => setFormData({...formData, target_role: e.target.value})}
                >
                  <option value="All">Everyone (Students, Teachers, Parents)</option>
                  <option value="Teacher">Faculty Only</option>
                  <option value="Student">Students Only</option>
                  <option value="Parent">Parents Only</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 uppercase">Content / Body</label>
              <textarea 
                required
                rows={4}
                className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                placeholder="Details of the announcement..."
                value={formData.content}
                onChange={(e) => setFormData({...formData, content: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 uppercase">Attachment (Optional)</label>
              <div className="flex items-center gap-4">
                 <input 
                   type="file" 
                   className="hidden" 
                   id="ann-file" 
                   onChange={(e) => setFormData({...formData, file: e.target.files ? e.target.files[0] : null})}
                 />
                 <label 
                   htmlFor="ann-file"
                   className="flex items-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl cursor-pointer transition font-bold text-gray-600 text-sm"
                 >
                   <FileText size={18} />
                   {formData.file ? formData.file.name : 'Choose File'}
                 </label>
              </div>
            </div>
            <div className="flex justify-end pt-4">
              <button 
                disabled={submitting}
                className="bg-blue-600 text-white px-10 py-4 rounded-2xl font-bold flex items-center gap-2 hover:bg-blue-700 transition shadow-xl shadow-blue-200 disabled:opacity-50"
              >
                {submitting ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                Confirm & Publish
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-6">
        <h2 className="text-xl font-bold text-gray-900 border-b pb-2">Recent Broadcasts</h2>
        <div className="grid grid-cols-1 gap-6">
          {announcements.map((ann, idx) => (
            <div key={idx} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col md:flex-row gap-6 hover:shadow-md transition group">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shrink-0">
                <Megaphone size={32} />
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-bold text-gray-900">{ann.title}</h3>
                    <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest">{ann.target_role}</span>
                  </div>
                  <div className="flex items-center gap-4 text-xs font-bold text-gray-400">
                    <div className="flex items-center gap-1">
                      <Calendar size={14} />
                      {new Date(ann.created_at).toLocaleDateString()}
                    </div>
                    {/* Only show delete if they have permission, assuming principal has here */}
                    <button onClick={() => handleDelete(ann.id)} className="text-gray-300 hover:text-red-500 transition">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <p className="text-gray-600 leading-relaxed font-medium">{ann.content}</p>
                {ann.file_path && (
                  <a 
                    href={`http://localhost:3000${ann.file_path}`} 
                    target="_blank" 
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 text-blue-600 font-bold text-sm bg-blue-50 px-4 py-2 rounded-xl mt-2 hover:bg-blue-100 transition"
                  >
                    <FileText size={16} />
                    View Attachment
                  </a>
                )}
              </div>
            </div>
          ))}

          {announcements.length === 0 && (
            <div className="py-20 text-center bg-gray-50 rounded-3xl border-2 border-dashed border-gray-100">
               <Megaphone className="mx-auto text-gray-200 mb-4" size={48} />
               <p className="text-gray-500 font-bold">No announcements published yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
