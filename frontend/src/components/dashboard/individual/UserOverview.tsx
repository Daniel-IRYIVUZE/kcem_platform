import { useState, useEffect, useCallback } from 'react';
import { listingsAPI, usersAPI, type WasteListing } from '../../../services/api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { ShoppingCart, Package, TrendingUp, BarChart3, Recycle, Leaf, Trophy } from 'lucide-react';
import StatCard from '../StatCard';
import Widget from '../Widget';
import ChartComponent from '../ChartComponent';
import { userProfile, recyclingHistory, userOrders, impactTrend, wasteByType, StatusBadge } from './_shared';

export default function UserOverview() {
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const [liveListings, setLiveListings] = useState<WasteListing[]>([]);
  const totalRecycled = userProfile.totalRecycled;

  const load = useCallback(() => {
    listingsAPI.list({ status: 'open', limit: 3 }).then(setLiveListings).catch(() => {});
    usersAPI.me().catch(() => {});
  }, []);

  useEffect(() => { load(); }, [load]);

  const greenScore = userProfile.greenScore;
  const co2Saved = (totalRecycled * 1.3).toFixed(0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div><h1 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome, {authUser?.name || userProfile.name}!</h1><p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Your eco-friendly dashboard</p></div>
        <button className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-lg text-sm hover:bg-cyan-700"><ShoppingCart size={16} /> Browse Marketplace</button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Green Score" value={greenScore} icon={<Trophy size={24} />} color="cyan" progress={greenScore} />
        <StatCard title="Total Recycled" value={`${totalRecycled} kg`} icon={<Recycle size={24} />} color="blue" change="+12 kg" />
        <StatCard title="CO₂ Saved" value={`${co2Saved} kg`} icon={<Leaf size={24} />} color="purple" change="+18 kg" />
        <StatCard title="Orders" value={userProfile.ordersCompleted} icon={<Package size={24} />} color="orange" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Widget title="Recycling Impact" icon={<TrendingUp size={20} className="text-green-600 dark:text-green-400" />}><ChartComponent type="line" data={impactTrend} height={250} /></Widget>
        <Widget title="Waste Breakdown" icon={<BarChart3 size={20} className="text-purple-600 dark:text-purple-400" />}><ChartComponent type="pie" data={wasteByType} height={250} /></Widget>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Widget title="Recent Recycling" icon={<Recycle size={20} className="text-green-600 dark:text-green-400" />}>
          <div className="space-y-3">
            {recyclingHistory.slice(0, 4).map(item => (
              <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <div><p className="text-sm font-medium">{item.type} — {item.weight}</p><p className="text-xs text-gray-500 dark:text-gray-400">{item.date} · {item.location}</p></div>
                <span className="text-sm font-semibold text-green-600 dark:text-green-400">+{item.points} pts</span>
              </div>
            ))}
          </div>
        </Widget>
        <Widget title="Recent Orders" icon={<Package size={20} className="text-cyan-600" />}>
          <div className="space-y-3">
            {userOrders.slice(0, 4).map(order => (
              <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <div><p className="text-sm font-medium">{order.items}</p><p className="text-xs text-gray-500 dark:text-gray-400">{order.date} · {order.seller}</p></div>
                <div className="text-right"><p className="text-sm font-semibold">{order.amount}</p><StatusBadge status={order.status} /></div>
              </div>
            ))}
          </div>
        </Widget>
      </div>
      <Widget title="Eco Tips" icon={<Leaf size={20} className="text-green-600 dark:text-green-400" />}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { title: 'Reduce Single-Use Plastics', desc: 'Switch to reusable bags and water bottles.', icon: '♻️' },
            { title: 'Compost Organic Waste', desc: 'Start a compost bin for food scraps.', icon: '' },
            { title: 'Sort Your Waste', desc: 'Separate recyclables from general waste.', icon: '🗂️' },
          ].map(tip => (
            <div key={tip.title} className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100">
              <span className="text-2xl">{tip.icon}</span>
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
