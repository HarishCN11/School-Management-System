import { useEffect, useState } from 'react';
import { teacherPortalService, messageService } from '../../../services/api';
import {
  BookOpen, Presentation, ChevronRight, GraduationCap, Users, Package,
  Send, X, Eye, Phone, Mail, MapPin, Hash, User
} from 'lucide-react';
import { toast } from 'sonner';

export const TeacherClasses = ({ onNavigate }: any) => {
  const [subjects, setSubjects] = useState<any[]>([]);
  const [managedClass, setManagedClass] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageSubject, setMessageSubject] = useState('');
  const [messageContent, setMessageContent] = useState('');
  const [viewStudents, setViewStudents] = useState(false);
  const [viewInventory, setViewInventory] = useState(false);

  // Student detail modal state
  const [selectedStudent, setSelectedStudent] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [subjectsData, managedClassData] = await Promise.all([
        teacherPortalService.getMySubjects(),
        teacherPortalService.getManagedClassDetails(),
      ]);

      // Deduplicate subjects by subject_name
      const seenNames = new Set<string>();
      const uniqueSubjects = subjectsData.filter((item: any) => {
        if (seenNames.has(item.subject_name)) return false;
        seenNames.add(item.subject_name);
        return true;
      });
      setSubjects(uniqueSubjects);

      if (managedClassData.isClassTeacher) {
        setManagedClass(managedClassData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load classes info');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await messageService.send({
        receiver_role: 'admin',
        subject: messageSubject || `Concern from ${managedClass?.classInfo?.name} Teacher`,
        message: messageContent
      });
      toast.success('Message sent to admin');
      setShowMessageModal(false);
      setMessageContent('');
      setMessageSubject('');
    } catch (error) {
      toast.error('Failed to send message');
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent shadow-lg"></div>
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-in fade-in duration-500 max-w-7xl mx-auto pb-20">

      {/* Managed Class Section */}
      {managedClass && (
        <section className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gray-100 pb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-200">
                  <GraduationCap size={24} />
                </div>
                <h2 className="text-3xl font-black text-gray-900 tracking-tight">My Managed Class</h2>
              </div>
              <p className="text-gray-500 font-medium">
                You are the responsible teacher for <span className="text-blue-600 font-bold">{managedClass.classInfo.name}</span>
              </p>
            </div>
            <button
              onClick={() => setShowMessageModal(true)}
              className="flex items-center gap-2 px-6 py-2.5 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition shadow-lg shadow-gray-200 active:scale-95 text-sm font-bold"
            >
              <Send size={18} />
              Message Admin
            </button>
          </div>

          {/* Class Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Students Card */}
            <div className="bg-white p-8 rounded-[2rem] shadow-xl shadow-gray-100 border border-gray-50 flex items-center gap-6 group hover:border-blue-100 transition-colors">
              <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl group-hover:scale-110 transition-transform">
                <Users size={32} />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Total Students</p>
                <p className="text-4xl font-black text-gray-900">{managedClass.studentCount}</p>
                <button
                  onClick={() => setViewStudents(!viewStudents)}
                  className="text-xs font-black text-blue-600 mt-2 hover:underline uppercase tracking-tighter"
                >
                  {viewStudents ? 'Hide List' : 'View Student Directory'}
                </button>
              </div>
            </div>

            {/* Inventory View-Only Card */}
            <div className="md:col-span-2 bg-white p-8 rounded-[2rem] shadow-xl shadow-gray-100 border border-gray-50 flex flex-col justify-center">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl">
                    <Package size={32} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Allocated Resources</p>
                    <p className="text-2xl font-black text-gray-900">{managedClass.inventory.length} Item Types</p>
                  </div>
                </div>
                {managedClass.inventory.length > 0 && (
                  <button
                    onClick={() => setViewInventory(!viewInventory)}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100 transition text-[10px] font-black uppercase tracking-widest"
                  >
                    <Eye size={14} />
                    {viewInventory ? 'Hide' : 'View All'}
                  </button>
                )}
              </div>

              {managedClass.inventory.length > 0 ? (
                viewInventory ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-100">
                          <th className="pb-3 pr-4">Item</th>
                          <th className="pb-3 pr-4">Quantity</th>
                          <th className="pb-3">Reason</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {managedClass.inventory.map((inv: any) => (
                          <tr key={inv.id}>
                            <td className="py-2 pr-4 font-bold text-gray-800">{inv.item_name}</td>
                            <td className="py-2 pr-4 font-bold text-gray-600">{inv.quantity}</td>
                            <td className="py-2 text-gray-500 text-xs">{inv.reason || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {managedClass.inventory.slice(0, 4).map((inv: any) => (
                      <span key={inv.id} className="px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-full text-xs font-bold text-gray-600">
                        {inv.item_name} ({inv.quantity})
                      </span>
                    ))}
                    {managedClass.inventory.length > 4 && (
                      <span className="px-3 py-1.5 bg-gray-100 rounded-full text-xs font-bold text-gray-400">
                        +{managedClass.inventory.length - 4} more
                      </span>
                    )}
                  </div>
                )
              ) : (
                <p className="text-sm text-gray-400 font-medium italic">No inventory items allocated to this class yet.</p>
              )}
            </div>
          </div>

          {/* Student Directory Table */}
          {viewStudents && (
            <div className="bg-white rounded-[2rem] shadow-2xl shadow-gray-200/50 border border-gray-100 overflow-hidden animate-in slide-in-from-top-4">
              <div className="p-6 bg-gray-50/50 border-b border-gray-100 flex justify-between items-center">
                <h3 className="text-lg font-black text-gray-900">Student Directory — {managedClass.classInfo.name}</h3>
                <button onClick={() => setViewStudents(false)} className="p-2 hover:bg-gray-200 rounded-full transition"><X size={20} /></button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 border-b border-gray-50">
                      <th className="px-8 py-4">Student</th>
                      <th className="px-8 py-4">Admission #</th>
                      <th className="px-8 py-4">Parent</th>
                      <th className="px-8 py-4">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {managedClass.students.map((student: any) => (
                      <tr
                        key={student.student_id}
                        className="hover:bg-blue-50/30 transition-colors group cursor-pointer"
                        onClick={() => setSelectedStudent(student)}
                      >
                        <td className="px-8 py-5">
                          <div className="font-black text-gray-900 group-hover:text-blue-600 transition-colors uppercase tracking-tight">{student.student_name}</div>
                          <div className="text-xs font-bold text-gray-400 tracking-tighter">{student.student_email}</div>
                        </td>
                        <td className="px-8 py-5 text-sm font-black text-gray-500">{student.admission_number}</td>
                        <td className="px-8 py-5">
                          {student.parent_name ? (
                            <div>
                              <div className="font-bold text-gray-800 text-sm">{student.parent_name}</div>
                              <div className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{student.parent_phone}</div>
                            </div>
                          ) : (
                            <span className="text-xs text-orange-400 font-bold italic">Not Linked</span>
                          )}
                        </td>
                        <td className="px-8 py-5">
                          <button
                            onClick={(e) => { e.stopPropagation(); setSelectedStudent(student); }}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-black hover:bg-blue-100 transition"
                          >
                            <Eye size={12} />
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>
      )}

      {/* Subject Portals Section */}
      <section className="space-y-6">
        <div className="flex flex-col gap-2 mb-4">
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">Subject Portals</h2>
          <p className="text-gray-500 font-medium">Select a subject portal to manage assignments, grading, and study materials.</p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {subjects.length > 0 ? (
            subjects.map((item, index) => {
              const colors = ['bg-blue-600', 'bg-emerald-600', 'bg-purple-600', 'bg-orange-600', 'bg-pink-600', 'bg-indigo-600', 'bg-teal-600', 'bg-rose-600'];
              const themeColor = colors[index % colors.length];

              return (
                <div
                  key={`${item.class_id}-${item.subject_id}`}
                  onClick={() => onNavigate('teacher-subject-portal', item)}
                  className="group relative cursor-pointer overflow-hidden rounded-[2.5rem] bg-white shadow-xl shadow-gray-200/50 ring-1 ring-gray-100 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-blue-500/10"
                >
                  <div className={`h-40 ${themeColor} flex flex-col items-center justify-center p-6 text-white relative`}>
                    <BookOpen className="h-12 w-12 opacity-90 group-hover:scale-110 transition-transform duration-500 mb-2" />
                    <div className="absolute -bottom-10 -right-10 h-32 w-32 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all"></div>
                  </div>

                  <div className="p-8">
                    <h3 className="text-2xl font-black text-gray-900 group-hover:text-blue-600 transition-colors mb-2 line-clamp-1 uppercase tracking-tight">
                      {item.subject_name}
                    </h3>

                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl border border-gray-100 mb-6 font-bold text-gray-600">
                      <Presentation size={18} className="text-blue-600" />
                      <span>{item.class_name}</span>
                    </div>

                    <div className="flex items-center justify-between group/btn">
                      <span className="text-sm font-bold text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">Open Portal</span>
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-200 transition-all group-hover:translate-x-1">
                        <ChevronRight className="h-5 w-5" />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full py-20 text-center bg-white rounded-[2.5rem] border-2 border-dashed border-gray-100">
              <GraduationCap className="mx-auto h-16 w-16 text-gray-200 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">No Subject Assignments</h3>
              <p className="text-gray-500 max-w-sm mx-auto">You haven't been assigned to any subjects in the class schedule yet.</p>
            </div>
          )}
        </div>
      </section>

      {/* Student Full Detail Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setSelectedStudent(null)}>
          <div
            className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl animate-in fade-in zoom-in duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-8 border-b border-gray-100 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center text-2xl font-black uppercase">
                  {selectedStudent.student_name?.charAt(0)}
                </div>
                <div>
                  <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">{selectedStudent.student_name}</h2>
                  <p className="text-sm text-blue-600 font-bold">{managedClass?.classInfo?.name}</p>
                </div>
              </div>
              <button onClick={() => setSelectedStudent(null)} className="p-3 hover:bg-gray-100 rounded-2xl text-gray-400 transition">
                <X size={24} />
              </button>
            </div>

            <div className="p-8 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 rounded-2xl">
                  <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Admission No.</p>
                  <p className="font-black text-blue-900 text-lg">{selectedStudent.admission_number}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-2xl">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Class</p>
                  <p className="font-black text-gray-900">{managedClass?.classInfo?.name || '-'}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl">
                  <Mail size={18} className="text-gray-400 flex-shrink-0" />
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Email</p>
                    <p className="font-bold text-gray-800">{selectedStudent.student_email || '-'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl">
                  <MapPin size={18} className="text-gray-400 flex-shrink-0" />
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Address</p>
                    <p className="font-bold text-gray-800">{selectedStudent.student_address || 'Not provided'}</p>
                  </div>
                </div>
              </div>

              {/* Parent Details */}
              <div className="mt-2">
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3 px-1">Parent / Guardian</p>
                {selectedStudent.parent_name ? (
                  <div className="p-5 bg-emerald-50 rounded-2xl border border-emerald-100 space-y-3">
                    <div className="flex items-center gap-3">
                      <User size={18} className="text-emerald-500" />
                      <p className="font-bold text-emerald-900">{selectedStudent.parent_name}</p>
                    </div>
                    {selectedStudent.parent_phone && (
                      <div className="flex items-center gap-3">
                        <Phone size={18} className="text-emerald-500" />
                        <p className="font-bold text-emerald-800">{selectedStudent.parent_phone}</p>
                      </div>
                    )}
                    {selectedStudent.parent_email && (
                      <div className="flex items-center gap-3">
                        <Mail size={18} className="text-emerald-500" />
                        <p className="font-bold text-emerald-800">{selectedStudent.parent_email}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-5 bg-orange-50 rounded-2xl border border-orange-100">
                    <p className="text-sm text-orange-500 font-bold">No parent account linked to this student.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Message Admin Modal */}
      {showMessageModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-8 border-b border-gray-100 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-black text-gray-900 tracking-tight">Support Inquiry</h2>
                <p className="text-sm text-gray-500 font-bold">Send concern to administration</p>
              </div>
              <button onClick={() => setShowMessageModal(false)} className="p-3 hover:bg-gray-100 rounded-2xl text-gray-400 transition">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSendMessage} className="p-8 space-y-6">
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-2 px-1">Subject</label>
                <input
                  type="text"
                  required
                  value={messageSubject}
                  onChange={e => setMessageSubject(e.target.value)}
                  className="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-transparent focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-50 outline-none transition-all font-bold"
                  placeholder="e.g. Resource request for Grade 1"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-2 px-1">Message</label>
                <textarea
                  rows={4}
                  required
                  value={messageContent}
                  onChange={e => setMessageContent(e.target.value)}
                  className="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-transparent focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-50 outline-none transition-all font-bold resize-none"
                  placeholder="Describe your concern..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowMessageModal(false)}
                  className="flex-1 py-4 text-gray-500 font-black uppercase tracking-widest text-xs hover:bg-gray-100 rounded-2xl transition"
                >
                  Discard
                </button>
                <button
                  type="submit"
                  className="flex-[2] py-4 bg-blue-600 text-white font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-200 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <Send size={16} />
                  Send to Admin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
