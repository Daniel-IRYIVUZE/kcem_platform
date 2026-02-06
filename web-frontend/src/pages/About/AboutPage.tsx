import { Target, Users, BarChart3, Globe2, Recycle, MapPin, Shield, TrendingUp, ArrowRight, Building, Leaf, Database, Cpu } from 'lucide-react';
import Navbar from '../../components/common/Navbar/Navbar';
import Footer from '../../components/common/Footer/Footer';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

const AboutPage = () => {
  const [impactStats, setImpactStats] = useState({
    co2slateuction: 0,
    landfillDiversion: 0,
    economicGain: 0,
    businessesServed: 0,
    wasteDiverted: 0,
    revenueGenerated: 0
  });

  useEffect(() => {
    const targets = {
      co2slateuction: 450,
      landfillDiversion: 82,
      economicGain: 30,
      businessesServed: 85,
      wasteDiverted: 1200,
      revenueGenerated: 12
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

    // Animate all counters
    animateCounter(targets.co2slateuction, (val) => setImpactStats(prev => ({ ...prev, co2slateuction: val })), 2000);
    animateCounter(targets.landfillDiversion, (val) => setImpactStats(prev => ({ ...prev, landfillDiversion: val })), 1800);
    animateCounter(targets.economicGain, (val) => setImpactStats(prev => ({ ...prev, economicGain: val })), 1600);
    animateCounter(targets.businessesServed, (val) => setImpactStats(prev => ({ ...prev, businessesServed: val })), 1400);
    animateCounter(targets.wasteDiverted, (val) => setImpactStats(prev => ({ ...prev, wasteDiverted: val })), 2200);
    animateCounter(targets.revenueGenerated, (val) => setImpactStats(prev => ({ ...prev, revenueGenerated: val })), 2400);
  }, []);

  const partners = [
    { name: "African Leadership University", logo: "ALU", description: "Academic Partner & Research Hub" },
    { name: "Rwanda Environment Management Authority", logo: "REMA", description: "Government Regulatory Partner" },
    { name: "Global cyan Growth Institute", logo: "GGGI", description: "Sustainability Strategy Partner" },
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
    // ,
    // {
    //   name: "Neza David Tuyishimire",
    //   role: "Academic Supervisor",
    //   bio: "Expert in sustainable technology and innovation management, providing strategic guidance and academic oversight.",
    //   contribution: "Research Methodology & Validation",
    //   initials: "NT"
    // }
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
      description: "No transparency in waste value chains, leading to market failures and cyanwashing risks.",
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
      description: "AI-poweslate routing algorithms that cluster collections to minimize transport costs.",
      features: ["Route optimization", "Load balancing", "ETA pslateiction"]
    }
  ];

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
                Digitizing Kigali's<br />
                <span className="text-cyan-300">Reverse Logistics</span>
              </h1>
              <p className="text-xl text-cyan-100 max-w-3xl mx-auto mb-12">
                Transforming the HORECA sector's waste management through a data-driven B2B marketplace
              </p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full border border-white/20"
              >
                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></div>
                <span className="text-sm">Live Pilot: Nyarugenge & Gasabo Districts</span>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Mission & Vision Section */}
        <section className="py-24 bg-gradient-to-b from-white to-cyan-50/30">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <div className="inline-flex items-center gap-2 bg-cyan-100 text-cyan-700 px-4 py-2 rounded-full text-sm font-semibold mb-6">
                  <Target size={16} />
                  Our Purpose
                </div>
                <h2 className="text-4xl font-bold text-slate-900 mb-6">Solving the Waste Value Chain Crisis</h2>
                <p className="text-lg text-slate-600 leading-relaxed mb-8">
                  KCEM addresses the fundamental disconnect in Kigali's HORECA sector where valuable recyclables 
                  are treated as disposal liabilities. Our platform transforms this linear model into a circular 
                  economy where waste becomes revenue and environmental responsibility becomes profitable.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-6 bg-white rounded-2xl border border-cyan-100 -sm hover:-md transition-">
                    <div className="text-cyan-600 font-bold mb-2">Vision</div>
                    <p className="text-sm text-slate-600">A zero-waste urban economy where every resource circulates at maximum value</p>
                  </div>
                  <div className="p-6 bg-white rounded-2xl border border-cyan-100 -sm hover:-md transition-">
                    <div className="text-cyan-600 font-bold mb-2">Mission</div>
                    <p className="text-sm text-slate-600">Digitize reverse logistics through B2B geospatial optimization</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="relative group"
              >
                <div className="absolute -inset-4 bg-gradient-to-r from-cyan-400/20 to-cyan-400/20 rounded-[3rem] blur-2xl group-hover:blur-3xl transition-all duration-500"></div>
                <div className="relative bg-gradient-to-br from-cyan-900 to-cyan-900 p-8 rounded-[2.5rem] text-white -2xl">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-14 h-14 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-2xl flex items-center justify-center">
                      <Users size={28} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold">The Leadership</h3>
                      <p className="text-cyan-300 text-sm">Driving Innovation in Circular Economy</p>
                    </div>
                  </div>
                  <blockquote className="text-lg italic text-cyan-100 mb-8 leading-relaxed border-l-4 border-cyan-500 pl-6">
                    "Our goal is to turn environmental responsibility into a profitable business model for every hotel and restaurant in Kigali."
                  </blockquote>
                  <div className="space-y-6">
                    {team.map((member, index) => (
                      <div key={index} className="flex items-center gap-4 p-4 bg-white/10 rounded-2xl backdrop-blur-sm">
                        <div className="w-14 h-14 bg-gradient-to-br from-cyan-600 to-cyan-600 rounded-full flex items-center justify-center font-bold text-white text-lg">
                          {member.initials}
                        </div>
                        <div className="flex-1">
                          <p className="font-bold">{member.name}</p>
                          <p className="text-sm text-cyan-300">{member.role}</p>
                          <p className="text-xs text-cyan-200 mt-1">{member.contribution}</p>
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
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold text-slate-900 mb-4">The Pay-to-Dump Paradox</h2>
              <p className="text-lg text-slate-600 max-w-3xl mx-auto">
                Understanding the systemic inefficiencies in Kigali's HORECA waste management
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
              {problems.map((problem, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-gradient-to-b from-slate-50 to-white p-6 rounded-3xl border border-slate-200 hover:border-cyan-300 hover:-xl transition-all group"
                >
                  <div className="w-12 h-12 bg-cyan-100 text-cyan-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    {problem.icon}
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{problem.title}</h3>
                  <p className="text-slate-600 text-sm mb-4">{problem.description}</p>
                  <div className="px-3 py-2 bg-slate-100 rounded-lg inline-block">
                    <span className="text-sm font-bold text-slate-700">{problem.stats}</span>
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
              className="bg-gradient-to-r from-cyan-50 to-cyan-50 p-8 rounded-3xl border border-cyan-100"
            >
              <div className="grid md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="text-4xl font-bold text-cyan-600 mb-2">2%</div>
                  <p className="font-medium text-slate-700">Recycling Rate in Kigali</p>
                  <p className="text-sm text-slate-500">Non-organic waste recovery (GGGI, 2022)</p>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-cyan-600 mb-2">800-1000</div>
                  <p className="font-medium text-slate-700">Tons of Waste Daily</p>
                  <p className="text-sm text-slate-500">Kigali's current waste generation (REMA, 2023)</p>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-cyan-600 mb-2">516M</div>
                  <p className="font-medium text-slate-700">Tons by 2050</p>
                  <p className="text-sm text-slate-500">Projected waste in Sub-Saharan Africa</p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Our Solution Section */}
        <section className="py-24 bg-gradient-to-b from-white to-slate-50">
          <div className="max-w-7xl mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold text-slate-900 mb-4">Our Technical Solution</h2>
              <p className="text-lg text-slate-600 max-w-3xl mx-auto">
                A three-pillar approach to revolutionizing reverse logistics
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8 mb-16">
              {solutions.map((solution, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="relative group"
                >
                  <div className="absolute -inset-4 bg-gradient-to-br from-cyan-400/10 to-cyan-400/10 rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative bg-white p-8 rounded-[2rem] border border-slate-200 -lg hover:-2xl transition-all h-full">
                    <div className="w-16 h-16 bg-gradient-to-br from-cyan-600 to-cyan-600 text-white rounded-2xl flex items-center justify-center mb-6">
                      {solution.icon}
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-4">{solution.title}</h3>
                    <p className="text-slate-600 mb-6">{solution.description}</p>
                    <div className="space-y-3">
                      {solution.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-cyan-500"></div>
                          <span className="text-sm text-slate-700">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Technology Stack
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              className="bg-gradient-to-r from-cyan-900 to-cyan-900 p-8 rounded-3xl text-white"
            >
              <h3 className="text-2xl font-bold mb-6 text-center">Technology Stack</h3>
              <div className="grid md:grid-cols-4 gap-6">
                {['Flutter', 'React', 'PostGIS', 'FastAPI'].map((tech, index) => (
                  <div key={index} className="text-center">
                    <div className="text-3xl font-bold mb-2">{tech}</div>
                    <div className="text-sm text-cyan-300">
                      {tech === 'Flutter' && 'Mobile Development'}
                      {tech === 'React' && 'Web Dashboard'}
                      {tech === 'PostGIS' && 'Geospatial Database'}
                      {tech === 'FastAPI' && 'Backend API'}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div> */}
          </div>
        </section>

        {/* Impact Metrics Section */}
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold text-slate-900 mb-4">Measurable Impact</h2>
              <p className="text-lg text-slate-600 max-w-3xl mx-auto">
                Real-time tracking of our circular economy contributions
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
              <ImpactCard 
                icon={<Globe2 />} 
                label="CO2 slateuction" 
                value={`~${impactStats.co2slateuction}kg`} 
                sub="Per business / month" 
                description="Equivalent to planting 5 trees monthly"
                color="cyan"
              />
              <ImpactCard 
                icon={<BarChart3 />} 
                label="Landfill Diversion" 
                value={`${impactStats.landfillDiversion}%`} 
                sub="Total waste recoveslate" 
                description="From Nduba landfill to recycling"
                color="cyan"
              />
              <ImpactCard 
                icon={<TrendingUp />} 
                label="Economic Gain" 
                value={`${impactStats.economicGain}%`} 
                sub="Avg. savings for HORECA" 
                description="slateuction in waste management costs"
                color="amber"
              />
            </div>

            {/* Additional Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              className="bg-gradient-to-b from-slate-50 to-white p-8 rounded-3xl border border-slate-200"
            >
              <div className="grid md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="text-5xl font-bold text-slate-900 mb-2">{impactStats.businessesServed}+</div>
                  <p className="font-medium text-slate-700">Active Businesses</p>
                  <p className="text-sm text-slate-500">Hotels, Restaurants & Cafés</p>
                </div>
                <div className="text-center">
                  <div className="text-5xl font-bold text-slate-900 mb-2">{impactStats.wasteDiverted}+</div>
                  <p className="font-medium text-slate-700">Tons Diverted</p>
                  <p className="text-sm text-slate-500">From landfill to recycling</p>
                </div>
                <div className="text-center">
                  <div className="text-5xl font-bold text-slate-900 mb-2">{impactStats.revenueGenerated}M+</div>
                  <p className="font-medium text-slate-700">RWF Generated</p>
                  <p className="text-sm text-slate-500">New revenue streams created</p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Partners & Supporters Section */}
        <section className="py-24 bg-gradient-to-b from-slate-50 to-white">
          <div className="max-w-7xl mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold text-slate-900 mb-4">Partners & Supporters</h2>
              <p className="text-lg text-slate-600 max-w-3xl mx-auto">
                Collaborating to build Kigali's circular economy ecosystem
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {partners.map((partner, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-cyan-300 hover:-lg transition-all group"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-cyan-500 rounded-xl flex items-center justify-center text-white font-bold">
                      {partner.logo}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">{partner.name}</h4>
                      <p className="text-sm text-slate-500">{partner.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">Official Partner</span>
                    <ArrowRight size={16} className="text-cyan-500 group-hover:translate-x-1 transition-transform" />
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
              <div className="inline-flex items-center gap-2 bg-cyan-50 text-cyan-700 px-6 py-3 rounded-full">
                <Recycle size={18} />
                <span className="font-medium">Become a Partner</span>
              </div>
              <p className="text-slate-600 mt-4">Join us in building sustainable waste management solutions</p>
              <button className="mt-6 bg-cyan-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-cyan-700 transition-all inline-flex items-center gap-2">
                Contact Partnership Team <ArrowRight size={18} />
              </button>
            </motion.div>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
};

const ImpactCard = ({ icon, label, value, sub, description, color }: any) => {
  const colorClasses: any = {
    cyan: "from-cyan-500 to-cyan-600",
    amber: "from-amber-500 to-amber-600"
  };

  return (
    <div className="text-center p-8 bg-white border border-slate-200 rounded-[2rem] hover:-xl transition-all hover:-translate-y-1">
      <div className={`inline-flex p-4 bg-gradient-to-br ${colorClasses[color]} text-white rounded-2xl mb-6`}>
        {icon}
      </div>
      <h4 className="text-5xl font-black text-slate-900 mb-2">{value}</h4>
      <p className="font-bold text-slate-700 uppercase text-sm tracking-wider mb-2">{label}</p>
      <p className="text-slate-500 text-sm mb-3">{sub}</p>
      <p className="text-xs text-slate-400">{description}</p>
    </div>
  );
};

export default AboutPage;