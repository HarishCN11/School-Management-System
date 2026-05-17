import React, { useState } from 'react';
import { authService } from '../../services/api';
import { toast } from 'sonner';
import { ArrowLeft, KeyRound, Lock, CheckCircle, Mail } from 'lucide-react';

export const ResetPassword = ({ onNavigate, data }: any) => {
    const [email, setEmail] = useState(data?.email || '');
    const [tempPassword, setTempPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        setLoading(true);
        try {
            await authService.resetPasswordWithTemp({ email, tempPassword, newPassword });
            setSuccess(true);
            toast.success('Password reset successfully! Please login.');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to reset password.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-cover bg-center no-repeat" style={{ backgroundImage: "url('/classroom_bg.png')" }}>
                <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] z-0"></div>
                <div className="bg-black/30 backdrop-blur-md border border-white/10 rounded-3xl shadow-2xl p-8 w-full max-w-md relative z-10 text-center text-white">
                    <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-green-900/40">
                        <CheckCircle size={32} />
                    </div>
                    <h1 className="text-3xl font-black mb-3">All Set!</h1>
                    <p className="text-blue-100/90 mb-8">
                        Your password has been securely updated. <br />You can now login with your new credentials.
                    </p>
                    <button
                        onClick={() => onNavigate('login')}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold transition shadow-lg hover:shadow-blue-500/25 transform hover:-translate-y-0.5 active:translate-y-0"
                    >
                        Go to Login
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-cover bg-center no-repeat" style={{ backgroundImage: "url('/classroom_bg.png')" }}>
            <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] z-0"></div>

            <div className="bg-black/30 backdrop-blur-md border border-white/10 rounded-3xl shadow-2xl p-8 w-full max-w-md relative z-10 text-white">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-tr from-blue-600 to-purple-700 rounded-2xl flex items-center justify-center text-white mb-4 mx-auto shadow-lg shadow-purple-900/40">
                        <Lock size={32} />
                    </div>
                    <h1 className="text-3xl font-black tracking-tight mb-2">Reset Password</h1>
                    <p className="text-blue-100/80 text-sm font-medium">
                        Use the temporary key sent to your email <br /> to set a new secure password.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-blue-200 ml-1">Email Address</label>
                        <div className="relative group">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-300 group-focus-within:text-white transition-colors" size={20} />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Your email"
                                required
                                className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-black/40 outline-none font-medium text-white placeholder-blue-200/50 transition-all"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-blue-200 ml-1">Temporary Key</label>
                        <div className="relative group">
                            <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-300 group-focus-within:text-white transition-colors" size={20} />
                            <input
                                type="text"
                                value={tempPassword}
                                onChange={(e) => setTempPassword(e.target.value)}
                                placeholder="Enter temp code from email"
                                required
                                className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-black/40 outline-none font-medium text-white placeholder-blue-200/50 transition-all"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-blue-200 ml-1">New Password</label>
                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-300 group-focus-within:text-white transition-colors" size={20} />
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="New strong password"
                                required
                                className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-black/40 outline-none font-medium text-white placeholder-blue-200/50 transition-all"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-blue-200 ml-1">Confirm New Password</label>
                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-300 group-focus-within:text-white transition-colors" size={20} />
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Repeat new password"
                                required
                                className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-black/40 outline-none font-medium text-white placeholder-blue-200/50 transition-all"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-blue-500/25 flex items-center justify-center gap-2 mt-4 disabled:opacity-70 disabled:cursor-not-allowed transform hover:-translate-y-0.5 active:translate-y-0"
                    >
                        {loading ? 'Resetting...' : 'Set New Password'}
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
