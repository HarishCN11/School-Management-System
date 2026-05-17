import React, { useState } from 'react';
import { Mail, Lock, UserCheck, Eye, EyeOff, Loader2 } from 'lucide-react';

export const Login = ({ onLogin, onNavigate }: any) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState('Student');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const roles = ['Admin', 'Teacher', 'Student', 'Principal', 'Parent'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    setErrorMsg(null);
    try {
      await onLogin(selectedRole, email, password);
    } catch (err: any) {
      // The App component handles toast, but we want an inline red message too
      setErrorMsg('Invalid username or password. Please try again.');
      throw err; // Re-throw to let App handle it if needed
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-cover bg-center no-repeat" style={{ backgroundImage: "url('/login_bg_kids.jpg')" }}>
      {/* Dark Overlay for Readability */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-[3px] z-0"></div>

      <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-3xl shadow-2xl p-8 md:p-12 w-full max-w-lg relative z-10 text-white">
        <div className="text-center mb-8 md:mb-10">
          {/* Logo Section */}
          <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl overflow-hidden border-4 border-white/20">
            <img src="/swami_logo.png" alt="School Logo" className="w-full h-full object-cover" />
          </div>

          {/* Main Title - Fixed Truncation */}
          <h1 className="text-2xl md:text-3xl font-black tracking-tight mb-2 text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-white to-yellow-200 drop-shadow-lg uppercase leading-snug break-words whitespace-normal px-2">
            MT/Vivekanandha.T.V
          </h1>

          {/* Sub Title */}
          <p className="text-xl font-semibold text-blue-100/90 tracking-wide font-sans">
            Welcome
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {errorMsg && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 flex items-center gap-3 animate-pulse">
              <div className="p-1 bg-red-500 rounded-full">
                <UserCheck size={16} className="text-white" />
              </div>
              <p className="text-red-200 text-sm font-semibold">{errorMsg}</p>
            </div>
          )}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-blue-200 ml-1">Academic Role</label>
            <div className="relative group">
              <UserCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-300 group-focus-within:text-white transition-colors" size={20} />
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-black/40 outline-none appearance-none font-semibold text-white transition-all cursor-pointer hover:bg-white/20"
              >
                {roles.map((role) => <option key={role} value={role} className="text-black bg-white">{role}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-blue-200 ml-1">Email Address</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-300 group-focus-within:text-white transition-colors" size={20} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@school.com"
                className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-black/40 outline-none font-medium text-white placeholder-blue-200/50 transition-all"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center ml-1">
              <label className="text-xs font-bold uppercase tracking-wider text-blue-200">Password</label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => onNavigate('reset-password')}
                  className="text-xs font-bold text-blue-300 hover:text-white transition-colors"
                >
                  Reset with Temp Key
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('forgot-password')}
                  className="text-xs font-bold text-blue-300 hover:text-white transition-colors"
                >
                  Forgot Password?
                </button>
              </div>
            </div>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-300 group-focus-within:text-white transition-colors" size={20} />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-12 pr-12 py-4 bg-white/10 border border-white/20 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-black/40 outline-none font-medium text-white placeholder-blue-200/50 tracking-wider transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-300 hover:text-white transition"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-bold text-lg transition-all shadow-lg hover:shadow-blue-500/25 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed transform hover:-translate-y-0.5 active:translate-y-0"
          >
            {loading ? <Loader2 className="animate-spin" size={24} /> : 'Secure Sign In'}
          </button>

          <div className="pt-6 text-center text-sm text-blue-200/70 border-t border-white/10 mt-6">
            <p>
              MT/Vivekanandha.T.V System &copy; 2026
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};
