// pages/Dashboard/BusinessDashboard.tsx
import { Routes, Route, Navigate } from 'react-router-dom';
import BusinessOverview from '../../components/dashboard/business/BusinessOverview';
import BusinessListings from '../../components/dashboard/business/BusinessListings';
import BusinessRevenue from '../../components/dashboard/business/BusinessRevenue';
import BusinessGreenScore from '../../components/dashboard/business/BusinessGreenScore';
import BusinessCollectionSchedule from '../../components/dashboard/business/BusinessCollectionSchedule';
import BusinessTransactions from '../../components/dashboard/business/BusinessTransactions';
import BusinessSettings from '../../components/dashboard/business/BusinessSettings';
import BusinessReports from '../../components/dashboard/business/BusinessReports';
import BusinessMessages from '../../components/dashboard/business/BusinessMessages';
import BusinessLocation from '../../components/dashboard/business/BusinessLocation';
import BusinessDrivers from '../../components/dashboard/recycler/RecyclerDrivers';

/* ─── Main: BusinessDashboard Router ────────────────────────── */
const BusinessDashboard = () => (
  <Routes>
    <Route index element={<BusinessOverview />} />
    <Route path="overview" element={<BusinessOverview />} />
    <Route path="listings" element={<BusinessListings />} />
    <Route path="new-listing" element={<Navigate to="/dashboard/business/listings" replace />} />
    <Route path="revenue" element={<BusinessRevenue />} />
    <Route path="greenscore" element={<BusinessGreenScore />} />
    <Route path="schedule" element={<BusinessCollectionSchedule />} />
    <Route path="transactions" element={<BusinessTransactions />} />
    <Route path="settings" element={<BusinessSettings />} />
    <Route path="reports" element={<BusinessReports />} />
    <Route path="messages" element={<BusinessMessages />} />
    <Route path="location" element={<BusinessLocation />} />
    <Route path="drivers" element={<BusinessDrivers />} />
    <Route path="*" element={<BusinessOverview />} />
  </Routes>
);

export default BusinessDashboard;
