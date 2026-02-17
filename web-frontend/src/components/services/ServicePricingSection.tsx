import { motion } from 'framer-motion';
import { HelpCircle, Check, X, ArrowRight } from 'lucide-react';

interface PricingFeature {
  included: boolean;
  text: string;
}

interface PricingTier {
  id: string;
  name: string;
  price: string;
  description: string;
  icon: any;
  color: string;
  features: PricingFeature[];
  bestFor: string[];
  popular?: boolean;
}

interface ServicePricingSectionProps {
  pricingTiers: PricingTier[];
  selectedTier: string;
  onSelectTier: (tierId: string) => void;
}

const ServicePricingSection = ({ pricingTiers, selectedTier, onSelectTier }: ServicePricingSectionProps) => {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-slate-900 mb-4">Flexible Pricing Tiers</h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Choose the perfect plan for your business needs
          </p>
        </motion.div>

        <div className="flex justify-center gap-4 mb-12">
          {pricingTiers.map((tier) => (
            <button
              key={tier.id}
              onClick={() => onSelectTier(tier.id)}
              className={`px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 ${
                selectedTier === tier.id
                  ? `bg-gradient-to-r ${tier.color} text-white shadow-lg`
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {tier.icon}
              {tier.name}
              {tier.popular && selectedTier === tier.id && (
                <span className="ml-2 text-xs bg-white/20 px-2 py-0.5 rounded-full">POPULAR</span>
              )}
            </button>
          ))}
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {pricingTiers.map((tier, index) => (
            <motion.div
              key={tier.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className={`relative rounded-[2rem] overflow-hidden border transition-all duration-300 ${
                selectedTier === tier.id
                  ? 'scale-105 shadow-2xl ring-4 ring-cyan-500/30 border-cyan-500'
                  : 'scale-100 shadow-lg border-slate-200'
              } ${tier.popular ? 'bg-gradient-to-b from-white to-cyan-50' : 'bg-white'}`}
            >
              {tier.popular && selectedTier === tier.id && (
                <div className="absolute top-7 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <div className={`bg-gradient-to-r ${tier.color} text-white px-6 py-1 rounded-full text-sm font-bold whitespace-nowrap`}>
                    MOST POPULAR
                  </div>
                </div>
              )}

              <div className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${tier.color} text-white`}>
                    {tier.icon}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900">{tier.name}</h3>
                    <p className="text-slate-500 text-sm">{tier.description}</p>
                  </div>
                </div>

                <div className="mb-6">
                  <div className="text-5xl font-black text-slate-900 mb-2">{tier.price}</div>
                  {tier.price !== 'Free' && tier.price !== 'Custom' && (
                    <div className="text-slate-500 text-sm">per month, billed annually</div>
                  )}
                </div>

                <div className="mb-6">
                  <div className="text-sm font-medium text-slate-700 mb-2">Best for:</div>
                  <div className="flex flex-wrap gap-2">
                    {tier.bestFor.map((item, idx) => (
                      <span key={idx} className="px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                <ul className="space-y-4 mb-8">
                  {tier.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-3">
                      {feature.included ? (
                        <Check className="text-cyan-500 flex-shrink-0" size={20} />
                      ) : (
                        <X className="text-slate-400 flex-shrink-0" size={20} />
                      )}
                      <span className={`text-sm ${feature.included ? 'text-slate-700' : 'text-slate-400 line-through'}`}>
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>

                <button className={`w-full py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
                  selectedTier === tier.id
                    ? `bg-gradient-to-r ${tier.color} text-white hover:shadow-lg`
                    : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
                }`}>
                  Get Started <ArrowRight size={18} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <div className="inline-flex items-center gap-2 text-cyan-700">
            <HelpCircle size={20} />
            <span className="font-medium">All plans include 14-day free trial • Volume discounts available</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ServicePricingSection;
