// components/marketplace/LiveBidActivity.tsx
import { TrendingUp, Award, Clock, Gavel, Trophy, TrendingDown } from 'lucide-react';

const activities = [
  {
    id: 1,
    recycler: 'GreenEnergy',
    action: 'bid',
    amount: 15500,
    listing: '50kg UCO',
    hotel: 'Mille Collines',
    time: '2 min ago'
  },
  {
    id: 2,
    recycler: 'EcoPlast',
    action: 'won',
    amount: 12000,
    listing: '200kg Cardboard',
    hotel: 'Serena Hotel',
    time: '5 min ago'
  },
  {
    id: 3,
    recycler: 'BioDiesel Rwanda',
    action: 'bid',
    amount: 14800,
    listing: '75kg UCO',
    hotel: 'Kigali Marriott',
    time: '7 min ago'
  },
  {
    id: 4,
    recycler: 'Glass Recycling Ltd',
    action: 'bid',
    amount: 8500,
    listing: '120kg Glass',
    hotel: 'Marriott',
    time: '12 min ago'
  },
  {
    id: 5,
    recycler: 'EcoTrade Logistics',
    action: 'outbid',
    amount: 14300,
    listing: '50kg UCO',
    hotel: 'Mille Collines',
    time: '15 min ago'
  }
];

const LiveBidActivity = () => {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6">
      <div className="flex items-center mb-6">
        <TrendingUp className="w-5 h-5 text-cyan-600 mr-2" />
        <h3 className="font-bold text-gray-900 dark:text-white">Live Bid Activity</h3>
      </div>

      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="relative pl-6 pb-4 border-l-2 border-cyan-200 dark:border-cyan-800 last:pb-0">
            {/* Timeline Dot */}
            <div className="absolute left-[-5px] top-0 w-2 h-2 bg-cyan-600 rounded-full"></div>

            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{activity.recycler}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {activity.action === 'bid' ? 'Placed bid on' : activity.action === 'won' ? 'Won auction for' : 'Outbid on'}{' '}
                  <span className="font-medium text-gray-700 dark:text-gray-300">{activity.listing}</span>
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{activity.hotel}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-cyan-600">RWF {activity.amount.toLocaleString()}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 flex items-center justify-end mt-1">
                  <Clock className="w-3 h-3 mr-1" />
                  {activity.time}
                </p>
              </div>
            </div>

            {/* Action Badge */}
            <div className={`absolute -left-3 top-4 w-6 h-6 rounded-full flex items-center justify-center ${
              activity.action === 'bid' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' :
              activity.action === 'won' ? 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400' :
              'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
            }`}>
              {activity.action === 'bid' ? (
                <Gavel className="w-3 h-3" />
              ) : activity.action === 'won' ? (
                <Trophy className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Top Bidders */}
      <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
          <Award className="w-4 h-4 text-yellow-700 mr-1" />
          Top Bidders Today
        </h4>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-700 dark:text-gray-300">1. GreenEnergy</span>
            <span className="font-semibold">12 bids</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-700 dark:text-gray-300">2. EcoPlast</span>
            <span className="font-semibold">9 bids</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-700 dark:text-gray-300">3. BioDiesel Rwanda</span>
            <span className="font-semibold">7 bids</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveBidActivity;