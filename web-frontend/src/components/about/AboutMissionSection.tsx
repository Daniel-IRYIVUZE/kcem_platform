import { Target, Users, Building, MapPin, Shield, Leaf, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const AboutMissionSection = () => {
  const navigate = useNavigate();

  const handleContactPartnership = () => {
    navigate('/contact?type=partnership');
  };

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
      icon: "💻",
      title: "B2B Marketplace Model",
      description: "Digital platform connecting waste generators with verified recyclers in real-time.",
      features: ["Real-time bidding", "Price transparency", "Direct transactions"]
    },
    {
      icon: "📱",
      title: "Offline-First Architecture",
      description: "Mobile-first design ensuring functionality in low-connectivity urban environments.",
      features: ["Offline data sync", "Real-time updates", "GPS tracking"]
    },
    {
      icon: "🗺️",
      title: "Geospatial Optimization",
      description: "AI-powered routing algorithms that cluster collections to minimize transport costs.",
      features: ["Route optimization", "Load balancing", "ETA prediction"]
    }
  ];

  return (
    <>
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
                <div className="text-4xl mb-4">{solution.icon}</div>
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
    </>
  );
};

export default AboutMissionSection;
