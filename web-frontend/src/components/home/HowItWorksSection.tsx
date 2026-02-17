import { Sparkles, Recycle, Truck, Wallet } from 'lucide-react';
import { motion } from 'framer-motion';

const WorkStep = ({ icon, num, title, desc, delay = 0 }: any) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      viewport={{ once: true }}
      className="relative p-6 bg-white border border-gray-200 rounded-xl hover:border-cyan-300 hover:shadow-lg transition-all group"
    >
      <span className="absolute top-4 right-4 text-3xl font-black text-gray-100 group-hover:text-gray-200 transition-colors font-mono">{num}</span>
      
      <div className="w-12 h-12 bg-cyan-600 rounded-lg flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      
      <h3 className="text-lg sm:text-xl font-bold mb-2 text-gray-900">{title}</h3>
      <p className="text-gray-600 text-sm leading-relaxed">{desc}</p>
    </motion.div>
  );
};

const HowItWorksSection = () => {
  const steps = [
    {
      icon: <Sparkles />,
      num: "01",
      title: "List Waste",
      desc: "Upload details of UCO, Glass, or Paper waste with photos via our mobile app or web dashboard."
    },
    {
      icon: <Recycle />,
      num: "02",
      title: "Get Offers",
      desc: "Receive competitive bids instantly from verified recyclers based on current market rates."
    },
    {
      icon: <Truck />,
      num: "03",
      title: "Schedule Pickup",
      desc: "AI-powered geospatial routing optimizes collection schedules for maximum efficiency."
    },
    {
      icon: <Wallet />,
      num: "04",
      title: "Get Paid",
      desc: "Instant digital payments verified upon collection with transparent transaction history."
    }
  ];

  return (
    <section className="py-16 sm:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12 sm:mb-16"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">How EcoTrade Works</h2>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
            Four simple steps to transform your waste management and unlock new revenue streams
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <WorkStep key={index} {...step} delay={index * 0.1} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
