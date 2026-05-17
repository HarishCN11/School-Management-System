import { useEffect, useState } from 'react';
import {
  Download,
  TrendingUp,
  BookOpen,
  MessageCircle,
  Send,
  Loader2,
  X,
  GraduationCap
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { reportService, feedbackService } from '../../../services/api';
import { toast } from 'sonner';

export const ParentReports = ({ studentIdProp }: { studentIdProp?: number }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [classTeacher, setClassTeacher] = useState<any>(null);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  // Determine current student: 
  // If studentIdProp is provided (e.g. by Principal viewing a student), use it.
  // Otherwise, if parent -> use linkedStudentId
  // Otherwise, if student -> use roleId
  const storedRole = localStorage.getItem('role') || '';
  const isParent = storedRole.toLowerCase() === 'parent';
  
  const studentId = studentIdProp || (isParent
    ? Number(localStorage.getItem('linkedStudentId'))
    : Number(localStorage.getItem('roleId')));

  useEffect(() => {
    if (studentId) {
      fetchReport();
      fetchClassTeacher();
    } else {
      setLoading(false);
    }
  }, [studentId]);

  const fetchReport = async () => {
    try {
      const report = await reportService.getTermReport(studentId);
      setData(report);
    } catch (error) {
      toast.error('Failed to load academic reports');
    } finally {
      setLoading(false);
    }
  };

  const fetchClassTeacher = async () => {
    try {
      const teacher = await reportService.getClassTeacher(studentId);
      setClassTeacher(teacher);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !classTeacher) return;
    setSending(true);
    try {
      await feedbackService.submit({
        teacher_id: classTeacher.teacher_id,
        message: `[REPORT CONCERN - ${data.studentName}]: ${message}`,
        student_id: studentId
      });
      toast.success('Message sent to class teacher');
      setMessage('');
      setShowMessageModal(false);
    } catch (error) {
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleDownloadPDF = async () => {
    const element = document.getElementById('report-card');
    if (!element) return;

    const toastId = toast.loading('Preparing high-quality report...');
    
    try {
      // Ensure the element is fully visible before capture
      const originalStyle = element.style.height;
      element.style.height = 'auto';

      const canvas = await html2canvas(element, {
        scale: 2, // Higher scale for better quality
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: 1200 // Consistent width for predictable layout
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      const pageHeight = pdf.internal.pageSize.getHeight();
      let heightLeft = pdfHeight;
      let position = 0;

      // Add first page
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
      heightLeft -= pageHeight;

      // Add subsequent pages if necessary
      while (heightLeft > 0) {
        position = heightLeft - pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`Report_${data?.studentName || 'Student'}_${data?.academicYear || '2026'}.pdf`);
      
      element.style.height = originalStyle;
      toast.success('Report downloaded successfully!', { id: toastId });
    } catch (error) {
      console.error('PDF Generation Error:', error);
      toast.error('Direct download failed. Opening browser print dialog...', { id: toastId });
      window.print();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  if (!studentId && isParent) {
    return (
      <div className="text-center p-20 bg-gray-50 rounded-3xl border border-dashed border-gray-300">
        <BookOpen className="mx-auto text-gray-300 mb-4" size={48} />
        <h2 className="text-xl font-bold text-gray-900">No Child Linked</h2>
        <p className="text-gray-500">Contact the office to link your parent account with your student's profile.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-5xl mx-auto pb-12">
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 10mm;
          }
          body * { visibility: hidden; }
          #report-card, #report-card * { visibility: visible; }
          #report-card { 
            position: static !important; 
            width: 100% !important; 
            padding: 0 !important;
            margin: 0 !important;
            background: white !important;
            box-shadow: none !important;
            border: none !important;
            overflow: visible !important;
          }
          .no-print { display: none !important; }
          .print-colors {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Academic Record</h1>
          <p className="text-gray-500 font-medium">Official performance summary for <span className="text-blue-600 font-bold">{data?.studentName}</span></p>
        </div>
        <div className="flex flex-wrap gap-3">
          {classTeacher && (
            <button
              onClick={() => setShowMessageModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-50 text-indigo-600 rounded-xl font-bold hover:bg-indigo-100 transition-all border border-indigo-100"
            >
              <MessageCircle size={18} />
              Inquiry to Teacher
            </button>
          )}
          <button
            onClick={handleDownloadPDF}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
          >
            <Download size={20} />
            Download PDF
          </button>
        </div>
      </div>

      {/* Report Card Content */}
      <div id="report-card" className="bg-white rounded-3xl border border-gray-100 shadow-xl p-8 md:p-12 relative overflow-visible">
        <div className="absolute top-0 right-0 w-40 h-40 bg-blue-50 rounded-full -mr-20 -mt-20 opacity-40 print:hidden" />

        {/* Header */}
        <div className="text-center mb-8 border-b-2 border-gray-100 pb-8 relative z-10">
          <h2 className="text-3xl font-black text-gray-900 uppercase tracking-widest mb-1">Official Report Card</h2>
          <div className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-full text-[11px] font-black uppercase tracking-[0.15em] shadow-lg shadow-blue-200 mb-8">
            Academic Year 2026
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
              <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Student Name</p>
              <p className="font-bold text-gray-900 text-lg">{data?.studentName}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
              <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Responsible Grade</p>
              <p className="font-bold text-blue-600 text-lg">{data?.className || '-'}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
              <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Class Teacher</p>
              <p className="font-bold text-gray-900 text-lg">{classTeacher?.name || 'TBA'}</p>
            </div>
          </div>
        </div>

        {/* Performance Summary — Total, Average, Position per term */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[
            { term: 'Term 1', total: data?.stats?.term1?.total, avg: data?.stats?.term1?.avg, rank: data?.ranks?.term1, color: 'blue' },
            { term: 'Term 2', total: data?.stats?.term2?.total, avg: data?.stats?.term2?.avg, rank: data?.ranks?.term2, color: 'purple' },
            { term: 'Term 3', total: data?.stats?.term3?.total, avg: data?.stats?.term3?.avg, rank: data?.ranks?.term3, color: 'emerald' },
          ].map((t, i) => {
            const rankSuffix = t.rank && t.rank !== '-'
              ? (t.rank === 1 ? 'st' : t.rank === 2 ? 'nd' : t.rank === 3 ? 'rd' : 'th')
              : '';
            const colorMap: any = {
              blue:    { bg: 'bg-blue-50',    border: 'border-blue-200',    text: 'text-blue-600',    badge: 'bg-blue-600 text-white' },
              purple:  { bg: 'bg-purple-50',  border: 'border-purple-200',  text: 'text-purple-600',  badge: 'bg-purple-600 text-white' },
              emerald: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-600', badge: 'bg-emerald-600 text-white' },
            };
            const c = colorMap[t.color];
            return (
              <div key={i} className={`${c.bg} ${c.border} border rounded-2xl p-5`}>
                <p className={`text-[10px] font-black uppercase tracking-widest ${c.text} mb-3`}>{t.term}</p>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-xs text-gray-400 font-bold uppercase">Total</p>
                    <p className={`text-3xl font-black ${c.text}`}>{t.total ?? '—'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400 font-bold uppercase">Average</p>
                    <p className="text-xl font-black text-gray-700">{t.avg ?? '—'}</p>
                  </div>
                </div>
                <div className={`mt-3 inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black ${c.badge} min-h-[24px]`}>
                  {t.rank !== undefined && t.rank !== '-' ? `🏅 ${t.rank}${rankSuffix} in class` : 'Pending'}
                </div>
              </div>
            );
          })}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-900 text-white">
                <th rowSpan={2} className="px-6 py-5 text-left font-black uppercase text-xs tracking-widest rounded-tl-2xl">Subjects / Lessons</th>
                <th colSpan={3} className="px-6 py-2 text-center text-[10px] font-black uppercase tracking-[0.2em] border-b border-white/20">Term Performance Levels</th>
              </tr>
              <tr className="bg-gray-800 text-white">
                <th className="w-24 px-4 py-3 text-center text-[10px] font-black uppercase tracking-widest border-r border-gray-700">First</th>
                <th className="w-24 px-4 py-3 text-center text-[10px] font-black uppercase tracking-widest border-r border-gray-700">Second</th>
                <th className="w-24 px-4 py-3 text-center text-[10px] font-black uppercase tracking-widest rounded-tr-2xl">Third</th>
              </tr>
            </thead>
            <tbody className="border-x-2 border-b-2 border-gray-900">
              {data?.report.map((row: any, idx: number) => (
                <tr key={idx} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'} transition-colors hover:bg-blue-50/30`}>
                  <td className="px-6 py-4 font-bold text-gray-800 border-r border-gray-200 align-middle">
                    <span className="inline-block w-8 text-gray-300 font-black text-xs">{String(idx + 1).padStart(2, '0')}</span>
                    {row.subject}
                  </td>
                  <td className="px-6 py-4 text-center font-black text-lg text-blue-600 italic border-r border-gray-200">
                    {row.term1}
                  </td>
                  <td className="px-6 py-4 text-center font-black text-lg text-purple-600 italic border-r border-gray-200">
                    {row.term2}
                  </td>
                  <td className="px-6 py-4 text-center font-black text-lg text-emerald-600 italic">
                    {row.term3}
                  </td>
                </tr>
              ))}

              {/* Summary Rows */}
              <tr className="bg-gray-900 text-white">
                <td className="px-6 py-4 font-black uppercase text-xs tracking-widest border-r border-gray-700">Total Points</td>
                <td className="px-6 py-4 text-center font-black text-xl text-blue-400 italic border-r border-gray-700">{data?.stats.term1.total}</td>
                <td className="px-6 py-4 text-center font-black text-xl text-purple-400 italic border-r border-gray-700">{data?.stats.term2.total}</td>
                <td className="px-6 py-4 text-center font-black text-xl text-emerald-400 italic">{data?.stats.term3.total}</td>
              </tr>
              <tr className="bg-gray-100">
                <td className="px-6 py-4 font-black uppercase text-xs tracking-widest text-gray-900 border-r border-gray-300">Class Rank (Position)</td>
                <td className="px-6 py-4 text-center font-black text-2xl text-red-600 italic border-r border-gray-300">
                  {data?.ranks.term1}{data?.ranks.term1 !== '-' ? (data?.ranks.term1 === 1 ? 'st' : data?.ranks.term1 === 2 ? 'nd' : 'th') : ''}
                </td>
                <td className="px-6 py-4 text-center font-black text-2xl text-red-600 italic border-r border-gray-300">
                  {data?.ranks.term2}{data?.ranks.term2 !== '-' ? (data?.ranks.term2 === 1 ? 'st' : data?.ranks.term2 === 2 ? 'nd' : 'th') : ''}
                </td>
                <td className="px-6 py-4 text-center font-black text-2xl text-red-600 italic">
                  {data?.ranks.term3 !== undefined && data?.ranks.term3 !== '-' ? `${data?.ranks.term3}${data?.ranks.term3 === 1 ? 'st' : data?.ranks.term3 === 2 ? 'nd' : 'th'}` : '-'}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Footer info Area */}
        <div className="mt-12 p-6 bg-blue-50 rounded-2xl border border-blue-100 print:hidden">
          <div className="flex items-start gap-3">
            <TrendingUp size={24} className="text-blue-600 mt-1" />
            <div>
              <h4 className="font-black text-blue-900 uppercase text-xs tracking-widest mb-1">Performance Overview</h4>
              <p className="text-blue-800/70 text-sm leading-relaxed font-medium">
                This report displays the weighted scores for each academic term.
                The Class Rank is calculated based on the total points obtained by all <span className="font-bold">{data?.classSize} students</span> in Grade {data?.className}.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Signature Area */}
        <div className="mt-16 grid grid-cols-2 lg:grid-cols-3 gap-12 pt-10 border-t-4 border-double border-gray-200">
          <div className="text-center">
            <div className="h-0.5 bg-gray-900 w-full mb-3 shadow-sm"></div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Verified by Class Teacher</p>
          </div>
          <div className="hidden lg:flex items-center justify-center opacity-10">
            <GraduationCap size={80} />
          </div>
          <div className="text-center">
            <div className="h-0.5 bg-gray-900 w-full mb-3 shadow-sm"></div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Principal Authorization</p>
          </div>
        </div>
      </div>

      {/* Message Modal */}
      {showMessageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-6 bg-gradient-to-r from-blue-600 to-indigo-700 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <MessageCircle size={24} />
                <h3 className="font-black uppercase tracking-widest text-sm">Send Concern to Teacher</h3>
              </div>
              <button onClick={() => setShowMessageModal(false)} className="p-1 hover:bg-white/20 rounded-lg transition"><X /></button>
            </div>
            <div className="p-8 space-y-6">
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center font-black text-xl">
                  {classTeacher?.name.charAt(0)}
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Recipient</p>
                  <p className="font-bold text-gray-900">{classTeacher?.name}</p>
                  <p className="text-xs text-blue-600 font-medium">{classTeacher?.email}</p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-gray-500 ml-1">Your Message / Inquiry</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your concern about the report card here..."
                  rows={5}
                  className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:bg-white outline-none transition font-medium"
                />
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setShowMessageModal(false)}
                  className="flex-1 py-4 bg-gray-100 text-gray-600 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-gray-200 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendMessage}
                  disabled={sending || !message.trim()}
                  className="flex-2 px-10 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-blue-700 transition shadow-lg shadow-blue-200 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {sending ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
                  Dispatch Message
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
