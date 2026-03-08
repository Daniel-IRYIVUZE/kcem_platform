// components/dashboard/business/BusinessCollectionSchedule.tsx
import { useState, useEffect } from 'react';
import { collectionsAPI, type Collection } from '../../../services/api';
import { Calendar, Clock, CheckCircle, Download } from 'lucide-react';
import StatCard from '../StatCard';
import DataTable from '../DataTable';
import { StatusBadge } from './_shared';

function downloadCSV(name: string, cols: string[], rows: (string | number)[][]) {
  const csv = [cols.join(','), ...rows.map(r => r.join(','))].join('\n');
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv])); a.download = `${name}.csv`; a.click();
}

export default function BusinessCollectionSchedule() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    collectionsAPI.list({ limit: 200 } as Parameters<typeof collectionsAPI.list>[0])
      .then(data => setCollections(data || []))
      .catch(() => setCollections([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = statusFilter === 'all' ? collections : collections.filter(c => c.status === statusFilter);

  const displayData = filtered.map(c => ({
    id: c.id,
    scheduledDate: c.scheduled_date ? new Date(c.scheduled_date).toLocaleDateString() : '—',
    scheduledTime: c.scheduled_time || '—',
    wasteType: c.waste_type,
    volume: `${c.volume || c.actual_weight || '?'} kg`,
    recyclerName: c.recycler_name || 'Pending',
    driverName: c.driver_name || 'Pending',
    status: c.status,
    earnings: c.earnings,
  }));

  const handleExport = () => downloadCSV('collection_schedule',
    ['ID', 'Date', 'Time', 'Type', 'Volume', 'Recycler', 'Driver', 'Status'],
    displayData.map(r => [r.id, r.scheduledDate, r.scheduledTime, r.wasteType, r.volume, r.recyclerName, r.driverName, r.status]));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Collection Schedule</h1>
        <div className="flex gap-2">
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-3 py-2 border rounded-lg text-sm dark:bg-gray-800 dark:border-gray-700">
            <option value="all">All Status</option>
            <option value="scheduled">Scheduled</option>
            <option value="en_route">En Route</option>
            <option value="collected">Collected</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-700/50">
            <Download size={16}/> Export
          </button>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard title="Total" value={collections.length} icon={<Calendar size={22} />} color="cyan" />
        <StatCard title="Scheduled" value={collections.filter(c => c.status === 'scheduled').length} icon={<Clock size={22} />} color="blue" />
        <StatCard title="En Route" value={collections.filter(c => c.status === 'en_route').length} icon={<CheckCircle size={22} />} color="purple" />
        <StatCard title="Completed" value={collections.filter(c => c.status === 'completed').length} icon={<CheckCircle size={22} />} color="orange" />
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-4">
        {loading ? (
          <div className="text-center py-12 text-gray-400 dark:text-gray-500">Loading collections…</div>
        ) : (
          <DataTable
            columns={[
              { key: 'id', label: 'ID', render: (v: string) => <span className="font-mono text-xs">#{v}</span> },
              { key: 'scheduledDate', label: 'Date', render: (v: string, r: typeof displayData[0]) => <div><p className="font-medium">{v}</p><p className="text-xs text-gray-500 dark:text-gray-400">{r.scheduledTime}</p></div> },
              { key: 'wasteType', label: 'Waste Type', render: (v: string) => <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs font-medium">{v}</span> },
              { key: 'volume', label: 'Volume' },
              { key: 'recyclerName', label: 'Recycler' },
              { key: 'driverName', label: 'Driver' },
              { key: 'status', label: 'Status', render: (v: string) => <StatusBadge status={v} /> },
              { key: 'earnings', label: 'Earnings', render: (v: number) => <span className="font-semibold text-green-600 dark:text-green-400">RWF {(v || 0).toLocaleString()}</span> },
            ]}
            data={displayData}
            pageSize={10}
          />
        )}
        {!loading && displayData.length === 0 && (
          <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-8">No collections found. Collections are created when a bid is accepted.</p>
        )}
      </div>
    </div>
  );
}
