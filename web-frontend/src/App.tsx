import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Public Pages
import HomePage from './pages/Home/HomePage';
import AboutPage from './pages/About/AboutPage';
import ServicesPage from './pages/Services/ServicesPage';
import LoginPage from './pages/Login/LoginPage';
import RegisterPage from './pages/Register/RegisterPage';
import ForgotPassword from './pages/Login/ForgotPassword';
import BlogPage from './pages/Blog/BlogPage';
import ContactPage from './pages/Contact/ContactPage';
import UpdatesPage from './pages/Updates/UpdatesPage';
import MarketplacePage from './pages/Marketplace/MarketplacePage';
import TermsPrivacyPage from './pages/TermsPrivacy/TermsPrivacy';

// Dashboard Pages
import HotelDashboard from './pages/Dashboard/hotel';
import RecyclerDashboard from './pages/Dashboard/recycler';
import DriverDashboard from './pages/Dashboard/driver';
import UserDashboard from './pages/Dashboard/user';
import SettingsPage from './pages/Dashboard/settings';
import AdminDashboard from './pages/admin';

function App() {
  return (
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
            <Route path="/updates" element={<UpdatesPage />} />
            <Route path="/marketplace" element={<MarketplacePage />} />
            <Route path="/terms-privacy" element={<TermsPrivacyPage />} />
            
            {/* Authentication Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            
            {/* Admin Dashboard Routes */}
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/settings" element={<SettingsPage role="admin" />} />
            
            {/* Hotel Dashboard Routes */}
            <Route path="/dashboard/hotel" element={<HotelDashboard />} />
            <Route path="/dashboard/hotel/settings" element={<SettingsPage role="hotel" />} />
            
            {/* Recycler Dashboard Routes */}
            <Route path="/dashboard/recycler" element={<RecyclerDashboard />} />
            <Route path="/dashboard/recycler/settings" element={<SettingsPage role="recycler" />} />
            
            {/* Driver Dashboard Routes */}
            <Route path="/dashboard/driver" element={<DriverDashboard />} />
            <Route path="/dashboard/driver/settings" element={<SettingsPage role="driver" />} />
            
            {/* User Dashboard Routes */}
            <Route path="/dashboard/user" element={<UserDashboard />} />
            <Route path="/dashboard/user/settings" element={<SettingsPage role="user" />} />
            
            {/* Global Settings Route */}
            <Route path="/dashboard/settings" element={<SettingsPage role="user" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;