import { useState } from 'react';
import { Layout, getNavigationForRole } from './components/Layout';
import { Login } from './components/pages/Login';
import { ForgotPassword } from './components/pages/ForgotPassword';
import { ResetPassword } from './components/pages/ResetPassword';
import { authService } from './services/api';
import { toast } from 'sonner';

// Admin Pages
import { AdminDashboard } from './components/pages/admin/AdminDashboard';
import { ManageStudents } from './components/pages/admin/ManageStudents';
import { StudentForm } from './components/pages/admin/StudentForm';
import { ManageTeachers } from './components/pages/admin/ManageTeachers';
import { TeacherForm } from './components/pages/admin/TeacherForm';
import { ManageClasses } from './components/pages/admin/ManageClasses';
import { ManageInventory } from './components/pages/admin/ManageInventory';
import { InventoryForm } from './components/pages/admin/InventoryForm';
import { AdminAnnouncements } from './components/pages/admin/AdminAnnouncements';
import { AuditLog } from './components/pages/admin/AuditLog';
import { AdminReports } from './components/pages/admin/AdminReports';
import { ManagePrincipals } from './components/pages/admin/ManagePrincipals';
import { PrincipalForm } from './components/pages/admin/PrincipalForm';
import { ManageParents } from './components/pages/admin/ManageParents';
import { ParentForm } from './components/pages/admin/ParentForm';
import { UserManagement } from './components/pages/admin/UserManagement';

// Teacher Pages
import { TeacherDashboard } from './components/pages/teacher/TeacherDashboard';
import { TeacherClasses } from './components/pages/teacher/TeacherClasses';
import { ClassDetail } from './components/pages/teacher/ClassDetail';
import { TeacherInstructions } from './components/pages/teacher/TeacherInstructions';
import { InstructionForm } from './components/pages/teacher/InstructionForm';
import { TeacherSubmissions } from './components/pages/teacher/TeacherSubmissions';
import { TeacherReports } from './components/pages/teacher/TeacherReports';
import { TeacherMaterials } from './components/pages/teacher/TeacherMaterials';
import { TeacherFeedback } from './components/pages/teacher/TeacherFeedback';
import { TeacherAnnouncements } from './components/pages/teacher/TeacherAnnouncements';
import { TeacherSubjectPortal } from './components/pages/teacher/TeacherSubjectPortal';

// Student Pages
import { StudentDashboard } from './components/pages/student/StudentDashboard';
import { StudentAssignments } from './components/pages/student/StudentAssignments';
import { StudentCourses } from './components/pages/student/StudentCourses';
import { StudentCourseDetail } from './components/pages/student/StudentCourseDetail';
import { SubmitAssignment } from './components/pages/student/SubmitAssignment';
import { StudentAnnouncements } from './components/pages/student/StudentAnnouncements';
import { StudentReports } from './components/pages/student/StudentReports';
import { StudentFeedback } from './components/pages/student/StudentFeedback';
import { StudentSubmissions } from './components/pages/student/StudentSubmissions';

// Principal Pages
import { PrincipalDashboard } from './components/pages/principal/PrincipalDashboard';
import { TeacherOversight } from './components/pages/principal/TeacherOversight';
import { SchoolAnalytics } from './components/pages/principal/SchoolAnalytics';
import { StudentReports as PrincipalStudentReports } from './components/pages/principal/StudentReports';
import { PrincipalAnnouncements } from './components/pages/principal/PrincipalAnnouncements';
import { PrincipalFeedback } from './components/pages/principal/PrincipalFeedback';

// Parent Pages
import { ParentDashboard } from './components/pages/parent/ParentDashboard';
import { ParentAssignments } from './components/pages/parent/ParentAssignments';
import { ParentCommunication } from './components/pages/parent/ParentCommunication';
import { ParentAnnouncements } from './components/pages/parent/ParentAnnouncements';
import { ParentReports } from './components/pages/parent/ParentReports';

// Shared Pages
import { UserProfile } from './components/pages/shared/UserProfile';
import { Settings } from './components/pages/shared/Settings';
import { Notifications } from './components/pages/shared/Notifications';
import { Help } from './components/pages/shared/Help';

import { Toaster } from './components/ui/sonner';

export default function App() {
  const [currentPage, setCurrentPage] = useState('login');
  const [userRole, setUserRole] = useState<string>('');
  const [userName, setUserName] = useState<string>('');
  const [userEmail, setUserEmail] = useState<string>('');
  const [userPhoto, setUserPhoto] = useState<string>('');
  const [pageData, setPageData] = useState<any>(null);

  const handleLogin = async (role: string, email: string, password?: string) => {
    try {
      // API call: Send credentials. Note that text case for role sent doesn't matter as backend login ignores it 
      // and looks up user by email only.
      const response = await authService.login({ email, password, role: role.toLowerCase() });

      localStorage.setItem('token', response.token);

      const dbRole = response.user.role;

      // Strict Role Enforcement as requested:
      // "Academic role and email address and password three those things should be connected"
      if (role.toLowerCase() !== dbRole.toLowerCase()) {
        console.warn(`Role Mismatch: Selected ${role}, but user is ${dbRole}`);
        toast.error(`Access Denied: You are not registered as a "${role}". Please select the correct role.`);

        // Clear session immediately
        localStorage.removeItem('token');
        setUserRole('');
        setUserName('');
        setUserEmail('');
        return;
      }

      // If roles match, proceed to set session
      setUserRole(dbRole);
      setUserName(response.user.name);
      setUserEmail(response.user.email);
      setUserPhoto(response.user.profile_photo || '');
      // Store role so child components can detect parent vs student
      localStorage.setItem('role', dbRole);
      if (response.user.roleId) {
        localStorage.setItem('roleId', response.user.roleId);
      }
      if (response.user.linkedStudentId) {
        localStorage.setItem('linkedStudentId', response.user.linkedStudentId);
      }

      toast.success('Login successful!');

      // Navigate to Profile as default first entry
      setCurrentPage('profile');
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.response?.data?.message || 'Login failed. Please check your credentials.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('roleId');
    localStorage.removeItem('linkedStudentId');
    setUserRole('');
    setUserName('');
    setUserEmail('');
    setUserPhoto('');
    setCurrentPage('login');
    setPageData(null);
    toast.info('Logged out successfully');
  };

  const handleNavigate = (page: string, data?: any) => {
    setCurrentPage(page);
    setPageData(data || null);
  };

  const handleProfileUpdate = (data: any) => {
    if (data.name) setUserName(data.name);
    if (data.email) setUserEmail(data.email);
    if (data.profile_photo) setUserPhoto(data.profile_photo);
  };

  // Render auth pages (omitted unchanged parts)
  if (currentPage === 'login') {
    return (
      <>
        <Login onLogin={handleLogin} onNavigate={handleNavigate} />
        <Toaster />
      </>
    );
  }

  if (currentPage === 'forgot-password') {
    return (
      <>
        <ForgotPassword onNavigate={handleNavigate} />
        <Toaster />
      </>
    );
  }

  if (currentPage === 'reset-password') {
    return (
      <>
        <ResetPassword onNavigate={handleNavigate} data={pageData} />
        <Toaster />
      </>
    );
  }

  // Get navigation items for current role
  const navigationItems = getNavigationForRole(userRole);

  // Render page content based on current page
  const renderPage = () => {
    // Admin Pages
    if (currentPage === 'admin-dashboard') return <AdminDashboard onNavigate={handleNavigate} />;
    if (currentPage === 'admin-students') return <ManageStudents onNavigate={handleNavigate} />;
    if (currentPage === 'admin-student-form') return <StudentForm onNavigate={handleNavigate} data={pageData} />;
    if (currentPage === 'admin-teachers') return <ManageTeachers onNavigate={handleNavigate} />;
    if (currentPage === 'admin-teacher-form') return <TeacherForm onNavigate={handleNavigate} data={pageData} />;
    if (currentPage === 'admin-principals') return <ManagePrincipals onNavigate={handleNavigate} />;
    if (currentPage === 'admin-principal-form') return <PrincipalForm onNavigate={handleNavigate} data={pageData} />;
    if (currentPage === 'admin-parents') return <ManageParents onNavigate={handleNavigate} />;
    if (currentPage === 'admin-parent-form') return <ParentForm onNavigate={handleNavigate} data={pageData} />;
    if (currentPage === 'admin-classes') return <ManageClasses onNavigate={handleNavigate} />;
    if (currentPage === 'admin-inventory') return <ManageInventory onNavigate={handleNavigate} />;
    if (currentPage === 'admin-inventory-form') return <InventoryForm onNavigate={handleNavigate} data={pageData} />;
    if (currentPage === 'admin-announcements') return <AdminAnnouncements onNavigate={handleNavigate} />;
    if (currentPage === 'admin-audit') return <AuditLog onNavigate={handleNavigate} />;
    if (currentPage === 'admin-reports') return <AdminReports onNavigate={handleNavigate} />;
    if (currentPage === 'admin-user-management') return <UserManagement onNavigate={handleNavigate} />;

    // Teacher Pages
    if (currentPage === 'teacher-dashboard') return <TeacherDashboard onNavigate={handleNavigate} />;
    if (currentPage === 'teacher-classes') return <TeacherClasses onNavigate={handleNavigate} />;
    if (currentPage === 'teacher-class-detail') return <ClassDetail onNavigate={handleNavigate} data={pageData} />;
    if (currentPage === 'teacher-materials') return <TeacherMaterials onNavigate={handleNavigate} />;
    if (currentPage === 'teacher-instructions') return <TeacherInstructions onNavigate={handleNavigate} />;
    if (currentPage === 'teacher-instruction-form') return <InstructionForm onNavigate={handleNavigate} data={pageData} />;
    if (currentPage === 'teacher-submissions') return <TeacherSubmissions onNavigate={handleNavigate} />;
    if (currentPage === 'teacher-reports') return <TeacherReports onNavigate={handleNavigate} />;
    if (currentPage === 'teacher-feedback') return <TeacherFeedback onNavigate={handleNavigate} />;
    if (currentPage === 'teacher-announcements') return <TeacherAnnouncements onNavigate={handleNavigate} />;
    if (currentPage === 'teacher-subject-portal') return <TeacherSubjectPortal onNavigate={handleNavigate} data={pageData} />;

    // Student Pages
    if (currentPage === 'student-dashboard') return <StudentDashboard onNavigate={handleNavigate} />;
    if (currentPage === 'student-assignments') return <StudentAssignments onNavigate={handleNavigate} />;
    if (currentPage === 'student-courses') return <StudentCourses onNavigate={handleNavigate} />;
    if (currentPage === 'student-course-detail') return <StudentCourseDetail onNavigate={handleNavigate} data={pageData} />;
    if (currentPage === 'student-submit-assignment') return <SubmitAssignment onNavigate={handleNavigate} data={pageData} />;
    if (currentPage === 'student-announcements') return <StudentAnnouncements onNavigate={handleNavigate} />;
    if (currentPage === 'student-reports') return <StudentReports onNavigate={handleNavigate} data={pageData} />;
    if (currentPage === 'student-feedback') return <StudentFeedback onNavigate={handleNavigate} />;
    if (currentPage === 'student-submissions') return <StudentSubmissions onNavigate={handleNavigate} />;

    // Principal Pages
    if (currentPage === 'principal-dashboard') return <PrincipalDashboard onNavigate={handleNavigate} />;
    if (currentPage === 'principal-announcements') return <PrincipalAnnouncements onNavigate={handleNavigate} />;
    if (currentPage === 'principal-reports') return <PrincipalStudentReports onNavigate={handleNavigate} data={pageData} />;
    if (currentPage === 'principal-teacher-oversight') return <TeacherOversight onNavigate={handleNavigate} />;
    if (currentPage === 'principal-school-analytics') return <SchoolAnalytics onNavigate={handleNavigate} />;
    if (currentPage === 'principal-feedback') return <PrincipalFeedback onNavigate={handleNavigate} />;

    // Parent Pages
    if (currentPage === 'parent-dashboard') return <ParentDashboard onNavigate={handleNavigate} />;
    if (currentPage === 'parent-announcements') return <ParentAnnouncements onNavigate={handleNavigate} />;
    if (currentPage === 'parent-reports') return <ParentReports onNavigate={handleNavigate} />;
    if (currentPage === 'parent-communication') return <ParentCommunication onNavigate={handleNavigate} />;
    if (currentPage === 'parent-assignments') return <ParentAssignments onNavigate={handleNavigate} />;
    if (currentPage === 'parent-child-progress') return <ParentReports onNavigate={handleNavigate} />;

    // Shared Pages
    if (currentPage === 'profile') return <UserProfile userName={userName} userEmail={userEmail} userRole={userRole} onProfileUpdate={handleProfileUpdate} />;
    if (currentPage === 'settings') return <Settings onNavigate={handleNavigate} />
    if (currentPage === 'notifications') return <Notifications onNavigate={handleNavigate} />;
    if (currentPage === 'help') return <Help onNavigate={handleNavigate} />;

    // Default fallback
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-gray-900">Page Not Found</h1>
          <p className="mt-2 text-gray-600">The page you're looking for doesn't exist.</p>
          <button
            onClick={() => handleNavigate(`${userRole.toLowerCase()}-dashboard`)}
            className="mt-4 rounded-xl bg-[#2563EB] px-6 py-2 text-white hover:bg-[#1e40af]"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  };

  return (
    <>
      <Layout
        currentPage={currentPage}
        navigationItems={navigationItems}
        userRole={userRole}
        userName={userName}
        userPhoto={userPhoto}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
        notificationCount={5}
      >
        {renderPage()}
      </Layout>
      <Toaster />
    </>
  );
}
