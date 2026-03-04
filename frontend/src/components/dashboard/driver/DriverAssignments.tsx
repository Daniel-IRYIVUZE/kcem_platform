import { useState, useEffect, useCallback } from 'react';
import { getAll, update as dsUpdate, downloadCSV } from '../../../utils/dataStore';
import type { Collection } from '../../../utils/dataStore';
import { ClipboardList, Download, Navigation, Eye, Calendar, Activity } from 'lucide-react';
import StatCard from '../StatCard';
import DataTable from '../DataTable';
import { driverProfile, assignments } from './_shared';

const StatusBadge = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    completed: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200', in_progress: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200',
    'en-route': 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200',
    pending: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300', scheduled: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-800 dark:text-cyan-300',
  };
  return <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}>{status.replace(/_/g, ' ')}</span>;
};

export default function DriverAssignments() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const load = useCallback(() => setCollections(getAll<Collection>('collections').filter(c => c.driverName === driverProfile.name || c.status === 'scheduled')), []);
  useEffect(() => { load(); window.addEventListener('ecotrade_data_change', load); return () => window.removeEventListener('ecotrade_data_change', load); }, [load]);

  const liveData = collections.length > 0 ? collections.map(c => ({
    id: c.id, _id: c.id, date: c.scheduledDate, route: c.location.split(',')[0] || 'Kigali',
    stops: 1, totalWeight: `${c.volume} kg/L`, estimatedTime: '2h',
    status: c.status === 'en-route' ? 'in_progress' : c.status,
    earnings: `RWF ${c.earnings.toLocaleString()}`,
  })) : assignments.map(a => ({ ...a, _id: a.id }));

  const handleStartRoute = (id: string) => {
    const col = collections.find(c => c.id === id);
    if (col) { dsUpdate<Collection>('collections', id, { status: 'en-route' }); load(); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Assignments</h1>
        <button onClick={() => downloadCSV('assignments', ['ID','Date','Route','Status','Earnings'],
          liveData.map(r => [r.id, r.date, r.route, r.status, r.earnings]))}
          className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-700/50 dark:bg-gray-900"><Download size={16}/> Export</button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Total Assignments" value={liveData.length} icon={<ClipboardList size={22} />} color="cyan" />
        <StatCard title="In Progress" value={liveData.filter(a => a.status === 'in_progress' || a.status === 'en-route').length} icon={<Activity size={22} />} color="blue" />
        <StatCard title="Scheduled" value={liveData.filter(a => a.status === 'scheduled').length} icon={<Calendar size={22} />} color="purple" />
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-4">
        <DataTable
          columns={[
            { key: 'id', label: 'ID', render: (v: string) => <span className="font-mono text-sm font-semibold text-cyan-600">{v}</span> },
            { key: 'date', label: 'Date' },
            { key: 'route', label: 'Zone' },
            { key: 'stops', label: 'Stops' },
            { key: 'totalWeight', label: 'Weight' },
            { key: 'estimatedTime', label: 'Est. Time' },
            { key: 'earnings', label: 'Earnings', render: (v: string) => <span className="font-semibold text-green-600 dark:text-green-400">{v}</span> },
            { key: 'status', label: 'Status', render: (v: string) => <StatusBadge status={v} /> },
            { key: '_id', label: 'Action', render: (_v: string, r: typeof liveData[0]) => (r.status === 'in_progress' || r.status === 'en-route') ? (
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
        {liveData.length === 0 && <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-8">No assignments yet.</p>}
      </div>
    </div>
  );
}
