import { ChevronRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const CTASection = () => {
  const navigate = useNavigate();

  const handleJoinAsBusiness = () => {
    navigate('/register?type=business');
  };

  const handleContactDemo = () => {
    navigate('/contact?demo=true');
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    const email = (document.getElementById('subscribe-email') as HTMLInputElement)?.value;
    if (email) {
      console.log('Subscribed email:', email);
      alert('Thank you for subscribing! You will receive updates shortly.');
      (document.getElementById('subscribe-email') as HTMLInputElement).value = '';
    }
  };

  return (
    <section className="py-16 sm:py-24 bg-gray-900 text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6"
        >
          Ready to Monetize Your Waste?
        </motion.h2>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="text-lg text-gray-300 mb-8 sm:mb-10 max-w-2xl mx-auto"
        >
          Join leading hotels, restaurants, and recyclers in Kigali's circular economy revolution
        </motion.p>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="flex flex-col sm:flex-row gap-4 justify-center mb-8 sm:mb-12"
        >
          <button
            onClick={handleJoinAsBusiness}
            className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-bold flex items-center justify-center gap-2 transition-all hover:scale-105"
          >
            Start Earning from Waste <ChevronRight size={20} />
          </button>
          <button
            onClick={handleContactDemo}
            className="bg-transparent border-2 border-gray-300 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-bold hover:bg-white/10 transition-all"
          >
            Schedule a Demo
          </button>
        </motion.div>
        
        {/* Email subscription */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          viewport={{ once: true }}
          className="max-w-md mx-auto"
        >
          <p className="text-gray-300 mb-4">Stay updated with circular economy insights</p>
          <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2">
            <input 
              id="subscribe-email"
              type="email" 
              placeholder="Enter your email" 
              required
              className="flex-1 px-4 sm:px-6 py-3 rounded-lg bg-white/10 border border-gray-300/20 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500"
            />
            <button 
              type="submit"
              className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-3 rounded-lg font-bold transition-all"
            >
              Subscribe
            </button>
          </form>
          <p className="text-sm text-gray-400 mt-3">No spam. Unsubscribe anytime.</p>
        </motion.div>

        {/* Additional Links */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          viewport={{ once: true }}
          className="mt-8 flex flex-wrap justify-center gap-6 text-sm"
        >
          <Link to="/about" className="text-gray-300 hover:text-white transition-colors">
            About Us
          </Link>
          <Link to="/services" className="text-gray-300 hover:text-white transition-colors">
            Our Services
          </Link>
          <Link to="/marketplace" className="text-gray-300 hover:text-white transition-colors">
            Marketplace
          </Link>
          <Link to="/blog" className="text-gray-300 hover:text-white transition-colors">
            Blog
          </Link>
          <Link to="/contact" className="text-gray-300 hover:text-white transition-colors">
            Contact
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;
