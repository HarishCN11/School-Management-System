import { useEffect, useState } from 'react';
import { parentService } from '../../../services/api';
import { Plus, Edit, Trash2, Search, Users } from 'lucide-react';
import { toast } from 'sonner';

export const ManageParents = ({ onNavigate }: any) => {
    const [parents, setParents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchParents();
    }, []);

    const fetchParents = async () => {
        try {
            setLoading(true);
            const data = await parentService.getAll();
            setParents(data);
        } catch (error) {
            toast.error('Failed to load parents');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Are you sure?')) {
            try {
                await parentService.delete(id);
                toast.success('Parent removed');
                fetchParents();
            } catch (error) {
                toast.error('Failed to remove parent');
            }
        }
    };

    const filtered = parents.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.student_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Manage Parents</h1>
                    <p className="text-gray-500">Manage parent accounts and linked students</p>
                </div>
                <button
                    onClick={() => onNavigate('admin-parent-form')}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                    <Plus size={20} />
                    Add Parent
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search by parent or student name..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Parent Name</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Linked Student</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Phone</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr><td colSpan={4} className="px-6 py-8 text-center">Loading...</td></tr>
                            ) : filtered.length === 0 ? (
                                <tr><td colSpan={4} className="px-6 py-8 text-center">No parents found</td></tr>
                            ) : (
                                filtered.map((p) => (
                                    <tr key={p.id} className="hover:bg-gray-50 transition">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900">{p.name}</div>
                                            <div className="text-xs text-gray-500">{p.email}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-blue-600">
                                                <Users size={14} />
                                                <span className="text-sm font-medium">{p.student_name || 'Not linked'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">{p.phone_number}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-2">
                                                <button onClick={() => onNavigate('admin-parent-form', p)} className="p-1 text-gray-600 hover:bg-gray-100 rounded"><Edit size={18} /></button>
                                                <button onClick={() => handleDelete(p.id)} className="p-1 text-red-600 hover:bg-red-50 rounded"><Trash2 size={18} /></button>
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
