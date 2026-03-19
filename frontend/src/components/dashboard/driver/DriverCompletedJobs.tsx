import { useState, useEffect, useCallback } from 'react';
import { collectionsAPI, type Collection } from '../../../services/api';
import { downloadCSV } from '../../../utils/dataStore';
import { CheckCircle, Package, Star, DollarSign, Download } from 'lucide-react';
import StatCard from '../StatCard';
import DataTable from '../DataTable';

export default function DriverCompletedJobs() {
  const [completedCols, setCompletedCols] = useState<Collection[]>([]);
  const load = useCallback(() => {
    collectionsAPI.list({ status: 'completed', limit: 100 }).then(setCompletedCols).catch(() => {});
  }, []);
  useEffect(() => { load(); }, [load]);

  const tableData = completedCols.map(c => ({
    id: c.id, date: c.completed_at?.split('T')[0] ?? c.scheduled_date,
    route: (c.location || 'Kigali').split(',')[0], stops: 1,
    totalWeight: `${c.actual_weight ?? c.volume} kg`,
    duration: '2h', earnings: `RWF ${(c.earnings ?? 0).toLocaleString()}`,
    rating: c.rating ?? '—', issues: c.notes || 'None',
  }));

  const totalEarnings = completedCols.reduce((s, c) => s + (c.earnings ?? 0), 0);
  const totalWeight = (completedCols.reduce((s, c) => s + Number(c.actual_weight ?? c.volume ?? 0), 0) / 1000).toFixed(1) + 't';
  const ratedCols = completedCols.filter(c => c.rating);
  const avgRating = ratedCols.length > 0
    ? (ratedCols.reduce((s, c) => s + (c.rating ?? 0), 0) / ratedCols.length).toFixed(1)
    : '—';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Completed Jobs</h1>
        <button onClick={() => downloadCSV('completed_jobs', ['ID','Date','Route','Weight','Earnings','Rating'],
          tableData.map(r => [r.id, r.date, r.route, r.totalWeight, r.earnings, String(r.rating)]))}
          className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-700/50 dark:bg-gray-900"><Download size={16} /> Export</button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard title="Total Jobs" value={tableData.length} icon={<CheckCircle size={22} />} color="cyan" />
        <StatCard title="Total Weight" value={totalWeight} icon={<Package size={22} />} color="blue" />
        <StatCard title="Avg Rating" value={avgRating} icon={<Star size={22} />} color="yellow" />
        <StatCard title="Total Earned" value={`RWF ${(totalEarnings / 1000).toFixed(0)}K`} icon={<DollarSign size={22} />} color="purple" />
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-4">
        <DataTable
          columns={[
            { key: 'id', label: 'Job', render: (v: string) => <span className="font-mono text-sm">{v}</span> },
            { key: 'date', label: 'Date' },
            { key: 'route', label: 'Route' },
            { key: 'stops', label: 'Stops' },
            { key: 'totalWeight', label: 'Weight' },
            { key: 'duration', label: 'Duration' },
            { key: 'earnings', label: 'Earnings', render: (v: string) => <span className="font-semibold text-green-600 dark:text-green-400">{v}</span> },
            { key: 'rating', label: 'Rating', render: (v: number) => <span className="text-yellow-700 dark:text-yellow-700 font-semibold flex items-center gap-1"><Star size={12} className="fill-yellow-500"/> {v}</span> },
            { key: 'issues', label: 'Issues', render: (v: string) => !v || v === 'None' ? <span className="text-green-600 dark:text-green-400 text-xs flex items-center gap-0.5"><CheckCircle size={11}/> Clean</span> : <span className="text-yellow-700 dark:text-yellow-700 text-xs">{v}</span> },
          ]}
          data={tableData}
          pageSize={6}
        />
      </div>
    </div>
  );
}
