import { useState, useEffect, useCallback } from 'react';
import { downloadPDF } from '../../../utils/dataStore';
import { collectionsAPI as colAPI } from '../../../services/api';
import { DollarSign, TrendingUp, Calendar, Clock, Download } from 'lucide-react';
import StatCard from '../StatCard';
import Widget from '../Widget';
import ChartComponent from '../ChartComponent';
import { driverProfile, earningsData, monthlyEarnings } from './_shared';

const StatusBadge = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    completed: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200', pending: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
  };
  return <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}>{status.replace(/_/g, ' ')}</span>;
};

export default function DriverEarnings() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const load = useCallback(() => colAPI.list({ status: 'completed' }).then(setTransactions).catch(() => {}), []);
  useEffect(() => { load(); }, [load]);

  const totalEarned = transactions.reduce((s: number, c: any) => s + (c.earnings || 0), 0) || driverProfile.totalEarnings;
  const monthlyEarned = transactions.filter((c: any) => c.scheduled_date?.startsWith(new Date().toISOString().slice(0, 7))).reduce((s: number, c: any) => s + (c.earnings || 0), 0) || driverProfile.monthlyEarnings;

  const payouts = transactions.slice(0, 5).map((c: any) => ({
    date: c.completed_at?.split('T')[0] ?? c.scheduled_date ?? '', amount: `RWF ${(c.earnings || 0).toLocaleString()}`, route: `#${c.id}`, method: 'Mobile Money', status: 'completed',
  }));
  const payoutData = payouts.length > 0 ? payouts : [
    { date: '2026-02-19', amount: 'RWF 13,000', route: 'DR-001', method: 'Mobile Money', status: 'completed' },
    { date: '2026-02-23', amount: 'RWF 9,000', route: 'DR-002', method: 'Mobile Money', status: 'completed' },
    { date: '2026-02-24', amount: 'RWF 15,000', route: 'DR-003', method: 'Mobile Money', status: 'completed' },
    { date: '2026-02-25', amount: 'RWF 5,000', route: 'DR-004', method: 'Mobile Money', status: 'completed' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Earnings</h1>
        <button onClick={() => {
          const tableRows = payoutData.map(p => `<tr><td>${p.date}</td><td>${p.route}</td><td>${p.amount}</td><td>${p.method}</td><td>${p.status}</td></tr>`).join('');
          downloadPDF('Earnings Statement — Jean Pierre Habimana', `
            <div class="stat-grid">
              <div class="stat-card"><div class="stat-value">RWF ${(totalEarned/1000000).toFixed(1)}M</div><div class="stat-label">Total Earnings</div></div>
              <div class="stat-card"><div class="stat-value">RWF ${(monthlyEarned/1000).toFixed(0)}K</div><div class="stat-label">This Month</div></div>
              <div class="stat-card"><div class="stat-value">RWF 62K</div><div class="stat-label">This Week</div></div>
              <div class="stat-card"><div class="stat-value">RWF 12K</div><div class="stat-label">Today</div></div>
            </div>
            <h2>Recent Payouts</h2>
            <table><thead><tr><th>Date</th><th>Route</th><th>Amount (RWF)</th><th>Method</th><th>Status</th></tr></thead>
            <tbody>${tableRows}</tbody></table>
          `);
        }} className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-700/50 dark:bg-gray-900"><Download size={16} /> Download Statement</button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard title="Total Earnings" value={`RWF ${(totalEarned / 1000000).toFixed(1)}M`} icon={<DollarSign size={22} />} color="cyan" change="+8%" />
        <StatCard title="This Month" value={`RWF ${(monthlyEarned / 1000).toFixed(0)}K`} icon={<TrendingUp size={22} />} color="blue" change="+12%" />
        <StatCard title="This Week" value="RWF 62K" icon={<Calendar size={22} />} color="purple" />
        <StatCard title="Today" value="RWF 12K" icon={<Clock size={22} />} color="orange" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Widget title="Weekly Earnings" icon={<TrendingUp size={20} className="text-cyan-600" />}><ChartComponent type="bar" data={earningsData} height={260} /></Widget>
        <Widget title="Monthly Trend" icon={<TrendingUp size={20} className="text-purple-600 dark:text-purple-400" />}><ChartComponent type="line" data={monthlyEarnings} height={260} /></Widget>
      </div>
      <Widget title="Recent Payouts" icon={<DollarSign size={20} className="text-green-600 dark:text-green-400" />}>
        <div className="space-y-3">
          {payoutData.map((payout, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <div><p className="text-sm font-medium">{payout.date} · {payout.route}</p><p className="text-xs text-gray-500 dark:text-gray-400">{payout.method}</p></div>
              <div className="text-right"><p className="font-semibold text-green-600 dark:text-green-400">{payout.amount}</p><StatusBadge status={payout.status} /></div>
            </div>
          ))}
        </div>
      </Widget>
    </div>
  );
}
