import { Routes, Route } from 'react-router-dom';
import AdminOverview from '../../components/dashboard/admin/AdminOverview';
import AdminUserManagement from '../../components/dashboard/admin/AdminUserManagement';
import AdminListings from '../../components/dashboard/admin/AdminListings';
import AdminTransactions from '../../components/dashboard/admin/AdminTransactions';
import AdminAnalytics from '../../components/dashboard/admin/AdminAnalytics';
import AdminAuditLogs from '../../components/dashboard/admin/AdminAuditLogs';
import AdminSupportTickets from '../../components/dashboard/admin/AdminSupportTickets';
import AdminVerificationQueue from '../../components/dashboard/admin/AdminVerificationQueue';
import AdminSettings from '../../components/dashboard/admin/AdminSettings';
import AdminReports from '../../components/dashboard/admin/AdminReports';
import AdminGreenScores from '../../components/dashboard/admin/AdminGreenScores';

export default function AdminDashboard() {
  return (
    <Routes>
      <Route index element={<AdminOverview />} />
      <Route path="overview" element={<AdminOverview />} />
      <Route path="users" element={<AdminUserManagement />} />
      <Route path="hotels" element={<AdminUserManagement />} />
      <Route path="recyclers" element={<AdminUserManagement />} />
      <Route path="drivers" element={<AdminUserManagement />} />
      <Route path="listings" element={<AdminListings />} />
      <Route path="transactions" element={<AdminTransactions />} />
      <Route path="analytics" element={<AdminAnalytics />} />
      <Route path="audit-logs" element={<AdminAuditLogs />} />
      <Route path="support" element={<AdminSupportTickets />} />
      <Route path="verification" element={<AdminVerificationQueue />} />
      <Route path="settings" element={<AdminSettings />} />
      <Route path="reports" element={<AdminReports />} />
      <Route path="green-scores" element={<AdminGreenScores />} />
      <Route path="*" element={<AdminOverview />} />
    </Routes>
  );
}
