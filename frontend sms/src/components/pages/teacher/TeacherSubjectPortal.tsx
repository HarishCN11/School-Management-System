import { useState, useEffect } from 'react';
import api, {
    assignmentService,
    materialService,
    teacherPortalService
} from '../../../services/api';
import { toast } from 'sonner';
import {
    FileText,
    Upload,
    CheckCircle,
    ArrowLeft,
    BookOpen,
    Users,
    MessageCircle,
    Download,
    Plus,
    Trash2,
    Send,
    Calendar,
    Clock,
    X,
    Presentation,
    GraduationCap
} from 'lucide-react';

export const TeacherSubjectPortal = ({ onNavigate, data }: any) => {
    const [activeTab, setActiveTab] = useState<'assignments' | 'materials' | 'students' | 'feedback'>('assignments');
    const [loading, setLoading] = useState(true);

    // Data State
    const [assignments, setAssignments] = useState<any[]>([]);
    const [materials, setMaterials] = useState<any[]>([]);
    const [students, setStudents] = useState<any[]>([]);
    const [feedback, setFeedback] = useState<any[]>([]);
    const [submissions, setSubmissions] = useState<any[]>([]);

    // Selection state for subject/class
    const subjectId = data?.subject_id;
    const classId = data?.class_id;
    const teacherId = Number(localStorage.getItem('roleId')) || 0;

    // Modals/Forms State
    const [showAssignForm, setShowAssignForm] = useState(false);
    const [showUploadForm, setShowUploadForm] = useState(false);
    const [selectedSub, setSelectedSub] = useState<any | null>(null);

    // Form Fields
    const [assignTitle, setAssignTitle] = useState('');
    const [assignDesc, setAssignDesc] = useState('');
    const [dueDate, setDueDate] = useState('');

    const [materialTitle, setMaterialTitle] = useState('');
    const [materialDesc, setMaterialDesc] = useState('');
    const [file, setFile] = useState<File | null>(null);

    // Grading fields
    const [marks, setMarks] = useState('');
    const [remarks, setRemarks] = useState('');

    useEffect(() => {
        if (!subjectId || !classId) {
            onNavigate('teacher-classes');
            return;
        }
        fetchAllData();
    }, [subjectId, classId]);

    const fetchAllData = async () => {
        try {
            setLoading(true);
            const [allAssignments, allMaterials, classStudents, myFeedback, allSubmissions] = await Promise.all([
                assignmentService.getByClass(classId),
                materialService.getByClass(classId),
                teacherPortalService.getClassStudents(classId),
                teacherPortalService.getMyFeedback(),
                assignmentService.getAllSubmissions()
            ]);

            setAssignments(allAssignments.filter((a: any) => Number(a.subject_id) === Number(subjectId)));
            setMaterials(allMaterials.filter((m: any) => Number(m.subject_id) === Number(subjectId)));
            setStudents(classStudents);
            setFeedback(myFeedback.filter((f: any) => f.class_id === classId || !f.class_id));
            setSubmissions(allSubmissions.filter((s: any) => assignments.some(a => a.id === s.assignment_id)));

        } catch (error) {
            console.error(error);
            toast.error('Failed to load portal data');
        } finally {
            setLoading(false);
        }
    };

    const handleAssign = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await assignmentService.createAssignment({
                title: assignTitle,
                description: assignDesc,
                class_id: classId,
                subject_id: subjectId,
                due_date: dueDate
            });
            toast.success('Assignment Assigned!');
            setShowAssignForm(false);
            setAssignTitle('');
            setAssignDesc('');
            setDueDate('');
            fetchAllData();
        } catch (err) {
            toast.error('Failed to assign');
        }
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) return;
        try {
            const formData = new FormData();
            formData.append('title', materialTitle);
            formData.append('description', materialDesc);
            formData.append('class_id', String(classId));
            formData.append('subject_id', String(subjectId));
            formData.append('teacher_id', String(teacherId));
            formData.append('file', file);

            await materialService.uploadMaterial(formData);
            toast.success('Material Uploaded!');
            setShowUploadForm(false);
            setMaterialTitle('');
            setMaterialDesc('');
            setFile(null);
            fetchAllData();
        } catch (err) {
            toast.error('Upload failed');
        }
    };

    const handleGrade = async () => {
        if (!selectedSub || !marks) return;
        try {
            await assignmentService.gradeSubmission(selectedSub.id, { marks, remarks });
            toast.success('Graded Successfully');
            setSelectedSub(null);
            setMarks('');
            setRemarks('');
            fetchAllData();
        } catch (err) {
            toast.error('Grading failed');
        }
    };

    if (!data) return <div>No Subject Selected</div>;

    return (
        <div className="space-y-6 animate-in fade-in duration-500 max-w-7xl mx-auto pb-12">
            {/* Premium Header */}
            <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
                {/* Background Decorative Accent */}
                <div className="absolute top-0 right-0 h-full w-32 bg-blue-600 opacity-[0.03] -skew-x-12 translate-x-16"></div>

                <div className="flex items-center gap-6 z-10">
                    <button
                        onClick={() => onNavigate('teacher-classes')}
                        className="group flex items-center justify-center h-14 w-14 rounded-[1.25rem] bg-gray-50 hover:bg-blue-600 border border-gray-100 transition-all duration-300 shadow-sm"
                    >
                        <ArrowLeft className="h-6 w-6 text-gray-400 group-hover:text-white transition-colors" />
                    </button>
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-blue-100">Portal ID: {subjectId}{classId}</span>
                            <h1 className="text-4xl font-black text-gray-900 tracking-tight">{data.subject_name}</h1>
                        </div>
                        <div className="flex items-center gap-3 text-gray-500 font-bold uppercase tracking-wider text-xs">
                            <Presentation size={14} className="text-blue-600" />
                            <span>{data.class_name}</span>
                        </div>
                    </div>
                </div>

                <div className="flex p-1.5 gap-1.5 bg-gray-50 rounded-[1.5rem] border border-gray-100 w-fit z-10">
                    {[
                        { id: 'assignments', icon: FileText, label: 'Assignments' },
                        { id: 'materials', icon: BookOpen, label: 'Materials' },
                        { id: 'students', icon: Users, label: 'Students' },
                        { id: 'feedback', icon: MessageCircle, label: 'Feedback' },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${activeTab === tab.id ? 'bg-white text-blue-600 shadow-xl shadow-blue-500/5 translate-y-[-1px]' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            <tab.icon className="h-4 w-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="flex h-96 items-center justify-center">
                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent shadow-xl"></div>
                </div>
            ) : (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                    {/* ASSIGNMENTS TAB */}
                    {activeTab === 'assignments' && (
                        <div className="space-y-8">
                            <div className="grid gap-8 lg:grid-cols-3">
                                {/* Assignment List */}
                                <div className="lg:col-span-2 space-y-6">
                                    <div className="flex items-center justify-between">
                                        <h2 className="text-2xl font-black text-gray-900">Active Assignments</h2>
                                        <button
                                            onClick={() => setShowAssignForm(!showAssignForm)}
                                            className="px-6 py-3 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition shadow-lg shadow-blue-200"
                                        >
                                            {showAssignForm ? 'List View' : 'New Assignment'}
                                        </button>
                                    </div>

                                    {showAssignForm ? (
                                        <div className="bg-white p-8 rounded-[2rem] border-2 border-blue-100 shadow-xl shadow-blue-500/5">
                                            <h3 className="text-xl font-black text-gray-900 mb-6">Create New Task</h3>
                                            <form onSubmit={handleAssign} className="space-y-6">
                                                <div className="grid gap-6 md:grid-cols-2">
                                                    <div className="space-y-2">
                                                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Title</label>
                                                        <input
                                                            type="text"
                                                            required
                                                            value={assignTitle}
                                                            onChange={e => setAssignTitle(e.target.value)}
                                                            placeholder="e.g. Mid-term Research Paper"
                                                            className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:bg-white outline-none font-bold transition-all"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Deadline Date</label>
                                                        <input
                                                            type="date"
                                                            required
                                                            value={dueDate}
                                                            onChange={e => setDueDate(e.target.value)}
                                                            className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:bg-white outline-none font-bold transition-all"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Description / Instructions</label>
                                                    <textarea
                                                        required
                                                        value={assignDesc}
                                                        onChange={e => setAssignDesc(e.target.value)}
                                                        placeholder="Provide details about the assignment..."
                                                        className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:bg-white outline-none font-bold transition-all h-32"
                                                    />
                                                </div>
                                                <button type="submit" className="w-full py-5 bg-blue-600 text-white rounded-[1.5rem] font-black uppercase tracking-widest hover:bg-blue-700 transition shadow-xl shadow-blue-200 flex items-center justify-center gap-3">
                                                    <Send size={20} />
                                                    Post to Classroom
                                                </button>
                                            </form>
                                        </div>
                                    ) : (
                                        <div className="grid gap-4">
                                            {assignments.map((ann) => (
                                                <div key={ann.id} className="group bg-white p-6 rounded-[2rem] border border-gray-100 hover:shadow-xl transition-all duration-300">
                                                    <div className="flex justify-between items-start mb-4">
                                                        <div className="flex items-center gap-4">
                                                            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                                                                <FileText size={20} />
                                                            </div>
                                                            <div>
                                                                <h3 className="font-black text-gray-900 group-hover:text-blue-600 transition-colors">{ann.title}</h3>
                                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-0.5 flex items-center gap-1.5">
                                                                    <Clock size={12} /> Due: {new Date(ann.due_date).toLocaleDateString()}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <button className="p-2 text-gray-300 hover:text-red-500 transition-colors">
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </div>
                                                    <p className="text-gray-500 font-medium text-sm leading-relaxed">{ann.description}</p>
                                                </div>
                                            ))}
                                            {assignments.length === 0 && (
                                                <div className="py-20 text-center bg-white rounded-[2rem] border-2 border-dashed border-gray-100">
                                                    <FileText className="mx-auto h-12 w-12 text-gray-200 mb-4" />
                                                    <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">No assignments posted yet</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Submissions Section */}
                                <div className="space-y-6">
                                    <h2 className="text-2xl font-black text-gray-900 text-center lg:text-left">Submissions List</h2>
                                    <div className="bg-white rounded-[2rem] border border-gray-100 overflow-hidden shadow-sm">
                                        <div className="max-h-[600px] overflow-y-auto">
                                            {submissions.map((sub) => (
                                                <div key={sub.id} className="p-6 border-b border-gray-50 hover:bg-gray-50 transition-colors">
                                                    <div className="flex justify-between items-start mb-3">
                                                        <div className="flex items-center gap-3">
                                                            <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-black text-xs">
                                                                {sub.student_name?.charAt(0) || 'S'}
                                                            </div>
                                                            <div>
                                                                <h4 className="font-bold text-gray-900 text-sm">{sub.student_name}</h4>
                                                                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{sub.assignment_title}</p>
                                                            </div>
                                                        </div>
                                                        {sub.marks !== null ? (
                                                            <span className="bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-lg text-[10px] font-black border border-emerald-100">{sub.marks}%</span>
                                                        ) : (
                                                            <span className="bg-amber-50 text-amber-600 px-2.5 py-1 rounded-lg text-[10px] font-black border border-amber-100">PENDING</span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center justify-between gap-4 mt-4">
                                                        <a
                                                            href={`http://localhost:3000${sub.file_path}`}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="flex items-center gap-2 text-[10px] font-bold text-blue-600 hover:underline"
                                                        >
                                                            <Download size={14} /> DOWNLOAD FILE
                                                        </a>
                                                        <button
                                                            onClick={() => setSelectedSub(sub)}
                                                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${sub.marks !== null ? 'bg-gray-100 text-gray-400 cursor-default' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-100'}`}
                                                        >
                                                            {sub.marks !== null ? 'Corrected' : 'Grade Now'}
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                            {submissions.length === 0 && (
                                                <div className="p-12 text-center">
                                                    <Clock className="mx-auto h-10 w-10 text-gray-200 mb-3" />
                                                    <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Awaiting submissions</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* MATERIALS TAB */}
                    {activeTab === 'materials' && (
                        <div className="space-y-8 max-w-4xl mx-auto">
                            <div className="flex justify-between items-center">
                                <h2 className="text-2xl font-black text-gray-900">Study Materials</h2>
                                <button
                                    onClick={() => setShowUploadForm(!showUploadForm)}
                                    className="px-6 py-3 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-700 transition shadow-lg shadow-emerald-200 flex items-center gap-2"
                                >
                                    {showUploadForm ? <X size={18} /> : <Plus size={18} />}
                                    {showUploadForm ? 'Cancel' : 'Upload Resource'}
                                </button>
                            </div>

                            {showUploadForm && (
                                <div className="bg-white p-8 rounded-[2rem] border-2 border-emerald-100 shadow-xl shadow-emerald-500/5 animate-in slide-in-from-top-4">
                                    <form onSubmit={handleUpload} className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Title</label>
                                            <input
                                                type="text"
                                                required
                                                value={materialTitle}
                                                onChange={e => setMaterialTitle(e.target.value)}
                                                placeholder="e.g. Chapter 4: Calculus Basics"
                                                className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:bg-white outline-none font-bold transition-all"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Description</label>
                                            <textarea
                                                value={materialDesc}
                                                onChange={e => setMaterialDesc(e.target.value)}
                                                placeholder="Briefly describe what this material covers..."
                                                className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:bg-white outline-none font-bold transition-all h-24"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1 block mb-2">Select Resource File</label>
                                            <div className="border-4 border-dashed border-gray-100 rounded-[2rem] p-10 text-center hover:bg-gray-50/50 hover:border-emerald-300 transition-all cursor-pointer relative group">
                                                <input
                                                    type="file"
                                                    required
                                                    onChange={e => setFile(e.target.files ? e.target.files[0] : null)}
                                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                                />
                                                <div className="flex flex-col items-center">
                                                    <div className={`p-4 rounded-full ${file ? 'bg-emerald-600 text-white' : 'bg-gray-50 text-gray-400'} mb-4 transition-colors duration-500`}>
                                                        <Upload className="h-8 w-8" />
                                                    </div>
                                                    {file ? (
                                                        <span className="text-emerald-600 font-extrabold text-sm">{file.name}</span>
                                                    ) : (
                                                        <>
                                                            <span className="text-gray-900 font-black uppercase tracking-widest text-xs">Drop or Click to Upload</span>
                                                            <span className="text-gray-400 text-[10px] font-bold mt-1">PDF, DOCX, Or Images</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <button type="submit" className="w-full py-5 bg-emerald-600 text-white rounded-[1.5rem] font-black uppercase tracking-widest hover:bg-emerald-700 transition shadow-xl shadow-emerald-200 flex items-center justify-center gap-3">
                                            <CheckCircle size={20} />
                                            Publish Material
                                        </button>
                                    </form>
                                </div>
                            )}

                            <div className="grid gap-6">
                                {materials.map((m) => (
                                    <div key={m.id} className="group flex items-center gap-6 p-6 bg-white rounded-3xl border border-gray-100 hover:shadow-xl transition-all duration-300">
                                        <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500">
                                            <BookOpen size={24} />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-black text-gray-900 mb-1">{m.title}</h3>
                                            <p className="text-sm text-gray-500 font-medium line-clamp-1">{m.description || 'No description provided.'}</p>
                                            <div className="flex items-center gap-4 mt-3">
                                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5"><Calendar size={12} /> {new Date(m.uploaded_at).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                        <a
                                            href={`http://localhost:3000${m.file_path}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="h-12 w-12 flex items-center justify-center bg-gray-50 text-gray-400 rounded-2xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                                        >
                                            <Download size={20} />
                                        </a>
                                    </div>
                                ))}
                                {materials.length === 0 && (
                                    <div className="py-20 text-center bg-white rounded-[2rem] border-2 border-dashed border-gray-100">
                                        <BookOpen className="mx-auto h-12 w-12 text-gray-200 mb-4" />
                                        <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">No study materials found</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* STUDENTS TAB */}
                    {activeTab === 'students' && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-2xl font-black text-gray-900">Class Roster</h2>
                                <div className="bg-blue-50 px-4 py-2 rounded-xl text-blue-600 text-xs font-black uppercase tracking-widest border border-blue-100">
                                    {students.length} Total Students
                                </div>
                            </div>

                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {students.map((stu) => (
                                    <div key={stu.id} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex items-center gap-5">
                                        <div className="h-16 w-16 rounded-[1.25rem] bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-100">
                                            {stu.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 className="font-black text-gray-900">{stu.name}</h3>
                                            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">Roll No: {stu.roll_number || 'N/A'}</p>
                                            <p className="text-xs text-blue-600 font-medium">{stu.email}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* FEEDBACK TAB */}
                    {activeTab === 'feedback' && (
                        <div className="space-y-6 max-w-4xl mx-auto">
                            <h2 className="text-2xl font-black text-gray-900 mb-8 flex items-center gap-3">
                                <div className="h-10 w-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center transition-transform hover:scale-110">
                                    <MessageCircle />
                                </div>
                                Portal Feedback
                            </h2>

                            <div className="space-y-4">
                                {feedback.map((f) => (
                                    <div key={f.id} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/20 relative">
                                        <div className="flex items-center gap-4 mb-6">
                                            <div className="h-12 w-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 font-black">
                                                {f.parent_name?.charAt(0) || 'P'}
                                            </div>
                                            <div>
                                                <h4 className="font-black text-gray-900">{f.parent_name}</h4>
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-0.5">Contact: {f.parent_email}</p>
                                            </div>
                                            <div className="ml-auto text-[10px] font-black text-gray-300 uppercase tracking-widest">
                                                {new Date(f.created_at).toLocaleDateString()}
                                            </div>
                                        </div>
                                        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 italic text-gray-600 font-medium leading-relaxed">
                                            "{f.message}"
                                        </div>
                                    </div>
                                ))}
                                {feedback.length === 0 && (
                                    <div className="py-20 text-center bg-white rounded-[2rem] border-2 border-dashed border-gray-100">
                                        <MessageCircle className="mx-auto h-12 w-12 text-gray-200 mb-4" />
                                        <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">No feedback received</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Grading Modal */}
            {selectedSub && (
                <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-[60] p-6">
                    <div className="bg-white rounded-[3rem] w-full max-w-xl p-10 shadow-[0_30px_100px_rgba(0,0,0,0.2)] animate-in zoom-in-95 duration-300 relative">
                        <button
                            onClick={() => setSelectedSub(null)}
                            className="absolute top-8 right-8 p-3 bg-gray-50 text-gray-400 hover:text-red-500 rounded-2xl transition-all"
                        >
                            <X size={20} />
                        </button>

                        <div className="flex items-center gap-4 mb-8">
                            <div className="h-14 w-14 bg-blue-50 text-blue-600 rounded-[1.5rem] flex items-center justify-center">
                                <GraduationCap size={32} />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-gray-900">Grading System</h3>
                                <p className="text-sm font-medium text-gray-500">{selectedSub.student_name}</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Assigned Marks (0-100)</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={marks}
                                        onChange={e => setMarks(e.target.value)}
                                        placeholder="Enter percentage score"
                                        className="w-full px-6 py-5 bg-gray-50 border border-gray-100 rounded-[1.5rem] focus:ring-4 focus:ring-blue-500/10 outline-none font-black text-xl transition-all"
                                        max="100"
                                    />
                                    <div className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-300 font-black text-xl">%</div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Teacher's Remarks / Feedback</label>
                                <textarea
                                    value={remarks}
                                    onChange={e => setRemarks(e.target.value)}
                                    placeholder="Well done! Excellent research and clarity..."
                                    className="w-full px-6 py-5 bg-gray-50 border border-gray-100 rounded-[1.5rem] focus:ring-4 focus:ring-blue-500/10 outline-none font-bold transition-all h-32"
                                />
                            </div>
                        </div>

                        <div className="flex gap-4 mt-10">
                            <button
                                onClick={() => setSelectedSub(null)}
                                className="flex-1 py-4 bg-gray-50 text-gray-500 font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-gray-100 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleGrade}
                                className="flex-[2] py-4 bg-blue-600 text-white font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-blue-700 shadow-xl shadow-blue-200 transition-all active:scale-95"
                            >
                                Publish Mark
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
