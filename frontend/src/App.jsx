import { useState } from 'react'
import { Routes, Route, Outlet } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext' // 1. Import Provider
import ProtectedRoute from './component/Auth/ProtectedRoute' // 2. Import Protection

// Layouts & Pages
import Sidebar from './component/bar/Sidebar' 
import Navbar from './component/bar/Navbar'   
import TimetablePage from './pages/Timetable.jsx'
import Announcements from './pages/Announcements.jsx'
import DashboardPage from './pages/Dashboard.jsx'
import CoursesPage from './pages/CoursesPage.jsx'
import AnalyticsPage from './pages/Analytics.jsx'
import ProfilePage from './pages/Profile.jsx'
import SettingsPage from './pages/Settings.jsx'
import GradeCalculatorPage from './pages/GradeCalculator.jsx'
import ExamSchedulePage from './pages/ExamSchedule.jsx'
import AttendancePage from './pages/AttendancePage.jsx'
import LoginPage from './component/Auth/Login.jsx' // Make sure path matches your file structure
import RegisterPage from './component/Auth/Register.jsx'
import VerifyPage from './component/Auth/verify.jsx'


const NotFound = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-100">
    <h1 className="text-2xl font-bold text-gray-400">404 - Page Not Found</h1>
  </div>
)

const MainLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      <Sidebar isOpen={isSidebarOpen} closeSidebar={closeSidebar} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar toggleSidebar={toggleSidebar} />
        <main className="flex-1 overflow-y-auto p-8">
          <Outlet /> 
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    // 3. Wrap entire app in AuthProvider
    <AuthProvider>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verify" element={<VerifyPage />} />

        {/* Protected Routes */}
        <Route element={
          // 4. Wrap MainLayout in ProtectedRoute
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/announcements" element={<Announcements />} />
          <Route path="/courses" element={<CoursesPage />} />
          <Route path="/timetable" element={<TimetablePage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/grade-calculator" element={<GradeCalculatorPage />} />
          <Route path="/exam-schedule" element={<ExamSchedulePage />} />
          <Route path="/attendance/:courseId" element={<AttendancePage />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </AuthProvider>
  )
}