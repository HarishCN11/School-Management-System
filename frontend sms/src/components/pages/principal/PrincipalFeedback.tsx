import { useState } from 'react';
import { 
  Send, 
  ArrowLeft, 
  Info, 
  Loader2,
  Lock,
  ShieldAlert,
  HelpCircle
} from 'lucide-react';
import { messageService } from '../../../services/api';
import { toast } from 'sonner';

export const PrincipalFeedback = ({ onNavigate }: any) => {
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    subject: '',
    message: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await messageService.send({
        receiver_role: 'admin',
        subject: formData.subject,
        message: formData.message
      });
      toast.success('Message sent to Administration Team');
      setFormData({ subject: '', message: '' });
    } catch (error: any) {
      toast.error('Failed to send message');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-bottom-8 duration-700">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => onNavigate('principal-dashboard')} className="p-2 hover:bg-gray-100 rounded-full transition">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">System Administrator Contact</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
        {/* Info Sidebar */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
             <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl w-fit">
                <ShieldAlert size={28} />
             </div>
             <h3 className="font-bold text-gray-900 text-lg">Direct Channel</h3>
             <p className="text-gray-500 text-sm leading-relaxed">
                Use this portal to report technical bugs, request account changes, or suggest system-wide improvements directly to the IT Administrator.
             </p>
             <div className="pt-4 border-t border-gray-50 space-y-3">
                <div className="flex items-center gap-3 text-xs font-bold text-gray-400">
                   <Lock size={14} className="text-emerald-500" />
                   SECURE END-TO-END
                </div>
                <div className="flex items-center gap-3 text-xs font-bold text-gray-400">
                   <HelpCircle size={14} className="text-blue-500" />
                   24/7 SUPPORT REQUESTS
                </div>
             </div>
          </div>

          <div className="bg-amber-50 p-6 rounded-3xl border border-amber-100 shadow-sm flex gap-4">
             <Info className="text-amber-600 shrink-0" size={24} />
             <p className="text-amber-800 text-sm font-medium">
               For student-specific issues or grading disputes, please use the Teacher-Parent communication channels instead.
             </p>
          </div>
        </div>

        {/* Message Form */}
        <div className="md:col-span-3">
          <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Issue Subject</label>
              <input 
                required
                className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-gray-900 placeholder-gray-300 transition"
                placeholder="e.g., Requesting database export..."
                value={formData.subject}
                onChange={(e) => setFormData({...formData, subject: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Detailed Message</label>
              <textarea 
                required
                rows={8}
                className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-medium text-gray-700 placeholder-gray-300 transition"
                placeholder="Describe your request or issue in detail..."
                value={formData.message}
                onChange={(e) => setFormData({...formData, message: e.target.value})}
              />
            </div>

            <button 
              disabled={submitting}
              className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black text-lg hover:bg-blue-700 transition shadow-2xl shadow-blue-200 flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {submitting ? <Loader2 className="animate-spin" size={24} /> : <Send size={24} />}
              Send Secure Message
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
