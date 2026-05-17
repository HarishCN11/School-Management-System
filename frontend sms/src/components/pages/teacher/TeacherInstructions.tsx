import { useState, useEffect } from 'react';
import { assignmentService, academicService, teacherPortalService } from '../../../services/api';
import { toast } from 'sonner';
import { Plus, X, BookOpen, Layers, Upload, Trash2, Clock, CheckCircle2, AlertCircle, Download } from 'lucide-react';

export const TeacherInstructions = () => {
  const [showForm, setShowForm] = useState(false);
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [assignedMetadata, setAssignedMetadata] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [classId, setClassId] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setFetching(true);
    await Promise.all([fetchMetadata(), fetchMyAssignments()]);
    setFetching(false);
  };

  const fetchMetadata = async () => {
    try {
      const cls = await academicService.getAllClasses();
      setClasses(cls);
      
      const sub = await academicService.getAllSubjects();
      
      // Deduplicate subjects by name to prevent repeating dropdown entries
      const uniqueSubjectsMap = new Map();
      sub.forEach((s: any) => {
        if (!uniqueSubjectsMap.has(s.name)) {
          uniqueSubjectsMap.set(s.name, s);
        }
      });
      setSubjects(Array.from(uniqueSubjectsMap.values()));
    } catch (err) {
      console.error("Metadata fetch failed:", err);
      toast.error("Failed to load classes and subjects");
    }
  };

  const fetchMyAssignments = async () => {
    try {
      const data = await teacherPortalService.getMyUploadedItems();
      setAssignments(data.assignments || []);
    } catch (err) {
      console.error(err);
    }
  };

  // Reset subject when class changes
  useEffect(() => {
    if (classId) {
      setSubjectId('');
    }
  }, [classId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!classId || !subjectId || !dueDate) {
      toast.error('All fields are required');
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('class_id', classId);
      formData.append('subject_id', subjectId);
      formData.append('due_date', dueDate);
      if (file) {
        formData.append('file', file);
      }

      await assignmentService.createAssignment(formData);
      toast.success('Assignment created successfully');
      setShowForm(false);
      setTitle('');
      setDescription('');
      setFile(null);
      setDueDate('');
      fetchMyAssignments();
    } catch (error) {
      console.error(error);
      toast.error('Failed to create assignment');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this assignment?')) return;
    try {
      await assignmentService.delete(id);
      toast.success('Assignment deleted');
      fetchMyAssignments();
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  const handleToggleStatus = async (id: number, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'closed' : 'active';
    try {
      await assignmentService.updateStatus(id, newStatus);
      toast.success(`Assignment ${newStatus}`);
      fetchMyAssignments();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-500 pb-20 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-gray-100 pb-8">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-2">Assignments</h1>
          <p className="text-gray-500 font-medium">Create and manage coursework for your classes.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className={`flex items-center gap-2 px-8 py-3 rounded-2xl transition-all font-black uppercase tracking-widest text-xs shadow-lg active:scale-95 ${showForm ? 'bg-gray-100 text-gray-600' : 'bg-blue-600 text-white shadow-blue-200 hover:bg-blue-700'
            }`}
        >
          {showForm ? <X size={20} /> : <Plus size={20} />}
          {showForm ? 'Cancel' : 'New Assignment'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl shadow-gray-200/50 border border-gray-100 animate-in slide-in-from-top-6">
          <h3 className="text-2xl font-black text-gray-900 mb-8 tracking-tight">Assignment Details</h3>
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-3 px-1">Class</label>
                    <select
                      value={classId}
                      onChange={e => setClassId(e.target.value)}
                      className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-50 outline-none transition-all font-bold text-gray-900 cursor-pointer"
                      required
                    >
                      <option value="">Select Class</option>
                      {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-3 px-1">Subject</label>
                    <select
                      value={subjectId}
                      onChange={e => setSubjectId(e.target.value)}
                      className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-50 outline-none transition-all font-bold text-gray-900 cursor-pointer disabled:opacity-50"
                      required
                      disabled={!classId}
                    >
                      <option value="">{classId ? 'Select Subject' : 'Select Class First'}</option>
                      {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-3 px-1">Assignment Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-50 outline-none transition-all font-bold text-gray-900"
                    placeholder="e.g. Algebra Quiz 1"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-3 px-1">Due Date</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={e => setDueDate(e.target.value)}
                    className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-50 outline-none transition-all font-bold text-gray-900"
                    required
                  />
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-3 px-1">Instructions</label>
                  <textarea
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-50 outline-none transition-all font-bold text-gray-900 h-40 resize-none"
                    placeholder="Detailed instructions for students..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-3 px-1">Resource File (Optional)</label>
                  <div className="border-4 border-dashed border-gray-100 rounded-[2rem] p-8 text-center hover:bg-blue-50/50 hover:border-blue-100 transition-all cursor-pointer relative group">
                    <input
                      type="file"
                      onChange={e => setFile(e.target.files ? e.target.files[0] : null)}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <div className="flex flex-col items-center">
                      <Upload className={`h-10 w-10 mb-2 ${file ? 'text-blue-600' : 'text-gray-300'}`} />
                      {file ? <span className="text-blue-600 font-bold">{file.name}</span> : <span className="text-gray-400 text-sm">Upload assignment worksheet</span>}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={loading}
                className="px-12 py-4 bg-blue-600 text-white font-black uppercase tracking-[0.15em] text-sm rounded-[1.5rem] hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50"
              >
                {loading ? 'Publishing...' : 'Publish Assignment'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* List Assignments */}
      <div className="space-y-6">
        <h2 className="text-2xl font-black text-gray-900 tracking-tight">Active & Past Coursework</h2>

        {fetching ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[1, 2].map(i => <div key={i} className="h-64 bg-gray-50 rounded-[2.5rem] animate-pulse" />)}
          </div>
        ) : assignments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {assignments.map((a: any) => {
              const isExpired = new Date(a.due_date) < new Date() && a.status === 'active';
              return (
                <div key={a.id} className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-gray-100 border border-gray-50 hover:border-blue-100 transition-all group relative overflow-hidden">
                  <div className={`absolute top-0 right-0 px-6 py-2 rounded-bl-2xl text-[10px] font-black uppercase tracking-widest ${a.status === 'closed' ? 'bg-gray-100 text-gray-500' : isExpired ? 'bg-orange-100 text-orange-600' : 'bg-emerald-100 text-emerald-600'
                    }`}>
                    {a.status === 'closed' ? 'Closed' : isExpired ? 'Expired (Active)' : 'Active'}
                  </div>

                  <div className="flex justify-between items-start mb-6">
                    <div className="flex gap-3">
                      <div className={`p-4 rounded-2xl ${a.status === 'closed' ? 'bg-gray-50 text-gray-400' : 'bg-blue-50 text-blue-600'}`}>
                        <BookOpen size={28} />
                      </div>
                      <div>
                        <div className="flex gap-2 mb-1">
                          <span className="text-[9px] font-black uppercase tracking-widest text-blue-600 px-2 py-0.5 bg-blue-50 rounded">{a.subject_name}</span>
                          <span className="text-[9px] font-black uppercase tracking-widest text-gray-500 px-2 py-0.5 bg-gray-50 rounded">{a.class_name}</span>
                        </div>
                        <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">{a.title}</h3>
                      </div>
                    </div>
                  </div>

                  <p className="text-gray-500 font-medium mb-8 line-clamp-3 text-sm">
                    {a.description || 'No instructions provided.'}
                  </p>

                  <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                    <div className="flex items-center gap-2 text-gray-400">
                      <Clock size={16} />
                      <span className="text-xs font-black uppercase tracking-widest">Due: {new Date(a.due_date).toLocaleDateString()}</span>
                    </div>

                    <div className="flex gap-2">
                      {a.file_path && (
                        <a href={`http://localhost:3000${a.file_path}`} target="_blank" rel="noreferrer" className="p-3 bg-gray-50 text-gray-600 rounded-xl hover:bg-gray-100 transition">
                          <Download size={18} />
                        </a>
                      )}
                      <button
                        onClick={() => handleToggleStatus(a.id, a.status)}
                        className={`p-3 rounded-xl transition ${a.status === 'active' ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}
                        title={a.status === 'active' ? 'Close Assignment' : 'Reopen Assignment'}
                      >
                        {a.status === 'active' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                      </button>
                      <button
                        onClick={() => handleDelete(a.id)}
                        className="p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-gray-50 p-20 rounded-[3rem] text-center border-2 border-dashed border-gray-200">
            <Layers className="mx-auto h-16 w-16 text-gray-200 mb-4" />
            <h3 className="text-xl font-bold text-gray-900">No assignments created</h3>
            <p className="text-gray-500 mt-2">Publish your first assignment to get started!</p>
          </div>
        )}
      </div>
    </div>
  );
};
