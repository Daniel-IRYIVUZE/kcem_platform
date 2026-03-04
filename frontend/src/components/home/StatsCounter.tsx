// components/home/StatsCounter.tsx
import { useEffect, useState } from 'react';
import { Building2, Factory, Users, TrendingUp } from 'lucide-react';

const stats = [
  { icon: Building2, label: 'Active Hotels', value: 5, suffix: '' },
  { icon: Factory, label: 'Registered Recyclers', value: 2, suffix: '' },
  { icon: Users, label: 'Active Drivers', value: 3, suffix: '' },
  { icon: TrendingUp, label: 'Monthly Volume', value: 1.2, suffix: ' tons' },
];

const StatsCounter = () => {
  const [counts, setCounts] = useState(stats.map(() => 0));

  useEffect(() => {
    const intervals = stats.map((stat, index) => {
      return setInterval(() => {
        setCounts(prev => {
          const newCounts = [...prev];
          if (newCounts[index] < stat.value) {
            newCounts[index] = Math.min(newCounts[index] + Math.ceil(stat.value / 50), stat.value);
          }
          return newCounts;
        });
      }, 20);
    });

    return () => intervals.forEach(clearInterval);
  }, []);

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
                {counts[index]}
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