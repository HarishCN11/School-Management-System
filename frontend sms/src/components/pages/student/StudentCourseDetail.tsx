import React, { useEffect, useState } from 'react';
import { assignmentService, materialService } from '../../../services/api';
import { toast } from 'sonner';
import {
    FileText,
    Download,
    Upload,
    Clock,
    CheckCircle,
    ArrowLeft,
    BookOpen,
    User,
    Star,
    MessageCircle,
    GraduationCap
} from 'lucide-react';

export const StudentCourseDetail = ({ onNavigate, data }: any) => {
    const [activeTab, setActiveTab] = useState<'assignments' | 'materials'>('assignments');
    const [assignments, setAssignments] = useState<any[]>([]);
    const [materials, setMaterials] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const subject = data?.subject;

    useEffect(() => {
        if (!subject) return;
        fetchData();
    }, [subject]);

    const fetchData = async () => {
        try {
            const studentId = localStorage.getItem('roleId');
            if (!studentId) return;

            const [allAssignments, allMaterials] = await Promise.all([
                assignmentService.getStudentAssignments(Number(studentId)),
                materialService.getStudentMaterials(Number(studentId))
            ]);

            const filteredAssignments = allAssignments.filter((a: any) => a.subject_name === subject.name || a.subject_id === subject.id);
            setAssignments(filteredAssignments);

            const filteredMaterials = allMaterials.filter((m: any) => m.subject_id === subject.id);
            setMaterials(filteredMaterials);

        } catch (error) {
            console.error(error);
            toast.error('Failed to load course details');
        } finally {
            setLoading(false);
        }
    };

    const handlSubmitClick = (assignment: any) => {
        onNavigate('student-submit-assignment', { assignment });
    }

    if (!subject) return (
        <div className="flex flex-col items-center justify-center min-h-[400px] text-gray-500">
            <BookOpen size={48} className="mb-4 opacity-20" />
            <p className="font-bold">No Subject Selected</p>
        </div>
    );

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-500 max-w-6xl mx-auto">
            {/* Header */}
            <div className="bg-white p-8 rounded-[2rem] shadow-xl shadow-gray-200/50 border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                    <button
                        onClick={() => onNavigate('student-courses')}
                        className="group flex items-center justify-center h-12 w-12 rounded-2xl bg-gray-50 hover:bg-blue-600 border border-gray-100 transition-all duration-300 shadow-sm"
                    >
                        <ArrowLeft className="h-6 w-6 text-gray-400 group-hover:text-white transition-colors" />
                    </button>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <h1 className="text-3xl font-black text-gray-900 tracking-tight">{subject.name}</h1>
                        </div>
                        <div className="flex items-center gap-2 text-gray-500 font-medium">
                            <User size={16} className="text-blue-500" />
                            <span className="text-sm">Instructor: <span className="font-bold text-gray-700">{subject.teacher_name || 'Department Faculty'}</span></span>
                        </div>
                    </div>
                </div>

                <div className="flex p-1.5 gap-1.5 bg-gray-50 rounded-2xl border border-gray-100 w-fit">
                    <button
                        onClick={() => setActiveTab('assignments')}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${activeTab === 'assignments' ? 'bg-white text-blue-600 shadow-lg shadow-blue-500/5 translate-y-[-1px]' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        <FileText className="h-4 w-4" />
                        Assignments
                    </button>
                    <button
                        onClick={() => setActiveTab('materials')}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${activeTab === 'materials' ? 'bg-white text-blue-600 shadow-lg shadow-blue-500/5 translate-y-[-1px]' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        <BookOpen className="h-4 w-4" />
                        Materials
                    </button>
                </div>
            </div>

            {/* Content Area */}
            {loading ? (
                <div className="flex h-96 items-center justify-center">
                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent shadow-xl"></div>
                </div>
            ) : (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                    {activeTab === 'assignments' ? (
                        <div className="grid gap-6">
                            {assignments.length > 0 ? (
                                assignments.map((assignment) => {
                                    const isSubmitted = assignment.is_submitted > 0;
                                    const isGraded = assignment.marks !== null;

                                    return (
                                        <div key={assignment.id} className="group flex flex-col md:flex-row md:items-center justify-between gap-6 p-8 bg-white rounded-[2rem] border-2 border-transparent hover:border-blue-100 hover:shadow-[0_20px_50px_rgba(0,0,0,0.05)] transition-all duration-500 relative overflow-hidden">
                                            {isSubmitted && !isGraded && <div className="absolute top-0 right-0 px-6 py-1 bg-amber-500 text-white text-[10px] font-black uppercase tracking-widest rounded-bl-2xl">Pending Review</div>}
                                            {isGraded && <div className="absolute top-0 right-0 px-6 py-1 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest rounded-bl-2xl">Graded</div>}

                                            <div className="flex-1 space-y-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={`p-4 rounded-2xl ${isSubmitted ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
                                                        <FileText size={24} />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-xl font-black text-gray-900 group-hover:text-blue-600 transition-colors">{assignment.title}</h3>
                                                        <p className="flex items-center gap-1.5 text-xs font-bold text-gray-400 uppercase tracking-widest mt-0.5">
                                                            <Clock size={12} strokeWidth={3} />
                                                            Deadline: {new Date(assignment.due_date).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                                                        </p>
                                                    </div>
                                                </div>

                                                <p className="text-gray-500 font-medium leading-relaxed max-w-2xl">
                                                    {assignment.description}
                                                </p>

                                                {assignment.file_path && (
                                                    <div className="flex items-center gap-3 bg-blue-50/50 p-3 rounded-xl border border-blue-100 max-w-sm">
                                                        <FileText className="text-blue-600 h-5 w-5" />
                                                        <div className="flex-1 overflow-hidden">
                                                            <p className="text-xs font-bold text-gray-900 truncate">
                                                                {assignment.file_path.split('/').pop()}
                                                            </p>
                                                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">Reference Material</p>
                                                        </div>
                                                        <a
                                                            href={`http://localhost:3000${assignment.file_path}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="p-2 bg-white text-blue-600 hover:bg-blue-600 hover:text-white rounded-lg shadow-sm transition-all"
                                                            title="Download Assignment Material"
                                                            download
                                                        >
                                                            <Download size={16} />
                                                        </a>
                                                    </div>
                                                )}

                                                {isGraded && (
                                                    <div className="flex flex-wrap gap-4 mt-4">
                                                        <div className="bg-emerald-50/50 border border-emerald-100 p-4 rounded-2xl flex items-center gap-3">
                                                            <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center text-emerald-600 shadow-sm">
                                                                <Star size={20} fill="currentColor" />
                                                            </div>
                                                            <div>
                                                                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Your Mark</p>
                                                                <p className="text-xl font-black text-gray-900">{assignment.marks}%</p>
                                                            </div>
                                                        </div>
                                                        {assignment.remarks && (
                                                            <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-2xl flex items-center gap-3 flex-1 lg:max-w-md">
                                                                <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-sm">
                                                                    <MessageCircle size={20} />
                                                                </div>
                                                                <div>
                                                                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Teacher's Remark</p>
                                                                    <p className="text-sm font-bold text-gray-700 italic">"{assignment.remarks}"</p>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex items-center justify-end">
                                                {isSubmitted ? (
                                                    <div className="flex flex-col items-center gap-2">
                                                        <div className="h-14 w-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-inner">
                                                            <CheckCircle size={28} />
                                                        </div>
                                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Completed</span>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => handlSubmitClick(assignment)}
                                                        className="group/btn relative px-8 py-4 bg-blue-600 text-white rounded-2xl font-black text-sm transition-all hover:bg-blue-700 hover:shadow-2xl hover:shadow-blue-200 active:scale-95 flex items-center gap-3"
                                                    >
                                                        <Upload className="h-5 w-5 group-hover/btn:-translate-y-1 transition-transform" />
                                                        Submit Now
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="text-center py-20 bg-white rounded-[2rem] border-2 border-dashed border-gray-100">
                                    <div className="p-6 bg-gray-50 rounded-full w-fit mx-auto mb-4">
                                        <FileText className="text-gray-300" size={40} />
                                    </div>
                                    <h3 className="text-xl font-black text-gray-900 mb-1">No Active Assignments</h3>
                                    <p className="text-gray-500 font-medium">Keep an eye out! Your instructor will post assignments here soon.</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="grid gap-6 md:grid-cols-2">
                            {materials.length > 0 ? (
                                materials.map((material) => (
                                    <div key={material.id} className="group p-6 bg-white rounded-3xl border border-gray-100 hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300 flex items-start gap-4">
                                        <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500 shadow-sm">
                                            <FileText className="h-6 w-6" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-2">
                                                <h3 className="font-black text-gray-900 truncate">{material.title}</h3>
                                                <a
                                                    href={`http://localhost:3000${material.file_path}`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                                >
                                                    <Download className="h-5 w-5" />
                                                </a>
                                            </div>
                                            <p className="text-sm text-gray-500 font-medium line-clamp-2 mb-4 leading-relaxed">{material.description}</p>
                                            <div className="flex items-center gap-4 text-[10px] font-black text-gray-400 uppercase tracking-widest border-t border-gray-50 pt-4">
                                                <span className="flex items-center gap-1"><User size={12} /> {material.teacher_name}</span>
                                                <span className="flex items-center gap-1"><Clock size={12} /> {new Date(material.uploaded_at).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-full py-20 text-center bg-white rounded-[2rem] border-2 border-dashed border-gray-100">
                                    <div className="p-6 bg-gray-50 rounded-full w-fit mx-auto mb-4">
                                        <BookOpen className="text-gray-300" size={40} />
                                    </div>
                                    <h3 className="text-xl font-black text-gray-900 mb-1">Resources Empty</h3>
                                    <p className="text-gray-500 font-medium">Reading materials and lecture notes will appear here.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
