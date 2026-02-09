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
// import UpdatesPage from './pages/Updates/UpdatesPage';
import MarketplacePage from './pages/Marketplace/MarketplacePage';
import TermsPrivacyPage from './pages/TermsPrivacy/TermsPrivacy';

// Dashboard Pages
import RecyclerDashboard from './pages/Dashboard/RecyclerPage';
import DriverDashboard from './pages/Dashboard/DriverPage';
import UserDashboard from './pages/Dashboard/UserPage';
import BusinessDashboard from './pages/Dashboard/BusinessPage';
import AdminDashboard from './pages/Dashboard/AdminPage';

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
            {/* <Route path="/updates" element={<UpdatesPage />} /> */}
            <Route path="/marketplace" element={<MarketplacePage />} />
            <Route path="/terms-privacy" element={<TermsPrivacyPage />} />
            
            {/* Authentication Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            
            {/* Admin Dashboard Routes */}
            <Route path="/admin" element={<AdminDashboard/>} />
            
            {/* Business Dashboard Routes */}
            <Route path="/business" element={<BusinessDashboard />} />
            
            {/* Recycler Dashboard Routes */}
            <Route path="/recycler" element={<RecyclerDashboard />} />
            
            {/* Driver Dashboard Routes */}
            <Route path="/driver" element={<DriverDashboard />} />
            
            {/* User Dashboard Routes */}
            <Route path="/user" element={<UserDashboard />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;