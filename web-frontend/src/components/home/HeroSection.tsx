import { ArrowRight, CheckCircle, Shield, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const HeroSection = () => {
  const navigate = useNavigate();

  const handleJoinAsBusiness = () => {
    navigate('/register?type=business');
  };

  const handleJoinAsRecycler = () => {
    navigate('/register?type=recycler');
  };

  const handleViewMarketplace = () => {
    navigate('/marketplace');
  };

  return (
    <section className="relative py-20 md:py-32 overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img 
          src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=1920" 
          alt="Kigali Circular Economy Background" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/60"></div>
      </div>

      <div className="lg:w-11/12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="grid lg:grid-cols-2 gap-12 items-center"
        >
          <div className="text-white">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6"
            >
              EcoTrade{' '}
              <span className="text-cyan-300">Rwanda</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-lg text-gray-200 mb-8 max-w-lg"
            >
              Connect with verified recyclers, optimize waste collection, and transform your 
              hospitality waste into sustainable revenue through our smart B2B platform.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="flex flex-wrap gap-4"
            >
              <button
                onClick={handleJoinAsBusiness}
                className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-3 sm:px-8 sm:py-4 rounded-lg font-bold flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
              >
                Join as Business <ArrowRight size={20} />
              </button>
              <button
                onClick={handleJoinAsRecycler}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 sm:px-8 sm:py-4 rounded-lg font-bold flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
              >
                Join as Recycler <ArrowRight size={20} />
              </button>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="mt-8 flex flex-wrap gap-4"
            >
              <div className="flex items-center gap-2">
                <CheckCircle size={16} className="text-green-400" />
                <span className="text-sm text-gray-300">Verified Recyclers</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield size={16} className="text-cyan-400" />
                <span className="text-sm text-gray-300">Secure Payments</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin size={16} className="text-red-400" />
                <span className="text-sm text-gray-300">Kigali Wide</span>
              </div>
            </motion.div>
          </div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="hidden lg:block"
          >
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-white mb-4">Start Earning Today</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between text-white">
                  <span>Used Cooking Oil</span>
                  <span className="font-bold">Rwf 800-1,200/L</span>
                </div>
                <div className="flex items-center justify-between text-white">
                  <span>Glass Bottles</span>
                  <span className="font-bold">Rwf 150-300/kg</span>
                </div>
                <div className="flex items-center justify-between text-white">
                  <span>Paper & Cardboard</span>
                  <span className="font-bold">Rwf 50-150/kg</span>
                </div>
              </div>
              <button
                onClick={handleViewMarketplace}
                className="w-full mt-6 bg-white text-cyan-700 hover:bg-gray-100 px-6 py-3 rounded-lg font-bold transition-all"
              >
                Browse Marketplace
              </button>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
