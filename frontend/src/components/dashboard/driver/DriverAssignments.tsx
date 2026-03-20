import { useState, useEffect, useCallback } from 'react';
import { downloadCSV } from '../../../utils/dataStore';
import { collectionsAPI } from '../../../services/api';
import { haversineKm, etaMinutes, formatDist } from '../../../utils/geo';
import { ClipboardList, Download, Navigation, Eye, Calendar, Activity, MapPin, Clock } from 'lucide-react';
import StatCard from '../StatCard';
import DataTable from '../DataTable';

const StatusBadge = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    completed: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200', in_progress: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200',
    'en-route': 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200',
    en_route: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200',
    pending: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300', scheduled: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-800 dark:text-cyan-300',
  };
  return <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}>{status.replace(/_/g, ' ')}</span>;
};

export default function DriverAssignments() {
  const [collections, setCollections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [driverPos, setDriverPos] = useState<[number, number] | null>(null);
  const [gpsLabel, setGpsLabel] = useState<string>('Getting GPS…');

  const load = useCallback(() => {
    setLoading(true);
    collectionsAPI.list({ limit: 100 })
      .then(data => {
        // Only show pending/active assignments — never completed or cancelled
        const active = data.filter((c: any) =>
          ['scheduled', 'en_route', 'arrived', 'in_progress', 'collected'].includes(c.status ?? '')
        );
        setCollections(active);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  // Watch driver GPS position – updates every time the device moves
  useEffect(() => {
    if (!navigator.geolocation) {
      setGpsLabel('GPS unavailable');
      return;
    }
    const id = navigator.geolocation.watchPosition(
      pos => {
        setDriverPos([pos.coords.latitude, pos.coords.longitude]);
        setGpsLabel('GPS active');
      },
      () => setGpsLabel('GPS unavailable'),
      { enableHighAccuracy: true, maximumAge: 10_000, timeout: 20_000 },
    );
    return () => navigator.geolocation.clearWatch(id);
  }, []);

  // For each collection, compute distance+ETA from driver pos to destination
  const withGeo = collections.map((c: any) => {
    const destLat: number | undefined = c.listing_lat ?? c.hotel_lat;
    const destLng: number | undefined = c.listing_lng ?? c.hotel_lng;
    let distKm: number | null = null;
    let eta: number | null = null;
    if (driverPos && destLat != null && destLng != null) {
      distKm = haversineKm(driverPos[0], driverPos[1], destLat, destLng);
      eta = etaMinutes(distKm);
    }
    return { ...c, _distKm: distKm, _eta: eta };
  });

  const liveData = withGeo.map((c: any) => ({
    id: c.id, _id: c.id,
    date: c.scheduled_date
      ? new Date(c.scheduled_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
      : c.created_at
        ? new Date(c.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
        : '—',
    route: (c.location || c.hotel_name || 'Kigali').split(',')[0],
    totalWeight: c.volume ? `${c.volume} ${c.waste_type === 'UCO' ? 'L' : 'kg'}` : '—',
    distance: c._distKm != null ? formatDist(c._distKm * 1000) : '—',
    eta: c._eta != null ? `${c._eta} min` : '—',
    status: c.status,
  }));

  const handleStartRoute = (id: any) => {
    collectionsAPI.updateStatus(Number(id), { status: 'en_route' }).then(load).catch(() => {});
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Assignments</h1>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 flex items-center gap-1">
            <MapPin size={11} className={driverPos ? 'text-green-500' : 'text-gray-400'} />
            {gpsLabel}{driverPos ? ` · ${driverPos[0].toFixed(4)}, ${driverPos[1].toFixed(4)}` : ''}
          </p>
        </div>
        <button onClick={() => downloadCSV('assignments', ['ID','Date','Route','Weight','Distance','ETA','Status'],
          liveData.map(r => [r.id, r.date, r.route, r.totalWeight, r.distance, r.eta, r.status]))}
          className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-700/50"><Download size={16}/> Export</button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Total Assignments" value={liveData.length} icon={<ClipboardList size={22} />} color="cyan" />
        <StatCard title="In Progress" value={liveData.filter(a => a.status === 'in_progress' || a.status === 'en_route' || a.status === 'en-route').length} icon={<Activity size={22} />} color="blue" />
        <StatCard title="Scheduled" value={liveData.filter(a => a.status === 'scheduled').length} icon={<Calendar size={22} />} color="purple" />
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-4">
        <DataTable
          columns={[
            { key: 'id', label: 'ID', render: (v: string) => <span className="font-mono text-sm font-semibold text-cyan-600">{v}</span> },
            { key: 'date', label: 'Date' },
            { key: 'route', label: 'Zone' },
            { key: 'totalWeight', label: 'Weight' },
            {
              key: 'distance', label: 'Distance',
              render: (v: string) => (
                <span className={`flex items-center gap-1 text-sm font-medium ${v === '—' ? 'text-gray-400' : 'text-cyan-600 dark:text-cyan-400'}`}>
                  <MapPin size={12} />{v}
                </span>
              ),
            },
            {
              key: 'eta', label: 'ETA',
              render: (v: string) => (
                <span className={`flex items-center gap-1 text-sm font-medium ${v === '—' ? 'text-gray-400' : 'text-blue-600 dark:text-blue-400'}`}>
                  <Clock size={12} />{v}
                </span>
              ),
            },
            { key: 'status', label: 'Status', render: (v: string) => <StatusBadge status={v} /> },
            { key: '_id', label: 'Action', render: (_v: string, r: typeof liveData[0]) => (r.status === 'in_progress' || r.status === 'en_route' || r.status === 'en-route') ? (
              <button className="px-3 py-1 text-xs bg-cyan-600 text-white rounded hover:bg-cyan-700 font-medium flex items-center gap-1"><Navigation size={12} /> Resume</button>
            ) : r.status === 'scheduled' ? (
              <button onClick={() => handleStartRoute(r._id || r.id)} className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 font-medium">Start</button>
            ) : (
              <button className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded hover:bg-gray-200 font-medium"><Eye size={12} /></button>
            )},
          ]}
          data={liveData}
          pageSize={6}
        />
        {!loading && liveData.length === 0 && (
          <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-8">No assignments yet. Your recycler will assign collections to you.</p>
        )}
        {loading && (
          <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-8">Loading assignments…</p>
        )}
    </div>
    </div>
  );
}
