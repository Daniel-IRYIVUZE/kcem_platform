// pages/Dashboard/UserDashboard.tsx
import { Routes, Route } from 'react-router-dom';
import UserOverview from '../../components/dashboard/individual/UserOverview';
import UserMarketplace from '../../components/dashboard/individual/UserMarketplace';
import UserMyImpact from '../../components/dashboard/individual/UserMyImpact';
import UserOrders from '../../components/dashboard/individual/UserOrders';
import UserFinancial from '../../components/dashboard/individual/UserFinancial';
import UserSettingsExtracted from '../../components/dashboard/individual/UserSettings';

/* ─── Main: UserDashboard Router ────────────────────────────── */
const UserDashboard = () => (
  <Routes>
    <Route index element={<UserOverview />} />
    <Route path="overview" element={<UserOverview />} />
    <Route path="marketplace" element={<UserMarketplace />} />
    <Route path="impact" element={<UserMyImpact />} />
    <Route path="orders" element={<UserOrders />} />
    <Route path="financial" element={<UserFinancial />} />
    <Route path="settings" element={<UserSettingsExtracted />} />
    <Route path="*" element={<UserOverview />} />
  </Routes>
);

export default UserDashboard;
