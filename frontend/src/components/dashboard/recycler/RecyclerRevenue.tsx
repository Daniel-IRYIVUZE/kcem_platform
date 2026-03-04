import { useState, useEffect, useCallback } from 'react';
import { getAll, downloadCSV } from '../../../utils/dataStore';
import type { Transaction } from '../../../utils/dataStore';
import { DollarSign, TrendingUp, BarChart3, Clock, Download } from 'lucide-react';
import StatCard from '../StatCard';
import Widget from '../Widget';
import DataTable from '../DataTable';
import ChartComponent from '../ChartComponent';
import { revenueTrend, StatusBadge } from './_shared';

export default function RecyclerRevenue() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const load = useCallback(() => setTransactions(getAll<Transaction>('transactions')), []);
  useEffect(() => { load(); window.addEventListener('ecotrade_data_change', load); return () => window.removeEventListener('ecotrade_data_change', load); }, [load]);

  const totalRevenue = transactions.reduce((s, t) => s + t.amount, 0);
  const totalFees = transactions.reduce((s, t) => s + t.fee, 0);
  const net = totalRevenue - totalFees;
  const pending = transactions.filter(t => t.status === 'pending').reduce((s, t) => s + t.amount, 0);

  const byType = ['UCO', 'Glass', 'Paper/Cardboard', 'Mixed'].map(type => ({
    type, total: transactions.filter(t => t.wasteType === type).reduce((s, t) => s + t.amount, 0)
  }));
  const revenueByType = { labels: byType.map(b => b.type), datasets: [{ data: byType.map(b => b.total || 0), backgroundColor: '#0891b2' }] };

  const handleExport = () => downloadCSV('revenue_report',
    ['ID', 'Date', 'From', 'To', 'Type', 'Volume', 'Amount', 'Fee', 'Net', 'Status'],
    transactions.map(t => [t.id, new Date(t.date).toLocaleDateString(), t.from, t.to, t.wasteType, String(t.volume), String(t.amount), String(t.fee), String(t.amount - t.fee), t.status]));

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
        <Widget title="Revenue by Waste Type" icon={<BarChart3 size={20} className="text-purple-600 dark:text-purple-400" />}><ChartComponent type="bar" data={revenueByType} height={280} /></Widget>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-4">
        <h3 className="font-semibold mb-4">Transaction History</h3>
        <DataTable
          columns={[
            { key: 'id', label: 'ID', render: (v: string) => <span className="font-mono text-sm">{v}</span> },
            { key: 'date', label: 'Date', render: (v: string) => new Date(v).toLocaleDateString() },
            { key: 'from', label: 'Hotel' }, { key: 'wasteType', label: 'Type' },
            { key: 'amount', label: 'Amount', render: (v: number) => <span className="font-semibold">RWF {v.toLocaleString()}</span> },
            { key: 'fee', label: 'Fee', render: (v: number) => <span className="text-yellow-700">RWF {v.toLocaleString()}</span> },
            { key: 'status', label: 'Status', render: (v: string) => <StatusBadge status={v} /> },
          ]}
          data={transactions}
          pageSize={5}
        />
        {transactions.length === 0 && <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-8">No transactions yet.</p>}
      </div>
    </div>
  );
}
