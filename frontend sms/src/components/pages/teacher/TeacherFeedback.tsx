import React, { useEffect, useState } from 'react';
import {
  MessageSquare,
  User,
  Calendar,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  MoreVertical,
  Mail,
  Reply,
  GraduationCap
} from 'lucide-react';
import { feedbackService } from '../../../services/api';
import { toast } from 'sonner';

export const TeacherFeedback = ({ onNavigate }: any) => {
  const [parentFeedback, setParentFeedback] = useState<any[]>([]);
  const [studentFeedback, setStudentFeedback] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'parent' | 'student'>('parent');

  useEffect(() => {
    fetchFeedback();
  }, []);

  const fetchFeedback = async () => {
    try {
      const [parentData, studentData] = await Promise.all([
        feedbackService.getTeacherReceived(),
        feedbackService.getTeacherStudentFeedback()
      ]);
      setParentFeedback(parentData || []);
      setStudentFeedback(studentData || []);
    } catch (error) {
      toast.error('Failed to load feedback');
    } finally {
      setLoading(false);
    }
  };

  const currentList = activeTab === 'parent' ? parentFeedback : studentFeedback;

  const filteredFeedback = currentList.filter(item => {
    const name = activeTab === 'parent' ? item.parent_name : item.student_name;
    return (name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (item.message?.toLowerCase() || '').includes(searchQuery.toLowerCase());
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Feedback Portal</h1>
          <p className="text-gray-500">Review communication from parents and students.</p>
        </div>
        <div className="flex gap-2">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search feedback..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
            />
          </div>
        </div>
      </div>

      <div className="flex gap-4 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('parent')}
          className={`pb-4 px-2 font-bold text-sm transition-colors border-b-2 ${activeTab === 'parent' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          <User className="inline-block mr-2" size={16} /> Parent Feedback
        </button>
        <button
          onClick={() => setActiveTab('student')}
          className={`pb-4 px-2 font-bold text-sm transition-colors border-b-2 ${activeTab === 'student' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          <GraduationCap className="inline-block mr-2" size={16} /> Student Feedback
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mt-4">
        {/* Stats */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm col-span-1 border-t-4 border-t-blue-500">
          <div className="space-y-6">
            <div>
              <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1 px-1">Total {activeTab === 'parent' ? 'Parent' : 'Student'} Feedback</p>
              <h3 className="text-4xl font-black text-blue-600">{currentList.length}</h3>
            </div>
            {activeTab === 'parent' ? (
               <div className="p-4 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl text-white">
                 <h4 className="font-bold mb-2 flex items-center gap-2">
                   <CheckCircle2 size={16} /> Parent Tips
                 </h4>
                 <p className="text-xs opacity-90 leading-relaxed">
                   Regularly responding to parent feedback builds trust and helps in the child's academic development.
                 </p>
               </div>
            ) : (
                <div className="p-4 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl text-white">
                 <h4 className="font-bold mb-2 flex items-center gap-2">
                   <CheckCircle2 size={16} /> Student Tips
                 </h4>
                 <p className="text-xs opacity-90 leading-relaxed">
                   Listen to your students. Honest feedback helps improve your teaching methods and increases engagement.
                 </p>
               </div>
            )}
          </div>
        </div>

        {/* Feedback List */}
        <div className="lg:col-span-3 space-y-4">
          {filteredFeedback.length > 0 ? (
            filteredFeedback.map((item) => (
              <div key={item.id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all group">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-500 font-bold text-lg transition-all ${activeTab === 'student' ? 'group-hover:from-indigo-100 group-hover:to-indigo-200 group-hover:text-indigo-600' : 'group-hover:from-blue-100 group-hover:to-blue-200 group-hover:text-blue-600'}`}>
                      {(activeTab === 'parent' ? item.parent_name : item.student_name)?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold text-gray-900">{activeTab === 'parent' ? item.parent_name : item.student_name}</h4>
                        <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border ${activeTab === 'parent' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-indigo-50 text-indigo-600 border-indigo-100'}`}>
                          {activeTab === 'parent' ? 'Parent' : 'Student'}
                        </span>
                      </div>
                      {activeTab === 'parent' && (
                        <p className="text-sm text-gray-500 flex items-center gap-1">
                          <Mail size={14} />
                          {item.parent_email}
                        </p>
                      )}
                      {activeTab === 'student' && item.class_name && (
                         <p className="text-sm text-gray-500 flex items-center gap-1">
                           <GraduationCap size={14} />
                           {item.class_name}
                         </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400 bg-gray-50 px-3 py-1.5 rounded-xl">
                      <Clock size={14} />
                      {new Date(item.created_at).toLocaleDateString(undefined, {
                        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                      })}
                    </div>
                  </div>
                </div>

                <div className={`mt-6 p-5 bg-gray-50 border-l-4 rounded-r-2xl ${activeTab === 'parent' ? 'border-blue-500' : 'border-indigo-500'}`}>
                  <p className="text-gray-700 leading-relaxed font-serif text-lg">
                    "{item.message}"
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white p-20 rounded-3xl border border-dashed border-gray-200 text-center">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <MessageSquare size={40} className="text-gray-300" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No feedback found</h3>
              <p className="text-gray-500 max-w-sm mx-auto">
                {searchQuery ? `No feedback matching "${searchQuery}" was found.` : `You haven't received any feedback from ${activeTab}s recently.`}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
