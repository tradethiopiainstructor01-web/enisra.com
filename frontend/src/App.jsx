import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import CreatePage from "./pages/CreatePage";
import CreateQuiz from "./pages/CreateQuiz";
import Addresource from "./pages/Addresource";
import HomePage from "./pages/HomePage";
import WelcomePage from "./pages/WelcomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import SecondPage from "./pages/SecondPage";
import ThirdPage from "./pages/ThirdPage";
import FourthPage from "./pages/FourthPage";
import FifthPage from "./pages/FifthPage.jsx";
import QuizPage from "./pages/quizPage.jsx";
import PDFList from "./components/PDFList";
import InfoForm from "./pages/InfoForm";
import EmployeeFileUploadForm from "./pages/EmployeeFileUploadForm";
import DocumentUploadForm from "./components/DocumentUploadForm";
import DocumentList from "./components/DocumentList";
import Category from "./components/category";
import AssetCategoryPage from "./pages/AssetCategoryPage.jsx";
import AssetManagementPage from "./pages/AssetManagementPage.jsx";
import TTV from "./pages/ttv.jsx";
import EmployeeDocumentList from "./components/EmployeeDocument";
import WaitingForApproval from "./pages/WaitingForApproval";
import ComingSoonPage from "./pages/ComingSoonPage";
import ScholarshipLoginPage from "./pages/ScholarshipLoginPage";
import ScholarshipPortalPage from "./pages/ScholarshipPortalPage";
import ScholarshipApplicationPage from "./pages/ScholarshipApplicationPage";
import ScholarshipPostsPage from "./pages/ScholarshipPostsPage";
import ScholarshipPostDetailPage from "./pages/ScholarshipPostDetailPage";
import FreeTrainingCoursesPage from "./pages/FreeTrainingCoursesPage";
import FreeTrainingCourseDetailPage from "./pages/FreeTrainingCourseDetailPage";
import AdminTrainingUpload from "./pages/AdminTrainingUpload";
import AdminDashboard from "./pages/admin/AdminDashboard";
import B2BDashboard from "./pages/B2BDashboard";
import COODashboard from "./pages/COODashboard";
import TradexTVDashboard from "./pages/TradexTVDashboard";
import ITDashboard from "./pages/ITDashboard";
import { LanguageProvider } from "./context/language.jsx";
import ENISRALayout from "./components/ENSRA/ENSRALayout";
import ENISRAEnhancedDashboard from "./components/ENSRA/ENISRAEnhancedDashboard";
import ENISRANoticeBoard from "./components/ENSRA/ENSRANoticeBoard";
import ENISRARequestEmbedded from "./components/ENSRA/ENISRARequestEmbedded";
import ProtectedRoute from "./routes/ProtectedRoute";
import ScholarshipProtectedRoute from "./routes/ScholarshipProtectedRoute";
import RoleProtectedRoute from "./components/RoleProtectedRoute";
import InstructorLayout from "./components/instructor/InstructorLayout";
import InstructorDashboard from "./pages/instructor/Dashboard";
import InstructorRequest from "./pages/instructor/Request";
import InstructorNoticeBoard from "./pages/instructor/NoticeBoard";
import MessagesPage from "./pages/MessagesPage";
import NoticeBoardPage from "./pages/NoticeBoardPage";
import SocialMediaDashboardPage from "./pages/socialmedia/SocialMediaDashboardPage";
import TeamRequestsPage from "./pages/supervisor/TeamRequestsPage.jsx";
import AppLayout from "./components/AppLayout";
import SupervisorLayout from "./pages/supervisor/SupervisorLayout.jsx";
import SupervisorDashboardPage from "./pages/supervisor/SupervisorDashboardPage.jsx";
import SupervisorAccountPage from "./pages/supervisor/SupervisorAccountPage.jsx";
import EmployerLayout from "./pages/employer/EmployerLayout";
import EmployerProfile from "./pages/employer/EmployerProfile";
import EmployerPostJob from "./pages/employer/EmployerPostJob";
import EmployerEmployees from "./pages/employer/EmployerEmployees";
import EmployerPromotion from "./pages/employer/EmployerPromotion";
import EmployerUpgradePackage from "./pages/employer/EmployerUpgradePackage";
import EmployeeLayout from "./pages/employee/EmployeeLayout";
import EmployeeProfile from "./pages/employee/EmployeeProfile";
import EmployeeJobs from "./pages/employee/EmployeeJobs";
import EmployeeFavorites from "./pages/employee/EmployeeFavorites";
import EmployeeCreateCV from "./pages/employee/EmployeeCreateCV";
import EmployeeDashboard from "./pages/employee/EmployeeDashboard";
import JobsPage from "./pages/jobs/JobsPage.jsx";
import "./styles/dashboard-layout.css";

function App() {
  const location = useLocation();

  // Define the paths where Sidebar and Navbar should not appear
  const noNavSidebarRoutes = [
    "/",
    "/login",
    "/register",
    "/secondpage",
    "/employee-info",
    "/employee-file-upload",
    "/employee-jobs",
    "/employee-create-cv",
    "/employee",
    "/thirdpage",
    "/ttv",
    "/fourthpage",
    "/fifthpage",
    "/exam",
    "/resource",
    "/waitingforapproval",
    "/comingsoonpage",
    "/coo-dashboard",
    "/tradextv-dashboard",
    "/it",
    "/social-media",
    "/requests",
    "/supervisor",
    "/supervisor/account",
    "/employer",
    "/InfoForm",
    "/scholarship-login",
    "/scholarship-portal",
    "/scholarship-posts",
    "/scholarship-application",
    "/free-training-courses",
  ].map((path) => path.toLowerCase());

  // Hide the navbar and sidebar for legacy/fullscreen pages; root should only match exactly
  const normalizedPath = location.pathname.toLowerCase();
  const showNavAndSidebar = !noNavSidebarRoutes.some((route) => {
    if (route === "/") {
      return normalizedPath === "/";
    }
    return normalizedPath.startsWith(route);
  });

  // Wrapper component that conditionally applies the layout
  const LayoutWrapper = ({ children }) => {
    if (showNavAndSidebar) {
      return <AppLayout>{children}</AppLayout>;
    }
    return children;
  };

  return (
    <LanguageProvider>
      <Routes>
        <Route path="/" element={<WelcomePage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/scholarship-login" element={<ScholarshipLoginPage />} />
      <Route
        path="/scholarship-portal"
        element={
          <ScholarshipProtectedRoute>
            <ScholarshipPortalPage />
          </ScholarshipProtectedRoute>
        }
      />
      <Route
        path="/scholarship-posts"
        element={
          <ScholarshipProtectedRoute>
            <ScholarshipPostsPage />
          </ScholarshipProtectedRoute>
        }
      />
      <Route
        path="/scholarship-posts/:postId"
        element={
          <ScholarshipProtectedRoute>
            <ScholarshipPostDetailPage />
          </ScholarshipProtectedRoute>
        }
      />
      <Route
        path="/scholarship-application"
        element={
          <ScholarshipProtectedRoute>
            <ScholarshipApplicationPage />
          </ScholarshipProtectedRoute>
        }
      />
      <Route
        path="/free-training-courses"
        element={
          <ScholarshipProtectedRoute>
            <FreeTrainingCoursesPage />
          </ScholarshipProtectedRoute>
        }
      />
      <Route
        path="/free-training-courses/:courseId"
        element={
          <ScholarshipProtectedRoute>
            <FreeTrainingCourseDetailPage />
          </ScholarshipProtectedRoute>
        }
      />
      <Route path="/InfoForm" element={<InfoForm />} />
      <Route path="/secondpage" element={<SecondPage />} />
      <Route path="/thirdpage" element={<ThirdPage />} />
      <Route path="/fourthpage" element={<FourthPage />} />
      <Route path="/fifthpage" element={<FifthPage />} />
      <Route path="/exam" element={<QuizPage />} />
      <Route path="/WaitingForApproval" element={<WaitingForApproval />} />
      <Route path="/jobs" element={<JobsPage />} />
      <Route path="/jobs/:jobId" element={<JobsPage />} />
      <Route path="/resource" element={<Navigate to="/resources" replace />} />
      <Route
        path="/employee"
        element={
          <ProtectedRoute>
            <EmployeeLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="profile" replace />} />
        <Route path="profile" element={<EmployeeProfile />} />
        <Route path="jobs" element={<EmployeeJobs />} />
        <Route path="favorites" element={<EmployeeFavorites />} />
        <Route path="create-cv" element={<EmployeeCreateCV />} />
        <Route path="dashboard" element={<EmployeeDashboard />} />
        <Route path="all-jobs" element={<JobsPage />} />
      </Route>
      <Route path="/employee-info" element={<Navigate to="/employee/profile" replace />} />
      <Route path="/employee-jobs" element={<Navigate to="/employee/jobs" replace />} />
      <Route path="/employee-create-cv" element={<Navigate to="/employee/create-cv" replace />} />
      <Route path="/employee-file-upload" element={<EmployeeFileUploadForm />} />
      <Route
        path="/users"
        element={
          <LayoutWrapper>
            <HomePage />
          </LayoutWrapper>
        }
      />
      <Route path="/documentupload" element={<DocumentUploadForm />} />
      <Route
        path="/category"
        element={
          <LayoutWrapper>
            <Category />
          </LayoutWrapper>
        }
      />
      <Route
        path="/documentlist"
        element={
          <LayoutWrapper>
            <DocumentList />
          </LayoutWrapper>
        }
      />
      <Route
        path="/EmployeeDocument"
        element={
          <LayoutWrapper>
            <EmployeeDocumentList />
          </LayoutWrapper>
        }
      />
      <Route
        path="/documentlist/:id"
        element={
          <LayoutWrapper>
            <DocumentList />
          </LayoutWrapper>
        }
      />
      <Route
        path="/create"
        element={
          <LayoutWrapper>
            <CreatePage />
          </LayoutWrapper>
        }
      />
      <Route
        path="/quiz"
        element={
          <LayoutWrapper>
            <CreateQuiz />
          </LayoutWrapper>
        }
      />
      <Route
        path="/resources"
        element={
          <LayoutWrapper>
            <PDFList />
          </LayoutWrapper>
        }
      />
      <Route
        path="/Addresource"
        element={
          <LayoutWrapper>
            <Addresource />
          </LayoutWrapper>
        }
      />
      <Route
        path="/assetcategory"
        element={
          <LayoutWrapper>
            <AssetCategoryPage />
          </LayoutWrapper>
        }
      />
      <Route
        path="/assets"
        element={
          <LayoutWrapper>
            <AssetManagementPage />
          </LayoutWrapper>
        }
      />
      <Route path="/ttv" element={<TTV />} />
      <Route
        path="/PDF"
        element={
          <LayoutWrapper>
            <PDFList />
          </LayoutWrapper>
        }
      />
      <Route path="/ComingSoonPage" element={<ComingSoonPage />} />

      <Route
        path="/admin-training-upload"
        element={
          <ProtectedRoute>
            <LayoutWrapper>
              <AdminTrainingUpload />
            </LayoutWrapper>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <RoleProtectedRoute allowedRoles={["admin"]}>
            <AdminDashboard />
          </RoleProtectedRoute>
        }
      />

      <Route
        path="/b2b-dashboard"
        element={
          <LayoutWrapper>
            <B2BDashboard />
          </LayoutWrapper>
        }
      />
      <Route path="/coo-dashboard" element={<COODashboard />} />
      <Route path="/tradextv-dashboard" element={<TradexTVDashboard />} />

      <Route
        path="/employer"
        element={
          <RoleProtectedRoute allowedRoles={["employer", "admin"]}>
            <EmployerLayout />
          </RoleProtectedRoute>
        }
      >
        <Route index element={<Navigate to="profile" replace />} />
        <Route path="dashboard/*" element={<Navigate to="profile" replace />} />
        <Route path="profile" element={<EmployerProfile />} />
        <Route path="post" element={<EmployerPostJob />} />
        <Route path="promotion" element={<EmployerPromotion />} />
        <Route path="upgrade" element={<EmployerUpgradePackage />} />
        <Route path="employees" element={<EmployerEmployees />} />
      </Route>

      <Route
        path="/social-media"
        element={
          <LayoutWrapper>
            <SocialMediaDashboardPage />
          </LayoutWrapper>
        }
      />
      <Route path="/requests" element={<Navigate to="/jobs" replace />} />
      <Route path="/it" element={<ITDashboard />} />

      <Route
        path="/instructor"
        element={
          <RoleProtectedRoute allowedRoles={["instructor"]}>
            <InstructorLayout />
          </RoleProtectedRoute>
        }
      >
        <Route index element={<InstructorDashboard />} />
        <Route path="dashboard" element={<InstructorDashboard />} />
        <Route path="request" element={<InstructorRequest />} />
        <Route path="notice-board" element={<InstructorNoticeBoard />} />
      </Route>

      <Route path="/enisra" element={<ENISRALayout />}>
        <Route index element={<ENISRAEnhancedDashboard />} />
        <Route path="dashboard" element={<ENISRAEnhancedDashboard />} />
        <Route path="notice-board" element={<ENISRANoticeBoard />} />
        <Route path="request" element={<ENISRARequestEmbedded />} />
      </Route>

      <Route
        path="/messages"
        element={
          <LayoutWrapper>
            <MessagesPage />
          </LayoutWrapper>
        }
      />

        <Route path="/supervisor" element={<SupervisorLayout />}>
          <Route index element={<SupervisorDashboardPage />} />
          <Route path="requests" element={<TeamRequestsPage />} />
          <Route path="notice-board" element={<NoticeBoardPage embedded />} />
        </Route>
        <Route path="/supervisor/account" element={<SupervisorAccountPage />} />
      </Routes>
    </LanguageProvider>
  );
}

export default App;
