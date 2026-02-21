import { motion } from 'framer-motion';
import { Bell } from 'lucide-react';

const UpdatesHeroSection = () => {
  return (
    <section className="relative py-20 md:py-28 overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img 
          src="https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=1920" 
          alt="Updates and News" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50"></div>
      </div>

      <div className="lg:w-11/12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-3 bg-cyan-400/20 text-cyan-200 px-4 py-2 rounded-full text-sm font-bold mb-6 backdrop-blur-sm"
          >
            <Bell size={18} />
            Role-Specific Updates & Announcements
          </motion.div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
            Stay <span className="text-cyan-300">Informed</span> by Role
          </h1>
          <p className="text-lg text-gray-100 max-w-3xl mx-auto">
            Latest platform updates, industry news, and events tailored to your role in Rwanda's circular economy
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default UpdatesHeroSection;
