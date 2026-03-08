// components/dashboard/business/BusinessTransactions.tsx
import { useState, useEffect } from 'react';
import { transactionsAPI, type Transaction } from '../../../services/api';
import { DollarSign, TrendingUp, BarChart3, Download } from 'lucide-react';
import StatCard from '../StatCard';
import DataTable from '../DataTable';
import { StatusBadge } from './_shared';

function downloadCSV(name: string, cols: string[], rows: (string | number)[][]) {
  const csv = [cols.join(','), ...rows.map(r => r.join(','))].join('\n');
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv])); a.download = `${name}.csv`; a.click();
}

export default function BusinessTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    transactionsAPI.mine({ limit: 200 } as Parameters<typeof transactionsAPI.mine>[0])
      .then(data => setTransactions(data || []))
      .catch(() => setTransactions([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = statusFilter === 'all' ? transactions : transactions.filter(t => t.status === statusFilter);

  const completed = transactions.filter(t => t.status === 'completed');
  const totalEarned = completed.reduce((s, t) => s + (t.amount || 0), 0);
  const totalFees   = completed.reduce((s, t) => s + (t.fee || 0), 0);
  const net = totalEarned - totalFees;

  const displayData = filtered.map(t => ({
    id: t.id,
    date: t.created_at ? new Date(t.created_at).toLocaleDateString() : '—',
    recycler: t.to_user || '—',
    type: t.waste_type || '—',
    amount: t.amount || 0,
    commission: t.fee || 0,
    net: (t.amount || 0) - (t.fee || 0),
    status: t.status,
  }));

  const handleExport = () => downloadCSV('transactions',
    ['ID', 'Date', 'Recycler', 'Type', 'Amount', 'Commission', 'Net', 'Status'],
    displayData.map(r => [r.id, r.date, r.recycler, r.type, r.amount, r.commission, r.net, r.status]));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Transaction History</h1>
        <div className="flex gap-2">
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-3 py-2 border rounded-lg text-sm dark:bg-gray-800 dark:border-gray-700">
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="disputed">Disputed</option>
            <option value="refunded">Refunded</option>
          </select>
          <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-700/50">
            <Download size={16}/> CSV
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Total Earned"   value={`RWF ${(totalEarned/1000).toFixed(0)}K`} icon={<DollarSign size={22}/>}  color="cyan" />
        <StatCard title="Platform Fees"  value={`RWF ${(totalFees/1000).toFixed(0)}K`}   icon={<BarChart3 size={22}/>}   color="orange" />
        <StatCard title="Net Revenue"    value={`RWF ${(net/1000).toFixed(0)}K`}          icon={<TrendingUp size={22}/>}  color="blue" />
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-4">
        {loading ? (
          <div className="text-center py-12 text-gray-400 dark:text-gray-500">Loading transactions…</div>
        ) : (
          <DataTable
            columns={[
              { key: 'id',         label: 'Transaction', render: (v: number) => <span className="font-mono text-sm">#{v}</span> },
              { key: 'date',       label: 'Date' },
              { key: 'recycler',   label: 'Recycler' },
              { key: 'type',       label: 'Waste' },
              { key: 'amount',     label: 'Amount',     render: (v: number) => <span className="font-semibold">RWF {v.toLocaleString()}</span> },
              { key: 'commission', label: 'Commission', render: (v: number) => <span className="text-yellow-600">RWF {v.toLocaleString()}</span> },
              { key: 'net',        label: 'Net',        render: (v: number) => <span className="font-semibold text-green-600 dark:text-green-400">RWF {v.toLocaleString()}</span> },
              { key: 'status',     label: 'Status',     render: (v: string) => <StatusBadge status={v} /> },
            ]}
            data={displayData}
            pageSize={8}
          />
        )}
        {!loading && displayData.length === 0 && (
          <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-8">No transactions found. Transactions are created when collections are completed.</p>
        )}
      </div>
    </div>
  );
}


