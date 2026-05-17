import React, { useEffect, useState } from 'react';
import { assignmentService } from '../../../services/api';
import { toast } from 'sonner';
import { Upload, FileText, CheckCircle, Clock, AlertCircle } from 'lucide-react';

interface Assignment {
  id: number;
  title: string;
  description: string;
  subject_name: string;
  due_date: string;
  is_submitted: number;
  file_path?: string;
}

export const StudentAssignments = ({ onNavigate }: any) => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      const studentId = localStorage.getItem('roleId');
      if (!studentId) return;
      const data = await assignmentService.getStudentAssignments(Number(studentId));
      setAssignments(data);
    } catch (error) {
      console.error('Failed to fetch assignments:', error);
      toast.error('Failed to load assignments');
    } finally {
      setLoading(false);
    }
  };

  const handleNavigateToSubmit = (assignment: Assignment) => {
    onNavigate('student-submit-assignment', { assignment });
  }

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-gray-900">Assignments</h1>
        <p className="text-gray-500">View and submit your pending coursework.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {assignments.length > 0 ? (
          assignments.map((assignment) => {
            const isSubmitted = assignment.is_submitted > 0;
            const dueDate = new Date(assignment.due_date);
            const isOverdue = new Date() > dueDate && !isSubmitted;

            return (
              <div key={assignment.id} className="relative flex flex-col justify-between rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 transition-all hover:shadow-md">
                <div className="mb-4">
                  <div className="flex items-start justify-between">
                    <span className="inline-flex items-center rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                      {assignment.subject_name}
                    </span>
                    {isSubmitted ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : isOverdue ? (
                      <AlertCircle className="h-5 w-5 text-red-500" />
                    ) : (
                      <Clock className="h-5 w-5 text-orange-500" />
                    )}
                  </div>
                  <h3 className="mt-3 text-lg font-semibold text-gray-900">{assignment.title}</h3>
                  <p className="mt-2 text-sm text-gray-600 line-clamp-3">{assignment.description}</p>
                  {assignment.file_path && (
                    <div className="mt-3 flex items-center gap-1.5 text-xs font-medium text-blue-600 bg-blue-50 w-fit px-2 py-1 rounded-md">
                      <FileText className="h-3 w-3" />
                      Attachment included
                    </div>
                  )}
                </div>

                <div className="mt-auto">
                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                    <CalendarIcon className="h-3.5 w-3.5" />
                    Due: {dueDate.toLocaleDateString()}
                  </div>

                  {isSubmitted ? (
                    <button disabled className="w-full rounded-xl bg-gray-100 px-4 py-2 text-sm font-medium text-gray-500 cursor-not-allowed">
                      Submitted
                    </button>
                  ) : (
                    <button
                      onClick={() => handleNavigateToSubmit(assignment)}
                      className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                    >
                      <Upload className="h-4 w-4" />
                      Submit Work
                    </button>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-gray-50 p-4 mb-3">
              <FileText className="h-8 w-8 text-gray-300" />
            </div>
            <p className="font-medium text-gray-900">No pending assignments</p>
            <p className="text-sm text-gray-500">You're all caught up!</p>
          </div>
        )}
      </div>
    </div>
  );
};

function CalendarIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
      <line x1="16" x2="16" y1="2" y2="6" />
      <line x1="8" x2="8" y1="2" y2="6" />
      <line x1="3" x2="21" y1="10" y2="10" />
    </svg>
  )
}
