// pages/Dashboard/RecyclerDashboard.tsx
import { Routes, Route } from 'react-router-dom';
import RecyclerOverview from '../../components/dashboard/recycler/RecyclerOverview';
import RecyclerFleet from '../../components/dashboard/recycler/RecyclerFleet';
import RecyclerAvailableWaste from '../../components/dashboard/recycler/RecyclerAvailableWaste';
import RecyclerBids from '../../components/dashboard/recycler/RecyclerBids';
import RecyclerActiveCollections from '../../components/dashboard/recycler/RecyclerActiveCollections';
import RecyclerInventory from '../../components/dashboard/recycler/RecyclerInventory';
import RecyclerRevenue from '../../components/dashboard/recycler/RecyclerRevenue';
import RecyclerGreenImpact from '../../components/dashboard/recycler/RecyclerGreenImpact';
import RecyclerSettings from '../../components/dashboard/recycler/RecyclerSettings';
import RecyclerReports from '../../components/dashboard/recycler/RecyclerReports';
import RecyclerZones from '../../components/dashboard/recycler/RecyclerZones';
import RecyclerMessages from '../../components/dashboard/recycler/RecyclerMessages';

/* ─── Main: RecyclerDashboard Router ────────────────────────── */
const RecyclerDashboard = () => (
  <Routes>
    <Route index element={<RecyclerOverview />} />
    <Route path="overview" element={<RecyclerOverview />} />
    <Route path="fleet" element={<RecyclerFleet />} />
    <Route path="marketplace" element={<RecyclerAvailableWaste />} />
    <Route path="bids" element={<RecyclerBids />} />
    <Route path="collections" element={<RecyclerActiveCollections />} />
    <Route path="inventory" element={<RecyclerInventory />} />
    <Route path="revenue" element={<RecyclerRevenue />} />
    <Route path="impact" element={<RecyclerGreenImpact />} />
    <Route path="settings" element={<RecyclerSettings />} />
    <Route path="reports" element={<RecyclerReports />} />
    <Route path="zones" element={<RecyclerZones />} />
    <Route path="messages" element={<RecyclerMessages />} />
    <Route path="*" element={<RecyclerOverview />} />
  </Routes>
);

export default RecyclerDashboard;
