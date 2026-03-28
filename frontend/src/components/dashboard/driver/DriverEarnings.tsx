import { useState, useEffect, useCallback } from 'react';
import { downloadPDF } from '../../../utils/dataStore';
import { collectionsAPI as colAPI, transactionsAPI } from '../../../services/api';
import type { ChartData } from '../ChartComponent';
import { DollarSign, TrendingUp, Calendar, Clock, Download, Wallet } from 'lucide-react';
import StatCard from '../StatCard';
import Widget from '../Widget';
import ChartComponent from '../ChartComponent';

const StatusBadge = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    completed: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200', pending: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
  };
  return <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}>{status.replace(/_/g, ' ')}</span>;
};

export default function DriverEarnings() {
  const [collections, setCollections] = useState<any[]>([]);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawing, setWithdrawing] = useState(false);
  const [withdrawMsg, setWithdrawMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [showWithdrawForm, setShowWithdrawForm] = useState(false);

  // Use driver_fee for driver earnings (earnings = hotel net amount, not driver fee)
  const fee = (c: any): number => c.driver_fee || c.earnings || 0;

  const load = useCallback(() =>
    colAPI.list().then(data => setCollections(Array.isArray(data) ? data : [])).catch(() => {}), []);
  useEffect(() => { load(); }, [load]);

  const completed = collections.filter((c: any) =>
    ['completed', 'verified', 'collected'].includes(c.status));

  const totalEarned = completed.reduce((s: number, c: any) => s + fee(c), 0);
  const currentMonth = new Date().toISOString().slice(0, 7);
  const monthlyEarned = completed
    .filter((c: any) => c.scheduled_date?.startsWith(currentMonth) || c.completed_at?.startsWith(currentMonth))
    .reduce((s: number, c: any) => s + fee(c), 0);

  // Build weekly bar chart (last 7 days)
  const earningsData: ChartData = (() => {
    const days: Record<string, number> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      days[d.toISOString().split('T')[0]] = 0;
    }
    completed.forEach((c: any) => {
      const day = (c.completed_at || c.scheduled_date || '').split('T')[0];
      if (days[day] !== undefined) days[day] += fee(c);
    });
    const labels = Object.keys(days).map(d => new Date(d).toLocaleDateString('en-GB', { weekday: 'short' }));
    return { labels, datasets: [{ label: 'Earnings (RWF)', data: Object.values(days), backgroundColor: '#0891b2' }] };
  })();

  // Build monthly trend chart (last 6 months)
  const monthlyEarnings: ChartData = (() => {
    const months: Record<string, number> = {};
    for (let i = 5; i >= 0; i--) {
      const d = new Date(); d.setMonth(d.getMonth() - i);
      months[d.toISOString().slice(0, 7)] = 0;
    }
    completed.forEach((c: any) => {
      const m = (c.completed_at || c.scheduled_date || '').slice(0, 7);
      if (months[m] !== undefined) months[m] += fee(c);
    });
    const labels = Object.keys(months).map(m => new Date(m + '-01').toLocaleString('default', { month: 'short', year: '2-digit' }));
    return { labels, datasets: [{ label: 'Monthly Earnings (RWF)', data: Object.values(months), borderColor: '#8b5cf6', backgroundColor: 'rgba(139,92,246,0.15)', fill: true }] };
  })();

  const payouts = completed.slice(0, 10).map((c: any) => ({
    date: c.completed_at?.split('T')[0] ?? c.scheduled_date ?? '',
    amount: `RWF ${fee(c).toLocaleString()}`,
    route: `Collection #${c.id}`,
    wasteType: c.waste_type ?? '',
    method: 'Mobile Money',
    status: 'completed',
  }));

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(withdrawAmount.replace(/,/g, ''));
    if (!amount || amount <= 0) return;
    setWithdrawing(true);
    try {
      await transactionsAPI.requestWithdrawal(amount);
      setWithdrawMsg({ text: `Withdrawal of RWF ${amount.toLocaleString()} requested successfully.`, ok: true });
      setWithdrawAmount('');
      setShowWithdrawForm(false);
    } catch (err: any) {
      setWithdrawMsg({ text: err?.message || 'Withdrawal request failed.', ok: false });
    } finally {
      setWithdrawing(false);
      setTimeout(() => setWithdrawMsg(null), 6000);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Earnings</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowWithdrawForm(v => !v)}
            className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-lg text-sm font-medium hover:bg-cyan-700 transition-colors"
          >
            <Wallet size={16} /> Withdraw
          </button>
          <button onClick={() => {
            const tableRows = payouts.map(p => `<tr><td>${p.date}</td><td>${p.route}</td><td>${p.wasteType}</td><td>${p.amount}</td><td>${p.method}</td></tr>`).join('');
            downloadPDF('Earnings Statement', `
              <div class="stat-grid">
                <div class="stat-card"><div class="stat-value">RWF ${(totalEarned / 1000).toFixed(0)}K</div><div class="stat-label">Total Earnings</div></div>
                <div class="stat-card"><div class="stat-value">RWF ${(monthlyEarned / 1000).toFixed(0)}K</div><div class="stat-label">This Month</div></div>
              </div>
              <h2>Recent Payouts</h2>
              <table><thead><tr><th>Date</th><th>Collection</th><th>Waste Type</th><th>Amount (RWF)</th><th>Method</th></tr></thead>
              <tbody>${tableRows}</tbody></table>
            `);
          }} className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-700/50">
            <Download size={16} /> Statement
          </button>
        </div>
      </div>

      {/* Withdraw form */}
      {showWithdrawForm && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-cyan-200 dark:border-cyan-800 p-5 shadow-sm">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-3">Request Withdrawal</h2>
          <form onSubmit={handleWithdraw} className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Amount (RWF)</label>
              <input
                type="number"
                min="1"
                step="1"
                required
                value={withdrawAmount}
                onChange={e => setWithdrawAmount(e.target.value)}
                placeholder={`Available: RWF ${totalEarned.toLocaleString()}`}
                className="w-full px-3.5 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-cyan-400 outline-none bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              />
            </div>
            <button
              type="submit"
              disabled={withdrawing}
              className="self-end px-6 py-2 bg-cyan-600 text-white rounded-lg text-sm font-medium hover:bg-cyan-700 disabled:opacity-50 transition-colors"
            >
              {withdrawing ? 'Requesting…' : 'Request'}
            </button>
          </form>
        </div>
      )}

      {/* Withdraw feedback */}
      {withdrawMsg && (
        <div className={`px-4 py-3 rounded-lg border text-sm ${withdrawMsg.ok ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300' : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300'}`}>
          {withdrawMsg.text}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard title="Total Earnings" value={`RWF ${(totalEarned / 1000).toFixed(0)}K`} icon={<DollarSign size={22} />} color="cyan" />
        <StatCard title="This Month" value={`RWF ${(monthlyEarned / 1000).toFixed(0)}K`} icon={<TrendingUp size={22} />} color="blue" />
        <StatCard title="Completed Jobs" value={completed.length} icon={<Calendar size={22} />} color="purple" />
        <StatCard title="Avg per Job" value={completed.length > 0 ? `RWF ${Math.round(totalEarned / completed.length).toLocaleString()}` : 'RWF 0'} icon={<Clock size={22} />} color="orange" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Widget title="Weekly Earnings" icon={<TrendingUp size={20} className="text-cyan-600" />}><ChartComponent type="bar" data={earningsData} height={260} /></Widget>
        <Widget title="Monthly Trend" icon={<TrendingUp size={20} className="text-purple-600 dark:text-purple-400" />}><ChartComponent type="area" data={monthlyEarnings} height={260} /></Widget>
      </div>
      <Widget title="Recent Payouts" icon={<DollarSign size={20} className="text-green-600 dark:text-green-400" />}>
        {payouts.length === 0 ? (
          <p className="text-center text-gray-400 dark:text-gray-500 py-8 text-sm">No completed jobs yet</p>
        ) : (
          <div className="space-y-3">
            {payouts.map((payout, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{payout.route}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{payout.date}{payout.wasteType ? ` · ${payout.wasteType}` : ''} · {payout.method}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-green-600 dark:text-green-400">{payout.amount}</p>
                  <StatusBadge status={payout.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </Widget>
    </div>
  );
}
