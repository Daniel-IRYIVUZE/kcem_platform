import { 
  ShoppingBag, 
  Recycle, 
  Truck, 
  Check, 
  HelpCircle, 
  BarChart, 
  Shield, 
  Upload, 
  Target, 
  Clock, 
  DollarSign,
  MapPin,
  TrendingUp,
  Smartphone,
  Zap,
  Award,
  CheckCircle2,
  X,
  ArrowRight
} from 'lucide-react';
import Navbar from '../../components/common/Navbar/Navbar';
import Footer from '../../components/common/Footer/Footer';
import { motion } from 'framer-motion';
import { useState } from 'react';

const ServicesPage = () => {
  const [selectedTier, setSelectedTier] = useState('business');
  // const [activeComparison, setActiveComparison] = useState('cost-benefit');

  const serviceFeatures = {
    horeca: [
      { icon: <Upload />, title: "Waste Listing Management", description: "Upload waste details with photos, track inventory, and manage multiple material streams" },
      { icon: <BarChart />, title: "Revenue Dashboard", description: "Real-time tracking of waste sales, revenue analytics, and financial reporting" },
      { icon: <Award />, title: "cyan Score Certification", description: "Automated certification based on recycling performance and sustainability metrics" },
      { icon: <Shield />, title: "Sustainability Reporting", description: "Generate environmental impact reports for compliance and marketing" }
    ],
    recyclers: [
      { icon: <Target />, title: "Reliable Supply Sourcing", description: "Access verified waste streams from HORECA businesses with quality assurance" },
      { icon: <MapPin />, title: "Route Optimization", description: "AI-poweslate collection routes minimizing fuel costs and maximizing efficiency" },
      { icon: <CheckCircle2 />, title: "Quality Verification", description: "Digital verification of waste quality before collection and processing" },
      { icon: <TrendingUp />, title: "Bulk Purchasing", description: "Access to aggregated waste volumes for better pricing and supply stability" }
    ],
    drivers: [
      { icon: <Smartphone />, title: "Offline-First Mobile App", description: "Full functionality in low-connectivity areas with automatic sync" },
      { icon: <MapPin />, title: "Optimized Routing", description: "Turn-by-turn navigation with intelligent clustering and traffic updates" },
      { icon: <Clock />, title: "Collection Verification", description: "QR code scanning and photo verification for each pickup" },
      { icon: <DollarSign />, title: "Payment Processing", description: "Secure digital payments and earnings tracking in real-time" }
    ]
  };

  const pricingTiers = [
    {
      id: 'starter',
      name: 'Starter',
      price: 'Free',
      description: 'Perfect for small cafes and individual waste collectors',
      features: [
        { included: true, text: 'Basic waste listings (3 materials)' },
        { included: true, text: 'Mobile app access' },
        { included: true, text: 'Community support' },
        { included: false, text: 'Advanced analytics' },
        { included: false, text: 'cyan Score certification' },
        { included: false, text: 'API access' }
      ]
    },
    {
      id: 'business',
      name: 'Business',
      price: 'Rwf 25,000',
      description: 'Complete solution for HORECA businesses',
      popular: true,
      features: [
        { included: true, text: 'Unlimited waste listings' },
        { included: true, text: 'Full revenue dashboard' },
        { included: true, text: 'cyan Score certification' },
        { included: true, text: 'Priority support' },
        { included: true, text: 'Sustainability reports' },
        { included: false, text: 'Custom API integration' }
      ]
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 'Custom',
      description: 'For large hotel chains and industrial recyclers',
      features: [
        { included: true, text: 'Everything in Business tier' },
        { included: true, text: 'Custom API access' },
        { included: true, text: 'Dedicated account manager' },
        { included: true, text: 'Custom reporting tools' },
        { included: true, text: 'White-label solutions' },
        { included: true, text: 'SLA guarantees' }
      ]
    }
  ];

  // const comparisons = {
  //   'cost-benefit': {
  //     title: "Cost-Benefit Analysis",
  //     rows: [
  //       { feature: "Monthly Disposal Costs", traditional: "Rwf 50,000 - Rwf 200,000", kcem: "Rwf 0 - Revenue Generated", savings: "100%+ savings" },
  //       { feature: "Collection Efficiency", traditional: "40-60%", kcem: "85-95%", savings: "+40% efficiency" },
  //       { feature: "Carbon Reporting", traditional: "Manual estimates", kcem: "Automated tracking", savings: "100% accuracy" },
  //       { feature: "Revenue Generation", traditional: "None", kcem: "Rwf 10,000 - Rwf 100,000/mo", savings: "New income stream" },
  //       { feature: "Admin Time", traditional: "10-20 hours/month", kcem: "1-2 hours/month", savings: "90% slateuction" }
  //     ]
  //   },
  //   'features': {
  //     title: "Feature Comparison",
  //     rows: [
  //       { feature: "Digital Waste Listing", traditional: "✗", kcem: "✓", savings: "Automated process" },
  //       { feature: "Route Optimization", traditional: "✗", kcem: "✓", savings: "AI-poweslate routing" },
  //       { feature: "Real-time Tracking", traditional: "✗", kcem: "✓", savings: "Live updates" },
  //       { feature: "Automated Payments", traditional: "✗", kcem: "✓", savings: "Secure & instant" },
  //       { feature: "Environmental Reporting", traditional: "Manual", kcem: "Automated", savings: "Verified metrics" }
  //     ]
  //   }
  // };

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-20">
        {/* Hero Section */}
        <section className="relative py-24 overflow-hidden bg-gradient-to-br from-cyan-900 via-cyan-900 to-cyan-900">
          <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:40px_40px]"></div>
          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center text-white"
            >
              <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
                Complete Waste Management
                <br />
                <span className="text-cyan-300">Solutions</span>
              </h1>
              <p className="text-xl text-cyan-100 max-w-3xl mx-auto mb-12 opacity-90">
                Specialized toolsets transforming waste from a cost center to a revenue stream for Rwanda's HORECA sector
              </p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="inline-flex items-center gap-4"
              >
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse"></div>
                  <span>98% Customer Satisfaction</span>
                </div>
                <div className="h-6 w-px bg-cyan-400"></div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse"></div>
                  <span>24/7 Support Available</span>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Service Roles Section */}
        <section className="py-24 bg-gradient-to-b from-white to-slate-50">
          <div className="max-w-7xl mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold text-slate-900 mb-4">Tailoslate Solutions for Every Role</h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                Comprehensive tools designed for each stakeholder in the circular economy
              </p>
            </motion.div>

            <div className="grid lg:grid-cols-3 gap-8">
              <RoleCard 
                role="horeca"
                title="For HORECA Businesses"
                description="Transform waste management into a profitable, sustainable operation"
                icon={<ShoppingBag />}
                features={serviceFeatures.horeca}
                color="cyan"
                popular
              />
              <RoleCard 
                role="recyclers"
                title="For Industrial Recyclers"
                description="Reliable access to high-quality raw materials with optimized logistics"
                icon={<Recycle />}
                features={serviceFeatures.recyclers}
                color="cyan"
              />
              <RoleCard 
                role="drivers"
                title="For Drivers & Logistics"
                description="Efficient collection routing and verified operations management"
                icon={<Truck />}
                features={serviceFeatures.drivers}
                color="cyan"
              />
            </div>
          </div>
        </section>

        {/* Pricing Section */}
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
                  onClick={() => setSelectedTier(tier.id)}
                  className={`px-6 py-3 rounded-xl font-bold transition-all ${selectedTier === tier.id 
                    ? 'bg-gradient-to-r from-cyan-600 to-cyan-600 text-white -lg' 
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
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
                      ? 'scale-105 -2xl ring-4 ring-cyan-500/30 border-cyan-500' 
                      : 'scale-100 -lg border-slate-200'
                  } ${tier.popular ? 'bg-gradient-to-b from-white to-cyan-50' : 'bg-white'}`}
                >
                  {tier.popular && selectedTier === tier.id && (
                    <div className="absolute top-7 mb-5 left-1/2 -translate-x-1/2 -translate-y-1/2">
                      <div className="bg-gradient-to-r from-cyan-600 to-cyan-600 text-white px-6 py-2 rounded-full text-sm font-bold whitespace-nowrap">
                        MOST POPULAR
                      </div>
                    </div>
                  )}
                  
                  <div className="p-8">
                    <div className="flex items-center justify-between mt-5 mb-6">
                      <h3 className="text-2xl font-bold text-slate-900">{tier.name}</h3>
                      {tier.popular && !(selectedTier === tier.id) && (
                        <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></div>
                      )}
                    </div>
                    
                    <div className="mb-6">
                      <div className="text-5xl font-black text-slate-900 mb-2">{tier.price}</div>
                      {tier.price !== 'Free' && tier.price !== 'Custom' && (
                        <div className="text-slate-500 text-sm">per month</div>
                      )}
                    </div>
                    
                    <p className={`text-sm mb-8 ${tier.popular ? 'text-slate-600' : 'text-slate-500'}`}>
                      {tier.description}
                    </p>
                    
                    <ul className="space-y-4 mb-8">
                      {tier.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-3">
                          {feature.included ? (
                            <Check className="text-cyan-500 flex-shrink-0" size={20} />
                          ) : (
                            <X className="text-slate-400 flex-shrink-0" size={20} />
                          )}
                          <span className={`text-sm ${feature.included ? 'text-slate-700' : 'text-slate-400'}`}>
                            {feature.text}
                          </span>
                        </li>
                      ))}
                    </ul>
                    
                    <button className={`w-full py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
                      selectedTier === tier.id
                        ? 'bg-gradient-to-r from-cyan-600 to-cyan-600 text-white hover:-lg'
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

        {/* Comparison Section */}
        <section className="py-24 bg-gradient-to-b from-slate-50 to-white">
          <div className="max-w-7xl mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold text-slate-900 mb-4">Traditional vs KCEM Comparison</h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                See how our platform transforms waste management economics
              </p>
            </motion.div>

            {/* <div className="mb-8">
              <div className="flex gap-4 justify-center mb-8">
                {Object.keys(comparisons).map((key) => (
                  <button
                    key={key}
                    onClick={() => setActiveComparison(key as keyof typeof comparisons)}
                    className={`px-6 py-3 rounded-xl font-bold transition-all ${
                      activeComparison === key
                        ? 'bg-gradient-to-r from-cyan-600 to-cyan-600 text-white -lg'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {comparisons[key as keyof typeof comparisons].title}
                  </button>
                ))}
              </div>
            </div> */}

            {/* <motion.div
              key={activeComparison}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-white rounded-[2rem] -xl overflow-hidden border border-slate-200"
            >
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-slate-50 to-cyan-50">
                    <tr>
                      <th className="text-left p-6 font-bold text-slate-900">Feature / Metric</th>
                      <th className="text-left p-6 font-bold text-slate-900">Traditional Method</th>
                      <th className="text-left p-6 font-bold text-slate-900">KCEM Platform</th>
                      <th className="text-left p-6 font-bold text-slate-900">Advantage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparisons[activeComparison].rows.map((row, index) => (
                      <tr 
                        key={index} 
                        className={`border-t border-slate-100 ${
                          index % 2 === 0 ? 'bg-slate-50/50' : 'bg-white'
                        }`}
                      >
                        <td className="p-6 font-medium text-slate-900">{row.feature}</td>
                        <td className="p-6">
                          <div className={`inline-flex items-center gap-2 ${
                            row.traditional.includes('✗') ? 'text-slate-500' : 'text-slate-700'
                          }`}>
                            {row.traditional}
                          </div>
                        </td>
                        <td className="p-6">
                          <div className={`inline-flex items-center gap-2 ${
                            row.kcem.includes('✓') ? 'text-cyan-500' : 'text-slate-700'
                          }`}>
                            {row.kcem}
                          </div>
                        </td>
                        <td className="p-6">
                          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-100 to-cyan-100 text-cyan-800 px-4 py-2 rounded-lg font-medium">
                            <TrendingUp size={16} />
                            {row.savings}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div> */}

            {/* Benefits Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              className="mt-12 grid md:grid-cols-3 gap-6"
            >
              <div className="bg-gradient-to-br from-cyan-50 to-cyan-50 p-6 rounded-2xl border border-cyan-200">
                <div className="w-12 h-12 bg-cyan-100 text-cyan-600 rounded-xl flex items-center justify-center mb-4">
                  <DollarSign size={24} />
                </div>
                <h4 className="text-xl font-bold text-slate-900 mb-3">Cost slateuction</h4>
                <p className="text-slate-600">Average 65% slateuction in waste management costs for HORECA businesses</p>
              </div>
              <div className="bg-gradient-to-br from-cyan-50 to-cyan-50 p-6 rounded-2xl border border-cyan-200">
                <div className="w-12 h-12 bg-cyan-100 text-cyan-600 rounded-xl flex items-center justify-center mb-4">
                  <TrendingUp size={24} />
                </div>
                <h4 className="text-xl font-bold text-slate-900 mb-3">Revenue Generation</h4>
                <p className="text-slate-600">New income streams from waste previously treated as disposal expense</p>
              </div>
              <div className="bg-gradient-to-br from-cyan-50 to-indigo-50 p-6 rounded-2xl border border-cyan-200">
                <div className="w-12 h-12 bg-cyan-100 text-cyan-600 rounded-xl flex items-center justify-center mb-4">
                  <Zap size={24} />
                </div>
                <h4 className="text-xl font-bold text-slate-900 mb-3">Operational Efficiency</h4>
                <p className="text-slate-600">40% improvement in collection logistics and route optimization</p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
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
              Ready to Transform Your Waste Management?
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="text-lg text-cyan-100 mb-10 max-w-2xl mx-auto"
            >
              Join 85+ businesses already turning waste into revenue with KCEM
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
              </button>
              <button className="bg-transparent border-2 border-white/30 text-white px-8 py-4 rounded-xl font-bold hover:bg-white/10 transition-all">
                Schedule a Demo
              </button>
            </motion.div>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
};

const RoleCard = ({ role, title, description, icon, features, color, popular }: any) => {
  const colorClasses: any = {
    cyan: { bg: 'from-cyan-500 to-cyan-600', light: 'bg-cyan-50', text: 'text-cyan-600' }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
      className="relative group"
    >
      {popular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <div className="bg-gradient-to-r from-cyan-600 to-cyan-600 text-white px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap -lg">
            MOST IN DEMAND
          </div>
        </div>
      )}
      
      <div className={`bg-white rounded-[2rem] p-8 border border-slate-200 -lg hover:-2xl transition-all h-full ${
        popular ? 'ring-2 ring-cyan-500/20' : ''
      }`}>
        <div className="flex items-center gap-4 mb-6">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center bg-gradient-to-br ${colorClasses[color].bg} text-white`}>
            {icon}
          </div>
          <div>
            <h3 className="text-2xl font-bold text-slate-900">{title}</h3>
            <p className="text-slate-600 text-sm mt-1">{description}</p>
          </div>
        </div>
        
        <div className="space-y-6">
          {features.map((feature: any, index: number) => (
            <div key={index} className="flex items-start gap-4">
              <div className={`w-10 h-10 rounded-xl ${colorClasses[color].light} ${colorClasses[color].text} flex items-center justify-center flex-shrink-0`}>
                {feature.icon}
              </div>
              <div>
                <h4 className="font-bold text-slate-900 mb-1">{feature.title}</h4>
                <p className="text-slate-600 text-sm">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
        
        <button className={`mt-8 w-full py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
          popular
            ? `bg-gradient-to-r ${colorClasses[color].bg} text-white hover:-lg`
            : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
        }`}>
          View {role === 'horeca' ? 'Business' : role === 'recyclers' ? 'Recycler' : 'Driver'} Features
          <ArrowRight size={18} />
        </button>
      </div>
    </motion.div>
  );
};

export default ServicesPage;