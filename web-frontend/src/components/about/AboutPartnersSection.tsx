import { ArrowRight, Recycle, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const AboutPartnersSection = () => {
  const navigate = useNavigate();

  const handleContactPartnership = () => {
    navigate('/contact?type=partnership');
  };

  const partners = [
    { name: "African Leadership University", logo: "ALU", description: "Academic Partner & Research Hub" },
    { name: "Rwanda Environment Management Authority", logo: "REMA", description: "Government Regulatory Partner" },
    { name: "Global Green Growth Institute", logo: "GGGI", description: "Sustainability Strategy Partner" },
    { name: "Kigali Innovation City", logo: "KIC", description: "Ecosystem Development Partner" },
    { name: "COPED Group", logo: "COPED", description: "Waste Management Industry Partner" },
    { name: "Rwanda Development Board", logo: "RDB", description: "Economic Development Partner" }
  ];

  return (
    <section className="py-12 md:py-20 lg:py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-8 lg:mb-16"
        >
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 lg:mb-4">Partners & Supporters</h2>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Collaborating to build Kigali's circular economy ecosystem
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8 lg:mb-12">
          {partners.map((partner, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-white p-4 sm:p-6 rounded-xl border border-gray-200 hover:border-cyan-300 transition-colors"
            >
              <div className="flex items-center gap-4 mb-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-cyan-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                  {partner.logo}
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">{partner.name}</h4>
                  <p className="text-sm text-gray-500">{partner.description}</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Official Partner</span>
                <ArrowRight size={16} className="text-cyan-500" />
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <button
            onClick={handleContactPartnership}
            className="inline-flex items-center gap-2 bg-cyan-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-cyan-700 transition-colors"
          >
            <Recycle size={18} />
            Become a Partner
          </button>
          <p className="text-gray-600 mt-4 text-sm">Join us in building sustainable waste management solutions</p>
        </motion.div>
      </div>
    </section>
  );
};

export default AboutPartnersSection;
