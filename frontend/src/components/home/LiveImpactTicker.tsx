// components/home/LiveImpactTicker.tsx
import { useEffect, useState } from 'react';
import { Activity, Droplet, Package, Truck } from 'lucide-react';

const activities = [
  { type: 'hotel', name: 'Mille Collines', action: 'listed', waste: '50kg UCO', time: 'just now' },
  { type: 'recycler', name: 'GreenEnergy', action: 'bid on', waste: '200kg Glass', time: '2 min ago' },
  { type: 'driver', name: 'Jean', action: 'completed Route #234', waste: '5 stops', time: '5 min ago' },
  { type: 'hotel', name: 'Marriott', action: 'listed', waste: '120kg Cardboard', time: '7 min ago' },
  { type: 'recycler', name: 'EcoProcess Rwanda', action: 'won bid for', waste: '75L UCO', time: '12 min ago' },
  { type: 'driver', name: 'Emmanuel', action: 'started Route #238', waste: '3 stops', time: '15 min ago' },
];

const LiveImpactTicker = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activities.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

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
                {activities[currentIndex].type === 'hotel' && <Package className="w-5 h-5 flex-shrink-0" />}
                {activities[currentIndex].type === 'recycler' && <Droplet className="w-5 h-5 flex-shrink-0" />}
                {activities[currentIndex].type === 'driver' && <Truck className="w-5 h-5 flex-shrink-0" />}
                <span className="font-medium">
                  <span className="font-bold">{activities[currentIndex].name}</span>{' '}
                  {activities[currentIndex].action}{' '}
                  <span className="text-cyan-200">{activities[currentIndex].waste}</span>
                </span>
                <span className="text-cyan-200 text-sm ml-auto">{activities[currentIndex].time}</span>
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