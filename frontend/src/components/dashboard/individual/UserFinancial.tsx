import { useState, useEffect } from 'react';
import { transactionsAPI, type Transaction } from '../../../services/api';
import { DollarSign, Star, TrendingUp } from 'lucide-react';
import StatCard from '../StatCard';
import Widget from '../Widget';
import DataTable from '../DataTable';
import ChartComponent from '../ChartComponent';
import { StatusBadge } from './_shared';

export default function UserFinancial() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    transactionsAPI.mine({ limit: 200 }).then(setTransactions).catch(() => {});
  }, []);

  const totalSpent = transactions.filter(t => t.status === 'completed').reduce((s, t) => s + t.amount, 0);
  const ecoPoints = transactions.length * 10;
  const pointsValue = ecoPoints * 10;
  const savingsFromEco = Math.round(totalSpent * 0.05); // 5% discount on spending

  const spendingHistory = transactions.map(t => ({
    id: t.id,
    date: t.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
    items: `${t.waste_type || 'Waste'} from ${t.from_user || 'seller'}`,
    amount: `RWF ${(t.amount ?? 0).toLocaleString()}`,
    status: t.status || 'pending',
    _status: t.status
  }));

  const spendingByMonth: Record<string, number> = {};
  transactions.forEach(t => {
    const month = t.created_at?.slice(0, 7) || new Date().toISOString().slice(0, 7);
    spendingByMonth[month] = (spendingByMonth[month] || 0) + (t.amount ?? 0);
  });

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const currentMonth = new Date().getMonth();
  const spendingTrend = {
    labels: months.slice(0, currentMonth + 1),
    datasets: [{
      data: months.slice(0, currentMonth + 1).map((_, i) => {
        const dateStr = new Date();
        dateStr.setMonth(i);
        const key = dateStr.toISOString().slice(0, 7);
        return spendingByMonth[key] || 0;
      }),
      backgroundColor: '#0891b2'
    }]
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Financial Overview</h1>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Total Spent" value={`RWF ${(totalSpent / 1000).toFixed(0)}K`} icon={<DollarSign size={22} />} color="cyan" />
        <StatCard title="Eco Points Value" value={`RWF ${(pointsValue / 1000).toFixed(0)}K`} icon={<Star size={22} />} color="purple" subtitle={`${ecoPoints} points × RWF 10`} />
        <StatCard title="Savings from Eco" value={`RWF ${(savingsFromEco / 1000).toFixed(0)}K`} icon={<TrendingUp size={22} />} color="blue" subtitle="Discounts earned" />
      </div>
      <Widget title="Monthly Spending" icon={<TrendingUp size={20} className="text-cyan-600" />}>
        <ChartComponent type="bar" data={spendingTrend} height={280} />
      </Widget>
      <Widget title="Transaction History" icon={<DollarSign size={20} className="text-green-600 dark:text-green-400" />}>
        <DataTable
          columns={[
            { key: 'id', label: 'ID', render: (v: string) => <span className="font-mono text-xs text-cyan-600">{v}</span> },
            { key: 'date', label: 'Date' },
            { key: 'items', label: 'Item' },
            { key: 'amount', label: 'Amount', render: (v: string) => <span className="font-semibold text-green-600">{v}</span> },
            { key: '_status', label: 'Status', render: (v: string) => <StatusBadge status={v} /> },
          ]}
          data={spendingHistory}
          pageSize={6}
        />
        {spendingHistory.length === 0 && <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-8">No transactions yet.</p>}
      </Widget>
    </div>
  );
}
