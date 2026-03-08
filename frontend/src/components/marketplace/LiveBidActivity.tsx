// components/marketplace/LiveBidActivity.tsx
import { TrendingUp, Award } from 'lucide-react';
import BidTicker, { type TickerItem } from '../ui/BidTicker';

const defaultItems: TickerItem[] = [
  { id: '1', recycler: 'GreenEnergy',       wasteType: 'UCO',           amount: 15500, time: '2 min ago' },
  { id: '2', recycler: 'EcoPlast',          wasteType: 'Cardboard',     amount: 12000, time: '5 min ago' },
  { id: '3', recycler: 'BioDiesel Rwanda',  wasteType: 'UCO',           amount: 14800, time: '7 min ago' },
  { id: '4', recycler: 'Glass Recycling',   wasteType: 'Glass',         amount: 8500,  time: '12 min ago' },
  { id: '5', recycler: 'EcoTrade Logistics',wasteType: 'Mixed Waste',   amount: 14300, time: '15 min ago' },
];

const topBidders = [
  { name: 'GreenEnergy Recyclers', bids: 12, amount: 'RWF 15,500' },
  { name: 'EcoPlast Ltd',          bids: 9,  amount: 'RWF 12,000' },
  { name: 'BioDiesel Rwanda',      bids: 7,  amount: 'RWF 14,800' },
];

interface LiveBidActivityProps {
  items?: TickerItem[];
}

const LiveBidActivity = ({ items = defaultItems }: LiveBidActivityProps) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 space-y-5">
      {/* Header */}
      <div className="flex items-center gap-2">
        <TrendingUp size={18} className="text-cyan-600" />
        <h3 className="font-bold text-gray-900 dark:text-white text-sm">Live Bid Activity</h3>
        <span className="ml-auto flex items-center gap-1.5 text-xs text-cyan-600 dark:text-cyan-400 font-medium">
          <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-pulse" />
          LIVE
        </span>
      </div>

      {/* Bid Ticker */}
      <BidTicker items={items} maxItems={6} />

      {/* Top Bidders */}
      <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
        <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-1.5">
          <Award size={13} className="text-yellow-500" />
          Top Bidders Today
        </h4>
        <div className="space-y-2">
          {topBidders.map((b, i) => (
            <div key={b.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? 'bg-yellow-100 text-yellow-700' : i === 1 ? 'bg-gray-100 text-gray-600' : 'bg-orange-100 text-orange-700'}`}>
                  {i + 1}
                </span>
                <span className="text-sm text-gray-700 dark:text-gray-300">{b.name}</span>
              </div>
              <div className="text-right">
                <p className="text-xs font-semibold text-cyan-600 dark:text-cyan-400">{b.amount}</p>
                <p className="text-xs text-gray-400">{b.bids} bids</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LiveBidActivity;
