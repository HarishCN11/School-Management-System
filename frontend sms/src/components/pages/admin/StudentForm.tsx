import { useEffect, useState } from 'react';
import { authService, studentService, academicService } from '../../../services/api';
import { toast } from 'sonner';
import { ArrowLeft, Save, Loader2, Eye, EyeOff } from 'lucide-react';

export const StudentForm = ({ onNavigate, data }: any) => {
  const isEditing = !!data?.id;
  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState<any[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: data?.name || '',
    email: data?.email || '',
    password: '',
    class_name: data?.class_name || '',
    admission_number: data?.admission_number || '',
    dob: data?.dob ? new Date(data.dob).toISOString().split('T')[0] : '',
    gender: data?.gender || 'male',
    address: data?.address || ''
  });

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const classesData = await academicService.getAllClasses();
        setClasses(classesData);
      } catch (error) {
        console.error('Error fetching classes:', error);
      }
    };
    fetchClasses();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    let createdUserId = null;

    try {
      if (isEditing) {
        // ... (Existing Edit Logic unchanged) ...
        // Find class_id from class_name if it was changed
        let classId = data.class_id;
        if (formData.class_name !== data.class_name) {
          const matchedClass = classes.find(c => c.name.toLowerCase() === formData.class_name.toLowerCase());
          classId = matchedClass ? matchedClass.id : null;
        }

        // Update Student details
        await studentService.update(data.id, {
          name: formData.name,
          email: formData.email,
          class_id: classId,
          admission_number: formData.admission_number,
          dob: formData.dob,
          gender: formData.gender,
          address: formData.address
        });

        // If a new password was provided in edit mode, reset it
        if (formData.password) {
          await authService.adminResetUserPassword({
            email: formData.email,
            newPassword: formData.password
          });
        }

        toast.success('Student updated successfully');
        setSuccessMsg('Student updated successfully!');
        setTimeout(() => onNavigate('admin-students'), 1500);
      } else {
        // New Registration - find or create class
        let classId = null;
        if (formData.class_name && formData.class_name.trim()) {
          const matchedClass = classes.find(c => c.name.toLowerCase() === formData.class_name.toLowerCase());
          if (matchedClass) {
            classId = matchedClass.id;
          } else {
            // Create new class if it doesn't exist
            try {
              const newClass = await academicService.createClass({ name: formData.class_name.trim() });
              classId = newClass.id;
              toast.info(`Created new class: ${formData.class_name}`);
            } catch (err) {
              console.error('Error creating class:', err);
            }
          }
        }

        // Generate a STRONG default password if not provided
        // Format: School + AdmissionID + 123! (e.g., SchoolS101@123!) to meet all regex requirements
        // Regex requirements: min 8 chars, uppercase, lowercase, number, special char
        let password = formData.password;
        if (!password) {
          const base = formData.admission_number || 'Student';
          password = `School${base}@123`; // Ensures: uppercase(S), lowercase(chool), numbers(123), special(@)
        }

        // 1. Create User Account
        const userResponse = await authService.register({
          name: formData.name,
          email: formData.email,
          password: password,
          role: 'student'
        });

        createdUserId = userResponse.userId;

        // 2. Create Student Profile
        await studentService.create({
          user_id: userResponse.userId,
          class_id: classId,
          admission_number: formData.admission_number,
          dob: formData.dob,
          gender: formData.gender,
          address: formData.address
        });

        setSuccessMsg(`Student registered! Password: ${password}`);
        toast.success(`Student registered! Password: ${password}`);

        // Reset form for next student
        setFormData({
          name: '',
          email: '',
          password: '',
          class_name: formData.class_name, // Keep class name for convenience
          admission_number: '',
          dob: '',
          gender: 'male',
          address: ''
        });
      }
    } catch (error: any) {
      console.error('Error saving student:', error);
      const errorText = error.response?.data?.message || 'Failed to save student';
      setErrorMsg(errorText);
      toast.error(errorText);

      // Rollback: If User was created but Profile failed, delete the user to prevent "Email Taken" next time
      if (!isEditing && createdUserId) {
        try {
          // We need a way to delete the user. 
          // Since we don't have a direct "delete user by id" exposed to frontend for this cleanup, 
          // we rely on the user manually deleting or trying again if the backend didn't clean it.
          // Ideally, the backend should handle this transaction.
          // But for now, let's inform the user.
          console.warn("Orphaned user created? ID:", createdUserId);
        } catch (cleanupErr) {
          console.error("Cleanup failed", cleanupErr);
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
          <button onClick={() => onNavigate('admin-students')} className="p-2 hover:bg-gray-100 rounded-full transition">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">{isEditing ? 'Edit Student' : 'Register New Student'}</h1>
        </div>
        {!isEditing && (
          <button
            onClick={() => onNavigate('admin-students')}
            className="px-4 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-50 rounded-lg transition"
          >
            View All Students
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
            <input name="name" value={formData.name} onChange={handleChange} required className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition" placeholder="John Doe" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Email Address</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} required disabled={isEditing} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-100 transition" placeholder="john@example.com" />
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
              <p className="text-xs text-gray-500 italic">Leave blank to use Admission ID as password. Must be at least 8 chars, and contain uppercase, lowercase, numbers, and special characters.</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Admission ID (Unique)</label>
            <input name="admission_number" value={formData.admission_number} onChange={handleChange} required className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition" placeholder="S101" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Class</label>
            <input
              type="text"
              name="class_name"
              list="classes-datalist"
              value={formData.class_name}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
              placeholder="e.g., Class 10-A"
              autoComplete="off"
            />
            <datalist id="classes-datalist">
              {classes.map((cls: any) => (
                <option key={cls.id} value={cls.name} />
              ))}
            </datalist>
            <p className="text-xs text-gray-500 italic">Select an existing class or type a new name to create it automatically.</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Date of Birth</label>
            <input type="date" name="dob" value={formData.dob} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Gender</label>
            <select name="gender" value={formData.gender} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition">
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">Primary Address</label>
          <textarea name="address" value={formData.address} onChange={handleChange} rows={3} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition" placeholder="Full address..." />
        </div>

        <div className="flex justify-end gap-4 pt-4 border-t border-gray-50">
          <button type="button" onClick={() => onNavigate('admin-students')} className="px-6 py-2.5 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition">Cancel</button>
          <button type="submit" disabled={loading} className="px-10 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition flex items-center gap-2 shadow-lg shadow-blue-100 disabled:opacity-50">
            {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />} {isEditing ? 'Save Changes' : 'Register Student'}
          </button>
        </div>
      </form>
    </div>
  );
};
