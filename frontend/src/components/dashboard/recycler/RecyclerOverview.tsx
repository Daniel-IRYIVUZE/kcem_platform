import { useCallback, useEffect, useState } from 'react';
import { getAll } from '../../../utils/dataStore';
import type { WasteListing } from '../../../utils/dataStore';
import { Truck, Eye, DollarSign, Trophy, TrendingUp, BarChart3, ShoppingCart, Warehouse } from 'lucide-react';
import StatCard from '../StatCard';
import Widget from '../Widget';
import ChartComponent from '../ChartComponent';
import { companyProfile, fleetData, inventoryData, revenueTrend, collectionsByType, StatusBadge } from './_shared';

export default function RecyclerOverview() {
  const [liveBids, setLiveBids] = useState<(WasteListing['bids'][0] & { hotel: string; type: string; quantity: string; myBid: string })[]>([]);

  const load = useCallback(() => {
    const bids = getAll<WasteListing>('listings').flatMap(l =>
      l.bids.filter(b => b.recyclerId === 'recycler-green-energy' && b.status === 'active')
        .map(b => ({ ...b, hotel: l.hotelName, type: l.wasteType, quantity: `${l.volume} ${l.unit}`, myBid: `RWF ${b.amount.toLocaleString()}` }))
    ).slice(0, 4);
    setLiveBids(bids);
  }, []);

  useEffect(() => {
    load();
    window.addEventListener('ecotrade_data_change', load);
    return () => window.removeEventListener('ecotrade_data_change', load);
  }, [load]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div><h1 className="text-2xl font-bold text-gray-900 dark:text-white">Recycler Dashboard</h1><p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Welcome back, {companyProfile.name}</p></div>
        <button className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-lg text-sm hover:bg-cyan-700"><ShoppingCart size={16} /> Browse Marketplace</button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Fleet Size" value={companyProfile.fleetSize} icon={<Truck size={24} />} color="cyan" subtitle={`${fleetData.filter(f => f.status === 'active').length} active`} />
        <StatCard title="Active Bids" value={companyProfile.activeBids} icon={<Eye size={24} />} color="blue" change="+3" />
        <StatCard title="Monthly Revenue" value={`RWF ${(companyProfile.monthlyRevenue / 1000000).toFixed(1)}M`} icon={<DollarSign size={24} />} color="purple" change="+12%" />
        <StatCard title="Green Score" value={companyProfile.greenScore} icon={<Trophy size={24} />} color="orange" progress={companyProfile.greenScore} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Widget title="Revenue Trend" icon={<TrendingUp size={20} className="text-cyan-600" />}>
          <ChartComponent type="line" data={revenueTrend} height={260} />
        </Widget>
        <Widget title="Collections by Type" icon={<BarChart3 size={20} className="text-purple-600 dark:text-purple-400" />}>
          <ChartComponent type="pie" data={collectionsByType} height={260} />
        </Widget>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Widget title="Active Bids" icon={<Eye size={20} className="text-cyan-600" />} action={<button className="text-sm text-cyan-600 hover:underline">View All</button>}>
          <div className="space-y-3">
            {liveBids.length > 0 ? liveBids.map(bid => (
              <div key={bid.id} className="flex items-center justify-between p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-100">
                <div><p className="text-sm font-medium">{bid.hotel} — {bid.type}</p><p className="text-xs text-gray-500 dark:text-gray-400">{bid.quantity} · My bid: {bid.myBid}</p></div>
                <StatusBadge status={bid.status} />
              </div>
            )) : <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-4">No active bids. Browse the marketplace to start bidding.</p>}
          </div>
        </Widget>
        <Widget title="Fleet Status" icon={<Truck size={20} className="text-blue-600 dark:text-blue-400" />} action={<button className="text-sm text-cyan-600 hover:underline">Manage Fleet</button>}>
          <div className="space-y-3">
            {fleetData.filter(f => f.currentRoute !== '—').slice(0, 4).map(vehicle => (
              <div key={vehicle.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <div><p className="text-sm font-medium">{vehicle.driver}</p><p className="text-xs text-gray-500 dark:text-gray-400">{vehicle.vehicle} · {vehicle.plate}</p></div>
                <div className="text-right"><span className="text-xs font-medium text-blue-600 dark:text-blue-400 block">Route: {vehicle.currentRoute}</span><StatusBadge status={vehicle.status} /></div>
              </div>
            ))}
          </div>
        </Widget>
      </div>
      <Widget title="Inventory Alerts" icon={<Warehouse size={20} className="text-yellow-700 dark:text-yellow-700" />}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {inventoryData.map(item => (
            <div key={item.id} className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <p className="text-sm font-medium">{item.type}</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">{item.currentStock}</p>
              <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div className={`h-full rounded-full ${item.utilization > 75 ? 'bg-red-500' : item.utilization > 50 ? 'bg-yellow-700' : 'bg-green-500'}`} style={{ width: `${item.utilization}%` }} />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{item.utilization}% of capacity</p>
            </div>
          ))}
        </div>
      </Widget>
    </div>
  );
}
