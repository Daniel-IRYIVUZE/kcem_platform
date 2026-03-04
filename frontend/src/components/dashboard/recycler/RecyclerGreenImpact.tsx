import { TrendingUp, BarChart3, Package, Trophy, Activity, Star } from 'lucide-react';
import StatCard from '../StatCard';
import Widget from '../Widget';
import ChartComponent from '../ChartComponent';
import { companyProfile } from './_shared';

const impactTrend = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
  datasets: [{ data: [1200, 1800, 2400, 3100, 3900, 4600, 5200], borderColor: '#059669', backgroundColor: '#059669' }],
};

export default function RecyclerGreenImpact() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Green Impact</h1>
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard title="Green Score" value={companyProfile.greenScore} icon={<Trophy size={22} />} color="cyan" progress={companyProfile.greenScore} />
        <StatCard title="Waste Recycled" value={`${(companyProfile.totalCollected / 1000).toFixed(1)}t`} icon={<Package size={22} />} color="blue" change="+25%" />
        <StatCard title="CO₂ Saved" value="16.2t" icon={<Activity size={22} />} color="purple" change="+22%" />
        <StatCard title="Trees Equivalent" value="385" icon={<Star size={22} />} color="orange" />
      </div>
      <Widget title="Environmental Impact Over Time (kg CO₂ saved)" icon={<TrendingUp size={20} className="text-green-600 dark:text-green-400" />}>
        <ChartComponent type="line" data={impactTrend} height={280} />
      </Widget>
      <Widget title="Impact Breakdown" icon={<BarChart3 size={20} className="text-cyan-600" />}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'UCO → Biodiesel', amount: '4,500 L', impact: '8,100 kg CO₂', color: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400' },
            { label: 'Glass Recycled', amount: '3,200 kg', impact: '3,840 kg CO₂', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' },
            { label: 'Paper/Cardboard', amount: '2,100 kg', impact: '2,520 kg CO₂', color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' },
            { label: 'Organic → Compost', amount: '2,700 kg', impact: '1,890 kg CO₂', color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' },
          ].map(item => (
            <div key={item.label} className={`p-4 rounded-lg ${item.color}`}>
              <p className="text-sm font-medium">{item.label}</p>
              <p className="text-xl font-bold mt-1">{item.amount}</p>
              <p className="text-xs mt-1 opacity-80">{item.impact} saved</p>
            </div>
          ))}
        </div>
      </Widget>
    </div>
  );
}
