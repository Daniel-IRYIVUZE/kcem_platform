import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Globe2, BarChart3, TrendingUp } from 'lucide-react';

const ImpactCard = ({ icon, label, value, sub, description }: any) => {
  return (
    <div className="text-center p-6 bg-white border border-gray-200 rounded-xl hover:shadow-lg transition-shadow">
      <div className="inline-flex p-3 bg-cyan-600 text-white rounded-lg mb-4">
        {icon}
      </div>
      <h4 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">{value}</h4>
      <p className="font-bold text-gray-700 uppercase text-sm tracking-wider mb-1">{label}</p>
      <p className="text-gray-500 text-sm mb-2">{sub}</p>
      <p className="text-xs text-gray-400">{description}</p>
    </div>
  );
};

const AboutImpactSection = () => {
  const [impactStats, setImpactStats] = useState({
    co2Reduction: 0,
    landfillDiversion: 0,
    economicGain: 0,
    businessesServed: 0,
    wasteDiverted: 0,
    revenueGenerated: 0
  });

  useEffect(() => {
    const targets = {
      co2Reduction: 450,
      landfillDiversion: 82,
      economicGain: 30,
      businessesServed: 3,
      wasteDiverted: 1,
      revenueGenerated: 2.4
    };

    const animateCounter = (end: number, setter: (val: number) => void, duration = 1500) => {
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

    animateCounter(targets.co2Reduction, (val) => setImpactStats(prev => ({ ...prev, co2Reduction: val })), 2000);
    animateCounter(targets.landfillDiversion, (val) => setImpactStats(prev => ({ ...prev, landfillDiversion: val })), 1800);
    animateCounter(targets.economicGain, (val) => setImpactStats(prev => ({ ...prev, economicGain: val })), 1600);
    animateCounter(targets.businessesServed, (val) => setImpactStats(prev => ({ ...prev, businessesServed: val })), 1400);
    animateCounter(targets.wasteDiverted, (val) => setImpactStats(prev => ({ ...prev, wasteDiverted: val })), 2200);
    animateCounter(targets.revenueGenerated, (val) => setImpactStats(prev => ({ ...prev, revenueGenerated: val })), 2400);
  }, []);

  return (
    <section className="py-12 md:py-20 lg:py-24 bg-white">
      <div className="lg:w-11/12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-8 lg:mb-16"
        >
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 lg:mb-4">Measurable Impact</h2>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Real-time tracking of our circular economy contributions
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 lg:mb-16">
          <ImpactCard 
            icon={<Globe2 />} 
            label="CO2 Reduction" 
            value={`~${impactStats.co2Reduction}kg`} 
            sub="Per business / month" 
            description="Equivalent to planting 5 trees monthly"
          />
          <ImpactCard 
            icon={<BarChart3 />} 
            label="Landfill Diversion" 
            value={`${impactStats.landfillDiversion}%`} 
            sub="Total waste recovered" 
            description="From landfill to recycling"
          />
          <ImpactCard 
            icon={<TrendingUp />} 
            label="Economic Gain" 
            value={`${impactStats.economicGain}%`} 
            sub="Avg. savings for HORECA" 
            description="Reduction in waste management costs"
          />
        </div>

        {/* Additional Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="bg-gray-50 p-6 sm:p-8 rounded-xl sm:rounded-2xl border border-gray-200"
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">{impactStats.businessesServed}+</div>
              <p className="font-medium text-gray-700">Active Businesses</p>
              <p className="text-sm text-gray-500">Hotels, Restaurants & Cafés</p>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">{impactStats.wasteDiverted}+</div>
              <p className="font-medium text-gray-700">Tons Diverted</p>
              <p className="text-sm text-gray-500">From landfill to recycling</p>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">{impactStats.revenueGenerated}M+</div>
              <p className="font-medium text-gray-700">RWF Generated</p>
              <p className="text-sm text-gray-500">New revenue streams created</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default AboutImpactSection;
