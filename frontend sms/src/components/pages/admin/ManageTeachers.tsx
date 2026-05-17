import { useEffect, useState } from 'react';
import { teacherService } from '../../../services/api';
import { Plus, Edit, Trash2, Search, GraduationCap, Phone, MapPin } from 'lucide-react';
import { toast } from 'sonner';

export const ManageTeachers = ({ onNavigate }: any) => {
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const data = await teacherService.getAll();
      setTeachers(data);
    } catch (error) {
      console.error('Error fetching teachers:', error);
      toast.error('Failed to load teachers');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this teacher?')) {
      try {
        await teacherService.delete(id);
        toast.success('Teacher deleted successfully');
        fetchTeachers();
      } catch (error) {
        console.error('Error deleting teacher:', error);
        toast.error('Failed to delete teacher');
      }
    }
  };

  const filteredTeachers = teachers.filter(teacher =>
    (teacher.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (teacher.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (teacher.specialization?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Teachers</h1>
          <p className="text-gray-500">Faculty directory and management</p>
        </div>
        <button
          onClick={() => onNavigate('admin-teacher-form')}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          <Plus size={20} />
          Add New Teacher
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by name, email, or specialization..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Teacher</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Qualification</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Specialization</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Contact</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Address</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-500">Loading teachers...</td></tr>
              ) : filteredTeachers.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-500">No teachers found</td></tr>
              ) : (
                filteredTeachers.map((teacher) => (
                  <tr key={teacher.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600">
                          <GraduationCap size={20} />
                        </div>
                        <div>
                          <div className="font-bold text-gray-900">{teacher.name}</div>
                          <div className="text-xs text-gray-500">{teacher.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-700 font-medium">{teacher.qualification || 'N/A'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-purple-50 text-purple-700 rounded text-xs font-bold ring-1 ring-purple-100">
                        {teacher.specialization || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Phone size={14} />
                        <span className="text-sm">{teacher.phone_number || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-2 text-gray-600 max-w-[200px]">
                        <MapPin size={14} className="mt-0.5 flex-shrink-0" />
                        <p className="text-sm line-clamp-2">{teacher.address || 'N/A'}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-1">
                        <button
                          onClick={() => onNavigate('admin-teacher-form', teacher)}
                          className="p-2 hover:bg-gray-200 rounded-lg text-gray-600 transition"
                          title="Edit"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(teacher.id)}
                          className="p-2 hover:bg-red-50 rounded-lg text-red-600 transition"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
