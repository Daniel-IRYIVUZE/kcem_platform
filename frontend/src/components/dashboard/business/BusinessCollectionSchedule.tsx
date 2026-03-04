// components/dashboard/business/BusinessCollectionSchedule.tsx
import { useState, useEffect } from 'react';
import { getAll, downloadCSV } from '../../../utils/dataStore';
import type { Collection, PlatformUser } from '../../../utils/dataStore';
import { Calendar, Clock, CheckCircle, Download } from 'lucide-react';
import StatCard from '../StatCard';
import DataTable from '../DataTable';
import { StatusBadge } from './_shared';

export default function BusinessCollectionSchedule() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const load = () => setCollections(getAll<Collection>('collections'));
  useEffect(() => { load(); window.addEventListener('ecotrade_data_change', load); return () => window.removeEventListener('ecotrade_data_change', load); }, []);

  const hotel = getAll<PlatformUser>('users').find(u => u.role === 'business');
  const hotelName = hotel?.name || 'Hotel Mille Collines';
  const mine = collections.filter(c => c.hotelName === hotelName || true); // show all if no match
  const filtered = statusFilter === 'all' ? mine : mine.filter(c => c.status === statusFilter);
  const displayData = filtered.map(c => ({
    id: c.id, scheduledDate: c.scheduledDate, scheduledTime: c.scheduledTime,
    wasteType: c.wasteType, volume: `${c.volume} ${c.wasteType === 'UCO' ? 'L' : 'kg'}`,
    recyclerName: c.recyclerName || 'Pending', driverName: c.driverName || 'Pending',
    status: c.status, earnings: c.earnings,
  }));

  const handleExport = () => downloadCSV('collection_schedule', ['ID','Date','Time','Type','Volume','Recycler','Driver','Status'],
    displayData.map(r => [r.id, r.scheduledDate, r.scheduledTime, r.wasteType, r.volume, r.recyclerName, r.driverName, r.status]));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Collection Schedule</h1>
        <div className="flex gap-2">
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-3 py-2 border rounded-lg text-sm">
            <option value="all">All Status</option><option value="scheduled">Scheduled</option><option value="en-route">En Route</option><option value="collected">Collected</option><option value="completed">Completed</option><option value="missed">Missed</option>
          </select>
          <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-700/50 dark:bg-gray-900"><Download size={16}/> Export</button>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard title="Total" value={mine.length} icon={<Calendar size={22} />} color="cyan" />
        <StatCard title="Scheduled" value={mine.filter(c => c.status === 'scheduled').length} icon={<Clock size={22} />} color="blue" />
        <StatCard title="En Route" value={mine.filter(c => c.status === 'en-route').length} icon={<CheckCircle size={22} />} color="purple" />
        <StatCard title="Completed" value={mine.filter(c => c.status === 'completed').length} icon={<CheckCircle size={22} />} color="orange" />
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-4">
        <DataTable
          columns={[
            { key: 'id', label: 'ID', render: (v: string) => <span className="font-mono text-xs">{v}</span> },
            { key: 'scheduledDate', label: 'Date', render: (v: string, r: typeof displayData[0]) => <div><p className="font-medium">{v}</p><p className="text-xs text-gray-500 dark:text-gray-400">{r.scheduledTime}</p></div> },
            { key: 'wasteType', label: 'Waste Type', render: (v: string) => <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs font-medium">{v}</span> },
            { key: 'volume', label: 'Volume' },
            { key: 'recyclerName', label: 'Recycler' },
            { key: 'driverName', label: 'Driver' },
            { key: 'status', label: 'Status', render: (v: string) => <StatusBadge status={v} /> },
            { key: 'earnings', label: 'Earnings', render: (v: number) => <span className="font-semibold text-green-600 dark:text-green-400">RWF {v.toLocaleString()}</span> },
          ]}
          data={displayData}
          pageSize={8}
        />
        {displayData.length === 0 && <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-8">No collections found. Collections are created when a bid is accepted.</p>}
      </div>
    </div>
  );
}
