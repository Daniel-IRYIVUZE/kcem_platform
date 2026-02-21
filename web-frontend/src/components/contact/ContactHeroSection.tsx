import { motion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';

const ContactHeroSection = () => {
  return (
    <section className="relative py-16 md:py-24 overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img 
          src="https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=1920" 
          alt="Support and Communication" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/55"></div>
      </div>

      <div className="lg:w-11/12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center text-white"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-cyan-400/20 text-cyan-200 px-3 py-1.5 rounded-full text-sm font-medium mb-4 backdrop-blur-sm"
          >
            <MessageCircle size={16} />
            We're Here to Help
          </motion.div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            Get in <span className="text-cyan-300">Touch</span>
          </h1>
          <p className="text-gray-100 max-w-3xl mx-auto">
            Have questions about listings, registration, or partnerships? Our team is here to help transform waste into value.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default ContactHeroSection;
