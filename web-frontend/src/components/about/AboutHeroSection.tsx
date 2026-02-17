import { Target, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const AboutHeroSection = () => {
  const navigate = useNavigate();

  const handleViewServices = () => {
    navigate('/services');
  };

  const handleViewMarketplace = () => {
    navigate('/marketplace');
  };

  return (
    <section className="relative py-12 md:py-20 lg:py-24 overflow-hidden">
      <div className="absolute inset-0 bg-gray-900">
        <img 
          src="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=1920" 
          alt="Kigali City" 
          className="w-full h-full object-cover opacity-40"
        />
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center text-white"
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 leading-tight">
            Digitizing Kigali's<br />
            <span className="text-cyan-300">Reverse Logistics</span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-200 max-w-3xl mx-auto mb-6 sm:mb-8">
            Transforming the HORECA sector's waste management through a data-driven B2B marketplace
          </p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="inline-flex flex-col sm:flex-row items-center gap-4"
          >
            <button
              onClick={handleViewServices}
              className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              View Our Services
            </button>
            <button
              onClick={handleViewMarketplace}
              className="bg-white/10 backdrop-blur-sm border border-white/30 text-white px-6 py-3 rounded-lg font-medium hover:bg-white/20 transition-colors"
            >
              Browse Marketplace
            </button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default AboutHeroSection;
