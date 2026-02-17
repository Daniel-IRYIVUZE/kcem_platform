import { motion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';

const ContactHeroSection = () => {
  return (
    <section className="pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-cyan-100 text-cyan-700 px-3 py-1.5 rounded-full text-sm font-medium mb-4"
          >
            <MessageCircle size={16} />
            We're Here to Help
          </motion.div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Get in <span className="text-cyan-600">Touch</span>
          </h1>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Have questions about listings, registration, or partnerships? Our team is here to help transform waste into value.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default ContactHeroSection;
