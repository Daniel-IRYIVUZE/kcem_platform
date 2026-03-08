import { useState, useEffect } from 'react';
import { transactionsAPI, type Transaction } from '../../../services/api';
import { DollarSign, TrendingUp, BarChart3, Clock, Download } from 'lucide-react';
import StatCard from '../StatCard';
import Widget from '../Widget';
import DataTable from '../DataTable';
import ChartComponent from '../ChartComponent';
import { StatusBadge } from './_shared';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function exportCSV(name: string, cols: string[], rows: (string|number)[][]) {
  const csv = [cols.join(','), ...rows.map(r => r.join(','))].join('\n');
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv])); a.download = `${name}.csv`; a.click();
}

export default function RecyclerRevenue() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    transactionsAPI.mine({ limit: 200 } as Parameters<typeof transactionsAPI.mine>[0])
      .then(data => setTransactions(Array.isArray(data) ? data : []))
      .catch(() => setTransactions([]))
      .finally(() => setLoading(false));
  }, []);

  const totalRevenue = transactions.reduce((s, t) => s + (t.amount || 0), 0);
  const totalFees    = transactions.reduce((s, t) => s + (t.fee    || 0), 0);
  const net          = totalRevenue - totalFees;
  const pending      = transactions.filter(t => t.status === 'pending').reduce((s, t) => s + (t.amount || 0), 0);

  const monthlyRevenue = Array(12).fill(0);
  transactions.forEach(t => { if (t.created_at) monthlyRevenue[new Date(t.created_at).getMonth()] += t.amount || 0; });
  const revenueTrend = { labels: MONTHS, datasets: [{ label: 'Revenue (RWF)', data: monthlyRevenue, borderColor: '#0891b2', backgroundColor: 'rgba(8,145,178,0.1)', fill: true }] };

  const typeMap: Record<string,number> = {};
  transactions.forEach(t => { typeMap[t.waste_type || 'Other'] = (typeMap[t.waste_type || 'Other'] || 0) + (t.amount || 0); });
  const revenueByType = { labels: Object.keys(typeMap), datasets: [{ label: 'Revenue', data: Object.values(typeMap), backgroundColor: '#0891b2' }] };

  const handleExport = () => exportCSV('revenue_report',
    ['ID','Date','Hotel','Type','Volume','Amount','Fee','Net','Status'],
    transactions.map(t => [t.id, t.created_at ? new Date(t.created_at).toLocaleDateString() : '', t.from_user || '', t.waste_type || '', t.volume || 0, t.amount || 0, t.fee || 0, (t.amount||0)-(t.fee||0), t.status]));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Revenue & Payouts</h1>
        <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-700/50 dark:bg-gray-900"><Download size={16} /> Export CSV</button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard title="Total Revenue" value={`RWF ${(totalRevenue / 1000).toFixed(0)}K`} icon={<DollarSign size={22} />} color="cyan" />
        <StatCard title="Platform Fees" value={`RWF ${(totalFees / 1000).toFixed(0)}K`} icon={<TrendingUp size={22} />} color="orange" />
        <StatCard title="Net Revenue" value={`RWF ${(net / 1000).toFixed(0)}K`} icon={<BarChart3 size={22} />} color="blue" />
        <StatCard title="Pending" value={`RWF ${(pending / 1000).toFixed(0)}K`} icon={<Clock size={22} />} color="yellow" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Widget title="Monthly Revenue Trend" icon={<TrendingUp size={20} className="text-cyan-600" />}><ChartComponent type="line" data={revenueTrend} height={280} /></Widget>
        <Widget title="Revenue by Waste Type" icon={<BarChart3 size={20} className="text-purple-600 dark:text-purple-400" />}>
          {Object.keys(typeMap).length > 0
            ? <ChartComponent type="bar" data={revenueByType} height={280} />
            : <div className="h-64 flex items-center justify-center text-gray-400 text-sm">No data yet</div>}
        </Widget>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-4">
        <h3 className="font-semibold mb-4">Transaction History</h3>
        {loading ? (
          <div className="text-center py-12 text-gray-400 dark:text-gray-500">Loading transactions…</div>
        ) : (
          <DataTable
            columns={[
              { key: 'id',        label: 'ID',     render: (v: number)  => <span className="font-mono text-sm">#{v}</span> },
              { key: 'created_at',label: 'Date',   render: (v: string)  => v ? new Date(v).toLocaleDateString() : '—' },
              { key: 'from_user', label: 'Hotel' },
              { key: 'waste_type',label: 'Type' },
              { key: 'volume',    label: 'Volume', render: (v: number)  => `${v ?? 0} kg` },
              { key: 'amount',    label: 'Amount', render: (v: number)  => <span className="font-semibold">RWF {(v||0).toLocaleString()}</span> },
              { key: 'fee',       label: 'Fee',    render: (v: number)  => <span className="text-yellow-600">RWF {(v||0).toLocaleString()}</span> },
              { key: 'status',    label: 'Status', render: (v: string)  => <StatusBadge status={v} /> },
            ]}
            data={transactions}
            pageSize={8}
          />
        )}
        {!loading && transactions.length === 0 && <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-8">No transactions yet.</p>}
      </div>
    </div>
  );
}
