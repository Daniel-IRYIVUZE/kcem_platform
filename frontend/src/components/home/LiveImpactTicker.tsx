// components/home/LiveImpactTicker.tsx
import { useEffect, useState } from 'react';
import { Activity, Droplet, Package, Truck } from 'lucide-react';
import { statsAPI } from '../../services/api';

interface ActivityItem {
  type: 'hotel' | 'recycler' | 'driver';
  name: string;
  action: string;
  waste: string;
  time: string;
}

const FALLBACK_ACTIVITIES: ActivityItem[] = [
  { type: 'hotel', name: 'Hotel des Mille Collines', action: 'listed', waste: '200kg Used Cooking Oil', time: 'just now' },
  { type: 'hotel', name: 'Kigali Marriott Hotel', action: 'listed', waste: '150kg Glass', time: '3 min ago' },
  { type: 'hotel', name: 'Kigali Serena Hotel', action: 'listed', waste: '300kg Metal Scraps', time: '7 min ago' },
  { type: 'recycler', name: 'Certified Recycler', action: 'bid on', waste: '120kg Paper Cardboard', time: '10 min ago' },
  { type: 'hotel', name: 'Radisson Blu Kigali', action: 'listed', waste: '80kg Organic Waste', time: '15 min ago' },
  { type: 'hotel', name: 'Novotel Kigali', action: 'listed', waste: '250kg Plastic', time: '20 min ago' },
];

const LiveImpactTicker = () => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const loadActivities = async () => {
      try {
        const data = await statsAPI.recentActivity(8);
        if (data.length > 0) {
          const now = Date.now();
          const items: ActivityItem[] = data.map(d => {
            const ageMs = d.created_at ? now - new Date(d.created_at).getTime() : 0;
            const mins = Math.floor(ageMs / 60000);
            const hrs = Math.floor(ageMs / 3600000);
            const timeAgo = ageMs < 60000 ? 'just now' : hrs > 0 ? `${hrs}h ago` : `${mins}m ago`;
            return {
              type: 'hotel' as const,
              name: d.name,
              action: d.action,
              waste: d.waste,
              time: timeAgo,
            };
          });
          setActivities(items);
        } else {
          setActivities(FALLBACK_ACTIVITIES);
        }
      } catch {
        setActivities(FALLBACK_ACTIVITIES);
      }
    };
    loadActivities();
  }, []);

  useEffect(() => {
    if (activities.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activities.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [activities]);

  const currentActivity = activities[currentIndex];

  if (!currentActivity) {
    return null;
  }

  return (
    <section className="bg-cyan-600 py-6 text-white">
      <div className="max-w-11/12 mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center space-x-4">
            <Activity className="w-6 h-6 animate-pulse" />
            <span className="font-semibold text-lg">Live Activity:</span>
          </div>

          <div className="flex-1 min-w-[300px]">
            <div className="bg-gray-800/10 dark:bg-gray-800/10 backdrop-blur-sm rounded-lg px-6 py-3">
              <div className="flex items-center space-x-4 animate-fade-in">
                {currentActivity.type === 'hotel' && <Package className="w-5 h-5 flex-shrink-0" />}
                {currentActivity.type === 'recycler' && <Droplet className="w-5 h-5 flex-shrink-0" />}
                {currentActivity.type === 'driver' && <Truck className="w-5 h-5 flex-shrink-0" />}
                <span className="font-medium">
                  <span className="font-bold">{currentActivity.name}</span>{' '}
                  {currentActivity.action}{' '}
                  <span className="text-cyan-200">{currentActivity.waste}</span>
                </span>
                <span className="text-cyan-200 text-sm ml-auto">{currentActivity.time}</span>
              </div>
            </div>
          </div>

          <div className="flex space-x-2">
            <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
            <span className="w-2 h-2 bg-white/50 rounded-full"></span>
            <span className="w-2 h-2 bg-white/50 rounded-full"></span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LiveImpactTicker;
