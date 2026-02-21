import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const StatsSection = () => {
  const [animatedStats, setAnimatedStats] = useState({
    tons: 0,
    businesses: 0,
    revenue: 0
  });

  useEffect(() => {
    const animateCounter = (end: number, setter: (val: number) => void, duration = 2000) => {
      let start = 0;
      const increment = end / (duration / 16);
      const timer = setInterval(() => {
        start += increment;
        if (start >= end) {
          setter(end);
          clearInterval(timer);
        } else {
          setter(Math.floor(start));
        }
      }, 16);
    };

    animateCounter(10, (val) => setAnimatedStats(prev => ({ ...prev, tons: val })));
    animateCounter(3, (val) => setAnimatedStats(prev => ({ ...prev, businesses: val })), 1500);
    animateCounter(1, (val) => setAnimatedStats(prev => ({ ...prev, revenue: val })), 1800);
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.6 }}
      className="bg-gradient-to-r from-cyan-600 to-cyan-700 text-white py-8"
    >
      <div className="lg:w-11/12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="text-3xl sm:text-4xl font-bold text-cyan-400 mb-2">
              {animatedStats.tons.toLocaleString()}+
            </div>
            <div className="text-sm text-gray-300">Tons Diverted</div>
            <div className="text-xs text-gray-400">from Landfill</div>
          </div>
          <div className="text-center">
            <div className="text-3xl sm:text-4xl font-bold text-cyan-400 mb-2">
              {animatedStats.businesses}+
            </div>
            <div className="text-sm text-gray-300">Active Businesses</div>
            <div className="text-xs text-gray-400">HORECA Partners</div>
          </div>
          <div className="text-center">
            <div className="text-3xl sm:text-4xl font-bold text-cyan-400 mb-2">
              {animatedStats.revenue}M+
            </div>
            <div className="text-sm text-gray-300">Rwf Generated</div>
            <div className="text-xs text-gray-400">Revenue Created</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default StatsSection;
