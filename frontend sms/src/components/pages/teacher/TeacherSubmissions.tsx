import React, { useEffect, useState } from 'react';
import { assignmentService, getAssetUrl } from '../../../services/api';
import { toast } from 'sonner';
import { Download, CheckCircle, Clock } from 'lucide-react';

export const TeacherSubmissions = ({ onNavigate }: any) => {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Grading State
  const [selectedSub, setSelectedSub] = useState<any | null>(null);
  const [marks, setMarks] = useState('');
  const [remarks, setRemarks] = useState('');

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const data = await assignmentService.getAllSubmissions(); // Assume this fetches all for now
      setSubmissions(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
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
      fetchSubmissions();
    } catch (err) {
      console.error(err);
      toast.error('Failed to grade');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Grading & Submissions</h1>
        <p className="text-gray-500">Review student work and assign marks.</p>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="p-4 font-semibold text-gray-600">Student</th>
                <th className="p-4 font-semibold text-gray-600">Assignment</th>
                <th className="p-4 font-semibold text-gray-600">Submitted</th>
                <th className="p-4 font-semibold text-gray-600">File</th>
                <th className="p-4 font-semibold text-gray-600">Marks</th>
                <th className="p-4 font-semibold text-gray-600">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {submissions.map((sub) => (
                <tr key={sub.id} className="hover:bg-gray-50 transition">
                  <td className="p-4 font-medium text-gray-900">{sub.student_name || `Student #${sub.student_id}`}</td>
                  <td className="p-4 text-gray-600">{sub.assignment_title}</td>
                  <td className="p-4 text-gray-500 text-sm">{new Date(sub.submitted_at).toLocaleDateString()}</td>
                  <td className="p-4">
                    <a
                      href={getAssetUrl(sub.file_path)}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-sm font-medium"
                    >
                      <Download size={14} /> Download
                    </a>
                  </td>
                  <td className="p-4">
                    {sub.marks !== null ? (
                      <span className="bg-green-100 text-green-700 px-2 py-1 rounded-md text-xs font-bold">{sub.marks}/100</span>
                    ) : (
                      <span className="text-orange-500 text-xs font-medium">Pending</span>
                    )}
                  </td>
                  <td className="p-4">
                    {sub.marks === null ? (
                      <button
                        onClick={() => setSelectedSub(sub)}
                        className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-blue-700 transition"
                      >
                        Grade
                      </button>
                    ) : (
                      <button className="text-gray-400 cursor-not-allowed text-sm" disabled>Graded</button>
                    )}
                  </td>
                </tr>
              ))}
              {submissions.length === 0 && (
                <tr><td colSpan={6} className="p-8 text-center text-gray-500">No submissions found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Grading Modal */}
      {selectedSub && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold mb-4">Grade Submission</h3>
            <div className="mb-4">
              <p className="text-sm text-gray-500">Student</p>
              <p className="font-semibold">{selectedSub.student_name}</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Marks (0-100)</label>
                <input
                  type="number"
                  value={marks}
                  onChange={e => setMarks(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  max="100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
                <textarea
                  value={remarks}
                  onChange={e => setRemarks(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 h-24"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6 justify-end">
              <button onClick={() => setSelectedSub(null)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
              <button onClick={handleGrade} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">Save Grade</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
