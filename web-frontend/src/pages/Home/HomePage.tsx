import { ArrowRight, Recycle, Truck, Wallet, Sparkles,  ChevronRight, Play, Quote, MapPin, CheckCircle, Shield } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../../components/common/Navbar/Navbar';
import Footer from '../../components/common/Footer/Footer';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const HomePage = () => {
  const [animatedStats, setAnimatedStats] = useState({
    tons: 0,
    businesses: 0,
    revenue: 0
  });
  const navigate = useNavigate();

  useEffect(() => {
    const animateCounter = (end: number, setter: (val: number) => void, duration = 2000) => {
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

    animateCounter(10, (val) => setAnimatedStats(prev => ({ ...prev, tons: val })));
    animateCounter(3, (val) => setAnimatedStats(prev => ({ ...prev, businesses: val })), 1500);
    animateCounter(1, (val) => setAnimatedStats(prev => ({ ...prev, revenue: val })), 1800);
  }, []);

  const handleJoinAsBusiness = () => {
    navigate('/register?type=business');
  };

  const handleJoinAsRecycler = () => {
    navigate('/register?type=recycler');
  };

  const handleViewMarketplace = () => {
    navigate('/marketplace');
  };

  const handleContactDemo = () => {
    navigate('/contact?demo=true');
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    const email = (document.getElementById('subscribe-email') as HTMLInputElement)?.value;
    if (email) {
      // In production, this would call your API
      console.log('Subscribed email:', email);
      alert('Thank you for subscribing! You will receive updates shortly.');
      (document.getElementById('subscribe-email') as HTMLInputElement).value = '';
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="pt-16">
        {/* Hero Section with Background Image */}
        <section className="relative py-20 md:py-32 overflow-hidden">
          {/* Background Image */}
          <div className="absolute inset-0">
            <img 
              src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=1920" 
              alt="Kigali Circular Economy Background" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/60"></div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="grid lg:grid-cols-2 gap-12 items-center"
            >
              <div className="text-white">
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                </motion.div>
                
                <motion.h1 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6"
                >
                  EcoTrade{' '}
                  <span className="text-cyan-300">Rwanda</span>
                </motion.h1>
                
                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="text-lg text-gray-200 mb-8 max-w-lg"
                >
                  Connect with verified recyclers, optimize waste collection, and transform your 
                  hospitality waste into sustainable revenue through our smart B2B platform.
                </motion.p>
                
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                  className="flex flex-wrap gap-4"
                >
                  <button
                    onClick={handleJoinAsBusiness}
                    className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-3 sm:px-8 sm:py-4 rounded-lg font-bold flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
                  >
                    Join as Business <ArrowRight size={20} />
                  </button>
                  <button
                    onClick={handleJoinAsRecycler}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 sm:px-8 sm:py-4 rounded-lg font-bold flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
                  >
                    Join as Recycler <ArrowRight size={20} />
                  </button>
                </motion.div>

                {/* Trust Indicators */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.7 }}
                  className="mt-8 flex flex-wrap gap-4"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle size={16} className="text-green-400" />
                    <span className="text-sm text-gray-300">Verified Recyclers</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield size={16} className="text-cyan-400" />
                    <span className="text-sm text-gray-300">Secure Payments</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin size={16} className="text-red-400" />
                    <span className="text-sm text-gray-300">Kigali Wide</span>
                  </div>
                </motion.div>
              </div>
              
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="hidden lg:block"
              >
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
                  <h3 className="text-xl font-bold text-white mb-4">Start Earning Today</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-white">
                      <span>Used Cooking Oil</span>
                      <span className="font-bold">Rwf 800-1,200/L</span>
                    </div>
                    <div className="flex items-center justify-between text-white">
                      <span>Glass Bottles</span>
                      <span className="font-bold">Rwf 150-300/kg</span>
                    </div>
                    <div className="flex items-center justify-between text-white">
                      <span>Paper & Cardboard</span>
                      <span className="font-bold">Rwf 50-150/kg</span>
                    </div>
                  </div>
                  <button
                    onClick={handleViewMarketplace}
                    className="w-full mt-6 bg-white text-cyan-700 hover:bg-gray-100 px-6 py-3 rounded-lg font-bold transition-all"
                  >
                    Browse Marketplace
                  </button>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Stats Ticker */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="bg-gray-900 text-white py-8"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-cyan-400 mb-2">
                  {animatedStats.tons.toLocaleString()}+
                </div>
                <div className="text-sm text-gray-300">Tons Diverted</div>
                <div className="text-xs text-gray-400">from Landfill</div>
              </div>
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-cyan-400 mb-2">
                  {animatedStats.businesses}+
                </div>
                <div className="text-sm text-gray-300">Active Businesses</div>
                <div className="text-xs text-gray-400">HORECA Partners</div>
              </div>
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-cyan-400 mb-2">
                  {animatedStats.revenue}M+
                </div>
                <div className="text-sm text-gray-300">Rwf Generated</div>
                <div className="text-xs text-gray-400">Revenue Created</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* How EcoTrade  Works */}
        <section className="py-16 sm:py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-12 sm:mb-16"
            >
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">How EcoTrade  Works</h2>
              <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
                Four simple steps to transform your waste management and unlock new revenue streams
              </p>
            </motion.div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <WorkStep 
                icon={<Sparkles />} 
                num="01" 
                title="List Waste" 
                desc="Upload details of UCO, Glass, or Paper waste with photos via our mobile app or web dashboard." 
                delay={0.1}
              />
              <WorkStep 
                icon={<Recycle />} 
                num="02" 
                title="Get Offers" 
                desc="Receive competitive bids instantly from verified recyclers based on current market rates." 
                delay={0.2}
              />
              <WorkStep 
                icon={<Truck />} 
                num="03" 
                title="Schedule Pickup" 
                desc="AI-powered geospatial routing optimizes collection schedules for maximum efficiency." 
                delay={0.3}
              />
              <WorkStep 
                icon={<Wallet />} 
                num="04" 
                title="Get Paid" 
                desc="Instant digital payments verified upon collection with transparent transaction history." 
                delay={0.4}
              />
            </div>
          </div>
        </section>

        {/* Featured Materials */}
        <section className="py-16 sm:py-24 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-12 sm:mb-16"
            >
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">Featured Materials</h2>
              <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
                High-value recyclables that generate sustainable revenue
              </p>
            </motion.div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              <MaterialCard 
                title="Used Cooking Oil"
                subtitle="Transforms to Biodiesel"
                price="Rwf 800-1,200 per liter"
                image="https://iamhomesteader.com/wp-content/uploads/2022/05/oil-1.jpg"
                stats={[
                  { label: "Biodiesel Potential", value: "90%" },
                  { label: "Carbon Reduction", value: "85%" }
                ]}
                delay={0.1}
              />
              
              <MaterialCard 
                title="Glass Bottles"
                subtitle="Infinite Recycling Value"
                price="Rwf 150-300 per kg"
                image="https://www.glassonline.com/wp-content/uploads/2021/08/GreenGlass-01.jpg"
                stats={[
                  { label: "Recyclable", value: "100%" },
                  { label: "Energy Saved", value: "30%" }
                ]}
                delay={0.2}
              />
              
              <MaterialCard 
                title="Paper & Cardboard"
                subtitle="Sustainable Packaging"
                price="Rwf 50-150 per kg"
                image="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQeGAzOgMStWD9RTDxw2IzxADu7_vdetnwDaA&s"
                stats={[
                  { label: "Water Saved", value: "60%" },
                  { label: "Trees Saved", value: "17" }
                ]}
                delay={0.3}
              />
            </div>
          </div>
        </section>

        {/* Success Stories */}
        <section className="py-16 sm:py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-12 sm:mb-16"
            >
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">Success Stories</h2>
              <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
                Hear from businesses transforming their waste management
              </p>
            </motion.div>
            
            <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 items-center mb-12 sm:mb-16">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
                className="relative"
              >
                <div className="aspect-video bg-gray-800 rounded-xl sm:rounded-2xl overflow-hidden shadow-lg">
                  <img 
                    src="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=1470" 
                    alt="Hotel interior" 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2">Case Study: Urban Hotel Group</h3>
                      <p className="text-gray-200">Reduced waste costs by 65% and generated Rwf 2.4M in revenue</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => window.open('https://youtu.be/yTQ-yQlR5ss', '_blank')}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/90 rounded-full flex items-center justify-center hover:scale-110 transition-transform">
                      <Play size={24} className="text-cyan-600 ml-1" fill="currentColor" />
                    </div>
                  </button>
                </div>
              </motion.div>
              
              <div className="space-y-6">
                <Testimonial 
                  quote="EcoTrade  transformed our waste from an expense to a revenue stream. We're now earning Rwf 400,000 monthly from waste we used to pay to dispose."
                  author="Marie Uwase"
                  role="Operations Manager, Kigali Grand Hotel"
                  avatar=""
                />
                
                <Testimonial 
                  quote="The geospatial routing cut our collection costs by 40%. We're collecting from more businesses while using less fuel."
                  author="James Mugisha"
                  role="Owner, Green Cycle Recyclers"
                  avatar=""
                />
              </div>
            </div>
            
            {/* Metrics showcase */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
              className="grid grid-cols-1 sm:grid-cols-3 gap-6 bg-gray-50 p-6 sm:p-8 rounded-xl sm:rounded-2xl"
            >
              <div className="text-center p-4 sm:p-6">
                <div className="text-3xl sm:text-4xl font-bold text-cyan-600 mb-2">65%</div>
                <p className="text-gray-700 font-medium">Reduction in Waste Disposal Costs</p>
                <p className="text-sm text-gray-500 mt-1">Average across pilot businesses</p>
              </div>
              <div className="text-center p-4 sm:p-6">
                <div className="text-3xl sm:text-4xl font-bold text-cyan-600 mb-2">40%</div>
                <p className="text-gray-700 font-medium">Logistics Efficiency Gain</p>
                <p className="text-sm text-gray-500 mt-1">Optimized route planning</p>
              </div>
              <div className="text-center p-4 sm:p-6">
                <div className="text-3xl sm:text-4xl font-bold text-cyan-600 mb-2">Rwf 1M</div>
                <p className="text-gray-700 font-medium">Revenue Generated</p>
                <p className="text-sm text-gray-500 mt-1">In first 1 months of operation</p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
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
      </div>
      <Footer />
    </div>
  );
};

const WorkStep = ({ icon, num, title, desc, delay = 0 }: any) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      viewport={{ once: true }}
      className="relative p-6 bg-white border border-gray-200 rounded-xl hover:border-cyan-300 hover:shadow-lg transition-all group"
    >
      <span className="absolute top-4 right-4 text-3xl font-black text-gray-100 group-hover:text-gray-200 transition-colors font-mono">{num}</span>
      
      <div className="w-12 h-12 bg-cyan-600 rounded-lg flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      
      <h3 className="text-lg sm:text-xl font-bold mb-2 text-gray-900">{title}</h3>
      <p className="text-gray-600 text-sm leading-relaxed">{desc}</p>
    </motion.div>
  );
};

const MaterialCard = ({ title, subtitle, price, image, stats, delay }: any) => {
  const navigate = useNavigate();

  const handleViewDetails = () => {
    navigate(`/marketplace?material=${title.toLowerCase().replace(/ /g, '-')}`);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      viewport={{ once: true }}
      className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow"
    >
      <div className="relative h-48 overflow-hidden">
        <img 
          src={image} 
          alt={title} 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
        <div className="absolute top-4 right-4 px-3 py-1 bg-cyan-600 text-white rounded-full text-sm font-bold">
          {price}
        </div>
      </div>
      
      <div className="p-4 sm:p-6">
        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1">{title}</h3>
        <p className="text-gray-500 mb-4">{subtitle}</p>
        
        <div className="grid grid-cols-2 gap-3 mb-6">
          {stats.map((stat: any, index: number) => (
            <div key={index} className="bg-gray-50 rounded-lg p-3 text-center">
              <div className="text-base sm:text-lg font-bold text-gray-900">{stat.value}</div>
              <div className="text-xs text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>
        
        <button 
          onClick={handleViewDetails}
          className="w-full py-3 bg-gray-100 text-gray-700 rounded-lg font-bold hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
        >
          View Market Details
          <ChevronRight size={16} />
        </button>
      </div>
    </motion.div>
  );
};

const Testimonial = ({ quote, author, role, avatar }: any) => (
  <motion.div 
    initial={{ opacity: 0, x: 20 }}
    whileInView={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.6 }}
    viewport={{ once: true }}
    className="bg-white p-6 rounded-xl shadow-md border border-gray-200"
  >
    <Quote size={24} className="text-cyan-300 mb-4" />
    <p className="text-gray-700 text-base mb-4">{quote}</p>
    <div className="flex items-center gap-3">
      <img 
        src={avatar} 
        alt={author} 
        className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover"
      />
      <div>
        <div className="font-bold text-gray-900">{author}</div>
        <div className="text-sm text-gray-500">{role}</div>
      </div>
    </div>
  </motion.div>
);

export default HomePage;