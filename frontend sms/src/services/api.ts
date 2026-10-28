import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const authService = {
    login: async (credentials: any) => {
        const response = await api.post('/auth/login', credentials);
        return response.data;
    },
    register: async (data: any) => {
        const response = await api.post('/auth/register', data);
        return response.data;
    },
    forgotPassword: async (email: string) => {
        const response = await api.post('/auth/forgot-password', { email });
        return response.data;
    },
    resetPasswordWithTemp: async (data: any) => {
        const response = await api.post('/auth/reset-password', data);
        return response.data;
    },
    getProfile: async () => {
        const response = await api.get('/auth/profile');
        return response.data;
    },
    updateProfile: async (data: any) => {
        const response = await api.put('/auth/profile', data, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },
    adminResetUserPassword: async (data: any) => {
        const response = await api.post('/auth/admin-reset-password', data);
        return response.data;
    },
    deleteUser: async (id: number) => {
        const response = await api.delete(`/auth/${id}`);
        return response.data;
    }
};

export const studentService = {
    getAll: async () => {
        const response = await api.get('/students');
        return response.data;
    },
    create: async (data: any) => {
        const response = await api.post('/students/profile', data);
        return response.data;
    },
    update: async (id: number, data: any) => {
        const response = await api.put(`/students/${id}`, data);
        return response.data;
    },
    delete: async (id: number) => {
        const response = await api.delete(`/students/${id}`);
        return response.data;
    },
};

export const teacherService = {
    getAll: async () => {
        const response = await api.get('/teachers');
        return response.data;
    },
    update: async (id: number, data: any) => {
        const response = await api.put(`/teachers/${id}`, data);
        return response.data;
    },
    delete: async (id: number) => {
        const response = await api.delete(`/teachers/${id}`);
        return response.data;
    },
    createProfile: async (data: any) => {
        const response = await api.post('/teachers/profile', data);
        return response.data;
    },
};

export const principalService = {
    getAll: async () => {
        const response = await api.get('/principals');
        return response.data;
    },
    getStats: async () => {
        const response = await api.get('/principals/stats');
        return response.data;
    },
    getStudentsParents: async () => {
        const response = await api.get('/principals/students-parents');
        return response.data;
    },
    createProfile: async (data: any) => {
        const response = await api.post('/principals/profile', data);
        return response.data;
    },
    update: async (id: number, data: any) => {
        const response = await api.put(`/principals/${id}`, data);
        return response.data;
    },
    delete: async (id: number) => {
        const response = await api.delete(`/principals/${id}`);
        return response.data;
    },
};

export const parentService = {
    getAll: async () => {
        const response = await api.get('/parents');
        return response.data;
    },
    createProfile: async (data: any) => {
        const response = await api.post('/parents/profile', data);
        return response.data;
    },
    update: async (id: number, data: any) => {
        const response = await api.put(`/parents/${id}`, data);
        return response.data;
    },
    delete: async (id: number) => {
        const response = await api.delete(`/parents/${id}`);
        return response.data;
    },
};

export const academicService = {
    getStats: async () => {
        const response = await api.get('/academic/stats');
        return response.data;
    },
    getAllClasses: async () => {
        const response = await api.get('/academic/classes');
        return response.data;
    },
    createClass: async (data: any) => {
        const response = await api.post('/academic/classes', data);
        return response.data;
    },
    updateClass: async (id: number, data: any) => {
        const response = await api.put(`/academic/classes/${id}`, data);
        return response.data;
    },
    deleteClass: async (id: number) => {
        const response = await api.delete(`/academic/classes/${id}`);
        return response.data;
    },
    getAllSubjects: async () => {
        const response = await api.get('/academic/subjects');
        return response.data;
    },
    createSubject: async (data: any) => {
        const response = await api.post('/academic/subjects', data);
        return response.data;
    },
    updateSubject: async (id: number, data: any) => {
        const response = await api.put(`/academic/subjects/${id}`, data);
        return response.data;
    },
    deleteSubject: async (id: number) => {
        const response = await api.delete(`/academic/subjects/${id}`);
        return response.data;
    },
    getTeacherStats: async (teacherId: number) => {
        const response = await api.get(`/academic/stats/teacher/${teacherId}`);
        return response.data;
    },
    getStudentStats: async (studentId: number) => {
        const response = await api.get(`/academic/stats/student/${studentId}`);
        return response.data;
    },
};

export const attendanceService = {
    mark: async (data: any) => {
        const response = await api.post('/attendance', data);
        return response.data;
    },
    getByClassAndDate: async (classId: number, date: string) => {
        const response = await api.get(`/attendance/class/${classId}/date/${date}`);
        return response.data;
    },
};

export const examService = {
    getStudentResults: async (studentId: number) => {
        const response = await api.get(`/exams/student/${studentId}`);
        return response.data;
    },
    recordResults: async (data: any) => {
        const response = await api.post('/exams/results', data);
        return response.data;
    },
};

export const inventoryService = {
    getAll: async () => {
        const response = await api.get('/inventory');
        return response.data;
    },
    create: async (data: any) => {
        const response = await api.post('/inventory', data);
        return response.data;
    },
    update: async (id: number, data: any) => {
        const response = await api.put(`/inventory/${id}`, data);
        return response.data;
    },
    delete: async (id: number) => {
        const response = await api.delete(`/inventory/${id}`);
        return response.data;
    },
    allocate: async (data: { inventory_id: number, class_id: number, quantity: number, reason: string }) => {
        const response = await api.post('/inventory/allocate', data);
        return response.data;
    },
    getAllocations: async () => {
        const response = await api.get('/inventory/allocations');
        return response.data;
    },
    getClassInventory: async (classId: number) => {
        const response = await api.get(`/inventory/class/${classId}`);
        return response.data;
    }
};

export const messageService = {
    send: async (data: { receiver_role: string, receiver_id?: number, subject: string, message: string }) => {
        const response = await api.post('/messages/send', data);
        return response.data;
    },
    getTeacherMessages: async () => {
        const response = await api.get('/messages/teacher');
        return response.data;
    },
    getAdminMessages: async () => {
        const response = await api.get('/messages/admin');
        return response.data;
    },
    markRead: async (id: number) => {
        const response = await api.put(`/messages/read/${id}`);
        return response.data;
    }
};

export const announcementService = {
    getAll: async (params?: any) => {
        const response = await api.get('/announcements', { params });
        return response.data;
    },
    create: async (data: any) => {
        const response = await api.post('/announcements', data, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },
    delete: async (id: number) => {
        const response = await api.delete(`/announcements/${id}`);
        return response.data;
    },
};

export const assignmentService = {
    getStudentAssignments: async (studentId: number) => {
        const response = await api.get(`/assignments/student/${studentId}`);
        return response.data;
    },
    submitAssignment: async (data: any) => {
        const response = await api.post('/assignments/submit', data, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },
    getAllSubmissions: async () => {
        const response = await api.get('/assignments/submissions');
        return response.data;
    },
    gradeSubmission: async (id: number, data: any) => {
        const response = await api.post(`/assignments/submissions/${id}/grade`, data);
        return response.data;
    },
    createAssignment: async (data: any) => {
        const response = await api.post('/assignments/create', data, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },
    getByClass: async (classId: number) => {
        const response = await api.get(`/assignments/class/${classId}`);
        return response.data;
    },
    delete: async (id: number) => {
        const response = await api.delete(`/assignments/${id}`);
        return response.data;
    },
    updateStatus: async (id: number, status: string) => {
        const response = await api.put(`/assignments/status/${id}`, { status });
        return response.data;
    }
};

export const materialService = {
    getStudentMaterials: async (studentId: number) => {
        const response = await api.get(`/materials/student/${studentId}`);
        return response.data;
    },
    uploadMaterial: async (data: any) => {
        const response = await api.post('/materials/upload', data, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },
    getByClass: async (classId: number) => {
        const response = await api.get(`/materials/class/${classId}`);
        return response.data;
    },
    delete: async (id: number) => {
        const response = await api.delete(`/materials/${id}`);
        return response.data;
    }
};

export const feedbackService = {
    submit: async (data: { teacher_id: number, message: string, student_id?: number }) => {
        const response = await api.post('/feedback/submit', data);
        return response.data;
    },
    getParentSent: async () => {
        const response = await api.get('/feedback/parent/my-sent');
        return response.data;
    },
    getChildStats: async () => {
        const response = await api.get('/feedback/parent/child-stats');
        return response.data;
    },
    getTeacherReceived: async () => {
        const response = await api.get('/feedback/teacher/my-received');
        return response.data;
    },
    submitStudentFeedback: async (data: { teacher_id: number, message: string }) => {
        const response = await api.post('/feedback/student/submit', data);
        return response.data;
    },
    getStudentTeachers: async () => {
        const response = await api.get('/feedback/student/teachers');
        return response.data;
    },
    getTeacherStudentFeedback: async () => {
        const response = await api.get('/feedback/teacher/student-feedback');
        return response.data;
    }
};

export const reportService = {
    getTermReport: async (studentId: number) => {
        const response = await api.get(`/reports/term-report/${studentId}`);
        return response.data;
    },
    getStudentSubjects: async (studentId: number) => {
        const response = await api.get(`/reports/student-subjects/${studentId}`);
        return response.data;
    },
    getManagedClass: async () => {
        const response = await api.get('/reports/managed-class');
        return response.data;
    },
    getClassStudentsForReports: async (classId: number) => {
        const response = await api.get(`/reports/managed-class/students/${classId}`);
        return response.data;
    },
    getOfficialMarks: async (studentId: number) => {
        const response = await api.get(`/reports/official-marks/${studentId}`);
        return response.data;
    },
    updateOfficialMarks: async (data: { student_id: number, marks: any[], academic_year: string }) => {
        const response = await api.post('/reports/official-update', data);
        return response.data;
    },
    getClassTeacher: async (studentId: number) => {
        const response = await api.get(`/reports/class-teacher/${studentId}`);
        return response.data;
    }
};

export const teacherPortalService = {
    getMySubjects: async () => {
        const response = await api.get('/teacher-portal/my-subjects');
        return response.data;
    },
    getClassStudents: async (classId: number) => {
        const response = await api.get(`/teacher-portal/class/${classId}/students`);
        return response.data;
    },
    getMyFeedback: async () => {
        const response = await api.get('/teacher-portal/my-feedback');
        return response.data;
    },
    getManagedClassDetails: async () => {
        const response = await api.get('/teacher-portal/managed-class');
        return response.data;
    },
    getMyUploadedItems: async () => {
        const response = await api.get('/teacher-portal/my-items');
        return response.data;
    }
};

export const statsService = {
    getAdminStats: async () => {
        const response = await api.get('/stats/admin');
        return response.data;
    },
};

export default api;
