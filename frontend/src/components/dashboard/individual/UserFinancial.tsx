import { DollarSign, Star, TrendingUp } from 'lucide-react';
import StatCard from '../StatCard';
import Widget from '../Widget';
import DataTable from '../DataTable';
import ChartComponent from '../ChartComponent';
import { userOrders, userProfile, spendingTrend, StatusBadge } from './_shared';

export default function UserFinancial() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Financial Overview</h1>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Total Spent" value={`RWF ${(userProfile.totalSpent / 1000).toFixed(0)}K`} icon={<DollarSign size={22} />} color="cyan" />
        <StatCard title="Eco Points Value" value="RWF 3,010" icon={<Star size={22} />} color="purple" subtitle="301 points × RWF 10" />
        <StatCard title="Savings from Eco" value="RWF 15,500" icon={<TrendingUp size={22} />} color="blue" subtitle="Discounts earned" />
      </div>
      <Widget title="Monthly Spending" icon={<TrendingUp size={20} className="text-cyan-600" />}>
        <ChartComponent type="bar" data={spendingTrend} height={280} />
      </Widget>
      <Widget title="Transaction History" icon={<DollarSign size={20} className="text-green-600 dark:text-green-400" />}>
        <DataTable
          columns={[
            { key: 'id', label: 'Order' },
            { key: 'date', label: 'Date' },
            { key: 'items', label: 'Item' },
            { key: 'amount', label: 'Amount', render: (v: string) => <span className="font-semibold">{v}</span> },
            { key: 'status', label: 'Status', render: (v: string) => <StatusBadge status={v} /> },
          ]}
          data={userOrders}
          pageSize={6}
        />
      </Widget>
    </div>
  );
}
