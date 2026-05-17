import { useEffect, useState } from 'react';
import { authService, parentService, studentService } from '../../../services/api';
import { toast } from 'sonner';
import { ArrowLeft, Save, Loader2, Lock } from 'lucide-react';

export const ParentForm = ({ onNavigate, data }: any) => {
    const isEditing = !!data?.id;
    const [loading, setLoading] = useState(false);
    const [students, setStudents] = useState<any[]>([]);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: data?.name || '',
        email: data?.email || '',
        password: '',
        student_id: data?.student_id || '',
        phone_number: data?.phone_number || ''
    });

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const res = await studentService.getAll();
                setStudents(res);
            } catch (error) { }
        };
        fetchStudents();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg(null);
        setSuccessMsg(null);
        try {
            if (isEditing) {
                await parentService.update(data.id, formData);

                if (formData.password) {
                    await authService.adminResetUserPassword({
                        email: formData.email,
                        newPassword: formData.password
                    });
                }

                toast.success('Parent profile updated');
                setSuccessMsg('Parent profile updated successfully!');
                setTimeout(() => onNavigate('admin-parents'), 1500);
            } else {
                const user = await authService.register({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password || 'password123',
                    role: 'parent'
                });
                await parentService.createProfile({
                    user_id: user.userId,
                    student_id: formData.student_id,
                    phone_number: formData.phone_number
                });
                toast.success('Parent registered successfully');
                setSuccessMsg('Parent registered successfully!');
                setFormData({
                    name: '',
                    email: '',
                    password: '',
                    student_id: '',
                    phone_number: ''
                });

            }
        } catch (error: any) {
            const errorText = error.response?.data?.message || 'Error saving parent profile';
            setErrorMsg(errorText);
            toast.error(errorText);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl space-y-6">
            <div className="flex items-center gap-4">
                <button onClick={() => onNavigate('admin-parents')} className="p-2 hover:bg-gray-100 rounded-full transition">
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-2xl font-bold text-gray-900">{isEditing ? 'Edit Parent Profile' : 'Register Parent'}</h1>
            </div>

            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm space-y-8">
                {errorMsg && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 text-red-800">
                        <p className="text-sm font-semibold">{errorMsg}</p>
                    </div>
                )}
                {successMsg && (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3 text-green-800">
                        <p className="text-sm font-semibold">{successMsg}</p>
                    </div>
                )}
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">Guardian Name</label>
                            <input name="name" value={formData.name} onChange={handleChange} required className="w-full px-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">Email Address</label>
                            <input type="email" name="email" value={formData.email} onChange={handleChange} required disabled={isEditing} className="w-full px-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">
                            {isEditing ? 'Reset Password (Optional)' : 'Log-in Password'}
                        </label>
                        <div className="relative">
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required={!isEditing}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
                                placeholder={isEditing ? "Leave blank to keep current" : "Default: password123"}
                            />
                            <Lock className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">Linked Student</label>
                            <select name="student_id" value={formData.student_id} onChange={handleChange} className="w-full px-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500">
                                <option value="">Select Student</option>
                                {students.map(s => (
                                    <option key={s.id} value={s.id}>{s.name} ({s.class_name || 'No Class'})</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">Contact Number</label>
                            <input name="phone_number" value={formData.phone_number} onChange={handleChange} required className="w-full px-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-50">
                    <button type="button" onClick={() => onNavigate('admin-parents')} className="px-6 py-2 border rounded-xl hover:bg-gray-50">Cancel</button>
                    <button type="submit" disabled={loading} className="px-8 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 flex items-center gap-2 shadow-lg shadow-blue-100">
                        {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />} Save Changes
                    </button>
                </div>
            </form>
        </div>
    );
};
