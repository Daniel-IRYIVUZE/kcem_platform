import { useState, useEffect } from 'react';
import { TrendingUp, BarChart3, Package, Trophy, Activity, Star, Download, Award } from 'lucide-react';
import StatCard from '../StatCard';
import Widget from '../Widget';
import ChartComponent from '../ChartComponent';
import { recyclersAPI } from '../../../services/api';
import type { RecyclerProfile } from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';

const impactTrend = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
  datasets: [{ data: [1200, 1800, 2400, 3100, 3900, 4600, 5200], borderColor: '#059669', backgroundColor: '#059669' }],
};

export default function RecyclerGreenImpact() {
  const { user: authUser } = useAuth();
  const [profile, setProfile] = useState<RecyclerProfile | null>(null);

  useEffect(() => {
    recyclersAPI.me().then(setProfile).catch(() => {});
  }, []);

  const greenScore = profile?.green_score ?? 0;
  const totalCollected = profile ? (profile.active_bids || 0) * 300 : 0; // rough estimate
  const displayName = profile?.company_name || authUser?.name || 'Your Company';

  const handleDownloadCertificate = () => {
    const today = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    const certText = [
      '══════════════════════════════════════════════════════',
      '        ECOTRADE RWANDA — GREEN RECYCLER CERTIFICATE',
      '══════════════════════════════════════════════════════',
      '',
      'This certifies that',
      '',
      `  ${displayName}`,
      '',
      `has achieved a GREEN SCORE OF ${greenScore}/100`,
      'demonstrating exemplary environmental performance and',
      'commitment to sustainable waste recycling.',
      '',
      `  Issued on: ${today}`,
      '  Platform : EcoTrade Rwanda',
      '',
      '══════════════════════════════════════════════════════',
    ].join('\n');
    const blob = new Blob([certText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `EcoTrade_GreenCertificate_${displayName.replace(/\s+/g, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Green Impact</h1>

      {greenScore >= 100 && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-5 text-white shadow-lg">
          <div className="flex items-center gap-3">
            <Award size={32} className="flex-shrink-0" />
            <div>
              <p className="font-bold text-lg">🎉 Perfect Green Score Achieved!</p>
              <p className="text-green-100 text-sm">{displayName} has reached 100/100 — download your certification.</p>
            </div>
          </div>
          <button
            onClick={handleDownloadCertificate}
            className="flex items-center gap-2 px-5 py-2.5 bg-white text-green-700 rounded-lg font-semibold text-sm hover:bg-green-50 transition-colors flex-shrink-0"
          >
            <Download size={16} /> Download Certificate
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard
          title="Green Score"
          value={greenScore}
          icon={<Trophy size={22} />}
          color="cyan"
          progress={Math.min(greenScore, 100)}
        />
        <StatCard title="Waste Recycled" value={`${(totalCollected / 1000).toFixed(1)}t`} icon={<Package size={22} />} color="blue" change="+25%" />
        <StatCard title="CO₂ Saved" value="16.2Kg" icon={<Activity size={22} />} color="purple" change="+22%" />
        <StatCard title="Trees Equivalent" value="385" icon={<Star size={22} />} color="orange" />
      </div>
      <Widget title="Environmental Impact Over Time (kg CO₂ saved)" icon={<TrendingUp size={20} className="text-green-600 dark:text-green-400" />}>
        <ChartComponent type="line" data={impactTrend} height={280} />
      </Widget>
      <Widget title="Impact Breakdown" icon={<BarChart3 size={20} className="text-cyan-600" />}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'UCO → Biodiesel',   amount: '4,500 L',  impact: '8,100 kg CO₂', color: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400' },
            { label: 'Glass Recycled',    amount: '3,200 kg', impact: '3,840 kg CO₂', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' },
            { label: 'Paper/Cardboard',   amount: '2,100 kg', impact: '2,520 kg CO₂', color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' },
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
