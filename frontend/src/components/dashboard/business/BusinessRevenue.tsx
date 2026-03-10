// components/dashboard/business/BusinessRevenue.tsx
import { useState, useEffect } from 'react';
import { transactionsAPI, type Transaction } from '../../../services/api';
import { DollarSign, TrendingUp, BarChart3, Clock } from 'lucide-react';
import StatCard from '../StatCard';
import Widget from '../Widget';
import ChartComponent from '../ChartComponent';
import type { ChartData } from '../ChartComponent';

export default function BusinessRevenue() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    transactionsAPI.mine({ limit: 200 } as Parameters<typeof transactionsAPI.mine>[0])
      .then(data => setTransactions(Array.isArray(data) ? data : []))
      .catch(() => setTransactions([]))
      .finally(() => setLoading(false));
  }, []);

  const completed      = transactions.filter(t => t.status === 'completed');
  const totalRevenue   = completed.reduce((s, t) => s + (t.gross_amount || 0), 0);
  const currentMonth   = new Date().toISOString().slice(0, 7);
  const thisMonth      = completed.filter(t => t.created_at?.startsWith(currentMonth)).reduce((s, t) => s + (t.gross_amount || 0), 0);
  const avgPerListing  = completed.length > 0 ? Math.round(totalRevenue / completed.length) : 0;
  const pendingPayouts = transactions.filter(t => t.status === 'pending').reduce((s, t) => s + (t.gross_amount || 0), 0);

  // Monthly Revenue trend — last 6 months
  const revenueTrend: ChartData = (() => {
    const months: Record<string, number> = {};
    for (let i = 5; i >= 0; i--) {
      const d = new Date(); d.setMonth(d.getMonth() - i);
      months[d.toISOString().slice(0, 7)] = 0;
    }
    completed.forEach(t => {
      const m = t.created_at?.slice(0, 7);
      if (m && months[m] !== undefined) months[m] += t.gross_amount || 0;
    });
    const labels = Object.keys(months).map(m => new Date(m + '-01').toLocaleString('default', { month: 'short', year: '2-digit' }));
    return {
      labels,
      datasets: [{ label: 'Revenue (RWF)', data: Object.values(months), borderColor: '#0891b2', backgroundColor: 'rgba(8,145,178,0.15)', fill: true }],
    };
  })();

  const wasteTypeRevenue: Record<string, number> = {};
  transactions.forEach(t => {
    wasteTypeRevenue[t.waste_type || 'Other'] = (wasteTypeRevenue[t.waste_type || 'Other'] || 0) + (t.gross_amount || 0);
  });

  const revenueByType: ChartData = {
    labels: Object.keys(wasteTypeRevenue).length > 0 ? Object.keys(wasteTypeRevenue) : ['No data'],
    datasets: [{
      data: Object.keys(wasteTypeRevenue).length > 0 ? Object.values(wasteTypeRevenue) : [0],
      backgroundColor: '#0891b2',
    }],
  };

  return (
    <div className="space-y-6">
      {loading ? <div className="text-center py-12 text-gray-400 dark:text-gray-500">Loading revenue data…</div> : null}
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Revenue</h1>
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard title="Total Revenue" value={`RWF ${(totalRevenue / 1000).toFixed(0)}K`} icon={<DollarSign size={22} />} color="cyan" change={totalRevenue > 0 ? '+18%' : '0%'} />
        <StatCard title="This Month" value={`RWF ${(thisMonth / 1000).toFixed(0)}K`} icon={<TrendingUp size={22} />} color="blue" change={thisMonth > 0 ? '+12%' : '0%'} />
        <StatCard title="Avg per Listing" value={`RWF ${(avgPerListing / 1000).toFixed(0)}K`} icon={<BarChart3 size={22} />} color="purple" />
        <StatCard title="Pending Payouts" value={`RWF ${(pendingPayouts / 1000).toFixed(0)}K`} icon={<Clock size={22} />} color="yellow" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Widget title="Monthly Revenue" icon={<TrendingUp size={20} className="text-cyan-600" />}><ChartComponent type="area" data={revenueTrend} height={280} /></Widget>
        <Widget title="Revenue by Waste Type" icon={<BarChart3 size={20} className="text-purple-600 dark:text-purple-400" />}><ChartComponent type="bar" data={revenueByType} height={280} /></Widget>
      </div>
    </div>
  );
}

