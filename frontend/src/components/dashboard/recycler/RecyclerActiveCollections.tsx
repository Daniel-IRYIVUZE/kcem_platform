import { useState, useEffect, useCallback } from 'react';
import { collectionsAPI, type Collection } from '../../../services/api';
import { Truck, Activity, Clock, CheckCircle, Download } from 'lucide-react';
import StatCard from '../StatCard';
import DataTable from '../DataTable';
import { StatusBadge } from './_shared';

function exportCSV(name: string, cols: string[], rows: (string|number)[][]) {
  const csv = [cols.join(','), ...rows.map(r => r.join(','))].join('\n');
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv])); a.download = `${name}.csv`; a.click();
}

function fmtDate(d: string | null | undefined) {
  if (!d) return '—';
  const parsed = new Date(d);
  if (isNaN(parsed.getTime())) return d;
  return parsed.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function RecyclerActiveCollections() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading]         = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  const load = useCallback(() => {
    collectionsAPI.list({ limit: 200 } as Parameters<typeof collectionsAPI.list>[0])
      .then(data => setCollections(Array.isArray(data) ? data : []))
      .catch(() => setCollections([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
    const t = setInterval(load, 30_000);
    return () => clearInterval(t);
  }, [load]);

  const filtered    = statusFilter === 'all' ? collections : collections.filter(c => c.status === statusFilter);
  const inProgress  = collections.filter(c => c.status === 'en_route' || c.status === 'collected').length;

  const handleExport = () => exportCSV('collections',
    ['ID','Hotel','Recycler','Driver','Type','Volume','Status','Date','Earnings'],
    filtered.map(c => [c.id, c.hotel_name||'N/A', c.recycler_name||'', c.driver_name||'', c.waste_type||'', c.volume||0, c.status, c.scheduled_date||'', c.earnings||0]));

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
        <StatCard title="Total"      value={loading ? '…' : collections.length}                                       icon={<Truck       size={22} />} color="cyan"   />
        <StatCard title="In Progress" value={loading ? '…' : inProgress}                                              icon={<Activity    size={22} />} color="blue"   />
        <StatCard title="Scheduled"   value={loading ? '…' : collections.filter(c => c.status === 'scheduled').length} icon={<Clock       size={22} />} color="purple" />
        <StatCard title="Completed"   value={loading ? '…' : collections.filter(c => c.status === 'completed').length} icon={<CheckCircle size={22} />} color="orange" />
      </div>
      <div className="flex gap-2 flex-wrap">
        {['all', 'scheduled', 'en_route', 'collected', 'verified', 'completed', 'missed'].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)} className={`px-3 py-1 text-sm rounded-full border ${statusFilter === s ? 'bg-cyan-600 text-white border-cyan-600' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 dark:bg-gray-900'}`}>{s === 'all' ? 'All' : s.replace(/_/g, ' ')}</button>
        ))}
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-4">
        {loading ? (
          <div className="text-center py-12 text-gray-400 dark:text-gray-500">Loading collections…</div>
        ) : (
          <DataTable
            columns={[
              { key: 'id',             label: 'ID',       render: (v: number) => <span className="font-mono text-xs">#{v}</span> },
              { key: 'hotel_name',     label: 'Hotel' },
              { key: 'driver_name',    label: 'Driver' },
              { key: 'waste_type',     label: 'Type',     render: (v: string) => <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs font-medium">{v}</span> },
              { key: 'volume',         label: 'Volume',   render: (v: number, r: Collection) => <span>{v ?? 0} {r.waste_type === 'UCO' ? 'L' : 'kg'}</span> },
              { key: 'status',         label: 'Status',   render: (v: string) => <StatusBadge status={v} /> },
              { key: 'scheduled_date', label: 'Date', render: (v: string) => fmtDate(v) },
              { key: 'earnings',       label: 'Earnings', render: (v: number) => <span className="font-semibold text-green-600 dark:text-green-400">RWF {(v||0).toLocaleString()}</span> },
            ]}
            data={filtered}
            pageSize={6}
          />
        )}
        {!loading && filtered.length === 0 && <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-8">No collections found.</p>}
      </div>
    </div>
  );
}
