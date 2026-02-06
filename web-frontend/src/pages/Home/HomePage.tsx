import { ArrowRight, Recycle, Truck, Wallet, Sparkles, Star, TrendingUp, Users, DollarSign, ChevronRight, Play, Quote } from 'lucide-react';
import { Link } from 'react-router-dom';
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

    animateCounter(1200, (val) => setAnimatedStats(prev => ({ ...prev, tons: val })));
    animateCounter(85, (val) => setAnimatedStats(prev => ({ ...prev, businesses: val })), 1500);
    animateCounter(12, (val) => setAnimatedStats(prev => ({ ...prev, revenue: val })), 1800);
  }, []);

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-2">
        {/* Hero Section with Animated Background */}
        <section className="relative py-24 overflow-hidden bg-gradient-to-br from-cyan-50 via-white to-cyan-50">
          {/* Animated background elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-20 left-10 w-72 h-72 bg-cyan-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
            <div className="absolute top-40 right-20 w-72 h-72 bg-cyan-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-8 left-1/3 w-72 h-72 bg-cyan-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
          </div>

          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="grid lg:grid-cols-2 gap-12 items-center"
            >
              <div>
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <div className="inline-flex items-center gap-2 bg-cyan-100 text-cyan-700 px-4 py-2 rounded-full text-sm font-semibold mb-6">
                    <TrendingUp size={16} />
                    Transforming HORECA Waste into Revenue
                  </div>
                </motion.div>
                
                <motion.h1 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="text-5xl lg:text-7xl font-extrabold text-slate-900 leading-[1.1] mb-6"
                >
                  Kigali Circular{' '}
                  <span className="relative">
                    <span className="text-cyan-600">Economy</span>
                    <span className="absolute -bottom-2 left-0 w-full h-2 bg-cyan-200/50 -z-10 rounded-full"></span>
                  </span>{' '}
                  Marketplace
                </motion.h1>
                
                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="text-lg text-slate-600 mb-10 max-w-lg"
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
                  <Link 
                    to="/register?type=business" 
                    className="bg-cyan-600 text-white px-8 py-4 rounded-xl font-bold flex items-center gap-2 hover:bg-cyan-700 transition-all -lg -cyan-200 hover:-xl hover:-cyan-300 hover:-translate-y-0.5"
                  >
                    Join as Business <ArrowRight size={20} />
                  </Link>
                  <Link 
                    to="/register?type=recycler" 
                    className="bg-cyan-600 text-white px-8 py-4 rounded-xl font-bold flex items-center gap-2 hover:bg-cyan-700 transition-all -lg -cyan-200 hover:-xl hover:-cyan-300 hover:-translate-y-0.5"
                  >
                    Join as Recycler <ArrowRight size={20} />
                  </Link>
                </motion.div>
              </div>
              
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="relative"
              >
                <div className="relative aspect-square bg-gradient-to-br from-cyan-600 to-cyan-600 rounded-[2.5rem] rotate-3 overflow-hidden -2xl group">
                  <img 
                    src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=1473" 
                    alt="Hotel recycling" 
                    className="w-full h-full object-cover opacity-90 mix-blend-overlay -rotate-3 scale-110 group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-tr from-cyan-600/30 to-cyan-600/20"></div>
                  
                  {/* Floating stats card */}
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.8 }}
                    className="absolute -bottom-6 -left-6 bg-white p-6 rounded-2xl -2xl flex items-center gap-4 backdrop-blur-sm bg-white/95"
                  >
                    <div className="w-14 h-14 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl flex items-center justify-center text-white">
                      <Star fill="white" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-lg">98%</p>
                      <p className="text-sm text-slate-500">Diversion Rate</p>
                      <p className="text-xs text-slate-400">Across Pilot Hotels</p>
                    </div>
                  </motion.div>
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
          className="relative bg-gradient-to-r from-cyan-900 via-cyan-900 to-cyan-900 text-white py-8 overflow-hidden"
        >
          {/* Animated background */}
          <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:20px_20px]"></div>
          
          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6 md:gap-0">
              <div className="text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                  <div className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse"></div>
                  <span className="text-sm font-semibold tracking-widest uppercase text-cyan-200">Live Impact Metrics</span>
                </div>
                <p className="text-cyan-100 text-sm">Real-time tracking of circular economy impact</p>
              </div>
              
              <div className="flex flex-col md:flex-row items-center gap-8 md:gap-16">
                <StatItem 
                  icon={<TrendingUp size={20} />} 
                  value={`${animatedStats.tons.toLocaleString()}+`} 
                  label="Tons Diverted" 
                  suffix="from Landfill"
                />
                <div className="hidden md:block w-px h-12 bg-gradient-to-b from-transparent via-cyan-400 to-transparent"></div>
                <StatItem 
                  icon={<Users size={20} />} 
                  value={`${animatedStats.businesses}+`} 
                  label="Active Businesses" 
                  suffix="HORECA Partners"
                />
                <div className="hidden md:block w-px h-12 bg-gradient-to-b from-transparent via-cyan-400 to-transparent"></div>
                <StatItem 
                  icon={<DollarSign size={20} />} 
                  value={`${animatedStats.revenue}M+`} 
                  label="Rwf  Generated" 
                  suffix="Revenue Created"
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* How KCEM Works */}
        <section className="py-24 max-w-7xl mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-4">How KCEM Works</h2>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto">Four simple steps to transform your waste management and unlock new revenue streams</p>
          </motion.div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <WorkStep 
              icon={<Sparkles />} 
              num="01" 
              title="List Waste" 
              desc="Upload details of UCO, Glass, or Paper waste with photos via our mobile app or web dashboard." 
              delay={0.1}
              color="cyan"
            />
            <WorkStep 
              icon={<Recycle />} 
              num="02" 
              title="Get Offers" 
              desc="Receive competitive bids instantly from verified recyclers based on current market rates." 
              delay={0.2}
              color="cyan"
            />
            <WorkStep 
              icon={<Truck />} 
              num="03" 
              title="Schedule Pickup" 
              desc="AI-poweslate geospatial routing optimizes collection schedules for maximum efficiency." 
              delay={0.3}
              color="cyan"
            />
            <WorkStep 
              icon={<Wallet />} 
              num="04" 
              title="Get Paid" 
              desc="Instant digital payments verified upon collection with transparent transaction history." 
              delay={0.4}
              color="violet"
            />
          </div>
        </section>

        {/* Featuslate Materials */}
        <section className="py-24 bg-gradient-to-b from-slate-50 to-white">
          <div className="max-w-7xl mx-auto px-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-4">Featuslate Materials</h2>
              <p className="text-lg text-slate-500 max-w-2xl mx-auto">High-value recyclables that generate sustainable revenue</p>
            </motion.div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <MaterialCard 
                title="Used Cooking Oil"
                subtitle="Transforms to Biodiesel"
                price="Rwf 800-1,200 per liter"
                image="https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&q=80&w=1470"
                stats={[
                  { label: "Biodiesel Potential", value: "90%" },
                  { label: "Carbon slateuction", value: "85%" }
                ]}
                color="amber"
                delay={0.1}
              />
              
              <MaterialCard 
                title="Glass Bottles"
                subtitle="Infinite Recycling Value"
                price="Rwf 150-300 per kg"
                image="https://images.unsplash.com/photo-1595278069441-2cf29f8005a4?auto=format&fit=crop&q=80&w=1471"
                stats={[
                  { label: "Recyclable", value: "100%" },
                  { label: "Energy Saved", value: "30%" }
                ]}
                color="cyan"
                delay={0.2}
              />
              
              <MaterialCard 
                title="Paper & Cardboard"
                subtitle="Sustainable Packaging"
                price="Rwf 50-150 per kg"
                image="https://images.unsplash.com/photo-1560472354-b33ff0c44a43?auto=format&fit=crop&q=80&w=1450"
                stats={[
                  { label: "Water Saved", value: "60%" },
                  { label: "Trees Saved", value: "17" }
                ]}
                color="cyan"
                delay={0.3}
              />
            </div>
          </div>
        </section>

        {/* Success Stories */}
        <section className="py-24 relative overflow-hidden">
          {/* Background pattern */}
          <div className="absolute inset-0 bg-grid-slate-100/[0.04] bg-[size:40px_40px]"></div>
          
          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-4">Success Stories</h2>
              <p className="text-lg text-slate-500 max-w-2xl mx-auto">Hear from businesses transforming their waste management</p>
            </motion.div>
            
            <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
              {/* Video Testimonial Placeholder */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
                className="relative group"
              >
                <div className="aspect-video bg-gradient-to-br from-cyan-600 to-cyan-600 rounded-3xl overflow-hidden -2xl">
                  <img 
                    src="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=1470" 
                    alt="Hotel interior" 
                    className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                  <button className="absolute inset-0 flex items-center justify-center">
                    <div className="w-20 h-20 bg-white/90 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Play size={32} className="text-cyan-600 ml-1" fill="currentColor" />
                    </div>
                  </button>
                </div>
                <div className="mt-6">
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Case Study: Urban Hotel Group</h3>
                  <p className="text-slate-600">slateuced waste costs by 65% and generated Rwf 2.4M in revenue</p>
                </div>
              </motion.div>
              
              {/* Testimonials */}
              <div className="space-y-6">
                <Testimonial 
                  quote="KCEM transformed our waste from an expense to a revenue stream. We're now earning Rwf 400,000 monthly from waste we used to pay to dispose."
                  author="Marie Uwase"
                  role="Operations Manager, Kigali Grand Hotel"
                  avatar="https://images.unsplash.com/photo-1494790108755-2616b612b786?auto=format&fit=crop&q=80&w=1374"
                />
                
                <Testimonial 
                  quote="The geospatial routing cut our collection costs by 40%. We're collecting from more businesses while using less fuel."
                  author="James Mugisha"
                  role="Owner, cyan Cycle Recyclers"
                  avatar="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=1470"
                />
              </div>
            </div>
            
            {/* Metrics showcase */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
              className="grid md:grid-cols-3 gap-6 bg-gradient-to-r from-cyan-50 to-cyan-50 p-8 rounded-3xl border border-cyan-100"
            >
              <div className="text-center p-6">
                <div className="text-4xl font-bold text-cyan-600 mb-2">65%</div>
                <p className="text-slate-700 font-medium">slateuction in Waste Disposal Costs</p>
                <p className="text-sm text-slate-500 mt-1">Average across pilot businesses</p>
              </div>
              <div className="text-center p-6">
                <div className="text-4xl font-bold text-cyan-600 mb-2">40%</div>
                <p className="text-slate-700 font-medium">Logistics Efficiency Gain</p>
                <p className="text-sm text-slate-500 mt-1">Optimized route planning</p>
              </div>
              <div className="text-center p-6">
                <div className="text-4xl font-bold text-cyan-600 mb-2">Rwf 2.4M</div>
                <p className="text-slate-700 font-medium">Revenue Generated</p>
                <p className="text-sm text-slate-500 mt-1">In first 6 months of operation</p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 bg-gradient-to-br from-cyan-900 via-cyan-900 to-cyan-900 text-white relative overflow-hidden">
          {/* Animated background */}
          <div className="absolute inset-0">
            <div className="absolute top-0 left-0 w-96 h-96 bg-cyan-500/10 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full translate-x-1/2 translate-y-1/2"></div>
          </div>
          
          <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-4xl lg:text-5xl font-bold mb-6"
            >
              Ready to Monetize Your Waste?
            </motion.h2>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="text-lg text-cyan-100 mb-10 max-w-2xl mx-auto"
            >
              Join leading hotels, restaurants, and recyclers in Kigali's circular economy revolution
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
              className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
            >
              <Link 
                to="/register?type=business" 
                className="bg-white text-cyan-900 px-8 py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-100 transition-all hover:scale-105"
              >
                Start Earning from Waste <ChevronRight size={20} />
              </Link>
              <Link 
                to="/services" 
                className="bg-transparent border-2 border-white/30 text-white px-8 py-4 rounded-xl font-bold hover:bg-white/10 transition-all"
              >
                Schedule a Demo
              </Link>
            </motion.div>
            
            {/* Email subscription */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              viewport={{ once: true }}
              className="max-w-md mx-auto"
            >
              <p className="text-cyan-200 mb-4">Stay updated with circular economy insights</p>
              <div className="flex gap-2">
                <input 
                  type="email" 
                  placeholder="Enter your email" 
                  className="flex-1 px-6 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-cyan-200 focus:outline-none focus:border-white/40"
                />
                <button className="bg-cyan-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-cyan-600 transition-all">
                  Subscribe
                </button>
              </div>
              <p className="text-sm text-cyan-200/70 mt-3">No spam. Unsubscribe anytime.</p>
            </motion.div>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
};

const WorkStep = ({ icon, num, title, desc, delay = 0, color = "cyan" }: any) => {
  const colorClasses: any = {
    cyan: "from-cyan-500 to-cyan-600",
    violet: "from-violet-500 to-violet-600"
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      viewport={{ once: true }}
      className="relative p-8 bg-white border border-slate-100 rounded-3xl hover:border-transparent hover:-2xl transition-all group hover:-translate-y-2"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white to-slate-50 rounded-3xl -z-10"></div>
      <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl -z-10" style={{ 
        backgroundImage: `linear-gradient(135deg, ${colorClasses[color]})`
      }}></div>
      
      <span className="absolute top-4 right-6 text-5xl font-black text-slate-50 group-hover:text-white/20 transition-colors font-mono">{num}</span>
      
      <div className={`w-14 h-14 bg-gradient-to-br ${colorClasses[color]} rounded-xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      
      <h3 className="text-xl font-bold mb-3 text-slate-900 group-hover:text-white transition-colors">{title}</h3>
      <p className="text-slate-600 text-sm leading-relaxed group-hover:text-white/90 transition-colors">{desc}</p>
    </motion.div>
  );
};

const StatItem = ({ icon, value, label, suffix }: any) => (
  <div className="text-center">
    <div className="flex items-center justify-center gap-2 mb-2">
      {icon}
      <div className="text-3xl font-bold text-white">{value}</div>
    </div>
    <div className="text-sm font-semibold text-cyan-200">{label}</div>
    <div className="text-xs text-cyan-300/70">{suffix}</div>
  </div>
);

const MaterialCard = ({ title, subtitle, price, image, stats, color, delay }: any) => {
  const colorClasses: any = {
    amber: "bg-amber-500",
    cyan: "bg-cyan-500"
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      viewport={{ once: true }}
      className="bg-white rounded-3xl overflow-hidden -lg hover:-2xl transition-all hover:-translate-y-2 group"
    >
      <div className="relative h-48 overflow-hidden">
        <img 
          src={image} 
          alt={title} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
        <div className={`absolute top-4 right-4 px-4 py-2 ${colorClasses[color]} text-white rounded-full text-sm font-bold`}>
          {price}
        </div>
      </div>
      
      <div className="p-6">
        <h3 className="text-xl font-bold text-slate-900 mb-1">{title}</h3>
        <p className="text-slate-500 mb-4">{subtitle}</p>
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          {stats.map((stat: any, index: number) => (
            <div key={index} className="bg-slate-50 rounded-xl p-3 text-center">
              <div className="text-lg font-bold text-slate-900">{stat.value}</div>
              <div className="text-xs text-slate-500">{stat.label}</div>
            </div>
          ))}
        </div>
        
        <button className="w-full py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-all flex items-center justify-center gap-2 group/btn">
          View Market Details
          <ChevronRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
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
    className="bg-white p-8 rounded-3xl -lg border border-slate-100"
  >
    <Quote size={24} className="text-cyan-200 mb-4" />
    <p className="text-slate-700 text-lg mb-6">{quote}</p>
    <div className="flex items-center gap-4">
      <img 
        src={avatar} 
        alt={author} 
        className="w-12 h-12 rounded-full object-cover"
      />
      <div>
        <div className="font-bold text-slate-900">{author}</div>
        <div className="text-sm text-slate-500">{role}</div>
      </div>
    </div>
  </motion.div>
);

export default HomePage;