import { useState, useEffect } from 'react';
import { principalService } from '../../../services/api';
import { 
  Users, 
  Search, 
  ArrowLeft, 
  Loader2, 
  FileText,
  User,
  ShieldCheck,
  Phone,
  Mail,
  GraduationCap
} from 'lucide-react';

export const StudentReports = ({ onNavigate }: any) => {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const data = await principalService.getStudentsParents();
      setStudents(data);
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(s => 
    s.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.admission_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.class_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-blue-600" size={48} />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => onNavigate('principal-dashboard')} className="p-2 hover:bg-gray-100 rounded-full transition">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Student & Parent Registry</h1>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search by name, ID or class..."
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2">
           <GraduationCap size={18} />
           Total: {students.length}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStudents.map((student, idx) => (
          <div key={idx} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all group">
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="p-3 bg-blue-50 rounded-2xl text-blue-600">
                  <User size={24} />
                </div>
                <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                  {student.class_name || 'No Class'}
                </span>
              </div>
              
              <div>
                <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition">{student.student_name}</h3>
                <p className="text-xs font-bold text-gray-400 mt-0.5">ID: {student.admission_number}</p>
              </div>

              <div className="space-y-2 pt-2 border-t border-gray-50">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Parent Details</p>
                <div className="flex items-center gap-3 text-sm text-gray-700 font-medium">
                   <ShieldCheck size={16} className="text-emerald-500" />
                   {student.parent_name || 'N/A'}
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                   <Phone size={14} className="text-gray-400" />
                   {student.parent_phone || 'No phone'}
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                   <Mail size={14} className="text-gray-400" />
                   {student.parent_email || 'No email'}
                </div>
              </div>

              <button 
                onClick={() => onNavigate('student-reports', { id: student.student_id })}
                className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white py-3 rounded-2xl text-sm font-bold hover:bg-blue-600 transition shadow-lg shadow-gray-100"
              >
                <FileText size={18} />
                View Academic Report
              </button>
            </div>
          </div>
        ))}

        {filteredStudents.length === 0 && (
          <div className="col-span-full py-20 text-center">
            <Users className="mx-auto text-gray-200 mb-4" size={64} />
            <p className="text-gray-500 text-lg">No students found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
};
