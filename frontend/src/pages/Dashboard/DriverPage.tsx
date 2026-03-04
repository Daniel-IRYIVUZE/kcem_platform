// pages/Dashboard/DriverPage.tsx
import { Routes, Route } from 'react-router-dom';
import DriverTodaysRoute from '../../components/dashboard/driver/DriverTodaysRoute';
import DriverAssignments from '../../components/dashboard/driver/DriverAssignments';
import DriverCompletedJobs from '../../components/dashboard/driver/DriverCompletedJobs';
import DriverEarnings from '../../components/dashboard/driver/DriverEarnings';
import DriverVehicle from '../../components/dashboard/driver/DriverVehicle';
import DriverSettingsExtracted from '../../components/dashboard/driver/DriverSettings';
import DriverSupportExtracted from '../../components/dashboard/driver/DriverSupport';

/* ─── Main: DriverPage Router ───────────────────────────────── */
const DriverPage = () => (
  <Routes>
    <Route index element={<DriverTodaysRoute />} />
    <Route path="assignments" element={<DriverAssignments />} />
    <Route path="completed" element={<DriverCompletedJobs />} />
    <Route path="earnings" element={<DriverEarnings />} />
    <Route path="vehicle" element={<DriverVehicle />} />
    <Route path="settings" element={<DriverSettingsExtracted />} />
    <Route path="support" element={<DriverSupportExtracted />} />
    <Route path="*" element={<DriverTodaysRoute />} />
  </Routes>
);

export default DriverPage;
