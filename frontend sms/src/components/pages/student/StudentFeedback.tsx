import React, { useState, useEffect } from 'react';
import { feedbackService } from '../../../services/api';
import { Send, Loader2, User, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';

export const StudentFeedback = () => {
    const [teachers, setTeachers] = useState<any[]>([]);
    const [selectedTeacher, setSelectedTeacher] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const fetchTeachers = async () => {
            try {
                const res = await feedbackService.getStudentTeachers();
                setTeachers(res || []);
            } catch (err) {
                console.error(err);
                toast.error('Failed to load teachers');
            } finally {
                setLoading(false);
            }
        };
        fetchTeachers();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedTeacher || !message.trim()) return toast.error('Please fill all fields');
        setSubmitting(true);
        try {
            await feedbackService.submitStudentFeedback({
                teacher_id: Number(selectedTeacher),
                message: message.trim()
            });
            toast.success('Feedback sent to teacher successfully!');
            setMessage('');
            setSelectedTeacher('');
        } catch (error) {
            toast.error('Failed to send feedback');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl mx-auto">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
                <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                        <MessageSquare size={24} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-slate-800 tracking-tight">Provide Feedback</h2>
                        <p className="text-sm text-slate-500 font-medium">Send a quick message or feedback privately to your teachers.</p>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center p-8"><Loader2 className="animate-spin text-blue-500" /></div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Select Teacher</label>
                            <select
                                value={selectedTeacher}
                                onChange={(e) => setSelectedTeacher(e.target.value)}
                                className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-semibold outline-none"
                                required
                            >
                                <option value="">-- Choose a Teacher --</option>
                                {teachers.map((t) => (
                                    <option key={t.id} value={t.id}>{t.name} {t.subject ? `(${t.subject})` : ''}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Your Message</label>
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                rows={5}
                                className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium outline-none resize-none"
                                placeholder="Write your feedback or question here..."
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-xl shadow-lg shadow-blue-500/30 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 w-full md:w-auto"
                        >
                            {submitting ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                            SEND FEEDBACK
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};
