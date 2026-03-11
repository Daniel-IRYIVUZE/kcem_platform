// pages/Dashboard/DriverPage.tsx
import { useEffect, useRef } from 'react';
import { Routes, Route } from 'react-router-dom';
import DriverTodaysRoute from '../../components/dashboard/driver/DriverTodaysRoute';
import DriverAssignments from '../../components/dashboard/driver/DriverAssignments';
import DriverCompletedJobs from '../../components/dashboard/driver/DriverCompletedJobs';
import DriverEarnings from '../../components/dashboard/driver/DriverEarnings';
import DriverVehicle from '../../components/dashboard/driver/DriverVehicle';
import DriverSettingsExtracted from '../../components/dashboard/driver/DriverSettings';
import DriverSupportExtracted from '../../components/dashboard/driver/DriverSupport';
import { driversAPI } from '../../services/api';

/* ─── Main: DriverPage Router ───────────────────────────────── */
const DriverPage = () => {
  const lastSentRef = useRef<{ lat: number; lng: number; ts: number } | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) return;

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const now = Date.now();
        const prev = lastSentRef.current;

        // Send immediately once, then throttle tiny movements to reduce API noise.
        const moved = !prev || Math.abs(prev.lat - lat) > 0.00005 || Math.abs(prev.lng - lng) > 0.00005;
        const elapsed = !prev || now - prev.ts > 20_000;
        if (!moved && !elapsed) return;

        lastSentRef.current = { lat, lng, ts: now };
        driversAPI.updateLocation(lat, lng).catch(() => {});
      },
      () => {},
      { enableHighAccuracy: true, maximumAge: 10_000, timeout: 20_000 },
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  return (
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
};

export default DriverPage;
