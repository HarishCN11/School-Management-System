import { useEffect, useState } from 'react';
import { principalService } from '../../../services/api';
import { Plus, Edit, Trash2, Search, UserCheck } from 'lucide-react';
import { toast } from 'sonner';

export const ManagePrincipals = ({ onNavigate }: any) => {
    const [principals, setPrincipals] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchPrincipals();
    }, []);

    const fetchPrincipals = async () => {
        try {
            setLoading(true);
            const data = await principalService.getAll();
            setPrincipals(data);
        } catch (error) {
            toast.error('Failed to load principals');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Are you sure you want to delete this principal?')) {
            try {
                await principalService.delete(id);
                toast.success('Principal deleted successfully');
                fetchPrincipals();
            } catch (error) {
                toast.error('Failed to delete principal');
            }
        }
    };

    const filtered = principals.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Manage Principals</h1>
                    <p className="text-gray-500">View and manage school leadership</p>
                </div>
                <button
                    onClick={() => onNavigate('admin-principal-form')}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                    <Plus size={20} />
                    Add Principal
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search principals..."
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
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Name</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Email</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Experience</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Contact</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr><td colSpan={5} className="px-6 py-8 text-center">Loading...</td></tr>
                            ) : filtered.length === 0 ? (
                                <tr><td colSpan={5} className="px-6 py-8 text-center">No principals found</td></tr>
                            ) : (
                                filtered.map((p) => (
                                    <tr key={p.id} className="hover:bg-gray-50 transition">
                                        <td className="px-6 py-4 flex items-center gap-3">
                                            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-600">
                                                <UserCheck size={16} />
                                            </div>
                                            <span className="font-medium text-gray-900">{p.name}</span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">{p.email}</td>
                                        <td className="px-6 py-4 text-gray-600">{p.experience_years} Years</td>
                                        <td className="px-6 py-4 text-gray-600">{p.contact_number}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-2">
                                                <button onClick={() => onNavigate('admin-principal-form', p)} className="p-1 text-gray-600 hover:bg-gray-100 rounded"><Edit size={18} /></button>
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
