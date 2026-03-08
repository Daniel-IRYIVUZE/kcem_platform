// components/home/StatsCounter.tsx
import { useEffect, useState } from 'react';
import { Building2, Factory, Users, TrendingUp } from 'lucide-react';
import { statsAPI } from '../../services/api';


const StatsCounter = () => {
  const [stats, setStats] = useState([
    { icon: Building2, label: 'Active Hotels', value: 0, suffix: '' },
    { icon: Factory, label: 'Certified Recyclers', value: 0, suffix: '' },
    { icon: Users, label: 'Active Drivers', value: 0, suffix: '' },
    { icon: TrendingUp, label: 'Tonnes Diverted', value: 0, suffix: '  Kg' },
  ]);
  const [counts, setCounts] = useState([0, 0, 0, 0]);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await statsAPI.get();
        const tonnes = Math.round(data.total_volume_kg / 1000);
        setStats([
          { icon: Building2, label: 'Active Hotels', value: data.hotels, suffix: '' },
          { icon: Factory, label: 'Certified Recyclers', value: data.recyclers, suffix: '' },
          { icon: Users, label: 'Active Drivers', value: data.drivers, suffix: '' },
          { icon: TrendingUp, label: 'Tonnes Diverted', value: tonnes, suffix: '  Kg' },
        ]);
      } catch {
        // Fallback to known DB values if API is unavailable
        setStats([
          { icon: Building2, label: 'Active Hotels', value: 13, suffix: '' },
          { icon: Factory, label: 'Certified Recyclers', value: 13, suffix: '' },
          { icon: Users, label: 'Active Drivers', value: 17, suffix: '' },
          { icon: TrendingUp, label: 'Tonnes Diverted', value: 16, suffix: '  Kg' },
        ]);
      }
    };
    loadStats();
  }, []);

  useEffect(() => {
    const intervals = stats.map((stat, index) => {
      return setInterval(() => {
        setCounts(prev => {
          const newCounts = [...prev];
          const increment = typeof stat.value === 'number' ? Math.ceil(stat.value / 50) : 0.1;
          if (newCounts[index] < stat.value) {
            newCounts[index] = Math.min(newCounts[index] + increment, stat.value);
          }
          return newCounts;
        });
      }, 20);
    });

    return () => intervals.forEach(clearInterval);
  }, [stats]);

  return (
    <section className="py-12 bg-white dark:bg-gray-950 border-y border-gray-100 dark:border-gray-800 transition-colors duration-300">
      <div className="max-w-11/12 mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center group hover:scale-105 transition-transform duration-300">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-cyan-50 dark:bg-cyan-900/20 rounded-2xl mb-4 group-hover:bg-cyan-100 dark:group-hover:bg-cyan-900/40 transition-colors">
                <stat.icon className="w-8 h-8 text-cyan-600 dark:text-cyan-400" />
              </div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">
                {Math.round(counts[index]).toLocaleString()}
                {stat.suffix}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsCounter;
