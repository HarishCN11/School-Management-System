import { useEffect, useState } from 'react';
import { reportService } from '../../../services/api';
import { toast } from 'sonner';
import { Book } from 'lucide-react';

interface Course {
    id: number;
    name: string;
    code: string;
    teacher_name?: string;
    teacher_id?: number | null;
    theme_color?: string;
}

export const StudentCourses = ({ onNavigate }: any) => {
    const [subjects, setSubjects] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const studentId = Number(localStorage.getItem('roleId')) || 0;

    useEffect(() => {
        fetchSubjects();
    }, []);

    const fetchSubjects = async () => {
        try {
            const data = await reportService.getStudentSubjects(studentId);
            const colors = ['bg-blue-600', 'bg-emerald-600', 'bg-purple-600', 'bg-orange-600', 'bg-pink-600', 'bg-indigo-600'];

            const mapped = data.map((s: any, index: number) => ({
                ...s,
                theme_color: colors[index % colors.length]
            }));
            setSubjects(mapped);
        } catch (error) {
            console.error(error);
            toast.error('Failed to load your subjects');
        } finally {
            setLoading(false);
        }
    };

    const handleCourseClick = (subject: Course) => {
        onNavigate('student-course-detail', { subject });
    };

    if (loading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent shadow-lg"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500 max-w-7xl mx-auto p-4 md:p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Course overview</h1>

            {/* Filter Bar */}
            <div className="flex flex-wrap items-center gap-4 mb-8">
                <select className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>All</option>
                    <option>In Progress</option>
                    <option>Future</option>
                    <option>Past</option>
                </select>
                <input 
                    type="text" 
                    placeholder="Search" 
                    className="flex-1 min-w-[200px] px-4 py-2 bg-white border border-gray-300 rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />
                <select className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>Sort by course name</option>
                    <option>Sort by last accessed</option>
                </select>
                <select className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>Card</option>
                    <option>List</option>
                    <option>Summary</option>
                </select>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {subjects.map((subject) => (
                    <div
                        key={subject.id}
                        onClick={() => handleCourseClick(subject)}
                        className="group relative cursor-pointer overflow-hidden rounded-xl bg-white border border-gray-200 shadow-sm transition-all hover:shadow-lg flex flex-col h-[280px]"
                    >
                        {/* Image Header wrapper (simulated via gradient/patterns) */}
                        <div className={`h-[140px] w-full relative overflow-hidden ${subject.theme_color || 'bg-blue-600'}`}>
                            {/* Level badge removed per user request */}
                            
                            {/* Decorative pattern for the banner */}
                            <div className="absolute inset-0 bg-black/10 mix-blend-overlay"></div>
                            <div className="absolute -bottom-8 -right-8 h-32 w-32 bg-white/20 rounded-full blur-2xl"></div>
                            <div className="absolute inset-x-0 bottom-0 p-4">
                               <h2 className="text-white font-black text-2xl leading-tight drop-shadow-md">
                                    {subject.name}
                               </h2>
                            </div>
                        </div>

                        {/* Text Content */}
                        <div className="p-4 flex-1 flex flex-col">
                            <h3 className="text-[15px] text-[#0f6cbf] hover:underline font-medium leading-snug line-clamp-2 mt-2">
                                {subject.name} (2025/26)
                            </h3>
                            
                            <div className="mt-auto self-end p-2 cursor-pointer rounded-full hover:bg-gray-100 transition-colors">
                                <div className="flex gap-0.5">
                                    <div className="w-1.5 h-1.5 bg-blue-700 rounded-full"></div>
                                    <div className="w-1.5 h-1.5 bg-blue-700 rounded-full"></div>
                                    <div className="w-1.5 h-1.5 bg-blue-700 rounded-full"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {subjects.length === 0 && (
                <div className="py-20 text-center bg-white rounded-3xl border border-dashed border-gray-200">
                    <Book className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                    <h3 className="text-lg font-bold text-gray-900">No subjects found</h3>
                    <p className="text-gray-500">Your class schedule hasn't been updated with subjects yet.</p>
                </div>
            )}
        </div>
    );
};
