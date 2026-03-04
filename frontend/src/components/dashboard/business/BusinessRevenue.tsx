// components/dashboard/business/BusinessRevenue.tsx
import { DollarSign, TrendingUp, BarChart3, Clock } from 'lucide-react';
import StatCard from '../StatCard';
import Widget from '../Widget';
import ChartComponent from '../ChartComponent';
import { revenueTrend } from './_shared';

export default function BusinessRevenue() {
  const revenueByType = { labels: ['UCO', 'Glass', 'Paper/Cardboard', 'Organic Waste'], datasets: [{ data: [1520000, 640000, 450000, 590000], backgroundColor: '#0891b2' }] };
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Revenue</h1>
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard title="Total Revenue" value="RWF 3.2M" icon={<DollarSign size={22} />} color="cyan" change="+18%" />
        <StatCard title="This Month" value="RWF 580K" icon={<TrendingUp size={22} />} color="blue" change="+12%" />
        <StatCard title="Avg per Listing" value="RWF 133K" icon={<BarChart3 size={22} />} color="purple" />
        <StatCard title="Pending Payouts" value="RWF 152K" icon={<Clock size={22} />} color="yellow" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Widget title="Monthly Revenue" icon={<TrendingUp size={20} className="text-cyan-600" />}><ChartComponent type="line" data={revenueTrend} height={280} /></Widget>
        <Widget title="Revenue by Waste Type" icon={<BarChart3 size={20} className="text-purple-600 dark:text-purple-400" />}><ChartComponent type="bar" data={revenueByType} height={280} /></Widget>
      </div>
    </div>
  );
}
