// components/home/CTASection.tsx
import { ArrowRight, Mail, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';

const CTASection = () => {
  return (
    <section className="py-20 bg-cyan-900 text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-white dark:bg-gray-900 rounded-full mix-blend-overlay filter blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-300 rounded-full mix-blend-overlay filter blur-3xl"></div>
      </div>

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-4xl text-white lg:text-5xl font-bold mb-6">
          Ready to Transform Your Waste Management?
        </h2>
        
        <p className="text-xl text-cyan-100 mb-10 max-w-3xl mx-auto">
          Join Kigali's fastest-growing circular economy platform. Whether you're a hotel,
          recycler, or driver, EcoTrade helps you turn waste into value.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Link
            to="/login"
            className="bg-white dark:bg-gray-900 text-cyan-800 dark:text-cyan-300 px-8 py-4 rounded-xl font-semibold hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 inline-flex items-center justify-center"
          >
            Get Started Today
            <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
          
          <Link
            to="/contact"
            className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold hover:bg-white dark:bg-gray-800/10 transform hover:-translate-y-1 transition-all duration-300 inline-flex items-center justify-center"
          >
            Contact Sales
          </Link>
        </div>

        {/* Contact Info */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-cyan-100">
          <div className="flex items-center">
            <Mail className="w-5 h-5 mr-2" />
            <span>info@ecotrade.rw</span>
          </div>
          <div className="flex items-center">
            <Phone className="w-5 h-5 mr-2" />
            <span>+250 780 162 164</span>
          </div>
        </div>

        {/* Stats Preview */}
        <div className="mt-12 pt-12 border-t border-cyan-600/30">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <div className="text-3xl text-white font-bold">4+</div>
              <div className="text-sm text-cyan-200">Hotels</div>
            </div>
            <div>
              <div className="text-3xl text-white font-bold">2</div>
              <div className="text-sm text-cyan-200">Recyclers</div>
            </div>
            <div>
              <div className="text-3xl text-white font-bold">3+</div>
              <div className="text-sm text-cyan-200">Drivers</div>
            </div>
            <div>
              <div className="text-3xl font-bold">0.1t</div>
              <div className="text-sm text-cyan-200">Waste Diverted</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;