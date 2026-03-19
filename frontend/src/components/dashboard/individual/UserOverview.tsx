import { useState, useEffect, useCallback } from 'react';
import { listingsAPI, recyclingAPI, transactionsAPI, type WasteListing, type RecyclingEvent, type Transaction } from '../../../services/api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { ShoppingCart, Package, TrendingUp, BarChart3, Recycle, Leaf, Trophy, Layers } from 'lucide-react';
import StatCard from '../StatCard';
import Widget from '../Widget';
import ChartComponent from '../ChartComponent';
import type { ChartData } from '../ChartComponent';

const StatusBadge = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    completed: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200',
    pending: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
    failed: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200',
  };
  return <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}>{status.replace(/_/g, ' ')}</span>;
};

export default function UserOverview() {
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const [liveListings, setLiveListings] = useState<WasteListing[]>([]);
  const [events, setEvents] = useState<RecyclingEvent[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const load = useCallback(() => {
    listingsAPI.list({ status: 'open', limit: 3 }).then(setLiveListings).catch(() => {});
    recyclingAPI.list({ limit: 100 }).then(setEvents).catch(() => {});
    transactionsAPI.mine({ limit: 50 }).then(setTransactions).catch(() => {});
  }, []);
  useEffect(() => { load(); }, [load]);

  const totalRecycled = events.reduce((s, e) => s + e.weight, 0);
  const totalPts = events.reduce((s, e) => s + e.points, 0);
  const greenScore = Math.min(100, Math.round(totalPts / 10));
  const co2Saved = (totalRecycled * 1.3).toFixed(1);

  // Impact trend chart — monthly kg recycled (last 6 months)
  const impactTrend: ChartData = (() => {
    const months: Record<string, number> = {};
    for (let i = 5; i >= 0; i--) {
      const d = new Date(); d.setMonth(d.getMonth() - i);
      months[d.toISOString().slice(0, 7)] = 0;
    }
    events.forEach(e => { const m = e.date?.slice(0, 7); if (m && months[m] !== undefined) months[m] += e.weight; });
    const labels = Object.keys(months).map(m => new Date(m + '-01').toLocaleString('default', { month: 'short' }));
    return { labels, datasets: [{ label: 'kg Recycled', data: Object.values(months), borderColor: '#10b981', backgroundColor: 'rgba(16,185,129,0.15)', fill: true }] };
  })();

  // Waste breakdown pie chart
  const wasteByType: ChartData = (() => {
    const map: Record<string, number> = {};
    events.forEach(e => { map[e.waste_type] = (map[e.waste_type] || 0) + e.weight; });
    const keys = Object.keys(map);
    if (keys.length === 0) return { labels: ['No data'], datasets: [{ data: [1], backgroundColor: '#e5e7eb' }] };
    return { labels: keys, datasets: [{ data: keys.map(k => map[k]) }] };
  })();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome, {authUser?.name || 'User'}!</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Your eco-friendly dashboard</p>
        </div>
        <button onClick={() => navigate('/marketplace')} className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-lg text-sm hover:bg-cyan-700"><ShoppingCart size={16} /> Browse Marketplace</button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Green Score" value={greenScore} icon={<Trophy size={24} />} color="cyan" progress={greenScore} />
        <StatCard title="Total Recycled" value={`${totalRecycled.toFixed(1)} kg`} icon={<Recycle size={24} />} color="blue" />
        <StatCard title="CO₂ Saved" value={`${co2Saved} kg`} icon={<Leaf size={24} />} color="purple" />
        <StatCard title="Transactions" value={transactions.length} icon={<Package size={24} />} color="orange" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Widget title="Recycling Impact" icon={<TrendingUp size={20} className="text-green-600 dark:text-green-400" />}><ChartComponent type="area" data={impactTrend} height={250} /></Widget>
        <Widget title="Waste Breakdown" icon={<BarChart3 size={20} className="text-purple-600 dark:text-purple-400" />}><ChartComponent type="donut" data={wasteByType} height={250} /></Widget>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Widget title="Recent Recycling" icon={<Recycle size={20} className="text-green-600 dark:text-green-400" />} action={<button onClick={() => navigate('impact')} className="text-sm text-cyan-600 hover:underline">View All</button>}>
          {events.length === 0 ? (
            <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-6">No recycling events yet. <button onClick={() => navigate('impact')} className="text-green-600 hover:underline">Log one →</button></p>
          ) : (
            <div className="space-y-3">
              {events.slice(0, 4).map(e => (
                <div key={e.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div><p className="text-sm font-medium">{e.waste_type} — {e.weight} kg</p><p className="text-xs text-gray-500 dark:text-gray-400">{e.date} · {e.location}</p></div>
                  <span className="text-sm font-semibold text-green-600 dark:text-green-400">+{e.points} pts</span>
                </div>
              ))}
            </div>
          )}
        </Widget>
        <Widget title="Recent Transactions" icon={<Package size={20} className="text-cyan-600" />} action={<button onClick={() => navigate('orders')} className="text-sm text-cyan-600 hover:underline">View All</button>}>
          {transactions.length === 0 ? (
            <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-6">No transactions yet</p>
          ) : (
            <div className="space-y-3">
              {transactions.slice(0, 4).map(t => (
                <div key={t.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div><p className="text-sm font-medium">{t.description || 'Waste transaction'}</p><p className="text-xs text-gray-500 dark:text-gray-400">{t.created_at?.split('T')[0]} · {t.recycler_name || t.hotel_name || 'EcoTrade'}</p></div>
                  <div className="text-right"><p className="text-sm font-semibold">RWF {(t.gross_amount || 0).toLocaleString()}</p><StatusBadge status={t.status || 'pending'} /></div>
                </div>
              ))}
            </div>
          )}
        </Widget>
      </div>
      <Widget title="Eco Tips" icon={<Leaf size={20} className="text-green-600 dark:text-green-400" />}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { title: 'Reduce Single-Use Plastics', desc: 'Switch to reusable bags and water bottles.', icon: <Recycle size={24} className="text-green-600 dark:text-green-400"/> },
            { title: 'Compost Organic Waste', desc: 'Start a compost bin for food scraps.', icon: <Leaf size={24} className="text-green-600 dark:text-green-400"/> },
            { title: 'Sort Your Waste', desc: 'Separate recyclables from general waste.', icon: <Layers size={24} className="text-green-600 dark:text-green-400"/> },
          ].map(tip => (
            <div key={tip.title} className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800">
              <span>{tip.icon}</span>
              <h4 className="text-sm font-semibold mt-2 text-green-800 dark:text-green-300">{tip.title}</h4>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{tip.desc}</p>
            </div>
          ))}
        </div>
      </Widget>
      {liveListings.length > 0 && (
        <Widget title="Live Waste Listings" icon={<Recycle size={20} className="text-cyan-600" />} action={<button onClick={() => navigate('/marketplace')} className="text-sm text-cyan-600 hover:underline">View All</button>}>
          <div className="space-y-3">
            {liveListings.map(l => (
              <div key={l.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <div><p className="text-sm font-medium">{l.waste_type} — {l.volume} {l.unit}</p><p className="text-xs text-gray-500 dark:text-gray-400">{l.hotel_name} · Kigali</p></div>
                <div className="text-right"><p className="text-sm font-semibold text-cyan-600">RWF {(l.min_bid ?? 0).toLocaleString()}</p><p className="text-xs text-gray-400 dark:text-gray-500">{l.bid_count || 0} bids</p></div>
              </div>
            ))}
          </div>
        </Widget>
      )}
    </div>
  );
}
