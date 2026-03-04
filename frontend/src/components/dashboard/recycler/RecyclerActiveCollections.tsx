import { useState, useEffect, useCallback } from 'react';
import { getAll, update as dsUpdate, downloadCSV } from '../../../utils/dataStore';
import type { Collection } from '../../../utils/dataStore';
import { Truck, Activity, Clock, CheckCircle, Download } from 'lucide-react';
import StatCard from '../StatCard';
import DataTable from '../DataTable';
import { StatusBadge } from './_shared';

export default function RecyclerActiveCollections() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [statusFilter, setStatusFilter] = useState('all');

  const load = useCallback(() => setCollections(getAll<Collection>('collections')), []);
  useEffect(() => { load(); window.addEventListener('ecotrade_data_change', load); return () => window.removeEventListener('ecotrade_data_change', load); }, [load]);

  const filtered = statusFilter === 'all' ? collections : collections.filter(c => c.status === statusFilter);
  const inProgress = collections.filter(c => c.status === 'en-route' || c.status === 'collected').length;

  const handleUpdateStatus = (id: string, newStatus: Collection['status']) => {
    const updates: Partial<Collection> = { status: newStatus };
    if (newStatus === 'completed') updates.completedAt = new Date().toISOString();
    dsUpdate<Collection>('collections', id, updates);
  };

  const handleExport = () => downloadCSV('collections',
    ['ID', 'Hotel', 'Recycler', 'Driver', 'Type', 'Volume', 'Status', 'Date', 'Earnings'],
    filtered.map(c => [c.id, c.hotelName, c.recyclerName, c.driverName, c.wasteType, String(c.volume), c.status, c.scheduledDate, String(c.earnings)]));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Collections</h1>
        <div className="flex gap-2">
          <span className="text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full font-medium">{inProgress} in progress</span>
          <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-700/50 dark:bg-gray-900"><Download size={16} /> Export</button>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard title="Total" value={collections.length} icon={<Truck size={22} />} color="cyan" />
        <StatCard title="In Progress" value={inProgress} icon={<Activity size={22} />} color="blue" />
        <StatCard title="Scheduled" value={collections.filter(c => c.status === 'scheduled').length} icon={<Clock size={22} />} color="purple" />
        <StatCard title="Completed" value={collections.filter(c => c.status === 'completed').length} icon={<CheckCircle size={22} />} color="orange" />
      </div>
      <div className="flex gap-2 flex-wrap">
        {['all', 'scheduled', 'en-route', 'collected', 'verified', 'completed', 'missed'].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)} className={`px-3 py-1 text-sm rounded-full border ${statusFilter === s ? 'bg-cyan-600 text-white border-cyan-600' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 dark:bg-gray-900'}`}>{s === 'all' ? 'All' : s}</button>
        ))}
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-4">
        <DataTable
          columns={[
            { key: 'id', label: 'ID', render: (v: string) => <span className="font-mono text-xs">{v}</span> },
            { key: 'hotelName', label: 'Hotel' },
            { key: 'driverName', label: 'Driver' },
            { key: 'wasteType', label: 'Type', render: (v: string) => <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs font-medium">{v}</span> },
            { key: 'volume', label: 'Volume', render: (v: number, r: Collection) => <span>{v} {r.wasteType === 'UCO' ? 'L' : 'kg'}</span> },
            { key: 'status', label: 'Status', render: (v: string) => <StatusBadge status={v} /> },
            { key: 'scheduledDate', label: 'Date' },
            { key: 'earnings', label: 'Earnings', render: (v: number) => <span className="font-semibold text-green-600 dark:text-green-400">RWF {v.toLocaleString()}</span> },
            { key: 'id', label: 'Actions', render: (v: string, r: Collection) => (
              <div className="flex gap-1">
                {r.status === 'scheduled' && <button onClick={() => handleUpdateStatus(v, 'en-route')} className="px-2 py-1 text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-700 rounded font-medium">Start</button>}
                {r.status === 'en-route' && <button onClick={() => handleUpdateStatus(v, 'collected')} className="px-2 py-1 text-xs bg-green-50 dark:bg-green-900/20 text-green-700 rounded font-medium">Collected</button>}
                {r.status === 'collected' && <button onClick={() => handleUpdateStatus(v, 'completed')} className="px-2 py-1 text-xs bg-purple-50 dark:bg-purple-900/20 text-purple-700 rounded font-medium">Complete</button>}
              </div>
            )},
          ]}
          data={filtered}
          pageSize={6}
        />
        {filtered.length === 0 && <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-8">No collections found.</p>}
      </div>
    </div>
  );
}
