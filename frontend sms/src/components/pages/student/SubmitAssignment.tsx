import React, { useState } from 'react';
import { assignmentService } from '../../../services/api';
import { toast } from 'sonner';
import { Upload, File, X, ArrowLeft } from 'lucide-react';

export const SubmitAssignment = ({ onNavigate, data }: any) => {
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const assignment = data?.assignment;

  if (!assignment) {
    return (
      <div className="p-8 text-center text-red-500">
        Error: No assignment selected.
        <button
          onClick={() => onNavigate('student-assignments')}
          className="block mx-auto mt-4 text-blue-600 hover:underline"
        >
          Go Back
        </button>
      </div>
    );
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast.error('Please select a file to upload.');
      return;
    }

    try {
      setSubmitting(true);
      const studentId = localStorage.getItem('roleId');
      if (!studentId) {
        toast.error('Session expired. Please login again.');
        return;
      }

      const formData = new FormData();
      formData.append('student_id', studentId);
      formData.append('assignment_id', assignment.id.toString());
      formData.append('file', file);

      await assignmentService.submitAssignment(formData);
      toast.success('Assignment submitted successfully!');
      onNavigate('student-assignments');
    } catch (error) {
      console.error(error);
      toast.error('Failed to submit assignment.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto animate-in slide-in-from-bottom-4 duration-500">
      <button
        onClick={() => onNavigate('student-assignments')}
        className="mb-6 flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Assignments
      </button>

      <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-100">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{assignment.title}</h1>
        <div className="mb-6 flex gap-4 text-sm text-gray-500">
          <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md">{assignment.subject_name}</span>
          <span className="flex items-center gap-1">Due: {new Date(assignment.due_date).toLocaleDateString()}</span>
        </div>

        <div className="mb-8 rounded-xl bg-gray-50 p-4 text-gray-700 leading-relaxed">
          {assignment.description || <span className="text-gray-400 italic">No description provided.</span>}
        </div>

        {assignment.file_path && (
          <div className="mb-8 rounded-xl border border-blue-100 bg-blue-50/30 p-4">
            <h3 className="text-sm font-semibold text-blue-900 mb-3 flex items-center gap-2">
              <File className="h-4 w-4" />
              Reference Material / Assignment File
            </h3>
            <div className="flex items-center justify-between bg-white rounded-lg p-3 shadow-sm ring-1 ring-blue-100">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-blue-100 p-2 text-blue-600">
                  <File className="h-5 w-5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-900">
                    {assignment.file_path.split('/').pop()}
                  </span>
                  <span className="text-xs text-gray-500">Teacher Attachment</span>
                </div>
              </div>
              <a
                href={`http://localhost:3000${assignment.file_path}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 transition-colors"
                download
              >
                View / Download
              </a>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="rounded-xl border-2 border-dashed border-gray-200 p-8 text-center transition-colors hover:border-blue-400 hover:bg-blue-50/50">
            <input
              type="file"
              id="file-upload"
              className="hidden"
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.jpg,.png"
            />
            <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center gap-3">
              <div className="rounded-full bg-blue-100 p-4 text-blue-600">
                <Upload className="h-6 w-6" />
              </div>
              <div>
                <span className="font-semibold text-blue-600 hover:text-blue-700">Click to upload</span>
                <span className="text-gray-500"> or drag and drop</span>
              </div>
              <p className="text-xs text-gray-400">PDF, DOC, JPG (Max 10MB)</p>
            </label>
          </div>

          {file && (
            <div className="flex items-center justify-between rounded-xl bg-gray-50 p-4 ring-1 ring-gray-200">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-white p-2 text-blue-600 shadow-sm">
                  <File className="h-5 w-5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-900">{file.name}</span>
                  <span className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setFile(null)}
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-200 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={!file || submitting}
            className="w-full rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition-all hover:bg-blue-700 hover:shadow-blue-600/30 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Uploading...' : 'Submit Assignment'}
          </button>
        </form>
      </div>
    </div>
  );
};
