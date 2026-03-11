// App.tsx
import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';
import ScrollToTop from './components/common/ScrollToTop';
import { authAPI } from './services/api';

// Import Layout Components
import Sidebar from './components/layout/Sidebar';
import TopNav from './components/layout/TopNav';

// Public Pages
import HomePage from './pages/Home/HomePage';
import AboutPage from './pages/About/AboutPage';
import ServicesPage from './pages/Services/ServicesPage';
import BlogPage from './pages/Blog/BlogPage';
import ContactPage from './pages/Contact/ContactPage';
import MarketplacePage from './pages/Marketplace/MarketplacePage';
import LoginPage from './pages/Login/LoginPage';
import TermsPrivacyPage from './pages/TermsPrivacy/TermsPrivacy';
import NotFoundPage from './pages/NotFound/NotFoundPage';
import ToastContainer from './components/common/Toast/ToastContainer';

// Dashboard Pages
import AdminDashboard from './pages/Dashboard/AdminDashboard';
import BusinessDashboard from './pages/Dashboard/BusinessDashboard';
import RecyclerDashboard from './pages/Dashboard/RecyclerDashboard';
import DriverPage from './pages/Dashboard/DriverPage';
import UserDashboard from './pages/Dashboard/UserDashboard';

// Loading Component
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-800/50">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-cyan-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-gray-600 dark:text-gray-400">Loading...</p>
    </div>
  </div>
);

// Protected Route Component
type ProtectedRouteProps = {
  children: React.ReactNode;
  allowedRoles?: string[];
};

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  
  if (loading) return <LoadingSpinner />;
  
  if (!user) {
    return <Navigate to="/login" state={{ from: window.location.pathname }} replace />;
  }
  
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={`/dashboard/${user.role}`} replace />;
  }
  
  return <>{children}</>;
};

// Dashboard Layout Component
const DashboardLayout = () => {
  const { user, mustChangePassword, clearMustChangePassword } = useAuth();
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [pwdError, setPwdError] = useState('');
  const [pwdLoading, setPwdLoading] = useState(false);

  if (!user) return <Navigate to="/login" replace />;

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPwd.length < 8) { setPwdError('Password must be at least 8 characters.'); return; }
    if (newPwd !== confirmPwd) { setPwdError('Passwords do not match.'); return; }
    setPwdLoading(true);
    setPwdError('');
    try {
      await authAPI.changePassword(newPwd);
      clearMustChangePassword();
    } catch (err) {
      setPwdError(err instanceof Error ? err.message : 'Failed to change password.');
    } finally {
      setPwdLoading(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-950 transition-colors duration-300" style={{ height: '100dvh' }}>
      <Sidebar userRole={user.role} />
      <div className="flex-1 flex flex-col min-h-0 w-full">
        <TopNav user={user} />
        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-950">
          <div className="h-full p-3 sm:p-6">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Force password change overlay for first-login drivers */}
      {mustChangePassword && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-8">
            <div className="w-14 h-14 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🔐</span>
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white text-center mb-1">Change Your Password</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-6">
              You are using a temporary password. Please set a new password to continue.
            </p>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New Password</label>
                <input
                  type="password"
                  value={newPwd}
                  onChange={e => setNewPwd(e.target.value)}
                  placeholder="At least 8 characters"
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirm Password</label>
                <input
                  type="password"
                  value={confirmPwd}
                  onChange={e => setConfirmPwd(e.target.value)}
                  placeholder="Repeat new password"
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  required
                />
              </div>
              {pwdError && (
                <p className="text-sm text-red-600 dark:text-red-400">{pwdError}</p>
              )}
              <button
                type="submit"
                disabled={pwdLoading}
                className="w-full py-2.5 bg-cyan-600 text-white rounded-xl font-medium hover:bg-cyan-700 disabled:opacity-50 transition-colors"
              >
                {pwdLoading ? 'Saving…' : 'Set New Password'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// Role-based dashboard redirect
const DashboardRedirect = () => {
  const { user } = useAuth();
  
  if (!user) return <Navigate to="/login" replace />;
  
  switch (user.role) {
    case 'admin':
      return <Navigate to="/dashboard/admin" replace />;
    case 'business':
      return <Navigate to="/dashboard/business" replace />;
    case 'recycler':
      return <Navigate to="/dashboard/recycler" replace />;
    case 'driver':
      return <Navigate to="/dashboard/driver" replace />;
    case 'individual':
      return <Navigate to="/dashboard/individual" replace />;
    default:
      return <Navigate to="/" replace />;
  }
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
        <Router>
          <ScrollToTop />
          <ToastContainer />
          <div className="min-h-screen bg-gray-50 dark:bg-gray-950 font-sans antialiased transition-colors duration-300">
            <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/marketplace" element={<MarketplacePage />} />
            <Route path="/terms-privacy" element={<TermsPrivacyPage />} />
            
            {/* Authentication Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<Navigate to="/login" replace />} />
            
            {/* Dashboard Root - Redirects to role-specific dashboard */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }>
              <Route index element={<DashboardRedirect />} />
              
              {/* Admin Dashboard */}
              <Route path="admin/*" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              
              {/* Business/Hotel Dashboard */}
              <Route path="business/*" element={
                <ProtectedRoute allowedRoles={['business']}>
                  <BusinessDashboard />
                </ProtectedRoute>
              } />
              
              {/* Recycler Dashboard */}
              <Route path="recycler/*" element={
                <ProtectedRoute allowedRoles={['recycler']}>
                  <RecyclerDashboard />
                </ProtectedRoute>
              } />
              
              {/* Driver Dashboard */}
              <Route path="driver/*" element={
                <ProtectedRoute allowedRoles={['driver']}>
                  <DriverPage />
                </ProtectedRoute>
              } />
              
              {/* Individual/User Dashboard */}
              <Route path="individual/*" element={
                <ProtectedRoute allowedRoles={['individual']}>
                  <UserDashboard />
                </ProtectedRoute>
              } />
            </Route>
            
            {/* Legacy redirect paths */}
            <Route path="/admin" element={<Navigate to="/dashboard/admin" replace />} />
            <Route path="/business" element={<Navigate to="/dashboard/business" replace />} />
            <Route path="/recycler" element={<Navigate to="/dashboard/recycler" replace />} />
            <Route path="/driver" element={<Navigate to="/dashboard/driver" replace />} />
            <Route path="/individual" element={<Navigate to="/dashboard/individual" replace />} />
            
            {/* 404 Not Found */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
          </div>
        </Router>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;