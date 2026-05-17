import { useState } from 'react';
import { authService } from '../../services/api';
import { toast } from 'sonner';
import { ArrowLeft, KeyRound, Mail } from 'lucide-react';

export const ForgotPassword = ({ onNavigate }: any) => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [success, setSuccess] = useState(false);

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authService.forgotPassword(email);
      setSuccess(true);
      toast.success('System processed your request.');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Something went wrong. Check if SMTP is configured.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-cover bg-center no-repeat" style={{ backgroundImage: "url('/classroom_bg.png')" }}>
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] z-0"></div>

        <div className="bg-black/30 backdrop-blur-md border border-white/10 rounded-3xl shadow-2xl p-8 w-full max-w-md relative z-10 text-center text-white">
          <div className="w-16 h-16 bg-gradient-to-tr from-blue-600 to-purple-700 rounded-2xl flex items-center justify-center text-white mb-6 mx-auto shadow-2xl shadow-blue-900/40">
            <Mail size={32} />
          </div>
          <h1 className="text-3xl font-black mb-3 text-white drop-shadow-md">Check Your Inbox</h1>
          <p className="text-blue-100/90 mb-8 text-sm leading-relaxed font-medium">
            A secure temporary password has been sent to <br /><strong className="text-white">{email}</strong>.
            <br />Please use it to log in and update your security settings.
          </p>

          <div className="space-y-4">
            <button
              onClick={() => onNavigate('reset-password', { email })}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold transition shadow-lg hover:shadow-blue-500/25 transform hover:-translate-y-0.5 active:translate-y-0"
            >
              Enter Temporary Key
            </button>
            <button
              onClick={() => onNavigate('login')}
              className="w-full bg-white/10 hover:bg-white/20 text-white py-3 rounded-xl font-bold transition border border-white/20"
            >
              Back to Login
            </button>

            <p className="text-xs text-blue-200/60 font-medium border-t border-white/10 pt-4">
              Didn't receive the email? Check your spam folder.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-cover bg-center no-repeat" style={{ backgroundImage: "url('/classroom_bg.png')" }}>
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] z-0"></div>

      <div className="bg-black/30 backdrop-blur-md border border-white/10 rounded-3xl shadow-2xl p-8 w-full max-w-md relative z-10 text-white">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-tr from-blue-600 to-purple-700 rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg shadow-purple-900/40">
            <KeyRound size={32} />
          </div>
          <h1 className="text-3xl font-black tracking-tight mb-2 text-white drop-shadow-md">Forgot Password</h1>
          <p className="text-blue-100/80 mt-2 text-sm font-medium">
            Enter your registered email and we'll send a <br /> temporary access key to your inbox.
          </p>
        </div>

        <form onSubmit={handleRequest} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-blue-200 ml-1">Registered Email Address</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-300 group-focus-within:text-white transition-colors" size={20} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="yourname@school.com"
                className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-black/40 outline-none font-medium text-white placeholder-blue-200/50 transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-bold text-lg transition-all shadow-lg hover:shadow-blue-500/25 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed transform hover:-translate-y-0.5 active:translate-y-0"
          >
            {loading ? 'Processing Request...' : 'Send Temporary Key'}
          </button>
        </form>

        <button
          onClick={() => onNavigate('login')}
          className="mt-6 w-full flex items-center justify-center gap-2 text-blue-300 hover:text-white text-sm font-bold transition-colors"
        >
          <ArrowLeft size={16} /> Return to Login
        </button>
      </div>
    </div>
  );
};
