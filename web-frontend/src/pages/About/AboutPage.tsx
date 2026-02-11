import { Target, Users, BarChart3, Globe2, Recycle, MapPin, Shield, TrendingUp, ArrowRight, Building, Leaf, Database, Cpu, Mail } from 'lucide-react';
import Navbar from '../../components/common/Navbar/Navbar';
import Footer from '../../components/common/Footer/Footer';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AboutPage = () => {
  const [impactStats, setImpactStats] = useState({
    co2Reduction: 0,
    landfillDiversion: 0,
    economicGain: 0,
    businessesServed: 0,
    wasteDiverted: 0,
    revenueGenerated: 0
  });
  const navigate = useNavigate();

  useEffect(() => {
    const targets = {
      co2Reduction: 450,
      landfillDiversion: 82,
      economicGain: 30,
      businessesServed: 3,
      wasteDiverted: 1,
      revenueGenerated: 2.4
    };

    const animateCounter = (end: number, setter: (val: number) => void, duration = 1500) => {
      let start = 0;
      const increment = end / (duration / 16);
      const timer = setInterval(() => {
        start += increment;
        if (start >= end) {
          setter(end);
          clearInterval(timer);
        } else {
          setter(Math.floor(start));
        }
      }, 16);
    };

    animateCounter(targets.co2Reduction, (val) => setImpactStats(prev => ({ ...prev, co2Reduction: val })), 2000);
    animateCounter(targets.landfillDiversion, (val) => setImpactStats(prev => ({ ...prev, landfillDiversion: val })), 1800);
    animateCounter(targets.economicGain, (val) => setImpactStats(prev => ({ ...prev, economicGain: val })), 1600);
    animateCounter(targets.businessesServed, (val) => setImpactStats(prev => ({ ...prev, businessesServed: val })), 1400);
    animateCounter(targets.wasteDiverted, (val) => setImpactStats(prev => ({ ...prev, wasteDiverted: val })), 2200);
    animateCounter(targets.revenueGenerated, (val) => setImpactStats(prev => ({ ...prev, revenueGenerated: val })), 2400);
  }, []);

  const partners = [
    { name: "African Leadership University", logo: "ALU", description: "Academic Partner & Research Hub" },
    { name: "Rwanda Environment Management Authority", logo: "REMA", description: "Government Regulatory Partner" },
    { name: "Global Green Growth Institute", logo: "GGGI", description: "Sustainability Strategy Partner" },
    { name: "Kigali Innovation City", logo: "KIC", description: "Ecosystem Development Partner" },
    { name: "COPED Group", logo: "COPED", description: "Waste Management Industry Partner" },
    { name: "Rwanda Development Board", logo: "RDB", description: "Economic Development Partner" }
  ];

  const team = [
    {
      name: "Daniel Iryivuze",
      role: "Project Lead & Software Engineer",
      bio: "BSc. Software Engineering graduate specializing in circular economy solutions and geospatial systems.",
      contribution: "System Architecture & Development",
      initials: "DI"
    }
  ];

  const problems = [
    {
      icon: <Building />,
      title: "Pay-to-Dump Paradox",
      description: "Businesses pay to discard valuable materials while recyclers struggle to source raw materials.",
      stats: "98% of recyclables end up in landfills"
    },
    {
      icon: <MapPin />,
      title: "Logistical Inefficiency",
      description: "Fragmented collection routes and lack of optimization increase costs by 40-60%.",
      stats: "35% higher transport costs"
    },
    {
      icon: <Shield />,
      title: "Data Opacity",
      description: "No transparency in waste value chains, leading to market failures and greenwashing risks.",
      stats: "Zero impact verification"
    },
    {
      icon: <Leaf />,
      title: "Environmental Impact",
      description: "Linear waste models contribute significantly to carbon emissions and landfill saturation.",
      stats: "516M tons/year by 2050 in SSA"
    }
  ];

  const solutions = [
    {
      icon: <Cpu />,
      title: "B2B Marketplace Model",
      description: "Digital platform connecting waste generators with verified recyclers in real-time.",
      features: ["Real-time bidding", "Price transparency", "Direct transactions"]
    },
    {
      icon: <Database />,
      title: "Offline-First Architecture",
      description: "Mobile-first design ensuring functionality in low-connectivity urban environments.",
      features: ["Offline data sync", "Real-time updates", "GPS tracking"]
    },
    {
      icon: <MapPin />,
      title: "Geospatial Optimization",
      description: "AI-powered routing algorithms that cluster collections to minimize transport costs.",
      features: ["Route optimization", "Load balancing", "ETA prediction"]
    }
  ];

  const handleContactPartnership = () => {
    navigate('/contact?type=partnership');
  };

  const handleViewServices = () => {
    navigate('/services');
  };

  const handleViewMarketplace = () => {
    navigate('/marketplace');
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="pt-20">
        {/* Hero Section */}
        <section className="relative py-12 md:py-20 lg:py-24 overflow-hidden">
          <div className="absolute inset-0 bg-gray-900">
            <img 
              src="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=1920" 
              alt="Kigali City" 
              className="w-full h-full object-cover opacity-40"
            />
          </div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center text-white"
            >
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 leading-tight">
                Digitizing Kigali's<br />
                <span className="text-cyan-300">Reverse Logistics</span>
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-gray-200 max-w-3xl mx-auto mb-6 sm:mb-8">
                Transforming the HORECA sector's waste management through a data-driven B2B marketplace
              </p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="inline-flex flex-col sm:flex-row items-center gap-4"
              >
                <button
                  onClick={handleViewServices}
                  className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  View Our Services
                </button>
                <button
                  onClick={handleViewMarketplace}
                  className="bg-white/10 backdrop-blur-sm border border-white/30 text-white px-6 py-3 rounded-lg font-medium hover:bg-white/20 transition-colors"
                >
                  Browse Marketplace
                </button>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Mission & Vision Section */}
        <section className="py-12 md:py-20 lg:py-24 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <div className="inline-flex items-center gap-2 bg-cyan-100 text-cyan-700 px-3 py-1.5 rounded-full text-sm font-medium mb-4">
                  <Target size={16} />
                  Our Purpose
                </div>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 lg:mb-6">Solving the Waste Value Chain Crisis</h2>
                <p className="text-gray-600 leading-relaxed mb-6">
                  EcoTrade addresses the fundamental disconnect in Kigali's HORECA sector where valuable recyclables 
                  are treated as disposal liabilities. Our platform transforms this linear model into a circular 
                  economy where waste becomes revenue and environmental responsibility becomes profitable.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 sm:p-6 bg-white rounded-xl border border-gray-200">
                    <div className="text-cyan-600 font-bold mb-2">Vision</div>
                    <p className="text-sm text-gray-600">A zero-waste urban economy where every resource circulates at maximum value</p>
                  </div>
                  <div className="p-4 sm:p-6 bg-white rounded-xl border border-gray-200">
                    <div className="text-cyan-600 font-bold mb-2">Mission</div>
                    <p className="text-sm text-gray-600">Digitize reverse logistics through B2B geospatial optimization</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="bg-white rounded-xl sm:rounded-2xl overflow-hidden border border-gray-200"
              >
                <div className="p-6 sm:p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-cyan-600 rounded-lg sm:rounded-xl flex items-center justify-center">
                      <Users size={24} className="text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">The Leadership</h3>
                      <p className="text-cyan-600 text-sm">Driving Innovation in Circular Economy</p>
                    </div>
                  </div>
                  <blockquote className="text-gray-600 italic mb-6 border-l-4 border-cyan-500 pl-4 py-1">
                    "Our goal is to turn environmental responsibility into a profitable business model for every hotel and restaurant in Kigali."
                  </blockquote>
                  <div className="space-y-4">
                    {team.map((member, index) => (
                      <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                        <div className="w-12 h-12 bg-cyan-600 rounded-full flex items-center justify-center font-bold text-white">
                          {member.initials}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{member.name}</p>
                          <p className="text-sm text-gray-600">{member.role}</p>
                          <p className="text-xs text-gray-500 mt-1">{member.contribution}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Problem We Solve Section */}
        <section className="py-12 md:py-20 lg:py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-8 lg:mb-16"
            >
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 lg:mb-4">The Pay-to-Dump Paradox</h2>
              <p className="text-gray-600 max-w-3xl mx-auto">
                Understanding the systemic inefficiencies in Kigali's HORECA waste management
              </p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 lg:mb-16">
              {problems.map((problem, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-white p-4 sm:p-6 rounded-xl border border-gray-200 hover:border-cyan-300 transition-colors"
                >
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-cyan-100 text-cyan-600 rounded-lg flex items-center justify-center mb-4">
                    {problem.icon}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{problem.title}</h3>
                  <p className="text-gray-600 text-sm mb-3">{problem.description}</p>
                  <div className="px-3 py-1.5 bg-gray-100 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">{problem.stats}</span>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Statistics Showcase */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
              className="bg-gray-50 p-6 sm:p-8 rounded-xl sm:rounded-2xl border border-gray-200"
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
                <div className="text-center">
                  <div className="text-3xl sm:text-4xl font-bold text-cyan-600 mb-2">2%</div>
                  <p className="font-medium text-gray-700">Recycling Rate in Kigali</p>
                  <p className="text-sm text-gray-500">Non-organic waste recovery</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl sm:text-4xl font-bold text-cyan-600 mb-2">800-1000</div>
                  <p className="font-medium text-gray-700">Tons of Waste Daily</p>
                  <p className="text-sm text-gray-500">Kigali's current waste generation</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl sm:text-4xl font-bold text-cyan-600 mb-2">516M</div>
                  <p className="font-medium text-gray-700">Tons by 2050</p>
                  <p className="text-sm text-gray-500">Projected waste in Sub-Saharan Africa</p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Our Solution Section */}
        <section className="py-12 md:py-20 lg:py-24 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-8 lg:mb-16"
            >
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 lg:mb-4">Our Technical Solution</h2>
              <p className="text-gray-600 max-w-3xl mx-auto">
                A three-pillar approach to revolutionizing reverse logistics
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mb-8 lg:mb-16">
              {solutions.map((solution, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow"
                >
                  <div className="w-14 h-14 bg-cyan-600 text-white rounded-xl flex items-center justify-center mb-4">
                    {solution.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{solution.title}</h3>
                  <p className="text-gray-600 mb-4">{solution.description}</p>
                  <div className="space-y-2">
                    {solution.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-cyan-500"></div>
                        <span className="text-sm text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Call to Action */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <button
                onClick={handleContactPartnership}
                className="inline-flex items-center gap-2 bg-cyan-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-cyan-700 transition-colors"
              >
                <Mail size={18} />
                Contact Partnership Team
              </button>
            </motion.div>
          </div>
        </section>

        {/* Impact Metrics Section */}
        <section className="py-12 md:py-20 lg:py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-8 lg:mb-16"
            >
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 lg:mb-4">Measurable Impact</h2>
              <p className="text-gray-600 max-w-3xl mx-auto">
                Real-time tracking of our circular economy contributions
              </p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 lg:mb-16">
              <ImpactCard 
                icon={<Globe2 />} 
                label="CO2 Reduction" 
                value={`~${impactStats.co2Reduction}kg`} 
                sub="Per business / month" 
                description="Equivalent to planting 5 trees monthly"
              />
              <ImpactCard 
                icon={<BarChart3 />} 
                label="Landfill Diversion" 
                value={`${impactStats.landfillDiversion}%`} 
                sub="Total waste recovered" 
                description="From landfill to recycling"
              />
              <ImpactCard 
                icon={<TrendingUp />} 
                label="Economic Gain" 
                value={`${impactStats.economicGain}%`} 
                sub="Avg. savings for HORECA" 
                description="Reduction in waste management costs"
              />
            </div>

            {/* Additional Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              className="bg-gray-50 p-6 sm:p-8 rounded-xl sm:rounded-2xl border border-gray-200"
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
                <div className="text-center">
                  <div className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">{impactStats.businessesServed}+</div>
                  <p className="font-medium text-gray-700">Active Businesses</p>
                  <p className="text-sm text-gray-500">Hotels, Restaurants & Cafés</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">{impactStats.wasteDiverted}+</div>
                  <p className="font-medium text-gray-700">Tons Diverted</p>
                  <p className="text-sm text-gray-500">From landfill to recycling</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">{impactStats.revenueGenerated}M+</div>
                  <p className="font-medium text-gray-700">RWF Generated</p>
                  <p className="text-sm text-gray-500">New revenue streams created</p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Partners & Supporters Section */}
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
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-cyan-600 rounded-lg flex items-center justify-center text-white font-bold">
                      {partner.logo}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">{partner.name}</h4>
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
      </div>
      <Footer />
    </div>
  );
};

const ImpactCard = ({ icon, label, value, sub, description }: any) => {
  return (
    <div className="text-center p-6 bg-white border border-gray-200 rounded-xl hover:shadow-lg transition-shadow">
      <div className="inline-flex p-3 bg-cyan-600 text-white rounded-lg mb-4">
        {icon}
      </div>
      <h4 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">{value}</h4>
      <p className="font-bold text-gray-700 uppercase text-sm tracking-wider mb-1">{label}</p>
      <p className="text-gray-500 text-sm mb-2">{sub}</p>
      <p className="text-xs text-gray-400">{description}</p>
    </div>
  );
};

export default AboutPage;