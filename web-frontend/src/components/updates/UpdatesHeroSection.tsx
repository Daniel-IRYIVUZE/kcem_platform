import { motion } from 'framer-motion';
import { Bell } from 'lucide-react';

const UpdatesHeroSection = () => {
  return (
    <section className="text-center mb-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="inline-flex items-center gap-3 bg-gradient-to-r from-cyan-100 to-cyan-100 text-cyan-700 px-4 py-2 rounded-full text-sm font-bold mb-6"
      >
        <Bell size={18} />
        Role-Specific Updates & Announcements
      </motion.div>

      <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 mb-6">
        Stay <span className="text-cyan-600">Informed</span> by Role
      </h1>
      <p className="text-lg text-slate-600 max-w-3xl mx-auto">
        Latest platform updates, industry news, and events tailored to your role in Rwanda's circular economy
      </p>
    </section>
  );
};

export default UpdatesHeroSection;
