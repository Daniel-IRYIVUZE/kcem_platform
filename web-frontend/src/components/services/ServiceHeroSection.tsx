import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

interface ServiceHeroSectionProps {
  roleLoginFeatures: Array<{ role: string }>;
}

const ServiceHeroSection = ({ roleLoginFeatures }: ServiceHeroSectionProps) => {
  return (
    <section className="relative py-24 overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img 
          src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=1920" 
          alt="Waste Management Solutions" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/60"></div>
      </div>

      <div className="lg:w-11/12 max-w-7xl mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center text-white"
        >
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            <span className="text-cyan-300">Waste Management Solutions</span>
          </h1>
          <p className="text-xl text-cyan-100 max-w-3xl mx-auto mb-12 opacity-90">
            Tailored dashboards and tools for every stakeholder in Rwanda's circular economy
          </p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="inline-flex flex-wrap items-center justify-center gap-6"
          >
            {roleLoginFeatures.map((roleFeature, index) => (
              <div key={index} className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></div>
                <span className="text-sm">{roleFeature.role}</span>
                <ChevronDown size={14} className="text-cyan-300" />
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default ServiceHeroSection;
