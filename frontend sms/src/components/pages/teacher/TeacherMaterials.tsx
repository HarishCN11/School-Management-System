import React, { useState, useEffect } from 'react';
import { materialService, academicService, teacherPortalService, getAssetUrl } from '../../../services/api';
import { toast } from 'sonner';
import { Upload, CheckCircle, X, Plus, Trash2, FileText, Download } from 'lucide-react';

export const TeacherMaterials = ({ onNavigate }: any) => {
    const [classes, setClasses] = useState<any[]>([]);
    const [subjects, setSubjects] = useState<any[]>([]);
    const [assignedMetadata, setAssignedMetadata] = useState<any[]>([]);
    const [materials, setMaterials] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    // Form State
    const [showForm, setShowForm] = useState(false);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [classId, setClassId] = useState('');
    const [subjectId, setSubjectId] = useState('');
    const [file, setFile] = useState<File | null>(null);

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        setFetching(true);
        await Promise.all([fetchMetadata(), fetchMyMaterials()]);
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

    const fetchMyMaterials = async () => {
        try {
            const data = await teacherPortalService.getMyUploadedItems();
            setMaterials(data.materials || []);
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

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file || !classId || !subjectId) {
            toast.error('Please fill all required fields');
            return;
        }

        try {
            setLoading(true);
            const formData = new FormData();
            formData.append('title', title);
            formData.append('description', description);
            formData.append('class_id', classId);
            formData.append('subject_id', subjectId);
            formData.append('file', file);

            await materialService.uploadMaterial(formData);
            toast.success('Material Uploaded Successfully');
            setShowForm(false);
            setTitle('');
            setDescription('');
            setFile(null);
            fetchMyMaterials();
        } catch (error) {
            console.error(error);
            toast.error('Failed to upload material');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Are you sure you want to delete this material?')) return;
        try {
            await materialService.delete(id);
            toast.success('Material deleted');
            fetchMyMaterials();
        } catch (error) {
            toast.error('Failed to delete');
        }
    };

    return (
        <div className="space-y-12 animate-in fade-in duration-500 pb-20 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-gray-100 pb-8">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-2">Study Materials</h1>
                    <p className="text-gray-500 font-medium">Upload and manage educational resources for your students.</p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className={`flex items-center gap-2 px-8 py-3 rounded-2xl transition-all font-black uppercase tracking-widest text-xs shadow-lg active:scale-95 ${showForm ? 'bg-gray-100 text-gray-600' : 'bg-blue-600 text-white shadow-blue-200 hover:bg-blue-700'
                        }`}
                >
                    {showForm ? <X size={20} /> : <Plus size={20} />}
                    {showForm ? 'Cancel' : 'Upload Resource'}
                </button>
            </div>

            {showForm && (
                <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl shadow-gray-200/50 border border-gray-100 animate-in slide-in-from-top-6">
                    <h3 className="text-2xl font-black text-gray-900 mb-8 tracking-tight">Upload New Material</h3>
                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-3 px-1">Resource Title</label>
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={e => setTitle(e.target.value)}
                                        placeholder="e.g. Chapter 1: Introduction to Calculus"
                                        className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-50 outline-none transition-all font-bold text-gray-900"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-3 px-1">Description (Optional)</label>
                                    <textarea
                                        value={description}
                                        onChange={e => setDescription(e.target.value)}
                                        placeholder="Add notes or instructions for students..."
                                        className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-50 outline-none transition-all font-bold text-gray-900 h-32 resize-none"
                                    />
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-3 px-1">Target Class</label>
                                        <select
                                            value={classId}
                                            onChange={e => setClassId(e.target.value)}
                                            className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-50 outline-none transition-all font-bold text-gray-900 cursor-pointer"
                                            required
                                        >
                                            <option value="">Select</option>
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
                                            <option value="">{classId ? 'Select' : 'Select Class First'}</option>
                                            {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-3 px-1">Attachment</label>
                                    <div className="border-4 border-dashed border-gray-100 rounded-[2rem] p-8 text-center hover:bg-blue-50/50 hover:border-blue-100 transition-all cursor-pointer relative group">
                                        <input
                                            type="file"
                                            onChange={handleFileChange}
                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                            required
                                        />
                                        <div className="flex flex-col items-center">
                                            <Upload className={`h-12 w-12 mb-4 transition-colors ${file ? 'text-blue-600' : 'text-gray-300 group-hover:text-blue-400'}`} />
                                            {file ? (
                                                <div className="space-y-1">
                                                    <span className="block text-blue-600 font-black tracking-tight">{file.name}</span>
                                                    <span className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Click to change file</span>
                                                </div>
                                            ) : (
                                                <div className="space-y-1">
                                                    <span className="block text-gray-900 font-bold">Drag or click to upload</span>
                                                    <span className="block text-xs font-medium text-gray-400">PDF, Word, or Images (Max 10MB)</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-12 py-4 bg-blue-600 text-white font-black uppercase tracking-[0.15em] text-sm rounded-[1.5rem] hover:bg-blue-700 hover:shadow-2xl hover:shadow-blue-200 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-3"
                            >
                                {loading ? 'Processing...' : (
                                    <>
                                        <span>Publish Material</span>
                                        <CheckCircle size={18} />
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* List of My Materials */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-black text-gray-900 tracking-tight">Your Uploaded Resources</h2>
                    <span className="px-4 py-1.5 bg-gray-100 rounded-full text-[10px] font-black text-gray-500 uppercase tracking-widest">{materials.length} Total</span>
                </div>

                {fetching ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map(i => <div key={i} className="h-48 bg-gray-50 rounded-[2rem] animate-pulse" />)}
                    </div>
                ) : materials.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {materials.map((m: any) => (
                            <div key={m.id} className="bg-white p-6 rounded-[2rem] shadow-xl shadow-gray-100 border border-gray-50 hover:shadow-2xl hover:shadow-blue-500/10 transition-all group flex flex-col justify-between">
                                <div className="space-y-4">
                                    <div className="flex justify-between items-start">
                                        <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl">
                                            <FileText size={24} />
                                        </div>
                                        <button
                                            onClick={() => handleDelete(m.id)}
                                            className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
                                    <div>
                                        <div className="flex gap-2 mb-2">
                                            <span className="px-2 py-0.5 bg-gray-100 rounded-md text-[9px] font-black text-gray-500 uppercase tracking-widest">{m.class_name}</span>
                                            <span className="px-2 py-0.5 bg-blue-50 rounded-md text-[9px] font-black text-blue-600 uppercase tracking-widest">{m.subject_name}</span>
                                        </div>
                                        <h3 className="font-black text-gray-900 uppercase tracking-tight line-clamp-1">{m.title}</h3>
                                        <p className="text-sm font-medium text-gray-500 line-clamp-2 mt-1">{m.description || 'No description provided'}</p>
                                    </div>
                                </div>
                                <div className="mt-8 pt-4 border-t border-gray-50 flex items-center justify-between">
                                    <div className="text-[10px] font-bold text-gray-400">
                                        {new Date(m.uploaded_at).toLocaleDateString()}
                                    </div>
                                    <a
                                        href={getAssetUrl(m.file_path)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-2 bg-gray-900 text-white rounded-xl hover:bg-blue-600 transition shadow-lg shadow-gray-200"
                                    >
                                        <Download size={16} />
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-blue-50/50 p-20 rounded-[3rem] border-4 border-dotted border-blue-100 text-center">
                        <div className="p-6 bg-white w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-blue-100">
                            <Upload className="text-blue-300" size={40} />
                        </div>
                        <h3 className="text-xl font-black text-blue-900 tracking-tight">No resources uploaded yet</h3>
                        <p className="text-blue-700 font-medium mt-2 max-w-xs mx-auto">Start by uploading your first study material to share with your students!</p>
                    </div>
                )}
            </div>
        </div>
    );
};
