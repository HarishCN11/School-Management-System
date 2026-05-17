import React, { useEffect, useState } from 'react';
import {
  Send,
  MessageSquare,
  User,
  Users,
  Clock,
  CheckCircle2,
  Calendar,
  Search,
  Plus,
  ArrowRight
} from 'lucide-react';
import { feedbackService } from '../../../services/api';
import { toast } from 'sonner';

export const ParentCommunication = ({ onNavigate }: any) => {
  const [sentFeedback, setSentFeedback] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [received, stats] = await Promise.all([
        feedbackService.getParentSent(),
        feedbackService.getChildStats()
      ]);
      setSentFeedback(received);
      setTeachers(stats.teachers);
    } catch (error: any) {
      toast.error('Failed to load communication data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeacher || !message) {
      toast.error('Please select a teacher and enter a message');
      return;
    }

    setSubmitting(true);
    try {
      await feedbackService.submit({
        teacher_id: parseInt(selectedTeacher),
        message: message
      });
      toast.success('Feedback sent to teacher successfully');
      setMessage('');
      setSelectedTeacher('');
      setShowForm(false);
      fetchData(); // Refresh list
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to send feedback');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Teacher Communication</h1>
          <p className="text-gray-500">Send feedback and communicate with your child's teachers.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all shadow-lg ${showForm ? 'bg-gray-100 text-gray-700' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200'
            }`}
        >
          {showForm ? 'Cancel' : (
            <>
              <Plus size={20} />
              New Feedback
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Feedback History */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-4">
            <Clock size={22} className="text-blue-600" />
            Sent History
          </h2>

          {sentFeedback.length > 0 ? (
            <div className="space-y-4">
              {sentFeedback.map((fb) => (
                <div key={fb.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                        <User size={20} />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">To: {fb.teacher_name}</h4>
                        <p className="text-xs text-gray-400 flex items-center gap-1">
                          <Calendar size={12} />
                          {new Date(fb.created_at).toLocaleDateString(undefined, {
                            year: 'numeric', month: 'short', day: 'numeric',
                            hour: '2-digit', minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-emerald-600 text-xs font-bold px-2 py-1 bg-emerald-50 rounded-lg">
                      <CheckCircle2 size={12} />
                      SENT
                    </div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl text-gray-700 text-sm leading-relaxed italic border-l-4 border-blue-200">
                    "{fb.message}"
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white p-12 rounded-3xl border border-dashed border-gray-200 text-center">
              <div className="w-16 h-16 bg-blue-50 text-blue-300 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare size={32} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">No feedback sent yet</h3>
              <p className="text-gray-500 mb-6 max-w-xs mx-auto text-sm">Communication with teachers is important for your child's success. Send your first feedback now!</p>
              {!showForm && (
                <button
                  onClick={() => setShowForm(true)}
                  className="text-blue-600 font-bold text-sm flex items-center gap-2 mx-auto hover:gap-3 transition-all underline underline-offset-4"
                >
                  Create New Message <ArrowRight size={16} />
                </button>
              )}
            </div>
          )}
        </div>

        {/* New Message Sidebar */}
        <div className="relative">
          {showForm ? (
            <div className="bg-white p-8 rounded-3xl border border-blue-100 shadow-xl shadow-blue-500/5 sticky top-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Send Feedback</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-2 px-1">Choose Teacher</label>
                  <select
                    value={selectedTeacher}
                    onChange={(e) => setSelectedTeacher(e.target.value)}
                    className="w-full px-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-medium transition-all"
                    required
                  >
                    <option value="">Select a Teacher</option>
                    {teachers.map((t) => (
                      <option key={t.id} value={t.id}>{t.name} ({t.subject})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-2 px-1">Report / Feedback</label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Describe your feedback or concerns about your child's progress..."
                    rows={6}
                    className="w-full px-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-medium transition-all resize-none"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-bold transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {submitting ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <Send size={18} />
                      Send Message
                    </>
                  )}
                </button>
              </form>
            </div>
          ) : (
            <div className="bg-gradient-to-br from-indigo-600 to-blue-700 p-8 rounded-3xl text-white shadow-xl shadow-blue-500/20 sticky top-8">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-md">
                <Users size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3">Professional Support</h3>
              <p className="text-blue-100 text-sm leading-relaxed mb-6">
                Direct communication with teachers ensures you stay updated on your child's daily school life and academic growth.
              </p>
              <ul className="space-y-3 mb-8">
                {['Direct messaging', 'Academic tracking', 'Concerns reporting'].map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-blue-50/80">
                    <CheckCircle2 size={16} className="text-blue-300" />
                    {item}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => setShowForm(true)}
                className="w-full bg-white text-blue-700 py-3 rounded-2xl font-bold hover:bg-blue-50 transition-colors"
              >
                Start Feedback
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
