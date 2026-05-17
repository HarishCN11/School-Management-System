import { useState, useEffect } from 'react';
import { authService, teacherService, academicService } from '../../../services/api';
import { toast } from 'sonner';
import { ArrowLeft, Save, Loader2, Eye, EyeOff, GraduationCap } from 'lucide-react';

export const TeacherForm = ({ onNavigate, data }: any) => {
  const isEditing = !!data?.id;
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [classes, setClasses] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    name: data?.name || '',
    email: data?.email || '',
    password: '',
    qualification: data?.qualification || '',
    specialization: data?.specialization || '',
    phone_number: data?.phone_number || '',
    address: data?.address || '',
    managed_class_id: data?.managed_class_id || ''
  });

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const cls = await academicService.getAllClasses();
      setClasses(cls);
    } catch (err) {
      console.error(err);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    let createdUserId: number | null = null;

    try {
      if (isEditing) {
        await teacherService.update(data.id, formData);

        if (formData.password) {
          await authService.adminResetUserPassword({
            email: formData.email,
            newPassword: formData.password
          });
        }

        toast.success('Teacher updated successfully!');
        setSuccessMsg('Teacher updated successfully!');
        setTimeout(() => onNavigate('admin-teachers'), 1500);
      } else {
        // Generate a STRONG default password if not provided
        // Format: Faculty + PhoneLast4 + @2026! ensures it meets index.js regex
        let password = formData.password;
        if (!password) {
          const phoneSuffix = formData.phone_number ? formData.phone_number.slice(-4) : '123';
          password = `Faculty${phoneSuffix}@2026!`; 
        }

        const user = await authService.register({
          name: formData.name,
          email: formData.email,
          password: password,
          role: 'teacher'
        });
        createdUserId = user.userId;

        await teacherService.createProfile({
          user_id: user.userId,
          qualification: formData.qualification,
          specialization: formData.specialization,
          phone_number: formData.phone_number,
          address: formData.address,
          managed_class_id: formData.managed_class_id || null
        });

        // Reset form for next teacher
        setFormData({
          name: '',
          email: '',
          password: '',
          qualification: '',
          specialization: '',
          phone_number: '',
          address: '',
          managed_class_id: ''
        });

        setSuccessMsg(`Teacher registered successfully! Password: ${password}`);
      }
    } catch (error: any) {
      console.error('Teacher Save Error:', error);
      const errorText = error.response?.data?.message || 'Failed to save teacher. Check email or details.';
      setErrorMsg(errorText);
      toast.error(errorText);
      
      if (!isEditing && createdUserId) {
          try {
              await authService.deleteUser(createdUserId);
          } catch(err) {
              console.error(err);
          }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => onNavigate('admin-teachers')} className="p-2 hover:bg-gray-100 rounded-full transition">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">{isEditing ? 'Edit Teacher Profile' : 'Register New Faculty'}</h1>
        </div>
        {!isEditing && (
          <button
            onClick={() => onNavigate('admin-teachers')}
            className="px-4 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-50 rounded-lg transition"
          >
            View All Teachers
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-8">
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Full Name</label>
            <input name="name" value={formData.name} onChange={handleChange} required className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition" placeholder="Dr. Jane Smith" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Email Address</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} required disabled={isEditing} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-100 transition" placeholder="jane@example.com" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">
              {isEditing ? 'Reset Password (Optional)' : 'Login Password'}
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                required={!isEditing}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder={isEditing ? "Leave blank to keep current" : "Set password"}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {!isEditing && (
              <p className="text-xs text-gray-500 italic">Leave blank to use Phone Number as password</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Phone Number</label>
            <input name="phone_number" value={formData.phone_number} onChange={handleChange} required className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition" placeholder="9876543210" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Qualification</label>
            <input name="qualification" value={formData.qualification} onChange={handleChange} required className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition" placeholder="PhD in Physics" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Subject Specialization</label>
            <input name="specialization" value={formData.specialization} onChange={handleChange} required className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition" placeholder="Quantum Mechanics" />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <GraduationCap size={16} className="text-blue-600" />
              Class Teacher Of (Responsible Grade)
            </label>
            <select
              name="managed_class_id"
              value={formData.managed_class_id}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition bg-white"
            >
              <option value="">-- No Class Assigned --</option>
              {classes.map((cls: any) => (
                <option key={cls.id} value={cls.id}>{cls.name} {cls.room_number ? `(Room ${cls.room_number})` : ''}</option>
              ))}
            </select>
            <p className="text-[10px] text-gray-500 italic mt-1 px-1">
              Assigning a class makes this teacher the "Class Teacher" responsible for student report cards of that grade.
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">Home Address</label>
          <textarea name="address" value={formData.address} onChange={handleChange} rows={3} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition" placeholder="Full residential address..." />
        </div>

        <div className="flex justify-end gap-4 pt-4 border-t border-gray-50">
          <button type="button" onClick={() => onNavigate('admin-teachers')} className="px-6 py-2.5 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition">Cancel</button>
          <button type="submit" disabled={loading} className="px-10 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition flex items-center gap-2 shadow-lg shadow-blue-100 disabled:opacity-50">
            {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />} {isEditing ? 'Save Changes' : 'Register Faculty'}
          </button>
        </div>
      </form>
    </div>
  );
};
