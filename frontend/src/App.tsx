// App.tsx
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';
import { seedDataIfEmpty } from './utils/dataStore';
import ScrollToTop from './components/common/ScrollToTop';

// Seed initial data on app load
seedDataIfEmpty();

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
  const { user } = useAuth();
  
  if (!user) return <Navigate to="/login" replace />;
  
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      <Sidebar userRole={user.role} />
      <div className="flex-1 flex flex-col overflow-hidden w-full">
        <TopNav user={user} />
        <main className="flex-1 overflow-y-auto p-3 sm:p-6 bg-gray-50 dark:bg-gray-950">
          <Outlet />
        </main>
      </div>
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