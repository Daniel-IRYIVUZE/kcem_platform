import { motion } from 'framer-motion';
import { Check, Smartphone } from 'lucide-react';

interface MobileFeature {
  icon: any;
  title: string;
  description: string;
  details: string[];
}

interface ServiceMobileFeaturesSectionProps {
  mobileFeatures: MobileFeature[];
}

const ServiceMobileFeaturesSection = ({ mobileFeatures }: ServiceMobileFeaturesSectionProps) => {
  return (
    <section className="py-24 bg-gradient-to-b from-cyan-50 to-white">
      <div className="lg:w-11/12 max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-slate-900 mb-4">Mobile App Features</h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Access your dashboard on-the-go with our Flutter mobile application
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {mobileFeatures.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl p-6 border border-slate-200 hover:shadow-xl transition-all"
            >
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-600 text-white flex items-center justify-center mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
              <p className="text-slate-600 text-sm mb-4">{feature.description}</p>
              <div className="space-y-2">
                {feature.details.map((detail, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm text-slate-500">
                    <Check size={14} className="text-cyan-500" />
                    {detail}
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
            className="mt-12 bg-gradient-to-r from-cyan-900 to-cyan-900 rounded-2xl p-8 text-white"
        >
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div>
              <h3 className="text-2xl font-bold mb-3">Download Mobile App</h3>
              <p className="text-cyan-100/80">Available on iOS and Android with role-specific interfaces</p>
            </div>
            <div className="flex gap-4">
              <button className="px-6 py-3 bg-white text-cyan-900 rounded-xl font-bold hover:bg-slate-100 transition-colors">
                <div className="flex items-center gap-2">
                  <Smartphone size={20} />
                  Android
                </div>
              </button>
              <button className="px-6 py-3 bg-white text-cyan-900 rounded-xl font-bold hover:bg-slate-100 transition-colors">
                <div className="flex items-center gap-2">
                  <Smartphone size={20} />
                  iOS
                </div>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ServiceMobileFeaturesSection;
