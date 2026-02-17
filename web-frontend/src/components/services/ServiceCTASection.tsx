import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const ServiceCTASection = () => {
  return (
    <section className="py-24 bg-gradient-to-br from-cyan-900 via-cyan-900 to-cyan-900 text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:40px_40px]"></div>
      <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-4xl font-bold mb-6"
        >
          Ready to Access Your Role-Specific Dashboard?
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="text-lg text-cyan-100 mb-10 max-w-2xl mx-auto"
        >
          Join 85+ businesses already benefiting from tailocyan waste management solutions
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <button className="bg-white text-cyan-900 px-8 py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-100 transition-all hover:scale-105">
            Start Free Trial <ArrowRight size={20} />
          </button>?
        </motion.div>
      </div>
    </section>
  );
};

export default ServiceCTASection;
