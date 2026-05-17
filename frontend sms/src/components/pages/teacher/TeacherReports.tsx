import { useState, useEffect } from 'react';
import { reportService, academicService } from '../../../services/api';
import { toast } from 'sonner';
import {
  Loader2, User, Save, ChevronRight, GraduationCap,
  ClipboardList, AlertCircle, Trophy, BarChart2, CheckCircle
} from 'lucide-react';

// ─── Helpers ────────────────────────────────────────────────────────────────
const toNum = (v: any) => { const n = parseFloat(v); return isNaN(n) ? 0 : n; };
const ordinal = (n: number) => {
  if (n === 1) return '1st';
  if (n === 2) return '2nd';
  if (n === 3) return '3rd';
  return `${n}th`;
};

export const TeacherReports = ({ onNavigate }: any) => {
  const [managedClass, setManagedClass] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [marks, setMarks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'entry' | 'rankings' | 'stats'>('entry');
  const [allStudentsMarks, setAllStudentsMarks] = useState<any[]>([]);
  const [rankingTerm, setRankingTerm] = useState<'term_1' | 'term_2' | 'term_3'>('term_1');
  const [academicYear, setAcademicYear] = useState(new Date().getFullYear().toString());

  useEffect(() => { fetchInitialData(); }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const mClass = await reportService.getManagedClass();
      setManagedClass(mClass);

      if (mClass && mClass.id) {
        const [stdList, subjList] = await Promise.all([
          reportService.getClassStudentsForReports(mClass.id),
          academicService.getAllSubjects()
        ]);
        setStudents(stdList);

        const order = [
          'Religion', 'Tamil', 'Maths', 'Environment',
          'English', 'Sinhala', 'Creative works', 'Art',
          'Physical Education', 'Drawing'
        ];

        // Deduplicate subjects by name
        const uniqueSubjMap = new Map();
        subjList.forEach((s: any) => {
          if (!uniqueSubjMap.has(s.name)) {
            uniqueSubjMap.set(s.name, s);
          }
        });
        const uniqueSubjList = Array.from(uniqueSubjMap.values());

        uniqueSubjList.sort((a: any, b: any) => {
          const ai = order.indexOf(a.name); const bi = order.indexOf(b.name);
          return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
        });
        setSubjects(uniqueSubjList);

        // Pre-load all students' marks for rankings + stats
        const allMarks = await Promise.all(
          stdList.map(async (s: any) => {
            const m = await reportService.getOfficialMarks(s.id);
            return { student: s, marks: m };
          })
        );
        setAllStudentsMarks(allMarks);
      }
    } catch (error) {
      toast.error('Failed to load class reports data');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectStudent = async (student: any) => {
    setSelectedStudent(student);
    try {
      const existingMarks = await reportService.getOfficialMarks(student.id);
      const initialMarks = subjects.map(sub => {
        const existing = existingMarks.find((m: any) => m.subject_id === sub.id);
        return {
          subject_id: sub.id,
          subject_name: sub.name,
          term_1_marks: existing?.term_1_marks ?? '',
          term_2_marks: existing?.term_2_marks ?? '',
          term_3_marks: existing?.term_3_marks ?? ''
        };
      });
      setMarks(initialMarks);
    } catch { toast.error('Failed to load student marks'); }
  };

  const handleMarkChange = (subjectId: number, term: string, value: string) => {
    setMarks(prev => prev.map(m =>
      m.subject_id === subjectId ? { ...m, [term]: value } : m
    ));
  };

  const handleSave = async () => {
    if (!selectedStudent) return;
    setSaving(true);
    try {
      await reportService.updateOfficialMarks({ 
        student_id: selectedStudent.id, 
        marks,
        academic_year: academicYear
      });
      toast.success(`Report saved for ${selectedStudent.name}!`);
      // Refresh rankings data
      const allMarks = await Promise.all(
        students.map(async (s: any) => {
          const m = await reportService.getOfficialMarks(s.id);
          return { student: s, marks: m };
        })
      );
      setAllStudentsMarks(allMarks);
      setSelectedStudent(null);
    } catch { toast.error('Failed to save marks'); }
    finally { setSaving(false); }
  };

  // ── Live totals while teacher is editing ─────────────────────────────────
  const liveTotals = (term: 'term_1' | 'term_2' | 'term_3') => {
    const key = `${term}_marks`;
    const nums = marks.map(m => toNum(m[key])).filter(n => n > 0);
    const total = nums.reduce((a, b) => a + b, 0);
    const avg = nums.length > 0 ? (total / nums.length).toFixed(2) : '0.00';
    return { total, avg };
  };

  // ── Rankings ─────────────────────────────────────────────────────────────
  const buildRankings = () => {
    return allStudentsMarks
      .map(({ student, marks: mks }) => {
        const key = `${rankingTerm}_marks`;
        const nums = mks.map((m: any) => toNum(m[key])).filter((n: number) => n > 0);
        const total = nums.reduce((a: number, b: number) => a + b, 0);
        const avg = nums.length > 0 ? (total / nums.length).toFixed(2) : '0.00';
        return { student, total, avg };
      })
      .sort((a, b) => b.total - a.total)
      .map((item, idx) => ({ ...item, position: idx + 1 }));
  };

  // ── Subject stats ─────────────────────────────────────────────────────────
  const buildSubjectStats = () => {
    return subjects.map(sub => {
      const rows = allStudentsMarks.map(({ student, marks: mks }) => {
        const m = mks.find((mk: any) => mk.subject_id === sub.id);
        return {
          student,
          t1: toNum(m?.term_1_marks),
          t2: toNum(m?.term_2_marks),
          t3: toNum(m?.term_3_marks),
        };
      });
      const safeAvg = (vals: number[]) => {
        const nz = vals.filter(v => v > 0);
        return nz.length > 0 ? (nz.reduce((a, b) => a + b, 0) / nz.length).toFixed(1) : '0.0';
      };
      return {
        subject: sub.name,
        t1Total: rows.reduce((a, r) => a + r.t1, 0),
        t2Total: rows.reduce((a, r) => a + r.t2, 0),
        t3Total: rows.reduce((a, r) => a + r.t3, 0),
        t1Avg: safeAvg(rows.map(r => r.t1)),
        t2Avg: safeAvg(rows.map(r => r.t2)),
        t3Avg: safeAvg(rows.map(r => r.t3)),
      };
    });
  };

  // ── Guards ────────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="animate-spin text-blue-600" size={32} />
    </div>
  );

  if (!managedClass || !managedClass.id) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8 text-center max-w-2xl mx-auto mt-10">
        <AlertCircle className="mx-auto text-amber-500 mb-4" size={48} />
        <h2 className="text-xl font-bold text-amber-900 mb-2">No Managed Class Assigned</h2>
        <p className="text-amber-700">
          You are not assigned as a Class Teacher for any grade.
          Please contact the administrator to be assigned a class.
        </p>
      </div>
    );
  }

  const rankings = buildRankings();
  const subjectStats = buildSubjectStats();

  return (
    <div className="space-y-6 animate-in fade-in duration-500">

      {/* ── PAGE HEADER ─────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between bg-white p-6 rounded-2xl border border-gray-100 shadow-sm gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 flex items-center gap-3">
            <ClipboardList className="text-blue-600" />
            Class Report Management
          </h1>
          <p className="text-gray-500 font-medium mt-1">
            Official Term Reports — <span className="text-blue-600 font-bold">{managedClass.name}</span>
          </p>
        </div>
        <div className="bg-blue-50 px-4 py-2 rounded-xl border border-blue-100 flex items-center gap-2">
          <GraduationCap className="text-blue-600" size={20} />
          <span className="font-bold text-blue-900">{managedClass.name} — Class Teacher</span>
        </div>
      </div>

      {/* ── TABS ─────────────────────────────────────────────────────────── */}
      <div className="flex gap-2 bg-gray-100 p-1.5 rounded-2xl w-fit">
        {[
          { id: 'entry',    label: 'Enter Marks',    icon: ClipboardList },
          { id: 'rankings', label: 'Class Rankings', icon: Trophy },
          { id: 'stats',    label: 'Subject Stats',  icon: BarChart2 },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
              activeTab === tab.id
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* TAB 1 — MARKS ENTRY                                               */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      {activeTab === 'entry' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Student list */}
          <div className="lg:col-span-1 space-y-3">
            <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">
              Students — {students.length} total
            </h2>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden divide-y divide-gray-50">
              {students.length === 0
                ? <p className="p-8 text-center text-gray-400 italic">No students in this class.</p>
                : students.map(student => {
                    const sm = allStudentsMarks.find(a => a.student.id === student.id);
                    const hasSaved = sm?.marks?.length > 0;
                    return (
                      <div key={student.id} className="relative group">
                        <button
                          onClick={() => handleSelectStudent(student)}
                          className={`w-full p-4 flex items-center justify-between transition-all hover:bg-blue-50 ${
                            selectedStudent?.id === student.id ? 'bg-blue-50 border-r-4 border-blue-600' : ''
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                              selectedStudent?.id === student.id
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-600 group-hover:bg-blue-100'
                            }`}>
                              {student.name.charAt(0)}
                            </div>
                            <div className="text-left">
                              <p className="font-bold text-gray-900 text-sm">{student.name}</p>
                              <p className="text-[10px] text-gray-400 font-bold uppercase">
                                Adm: {student.admission_number || 'N/A'}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            {hasSaved && <CheckCircle size={13} className="text-emerald-500" />}
                            <ChevronRight size={16} className={
                              selectedStudent?.id === student.id ? 'text-blue-600' : 'text-gray-300'
                            } />
                          </div>
                        </button>

                        <button 
                          onClick={(e) => { e.stopPropagation(); onNavigate('student-reports', { id: student.id }); }}
                          title="View Official Report Card"
                          className={`absolute right-12 top-1/2 -translate-y-1/2 p-2 rounded-xl text-gray-400 hover:text-blue-600 hover:bg-blue-100 transition shadow-sm bg-white border border-gray-100 opacity-0 group-hover:opacity-100 ${
                            selectedStudent?.id === student.id ? 'opacity-100' : ''
                          }`}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                        </button>
                      </div>
                    );
                  })
              }
            </div>
          </div>

          {/* Marks entry */}
          <div className="lg:col-span-2">
            {selectedStudent ? (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

                {/* Student header */}
                <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-lg shadow-lg shadow-blue-200">
                      {selectedStudent.name.charAt(0)}
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-gray-900">{selectedStudent.name}</h2>
                      <div className="flex items-center gap-2">
                        <p className="text-[10px] text-blue-600 font-black uppercase tracking-widest">
                          Academic Year:
                        </p>
                        <input 
                          type="text" 
                          value={academicYear}
                          onChange={(e) => setAcademicYear(e.target.value)}
                          className="text-[10px] font-black w-12 bg-transparent border-b border-blue-200 text-blue-800 outline-none"
                        />
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700
                               transition-all flex items-center gap-2 shadow-lg shadow-blue-500/20 disabled:opacity-50"
                  >
                    {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                    Save Report
                  </button>
                </div>

                {/* Marks table */}
                <div className="overflow-auto max-h-[520px]">
                  <table className="w-full text-left border-collapse">
                    <thead className="sticky top-0 z-10">
                      <tr className="bg-gray-900 text-white text-[10px] uppercase font-black tracking-widest">
                        <th className="p-4 pl-6 w-[40%]">Subject / Lesson</th>
                        <th className="p-4 text-center">Term 1</th>
                        <th className="p-4 text-center">Term 2</th>
                        <th className="p-4 text-center pr-6">Term 3</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {marks.map(m => (
                        <tr key={m.subject_id} className="hover:bg-blue-50/20 transition-colors">
                          <td className="p-4 pl-6 font-bold text-gray-700 text-sm">{m.subject_name}</td>
                          {(
                            [
                              ['term_1_marks', 'focus:ring-blue-400 text-blue-900'],
                              ['term_2_marks', 'focus:ring-purple-400 text-purple-900'],
                              ['term_3_marks', 'focus:ring-green-400 text-green-900'],
                            ] as const
                          ).map(([termKey, cls]) => (
                            <td key={termKey} className="p-3 text-center">
                              <input
                                type="number"
                                min={0}
                                max={100}
                                value={m[termKey]}
                                onChange={e => handleMarkChange(m.subject_id, termKey, e.target.value)}
                                placeholder="—"
                                className={`w-16 mx-auto block text-center py-2 bg-gray-50 border border-gray-200
                                           rounded-lg focus:ring-2 outline-none font-bold text-sm ${cls}`}
                              />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>

                    {/* ── Live totals footer ──────────────────────────── */}
                    <tfoot>
                      <tr className="bg-gray-900 text-white">
                        <td className="p-4 pl-6 font-black uppercase text-[10px] tracking-widest">
                          Total Marks
                        </td>
                        {(['term_1', 'term_2', 'term_3'] as const).map((t, ti) => (
                          <td key={t} className={`p-4 text-center font-black text-xl ${
                            ti === 0 ? 'text-blue-400' : ti === 1 ? 'text-purple-400' : 'text-emerald-400'
                          }`}>
                            {liveTotals(t).total}
                          </td>
                        ))}
                      </tr>
                      <tr className="bg-blue-50 border-t border-blue-100">
                        <td className="p-4 pl-6 font-black uppercase text-[10px] tracking-widest text-blue-700">
                          Average Marks
                        </td>
                        {(['term_1', 'term_2', 'term_3'] as const).map((t, ti) => (
                          <td key={t} className={`p-4 text-center font-black text-lg ${
                            ti === 0 ? 'text-blue-600' : ti === 1 ? 'text-purple-600' : 'text-emerald-600'
                          }`}>
                            {liveTotals(t).avg}
                          </td>
                        ))}
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-20 text-center h-full min-h-[400px] flex flex-col items-center justify-center">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6 text-gray-300">
                  <User size={40} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Select a Student</h3>
                <p className="text-gray-500 max-w-xs">
                  Pick a student from the list to enter or update their official term marks.
                  Totals and averages are calculated automatically.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* TAB 2 — CLASS RANKINGS                                            */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      {activeTab === 'rankings' && (
        <div className="space-y-5">
          {/* Term selector */}
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xs font-black text-gray-500 uppercase tracking-widest">Rank by:</span>
            {(
              [
                ['term_1', 'Term 1'],
                ['term_2', 'Term 2'],
                ['term_3', 'Term 3'],
              ] as const
            ).map(([t, label]) => (
              <button
                key={t}
                onClick={() => setRankingTerm(t)}
                className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${
                  rankingTerm === t
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                    : 'bg-white border border-gray-200 text-gray-600 hover:border-blue-300'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 bg-gradient-to-r from-blue-600 to-indigo-700 text-white flex items-center gap-4">
              <Trophy size={28} />
              <div>
                <h2 className="text-xl font-black">Class Rankings — {managedClass.name}</h2>
                <p className="text-blue-100 text-sm font-medium">Sorted by total marks · {students.length} students</p>
              </div>
            </div>
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-100">
                  <th className="px-6 py-4">Position</th>
                  <th className="px-6 py-4">Student</th>
                  <th className="px-6 py-4 text-center">Total Marks</th>
                  <th className="px-6 py-4 text-center">Average</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {rankings.map(r => (
                  <tr
                    key={r.student.id}
                    className={`transition-colors ${
                      r.position === 1 ? 'bg-yellow-50' :
                      r.position === 2 ? 'bg-gray-50' :
                      r.position === 3 ? 'bg-orange-50/60' : 'hover:bg-blue-50/20'
                    }`}
                  >
                    <td className="px-6 py-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-base ${
                        r.position === 1 ? 'bg-yellow-400 text-yellow-900' :
                        r.position === 2 ? 'bg-gray-300 text-gray-700' :
                        r.position === 3 ? 'bg-orange-300 text-orange-900' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {r.position <= 3 ? ['🥇','🥈','🥉'][r.position - 1] : r.position}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-black">
                          {r.student.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{r.student.name}</p>
                          <p className="text-[10px] text-gray-400 font-bold">{ordinal(r.position)} in class</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center font-black text-2xl text-blue-600">{r.total}</td>
                    <td className="px-6 py-4 text-center font-bold text-gray-500">{r.avg}</td>
                  </tr>
                ))}
                {rankings.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-12 text-center text-gray-400 italic">
                      No marks saved yet. Go to "Enter Marks" to add marks first.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* TAB 3 — SUBJECT STATS                                             */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      {activeTab === 'stats' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 bg-gradient-to-r from-emerald-600 to-teal-700 text-white flex items-center gap-4">
            <BarChart2 size={28} />
            <div>
              <h2 className="text-xl font-black">Subject Performance Summary</h2>
              <p className="text-emerald-100 text-sm font-medium">
                Class totals & averages per subject — {managedClass.name}
              </p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-100 bg-gray-50">
                  <th className="px-6 py-4">Subject</th>
                  <th className="px-4 py-4 text-center text-blue-600">T1 Total</th>
                  <th className="px-4 py-4 text-center text-blue-400">T1 Avg</th>
                  <th className="px-4 py-4 text-center text-purple-600">T2 Total</th>
                  <th className="px-4 py-4 text-center text-purple-400">T2 Avg</th>
                  <th className="px-4 py-4 text-center text-emerald-600">T3 Total</th>
                  <th className="px-4 py-4 text-center text-emerald-400">T3 Avg</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {subjectStats.map((s, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-black text-gray-800">{s.subject}</td>
                    <td className="px-4 py-4 text-center font-bold text-blue-700">{s.t1Total}</td>
                    <td className="px-4 py-4 text-center text-blue-500 font-medium">{s.t1Avg}</td>
                    <td className="px-4 py-4 text-center font-bold text-purple-700">{s.t2Total}</td>
                    <td className="px-4 py-4 text-center text-purple-500 font-medium">{s.t2Avg}</td>
                    <td className="px-4 py-4 text-center font-bold text-emerald-700">{s.t3Total}</td>
                    <td className="px-4 py-4 text-center text-emerald-500 font-medium">{s.t3Avg}</td>
                  </tr>
                ))}
              </tbody>
              {/* Grand totals */}
              <tfoot>
                <tr className="bg-gray-900 text-white">
                  <td className="px-6 py-4 font-black uppercase text-xs tracking-widest">Grand Total</td>
                  <td className="px-4 py-4 text-center font-black text-xl text-blue-300">
                    {subjectStats.reduce((a, s) => a + s.t1Total, 0)}
                  </td>
                  <td className="px-4 py-4 text-center text-gray-300 font-bold">
                    {(subjectStats.reduce((a, s) => a + parseFloat(s.t1Avg), 0) / (subjectStats.length || 1)).toFixed(1)}
                  </td>
                  <td className="px-4 py-4 text-center font-black text-xl text-purple-300">
                    {subjectStats.reduce((a, s) => a + s.t2Total, 0)}
                  </td>
                  <td className="px-4 py-4 text-center text-gray-300 font-bold">
                    {(subjectStats.reduce((a, s) => a + parseFloat(s.t2Avg), 0) / (subjectStats.length || 1)).toFixed(1)}
                  </td>
                  <td className="px-4 py-4 text-center font-black text-xl text-emerald-300">
                    {subjectStats.reduce((a, s) => a + s.t3Total, 0)}
                  </td>
                  <td className="px-4 py-4 text-center text-gray-300 font-bold">
                    {(subjectStats.reduce((a, s) => a + parseFloat(s.t3Avg), 0) / (subjectStats.length || 1)).toFixed(1)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
