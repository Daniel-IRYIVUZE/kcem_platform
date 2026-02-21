import { Play, Quote } from 'lucide-react';
import { motion } from 'framer-motion';

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

const SuccessStoriesSection = () => {
  const testimonials = [
    {
      quote: "EcoTrade transformed our waste from an expense to a revenue stream. We're now earning Rwf 400,000 monthly from waste we used to pay to dispose.",
      author: "Marie Uwase",
      role: "Operations Manager, Kigali Grand Hotel",
      avatar: ""
    },
    {
      quote: "The geospatial routing cut our collection costs by 40%. We're collecting from more businesses while using less fuel.",
      author: "James Mugisha",
      role: "Owner, Green Cycle Recyclers",
      avatar: ""
    }
  ];

  return (
    <section className="py-16 sm:py-24 bg-white">
      <div className="lg:w-11/12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
            <div className="aspect-video bg-gray-200 rounded-xl sm:rounded-2xl overflow-hidden shadow-lg">
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
                className="absolute inset-0 flex items-center justify-center hover:opacity-80 transition-opacity"
              >
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/90 rounded-full flex items-center justify-center hover:scale-110 transition-transform">
                  <Play size={24} className="text-cyan-600 ml-1" fill="currentColor" />
                </div>
              </button>
            </div>
          </motion.div>
          
          <div className="space-y-6">
            {testimonials.map((testimonial, index) => (
              <Testimonial key={index} {...testimonial} />
            ))}
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
  );
};

export default SuccessStoriesSection;
