import { useEffect, useState } from 'react';
import { Plus, Home, Trash2, Edit, X } from 'lucide-react';
import { academicService } from '../../../services/api';
import { toast } from 'sonner';

export const ManageClasses = ({ onNavigate }: any) => {
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingClass, setEditingClass] = useState<any | null>(null);
  const [formData, setFormData] = useState({ name: '', room_number: '', capacity: '100' });

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const data = await academicService.getAllClasses();
      setClasses(data);
    } catch (error) {
      toast.error('Failed to load classes');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        capacity: Number(formData.capacity)
      };

      if (editingClass) {
        await academicService.updateClass(editingClass.id, payload);
        toast.success(`Class updated with capacity: ${payload.capacity}`);
        
        // Update local state immediately
        setClasses(prev => prev.map(c => 
          c.id === editingClass.id ? { ...c, ...payload, capacity: payload.capacity } : c
        ));
      } else {
        const response = await academicService.createClass(payload);
        toast.success(`Class created with capacity: ${payload.capacity}`);
        
        // Add new class to local state
        setClasses(prev => [...prev, { ...payload, id: response.id }]);
      }
      setShowModal(false);
      setEditingClass(null);
      setFormData({ name: '', room_number: '', capacity: '100' });
    } catch (error) {
      toast.error(editingClass ? 'Failed to update class' : 'Failed to create class');
    }
  };

  const handleEdit = (cls: any) => {
    setEditingClass(cls);
    setFormData({ name: cls.name, room_number: cls.room_number, capacity: cls.capacity ?? 100 });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this class?')) {
      try {
        await academicService.deleteClass(id);
        toast.success('Class deleted successfully');
        fetchClasses();
      } catch (error) {
        toast.error('Failed to delete class');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Classes</h1>
          <p className="text-gray-500">Create and assign physical classrooms</p>
        </div>
        <button
          onClick={() => {
            setEditingClass(null);
            setFormData({ name: '', room_number: '', capacity: '100' });
            setShowModal(true);
          }}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          <Plus size={20} />
          Create Class
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : classes.length === 0 ? (
          <p className="text-gray-500">No classes found.</p>
        ) : (
          classes.map((cls) => (
            <div key={cls.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:border-blue-200 transition group">
              <div className="flex justify-between items-start mb-4">
                <div className="bg-blue-50 w-12 h-12 rounded-xl flex items-center justify-center text-blue-600">
                  <Home size={24} />
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleEdit(cls)}
                    className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-blue-600 transition"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(cls.id)}
                    className="p-2 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-600 transition"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              <h3 className="text-lg font-bold text-gray-900">{cls.name}</h3>
              <p className="text-gray-500 text-sm">Room {cls.room_number}</p>
              <p className="text-blue-600 text-xs font-semibold mt-1">Capacity: {cls.capacity ?? 100} Students</p>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                {editingClass ? 'Edit Class' : 'Create New Class'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Class Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Class 10-A"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Room Number</label>
                <input
                  type="text"
                  placeholder="e.g. 101"
                  value={formData.room_number}
                  onChange={(e) => setFormData({ ...formData, room_number: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Capacity (Students)</label>
                <input
                  type="number"
                  placeholder="e.g. 40"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition"
                />
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-50 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg hover:shadow-lg hover:shadow-blue-500/30 transition-all"
                >
                  {editingClass ? 'Save Changes' : 'Create Class'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
