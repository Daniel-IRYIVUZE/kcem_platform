import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Import Layout Components
import Sidebar from './components/layout/Sidebar';
import TopNav from './components/layout/TopNav';

// Public Pages (keep your existing imports)
import HomePage from './pages/Home/HomePage';
import AboutPage from './pages/About/AboutPage';
import ServicesPage from './pages/Services/ServicesPage';
import LoginPage from './pages/Login/LoginPage';
import RegisterPage from './pages/Register/RegisterPage';
import ForgotPassword from './pages/Login/ForgotPassword';
import BlogPage from './pages/Blog/BlogPage';
import ContactPage from './pages/Contact/ContactPage';
import MarketplacePage from './pages/Marketplace/MarketplacePage';
import TermsPrivacyPage from './pages/TermsPrivacy/TermsPrivacy';

// Dashboard Pages (update these imports to match your folder structure)
import RecyclerDashboard from './pages/Dashboard/RecyclerDashboard'; // Updated import
import DriverDashboard from './pages/Dashboard/DriverPage'; // Updated import
import IndividualDashboard from './pages/Dashboard/UserDashboard'; // Updated import
import BusinessDashboard from './pages/Dashboard/BusinessDashboard'; // Updated import
import AdminDashboard from './pages/Dashboard/AdminDashboard'; // Updated import

// Protected Route Component
type ProtectedRouteProps = {
  children: React.ReactNode;
  allowedRoles?: string[];
};

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" />;
  }
  
  return <>{children}</>;
};

// Dashboard Layout Component
const DashboardLayout = () => {
  const { user } = useAuth();
  
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar userRole={user?.role as 'admin' | 'business' | 'recycler' | 'driver' | 'individual'} />
      <div className="flex-1 flex flex-col overflow-hidden">
        {user && <TopNav user={user} />}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-stone-50 flex flex-col font-sans antialiased">
        <main className="flex-grow">
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
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              
              {/* Protected Dashboard Routes */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }>
                <Route index element={<Navigate to="overview" />} />
                
                {/* Admin Dashboard Routes */}
                <Route path="admin/*" element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                } />
                
                {/* Business/HORECA Dashboard Routes */}
                <Route path="business/*" element={
                  <ProtectedRoute allowedRoles={['business']}>
                    <BusinessDashboard />
                  </ProtectedRoute>
                } />
                
                {/* Recycler Dashboard Routes */}
                <Route path="recycler/*" element={
                  <ProtectedRoute allowedRoles={['recycler']}>
                    <RecyclerDashboard />
                  </ProtectedRoute>
                } />
                
                {/* Driver Dashboard Routes */}
                <Route path="driver/*" element={
                  <ProtectedRoute allowedRoles={['driver']}>
                    <DriverDashboard />
                  </ProtectedRoute>
                } />
                
                {/* Individual Dashboard Routes */}
                <Route path="individual/*" element={
                  <ProtectedRoute allowedRoles={['individual']}>
                    <IndividualDashboard />
                  </ProtectedRoute>
                } />
              </Route>
              
              {/* Redirect old dashboard routes to new structure */}
              <Route path="/admin" element={<Navigate to="/dashboard/admin" />} />
              <Route path="/business" element={<Navigate to="/dashboard/business" />} />
              <Route path="/recycler" element={<Navigate to="/dashboard/recycler" />} />
              <Route path="/driver" element={<Navigate to="/dashboard/driver" />} />
              <Route path="/user" element={<Navigate to="/dashboard/individual" />} />
              
              {/* Fallback Route */}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;